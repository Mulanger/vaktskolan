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
  console,
  document,
  localStorage,
  location,
  window,
  URL,
});
const source = readFileSync("app.js", "utf8").replace(/\ninit\(\)\.catch\([\s\S]*$/, "\n");
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
assert.equal(evaluate("isModuleUnlocked(0)"), true);
assert.equal(evaluate("isModuleUnlocked(1)"), false, "Module 2 must start locked.");
assert.equal(evaluate("isPageUnlocked(0, 0, 0)"), true);
assert.equal(evaluate("isPageUnlocked(0, 0, 1)"), false, "A later page must start locked.");

evaluate('state.visited.add("vu1:0:0:0")');
assert.equal(evaluate("isPageUnlocked(0, 0, 1)"), true, "Next unlocks after the previous page is completed.");
evaluate('state.visited.add("vu1:0:0:1")');
evaluate('state.answers["vu1:0"] = { "1": "A" }');
assert.equal(evaluate("isModuleComplete(0)"), false, "Answers without submission must not complete a module.");
evaluate('state.quizSubmissions["vu1:0"] = { submittedAt: 1 }');
assert.equal(evaluate("isModuleComplete(0)"), true, "Completed pages and a passed submitted quiz complete the module.");
assert.equal(evaluate("isModuleUnlocked(1)"), true, "A passed module unlocks the next module.");

evaluate('state.visited.add("vu1:1:0:0"); state.visited.add("vu1:1:0:1")');
evaluate('state.answers["vu1:1"] = { "1": "A" }; state.quizSubmissions["vu1:1"] = { submittedAt: 2 }');
assert.equal(evaluate("canStartFinalExam()"), true, "All passed modules unlock the course final exam.");
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

console.log("Validated production platform progression guards.");
