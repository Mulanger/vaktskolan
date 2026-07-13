import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const QUESTION_CHUNK_SIZE = 100;
const OPTION_CHUNK_SIZE = 500;
const VALID_STATUSES = new Set(["draft", "published", "archived"]);

function parseArgs(argv) {
  const args = {
    vu1: "vu1quiz.json",
    vu2: "vu2quiz.json",
    flashcards: "vaktarskolan_flashcards_200.json",
    status: "published",
    publishScenarios: true,
    dryRun: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--vu1") args.vu1 = argv[++index];
    else if (arg === "--vu2") args.vu2 = argv[++index];
    else if (arg === "--flashcards") args.flashcards = argv[++index];
    else if (arg === "--status") args.status = argv[++index];
    else if (arg === "--skip-scenarios") args.publishScenarios = false;
    else if (arg === "--dry-run") args.dryRun = true;
  }

  if (!VALID_STATUSES.has(args.status)) {
    throw new Error("--status must be one of draft, published, or archived.");
  }
  return args;
}

function parseEnvFile(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [key, value];
      })
  );
}

function loadEnv() {
  return {
    ...parseEnvFile(resolve(".env")),
    ...parseEnvFile(resolve(".env.local")),
    ...process.env,
  };
}

function readJson(file) {
  return JSON.parse(readFileSync(resolve(file), "utf8"));
}

function normalized(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("sv-SE");
}

function assertQuizBank(data, courseId, expectedCount) {
  if (!Array.isArray(data.questions) || data.questions.length !== expectedCount) {
    throw new Error(`${courseId} must contain exactly ${expectedCount} questions.`);
  }

  const ids = new Set();
  const prompts = new Set();
  const letters = ["A", "B", "C", "D"];
  for (const question of data.questions) {
    if (!Number.isInteger(question.id) || ids.has(question.id)) throw new Error(`${courseId} has an invalid or duplicate id.`);
    ids.add(question.id);
    const promptKey = normalized(question.question);
    if (!promptKey || prompts.has(promptKey)) throw new Error(`${courseId}:${question.id} has an empty or duplicate prompt.`);
    prompts.add(promptKey);
    if (!Array.isArray(question.options) || question.options.length !== 4 || question.options.some((option) => !normalized(option))) {
      throw new Error(`${courseId}:${question.id} must have four non-empty options.`);
    }
    if (!letters.includes(question.correct) || question.correctIndex !== letters.indexOf(question.correct)) {
      throw new Error(`${courseId}:${question.id} has inconsistent correct/correctIndex values.`);
    }
    if (!normalized(question.explanation)) throw new Error(`${courseId}:${question.id} is missing an explanation.`);
    if (!Number.isInteger(question.module) || question.module < 1) throw new Error(`${courseId}:${question.id} has an invalid module.`);
  }
}

function assertFlashcardBank(data) {
  if (!Array.isArray(data.flashcards) || data.flashcards.length !== 200) {
    throw new Error("Flashcard bank must contain exactly 200 cards.");
  }

  const ids = new Set();
  const fronts = new Set();
  const categories = new Map((data.categories || []).map((category) => [category.id, category]));
  for (const card of data.flashcards) {
    if (!Number.isInteger(card.id) || ids.has(card.id)) throw new Error("Flashcard bank has an invalid or duplicate id.");
    ids.add(card.id);
    const frontKey = normalized(card.front);
    if (!frontKey || fronts.has(frontKey)) throw new Error(`flashcard:${card.id} has an empty or duplicate front.`);
    fronts.add(frontKey);
    if (!normalized(card.back) || !normalized(card.category) || !categories.has(card.category)) {
      throw new Error(`flashcard:${card.id} has incomplete content or an unknown category.`);
    }
  }

  for (const category of categories.values()) {
    const actual = data.flashcards.filter((card) => card.category === category.id).length;
    if (actual !== category.count) throw new Error(`Flashcard category ${category.id} declares ${category.count}, found ${actual}.`);
  }
}

function chunk(items, size) {
  const output = [];
  for (let index = 0; index < items.length; index += size) output.push(items.slice(index, index + size));
  return output;
}

function uniqueTags(values) {
  return [...new Set(values.flat().filter(Boolean).map((value) => String(value).trim()).filter(Boolean))].sort();
}

function quizQuestionRow(question, bank, courseId, collectionId, status) {
  return {
    collection_id: collectionId,
    external_id: `${courseId}:${question.id}`,
    question_kind: "multiple_choice",
    status,
    course_id: courseId,
    module_number: question.module,
    title: question.moduleLabel,
    prompt: question.question,
    explanation: question.explanation,
    tags: uniqueTags([courseId, question.source, `modul-${question.module}`]),
    source: bank.meta?.source || "utbildning.md",
    source_reference: `${courseId}:${question.source}:${question.module}:${question.numberInSection}`,
    sort_order: question.id,
    metadata: {
      original_id: question.id,
      module_label: question.moduleLabel,
      source_section: question.source,
      number_in_section: question.numberInSection,
      correct: question.correct,
      correct_index: question.correctIndex,
      bank_name: bank.meta?.name,
      bank_version: bank.meta?.version,
      language: bank.meta?.language,
      generated: bank.meta?.generated,
    },
  };
}

