import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const storage = new Map();
const classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
let dummyElement;
dummyElement = new Proxy(
  {
    classList,
    style: { setProperty() {} },
    addEventListener() {},
    appendChild() {},
    focus() {},
    mountUserButton() {},
    querySelector() { return dummyElement; },
    querySelectorAll() { return []; },
    replaceChildren() {},
    scrollTo() {},
    setAttribute() {},
  },
  {
    get(target, property) {
      if (property in target) return target[property];
      return "";
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    },
  },
);

const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  removeItem(key) { storage.delete(key); },
  setItem(key, value) { storage.set(key, String(value)); },
};
const location = {
  hash: "",
  hostname: "vaktskolan.se",
  pathname: "/plattform",
  search: "",
  replace() {},
};
const document = {
  body: dummyElement,
  addEventListener() {},
  querySelector() { return dummyElement; },
  querySelectorAll() { return []; },
};
const window = {
  document,
  history: { state: null, pushState() {}, replaceState() {} },
  localStorage,
  location,
  clearInterval() {},
  clearTimeout() {},
  setInterval() { return 1; },
  setTimeout() { return 1; },
};

const context = vm.createContext({
  assert,
  console,
  document,
  localStorage,
  location,
  window,
  URL,
});
const source = readFileSync("app.js", "utf8").replace(/\ninit\(\)\.catch\([\s\S]*$/, "\n");
const indexSource = readFileSync("index.html", "utf8");
const courseMarkdown = readFileSync("utbildning.md", "utf8");
const finalExamSelectionDoc = readFileSync("docs/slutprov-topplista-vu1-vu2.md", "utf8");
vm.runInContext(source, context, { filename: "app.js" });

vm.runInContext(
  `
    const testQuestion = { number: 1, correct: "A", options: [{ letter: "A", text: "Rätt" }] };
    const makeModule = (number) => ({
      title: "Modul " + number,
      rawTitle: "Modul " + number,
      lessons: [{ title: number + ".1 Test", pages: [{ title: "Sida 1" }, { title: "Sida 2" }] }],
      quiz: [{ ...testQuestion }],
      meta: "",
    });
    const finalModule = { title: "Sluttest frågebank", rawTitle: "Sluttest", lessons: [], quiz: [], meta: "" };
    const finalQuestion = {
      id: "final-1",
      correct: "A",
      question: "Test",
      explanation: "Test",
      source: "Modul 1",
      options: [{ letter: "A", text: "Rätt" }],
    };
    state.courses = { vu1: [makeModule(1), makeModule(2), finalModule], vu2: [makeModule(1), finalModule] };
    state.finalExamPools = { vu1: [finalQuestion], vu2: [finalQuestion] };
    activateCourse("vu1");
  `,
  context,
);

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

assert.equal(evaluate("UNLOCK_MODULE_NAVIGATION"), false, "Production host must enforce module navigation.");
assert.equal(evaluate("ENFORCE_COURSE_LOCKS"), true, "Production host must enforce course locks.");
assert.equal(evaluate("FINAL_EXAM_DURATION_MS"), 30 * 60 * 1000, "Every final exam must allow 30 minutes.");
assert.equal(evaluate("getFinalExamRequiredCorrect(50)"), 40, "VU1 must require 40 of 50 correct answers.");
assert.equal(evaluate("getFinalExamRequiredCorrect(40)"), 32, "VU2 must require 32 of 40 correct answers.");
const documentedFinalExamIds = [...finalExamSelectionDoc.matchAll(/Internt fråge-id: `(vu[12]-[^`]+)`/g)]
  .map((match) => match[1]);
assert.equal(documentedFinalExamIds.length, 90, "The selection document must contain all 90 final exam questions.");
assert.equal(new Set(documentedFinalExamIds).size, 90, "Every documented final exam question ID must be unique.");
assert.equal(
  JSON.stringify(documentedFinalExamIds.filter((id) => id.startsWith("vu1-"))),
  evaluate("JSON.stringify(FINAL_EXAM_QUESTION_IDS.vu1)"),
  "The documented VU1 list and the active VU1 selection must remain identical.",
);
assert.equal(
  JSON.stringify(documentedFinalExamIds.filter((id) => id.startsWith("vu2-"))),
  evaluate("JSON.stringify(FINAL_EXAM_QUESTION_IDS.vu2)"),
  "The documented VU2 list and the active VU2 selection must remain identical.",
);
assert.equal(
  evaluate(`sanitizeFinalExamSession({
    id: "old-active",
    createdAt: 1000,
    endsAt: 1000 + (15 * 60 * 1000),
    completedAt: null,
    questionIds: ["old-question"],
    answers: {}
  }).endsAt`),
  1000 + (30 * 60 * 1000),
  "A stored active 15-minute attempt must be extended to 30 minutes from its original start.",
);
assert.doesNotMatch(source, /renderFinalExamSidebar|final-sidebar-card/, "The final exam must not create a designer-specific sidebar.");
assert.match(
  source,
  /function showFinalExamPortal\(\)[\s\S]{0,2000}hideModuleList\(\);/,
  "The final exam portal must keep the platform sidebar and hide its contextual module list.",
);
assert.match(
  source,
  /function renderQuizOverview\(\)[\s\S]{0,1600}renderNavigationLocks\(\);/,
  "Every Quiz Portal rerender must restore the mobile VU2 lock state.",
);
assert.match(
  source,
  /function syncModalOpenState\(\)[\s\S]{0,900}pauseQuizPortalQuestionTimerForModal\(\);[\s\S]{0,250}resumeQuizPortalQuestionTimerAfterModal\(\);/,
  "Opening and closing a modal must pause and resume a timed Quiz Portal question.",
);
const mobileVu2Tabs = [...`${indexSource}\n${source}`.matchAll(
  /<button class="(?:home-mobile-tab|vu1-hub-mobile-tab|quiz-portal-mobile-tab|final-portal-mobile-tab)[\s\S]{0,350}?<span>VU2<\/span>\s*<\/button>/g,
)].map((match) => match[0]);
assert.equal(mobileVu2Tabs.length, 4, "Every mobile platform view must render one VU2 tab.");
mobileVu2Tabs.forEach((tab) => {
  assert.match(tab, /data-mobile-course="vu2"/, "Every mobile VU2 tab must share the lock-state hook.");
  assert.match(tab, /data-lucide="shield-check"/, "Every mobile VU2 tab must use the same shield-check emblem.");
});
assert.equal(evaluate("isModuleUnlocked(0)"), true);
assert.equal(evaluate("isModuleUnlocked(1)"), false, "Module 2 must start locked.");
assert.equal(evaluate("isModuleMembershipLocked(1)"), true, "Basic must membership-lock VU1 module 2.");
assert.equal(evaluate("isPageUnlocked(0, 0, 0)"), true);
assert.equal(evaluate("isPageUnlocked(0, 0, 1)"), false, "A later page must start locked.");
assert.equal(evaluate("isFinalExamNavigationUnlocked()"), false, "The final exam navigation must start locked.");

evaluate('state.visited.add("vu1:0:0:0")');
assert.equal(evaluate("isPageUnlocked(0, 0, 1)"), true, "Next unlocks after the previous page is completed.");
evaluate('state.visited.add("vu1:0:0:1")');
evaluate('state.answers["vu1:0"] = { "1": "A" }');
assert.equal(evaluate("isModuleComplete(0)"), false, "Answers without submission must not complete a module.");
evaluate('state.quizSubmissions["vu1:0"] = 1');
assert.equal(evaluate("isModuleComplete(0)"), true, "Completed pages and a passed submitted quiz complete the module.");
assert.equal(evaluate("isModuleUnlocked(1)"), false, "Basic must remain limited to VU1 module 1 after completing it.");
evaluate('state.membership.tier = "premium"');
assert.equal(evaluate("isModuleMembershipLocked(1)"), false, "Premium must remove the membership lock.");
assert.equal(evaluate("isModuleUnlocked(1)"), true, "A passed module unlocks the next module.");

evaluate('state.visited.add("vu1:1:0:0"); state.visited.add("vu1:1:0:1")');
evaluate('state.answers["vu1:1"] = { "1": "A" }; state.quizSubmissions["vu1:1"] = 2');
assert.equal(evaluate("canStartFinalExam()"), true, "All passed modules unlock the course final exam.");
assert.equal(evaluate("isFinalExamNavigationUnlocked()"), true, "The sidebar final exam lock must follow course completion.");
assert.equal(evaluate('isCourseUnlocked("vu2")'), false, "VU2 must remain locked before the VU1 final exam is passed.");

evaluate(`
  state.finalExams.vu1 = {
    id: "test-final",
    completedAt: 3,
    currentIndex: 0,
    questionIds: ["final-1"],
    answers: { "final-1": "A" }
  };
  state.finalExam = state.finalExams.vu1;
`);
assert.equal(evaluate('isCourseUnlocked("vu2")'), true, "A passed VU1 final exam unlocks VU2.");
assert.equal(evaluate("getCourseProgress().finalExamPassed"), true, "The final exam must be part of course progress.");
assert.equal(evaluate("getCourseProgress().percent"), 100, "The complete course including final exam must reach 100%.");

evaluate(`
  state.mode = "quiz-overview";
  state.quizPortal.view = "vu1";
  state.quizPortal.quizzes = {
    vu1: {
      title: "VU1 Quiz",
      questions: [{ id: "timer-1", question: "Test", options: ["A", "B"], answer: 0 }]
    }
  };
  state.quizPortal.sessionQuestions = state.quizPortal.quizzes.vu1.questions;
  state.quizPortal.currentIndex = 0;
  state.quizPortal.isAnswered = false;
  state.quizPortal.showResults = false;
  state.quizPortal.questionDeadline = Date.now() + 10000;
  quizPortalQuestionTimer = 1;
`);
assert.equal(evaluate("pauseQuizPortalQuestionTimerForModal()"), true, "A modal must pause an active question timer.");
assert.equal(evaluate("quizPortalQuestionTimer"), null, "The paused timer interval must be cleared.");
assert.equal(evaluate("state.quizPortal.questionDeadline"), 0, "A paused timer must not keep counting against a deadline.");
assert.ok(evaluate("state.quizPortal.questionTimerPausedRemainingMs") > 0, "The remaining question time must be retained.");
assert.equal(evaluate("resumeQuizPortalQuestionTimerAfterModal()"), true, "Closing the modal must resume the question timer.");
assert.ok(evaluate("state.quizPortal.questionDeadline") > Date.now(), "The resumed timer must receive a new future deadline.");
evaluate("stopQuizPortalQuestionTimer()");

const fullCourseResult = vm.runInContext(
  `
    state.courses = parseCourses(${JSON.stringify(courseMarkdown)});
    state.finalExamArchives = Object.fromEntries(
      Object.entries(state.courses).map(([courseId, modules]) => [courseId, buildFinalExamPool(modules)])
    );
    state.finalExamPools = Object.fromEntries(
      Object.entries(state.finalExamArchives).map(([courseId, sourcePool]) => [
        courseId,
        selectFinalExamQuestions(courseId, sourcePool)
      ])
    );
    state.visited = new Set();
    state.answers = {};
    state.quizSubmissions = {};
    state.finalExams = {};
    state.finalExam = null;
    state.membership.tier = "premium";
    activateCourse("vu1");

    function auditCompleteContentModule(moduleIndex, submittedAt) {
      const module = state.modules[moduleIndex];
      allPages(module).forEach((page) => {
        state.visited.add(pageId(moduleIndex, page.lessonIndex, page.pageIndex));
      });
      state.answers[answerKey(moduleIndex)] = Object.fromEntries(
        module.quiz.map((question) => [String(question.number), question.correct])
      );
      state.quizSubmissions[answerKey(moduleIndex)] = submittedAt;
      assert.equal(isModuleComplete(moduleIndex), true);
    }

    function auditInstallFinalExam(courseId, passed, completedAt) {
      activateCourse(courseId);
      const examSize = getFinalExamSize(courseId);
      const questions = state.finalExamPool;
      assert.equal(questions.length, examSize);
      state.finalExam = {
        id: courseId + "-guard-" + completedAt,
        createdAt: completedAt - 1000,
        completedAt,
        currentIndex: questions.length - 1,
        endsAt: null,
        reviewMode: false,
        questionIds: questions.map((question) => question.id),
        answers: Object.fromEntries(
          questions.map((question) => [
            question.id,
            passed
              ? question.correct
              : question.options.find((option) => option.letter !== question.correct)?.letter || ""
          ])
        )
      };
      state.finalExams[courseId] = state.finalExam;
      return getFinalExamResult();
    }

    const vu1Items = getContentModuleItems();
    assert.equal(vu1Items.length, 11, "The real VU1 course must contain 11 content modules.");
    assert.equal(state.finalExamArchive.length, 154, "The complete VU1 source bank must remain intact.");
    assert.equal(state.finalExamPool.length, 50, "The active VU1 final exam must contain exactly 50 selected questions.");
    assert.equal(
      state.finalExamPool.every(
        (question) => question.options.length === 4 && question.options.some((option) => option.letter === question.correct)
      ),
      true,
      "Every selected VU1 question must have four options and a resolvable correct answer."
    );
    assert.equal(
      JSON.stringify(state.finalExamPool.map((question) => question.id)),
      JSON.stringify(FINAL_EXAM_QUESTION_IDS.vu1),
      "VU1 must use only the documented selected question IDs."
    );
    assert.equal(
      new Set(pickFinalExamQuestions().map((question) => question.id)).size,
      50,
      "A new VU1 attempt must include all 50 selected questions."
    );
    assert.equal(
      state.finalExamPool.some((question) => ["vu1-module-1-quiz-2", "vu1-module-1-quiz-8"].includes(question.id)),
      false,
      "The two rejected VU1 questions must not be shown in new final exams."
    );
    const legacyVu1Question = state.finalExamArchive.find(
      (question) => !FINAL_EXAM_QUESTION_IDS.vu1.includes(question.id)
    );
    state.finalExam = {
      id: "legacy-completed-vu1",
      createdAt: 1,
      completedAt: 2,
      currentIndex: 0,
      endsAt: null,
      reviewMode: false,
      questionIds: [legacyVu1Question.id],
      answers: { [legacyVu1Question.id]: legacyVu1Question.correct }
    };
    state.finalExams.vu1 = state.finalExam;
    ensureFinalExamIntegrity();
    assert.equal(state.finalExam?.id, "legacy-completed-vu1", "A completed legacy attempt must be preserved.");
    assert.equal(getFinalExamResult().passed, true, "A completed legacy attempt must still be scoreable.");
    state.finalExam = {
      id: "legacy-active-vu1",
      createdAt: 1,
      completedAt: null,
      currentIndex: 0,
      endsAt: Date.now() + FINAL_EXAM_DURATION_MS,
      reviewMode: false,
      questionIds: [legacyVu1Question.id],
      answers: {}
    };
    state.finalExams.vu1 = state.finalExam;
    ensureFinalExamIntegrity();
    assert.equal(state.finalExam, null, "An active legacy attempt outside the new selection must be reset.");
    state.finalExam = {
      id: "legacy-short-vu1",
      createdAt: 1,
      completedAt: null,
      currentIndex: 0,
      endsAt: Date.now() + FINAL_EXAM_DURATION_MS,
      reviewMode: false,
      questionIds: state.finalExamPool.slice(0, 30).map((question) => question.id),
      answers: {}
    };
    state.finalExams.vu1 = state.finalExam;
    ensureFinalExamIntegrity();
    assert.equal(state.finalExam, null, "An active 30-question attempt must be reset even if every question is selected.");
    state.finalExams = {};
    vu1Items.forEach(({ index }, offset) => {
      if (offset > 0) assert.equal(isModuleUnlocked(index), true);
      auditCompleteContentModule(index, 1000 + offset);
    });
    assert.equal(canStartFinalExam(), true, "Completing all real VU1 modules must unlock its final exam.");
    assert.equal(isCourseUnlocked("vu2"), false, "VU2 must still wait for a passed VU1 final exam.");

    const failedVu1 = auditInstallFinalExam("vu1", false, Date.now());
    assert.equal(failedVu1.passed, false);
    assert.equal(isCourseUnlocked("vu2"), false, "A failed real VU1 final exam must keep VU2 locked.");
    assert.equal(getFinalExamLockInfo().locked, true, "A failed real VU1 final exam must start the 24-hour lock.");

    const passedVu1 = auditInstallFinalExam("vu1", true, Date.now() + 1);
    assert.equal(passedVu1.passed, true);
    assert.equal(isCourseUnlocked("vu2"), true, "A passed real VU1 final exam must unlock VU2.");

    activateCourse("vu2");
    const vu2Items = getContentModuleItems();
    assert.equal(vu2Items.length, 6, "The real VU2 course must contain 6 content modules.");
    assert.equal(state.finalExamArchive.length, 74, "The complete VU2 source bank must remain intact.");
    assert.equal(state.finalExamPool.length, 40, "The active VU2 final exam must contain exactly 40 selected questions.");
    assert.equal(
      state.finalExamPool.every(
        (question) => question.options.length === 4 && question.options.some((option) => option.letter === question.correct)
      ),
      true,
      "Every selected VU2 question must have four options and a resolvable correct answer."
    );
    assert.equal(
      JSON.stringify(state.finalExamPool.map((question) => question.id)),
      JSON.stringify(FINAL_EXAM_QUESTION_IDS.vu2),
      "VU2 must use only the documented selected question IDs."
    );
    assert.equal(
      new Set(pickFinalExamQuestions().map((question) => question.id)).size,
      40,
      "A new VU2 attempt must include all 40 selected questions."
    );
    vu2Items.slice(0, -1).forEach(({ index }, offset) => auditCompleteContentModule(index, 2000 + offset));
    assert.equal(canStartFinalExam(), false, "VU2 final exam must stay locked while one real module remains.");
    const lastVu2 = vu2Items.at(-1);
    assert.equal(isModuleUnlocked(lastVu2.index), true);
    auditCompleteContentModule(lastVu2.index, 3000);
    assert.equal(canStartFinalExam(), true, "Completing all real VU2 modules must unlock the VU2 final exam.");
    assert.equal(getFinalExamPortalOverview("vu2").disabled, false, "The VU2 final portal card must become actionable.");

    const passedVu2 = auditInstallFinalExam("vu2", true, Date.now() + 2);
    assert.equal(passedVu2.passed, true);
    assert.equal(getCourseProgress().percent, 100, "The complete real VU2 course must reach 100 percent.");

    ({ vu1Modules: vu1Items.length, vu2Modules: vu2Items.length });
  `,
  context,
);

assert.deepEqual(
  { vu1Modules: fullCourseResult.vu1Modules, vu2Modules: fullCourseResult.vu2Modules },
  { vu1Modules: 11, vu2Modules: 6 },
);

console.log("Validated production platform progression guards.");
