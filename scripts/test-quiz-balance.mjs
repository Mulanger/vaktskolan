// Regression guard for quiz answer-length balance.
//
// Fails (exit 1) if any published quiz bank drifts back toward "length leakage",
// where the correct answer is guessable because it is systematically the longest
// option. Reads the two portal banks and the scenario seed's embedded JSON payload.
//
// A bank fails if any of the following holds:
//   * a question does not have exactly 4 options or exactly 1 correct answer,
//   * a question's correct/longest-wrong character-length ratio exceeds 1.35, or
//   * more than 40% of the bank's questions have the correct answer strictly longest.

import { readFileSync } from "node:fs";

const MAX_RATIO = 1.35;
const MAX_LONGEST_SHARE = 0.4;
const SCENARIO_SEED = "supabase/seeds/20260705143000_seed_scenario_quiz_300.sql";
const SCENARIO_JSON_TAG = "$vakt_scenario_json$";

function loadPortalBank(file) {
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  return parsed.questions;
}

function loadScenarioBank(file) {
  const sql = readFileSync(file, "utf8");
  const start = sql.indexOf(SCENARIO_JSON_TAG);
  const end = sql.indexOf(SCENARIO_JSON_TAG, start + SCENARIO_JSON_TAG.length);
  if (start === -1 || end === -1) {
    throw new Error(`Could not find ${SCENARIO_JSON_TAG} payload markers in ${file}.`);
  }
  const payload = sql.slice(start + SCENARIO_JSON_TAG.length, end).trim();
  return JSON.parse(payload).scenarios;
}

function checkBank(name, questions, expectedCount, failures) {
  let longestCount = 0;
  if (!Array.isArray(questions) || questions.length !== expectedCount) {
    failures.push(`${name}: expected exactly ${expectedCount} questions, got ${Array.isArray(questions) ? questions.length : "none"}.`);
    return { count: Array.isArray(questions) ? questions.length : 0, longestShare: 0 };
  }

  const ids = new Set();
  questions.forEach((question, index) => {
    const label = `${name} #${question.id ?? index + 1}`;
    const options = question.options;

    if (question.id == null || ids.has(question.id)) {
      failures.push(`${label}: missing or duplicate question id.`);
      return;
    }
    ids.add(question.id);

    if (!Array.isArray(options) || options.length !== 4 || options.some((option) => typeof option !== "string" || !option.trim())) {
      failures.push(`${label}: expected 4 non-empty text options, got ${Array.isArray(options) ? options.length : "none"}.`);
      return;
    }

    const correctIndex = question.correctIndex;
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      failures.push(`${label}: invalid correctIndex (${correctIndex}).`);
      return;
    }
    if (question.correct !== String.fromCharCode(65 + correctIndex)) {
      failures.push(`${label}: correct letter '${question.correct}' does not match correctIndex ${correctIndex}.`);
      return;
    }

    const correctLength = options[correctIndex].length;
    const wrongLengths = options.filter((_, optionIndex) => optionIndex !== correctIndex).map((option) => option.length);
    const longestWrong = Math.max(...wrongLengths);

    const ratio = longestWrong === 0 ? Infinity : correctLength / longestWrong;
    if (ratio > MAX_RATIO) {
      failures.push(`${label}: length ratio ${ratio.toFixed(2)} exceeds ${MAX_RATIO} (correct=${correctLength}, longest wrong=${longestWrong}).`);
    }

    if (correctLength > longestWrong) {
      longestCount += 1;
    }
  });

  const share = questions.length === 0 ? 0 : longestCount / questions.length;
  if (share > MAX_LONGEST_SHARE) {
    failures.push(`${name}: correct answer is strictly longest in ${(share * 100).toFixed(1)}% of questions, exceeding ${(MAX_LONGEST_SHARE * 100).toFixed(0)}%.`);
  }
  return { count: questions.length, longestShare: share };
}

const banks = [
  { name: "vu1_quiz", expectedCount: 154, questions: loadPortalBank("vu1quiz.json") },
  { name: "vu2_quiz", expectedCount: 74, questions: loadPortalBank("vu2quiz.json") },
  { name: "scenario_quiz", expectedCount: 300, questions: loadScenarioBank(SCENARIO_SEED) },
];

const failures = [];
const summary = banks.map((bank) => ({
  name: bank.name,
  ...checkBank(bank.name, bank.questions, bank.expectedCount, failures),
}));

if (failures.length > 0) {
  console.error("Quiz balance guard FAILED:");
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

summary.forEach((bank) => {
  console.log(`${bank.name}: ${bank.count} questions, correct strictly longest in ${(bank.longestShare * 100).toFixed(1)}% (limit ${(MAX_LONGEST_SHARE * 100).toFixed(0)}%).`);
});
console.log(`Validated quiz answer-length balance (max ratio ${MAX_RATIO}).`);
