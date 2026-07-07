import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_INPUT = "D:/vaktarskolan_scenariobank_300.json";
const COLLECTION_ID = "scenario_quiz";
const QUESTION_CHUNK_SIZE = 100;
const OPTION_CHUNK_SIZE = 500;

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    status: "draft",
    dryRun: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.input = argv[++index];
    else if (arg === "--status") args.status = argv[++index];
    else if (arg === "--dry-run") args.dryRun = true;
  }

  if (!["draft", "published", "archived"].includes(args.status)) {
    throw new Error("--status must be one of draft, published, or archived.");
  }

  return args;
}

function loadEnv(path = ".env") {
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      })
  );
}

function assertScenarioBank(data) {
  if (!Array.isArray(data.scenarios)) {
    throw new Error("Expected JSON to contain a scenarios array.");
  }

  if (data.scenarios.length !== 300) {
    throw new Error(`Expected 300 scenarios, got ${data.scenarios.length}.`);
  }

  const ids = new Set();
  for (const scenario of data.scenarios) {
    if (!Number.isInteger(Number(scenario.id))) {
      throw new Error("Every scenario must have a numeric id.");
    }
    if (ids.has(scenario.id)) {
      throw new Error(`Duplicate scenario id: ${scenario.id}.`);
    }
    ids.add(scenario.id);

    if (!Array.isArray(scenario.options) || scenario.options.length !== 4) {
      throw new Error(`Scenario ${scenario.id} must have exactly four options.`);
    }
    if (!Number.isInteger(scenario.correctIndex) || scenario.correctIndex < 0 || scenario.correctIndex > 3) {
      throw new Error(`Scenario ${scenario.id} has invalid correctIndex.`);
    }
  }
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function uniqueTags(scenario) {
  return [...new Set([...(scenario.tags || []), scenario.category, scenario.level, scenario.source].filter(Boolean))].sort();
}

function toQuestionRow(scenario, bankMeta, status) {
  return {
    collection_id: COLLECTION_ID,
    external_id: `scenario:${scenario.id}`,
    question_kind: "scenario",
    status,
    course_id: "general",
    title: scenario.title,
    prompt: scenario.scenario,
    scenario_context: scenario.categoryLabel,
    explanation: scenario.explanation,
    tags: uniqueTags(scenario),
    source: scenario.source,
    source_reference: `scenario:${scenario.id}`,
    sort_order: Number(scenario.id),
    metadata: {
      original_id: Number(scenario.id),
      category: scenario.category,
      category_label: scenario.categoryLabel,
      level: scenario.level,
      source: scenario.source,
      correct: scenario.correct,
      correct_index: scenario.correctIndex,
      bank_name: bankMeta?.name,
      bank_version: bankMeta?.version,
      generated: bankMeta?.generated,
    },
  };
}

function toOptionRows(scenario, questionId) {
  return scenario.options.map((optionText, index) => ({
    question_id: questionId,
    label: String.fromCharCode(65 + index),
    option_text: optionText,
    is_correct: index === scenario.correctIndex,
    sort_order: index + 1,
  }));
}

class SupabaseRestClient {
  constructor(env) {
    this.baseUrl = `${env.SUPABASE_URL.replace(/\/+$/, "")}/rest/v1`;
    this.key = env.SUPABASE_SECRET_KEY || env.SUPABASE_PUBLISHABLE_KEY;
    if (!this.baseUrl || !this.key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY/SUPABASE_PUBLISHABLE_KEY in .env.");
    }
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
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message = data?.message || `Supabase request failed with ${response.status}.`;
      const error = new Error(message);
      error.status = response.status;
      error.details = data;
      throw error;
    }

    return data;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const inputPath = resolve(args.input);
  const env = loadEnv();
  const data = JSON.parse(readFileSync(inputPath, "utf8"));
  assertScenarioBank(data);

  const questionRows = data.scenarios.map((scenario) => toQuestionRow(scenario, data.meta, args.status));
  const optionCount = data.scenarios.reduce((total, scenario) => total + scenario.options.length, 0);

  if (args.dryRun) {
    console.log(JSON.stringify({ collectionId: COLLECTION_ID, questions: questionRows.length, options: optionCount, status: args.status }, null, 2));
    return;
  }

  const client = new SupabaseRestClient(env);
  await client.request(`quiz_collections?id=eq.${COLLECTION_ID}&select=id`, { method: "GET" });

  const upsertedQuestions = [];
  for (const rows of chunk(questionRows, QUESTION_CHUNK_SIZE)) {
    const result = await client.request("quiz_questions?on_conflict=collection_id,external_id&select=id,external_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: rows,
    });
    upsertedQuestions.push(...result);
  }

  const questionIdByExternalId = new Map(upsertedQuestions.map((question) => [question.external_id, question.id]));
  const optionRows = data.scenarios.flatMap((scenario) => {
    const questionId = questionIdByExternalId.get(`scenario:${scenario.id}`);
    if (!questionId) throw new Error(`Missing upserted question id for scenario ${scenario.id}.`);
    return toOptionRows(scenario, questionId);
  });

  for (const rows of chunk(optionRows, OPTION_CHUNK_SIZE)) {
    await client.request("quiz_answer_options?on_conflict=question_id,label", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: rows,
    });
  }

  console.log(JSON.stringify({ collectionId: COLLECTION_ID, questions: upsertedQuestions.length, options: optionRows.length, status: args.status }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exitCode = 1;
});
