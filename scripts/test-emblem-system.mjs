import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildOverview } = require("../emblemSystem.js");

function overview(vu1 = {}, vu2 = {}) {
  return buildOverview({
    courses: [
      { courseId: "vu1", ...vu1 },
      { courseId: "vu2", ...vu2 },
    ],
  });
}

const empty = overview(
  { completedModules: 0, totalModules: 11 },
  { completedModules: 0, totalModules: 8 }
);
assert.equal(empty.unlockedCount, 0);
assert.equal(empty.totalCount, 5);

const firstQuiz = overview(
  { completedModules: 1, totalModules: 11, passedModuleQuizzes: 1 },
  { completedModules: 0, totalModules: 8 }
);
assert.deepEqual(
  firstQuiz.emblems.filter((emblem) => emblem.unlocked).map((emblem) => emblem.id),
  ["first-quiz-pass"]
);

const vu1Complete = overview(
  { completedModules: 11, totalModules: 11, passedModuleQuizzes: 11 },
  { completedModules: 0, totalModules: 8 }
);
assert.equal(vu1Complete.emblems.find((emblem) => emblem.id === "vu1-complete").unlocked, true);
assert.equal(vu1Complete.emblems.find((emblem) => emblem.id === "vu1-exam").unlocked, false);

const vu1Exam = overview(
  { completedModules: 11, totalModules: 11, passedModuleQuizzes: 11, finalExamPassed: true },
  { completedModules: 0, totalModules: 8 }
);
assert.equal(vu1Exam.emblems.find((emblem) => emblem.id === "vu1-exam").unlocked, true);

const complete = overview(
  { completedModules: 99, totalModules: 11, passedModuleQuizzes: 11, finalExamPassed: true },
  { completedModules: 8, totalModules: 8, passedModuleQuizzes: 8, finalExamPassed: true }
);
assert.equal(complete.unlockedCount, 5);
assert.equal(complete.emblems.find((emblem) => emblem.id === "vu1-complete").percent, 100);
assert.equal(complete.emblems.find((emblem) => emblem.id === "vu1-complete").progressLabel, "11 av 11 moduler klara");

console.log("Validated emblem criteria and progress derivation.");