function quizOptionRows(question, questionId) {
  return question.options.map((optionText, index) => ({
    question_id: questionId,
    label: String.fromCharCode(65 + index),
    option_text: optionText,
    is_correct: index === question.correctIndex,
    sort_order: index + 1,
  }));
}

function flashcardQuestionRow(card, bank, status) {
  return {
    collection_id: "flashcards",
    external_id: `flashcard:${card.id}`,
    question_kind: "flashcard",
    status,
    course_id: "general",
    title: card.term,
    prompt: card.front,
    answer_text: card.back,
    explanation: null,
    tags: uniqueTags([card.tags || [], card.category, card.level]),
    source: "vaktarskolan_flashcards_200.json",
    source_reference: `flashcard:${card.id}`,
    sort_order: card.id,
    metadata: {
      original_id: card.id,
      category: card.category,
      category_label: card.categoryLabel,
      level: card.level,
      term: card.term,
      law_reference: card.lawRef || null,
      bank_name: bank.meta?.name,
      bank_version: bank.meta?.version,
      language: bank.meta?.language,
      generated: bank.meta?.generated,
    },
  };
}

class SupabaseRestClient {
  constructor(env) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for imports.");
    }
    this.baseUrl = `${env.SUPABASE_URL.replace(/\/+$/, "")}/rest/v1`;
    this.key = env.SUPABASE_SECRET_KEY;
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const error = new Error(data?.message || `Supabase request failed with ${response.status}.`);
      error.details = data;
      throw error;
    }
    return data;
  }
}

async function upsertQuestions(client, rows) {
  const upserted = [];
  for (const batch of chunk(rows, QUESTION_CHUNK_SIZE)) {
    const result = await client.request("quiz_questions?on_conflict=collection_id,external_id&select=id,external_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: batch,
    });
    upserted.push(...result);
  }
  return upserted;
}

async function upsertOptions(client, rows) {
  for (const batch of chunk(rows, OPTION_CHUNK_SIZE)) {
    await client.request("quiz_answer_options?on_conflict=question_id,label", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: batch,
    });
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const vu1 = readJson(args.vu1);
  const vu2 = readJson(args.vu2);
  const flashcards = readJson(args.flashcards);
  assertQuizBank(vu1, "vu1", 154);
  assertQuizBank(vu2, "vu2", 74);
  assertFlashcardBank(flashcards);

  const quizBanks = [
    { data: vu1, courseId: "vu1", collectionId: "vu1_quiz" },
    { data: vu2, courseId: "vu2", collectionId: "vu2_quiz" },
  ];
  const questionRows = quizBanks.flatMap(({ data, courseId, collectionId }) =>
    data.questions.map((question) => quizQuestionRow(question, data, courseId, collectionId, args.status))
  );
  const flashcardRows = flashcards.flashcards.map((card) => flashcardQuestionRow(card, flashcards, args.status));

  if (args.dryRun) {
    console.log(JSON.stringify({ vu1: 154, vu1Options: 616, vu2: 74, vu2Options: 296, flashcards: 200, scenariosPublished: args.publishScenarios, status: args.status }, null, 2));
    return;
  }

  const client = new SupabaseRestClient(loadEnv());
  const upsertedQuizQuestions = await upsertQuestions(client, questionRows);
  const idByExternalId = new Map(upsertedQuizQuestions.map((question) => [question.external_id, question.id]));
  const optionRows = quizBanks.flatMap(({ data, courseId }) =>
    data.questions.flatMap((question) => {
      const questionId = idByExternalId.get(`${courseId}:${question.id}`);
      if (!questionId) throw new Error(`Missing question id for ${courseId}:${question.id}.`);
      return quizOptionRows(question, questionId);
    })
  );
  await upsertOptions(client, optionRows);
  const upsertedFlashcards = await upsertQuestions(client, flashcardRows);

  if (args.publishScenarios) {
    await client.request("quiz_questions?collection_id=eq.scenario_quiz", {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: { status: "published" },
    });
  }

  const vu1QuestionIds = new Set(
    upsertedQuizQuestions.filter((question) => question.external_id.startsWith("vu1:")).map((question) => question.id)
  );
  const vu2QuestionIds = new Set(
    upsertedQuizQuestions.filter((question) => question.external_id.startsWith("vu2:")).map((question) => question.id)
  );

  console.log(JSON.stringify({
    vu1: vu1QuestionIds.size,
    vu1Options: optionRows.filter((option) => vu1QuestionIds.has(option.question_id)).length,
    vu2: vu2QuestionIds.size,
    vu2Options: optionRows.filter((option) => vu2QuestionIds.has(option.question_id)).length,
    flashcards: upsertedFlashcards.length,
    scenariosPublished: args.publishScenarios,
    status: args.status,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exitCode = 1;
});
