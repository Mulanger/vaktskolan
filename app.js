const STORAGE_KEYS = {
  version: "vakt-storage-version",
  legacyVisited: "vakt-visited-pages",
  completedPages: "vakt-completed-pages-v2",
  answers: "vakt-quiz-answers",
  quizSubmissions: "vakt-quiz-submissions",
  scenarioProgress: "vakt-scenario-progress",
  finalExam: "vakt-final-exam",
  location: "vakt-current-location",
  progressOwner: "vakt-progress-owner",
  knownEmblems: "vakt-known-emblems",
  quizHistory: "vakt-quiz-history-v1",
  cvBuilder: "vakt-cv-builder-v1",
};

const STORAGE_VERSION = "vu2-course-split-2026-07-04";
const IS_LOCAL_DEVELOPMENT = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const UNLOCK_MODULE_NAVIGATION = IS_LOCAL_DEVELOPMENT;
const ENFORCE_COURSE_LOCKS = !IS_LOCAL_DEVELOPMENT;
const FINAL_EXAM_SIZE = 30;
const FINAL_EXAM_DURATION_MS = 15 * 60 * 1000;
const FINAL_EXAM_LOCK_MS = 24 * 60 * 60 * 1000;
const FINAL_EXAM_PASS_PERCENT = 80;
const MODULE_QUIZ_PASS_PERCENT = 80;
const PROGRESS_SCHEMA_VERSION = 1;
const PROGRESS_TABLE = "student_learning_progress";
const QUIZ_HISTORY_SCHEMA_VERSION = 1;
const QUIZ_ATTEMPTS_TABLE = "student_quiz_attempts";
const QUIZ_ANSWERS_TABLE = "student_quiz_answers";
const QUIZ_REVIEW_ITEMS_TABLE = "student_quiz_review_items";
const QUIZ_HISTORY_MAX_ATTEMPTS = 200;
const QUIZ_HISTORY_MAX_ANSWERS = 500;
const QUIZ_ACCURACY_WINDOW = 100;
const QUIZ_REVIEW_INTERVAL_MS = 24 * 60 * 60 * 1000;
const QUIZ_REVIEW_SESSION_SIZE = 15;
const PORTAL_HISTORY_STATE_KEY = "vaktskolanPortalLocation";
const RESTORABLE_MODES = new Set([
  "home",
  "hub",
  "vu2",
  "lesson",
  "module-milestone",
  "quiz",
  "quiz-overview",
  "knowledge-base",
  "final-exam-portal",
  "final-exam",
]);

const KNOWLEDGE_BASE_TABS = new Set(["lonekollen", "cv"]);
const CV_BUILDER_COMPACT_QUERY = "(max-width: 940px)";

const COURSE_CONFIG = {
  vu1: {
    id: "vu1",
    shortLabel: "VU1",
    fullTitle: "VU1 - Grundutbildning del 1",
    educationLabel: "Väktarutbildning 1",
    moduleListTitle: "Moduler VU1",
    finalExamLabel: "Slutprov VU1",
  },
  vu2: {
    id: "vu2",
    shortLabel: "VU2",
    fullTitle: "VU2 - Grundutbildning del 2",
    educationLabel: "Väktarutbildning 2",
    moduleListTitle: "Moduler VU2",
    finalExamLabel: "Slutprov VU2",
  },
};

function resetStoredProgressIfNeeded() {
  try {
    if (localStorage.getItem(STORAGE_KEYS.version) === STORAGE_VERSION) return;

    localStorage.removeItem(STORAGE_KEYS.legacyVisited);
    localStorage.removeItem(STORAGE_KEYS.completedPages);
    localStorage.removeItem(STORAGE_KEYS.answers);
    localStorage.removeItem(STORAGE_KEYS.quizSubmissions);
    localStorage.removeItem(STORAGE_KEYS.scenarioProgress);
    localStorage.removeItem(STORAGE_KEYS.finalExam);
    localStorage.removeItem(STORAGE_KEYS.location);
    localStorage.removeItem(STORAGE_KEYS.progressOwner);
    localStorage.setItem(STORAGE_KEYS.version, STORAGE_VERSION);
  } catch {
    // The app remains usable if storage is blocked.
  }
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The app remains usable if storage is blocked.
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readArrayStorage(key) {
  const value = readStorage(key, []);
  return Array.isArray(value) ? value : [];
}

function readObjectStorage(key) {
  const value = readStorage(key, {});
  return isPlainObject(value) ? value : {};
}

function readQuizHistoryStorage() {
  const value = readObjectStorage(STORAGE_KEYS.quizHistory);
  return {
    ownerId: typeof value.ownerId === "string" ? value.ownerId : "",
    attempts: Array.isArray(value.attempts) ? value.attempts : [],
    answers: Array.isArray(value.answers) ? value.answers : [],
    reviewItems: Array.isArray(value.reviewItems) ? value.reviewItems : [],
  };
}

function toSafeIndex(value, fallback = 0) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : fallback;
}

function sanitizeFinalExamSession(session) {
  if (!isPlainObject(session) || !Array.isArray(session.questionIds)) return null;

  const questionIds = session.questionIds.filter((id) => typeof id === "string");
  if (!questionIds.length) return null;

  const completedAt = Number(session.completedAt || 0);
  const createdAt = Number(session.createdAt || Date.now());
  const endsAt = Number(session.endsAt || 0);
  const reviewMode = session.reviewMode === true || session.view === "review";
  return {
    id: typeof session.id === "string" ? session.id : `restored-final-${Date.now()}`,
    createdAt,
    completedAt: completedAt > 0 ? completedAt : null,
    currentIndex: toSafeIndex(session.currentIndex),
    endsAt: endsAt > 0 ? endsAt : completedAt > 0 ? null : createdAt + FINAL_EXAM_DURATION_MS,
    reviewMode: completedAt > 0 ? false : reviewMode,
    questionIds,
    answers: isPlainObject(session.answers) ? session.answers : {},
  };
}

function readFinalExamStorage() {
  const stored = readObjectStorage(STORAGE_KEYS.finalExam);
  return Object.fromEntries(
    Object.entries(stored)
      .map(([courseId, session]) => [courseId, sanitizeFinalExamSession(session)])
      .filter(([, session]) => Boolean(session))
  );
}

resetStoredProgressIfNeeded();

const storedQuizHistory = readQuizHistoryStorage();

const state = {
  courses: { vu1: [], vu2: [] },
  courseId: "vu1",
  modules: [],
  moduleIndex: 0,
  lessonIndex: 0,
  pageIndex: 0,
  mode: "home",
  knowledgeBaseTab: "lonekollen",
  answers: readObjectStorage(STORAGE_KEYS.answers),
  quizSubmissions: readObjectStorage(STORAGE_KEYS.quizSubmissions),
  scenarioProgress: readObjectStorage(STORAGE_KEYS.scenarioProgress),
  finalExams: readFinalExamStorage(),
  finalExam: null,
  finalExamPools: { vu1: [], vu2: [] },
  finalExamPool: [],
  visited: new Set(readArrayStorage(STORAGE_KEYS.completedPages).filter((id) => typeof id === "string")),
  user: {
    displayName: "Sven Svensson",
    firstName: "Sven",
  },
  authClient: null,
  authPreview: false,
  membership: {
    tier: "basic",
    ready: false,
    error: null,
    usage: {
      vu1Question: { used: 0, limit: 10, remaining: 10 },
      scenarioQuestion: { used: 0, limit: 10, remaining: 10 },
      flashcardFlip: { used: 0, limit: 10, remaining: 10 },
    },
    dialogTrigger: null,
    usagePending: false,
  },
  progressSync: {
    userId: "",
    ready: false,
    syncing: false,
    queued: false,
    timer: null,
    error: null,
  },
  quizHistory: {
    ownerId: storedQuizHistory.ownerId,
    attempts: storedQuizHistory.attempts,
    answers: storedQuizHistory.answers,
    reviewItems: storedQuizHistory.reviewItems,
    ready: false,
    cloudReady: false,
    reviewCloudReady: false,
    syncing: false,
    queued: false,
    timer: null,
    error: null,
  },
  portalHistory: {
    ready: false,
    restoring: false,
  },
  emblems: [],
  emblemDialogTrigger: null,
  quizPortal: {
    view: "home",
    dataStatus: "idle",
    dataError: "",
    quizzes: {},
    flashcards: [],
    sessionQuestions: [],
    currentIndex: 0,
    selectedOption: null,
    answers: [],
    isAnswered: false,
    timedOut: false,
    questionTimeRemaining: 30,
    questionDeadline: 0,
    score: 0,
    showResults: false,
    historyAttemptId: "",
    flashcardIndex: 0,
    flashcardFlipped: false,
  },
  toastTimer: null,
  finalExamTimer: null,
};

const quizScenarios = [
  { id: 1, title: "Butik och handel", completed: 12, total: 18, icon: "shopping-cart" },
  { id: 2, title: "Köpcentrum", completed: 3, total: 9, icon: "building-2" },
  { id: 3, title: "Lager och logistik", completed: 2, total: 8, icon: "warehouse" },
  { id: 4, title: "Kollektivtrafik", completed: 4, total: 10, icon: "bus" },
  { id: 5, title: "Sjukhus och vård", completed: 0, total: 8, icon: "hospital" },
  { id: 6, title: "Kontor och reception", completed: 5, total: 10, icon: "laptop" },
  { id: 7, title: "Bostadsområden", completed: 0, total: 8, icon: "home" },
  { id: 8, title: "Industri och rondering", completed: 0, total: 8, icon: "factory" },
  { id: 9, title: "Arenor och event", completed: 2, total: 11, icon: "ticket" },
  { id: 10, title: "Juridik och befogenheter", completed: 6, total: 6, icon: "scale" },
  { id: 11, title: "Brand och nödläge", completed: 0, total: 4, icon: "flame" },
];

const quizPortalModules = [
  {
    view: "review",
    title: "Att repetera",
    description: "Öva på frågor du tidigare svarat fel på och bekräfta kunskapen igen efter 24 timmar.",
    icon: "rotate-ccw",
    theme: "orange",
    badge: "Personligt",
  },
  {
    view: "vu1",
    title: "VU1 Quiz",
    description: "Repetera grunderna från Väktarutbildning 1. Frågor om instruktioner, etik och juridiska grunder.",
    icon: "shield",
    theme: "blue",
    badge: "Flervalsquiz",
  },
  {
    view: "vu2",
    title: "VU2 Quiz",
    description: "Fördjupande frågor från Väktarutbildning 2. Tillsyn, arbetsmiljö och mer avancerad juridik.",
    icon: "shield-check",
    theme: "violet",
    badge: "Flervalsquiz",
  },
  {
    view: "flashcards",
    title: "Flashcards",
    description: "Vänd på korten för att träna in och memorera viktiga lagrum, paragrafer och facktermer.",
    icon: "book-open",
    theme: "teal",
    badge: "Kortlek",
  },
  {
    view: "general",
    title: "Vanlig Quiz",
    description: "En mix av allmänna säkerhetsfrågor relaterade till bevakningsyrket, brand och sjukvård.",
    icon: "brain-circuit",
    theme: "amber",
    badge: "Flervalsquiz",
    comingSoon: true,
  },
  {
    view: "scenario",
    title: "Scenario Quiz",
    description: "Sätts på prov i realistiska och svåra situationer du kan stöta på ute på fältet.",
    icon: "triangle-alert",
    theme: "rose",
    badge: "Scenario",
  },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  moduleListWrap: $("#moduleListWrap"),
  moduleListTitle: $("#moduleListTitle"),
  moduleList: $("#moduleList"),
  moduleCount: $("#moduleCount"),
  breadcrumbs: $("#breadcrumbs"),
  lessonTitle: $("#lessonTitle"),
  metaPills: $(".meta-pills"),
  timeEstimate: $("#timeEstimate"),
  pageCount: $("#pageCount"),
  homePanel: $("#homePanel"),
  courseHub: $("#courseHub"),
  quizOverviewPanel: $("#quizOverviewPanel"),
  quizPortal: $("#quizPortal"),
  knowledgeBasePanel: $("#knowledgeBasePanel"),
  courseHubTitle: $("#courseHubTitle"),
  courseHubMeta: $("#courseHubMeta"),
  courseHubPercent: $("#courseHubPercent"),
  courseHubRing: $("#courseHubRing"),
  vu1HubMobileAvatar: $("#vu1HubMobileAvatar"),
  vu1HubMobileProgress: $("#vu1HubMobileProgress"),
  hubContinueTitle: $("#hubContinueTitle"),
  hubContinueMeta: $("#hubContinueMeta"),
  hubContinueButton: $("#hubContinueButton"),
  hubContinueBar: $("#hubContinueBar"),
  hubCompletedModules: $("#hubCompletedModules"),
  hubCompletedPages: $("#hubCompletedPages"),
  hubQuizScore: $("#hubQuizScore"),
  hubModuleCount: $("#hubModuleCount"),
  hubModuleList: $("#hubModuleList"),
  moduleContextBar: $(".module-context-bar"),
  moduleHeroMeta: $("#moduleHeroMeta"),
  moduleHeroTitle: $("#moduleHeroTitle"),
  moduleHeroText: $("#moduleHeroText"),
  moduleInfoButton: $("#moduleInfoButton"),
  moduleInfoPanel: $("#moduleInfoPanel"),
  moduleInfoProgress: $("#moduleInfoProgress"),
  moduleInfoTime: $("#moduleInfoTime"),
  moduleInfoLessons: $("#moduleInfoLessons"),
  moduleMilestonePanel: $("#moduleMilestonePanel"),
  moduleMilestoneKickerIcon: $("#moduleMilestoneKickerIcon"),
  moduleMilestoneKicker: $("#moduleMilestoneKicker"),
  moduleMilestoneTitle: $("#moduleMilestoneTitle"),
  moduleMilestoneObjective: $("#moduleMilestoneObjective"),
  moduleMilestoneOutline: $("#moduleMilestoneOutline"),
  moduleMilestoneTime: $("#moduleMilestoneTime"),
  moduleMilestonePages: $("#moduleMilestonePages"),
  moduleMilestoneQuiz: $("#moduleMilestoneQuiz"),
  moduleMilestoneStartButton: $("#moduleMilestoneStartButton"),
  pageTabs: $("#pageTabs"),
  article: $("#article"),
  readerPanel: $("#readerPanel"),
  quizPanel: $("#quizPanel"),
  finalExamPanel: $("#finalExamPanel"),
  finalExamTitle: $("#finalExamTitle"),
  finalExamSubtitle: $("#finalExamSubtitle"),
  finalExamAnswered: $("#finalExamAnswered"),
  finalExamProgress: $("#finalExamProgress"),
  finalExamSteps: $("#finalExamSteps"),
  finalExamQuestion: $("#finalExamQuestion"),
  finalExamFooter: $(".final-exam-footer"),
  finalExamPrevButton: $("#finalExamPrevButton"),
  finalExamNextButton: $("#finalExamNextButton"),
  finalExamSubmitButton: $("#finalExamSubmitButton"),
  finalExamNavCount: $("#finalExamNavCount"),
  finalExamHeadLabel: $(".final-exam-head-label"),
  quizTitle: $("#quizTitle"),
  quizScore: $("#quizScore"),
  quizQuestions: $("#quizQuestions"),
  progressModule: $("#progressModule"),
  progressPercent: $("#progressPercent"),
  progressBar: $("#progressBar"),
  progressSummary: $("#progressSummary"),
  moduleHours: $("#moduleHours"),
  lessonTimeline: $("#lessonTimeline"),
  prevButton: $("#prevButton"),
  nextButton: $("#nextButton"),
  quizButton: $("#quizButton"),
  backToLessonButton: $("#backToLessonButton"),
  resetQuizButton: $("#resetQuizButton"),
  quizFooter: $("#quizFooter"),
  contentScroll: $("#contentScroll"),
  courseSidebar: $("#courseSidebar"),
  contextSidebar: $("#contextSidebar"),
  navOverlay: $("#navOverlay"),
  quizResetModal: $("#quizResetModal"),
  cvDesktopModal: $("#cvDesktopModal"),
  premiumModal: $("#premiumModal"),
  premiumModalDescription: $("#premiumModalDescription"),
  premiumCheckoutButton: $("#premiumCheckoutButton"),
  emblemModal: $("#emblemModal"),
  emblemModalMedallion: $("#emblemModalMedallion"),
  emblemModalIcon: $("#emblemModalIcon"),
  emblemModalStatus: $("#emblemModalStatus"),
  emblemModalTitle: $("#emblemModalTitle"),
  emblemModalDescription: $("#emblemModalDescription"),
  emblemModalCriterion: $("#emblemModalCriterion"),
  emblemModalProgress: $("#emblemModalProgress"),
  emblemModalProgressBar: $("#emblemModalProgressBar"),
  toast: $("#toast"),
  profileAvatar: $("#profileAvatar"),
  profileName: $("#profileName"),
  profileRole: $("#profileRole"),
  authUserButton: $("#authUserButton"),
  profileSettingsIcon: $("#profileSettingsIcon"),
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function sentenceCase(value) {
  const text = value.trim();
  return text ? text.charAt(0).toLocaleUpperCase("sv-SE") + text.slice(1) : "";
}

function estimateReadingMinutes(page) {
  const body = Array.isArray(page?.body) ? page.body.join(" ") : String(page?.body || "");
  const wordCount = `${page?.title || ""} ${body}`
    .replace(/[#*_`>\-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
}

function cleanTitle(title) {
  return title
    .replace(/^VU\d+\s*[·.-]\s*/i, "")
    .replace(/^Modul\s+\d+\s*:\s*/i, "")
    .trim();
}

function moduleNumber(module) {
  const match = module.rawTitle.match(/Modul\s+(\d+)/i);
  return match ? match[1] : String(state.modules.indexOf(module) + 1);
}

function moduleSourceLabel(number, title) {
  return number ? `Modul ${number} · ${title}` : title;
}

function lessonNumber(lesson) {
  const match = lesson.title.match(/^(\d+\.\d+)/);
  return match ? match[1] : "";
}

function pageId(moduleIndex, lessonIndex, pageIndex, courseId = state.courseId) {
  return `${courseId}:${moduleIndex}:${lessonIndex}:${pageIndex}`;
}

function saveVisited() {
  writeStorage(STORAGE_KEYS.completedPages, [...state.visited]);
  queueProgressSync();
}

function saveAnswers() {
  writeStorage(STORAGE_KEYS.answers, state.answers);
  queueProgressSync();
}

function saveQuizSubmissions() {
  writeStorage(STORAGE_KEYS.quizSubmissions, state.quizSubmissions);
  queueProgressSync();
}

function saveScenarioProgress() {
  writeStorage(STORAGE_KEYS.scenarioProgress, state.scenarioProgress);
}

function saveFinalExam() {
  if (state.finalExam) {
    state.finalExams[state.courseId] = state.finalExam;
  } else {
    delete state.finalExams[state.courseId];
  }
  writeStorage(STORAGE_KEYS.finalExam, state.finalExams);
  queueProgressSync();
}

function getPortalLocationSnapshot(mode = state.mode) {
  return {
    courseId: state.courseId,
    moduleIndex: state.moduleIndex,
    lessonIndex: state.lessonIndex,
    pageIndex: state.pageIndex,
    mode: RESTORABLE_MODES.has(mode) ? mode : "home",
    knowledgeBaseTab: KNOWLEDGE_BASE_TABS.has(state.knowledgeBaseTab) ? state.knowledgeBaseTab : "lonekollen",
  };
}

function normalizePortalLocationSnapshot(value) {
  if (!isPlainObject(value) || !COURSE_CONFIG[value.courseId] || !RESTORABLE_MODES.has(value.mode)) return null;
  return {
    courseId: value.courseId,
    moduleIndex: Math.max(0, Number.parseInt(value.moduleIndex, 10) || 0),
    lessonIndex: Math.max(0, Number.parseInt(value.lessonIndex, 10) || 0),
    pageIndex: Math.max(0, Number.parseInt(value.pageIndex, 10) || 0),
    mode: value.mode,
    knowledgeBaseTab: KNOWLEDGE_BASE_TABS.has(value.knowledgeBaseTab) ? value.knowledgeBaseTab : "lonekollen",
  };
}

function portalLocationsMatch(left, right) {
  return Boolean(
    left &&
      right &&
      left.courseId === right.courseId &&
      left.moduleIndex === right.moduleIndex &&
      left.lessonIndex === right.lessonIndex &&
      left.pageIndex === right.pageIndex &&
      left.mode === right.mode &&
      (left.mode !== "knowledge-base" || left.knowledgeBaseTab === right.knowledgeBaseTab)
  );
}

function portalHistoryState(location) {
  const current = isPlainObject(window.history.state) ? window.history.state : {};
  return { ...current, [PORTAL_HISTORY_STATE_KEY]: location };
}

function portalHashForLocation(location) {
  const courseId = COURSE_CONFIG[location.courseId] ? location.courseId : "vu1";
  const moduleNumber = Math.max(0, Number(location.moduleIndex) || 0) + 1;
  const lessonNumber = Math.max(0, Number(location.lessonIndex) || 0) + 1;
  const pageNumber = Math.max(0, Number(location.pageIndex) || 0) + 1;

  if (location.mode === "home") return "#home";
  if (location.mode === "hub") return "#vu1";
  if (location.mode === "vu2") return "#vu2";
  if (location.mode === "quiz-overview") return "#quiz";
  if (location.mode === "knowledge-base") {
    return location.knowledgeBaseTab === "cv" ? "#kunskapsbas/cv-mall" : "#kunskapsbas/lonekollen";
  }
  if (location.mode === "final-exam-portal") return "#slutprov";
  if (location.mode === "final-exam") return `#slutprov/${courseId}/prov`;
  if (location.mode === "module-milestone") return `#${courseId}/modul/${moduleNumber}/start`;
  if (location.mode === "quiz") return `#${courseId}/modul/${moduleNumber}/quiz`;
  return `#${courseId}/modul/${moduleNumber}/lektion/${lessonNumber}/sida/${pageNumber}`;
}

function portalUrlForLocation(location) {
  return `${window.location.pathname}${window.location.search}${portalHashForLocation(location)}`;
}

function portalLocationFromHash(hash = window.location.hash, fallback = null) {
  let route = "";
  try {
    route = decodeURIComponent(String(hash || "").replace(/^#\/?/, "")).replace(/\/+$/, "").toLowerCase();
  } catch {
    return null;
  }
  if (!route) return null;

  const base = normalizePortalLocationSnapshot(fallback) || getPortalLocationSnapshot();
  if (route === "home") return { ...base, mode: "home" };
  if (route === "vu1") return { ...base, courseId: "vu1", mode: "hub" };
  if (route === "vu2") return { ...base, courseId: "vu2", mode: "vu2" };
  if (route === "quiz") return { ...base, mode: "quiz-overview" };
  if (route === "kunskapsbas" || route === "kunskapsbas/lonekollen") {
    return { ...base, mode: "knowledge-base", knowledgeBaseTab: "lonekollen" };
  }
  if (route === "kunskapsbas/cv-mall" || route === "kunskapsbas/cv") {
    return { ...base, mode: "knowledge-base", knowledgeBaseTab: "cv" };
  }
  if (route === "slutprov") return { ...base, mode: "final-exam-portal" };

  const finalExamMatch = route.match(/^slutprov\/(vu1|vu2)\/prov$/);
  if (finalExamMatch) {
    return { ...base, courseId: finalExamMatch[1], mode: "final-exam" };
  }

  const moduleMatch = route.match(/^(vu1|vu2)\/modul\/(\d+)\/(start|quiz)$/);
  if (moduleMatch) {
    return {
      courseId: moduleMatch[1],
      moduleIndex: Math.max(0, Number(moduleMatch[2]) - 1),
      lessonIndex: 0,
      pageIndex: 0,
      mode: moduleMatch[3] === "quiz" ? "quiz" : "module-milestone",
    };
  }

  const lessonMatch = route.match(/^(vu1|vu2)\/modul\/(\d+)\/lektion\/(\d+)\/sida\/(\d+)$/);
  if (lessonMatch) {
    return {
      courseId: lessonMatch[1],
      moduleIndex: Math.max(0, Number(lessonMatch[2]) - 1),
      lessonIndex: Math.max(0, Number(lessonMatch[3]) - 1),
      pageIndex: Math.max(0, Number(lessonMatch[4]) - 1),
      mode: "lesson",
    };
  }
  return null;
}

function recordPortalHistory(mode = state.mode, action = "push") {
  if (!state.portalHistory.ready || state.portalHistory.restoring || action === "none") return;

  const location = getPortalLocationSnapshot(mode);
  const current = normalizePortalLocationSnapshot(window.history.state?.[PORTAL_HISTORY_STATE_KEY]);
  const url = portalUrlForLocation(location);
  if (portalLocationsMatch(current, location)) {
    if (window.location.hash !== portalHashForLocation(location)) {
      window.history.replaceState(portalHistoryState(location), "", url);
    }
    return;
  }

  const method = action === "replace" ? "replaceState" : "pushState";
  window.history[method](portalHistoryState(location), "", url);
}

function saveLocation(mode = state.mode, options = {}) {
  if (mode !== "quiz-overview") stopQuizPortalQuestionTimer();
  const location = getPortalLocationSnapshot(mode);
  writeStorage(STORAGE_KEYS.location, location);
  recordPortalHistory(mode, options.historyAction || "push");
}

function initializePortalHistory() {
  if (state.portalHistory.ready) return;

  const initialLocation = getPortalLocationSnapshot();
  window.history.replaceState(
    portalHistoryState(initialLocation),
    "",
    portalUrlForLocation(initialLocation)
  );
  state.portalHistory.ready = true;
}

function restorePortalHistory(value) {
  const location = normalizePortalLocationSnapshot(value);
  if (!location || state.portalHistory.restoring) return false;

  state.portalHistory.restoring = true;
  try {
    const courseId = isCourseUnlocked(location.courseId) ? location.courseId : "vu1";
    activateCourse(courseId);

    if (location.mode === "home") {
      showHome();
      return true;
    }
    if (location.mode === "hub") {
      showCourseHub();
      return true;
    }
    if (location.mode === "vu2") {
      showVu2();
      return true;
    }
    if (location.mode === "quiz-overview") {
      cancelQuizPortalCountdown();
      resetQuizPortalSession("home");
      showQuizOverview();
      return true;
    }
    if (location.mode === "knowledge-base") {
      showKnowledgeBase(location.knowledgeBaseTab);
      return true;
    }
    if (location.mode === "final-exam-portal") {
      showFinalExamPortal();
      return true;
    }
    if (location.mode === "final-exam") {
      if (state.finalExam) showFinalExam();
      else showFinalExamPortal();
      return true;
    }

    const moduleIndex = Math.min(location.moduleIndex, Math.max(0, state.modules.length - 1));
    const module = state.modules[moduleIndex];
    if (!module || !isModuleUnlocked(moduleIndex)) {
      showHome();
      return true;
    }

    const lessonIndex = Math.min(location.lessonIndex, Math.max(0, module.lessons.length - 1));
    const lesson = module.lessons[lessonIndex];
    const pageIndex = Math.min(location.pageIndex, Math.max(0, (lesson?.pages.length || 1) - 1));
    state.moduleIndex = moduleIndex;
    state.lessonIndex = lessonIndex;
    state.pageIndex = pageIndex;

    if (location.mode === "module-milestone") {
      showModuleMilestone(moduleIndex, lessonIndex, pageIndex);
    } else if (location.mode === "quiz") {
      showQuiz();
    } else {
      goTo(moduleIndex, lessonIndex, pageIndex, "lesson", { skipMilestone: true });
    }
    return true;
  } finally {
    state.portalHistory.restoring = false;
  }
}

function sanitizeCompletedPages(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === "string" && /^(vu1|vu2):\d+:\d+:\d+$/.test(id)))];
}

function sanitizeQuizAnswers(value) {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, answers]) => /^(vu1|vu2):\d+$/.test(key) && isPlainObject(answers))
      .map(([key, answers]) => [
        key,
        Object.fromEntries(
          Object.entries(answers).filter(
            ([questionNumber, answer]) => /^\d+$/.test(questionNumber) && typeof answer === "string"
          )
        ),
      ])
  );
}

function sanitizeQuizSubmissions(value) {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, timestamp]) => /^(vu1|vu2):\d+$/.test(key) && Number(timestamp) > 0)
      .map(([key, timestamp]) => [key, Number(timestamp)])
  );
}

function sanitizeFinalExams(value) {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([courseId]) => Boolean(COURSE_CONFIG[courseId]))
      .map(([courseId, session]) => [courseId, sanitizeFinalExamSession(session)])
      .filter(([, session]) => Boolean(session))
  );
}

function getProgressSnapshot() {
  return {
    completedPages: sanitizeCompletedPages([...state.visited]),
    quizAnswers: sanitizeQuizAnswers(state.answers),
    quizSubmissions: sanitizeQuizSubmissions(state.quizSubmissions),
    finalExams: sanitizeFinalExams(state.finalExams),
  };
}

function mergeQuizAnswers(remote, local, remoteSubmissions, localSubmissions) {
  const merged = {};
  const keys = new Set([...Object.keys(remote), ...Object.keys(local)]);
  keys.forEach((key) => {
    const remoteSubmittedAt = Number(remoteSubmissions[key] || 0);
    const localSubmittedAt = Number(localSubmissions[key] || 0);
    if (remoteSubmittedAt > localSubmittedAt) {
      merged[key] = { ...(remote[key] || {}) };
    } else if (localSubmittedAt > remoteSubmittedAt) {
      merged[key] = { ...(local[key] || {}) };
    } else {
      merged[key] = { ...(remote[key] || {}), ...(local[key] || {}) };
    }
  });
  return merged;
}

function mergeFinalExamSession(remoteSession, localSession) {
  if (!remoteSession) return localSession || null;
  if (!localSession) return remoteSession;

  if (remoteSession.id === localSession.id) {
    const remoteCompletedAt = Number(remoteSession.completedAt || 0);
    const localCompletedAt = Number(localSession.completedAt || 0);
    const latest = localCompletedAt >= remoteCompletedAt ? localSession : remoteSession;
    return sanitizeFinalExamSession({
      ...remoteSession,
      ...latest,
      completedAt: Math.max(remoteCompletedAt, localCompletedAt) || null,
      answers: { ...(remoteSession.answers || {}), ...(localSession.answers || {}) },
    });
  }

  const remoteTimestamp = Number(remoteSession.completedAt || remoteSession.createdAt || 0);
  const localTimestamp = Number(localSession.completedAt || localSession.createdAt || 0);
  return localTimestamp >= remoteTimestamp ? localSession : remoteSession;
}

function mergeProgressSnapshots(remoteSnapshot, localSnapshot) {
  const remoteSubmissions = sanitizeQuizSubmissions(remoteSnapshot.quizSubmissions);
  const localSubmissions = sanitizeQuizSubmissions(localSnapshot.quizSubmissions);
  const quizSubmissions = Object.fromEntries(
    [...new Set([...Object.keys(remoteSubmissions), ...Object.keys(localSubmissions)])].map((key) => [
      key,
      Math.max(Number(remoteSubmissions[key] || 0), Number(localSubmissions[key] || 0)),
    ])
  );
  const remoteAnswers = sanitizeQuizAnswers(remoteSnapshot.quizAnswers);
  const localAnswers = sanitizeQuizAnswers(localSnapshot.quizAnswers);
  const remoteFinalExams = sanitizeFinalExams(remoteSnapshot.finalExams);
  const localFinalExams = sanitizeFinalExams(localSnapshot.finalExams);
  const finalExams = {};

  new Set([...Object.keys(remoteFinalExams), ...Object.keys(localFinalExams)]).forEach((courseId) => {
    const session = mergeFinalExamSession(remoteFinalExams[courseId], localFinalExams[courseId]);
    if (session) finalExams[courseId] = session;
  });

  return {
    completedPages: sanitizeCompletedPages([
      ...sanitizeCompletedPages(remoteSnapshot.completedPages),
      ...sanitizeCompletedPages(localSnapshot.completedPages),
    ]),
    quizAnswers: mergeQuizAnswers(remoteAnswers, localAnswers, remoteSubmissions, localSubmissions),
    quizSubmissions,
    finalExams,
  };
}

function applyProgressSnapshot(snapshot) {
  const clean = mergeProgressSnapshots(snapshot, {
    completedPages: [],
    quizAnswers: {},
    quizSubmissions: {},
    finalExams: {},
  });
  state.visited = new Set(clean.completedPages);
  state.answers = clean.quizAnswers;
  state.quizSubmissions = clean.quizSubmissions;
  state.finalExams = clean.finalExams;
  state.finalExam = state.finalExams[state.courseId] || null;

  writeStorage(STORAGE_KEYS.completedPages, clean.completedPages);
  writeStorage(STORAGE_KEYS.answers, clean.quizAnswers);
  writeStorage(STORAGE_KEYS.quizSubmissions, clean.quizSubmissions);
  writeStorage(STORAGE_KEYS.finalExam, clean.finalExams);
}

async function getProgressAccessToken() {
  const session = state.authClient?.session;
  return typeof session?.getToken === "function" ? session.getToken() : null;
}

async function requestAuthenticatedJson(endpoint, options = {}) {
  const token = await getProgressAccessToken();
  if (!token) throw new Error("En giltig inloggning krävs för att använda medlemskapet.");

  const response = await fetch(endpoint, {
    method: options.method || "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.idempotent ? { "X-Idempotency-Key": options.idempotent } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function startPremiumCheckout() {
  const idempotencyKey = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const { response, payload } = await requestAuthenticatedJson("/api/stripe/checkout", {
    method: "POST",
    body: {},
    idempotent: idempotencyKey,
  });
  if ((!response.ok && payload.code !== "already_premium") || !payload.url) {
    throw new Error(payload.error || "Betalningstjänsten kunde inte startas.");
  }
  window.location.assign(payload.url);
  return true;
}

function applyMembershipPayload(payload) {
  if (payload?.membership === "premium" || payload?.membership === "basic") {
    state.membership.tier = payload.membership;
  }
  if (payload?.usage && typeof payload.usage === "object") {
    ["vu1Question", "scenarioQuestion", "flashcardFlip"].forEach((key) => {
      const value = payload.usage[key];
      if (value && Number.isFinite(Number(value.used))) {
        state.membership.usage[key] = {
          used: Number(value.used),
          limit: Number(value.limit ?? 10),
          remaining: Math.max(0, Number(value.remaining ?? 0)),
        };
      }
    });
  }
  state.membership.ready = true;
  state.membership.error = null;
}

async function getMembershipStatus() {
  const { response, payload } = await requestAuthenticatedJson("/api/membership/status");
  if (!response.ok) throw new Error(payload.error || "Medlemskapet kunde inte läsas.");
  applyMembershipPayload(payload);
  return payload;
}

async function initializeMembership() {
  if (state.authPreview) {
    state.membership.ready = true;
    return true;
  }
  try {
    await getMembershipStatus();
    return true;
  } catch (error) {
    state.membership.tier = "basic";
    state.membership.ready = false;
    state.membership.error = error;
    console.warn("Medlemskapet kunde inte synkas. Premiuminnehåll hålls låst.", error);
    return false;
  }
}

function membershipUsageStateKey(kind) {
  return {
    vu1_question: "vu1Question",
    scenario_question: "scenarioQuestion",
    flashcard_flip: "flashcardFlip",
  }[kind];
}

async function consumeMembershipAllowance(kind, eventKey) {
  if (state.membership.tier === "premium") return true;
  if (state.authPreview) {
    const previewStateKey = membershipUsageStateKey(kind);
    const previewUsage = previewStateKey ? state.membership.usage[previewStateKey] : null;
    if (!previewUsage || previewUsage.remaining <= 0) {
      openPremiumModal(kind);
      return false;
    }
    previewUsage.used += 1;
    previewUsage.remaining = Math.max(0, previewUsage.limit - previewUsage.used);
    return true;
  }
  const { response, payload } = await requestAuthenticatedJson("/api/membership/consume", {
    method: "POST",
    body: { kind, eventKey },
  });
  const stateKey = membershipUsageStateKey(kind);
  if (stateKey && payload?.usage) {
    state.membership.usage[stateKey] = {
      used: Number(payload.usage.used || 0),
      limit: Number(payload.usage.limit || 10),
      remaining: Math.max(0, Number(payload.usage.remaining || 0)),
    };
  }
  if (payload?.membership === "premium") state.membership.tier = "premium";
  if (response.status === 403) {
    openPremiumModal(kind);
    return false;
  }
  if (!response.ok) throw new Error(payload.error || "Användningen kunde inte registreras.");
  return true;
}

async function maybeStartPremiumCheckout() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("upgrade") !== "premium") return false;

  url.searchParams.delete("upgrade");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  try {
    return await startPremiumCheckout();
  } catch (error) {
    console.error("Stripe Checkout kunde inte startas.", error);
    window.alert("Betalningen kunde inte startas just nu. Försök igen om en stund.");
    return false;
  }
}

function clearBillingReturnParameters() {
  const url = new URL(window.location.href);
  url.searchParams.delete("billing");
  url.searchParams.delete("session_id");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

async function confirmPremiumAfterCheckout() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("billing") !== "success") return;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (state.membership.tier === "premium") {
      clearBillingReturnParameters();
      closePremiumModal();
      rerenderAfterMembershipChange();
      showToast("Premium är aktivt – välkommen till hela Vaktskolan!");
      return;
    }
    if (attempt > 0) await new Promise((resolve) => window.setTimeout(resolve, 750));
    try {
      await getMembershipStatus();
    } catch (error) {
      console.warn("Väntar på att Premium-köpet ska bekräftas.", error);
    }
  }
  showToast("Betalningen behandlas. Premium aktiveras automatiskt så snart den är bekräftad.");
}

window.vaktskolanMembership = {
  consume: consumeMembershipAllowance,
  getStatus: getMembershipStatus,
  startPremiumCheckout,
};

async function syncProgressToSupabase() {
  const sync = state.progressSync;
  const supabaseApi = window.vaktskolanSupabase;
  if (!sync.ready || !sync.userId || !supabaseApi?.upsert || sync.syncing) {
    if (sync.syncing) sync.queued = true;
    return;
  }

  sync.syncing = true;
  sync.queued = false;
  const snapshot = getProgressSnapshot();
  try {
    await supabaseApi.upsert(
      PROGRESS_TABLE,
      {
        user_id: sync.userId,
        completed_pages: snapshot.completedPages,
        quiz_answers: snapshot.quizAnswers,
        quiz_submissions: snapshot.quizSubmissions,
        final_exams: snapshot.finalExams,
        schema_version: PROGRESS_SCHEMA_VERSION,
      },
      { onConflict: "user_id", returning: "minimal" }
    );
    sync.error = null;
  } catch (error) {
    sync.error = error;
    console.warn("Progression kunde inte synkas till Supabase. Den finns kvar lokalt.", error);
  } finally {
    sync.syncing = false;
    if (sync.queued) queueProgressSync(0);
  }
}

function queueProgressSync(delay = 250) {
  const sync = state.progressSync;
  if (!sync.ready || !sync.userId) return;
  if (sync.syncing) {
    sync.queued = true;
    return;
  }

  window.clearTimeout(sync.timer);
  sync.timer = window.setTimeout(() => {
    sync.timer = null;
    void syncProgressToSupabase();
  }, delay);
}

async function initializeProgressSync() {
  const sync = state.progressSync;
  const supabaseApi = window.vaktskolanSupabase;
  const userId = state.authClient?.user?.id || "";
  if (state.authPreview) return true;
  if (!userId || !supabaseApi?.ready || !supabaseApi?.select) return false;

  try {
    const storedOwner = readStorage(STORAGE_KEYS.progressOwner, "");
    if (storedOwner && storedOwner !== userId) {
      applyProgressSnapshot({ completedPages: [], quizAnswers: {}, quizSubmissions: {}, finalExams: {} });
      try {
        localStorage.removeItem(STORAGE_KEYS.location);
        localStorage.removeItem(STORAGE_KEYS.knownEmblems);
      } catch {
        // The app remains usable if storage is blocked.
      }
    }
    writeStorage(STORAGE_KEYS.progressOwner, userId);

    supabaseApi.setAccessToken(getProgressAccessToken);
    await supabaseApi.ready;
    const rows = await supabaseApi.select(PROGRESS_TABLE, {
      select: "completed_pages,quiz_answers,quiz_submissions,final_exams,schema_version",
      user_id: `eq.${userId}`,
      limit: 1,
    });
    const remote = Array.isArray(rows) && rows[0]
      ? {
          completedPages: rows[0].completed_pages,
          quizAnswers: rows[0].quiz_answers,
          quizSubmissions: rows[0].quiz_submissions,
          finalExams: rows[0].final_exams,
        }
      : { completedPages: [], quizAnswers: {}, quizSubmissions: {}, finalExams: {} };
    const merged = mergeProgressSnapshots(remote, getProgressSnapshot());
    applyProgressSnapshot(merged);
    sync.userId = userId;
    sync.ready = true;
    sync.error = null;
    await syncProgressToSupabase();
    if (!sync.error) console.info("Elevens progression är synkad med Supabase.");
    return !sync.error;
  } catch (error) {
    sync.error = error;
    sync.ready = false;
    console.warn("Kontosynkning av progression är inte tillgänglig. Plattformen öppnas inte.", error);
    return false;
  }
}

function createClientUuid() {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function toIsoTimestamp(value, fallback = new Date().toISOString()) {
  const timestamp = new Date(value || fallback);
  return Number.isNaN(timestamp.getTime()) ? fallback : timestamp.toISOString();
}

function sanitizeQuizHistoryAttempt(value, synced = value?.synced === true) {
  if (!isPlainObject(value)) return null;
  const id = typeof value.id === "string" ? value.id : "";
  const sourceType = value.sourceType || value.source_type;
  const sourceRef = value.sourceRef || value.source_ref;
  const courseId = value.courseId || value.course_id;
  if (!id || !sourceType || !sourceRef || !courseId) return null;

  const moduleNumberValue = value.moduleNumber ?? value.module_number;
  return {
    id,
    userId: value.userId || value.user_id || "",
    sourceType,
    sourceRef,
    collectionId: value.collectionId || value.collection_id || null,
    courseId,
    moduleNumber: Number.isInteger(Number(moduleNumberValue)) && Number(moduleNumberValue) > 0
      ? Number(moduleNumberValue)
      : null,
    questionCount: Math.max(0, Number(value.questionCount ?? value.question_count) || 0),
    correctCount: Math.max(0, Number(value.correctCount ?? value.correct_count) || 0),
    completed: value.completed === true,
    startedAt: toIsoTimestamp(value.startedAt || value.started_at),
    completedAt: value.completedAt || value.completed_at
      ? toIsoTimestamp(value.completedAt || value.completed_at)
      : null,
    synced,
  };
}

function sanitizeQuizHistoryAnswer(value, synced = value?.synced === true) {
  if (!isPlainObject(value)) return null;
  const id = typeof value.id === "string" ? value.id : "";
  const attemptId = value.attemptId || value.attempt_id;
  const questionKey = value.questionKey || value.question_key;
  const sourceType = value.sourceType || value.source_type;
  const courseId = value.courseId || value.course_id;
  if (!id || !attemptId || !questionKey || !sourceType || !courseId) return null;

  const moduleNumberValue = value.moduleNumber ?? value.module_number;
  const topicKeys = value.topicKeys || value.topic_keys;
  const topicLabels = value.topicLabels || value.topic_labels;
  return {
    id,
    attemptId,
    userId: value.userId || value.user_id || "",
    questionId: value.questionId || value.question_id || null,
    questionKey,
    sourceType,
    courseId,
    moduleNumber: Number.isInteger(Number(moduleNumberValue)) && Number(moduleNumberValue) > 0
      ? Number(moduleNumberValue)
      : null,
    topicKeys: Array.isArray(topicKeys) ? topicKeys.filter((item) => typeof item === "string" && item) : [],
    topicLabels: Array.isArray(topicLabels) ? topicLabels.filter((item) => typeof item === "string" && item) : [],
    contextKey: value.contextKey || value.context_key || null,
    contextLabel: value.contextLabel || value.context_label || null,
    selectedAnswer: value.selectedAnswer ?? value.selected_answer ?? null,
    correctAnswer: value.correctAnswer ?? value.correct_answer ?? null,
    isCorrect: value.isCorrect === true || value.is_correct === true,
    timedOut: value.timedOut === true || value.timed_out === true,
    answeredAt: toIsoTimestamp(value.answeredAt || value.answered_at),
    synced,
  };
}

function sanitizeQuizReviewItem(value, synced = value?.synced === true) {
  if (!isPlainObject(value)) return null;
  const id = typeof value.id === "string" ? value.id : "";
  const questionKey = value.questionKey || value.question_key;
  const originSourceType = value.originSourceType || value.origin_source_type;
  const courseId = value.courseId || value.course_id;
  const stage = value.stage;
  if (!id || !questionKey || !originSourceType || !courseId || !["due", "waiting", "mastered"].includes(stage)) {
    return null;
  }

  const moduleNumberValue = value.moduleNumber ?? value.module_number;
  const topicKeys = value.topicKeys || value.topic_keys;
  const topicLabels = value.topicLabels || value.topic_labels;
  const confirmations = Math.max(0, Math.min(2, Number(value.correctConfirmations ?? value.correct_confirmations) || 0));
  return {
    id,
    userId: value.userId || value.user_id || "",
    questionId: value.questionId || value.question_id || null,
    questionKey,
    originSourceType,
    courseId,
    moduleNumber: Number.isInteger(Number(moduleNumberValue)) && Number(moduleNumberValue) > 0
      ? Number(moduleNumberValue)
      : null,
    topicKeys: Array.isArray(topicKeys) ? topicKeys.filter((item) => typeof item === "string" && item) : [],
    topicLabels: Array.isArray(topicLabels) ? topicLabels.filter((item) => typeof item === "string" && item) : [],
    contextKey: value.contextKey || value.context_key || null,
    contextLabel: value.contextLabel || value.context_label || null,
    stage,
    correctConfirmations: confirmations,
    dueAt: value.dueAt || value.due_at ? toIsoTimestamp(value.dueAt || value.due_at) : null,
    lastAnswerCorrect: value.lastAnswerCorrect === true || value.last_answer_correct === true,
    lastAnsweredAt: toIsoTimestamp(value.lastAnsweredAt || value.last_answered_at),
    masteredAt: value.masteredAt || value.mastered_at ? toIsoTimestamp(value.masteredAt || value.mastered_at) : null,
    createdAt: toIsoTimestamp(value.createdAt || value.created_at || value.lastAnsweredAt || value.last_answered_at),
    updatedAt: toIsoTimestamp(value.updatedAt || value.updated_at || value.lastAnsweredAt || value.last_answered_at),
    synced,
  };
}

function saveQuizHistory() {
  const history = state.quizHistory;
  history.attempts = history.attempts
    .map((item) => sanitizeQuizHistoryAttempt(item, item?.synced === true))
    .filter(Boolean)
    .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt))
    .slice(0, QUIZ_HISTORY_MAX_ATTEMPTS);
  history.answers = history.answers
    .map((item) => sanitizeQuizHistoryAnswer(item, item?.synced === true))
    .filter(Boolean)
    .sort((left, right) => Date.parse(right.answeredAt) - Date.parse(left.answeredAt))
    .slice(0, QUIZ_HISTORY_MAX_ANSWERS);
  const reviewItemsByQuestionKey = new Map();
  history.reviewItems
    .map((item) => sanitizeQuizReviewItem(item, item?.synced === true))
    .filter(Boolean)
    .forEach((item) => {
      const existing = reviewItemsByQuestionKey.get(item.questionKey);
      const itemUpdatedAt = Date.parse(item.updatedAt);
      const existingUpdatedAt = Date.parse(existing?.updatedAt || 0);
      if (
        !existing ||
        itemUpdatedAt > existingUpdatedAt ||
        (itemUpdatedAt === existingUpdatedAt && !item.synced && existing.synced)
      ) {
        reviewItemsByQuestionKey.set(item.questionKey, item);
      }
    });
  history.reviewItems = [...reviewItemsByQuestionKey.values()]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  writeStorage(STORAGE_KEYS.quizHistory, {
    version: QUIZ_HISTORY_SCHEMA_VERSION,
    ownerId: history.ownerId,
    attempts: history.attempts,
    answers: history.answers,
    reviewItems: history.reviewItems,
  });
}

function quizAttemptDatabaseRow(attempt) {
  return {
    id: attempt.id,
    user_id: attempt.userId,
    source_type: attempt.sourceType,
    source_ref: attempt.sourceRef,
    collection_id: attempt.collectionId,
    course_id: attempt.courseId,
    module_number: attempt.moduleNumber,
    question_count: attempt.questionCount,
    correct_count: attempt.correctCount,
    completed: attempt.completed,
    started_at: attempt.startedAt,
    completed_at: attempt.completedAt,
  };
}

function quizAnswerDatabaseRow(answer) {
  return {
    id: answer.id,
    attempt_id: answer.attemptId,
    user_id: answer.userId,
    question_id: answer.questionId,
    question_key: answer.questionKey,
    source_type: answer.sourceType,
    course_id: answer.courseId,
    module_number: answer.moduleNumber,
    topic_keys: answer.topicKeys,
    topic_labels: answer.topicLabels,
    context_key: answer.contextKey,
    context_label: answer.contextLabel,
    selected_answer: answer.selectedAnswer,
    correct_answer: answer.correctAnswer,
    is_correct: answer.isCorrect,
    timed_out: answer.timedOut,
    answered_at: answer.answeredAt,
  };
}

function quizReviewItemDatabaseRow(item) {
  return {
    id: item.id,
    user_id: item.userId,
    question_id: item.questionId,
    question_key: item.questionKey,
    origin_source_type: item.originSourceType,
    course_id: item.courseId,
    module_number: item.moduleNumber,
    topic_keys: item.topicKeys,
    topic_labels: item.topicLabels,
    context_key: item.contextKey,
    context_label: item.contextLabel,
    stage: item.stage,
    correct_confirmations: item.correctConfirmations,
    due_at: item.dueAt,
    last_answer_correct: item.lastAnswerCorrect,
    last_answered_at: item.lastAnsweredAt,
    mastered_at: item.masteredAt,
    created_at: item.createdAt,
  };
}

async function syncQuizHistoryToSupabase() {
  const history = state.quizHistory;
  const supabaseApi = window.vaktskolanSupabase;
  if (!history.ready || !history.cloudReady || !history.ownerId || !supabaseApi?.upsert || history.syncing) {
    if (history.syncing) history.queued = true;
    return;
  }

  history.syncing = true;
  history.queued = false;
  try {
    const pendingAttempts = history.attempts.filter((attempt) => !attempt.synced);
    if (pendingAttempts.length) {
      await supabaseApi.upsert(
        QUIZ_ATTEMPTS_TABLE,
        pendingAttempts.map(quizAttemptDatabaseRow),
        { onConflict: "id", returning: "minimal" }
      );
      pendingAttempts.forEach((attempt) => {
        attempt.synced = true;
      });
    }

    const pendingAnswers = history.answers.filter((answer) => !answer.synced);
    if (pendingAnswers.length) {
      await supabaseApi.upsert(
        QUIZ_ANSWERS_TABLE,
        pendingAnswers.map(quizAnswerDatabaseRow),
        { onConflict: "attempt_id,question_key", returning: "minimal" }
      );
      pendingAnswers.forEach((answer) => {
        answer.synced = true;
      });
    }

    const pendingReviewItems = history.reviewCloudReady
      ? history.reviewItems.filter((item) => !item.synced)
      : [];
    if (pendingReviewItems.length) {
      await supabaseApi.upsert(
        QUIZ_REVIEW_ITEMS_TABLE,
        pendingReviewItems.map(quizReviewItemDatabaseRow),
        { onConflict: "user_id,question_key", returning: "minimal" }
      );
      pendingReviewItems.forEach((item) => {
        item.synced = true;
      });
    }
    history.error = null;
    saveQuizHistory();
  } catch (error) {
    history.error = error;
    console.warn("Quizhistoriken kunde inte synkas. Nya resultat finns kvar lokalt.", error);
  } finally {
    history.syncing = false;
    if (history.queued) queueQuizHistorySync(0);
  }
}

function queueQuizHistorySync(delay = 250) {
  const history = state.quizHistory;
  if (!history.ready || !history.cloudReady || !history.ownerId) return;
  if (history.syncing) {
    history.queued = true;
    return;
  }
  window.clearTimeout(history.timer);
  history.timer = window.setTimeout(() => {
    history.timer = null;
    void syncQuizHistoryToSupabase();
  }, delay);
}

function mergeQuizHistory(remoteRows, localRows, sanitizer) {
  const records = new Map();
  remoteRows.map((item) => sanitizer(item, true)).filter(Boolean).forEach((item) => records.set(item.id, item));
  localRows.map((item) => sanitizer(item, item?.synced === true)).filter(Boolean).forEach((item) => {
    if (!item.synced || !records.has(item.id)) records.set(item.id, item);
  });
  return [...records.values()];
}

async function initializeQuizHistory() {
  const history = state.quizHistory;
  const supabaseApi = window.vaktskolanSupabase;
  const userId = state.authClient?.user?.id || "";

  if (!userId) {
    history.ready = true;
    backfillQuizReviewItems();
    saveQuizHistory();
    return;
  }

  if (history.ownerId && history.ownerId !== userId) {
    history.attempts = [];
    history.answers = [];
    history.reviewItems = [];
  }
  history.ownerId = userId;
  history.attempts = history.attempts
    .map((item) => sanitizeQuizHistoryAttempt({ ...item, userId }, item?.synced === true))
    .filter(Boolean);
  history.answers = history.answers
    .map((item) => sanitizeQuizHistoryAnswer({ ...item, userId }, item?.synced === true))
    .filter(Boolean);
  history.reviewItems = history.reviewItems
    .map((item) => sanitizeQuizReviewItem({ ...item, userId }, item?.synced === true))
    .filter(Boolean);
  history.ready = true;
  backfillQuizReviewItems();
  saveQuizHistory();

  if (state.authPreview || !supabaseApi?.select) return;

  try {
    const [attempts, answers] = await Promise.all([
      supabaseApi.select(QUIZ_ATTEMPTS_TABLE, {
        select: "id,user_id,source_type,source_ref,collection_id,course_id,module_number,question_count,correct_count,completed,started_at,completed_at",
        user_id: `eq.${userId}`,
        order: "started_at.desc",
        limit: QUIZ_HISTORY_MAX_ATTEMPTS,
      }),
      supabaseApi.select(QUIZ_ANSWERS_TABLE, {
        select: "id,attempt_id,user_id,question_id,question_key,source_type,course_id,module_number,topic_keys,topic_labels,context_key,context_label,selected_answer,correct_answer,is_correct,timed_out,answered_at",
        user_id: `eq.${userId}`,
        order: "answered_at.desc",
        limit: QUIZ_HISTORY_MAX_ANSWERS,
      }),
    ]);
    history.attempts = mergeQuizHistory(Array.isArray(attempts) ? attempts : [], history.attempts, sanitizeQuizHistoryAttempt);
    history.answers = mergeQuizHistory(Array.isArray(answers) ? answers : [], history.answers, sanitizeQuizHistoryAnswer);
    history.cloudReady = true;
    try {
      const reviewItems = await supabaseApi.select(QUIZ_REVIEW_ITEMS_TABLE, {
        select: "id,user_id,question_id,question_key,origin_source_type,course_id,module_number,topic_keys,topic_labels,context_key,context_label,stage,correct_confirmations,due_at,last_answer_correct,last_answered_at,mastered_at,created_at,updated_at",
        user_id: `eq.${userId}`,
        order: "updated_at.desc",
        limit: 1000,
      });
      history.reviewItems = mergeQuizHistory(
        Array.isArray(reviewItems) ? reviewItems : [],
        history.reviewItems,
        sanitizeQuizReviewItem
      );
      history.reviewCloudReady = true;
    } catch (reviewError) {
      history.reviewCloudReady = false;
      console.warn("Molnlagring för repetitionskön är inte tillgänglig ännu. Lokal lagring används.", reviewError);
    }
    backfillQuizReviewItems();
    history.error = null;
    saveQuizHistory();
    await syncQuizHistoryToSupabase();
  } catch (error) {
    history.cloudReady = false;
    history.reviewCloudReady = false;
    history.error = error;
    backfillQuizReviewItems();
    saveQuizHistory();
    console.warn("Molnlagring för quizhistorik är inte tillgänglig ännu. Lokal lagring används.", error);
  }
}

function recordQuizAttempt(details) {
  const history = state.quizHistory;
  const attempt = sanitizeQuizHistoryAttempt(
    {
      id: details.id || createClientUuid(),
      userId: history.ownerId || state.authClient?.user?.id || "",
      sourceType: details.sourceType,
      sourceRef: details.sourceRef,
      collectionId: details.collectionId || null,
      courseId: details.courseId || "general",
      moduleNumber: details.moduleNumber || null,
      questionCount: details.questionCount || 0,
      correctCount: details.correctCount || 0,
      completed: details.completed === true,
      startedAt: details.startedAt || new Date().toISOString(),
      completedAt: details.completedAt || null,
    },
    false
  );
  if (!attempt) return null;

  const existingIndex = history.attempts.findIndex((item) => item.id === attempt.id);
  if (existingIndex >= 0) history.attempts[existingIndex] = attempt;
  else history.attempts.unshift(attempt);
  saveQuizHistory();
  queueQuizHistorySync();
  return attempt;
}

function updateQuizAttempt(attemptId, updates) {
  const attempt = state.quizHistory.attempts.find((item) => item.id === attemptId);
  if (!attempt) return null;
  Object.assign(attempt, updates, { synced: false });
  const sanitized = sanitizeQuizHistoryAttempt(attempt, false);
  if (!sanitized) return null;
  state.quizHistory.attempts[state.quizHistory.attempts.indexOf(attempt)] = sanitized;
  saveQuizHistory();
  queueQuizHistorySync();
  return sanitized;
}

function recordQuizAnswer(details) {
  const history = state.quizHistory;
  const answer = sanitizeQuizHistoryAnswer(
    {
      id: details.id || createClientUuid(),
      attemptId: details.attemptId,
      userId: history.ownerId || state.authClient?.user?.id || "",
      questionId: details.questionId || null,
      questionKey: details.questionKey,
      sourceType: details.sourceType,
      courseId: details.courseId || "general",
      moduleNumber: details.moduleNumber || null,
      topicKeys: details.topicKeys || [],
      topicLabels: details.topicLabels || [],
      contextKey: details.contextKey || null,
      contextLabel: details.contextLabel || null,
      selectedAnswer: details.selectedAnswer ?? null,
      correctAnswer: details.correctAnswer ?? null,
      isCorrect: details.isCorrect === true,
      timedOut: details.timedOut === true,
      answeredAt: details.answeredAt || new Date().toISOString(),
    },
    false
  );
  if (!answer) return null;

  const existingIndex = history.answers.findIndex(
    (item) => item.attemptId === answer.attemptId && item.questionKey === answer.questionKey
  );
  if (existingIndex >= 0) answer.id = history.answers[existingIndex].id;
  if (existingIndex >= 0) history.answers[existingIndex] = answer;
  else history.answers.unshift(answer);
  saveQuizHistory();
  applyQuizReviewOutcome(answer);
  queueQuizHistorySync();
  return answer;
}

function upsertQuizReviewItem(answer, updates) {
  const history = state.quizHistory;
  const existingIndex = history.reviewItems.findIndex((item) => item.questionKey === answer.questionKey);
  const existing = existingIndex >= 0 ? history.reviewItems[existingIndex] : null;
  const timestamp = toIsoTimestamp(answer.answeredAt);
  const originSourceType = answer.sourceType === "review"
    ? existing?.originSourceType
    : answer.sourceType;
  if (!originSourceType) return null;

  const item = sanitizeQuizReviewItem(
    {
      id: existing?.id || createClientUuid(),
      userId: history.ownerId || answer.userId || state.authClient?.user?.id || "",
      questionId: existing?.questionId || answer.questionId || null,
      questionKey: answer.questionKey,
      originSourceType,
      courseId: existing?.courseId || answer.courseId || "general",
      moduleNumber: existing?.moduleNumber || answer.moduleNumber || null,
      topicKeys: existing?.topicKeys?.length ? existing.topicKeys : answer.topicKeys,
      topicLabels: existing?.topicLabels?.length ? existing.topicLabels : answer.topicLabels,
      contextKey: existing?.contextKey || answer.contextKey || null,
      contextLabel: existing?.contextLabel || answer.contextLabel || null,
      stage: updates.stage,
      correctConfirmations: updates.correctConfirmations,
      dueAt: updates.dueAt ?? null,
      lastAnswerCorrect: answer.isCorrect,
      lastAnsweredAt: timestamp,
      masteredAt: updates.masteredAt ?? null,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    },
    false
  );
  if (!item) return null;

  if (existingIndex >= 0) history.reviewItems[existingIndex] = item;
  else history.reviewItems.unshift(item);
  saveQuizHistory();
  queueQuizHistorySync();
  return item;
}

function applyQuizReviewOutcome(answer) {
  const existing = state.quizHistory.reviewItems.find((item) => item.questionKey === answer.questionKey) || null;
  const answeredAtMs = Date.parse(answer.answeredAt);

  if (!answer.isCorrect) {
    upsertQuizReviewItem(answer, {
      stage: "due",
      correctConfirmations: 0,
      dueAt: answer.answeredAt,
      masteredAt: null,
    });
    return;
  }

  if (answer.sourceType !== "review" || !existing) return;

  if (existing.correctConfirmations === 0) {
    upsertQuizReviewItem(answer, {
      stage: "waiting",
      correctConfirmations: 1,
      dueAt: new Date(answeredAtMs + QUIZ_REVIEW_INTERVAL_MS).toISOString(),
      masteredAt: null,
    });
    return;
  }

  const dueAtMs = Date.parse(existing.dueAt || 0);
  if (existing.correctConfirmations === 1 && Number.isFinite(dueAtMs) && answeredAtMs >= dueAtMs) {
    upsertQuizReviewItem(answer, {
      stage: "mastered",
      correctConfirmations: 2,
      dueAt: null,
      masteredAt: answer.answeredAt,
    });
  }
}

function backfillQuizReviewItems() {
  const knownQuestionKeys = new Set(state.quizHistory.reviewItems.map((item) => item.questionKey));
  const latestWrongAnswers = new Map();
  [...state.quizHistory.answers, ...getLegacyModuleQuizAnswerEvents()]
    .sort((left, right) => Date.parse(right.answeredAt) - Date.parse(left.answeredAt))
    .forEach((answer) => {
      if (
        answer.sourceType !== "review" &&
        !answer.isCorrect &&
        !knownQuestionKeys.has(answer.questionKey) &&
        !latestWrongAnswers.has(answer.questionKey)
      ) {
        latestWrongAnswers.set(answer.questionKey, answer);
      }
    });

  latestWrongAnswers.forEach((answer) => {
    upsertQuizReviewItem(answer, {
      stage: "due",
      correctConfirmations: 0,
      dueAt: answer.answeredAt,
      masteredAt: null,
    });
  });
}

function isQuizReviewItemDue(item, now = Date.now()) {
  if (item.stage === "due") return true;
  return item.stage === "waiting" && Number.isFinite(Date.parse(item.dueAt)) && Date.parse(item.dueAt) <= now;
}

function getQuizReviewQueue(now = Date.now()) {
  const due = state.quizHistory.reviewItems
    .filter((item) => isQuizReviewItemDue(item, now))
    .sort((left, right) => Date.parse(left.dueAt || left.lastAnsweredAt) - Date.parse(right.dueAt || right.lastAnsweredAt));
  const waiting = state.quizHistory.reviewItems.filter(
    (item) => item.stage === "waiting" && !isQuizReviewItemDue(item, now)
  );
  const mastered = state.quizHistory.reviewItems.filter((item) => item.stage === "mastered");
  return { due, waiting, mastered };
}

let shouldReturnHomeOnResume = false;

function prepareHomeReturn() {
  shouldReturnHomeOnResume = true;
  saveLocation("home", { historyAction: "none" });
}

function returnHomeOnResume() {
  if (!shouldReturnHomeOnResume) return;
  shouldReturnHomeOnResume = false;
  if (document.body.classList.contains("app-booting") || state.mode === "home") return;
  showHome();
}

function initializeSupabaseConnection() {
  const supabaseApi = window.vaktskolanSupabase;
  if (!supabaseApi?.ready) return;

  supabaseApi.ready
    .then(() => supabaseApi.healthCheck())
    .then((health) => {
      if (!health.ok) {
        console.warn("Supabase API svarade inte som förväntat.", health.data || health);
        return;
      }
      console.info("Supabase API är anslutet.");
    })
    .catch((error) => {
      console.warn("Supabase API kunde inte initieras.", error);
    });
}

function getPlatformRedirectUrl() {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return currentPath && currentPath !== "/" ? currentPath : "/platform";
}

function getLoginUrl() {
  return `/login.html?mode=sign-in&redirect_url=${encodeURIComponent(getPlatformRedirectUrl())}`;
}

function userInitials(name, email) {
  const source = String(name || email || "Elev").trim();
  const parts = source.includes("@") ? source.split("@")[0].split(/[._-]+/) : source.split(/\s+/);
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("sv-SE");
}

function renderAuthenticatedProfile(authClient) {
  const user = authClient?.user;
  if (!user) return;

  const fullName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ");
  const email = user.primaryEmailAddress?.emailAddress || "";
  const displayName = fullName || email || "Inloggad elev";
  state.user = {
    displayName,
    firstName: user.firstName || displayName.split(/\s+/)[0] || "Elev",
  };
  state.authClient = authClient;

  els.profileName.textContent = displayName;
  els.profileRole.textContent = "Elev";
  els.profileAvatar.textContent = userInitials(displayName, email);

  if (els.authUserButton) {
    els.authUserButton.hidden = false;
    els.profileSettingsIcon.hidden = true;
    els.authUserButton.innerHTML = "";
    authClient.mountUserButton(els.authUserButton);
  }
}

function renderPlatformUnavailable(title, message) {
  const bootScreen = document.querySelector("#appBootScreen");
  document.body.classList.add("app-booting", "app-unavailable");
  if (!bootScreen) return;

  bootScreen.setAttribute("role", "alert");
  bootScreen.innerHTML = `
    <div class="app-boot-card is-unavailable">
      <span class="app-boot-mark" aria-hidden="true">
        <img src="/assets/logo/vaktskolan-icon-512.png?v=20260710-zoom-icon" alt="">
      </span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
      <button class="app-boot-retry" type="button">Försök igen</button>
    </div>
  `;
  const retryButton = bootScreen.querySelector(".app-boot-retry");
  retryButton?.addEventListener("click", () => window.location.reload());
  retryButton?.focus();
}

function revealPlatform() {
  document.body.classList.remove("app-booting");
  const bootScreen = document.querySelector("#appBootScreen");
  if (bootScreen) bootScreen.hidden = true;
}

async function requireAuthenticatedUser() {
  const auth = window.vaktskolanAuthProvider;
  if (!auth?.ready) {
    renderPlatformUnavailable(
      "Inloggningen är tillfälligt otillgänglig",
      "Vi kunde inte starta den säkra inloggningen. Ingen kursdata har laddats. Försök igen om en stund."
    );
    return false;
  }

  try {
    const authClient = await auth.ready;
    if (!authClient) {
      if (auth.getConfig?.()?.allowUnauthenticatedPreview === true && IS_LOCAL_DEVELOPMENT) {
        state.authPreview = true;
        console.info("Lokal plattformsförhandsvisning körs utan autentisering.");
        return true;
      }

      throw auth.getError?.() || new Error("Auth kunde inte initieras.");
    }

    if (!authClient.isSignedIn) {
      window.location.replace(getLoginUrl());
      return false;
    }

    renderAuthenticatedProfile(authClient);
    if (typeof authClient.addListener === "function") {
      authClient.addListener(({ user }) => {
        if (!user) window.location.replace(getLoginUrl());
      });
    }
    return true;
  } catch (error) {
    console.error(error);
    renderPlatformUnavailable(
      "Inloggningen är tillfälligt otillgänglig",
      "Vi kunde inte verifiera din session. Ingen kursdata har laddats. Försök igen om en stund."
    );
    return false;
  }
}

function getCourseConfig(courseId = state.courseId) {
  return COURSE_CONFIG[courseId] || COURSE_CONFIG.vu1;
}

function activateCourse(courseId = "vu1") {
  const nextCourseId = COURSE_CONFIG[courseId] ? courseId : "vu1";
  state.courseId = nextCourseId;
  state.modules = state.courses[nextCourseId] || [];
  state.finalExamPool = state.finalExamPools[nextCourseId] || [];
  state.finalExam = state.finalExams[nextCourseId] || null;

  if (!state.modules.length) {
    state.moduleIndex = 0;
    state.lessonIndex = 0;
    state.pageIndex = 0;
    return;
  }

  const moduleIndex = Number(state.moduleIndex);
  state.moduleIndex = Number.isInteger(moduleIndex) ? Math.max(0, Math.min(moduleIndex, state.modules.length - 1)) : 0;

  const module = getCurrentModule();
  const lessonIndex = Number(state.lessonIndex);
  state.lessonIndex = Number.isInteger(lessonIndex) ? Math.max(0, Math.min(lessonIndex, module.lessons.length - 1)) : 0;

  const lesson = getCurrentLesson();
  const pageIndex = Number(state.pageIndex);
  state.pageIndex = Number.isInteger(pageIndex) ? Math.max(0, Math.min(pageIndex, lesson.pages.length - 1)) : 0;
}

function answerKey(moduleIndex = state.moduleIndex, courseId = state.courseId) {
  return `${courseId}:${moduleIndex}`;
}

function getCurrentModule() {
  return state.modules[state.moduleIndex];
}

function getCurrentLesson() {
  const module = getCurrentModule();
  return module?.lessons[state.lessonIndex];
}

function getCurrentPage() {
  const lesson = getCurrentLesson();
  return lesson?.pages[state.pageIndex];
}

function allPages(module) {
  return module.lessons.flatMap((lesson, lessonIndex) =>
    lesson.pages.map((page, pageIndex) => ({ lesson, lessonIndex, page, pageIndex }))
  );
}

function isPageVisited(moduleIndex, lessonIndex, pageIndex) {
  return state.visited.has(pageId(moduleIndex, lessonIndex, pageIndex));
}

function hasVisitedAnyPage(moduleIndex) {
  const module = state.modules[moduleIndex];
  return !!module && allPages(module).some((item) => isPageVisited(moduleIndex, item.lessonIndex, item.pageIndex));
}

function getModuleQuizResult(moduleIndex) {
  const module = state.modules[moduleIndex];
  const questions = Array.isArray(module?.quiz) ? module.quiz : [];
  if (!questions.length) {
    return { submitted: true, correct: 0, total: 0, percent: 100, passed: true, requiredCorrect: 0 };
  }

  const key = answerKey(moduleIndex);
  const answers = isPlainObject(state.answers[key]) ? state.answers[key] : {};
  const submitted = Boolean(state.quizSubmissions[key]);
  const correct = questions.filter((question) => answers[question.number] === question.correct).length;
  const percent = Math.round((correct / questions.length) * 100);
  const requiredCorrect = Math.ceil((questions.length * MODULE_QUIZ_PASS_PERCENT) / 100);
  return {
    submitted,
    correct,
    total: questions.length,
    percent,
    passed: submitted && percent >= MODULE_QUIZ_PASS_PERCENT,
    requiredCorrect,
  };
}

function isFinalExamPassed() {
  return Boolean(state.finalExam?.completedAt && getFinalExamResult().passed);
}

function isModuleComplete(moduleIndex) {
  const module = state.modules[moduleIndex];
  if (!module) return false;
  if (isFinalExamModule(module)) return isFinalExamPassed();

  const pages = allPages(module);
  return (
    pages.length > 0 &&
    pages.every((item) => isPageVisited(moduleIndex, item.lessonIndex, item.pageIndex)) &&
    getModuleQuizResult(moduleIndex).passed
  );
}

function isPremiumMember() {
  return state.membership.tier === "premium";
}

function isModuleIncludedInMembership(courseId, moduleIndex) {
  if (isPremiumMember()) return true;
  return courseId === "vu1" && moduleIndex === 0 && !isFinalExamModule(state.courses[courseId]?.[moduleIndex]);
}

function isModuleMembershipLocked(moduleIndex, courseId = state.courseId) {
  return !isModuleIncludedInMembership(courseId, moduleIndex);
}

function isModuleUnlocked(moduleIndex) {
  if (isModuleMembershipLocked(moduleIndex)) return false;
  if (UNLOCK_MODULE_NAVIGATION) return true;
  if (moduleIndex <= 0) return true;
  return isModuleComplete(moduleIndex - 1);
}

function getFlatPageIndex(module, lessonIndex, pageIndex) {
  return allPages(module).findIndex((item) => item.lessonIndex === lessonIndex && item.pageIndex === pageIndex);
}

function isPageUnlocked(moduleIndex, lessonIndex, pageIndex) {
  const module = state.modules[moduleIndex];
  if (!module || !isModuleUnlocked(moduleIndex)) return false;

  if (isPageVisited(moduleIndex, lessonIndex, pageIndex)) {
    return true;
  }

  const pages = allPages(module);
  const flatIndex = getFlatPageIndex(module, lessonIndex, pageIndex);
  if (flatIndex <= 0) return true;

  const previous = pages[flatIndex - 1];
  return isPageVisited(moduleIndex, previous.lessonIndex, previous.pageIndex);
}

function parseCourses(markdown) {
  const lines = markdown.split(/\r?\n/);
  const courses = { vu1: [], vu2: [] };
  let courseId = "vu1";
  let currentModule = null;
  let currentLesson = null;
  let currentPage = null;
  let inQuiz = false;
  let currentQuestion = null;

  function finishQuestion() {
    if (currentQuestion && currentModule) {
      currentModule.quiz.push(currentQuestion);
    }
    currentQuestion = null;
  }

  function closeSection() {
    finishQuestion();
    currentModule = null;
    currentLesson = null;
    currentPage = null;
    inQuiz = false;
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (/^#\s*Del\s+2:\s*VU2/i.test(line)) {
      closeSection();
      courseId = "vu2";
      continue;
    }

    if (/^##\s*(Materialöversikt|Hela materialet|Kommande moduler)/i.test(line)) {
      closeSection();
      continue;
    }

    const moduleMatch = line.match(/^##\s+(.+)/);
    if (moduleMatch && /Modul\s+\d+/i.test(moduleMatch[1])) {
      finishQuestion();
      currentModule = {
        courseId,
        rawTitle: moduleMatch[1].trim(),
        title: cleanTitle(moduleMatch[1]),
        meta: "",
        objective: "",
        intro: [],
        lessons: [],
        quiz: [],
      };
      courses[courseId].push(currentModule);
      currentLesson = null;
      currentPage = null;
      inQuiz = false;
      continue;
    }

    if (!currentModule) continue;

    if (/^\*Motsvarar/.test(line)) {
      currentModule.meta = line.replace(/^\*/, "").replace(/\*$/, "").trim();
      continue;
    }

    if (/^\*\*Du lär dig:\*\*/.test(line)) {
      currentModule.objective = line.replace(/^\*\*Du lär dig:\*\*\s*/, "").trim();
      continue;
    }

    const lessonMatch = line.match(/^###\s+(.+)/);
    if (lessonMatch) {
      finishQuestion();
      const title = lessonMatch[1].trim();
      inQuiz = /^Quiz/i.test(title);
      currentPage = null;
      currentLesson = null;

      if (!inQuiz) {
        if (currentModule.intro.some((item) => item.trim()) && !currentModule.lessons.length) {
          currentModule.lessons.push({
            title: `${moduleNumber(currentModule)}.1 Översikt`,
            pages: [{ title: "Sida 1: Översikt", body: currentModule.intro }],
          });
          currentModule.intro = [];
        }
        currentLesson = { title, pages: [] };
        currentModule.lessons.push(currentLesson);
      }
      continue;
    }

    if (inQuiz) {
      const questionMatch = line.match(/^\*\*Fråga\s+(\d+)\.\*\*\s*(.+)/);
      const optionMatch = line.match(/^([A-D])\)\s+(.+)/);
      const answerMatch = line.match(/^\*\*Rätt svar:\s*([A-D])\.\*\*\s*(.+)/);

      if (questionMatch) {
        finishQuestion();
        currentQuestion = {
          number: Number(questionMatch[1]),
          question: questionMatch[2].trim(),
          options: [],
          correct: "",
          explanation: "",
        };
      } else if (optionMatch && currentQuestion) {
        currentQuestion.options.push({ letter: optionMatch[1], text: optionMatch[2].trim() });
      } else if (answerMatch && currentQuestion) {
        currentQuestion.correct = answerMatch[1];
        currentQuestion.explanation = answerMatch[2].trim();
      } else if (line && currentQuestion?.explanation) {
        currentQuestion.explanation += ` ${line.trim()}`;
      }
      continue;
    }

    const pageMatch = line.match(/^####\s+(.+)/);
    if (pageMatch && currentLesson) {
      currentPage = { title: pageMatch[1].trim(), body: [] };
      currentLesson.pages.push(currentPage);
      continue;
    }

    if (currentPage) {
      currentPage.body.push(line);
    } else if (!currentLesson && line.trim() && !/^---$/.test(line)) {
      currentModule.intro.push(line);
    }
  }

  finishQuestion();
  return Object.fromEntries(
    Object.entries(courses).map(([id, modules]) => [id, modules.filter((module) => module.lessons.length)])
  );
}

function parseFinalExamBank(modules) {
  const finalModule = modules.find((module) => /sluttest|frågebank/i.test(module.title));
  if (!finalModule) return [];

  const questions = [];
  const bankPages = finalModule.lessons.flatMap((lesson) => lesson.pages);

  function sourceFromTitle(title) {
    const clean = title.replace(/\s*\(\d+\s*frågor\)\s*$/i, "").trim();
    const normalized = clean.replace(/^VU\d+\s*[·.-]?\s*/i, "");
    const match = normalized.match(/^Modul\s+(\d+)\s+[–-]\s+(.+)/i);
    return {
      moduleNumber: match?.[1] || "",
      moduleTitle: match?.[2] || normalized,
      label: match ? moduleSourceLabel(match[1], match[2]) : clean,
    };
  }

  bankPages.forEach((page, pageIndex) => {
    const source = sourceFromTitle(page.title);
    let currentQuestion = null;
    let currentOption = null;

    function finishFinalQuestion() {
      if (!currentQuestion?.question || !currentQuestion.options.length || !currentQuestion.correct) {
        currentQuestion = null;
        currentOption = null;
        return;
      }

      questions.push({
        ...currentQuestion,
        id: `${finalModule.courseId || "course"}-final-bank-${source.moduleNumber || pageIndex}-${currentQuestion.number}-${questions.length}`,
        source: source.label,
        sourceTitle: source.moduleTitle,
        origin: "Slutprov",
      });
      currentQuestion = null;
      currentOption = null;
    }

    page.body.forEach((line) => {
      const trimmed = line.trim();
      const questionMatch = trimmed.match(/^\*\*Fråga\s+(\d+)\.\*\*\s*(.+)/);
      const optionMatch = trimmed.match(/^([A-D])\)\s+(.+)/);
      const answerMatch = trimmed.match(/^\*\*Rätt svar:\s*([A-D])\.\*\*\s*(.*)/);

      if (questionMatch) {
        finishFinalQuestion();
        currentQuestion = {
          number: Number(questionMatch[1]),
          question: questionMatch[2].trim(),
          options: [],
          correct: "",
          explanation: "",
        };
        currentOption = null;
        return;
      }

      if (optionMatch && currentQuestion) {
        currentOption = { letter: optionMatch[1], text: optionMatch[2].trim() };
        currentQuestion.options.push(currentOption);
        return;
      }

      if (answerMatch && currentQuestion) {
        currentQuestion.correct = answerMatch[1];
        currentQuestion.explanation = answerMatch[2].trim();
        currentOption = null;
        return;
      }

      if (!trimmed || !currentQuestion) return;

      if (currentQuestion.explanation) {
        currentQuestion.explanation += ` ${trimmed}`;
      } else if (currentOption) {
        currentOption.text += ` ${trimmed}`;
      } else {
        currentQuestion.question += ` ${trimmed}`;
      }
    });

    finishFinalQuestion();
  });

  return questions;
}

function buildFinalExamPool(modules) {
  const finalBank = parseFinalExamBank(modules);
  const moduleQuizQuestions = modules
    .filter((module) => !/sluttest|frågebank/i.test(module.title))
    .flatMap((module, moduleIndex) =>
      module.quiz.map((question) => ({
        id: `${module.courseId || "course"}-module-${moduleIndex + 1}-quiz-${question.number}`,
        source: moduleSourceLabel(moduleNumber(module), module.title),
        sourceTitle: module.title,
        origin: "Träningsfråga",
        number: question.number,
        question: question.question,
        options: question.options,
        correct: question.correct,
        explanation: question.explanation,
      }))
    );

  const seen = new Set();
  return [...finalBank, ...moduleQuizQuestions].filter((question) => {
    const key = question.question.toLocaleLowerCase("sv-SE").replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return question.options.length >= 2 && question.correct;
  });
}

function renderBlocks(lines) {
  const blocks = [];
  let current = [];

  function pushCurrent() {
    if (current.length) {
      blocks.push(current);
      current = [];
    }
  }

  for (const line of lines) {
    if (!line.trim()) {
      pushCurrent();
    } else {
      current.push(line.trim());
    }
  }
  pushCurrent();

  return blocks
    .map((block) => {
      const first = block[0];
      const rememberMatch = first.match(/^>\s+\*\*Kom ihåg:\*\*\s*(.+)/);
      if (rememberMatch) {
        const text = [rememberMatch[1], ...block.slice(1).map((line) => line.replace(/^>\s?/, ""))]
          .join(" ")
          .trim();
        return `
          <aside class="remember-box">
            <div class="remember-icon"><i data-lucide="lightbulb"></i></div>
            <div><h3>Kom ihåg</h3><p>${inlineMarkdown(text)}</p></div>
          </aside>
        `;
      }

      if (block.every((line) => /^-\s+/.test(line))) {
        return `<ul>${block.map((line) => `<li>${inlineMarkdown(line.replace(/^-\s+/, ""))}</li>`).join("")}</ul>`;
      }

      if (block.every((line) => /^\d+\.\s+/.test(line))) {
        return `<ol>${block.map((line) => `<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
      }

      return `<p>${inlineMarkdown(block.join(" "))}</p>`;
    })
    .join("");
}

function renderModuleList() {
  const course = getCourseConfig();
  const moduleStats = getContentModuleStats();
  const hasFinalExam = state.modules.some((module) => isFinalExamModule(module));
  els.moduleListWrap.hidden = false;
  els.moduleListTitle.textContent = course.moduleListTitle;
  els.moduleCount.textContent = hasFinalExam ? `${moduleStats.total} moduler + slutprov` : `${state.modules.length} aktiva`;
  els.moduleList.innerHTML = state.modules
    .map((module, index) => {
      const progress = getModuleProgress(module, index);
      const complete = isModuleComplete(index);
      const membershipLocked = isModuleMembershipLocked(index);
      const progressionLocked = !membershipLocked && (isFinalExamModule(module) ? !canAccessFinalExam() : !isModuleUnlocked(index));
      const locked = membershipLocked || progressionLocked;
      const progressContent = membershipLocked
        ? '<i data-lucide="lock" aria-hidden="true"></i>'
        : complete
        ? '<i data-lucide="check" aria-hidden="true"></i>'
        : `<span class="module-progress-value">${progress}%</span>`;
      return `
        <button class="module-card ${index === state.moduleIndex ? "is-active" : ""} ${complete ? "is-complete" : ""} ${locked ? "is-locked" : ""} ${membershipLocked ? "is-premium-lock" : ""}"
          type="button" data-module="${index}" ${membershipLocked ? 'data-premium-lock="content" aria-label="Låst Premium-modul. Visa Premium."' : progressionLocked ? 'disabled aria-disabled="true" title="Låses upp när föregående modul är klar"' : ""}>
          <div class="module-card-top">
            <span class="module-number">${moduleNumber(module)}</span>
          </div>
          <span class="module-progress-ring" style="--module-progress-deg: ${progress * 3.6}deg;" aria-label="${locked ? "Låst. " : ""}${progress}% klart">
            ${progressContent}
          </span>
          <h3>${escapeHtml(moduleDisplayTitle(module))}</h3>
          <p>${escapeHtml(moduleMetaSummary(module))}</p>
        </button>
      `;
    })
    .join("");
}

function hideModuleList() {
  els.moduleListWrap.hidden = true;
  els.moduleList.innerHTML = "";
  els.moduleCount.textContent = "";
}

function renderKnowledgeBaseSidebar() {
  els.moduleListWrap.hidden = false;
  els.moduleListTitle.textContent = "Kunskapsbas";
  els.moduleCount.textContent = "";
  const activeTab = state.knowledgeBaseTab === "cv" ? "cv" : "lonekollen";
  els.moduleList.innerHTML = `
    <button class="knowledge-sidebar-item${activeTab === "lonekollen" ? " is-active" : ""}" type="button" data-open-salary-check ${activeTab === "lonekollen" ? 'aria-current="page"' : ""}>
      <i data-lucide="credit-card" aria-hidden="true"></i>
      <span>Lönekollen</span>
    </button>
    <button class="knowledge-sidebar-item${activeTab === "cv" ? " is-active" : ""}" type="button" data-open-cv-builder ${activeTab === "cv" ? 'aria-current="page"' : ""}>
      <i data-lucide="file-text" aria-hidden="true"></i>
      <span>CV-mall</span>
    </button>
  `;
}

function formatSalaryAmount(value) {
  return Math.round(Number(value) || 0).toLocaleString("sv-SE");
}

function salaryStepByKey(key) {
  return SALARY_CHECK_CONFIG.steps.find((step) => step.key === key) || SALARY_CHECK_CONFIG.steps[1];
}

function salaryAmountMarkup(step, options = {}) {
  const suffix = options.suffix || "";
  return `${step.exact ? "" : '<span class="salary-check-approx">ca</span> '}${formatSalaryAmount(step.amount)}${suffix}`;
}

function renderSalaryCheck() {
  if (!els.knowledgeBasePanel) return;

  const [newStep, baseStep, groupB, groupC, groupD, groupE] = SALARY_CHECK_CONFIG.steps;
  const groupMarkup = [
    {
      step: groupB,
      title: "Bevakningstjänst",
      subtitle: "Den vanligaste gruppen för väktare",
      description:
        "Stationär och ronderande bevakning, butik och köpcentrum, reception, bostadsbevakning samt flera typer av kontroll- och tillsynsuppdrag.",
    },
    {
      step: groupC,
      title: "Kvalificerad tjänst",
      subtitle: "Kräver ofta påbyggnadsutbildning",
      description:
        "Här finns bland annat ordningsvakt, skyddsvakt, värdetransport, jourdistriktsväktare och vissa roller i larmcentral.",
    },
    {
      step: groupD,
      title: "Ledning och teknik",
      subtitle: "Arbetsledande eller tekniskt ansvar",
      description: "Omfattar bland annat gruppledare, teknisk utryckningsväktare och operatör i särskilda larmcentraler.",
    },
    {
      step: groupE,
      title: "Specialist",
      subtitle: "Tariffens högsta lönegrupp",
      description: "Kvalificerad gruppledare och personskydd. De faktiska arbetsuppgifterna avgör lönegruppen.",
    },
  ]
    .map(
      ({ step, title, subtitle, description }) => `
        <details class="salary-check-card salary-check-group">
          <summary>
            <span class="salary-check-group-letter" aria-hidden="true">${step.name.slice(-1)}</span>
            <span class="salary-check-group-title">${title}<small>${subtitle}</small></span>
            <span class="salary-check-group-pay salary-check-number">${salaryAmountMarkup(step)}<small> kr/mån</small></span>
            <i data-lucide="chevron-right" aria-hidden="true"></i>
          </summary>
          <p>${description}</p>
        </details>
      `
    )
    .join("");

  const obCards = SALARY_CHECK_CONFIG.ob
    .map(
      (item) => `
        <article class="salary-check-card salary-check-ob-card">
          <div class="salary-check-ob-label"><span class="salary-check-dot is-${item.tone}"></span>${item.label}</div>
          <p class="salary-check-ob-value salary-check-number"><span>ca</span> ${formatSalaryAmount(item.amount)} <small>kr/tim</small></p>
          <p>${item.name}</p>
          <small>${item.schedule}</small>
        </article>
      `
    )
    .join("");

  const stepButtons = SALARY_CHECK_CONFIG.steps
    .map(
      (step) => `
        <button class="salary-check-chip" type="button" data-salary-step="${step.key}"
          aria-pressed="${step.key === salaryCheckState.stepKey}">
          ${step.name} <span>${step.exact ? "" : "ca "}${formatSalaryAmount(step.amount)} kr</span>
        </button>
      `
    )
    .join("");

  const presetButtons = SALARY_CHECK_CONFIG.presets
    .map(
      (preset) => `
        <button class="salary-check-chip" type="button" data-salary-preset="${preset.key}"
          aria-pressed="${preset.key === salaryCheckState.presetKey}">${preset.name}</button>
      `
    )
    .join("");

  const sliderRows = SALARY_CHECK_CONFIG.ob
    .map(
      (item) => `
        <div class="salary-check-slider-row">
          <label for="salary-ob-${item.key}">${item.label} <span>· ${item.name}</span></label>
          <input id="salary-ob-${item.key}" type="range" min="0" max="120" step="2"
            value="${salaryCheckState.hours[item.key]}" data-salary-ob="${item.key}" />
          <output for="salary-ob-${item.key}" data-salary-output="${item.key}">${salaryCheckState.hours[item.key]} h</output>
        </div>
      `
    )
    .join("");

  els.knowledgeBasePanel.innerHTML = `
    <article class="salary-check" aria-labelledby="salaryCheckTitle">
      <header class="salary-check-hero">
        <p class="salary-check-eyebrow"><i data-lucide="wallet-cards" aria-hidden="true"></i> Kunskapsbas</p>
        <div class="salary-check-hero-row">
          <div>
            <h1 id="salaryCheckTitle">Lönekollen – vad tjänar en väktare?</h1>
            <p>Se den aktuella lönetrappan, jämför lönegrupper och räkna på hur OB-timmarna påverkar din bruttolön.</p>
          </div>
          <span class="salary-check-reviewed"><i data-lucide="badge-check" aria-hidden="true"></i> Granskad ${SALARY_CHECK_CONFIG.reviewed}</span>
        </div>
      </header>

      <section class="salary-check-section salary-check-overview" aria-labelledby="salaryOverviewTitle">
        <h2 class="sr-only" id="salaryOverviewTitle">Löneöversikt</h2>
        <div class="salary-check-stats">
          <article class="salary-check-card salary-check-stat">
            <p><span class="salary-check-dot is-blue"></span>Ingångslön 2026</p>
            <strong class="salary-check-number">${formatSalaryAmount(newStep.amount)} <small>kr/mån</small></strong>
            <span>Nyanställd, heltid</span>
          </article>
          <article class="salary-check-card salary-check-stat">
            <p><span class="salary-check-dot is-green"></span>Efter 15 månader</p>
            <strong class="salary-check-number salary-check-range">
              <span class="sr-only">${formatSalaryAmount(groupB.amount)} till cirka ${formatSalaryAmount(groupE.amount)} kronor per månad</span>
              <span aria-hidden="true">${formatSalaryAmount(groupB.amount)}</span>
              <span class="salary-check-range-end" aria-hidden="true"><span>–</span><span class="salary-check-approx">ca</span><span>${formatSalaryAmount(groupE.amount)}</span></span>
            </strong>
            <span>Lönegrupp B–E, kr/mån</span>
          </article>
          <article class="salary-check-card salary-check-stat">
            <p><span class="salary-check-dot is-purple"></span>Medianlön, SCB 2025</p>
            <strong class="salary-check-number">${formatSalaryAmount(SALARY_CHECK_CONFIG.medianSalary)} <small>kr/mån</small></strong>
            <span>Väktare och ordningsvakter</span>
          </article>
        </div>
        <div class="salary-check-card salary-check-cta">
          <div>
            <span>Räkna på ditt schema</span>
            <h2>Lönekalkylatorn</h2>
            <p>Välj lönesteg och lägg till dina OB-timmar för en uppskattning före skatt.</p>
          </div>
          <a href="#salary-calculator" data-salary-calculator-link>Till kalkylatorn <i data-lucide="arrow-down" aria-hidden="true"></i></a>
        </div>
      </section>

      <section class="salary-check-section" aria-labelledby="salaryLadderTitle">
        <div class="salary-check-section-head">
          <h2 id="salaryLadderTitle">Lönetrappan</h2>
          <p>Tariffstegen följer anställningstid och arbetsuppgifter</p>
        </div>
        <div class="salary-check-card salary-check-ladder">
          <article>
            <span class="salary-check-step">1</span>
            <div><h3>Väktare under utbildning <small>· efter VU1</small></h3><p>Under praktisk yrkesträning arbetar du med handledning och får nyanställningslön.</p></div>
            <strong class="salary-check-number">${formatSalaryAmount(newStep.amount)} <small>kr/mån</small></strong>
          </article>
          <article>
            <span class="salary-check-step">2</span>
            <div><h3>Behörig väktare <small>· efter VU2</small></h3><p>VU2 öppnar för självständigt väktararbete. Nyanställningslönen gäller fortfarande till sex månader.</p></div>
            <strong class="salary-check-number">${formatSalaryAmount(newStep.amount)} <small>kr/mån</small></strong>
          </article>
          <article class="is-milestone">
            <span class="salary-check-step">3</span>
            <div><h3>Grundlön <small>· efter sex månaders anställning</small></h3><p>Tariffen höjs till grundlön när anställningstiden är uppnådd.</p><span class="salary-check-gain">+${formatSalaryAmount(baseStep.amount - newStep.amount)} kr/mån sedan start</span></div>
            <strong class="salary-check-number">${formatSalaryAmount(baseStep.amount)} <small>kr/mån</small></strong>
          </article>
          <article class="is-milestone">
            <span class="salary-check-step">4</span>
            <div><h3>Lönegrupp B–E <small>· efter 15 månaders anställning</small></h3><p>Arbetsuppgifterna avgör gruppen. Lokala avtal kan ge mer än tariffens lägstanivå.</p><span class="salary-check-gain">upp till ca +${formatSalaryAmount(groupE.amount - newStep.amount)} kr/mån sedan start</span></div>
            <strong class="salary-check-number salary-check-range salary-check-range--ladder">
              <span class="sr-only">${formatSalaryAmount(groupB.amount)} till cirka ${formatSalaryAmount(groupE.amount)} kronor per månad</span>
              <span aria-hidden="true">${formatSalaryAmount(groupB.amount)}</span>
              <span class="salary-check-range-end" aria-hidden="true"><span>–</span><span class="salary-check-approx">ca</span><span>${formatSalaryAmount(groupE.amount)}</span></span>
              <small aria-hidden="true">kr/mån</small>
            </strong>
          </article>
        </div>
      </section>

      <section class="salary-check-section" aria-labelledby="salaryVuTitle">
        <div class="salary-check-section-head">
          <h2 id="salaryVuTitle">Enbart VU1 – eller VU1 + VU2?</h2>
          <p>Samma ingångslön, men olika behörighet och möjlighet till schema</p>
        </div>
        <div class="salary-check-vu-grid">
          <article class="salary-check-card salary-check-vu-card">
            <div><span class="salary-check-icon"><i data-lucide="book-open" aria-hidden="true"></i></span><span class="salary-check-badge is-neutral">Praktikfas</span></div>
            <h3>Enbart VU1</h3>
            <strong class="salary-check-number">${formatSalaryAmount(newStep.amount)} <small>kr/mån</small></strong>
            <ul><li><i data-lucide="minus" aria-hidden="true"></i>Arbete under handledning i PYT</li><li><i data-lucide="minus" aria-hidden="true"></i>Ofta mer begränsat schema</li><li><i data-lucide="minus" aria-hidden="true"></i>VU2 krävs för full behörighet</li></ul>
          </article>
          <article class="salary-check-card salary-check-vu-card is-complete">
            <div><span class="salary-check-icon"><i data-lucide="shield-check" aria-hidden="true"></i></span><span class="salary-check-badge">Behörig väktare</span></div>
            <h3>VU1 + VU2</h3>
            <strong class="salary-check-number">${formatSalaryAmount(baseStep.amount)} <small>kr/mån efter 6 mån</small></strong>
            <ul><li><i data-lucide="check" aria-hidden="true"></i>Självständigt arbete</li><li><i data-lucide="check" aria-hidden="true"></i>Fler natt- och helgpass kan ge OB</li><li><i data-lucide="check" aria-hidden="true"></i>Grund för vidare påbyggnader</li></ul>
          </article>
        </div>
      </section>

      <section class="salary-check-section" aria-labelledby="salaryGroupsTitle">
        <div class="salary-check-section-head">
          <h2 id="salaryGroupsTitle">Lönegrupperna B–E</h2>
          <p>Öppna en grupp för att se exempel på roller</p>
        </div>
        <div class="salary-check-groups">${groupMarkup}</div>
        <p class="salary-check-note"><i data-lucide="info" aria-hidden="true"></i><span>Grupp D–E är markerade som cirka-belopp eftersom hela 2026 års lönebilaga inte är offentligt publicerad. De har räknats fram från Transports publicerade tariff för 2024 och avtalets revisioner 2025–2026. Kontrollera alltid mot din arbetsgivares aktuella lönebilaga.</span></p>
      </section>

      <section class="salary-check-section" aria-labelledby="salaryObTitle">
        <div class="salary-check-section-head">
          <h2 id="salaryObTitle">OB-tillägg per timme</h2>
          <p>Cirkanivåer som läggs ovanpå grundlönen</p>
        </div>
        <div class="salary-check-ob-grid">${obCards}</div>
        <p class="salary-check-note"><i data-lucide="clock-3" aria-hidden="true"></i><span>OB-beloppen är avrundade uppskattningar för avtalsåret 2026. Exakta tider och belopp styrs av avtalet och din lönebilaga.</span></p>
      </section>

      <section class="salary-check-section" id="salary-calculator" aria-labelledby="salaryCalculatorTitle">
        <div class="salary-check-section-head">
          <h2 id="salaryCalculatorTitle">Lönekalkylatorn</h2>
          <p>Uppskattad bruttolön utifrån lönesteg och OB-timmar</p>
        </div>
        <div class="salary-check-card salary-check-calculator">
          <form class="salary-check-form" onsubmit="return false">
            <fieldset><legend>1 · Var är du i lönetrappan?</legend><div class="salary-check-chips" role="group" aria-label="Välj lönesteg">${stepButtons}</div></fieldset>
            <fieldset><legend>2 · Snabbval av schema</legend><div class="salary-check-chips" role="group" aria-label="Välj schemamall">${presetButtons}</div></fieldset>
            <fieldset><legend>3 · Finjustera OB-timmar per månad</legend><div class="salary-check-sliders">${sliderRows}</div></fieldset>
          </form>
          <aside class="salary-check-result" aria-live="polite" aria-atomic="true">
            <p>Uppskattad bruttolön / månad</p>
            <strong class="salary-check-number"><span data-salary-total>0</span> <small>kr</small></strong>
            <span class="salary-check-hourly">≈ <span data-salary-hourly>0</span> kr/tim som timavlönad</span>
            <div class="salary-check-breakdown" data-salary-breakdown></div>
            <p class="salary-check-warning" data-salary-warning hidden></p>
            <small>Uppskattning före skatt, heltid. Semesterersättning, övertid, branschvana, hundtillägg och lokala påslag ingår inte.</small>
          </aside>
        </div>
      </section>

      <section class="salary-check-section" aria-labelledby="salaryCareerTitle">
        <div class="salary-check-section-head"><h2 id="salaryCareerTitle">Fyra vägar vidare</h2><p>Påbyggnader efter VU1 och VU2</p></div>
        <div class="salary-check-career-grid">
          <article class="salary-check-card"><span class="salary-check-icon"><i data-lucide="shield" aria-hidden="true"></i></span><h3>Skyddsvakt</h3><p>Bevakning av skyddsobjekt som kärnkraft, flygplatser och myndigheter.</p><strong>Lönegrupp C</strong></article>
          <article class="salary-check-card"><span class="salary-check-icon"><i data-lucide="paw-print" aria-hidden="true"></i></span><h3>Hundförare</h3><p>Rondering med tjänstehund kan ge timtillägg och hundvårdsersättning.</p><strong>Särskilda tillägg</strong></article>
          <article class="salary-check-card"><span class="salary-check-icon"><i data-lucide="users" aria-hidden="true"></i></span><h3>Gruppledare</h3><p>Arbetsledning, bemanning och beslut på objektet.</p><strong>Lönegrupp D–E</strong></article>
          <article class="salary-check-card"><span class="salary-check-icon"><i data-lucide="badge" aria-hidden="true"></i></span><h3>Ordningsvakt</h3><p>Utökade befogenheter efter utbildning och förordnande av Polismyndigheten.</p><strong>Lönegrupp C</strong></article>
        </div>
      </section>

      <section class="salary-check-section" aria-labelledby="salaryFaqTitle">
        <div class="salary-check-section-head"><h2 id="salaryFaqTitle">Vanliga frågor</h2></div>
        <div class="salary-check-card salary-check-faq">
          <details><summary>Tjänar jag mindre med enbart VU1?</summary><p>Tariffens nyanställningslön är densamma, men med enbart VU1 arbetar du i praktisk yrkesträning under handledning. Ett mer begränsat schema kan därför innebära mindre OB.</p></details>
          <details><summary>Höjs lönen automatiskt?</summary><p>Tariffstegen följer anställningstid. Vilken grupp B–E du tillhör avgörs däremot av dina faktiska arbetsuppgifter, och lokala överenskommelser kan ge högre lön.</p></details>
          <details><summary>Gäller kalkylatorn även deltid och behovsanställning?</summary><p>Den räknar på hel månadslön och visar en ungefärlig timlön med divisorn 166. Använd din faktiska timlön och lönebilaga när du kontrollerar en utbetalning.</p></details>
          <details><summary>Varför är SCB:s median högre än tariffen?</summary><p>Tariffen är en lägstanivå. Faktisk lön kan även innehålla OB, erfarenhetstillägg, högre lönegrupp och lokala påslag.</p></details>
          <details><summary>Vad är branschvanetillägget?</summary><p>Efter minst fem års branscherfarenhet kan ett särskilt erfarenhetstillägg gälla enligt avtalet. Kontrollera att erfarenheten finns med i arbetsgivarens underlag och på lönespecifikationen.</p></details>
          <details><summary>Gäller nivåerna utan kollektivavtal?</summary><p>Nej. Bevaknings- och säkerhetsavtalets tariff gäller arbetsgivare som är bundna av avtalet. Kontrollera alltid vilket kollektivavtal som står i ditt anställningsavtal.</p></details>
        </div>
      </section>

      <section class="salary-check-section salary-check-sources" aria-labelledby="salarySourcesTitle">
        <div class="salary-check-section-head"><h2 id="salarySourcesTitle">Källor och giltighet</h2><p>Granskad ${SALARY_CHECK_CONFIG.reviewed}</p></div>
        <div class="salary-check-card">
          <ul>
            <li><a href="https://www.transport.se/publicerat/avtal-klart-bevaknings-och-sakerhetsavtalet-2025" target="_blank" rel="noopener noreferrer">Transport: Bevaknings- och säkerhetsavtalet 2025–2027</a></li>
            <li><a href="https://www.transportarbetaren.se/app/uploads/2025/11/tran-09-2025.pdf" target="_blank" rel="noopener noreferrer">Transportarbetaren: publicerade tarifflöner för 2026</a></li>
            <li><a href="https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__AM__AM0110__AM0110A/LoneSpridSektYrk4AN/" target="_blank" rel="noopener noreferrer">SCB: lönespridning efter yrke</a></li>
            <li><a href="https://www.bya.se/kurstyp/vaktargrundutbildning-vu1-2/" target="_blank" rel="noopener noreferrer">BYA: VU1 och praktisk yrkesträning</a></li>
          </ul>
          <p class="salary-check-source-meta">Avtalsperiod: ${SALARY_CHECK_CONFIG.agreementPeriod}. Lönebelopp och OB-tillägg gäller som vägledning för avtalsåret 2026; grupp D–E och OB-belopp är markerade som uppskattningar där offentlig lönebilaga saknas.</p>
          <p><strong>Viktigt:</strong> Lönekollen är ett kunskapsstöd och inte ett lönebesked. Din anställningsform, lönegrupp, arbetade tider och lokala avtal avgör utfallet. Vid skillnader gäller kollektivavtalets lönebilaga och din lönespecifikation.</p>
        </div>
      </section>
    </article>
  `;

  updateSalaryCalculator();
}

function updateSalaryCalculator() {
  if (!els.knowledgeBasePanel || state.mode !== "knowledge-base") return;

  const step = salaryStepByKey(salaryCheckState.stepKey);
  let obTotal = 0;
  let totalHours = 0;
  const rows = [];

  SALARY_CHECK_CONFIG.ob.forEach((item) => {
    const hours = Math.max(0, Number(salaryCheckState.hours[item.key]) || 0);
    const amount = hours * item.amount;
    totalHours += hours;
    obTotal += amount;

    const input = els.knowledgeBasePanel.querySelector(`[data-salary-ob="${item.key}"]`);
    const output = els.knowledgeBasePanel.querySelector(`[data-salary-output="${item.key}"]`);
    if (input && Number(input.value) !== hours) input.value = String(hours);
    if (output) output.textContent = `${hours} h`;
    if (hours > 0) rows.push(`<div><span>${item.label} · ${hours} h</span><strong>+ ${formatSalaryAmount(amount)} kr</strong></div>`);
  });

  els.knowledgeBasePanel.querySelectorAll("[data-salary-step]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.salaryStep === salaryCheckState.stepKey));
  });
  els.knowledgeBasePanel.querySelectorAll("[data-salary-preset]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.salaryPreset === salaryCheckState.presetKey));
  });

  const total = step.amount + obTotal;
  const totalElement = els.knowledgeBasePanel.querySelector("[data-salary-total]");
  const hourlyElement = els.knowledgeBasePanel.querySelector("[data-salary-hourly]");
  const breakdownElement = els.knowledgeBasePanel.querySelector("[data-salary-breakdown]");
  const warningElement = els.knowledgeBasePanel.querySelector("[data-salary-warning]");
  if (totalElement) totalElement.textContent = `${step.exact ? "" : "ca "}${formatSalaryAmount(total)}`;
  if (hourlyElement) hourlyElement.textContent = `${step.exact ? "" : "ca "}${formatSalaryAmount(step.amount / SALARY_CHECK_CONFIG.hourlyDivisor)}`;
  if (breakdownElement) {
    breakdownElement.innerHTML = `
      <div><span>${step.name}</span><strong>${step.exact ? "" : "ca "}${formatSalaryAmount(step.amount)} kr</strong></div>
      ${rows.join("")}
      ${obTotal > 0 ? `<div class="is-total"><span>OB totalt</span><strong>+ ${formatSalaryAmount(obTotal)} kr</strong></div>` : ""}
    `;
  }
  if (warningElement) {
    warningElement.hidden = totalHours <= SALARY_CHECK_CONFIG.hourlyDivisor;
    warningElement.textContent =
      totalHours > SALARY_CHECK_CONFIG.hourlyDivisor
        ? `Kontrollera timmarna: du har angett ${totalHours} OB-timmar, vilket överstiger kalkylens heltidsmått på ${SALARY_CHECK_CONFIG.hourlyDivisor} timmar.`
        : "";
  }
}

function renderKnowledgeBasePanel() {
  if (state.knowledgeBaseTab === "cv") renderCvBuilder();
  else renderSalaryCheck();
}

const CV_BUILDER_TEXT_FIELDS = [
  "fullname",
  "title",
  "email",
  "phone",
  "location",
  "birthYear",
  "korkort",
  "ovrigt",
  "summary",
  "skills",
  "languages",
];
const CV_BUILDER_CHECK_FIELDS = ["vu1", "vu2", "lansstyrelsen", "belastning"];

let cvBuilderIdCounter = 0;

function createCvItemId() {
  cvBuilderIdCounter += 1;
  return `cv-${Date.now()}-${cvBuilderIdCounter}`;
}

function normalizeCvBuilderState(value) {
  const base = { experiences: [], educations: [] };
  base.photo =
    isPlainObject(value) && typeof value.photo === "string" && value.photo.startsWith("data:image/")
      ? value.photo
      : "";
  CV_BUILDER_TEXT_FIELDS.forEach((key) => {
    base[key] = isPlainObject(value) && typeof value[key] === "string" ? value[key] : "";
  });
  CV_BUILDER_CHECK_FIELDS.forEach((key) => {
    base[key] = Boolean(isPlainObject(value) && value[key]);
  });
  if (isPlainObject(value) && Array.isArray(value.experiences)) {
    base.experiences = value.experiences.filter(isPlainObject).map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : createCvItemId(),
      company: typeof item.company === "string" ? item.company : "",
      role: typeof item.role === "string" ? item.role : "",
      date: typeof item.date === "string" ? item.date : "",
      desc: typeof item.desc === "string" ? item.desc : "",
    }));
  }
  if (isPlainObject(value) && Array.isArray(value.educations)) {
    base.educations = value.educations.filter(isPlainObject).map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : createCvItemId(),
      school: typeof item.school === "string" ? item.school : "",
      title: typeof item.title === "string" ? item.title : "",
      date: typeof item.date === "string" ? item.date : "",
    }));
  }
  return base;
}

const cvBuilderHadSavedState = readStorage(STORAGE_KEYS.cvBuilder, null) !== null;
let cvBuilderState = normalizeCvBuilderState(readObjectStorage(STORAGE_KEYS.cvBuilder));
// Första besöket: ingen sparad data ännu. Förifyll ett exempel-CV så förhandsvisningen
// ser komplett ut, och låt "Rensa"-knappen pulsera som en diskret hint.
let cvBuilderHintActive = !cvBuilderHadSavedState;
if (cvBuilderHintActive) {
  cvBuilderState = normalizeCvBuilderState(cvSampleData());
}

function saveCvBuilderState() {
  writeStorage(STORAGE_KEYS.cvBuilder, cvBuilderState);
}

function dismissCvBuilderHint() {
  if (!cvBuilderHintActive) return;
  cvBuilderHintActive = false;
  els.knowledgeBasePanel
    ?.querySelector('[data-cv-action="reset"]')
    ?.classList.remove("is-hinting");
}

function cvSampleData() {
  return {
    fullname: "Kevin Sjöberg",
    title: "Auktoriserad Väktare / Rondväktare",
    email: "kevin.sjoberg@vaktskolan.se",
    phone: "070-812 34 56",
    location: "Stockholm",
    birthYear: String(new Date().getFullYear() - 29),
    vu1: true,
    vu2: true,
    lansstyrelsen: true,
    belastning: true,
    korkort: "B-Körkort (Manuell)",
    ovrigt: "HLR & Hjärtstartare",
    summary:
      "Diplomerad och auktoriserad väktare utbildad via Vaktskolan. Har god erfarenhet av passerkontroller, ronderande bevakning och kundbemötande. Stresstålig, punktlig och med utpräglad förmåga att bevara lugnet i konfliktsituationer.",
    skills: "Konflikthantering, Deeskalering, Rondering, Larmhantering, Passerkontroll, HLR, Hög Säkerhetsmedvetenhet",
    languages: "Svenska (Modersmål), Engelska (Flytande)",
    experiences: [
      {
        id: createCvItemId(),
        company: "Avarn Security",
        role: "Rond- och Störningsbevakare",
        date: "2023 - Pågående",
        desc: "Ansvarig för nattlig rondbevakning av kommersiella fastigheter. Larmryck, förebyggande brand- och säkerhetskontroller samt upprättande av incidentrapporter.",
      },
      {
        id: createCvItemId(),
        company: "Retail Security AB",
        role: "Butikskontrollant / Entrévärd",
        date: "2021 - 2023",
        desc: "Förebyggande av tillgrepp, kundtjänst i entremiljö samt samverkan med polis och centrumledning.",
      },
    ],
    educations: [
      {
        id: createCvItemId(),
        school: "Vaktskolan.se",
        title: "VU1 & VU2 (Väktargrundutbildning Del 1 & 2)",
        date: "2023",
      },
      {
        id: createCvItemId(),
        school: "Röda Korset",
        title: "Första Hjälpen & HLR-Certifikat",
        date: "2023",
      },
    ],
  };
}

function isCompactCvViewport() {
  return window.matchMedia(CV_BUILDER_COMPACT_QUERY).matches;
}

function cvTextInputMarkup(field, label, placeholder, options = {}) {
  const value = escapeHtml(cvBuilderState[field] || "");
  const type = options.type || "text";
  return `
    <div class="cv-field${options.wide ? " is-wide" : ""}">
      <label for="cv-input-${field}">${label}</label>
      <input class="cv-input" id="cv-input-${field}" type="${type}" data-cv-field="${field}" value="${value}" placeholder="${placeholder}">
    </div>
  `;
}

function cvCheckboxMarkup(field, label) {
  return `
    <label class="cv-check">
      <input type="checkbox" data-cv-field="${field}" ${cvBuilderState[field] ? "checked" : ""}>
      <span>${label}</span>
    </label>
  `;
}

function cvAgeFromBirthYear(birthYear) {
  const year = Number.parseInt(birthYear, 10);
  if (!Number.isFinite(year)) return null;
  const age = new Date().getFullYear() - year;
  return age >= 0 && age <= 120 ? age : null;
}

function cvBirthYearMarkup() {
  const currentYear = new Date().getFullYear();
  const selected = cvBuilderState.birthYear || "";
  let options = '<option value="">Välj födelseår</option>';
  for (let year = currentYear - 16; year >= currentYear - 80; year -= 1) {
    const age = currentYear - year;
    options += `<option value="${year}"${String(year) === selected ? " selected" : ""}>${year} · ${age} år</option>`;
  }
  return `
    <div class="cv-field">
      <label for="cv-input-birthYear">Ålder</label>
      <select class="cv-input" id="cv-input-birthYear" data-cv-field="birthYear">${options}</select>
    </div>
  `;
}

function renderCvBuilder() {
  if (!els.knowledgeBasePanel) return;

  if (isCompactCvViewport()) {
    els.knowledgeBasePanel.innerHTML = `
      <article class="cv-builder" aria-labelledby="cvBuilderTitle">
        <div class="cv-mobile-notice">
          <span class="cv-mobile-notice-icon"><i data-lucide="monitor" aria-hidden="true"></i></span>
          <h1 id="cvBuilderTitle">Öppna CV-mallen på en dator</h1>
          <p>CV-skaparen är byggd för större skärmar så att du kan fylla i dina uppgifter och se förhandsgranskningen sida vid sida. Logga in från en dator för att skapa och spara ditt CV som PDF.</p>
          <button class="cv-toolbar-button is-primary" type="button" data-open-salary-check>Till Lönekollen</button>
        </div>
      </article>
    `;
    return;
  }

  els.knowledgeBasePanel.innerHTML = `
    <article class="cv-builder" aria-labelledby="cvBuilderTitle">
      <header class="salary-check-hero cv-builder-hero">
        <p class="salary-check-eyebrow"><i data-lucide="file-text" aria-hidden="true"></i> Kunskapsbas</p>
        <div class="salary-check-hero-row">
          <div>
            <h1 id="cvBuilderTitle">CV-mall – skapa ditt väktar-CV</h1>
            <p>Fyll i dina uppgifter och se ditt CV växa fram i realtid. Spara som PDF när du är klar.</p>
          </div>
          <div class="cv-builder-actions no-print">
            <button class="cv-toolbar-button" type="button" data-cv-action="sample">
              <i data-lucide="zap" aria-hidden="true"></i> Fyll med exempel
            </button>
            <button class="cv-toolbar-button is-ghost${cvBuilderHintActive ? " is-hinting" : ""}" type="button" data-cv-action="reset">Rensa</button>
            <button class="cv-toolbar-button is-primary" type="button" data-cv-action="print">
              <i data-lucide="printer" aria-hidden="true"></i> Spara PDF / Skriv ut
            </button>
          </div>
        </div>
      </header>

      <div class="cv-builder-grid">
        <div class="cv-builder-form no-print">
          <div class="cv-form-tip">
            <i data-lucide="info" aria-hidden="true"></i>
            <p><strong>Väktartips:</strong> Rekryterare inom bevakning tittar först på dina godkännanden (VU1/VU2), körkort och Länsstyrelsens godkännande. Se till att kryssa i dessa nedan!</p>
          </div>

          <section class="cv-form-card">
            <h2><i data-lucide="user" aria-hidden="true"></i> Personuppgifter</h2>
            <div class="cv-photo-field">
              <div class="cv-photo-thumb${cvBuilderState.photo ? " has-photo" : ""}" id="cvPhotoThumb">
                ${cvBuilderState.photo
                  ? `<img src="${cvBuilderState.photo}" alt="Förhandsvisning av profilbild">`
                  : '<i data-lucide="user-round" aria-hidden="true"></i>'}
              </div>
              <div class="cv-photo-actions">
                <span class="cv-photo-label">Profilbild</span>
                <div class="cv-photo-buttons">
                  <button class="cv-photo-button" type="button" data-cv-action="upload-photo">
                    <i data-lucide="upload" aria-hidden="true"></i> ${cvBuilderState.photo ? "Byt bild" : "Ladda upp bild"}
                  </button>
                  ${cvBuilderState.photo ? '<button class="cv-photo-button is-remove" type="button" data-cv-action="remove-photo">Ta bort</button>' : ""}
                </div>
                <p class="cv-photo-hint">JPG eller PNG. Bilden beskärs automatiskt till en kvadrat.</p>
              </div>
              <input type="file" id="cvPhotoInput" accept="image/png, image/jpeg, image/webp" hidden>
            </div>
            <div class="cv-form-grid">
              ${cvTextInputMarkup("fullname", "Namn *", "t.ex. Kevin Sjöberg")}
              ${cvTextInputMarkup("title", "Yrkesroll / Titel", "t.ex. Auktoriserad Väktare")}
              ${cvTextInputMarkup("email", "E-post *", "kevin@exempel.se", { type: "email" })}
              ${cvTextInputMarkup("phone", "Telefon *", "070-123 45 67")}
              ${cvTextInputMarkup("location", "Ort / Stad", "t.ex. Stockholm")}
              ${cvBirthYearMarkup()}
            </div>
          </section>

          <section class="cv-form-card is-highlight">
            <h2>
              <i data-lucide="shield-check" aria-hidden="true"></i> Säkerhetsmeriter &amp; Licenser
              <span class="cv-form-card-flag">Viktigast</span>
            </h2>
            <div class="cv-check-list">
              ${cvCheckboxMarkup("vu1", "VU1 (Väktargrundutbildning del 1)")}
              ${cvCheckboxMarkup("vu2", "VU2 (Väktargrundutbildning del 2)")}
              ${cvCheckboxMarkup("lansstyrelsen", "Godkänd av Länsstyrelsen")}
              ${cvCheckboxMarkup("belastning", "Utdrag ur Belastningsregistret utan anmärkning")}
            </div>
            <div class="cv-form-grid cv-form-grid-divider">
              ${cvTextInputMarkup("korkort", "Körkort behörighet", "t.ex. B-Körkort (Manuell)")}
              ${cvTextInputMarkup("ovrigt", "Övriga förordnanden", "t.ex. Skyddsvakt, HLR")}
            </div>
          </section>

          <section class="cv-form-card">
            <h2><i data-lucide="pen-line" aria-hidden="true"></i> Profil / Om mig</h2>
            <textarea class="cv-input" rows="4" data-cv-field="summary" placeholder="Beskriv kort varför du passar som väktare, dina personliga egenskaper och dina mål...">${escapeHtml(cvBuilderState.summary)}</textarea>
          </section>

          <section class="cv-form-card">
            <h2>
              <i data-lucide="briefcase" aria-hidden="true"></i> Arbetslivserfarenhet
              <button class="cv-add-button" type="button" data-cv-action="add-experience">+ Lägg till</button>
            </h2>
            <div class="cv-item-list" id="cvExperienceForms"></div>
          </section>

          <section class="cv-form-card">
            <h2>
              <i data-lucide="graduation-cap" aria-hidden="true"></i> Utbildningar &amp; Kurser
              <button class="cv-add-button" type="button" data-cv-action="add-education">+ Lägg till</button>
            </h2>
            <div class="cv-item-list" id="cvEducationForms"></div>
          </section>

          <section class="cv-form-card">
            <h2><i data-lucide="badge-check" aria-hidden="true"></i> Egenskaper &amp; Språk</h2>
            <div class="cv-form-grid">
              ${cvTextInputMarkup("skills", "Egenskaper & kompetenser (kommaseparerade)", "Stresstålig, Konflikthantering, HLR, Passerkontroll", { wide: true })}
              ${cvTextInputMarkup("languages", "Språkkunskaper", "Svenska (Modersmål), Engelska (Flytande)", { wide: true })}
            </div>
          </section>
        </div>

        <div class="cv-builder-preview">
          <div class="cv-preview-page" id="cvPreviewPage">
            <div class="cv-preview-accent" aria-hidden="true"></div>
            <div class="cv-preview-body">
              <div class="cv-preview-header">
                <div class="cv-preview-header-row">
                  <div>
                    <h1 id="cvPreviewName">Ditt Namn</h1>
                    <p class="cv-preview-role" id="cvPreviewTitle">Auktoriserad Väktare</p>
                  </div>
                  <button type="button" class="cv-preview-photo${cvBuilderState.photo ? " has-photo" : ""}" id="cvPreviewPhoto" data-cv-action="upload-photo" aria-label="Ladda upp profilbild">
                    ${cvBuilderState.photo
                      ? `<img src="${cvBuilderState.photo}" alt="Profilbild">`
                      : '<span class="cv-preview-photo-placeholder"><i data-lucide="user-round" aria-hidden="true"></i><small>Lägg till foto</small></span>'}
                  </button>
                </div>
                <div class="cv-preview-contact">
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><span id="cvPreviewEmail">epost@exempel.se</span></span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><span id="cvPreviewPhone">070-000 00 00</span></span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span id="cvPreviewLocation">Ort</span></span>
                  <span id="cvPreviewAgeContainer" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span id="cvPreviewAge"></span></span>
                </div>
              </div>

              <div class="cv-preview-security">
                <h3>Säkerhetsgodkännanden &amp; Licenser</h3>
                <div class="cv-preview-badges" id="cvPreviewQualifications"></div>
              </div>

              <section class="cv-preview-section">
                <h2>Om Mig</h2>
                <p id="cvPreviewSummary"></p>
              </section>

              <section class="cv-preview-section">
                <h2>Arbetslivserfarenhet</h2>
                <div class="cv-preview-list" id="cvPreviewExperience"></div>
              </section>

              <section class="cv-preview-section">
                <h2>Utbildning &amp; Certifikat</h2>
                <div class="cv-preview-list is-compact" id="cvPreviewEducation"></div>
              </section>

              <div class="cv-preview-columns">
                <section class="cv-preview-section">
                  <h2>Egenskaper</h2>
                  <div class="cv-preview-tags" id="cvPreviewSkills"></div>
                </section>
                <section class="cv-preview-section">
                  <h2>Språk</h2>
                  <p id="cvPreviewLanguages">Svenska</p>
                </section>
              </div>
            </div>

            <div class="cv-preview-footer">
              <span>CV skapat via Vaktskolan.se – Utbildningsplattform för Väktare</span>
              <span>Referenser lämnas på begäran</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;

  renderCvExperienceForms();
  renderCvEducationForms();
  updateCvPreview();
}

function renderCvExperienceForms() {
  const container = els.knowledgeBasePanel?.querySelector("#cvExperienceForms");
  if (!container) return;
  if (!cvBuilderState.experiences.length) {
    container.innerHTML = '<p class="cv-item-empty">Inga anställningar tillagda ännu. Klicka på ”+ Lägg till”.</p>';
    return;
  }
  container.innerHTML = cvBuilderState.experiences
    .map(
      (exp) => `
        <div class="cv-item-card">
          <button class="cv-item-remove" type="button" data-cv-remove-experience="${exp.id}" aria-label="Ta bort anställning">✕</button>
          <div class="cv-item-grid">
            <input class="cv-input" type="text" placeholder="Företag / Arbetsgivare" value="${escapeHtml(exp.company)}" data-cv-exp-id="${exp.id}" data-cv-exp-field="company">
            <input class="cv-input" type="text" placeholder="Titel / Roll" value="${escapeHtml(exp.role)}" data-cv-exp-id="${exp.id}" data-cv-exp-field="role">
          </div>
          <input class="cv-input" type="text" placeholder="Tidsperiod (t.ex. 2022 - Pågående)" value="${escapeHtml(exp.date)}" data-cv-exp-id="${exp.id}" data-cv-exp-field="date">
          <textarea class="cv-input" rows="2" placeholder="Beskrivning av arbetsuppgifter..." data-cv-exp-id="${exp.id}" data-cv-exp-field="desc">${escapeHtml(exp.desc)}</textarea>
        </div>
      `
    )
    .join("");
}

function renderCvEducationForms() {
  const container = els.knowledgeBasePanel?.querySelector("#cvEducationForms");
  if (!container) return;
  if (!cvBuilderState.educations.length) {
    container.innerHTML = '<p class="cv-item-empty">Inga utbildningar tillagda ännu. Klicka på ”+ Lägg till”.</p>';
    return;
  }
  container.innerHTML = cvBuilderState.educations
    .map(
      (edu) => `
        <div class="cv-item-card">
          <button class="cv-item-remove" type="button" data-cv-remove-education="${edu.id}" aria-label="Ta bort utbildning">✕</button>
          <div class="cv-item-grid">
            <input class="cv-input" type="text" placeholder="Skola / Arrangör" value="${escapeHtml(edu.school)}" data-cv-edu-id="${edu.id}" data-cv-edu-field="school">
            <input class="cv-input" type="text" placeholder="Utbildning / Kurs" value="${escapeHtml(edu.title)}" data-cv-edu-id="${edu.id}" data-cv-edu-field="title">
          </div>
          <input class="cv-input" type="text" placeholder="År / Datum" value="${escapeHtml(edu.date)}" data-cv-edu-id="${edu.id}" data-cv-edu-field="date">
        </div>
      `
    )
    .join("");
}

const CV_CHECK_ICON =
  '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>';
const CV_CROSS_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12"/></svg>';
const CV_CARD_ICON =
  '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zm1 2h6v1H7V4zm8 3H5v9h10V7z" clip-rule="evenodd"/></svg>';

function cvStandardBadge(label, active) {
  return `
    <div class="cv-badge ${active ? "is-on" : "is-off"}">
      ${active ? CV_CHECK_ICON : CV_CROSS_ICON}
      <span>${label}</span>
    </div>
  `;
}

function cvCustomBadge(label) {
  return `
    <div class="cv-badge is-custom">
      ${CV_CARD_ICON}
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function updateCvPreview() {
  const panel = els.knowledgeBasePanel;
  if (!panel || state.mode !== "knowledge-base" || state.knowledgeBaseTab !== "cv") return;
  const byId = (id) => panel.querySelector(`#${id}`);
  if (!byId("cvPreviewPage")) return;

  const setText = (id, value, fallback) => {
    const element = byId(id);
    if (element) element.textContent = value || fallback;
  };

  setText("cvPreviewName", cvBuilderState.fullname, "Ditt Namn");
  setText("cvPreviewTitle", cvBuilderState.title, "Auktoriserad Väktare");
  setText("cvPreviewEmail", cvBuilderState.email, "epost@exempel.se");
  setText("cvPreviewPhone", cvBuilderState.phone, "070-000 00 00");
  setText("cvPreviewLocation", cvBuilderState.location, "Ort");

  const age = cvAgeFromBirthYear(cvBuilderState.birthYear);
  const ageContainer = byId("cvPreviewAgeContainer");
  if (ageContainer) {
    ageContainer.hidden = age === null;
    if (age !== null) setText("cvPreviewAge", `${age} år`);
  }

  setText(
    "cvPreviewSummary",
    cvBuilderState.summary,
    "Skriv en kort sammanfattning om din bakgrund och dina ambitioner..."
  );
  setText("cvPreviewLanguages", cvBuilderState.languages, "Svenska");

  const qualifications = byId("cvPreviewQualifications");
  if (qualifications) {
    let badges =
      cvStandardBadge("VU1 (Grundutbildning 1)", cvBuilderState.vu1) +
      cvStandardBadge("VU2 (Grundutbildning 2)", cvBuilderState.vu2) +
      cvStandardBadge("Länsstyrelsen Godkänd", cvBuilderState.lansstyrelsen) +
      cvStandardBadge("Belastningsregister U.A.", cvBuilderState.belastning);
    if (cvBuilderState.korkort.trim()) badges += cvCustomBadge(cvBuilderState.korkort.trim());
    if (cvBuilderState.ovrigt.trim()) badges += cvCustomBadge(cvBuilderState.ovrigt.trim());
    qualifications.innerHTML = badges;
  }

  const experienceList = byId("cvPreviewExperience");
  if (experienceList) {
    experienceList.innerHTML = cvBuilderState.experiences.length
      ? cvBuilderState.experiences
          .map(
            (exp) => `
              <div class="cv-preview-item">
                <div class="cv-preview-item-head">
                  <h3>${escapeHtml(exp.role) || "Titel"} <span>| ${escapeHtml(exp.company) || "Företag"}</span></h3>
                  <span class="cv-preview-item-date">${escapeHtml(exp.date)}</span>
                </div>
                ${exp.desc ? `<p>${escapeHtml(exp.desc)}</p>` : ""}
              </div>
            `
          )
          .join("")
      : '<p class="cv-preview-empty">Ingen erfarenhet tillagd ännu.</p>';
  }

  const educationList = byId("cvPreviewEducation");
  if (educationList) {
    educationList.innerHTML = cvBuilderState.educations.length
      ? cvBuilderState.educations
          .map(
            (edu) => `
              <div class="cv-preview-item is-row">
                <p><strong>${escapeHtml(edu.title) || "Utbildning"}</strong> <span>– ${escapeHtml(edu.school) || "Skola/Anordnare"}</span></p>
                <span class="cv-preview-item-date">${escapeHtml(edu.date)}</span>
              </div>
            `
          )
          .join("")
      : '<p class="cv-preview-empty">Ingen utbildning tillagd ännu.</p>';
  }

  const skillsTags = byId("cvPreviewSkills");
  if (skillsTags) {
    const tags = cvBuilderState.skills
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    skillsTags.innerHTML = tags.length
      ? tags.map((tag) => `<span class="cv-tag">${escapeHtml(tag)}</span>`).join("")
      : '<span class="cv-preview-empty">Inga egenskaper angivna</span>';
  }
}

function handleCvBuilderFieldInput(event) {
  if (state.mode !== "knowledge-base" || state.knowledgeBaseTab !== "cv") return;
  const target = event.target;
  if (
    !(
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    )
  ) {
    return;
  }

  if (target.id === "cvPhotoInput") {
    const file = target.files && target.files[0];
    if (file) processCvPhotoFile(file);
    target.value = "";
    return;
  }

  const { cvField, cvExpId, cvExpField, cvEduId, cvEduField } = target.dataset;
  if (cvField && CV_BUILDER_CHECK_FIELDS.includes(cvField)) {
    cvBuilderState[cvField] = target.checked;
  } else if (cvField && CV_BUILDER_TEXT_FIELDS.includes(cvField)) {
    cvBuilderState[cvField] = target.value;
  } else if (cvExpId && cvExpField) {
    const item = cvBuilderState.experiences.find((entry) => entry.id === cvExpId);
    if (!item || !["company", "role", "date", "desc"].includes(cvExpField)) return;
    item[cvExpField] = target.value;
  } else if (cvEduId && cvEduField) {
    const item = cvBuilderState.educations.find((entry) => entry.id === cvEduId);
    if (!item || !["school", "title", "date"].includes(cvEduField)) return;
    item[cvEduField] = target.value;
  } else {
    return;
  }

  dismissCvBuilderHint();
  saveCvBuilderState();
  updateCvPreview();
}

function handleCvBuilderAction(action) {
  if (action === "upload-photo") {
    els.knowledgeBasePanel?.querySelector("#cvPhotoInput")?.click();
    return;
  }
  if (action === "remove-photo") {
    dismissCvBuilderHint();
    cvBuilderState.photo = "";
    saveCvBuilderState();
    renderCvBuilder();
    refreshIcons();
    return;
  }
  if (action === "add-experience") {
    dismissCvBuilderHint();
    cvBuilderState.experiences.push({ id: createCvItemId(), company: "", role: "", date: "", desc: "" });
    saveCvBuilderState();
    renderCvExperienceForms();
    updateCvPreview();
    els.knowledgeBasePanel?.querySelector("#cvExperienceForms .cv-item-card:last-child input")?.focus();
    return;
  }
  if (action === "add-education") {
    dismissCvBuilderHint();
    cvBuilderState.educations.push({ id: createCvItemId(), school: "", title: "", date: "" });
    saveCvBuilderState();
    renderCvEducationForms();
    updateCvPreview();
    els.knowledgeBasePanel?.querySelector("#cvEducationForms .cv-item-card:last-child input")?.focus();
    return;
  }
  if (action === "sample") {
    dismissCvBuilderHint();
    cvBuilderState = normalizeCvBuilderState(cvSampleData());
    saveCvBuilderState();
    renderCvBuilder();
    refreshIcons();
    return;
  }
  if (action === "reset") {
    dismissCvBuilderHint();
    cvBuilderState = normalizeCvBuilderState(null);
    saveCvBuilderState();
    renderCvBuilder();
    refreshIcons();
    return;
  }
  if (action === "print") {
    window.print();
  }
}

function applyCvPhoto(dataUrl) {
  cvBuilderState.photo = dataUrl;
  dismissCvBuilderHint();
  saveCvBuilderState();
  renderCvBuilder();
  refreshIcons();
}

function processCvPhotoFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Välj en bildfil (JPG, PNG eller WebP).");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showToast("Bilden är för stor. Välj en bild under 8 MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Beskär automatiskt till en kvadrat (cover) och skala ner för rimlig lagringsstorlek.
      const size = 320;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        showToast("Bilden kunde inte bearbetas.");
        return;
      }
      const scale = Math.max(size / img.width, size / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      ctx.drawImage(img, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH);
      applyCvPhoto(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => showToast("Bilden kunde inte läsas in.");
    img.src = String(reader.result || "");
  };
  reader.onerror = () => showToast("Bilden kunde inte läsas in.");
  reader.readAsDataURL(file);
}

function openCvDesktopModal() {
  if (!els.cvDesktopModal) return;
  els.cvDesktopModal.hidden = false;
  syncModalOpenState();
  refreshIcons();
  els.cvDesktopModal.querySelector("[data-close-cv-desktop]")?.focus();
}

function closeCvDesktopModal() {
  if (!els.cvDesktopModal || els.cvDesktopModal.hidden) return;
  els.cvDesktopModal.hidden = true;
  syncModalOpenState();
}

function shortMeta(meta) {
  const match = meta.match(/tid i appen:\s*([^\.]+)\./i);
  return match?.[1] || "";
}

function isFinalExamModule(module) {
  return /sluttest|frågebank/i.test(module?.title || "");
}

function hasModuleMilestone(moduleIndex) {
  const module = state.modules[moduleIndex];
  return Boolean(module) && !isFinalExamModule(module);
}

function shouldShowModuleMilestone(moduleIndex, options = {}) {
  if (!hasModuleMilestone(moduleIndex) || options.skipMilestone) return false;
  return state.mode !== "lesson" || state.moduleIndex !== moduleIndex;
}

function getContentModuleItems() {
  return state.modules
    .map((module, index) => ({ module, index }))
    .filter((item) => !isFinalExamModule(item.module));
}

function getContentModuleStats() {
  const items = getContentModuleItems();
  return {
    total: items.length,
    completed: items.filter((item) => isModuleComplete(item.index)).length,
  };
}

function areContentModulesComplete() {
  const items = getContentModuleItems();
  return items.length > 0 && items.every((item) => isModuleComplete(item.index));
}

function canStartFinalExam() {
  return isPremiumMember() && (UNLOCK_MODULE_NAVIGATION || areContentModulesComplete());
}

function canAccessFinalExam() {
  return canStartFinalExam() || Boolean(state.finalExam);
}

function isCourseUnlocked(courseId) {
  if (!COURSE_CONFIG[courseId]) return false;
  if (courseId === "vu1") return true;
  if (courseId === "vu2") {
    if (!isPremiumMember()) return false;
    if (!ENFORCE_COURSE_LOCKS) return true;
    return withCourseContext("vu1", () => isFinalExamPassed());
  }
  return true;
}

function moduleDisplayTitle(module) {
  return isFinalExamModule(module) ? "Slutprov" : module.title;
}

function getModuleActionState(moduleIndex) {
  if (isModuleComplete(moduleIndex)) {
    return {
      label: "Repetera modul",
      status: "Repetition",
      icon: "rotate-ccw",
      objective: "Du har redan gått igenom modulen. Öppna den igen för repetition.",
    };
  }

  if (hasVisitedAnyPage(moduleIndex)) {
    return {
      label: "Fortsätt modul",
      status: "Påbörjad",
      icon: "play-circle",
      objective: "Du har redan börjat modulen. Fortsätt från nästa ämne.",
    };
  }

  return {
    label: "Starta modul",
    status: moduleIndex === 0 ? "Modulstart" : "Milstolpe nådd",
    icon: moduleIndex === 0 ? "circle-play" : "circle-check",
    objective: moduleIndex === 0
      ? "Du startar nu första modulen i kursen."
      : "Du har nått en milstolpe och går nu vidare till nästa modul.",
  };
}

function moduleMetaSummary(module) {
  if (isFinalExamModule(module)) {
    return `${FINAL_EXAM_SIZE} slumpade frågor`;
  }

  const appTime = shortMeta(module.meta);
  if (appTime) return appTime;

  const pages = allPages(module).length;
  return pages ? `${pages} sidor` : "Lektionssidor och quiz";
}

function moduleOutlineItem(lesson, moduleNumberValue, lessonIndex) {
  const isSummary = /^Sammanfattning\b/i.test(lesson.title);
  const titleMatch = lesson.title.match(/^(\d+(?:\.\d+)?)\s+(.+)/);

  return {
    isSummary,
    badge: titleMatch?.[1] || `${moduleNumberValue}.${lessonIndex + 1}`,
    title: titleMatch?.[2] || lesson.title,
  };
}

function setQuizButtonLabel(label) {
  const labelNode = els.quizButton?.querySelector("span");
  if (labelNode) labelNode.textContent = label;
}

function getModuleProgress(module, moduleIndex) {
  if (isFinalExamModule(module)) {
    if (state.finalExam?.completedAt) return isFinalExamPassed() ? 100 : getFinalExamResult().percent;
    const total = state.finalExam?.questionIds?.length || FINAL_EXAM_SIZE;
    return Math.round((getFinalExamAnsweredCount() / total) * 100);
  }

  const pages = allPages(module);
  if (!pages.length) return 0;
  const visited = pages.filter((item) => state.visited.has(pageId(moduleIndex, item.lessonIndex, item.pageIndex))).length;
  const hasQuiz = Array.isArray(module.quiz) && module.quiz.length > 0;
  const quizStep = hasQuiz && getModuleQuizResult(moduleIndex).passed ? 1 : 0;
  const totalSteps = pages.length + (hasQuiz ? 1 : 0);
  return Math.round(((visited + quizStep) / totalSteps) * 100);
}

function getCourseProgress() {
  const contentModules = state.modules
    .map((module, moduleIndex) => ({ module, moduleIndex }))
    .filter((item) => !isFinalExamModule(item.module));
  const pages = contentModules
    .flatMap((item) => allPages(item.module).map((pageItem) => ({ ...pageItem, moduleIndex: item.moduleIndex })));
  if (!pages.length) {
    return { total: 0, visited: 0, completedSteps: 0, totalSteps: 0, percent: 0, finalExamPassed: false };
  }

  const visited = pages.filter((item) => isPageVisited(item.moduleIndex, item.lessonIndex, item.pageIndex)).length;
  const quizRequirements = contentModules.filter(
    (item) => Array.isArray(item.module.quiz) && item.module.quiz.length > 0
  );
  const passedQuizzes = quizRequirements.filter((item) => getModuleQuizResult(item.moduleIndex).passed).length;
  const hasFinalExam = state.modules.some((module) => isFinalExamModule(module));
  const finalExamPassed = hasFinalExam && isFinalExamPassed();
  const completedSteps = visited + passedQuizzes + (finalExamPassed ? 1 : 0);
  const totalSteps = pages.length + quizRequirements.length + (hasFinalExam ? 1 : 0);

  return {
    total: pages.length,
    visited,
    completedSteps,
    totalSteps,
    percent: totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0,
    finalExamPassed,
  };
}

function getLastAccessiblePosition() {
  let lastVisited = null;
  let firstUnlocked = null;
  let firstPendingUnlocked = null;
  const finalExamModuleIndex = state.modules.findIndex((module) => isFinalExamModule(module));

  state.modules.forEach((module, moduleIndex) => {
    if (isFinalExamModule(module)) return;

    allPages(module).forEach((item) => {
      const unlocked = isPageUnlocked(moduleIndex, item.lessonIndex, item.pageIndex);
      const visited = isPageVisited(moduleIndex, item.lessonIndex, item.pageIndex);

      if (!firstUnlocked && unlocked) {
        firstUnlocked = { moduleIndex, lessonIndex: item.lessonIndex, pageIndex: item.pageIndex };
      }

      if (!firstPendingUnlocked && unlocked && !visited) {
        firstPendingUnlocked = { moduleIndex, lessonIndex: item.lessonIndex, pageIndex: item.pageIndex };
      }

      if (visited) {
        lastVisited = { moduleIndex, lessonIndex: item.lessonIndex, pageIndex: item.pageIndex };
      }
    });
  });

  if (areContentModulesComplete() && finalExamModuleIndex >= 0) {
    return { moduleIndex: finalExamModuleIndex, lessonIndex: 0, pageIndex: 0 };
  }

  return firstPendingUnlocked || lastVisited || firstUnlocked || { moduleIndex: 0, lessonIndex: 0, pageIndex: 0 };
}

function getModuleResumePosition(moduleIndex) {
  const module = state.modules[moduleIndex];
  if (!module) return { moduleIndex: 0, lessonIndex: 0, pageIndex: 0 };
  if (isFinalExamModule(module)) return { moduleIndex, lessonIndex: 0, pageIndex: 0 };

  const pages = allPages(module);
  const pending = pages.find(
    (item) =>
      isPageUnlocked(moduleIndex, item.lessonIndex, item.pageIndex) &&
      !isPageVisited(moduleIndex, item.lessonIndex, item.pageIndex)
  );
  const target = pending || pages[0];
  return { moduleIndex, lessonIndex: target?.lessonIndex || 0, pageIndex: target?.pageIndex || 0 };
}

function getQuizSummary() {
  let answered = 0;
  let correct = 0;

  state.modules.forEach((module, moduleIndex) => {
    const key = answerKey(moduleIndex);
    if (!state.quizSubmissions[key]) return;
    const answers = isPlainObject(state.answers[key]) ? state.answers[key] : {};
    module.quiz.forEach((question) => {
      if (answers[question.number]) {
        answered += 1;
        if (answers[question.number] === question.correct) correct += 1;
      }
    });
  });

  return { answered, correct, percent: answered ? Math.round((correct / answered) * 100) : null };
}

function readSavedLocation() {
  const saved = readStorage(STORAGE_KEYS.location, null);
  const hashLocation = portalLocationFromHash(window.location.hash, saved);
  if (hashLocation) return hashLocation;
  if (!isPlainObject(saved)) return null;

  const mode = RESTORABLE_MODES.has(saved.mode) ? saved.mode : "home";
  const fallbackCourse = mode === "vu2" ? "vu2" : "vu1";
  const courseId = COURSE_CONFIG[saved.courseId] ? saved.courseId : fallbackCourse;

  return {
    courseId,
    moduleIndex: toSafeIndex(saved.moduleIndex),
    lessonIndex: toSafeIndex(saved.lessonIndex),
    pageIndex: toSafeIndex(saved.pageIndex),
    mode,
    knowledgeBaseTab: KNOWLEDGE_BASE_TABS.has(saved.knowledgeBaseTab) ? saved.knowledgeBaseTab : "lonekollen",
  };
}

function withCourseContext(courseId, callback) {
  const previous = {
    courseId: state.courseId,
    modules: state.modules,
    moduleIndex: state.moduleIndex,
    lessonIndex: state.lessonIndex,
    pageIndex: state.pageIndex,
    finalExamPool: state.finalExamPool,
    finalExam: state.finalExam,
  };

  try {
    activateCourse(courseId);
    return callback();
  } finally {
    state.courseId = previous.courseId;
    state.modules = previous.modules;
    state.moduleIndex = previous.moduleIndex;
    state.lessonIndex = previous.lessonIndex;
    state.pageIndex = previous.pageIndex;
    state.finalExamPool = previous.finalExamPool;
    state.finalExam = previous.finalExam;
  }
}

function getCourseHomeOverview(courseId) {
  return withCourseContext(courseId, () => {
    const course = getCourseConfig(courseId);
    const progress = getCourseProgress();
    const moduleStats = getContentModuleStats();
    const passedModuleQuizzes = getContentModuleItems().filter(
      (item) => Array.isArray(item.module.quiz) && item.module.quiz.length > 0 && getModuleQuizResult(item.index).passed
    ).length;
    const quizSummary = getQuizSummary();
    const continuePosition = getLastAccessiblePosition();
    const continueModule = state.modules[continuePosition.moduleIndex];
    const continueLesson = continueModule?.lessons[continuePosition.lessonIndex];
    const continuePage = continueLesson?.pages[continuePosition.pageIndex];
    const moduleProgress = continueModule ? getModuleProgress(continueModule, continuePosition.moduleIndex) : 0;
    const started =
      progress.completedSteps > 0 ||
      Object.keys(state.answers).some((key) => key.startsWith(`${courseId}:`)) ||
      Boolean(state.finalExams[courseId]);
    const complete = progress.totalSteps > 0 && progress.completedSteps === progress.totalSteps;

    return {
      course,
      courseId,
      progress,
      moduleStats,
      passedModuleQuizzes,
      quizSummary,
      continuePosition,
      continueModule,
      continueLesson,
      continuePage,
      moduleProgress,
      started,
      complete,
    };
  });
}

function getEmblemOverview(homeData) {
  const builder = window.vaktskolanEmblems?.buildOverview;
  if (typeof builder !== "function") return { emblems: [], unlockedCount: 0, totalCount: 0 };

  return builder({
    courses: homeData.courses.map((overview) => ({
      courseId: overview.courseId,
      completedModules: overview.moduleStats.completed,
      totalModules: overview.moduleStats.total,
      finalExamPassed: overview.progress.finalExamPassed,
      passedModuleQuizzes: overview.passedModuleQuizzes,
    })),
  });
}

function registerEmblemPresentation(emblemOverview) {
  const earnedIds = emblemOverview.emblems.filter((emblem) => emblem.unlocked).map((emblem) => emblem.id);
  const knownIds = new Set(readArrayStorage(STORAGE_KEYS.knownEmblems));
  const newlyUnlocked = emblemOverview.emblems.filter(
    (emblem) => emblem.unlocked && !knownIds.has(emblem.id)
  );
  writeStorage(STORAGE_KEYS.knownEmblems, earnedIds);
  return new Set(newlyUnlocked.map((emblem) => emblem.id));
}

function renderHomeEmblem(emblem, index, isNew) {
  const status = emblem.unlocked ? "Upplåst" : emblem.progressLabel;
  return `
    <button class="home-emblem-item home-emblem-theme-${emblem.theme} ${emblem.unlocked ? "is-unlocked" : "is-locked"} ${isNew ? "is-new" : ""}"
      type="button" data-emblem-id="${emblem.id}" style="--home-emblem-index: ${index}"
      aria-label="${escapeHtml(`${emblem.label}: ${status}. Visa information.`)}">
      <span class="home-emblem-medallion" aria-hidden="true">
        <span class="home-emblem-inner"><i data-lucide="${emblem.icon}"></i></span>
        ${emblem.unlocked ? '<span class="home-emblem-check"><i data-lucide="check"></i></span>' : '<span class="home-emblem-lock"><i data-lucide="lock"></i></span>'}
      </span>
      <span class="home-emblem-copy">
        <strong>${escapeHtml(emblem.label)}</strong>
        <small>${emblem.unlocked ? (isNew ? "Nytt" : "Upplåst") : `${emblem.percent}%`}</small>
      </span>
    </button>
  `;
}

function moduleQuizSourceRef(courseId, moduleNumberValue, submittedAt) {
  return `module:${courseId}:${moduleNumberValue}:${Number(submittedAt)}`;
}

function recordModuleQuizAttempt(module, moduleAnswers, submittedAt) {
  const moduleNumberValue = Number(moduleNumber(module));
  const sourceRef = moduleQuizSourceRef(state.courseId, moduleNumberValue, submittedAt);
  const completedAt = new Date(Number(submittedAt)).toISOString();
  const topicLabel = moduleDisplayTitle(module);
  const correctCount = module.quiz.filter((question) => moduleAnswers[question.number] === question.correct).length;
  const attempt = recordQuizAttempt({
    sourceType: "module_quiz",
    sourceRef,
    courseId: state.courseId,
    moduleNumber: moduleNumberValue,
    questionCount: module.quiz.length,
    correctCount,
    completed: true,
    startedAt: completedAt,
    completedAt,
  });
  if (!attempt) return;

  module.quiz.forEach((question) => {
    const selectedAnswer = moduleAnswers[question.number] || null;
    recordQuizAnswer({
      attemptId: attempt.id,
      questionKey: `module:${state.courseId}:${moduleNumberValue}:${question.number}`,
      sourceType: "module_quiz",
      courseId: state.courseId,
      moduleNumber: moduleNumberValue,
      topicKeys: [`${state.courseId}:module:${moduleNumberValue}`],
      topicLabels: [topicLabel],
      selectedAnswer,
      correctAnswer: question.correct,
      isCorrect: selectedAnswer === question.correct,
      answeredAt: completedAt,
    });
  });
}

function getLegacyModuleQuizAnswerEvents() {
  const events = [];
  Object.keys(COURSE_CONFIG).forEach((courseId) => {
    withCourseContext(courseId, () => {
      state.modules.forEach((module, moduleIndex) => {
        if (!Array.isArray(module.quiz) || !module.quiz.length) return;
        const key = answerKey(moduleIndex, courseId);
        const submittedAt = Number(state.quizSubmissions[key] || 0);
        if (!submittedAt) return;

        const moduleNumberValue = Number(moduleNumber(module));
        const sourceRef = moduleQuizSourceRef(courseId, moduleNumberValue, submittedAt);
        if (state.quizHistory.attempts.some((attempt) => attempt.sourceRef === sourceRef)) return;

        const answers = isPlainObject(state.answers[key]) ? state.answers[key] : {};
        const answeredAt = new Date(submittedAt).toISOString();
        const topicLabel = moduleDisplayTitle(module);
        module.quiz.forEach((question) => {
          const selectedAnswer = answers[question.number] || null;
          events.push({
            id: `legacy:${sourceRef}:${question.number}`,
            questionKey: `module:${courseId}:${moduleNumberValue}:${question.number}`,
            sourceType: "module_quiz",
            courseId,
            moduleNumber: moduleNumberValue,
            topicKeys: [`${courseId}:module:${moduleNumberValue}`],
            topicLabels: [topicLabel],
            selectedAnswer,
            correctAnswer: question.correct,
            isCorrect: selectedAnswer === question.correct,
            timedOut: false,
            answeredAt,
          });
        });
      });
    });
  });
  return events;
}

function getStudentQuizMetrics() {
  const answers = [...state.quizHistory.answers, ...getLegacyModuleQuizAnswerEvents()]
    .filter((answer) => answer && answer.questionKey && answer.answeredAt && answer.sourceType !== "review")
    .sort((left, right) => Date.parse(right.answeredAt) - Date.parse(left.answeredAt));
  const accuracyAnswers = answers.slice(0, QUIZ_ACCURACY_WINDOW);
  const correct = accuracyAnswers.filter((answer) => answer.isCorrect).length;
  const total = accuracyAnswers.length;
  const reviewQueue = getQuizReviewQueue();

  return {
    accuracy: {
      correct,
      total,
      percent: total ? Math.round((correct / total) * 100) : null,
    },
    review: {
      due: reviewQueue.due.length,
      waiting: reviewQueue.waiting.length,
      mastered: reviewQueue.mastered.length,
    },
  };
}

function getHomeData() {
  const courses = Object.keys(COURSE_CONFIG).map((courseId) => getCourseHomeOverview(courseId));
  const vu1Overview = courses.find((item) => item.courseId === "vu1");
  const totalPages = courses.reduce((sum, item) => sum + item.progress.total, 0);
  const visitedPages = courses.reduce((sum, item) => sum + item.progress.visited, 0);
  const totalProgressSteps = courses.reduce((sum, item) => sum + item.progress.totalSteps, 0);
  const completedProgressSteps = courses.reduce((sum, item) => sum + item.progress.completedSteps, 0);
  const totalModules = courses.reduce((sum, item) => sum + item.moduleStats.total, 0);
  const completedModules = courses.reduce((sum, item) => sum + item.moduleStats.completed, 0);
  const quizAnswered = courses.reduce((sum, item) => sum + item.quizSummary.answered, 0);
  const quizCorrect = courses.reduce((sum, item) => sum + item.quizSummary.correct, 0);
  courses.forEach((item) => {
    item.membershipLocked = item.courseId === "vu2" && !isPremiumMember();
    item.locked = !isCourseUnlocked(item.courseId);
  });
  const saved = readSavedLocation();
  const savedCourseId = COURSE_CONFIG[saved?.courseId] && !courses.find((item) => item.courseId === saved.courseId)?.locked ? saved.courseId : null;
  const preferredCourse =
    courses.find((item) => item.courseId === savedCourseId) ||
    courses.find((item) => !item.locked && item.started && item.progress.percent < 100) ||
    courses.find((item) => !item.locked) ||
    courses[0];

  return {
    courses,
    hasAnyProgress: visitedPages > 0 || quizAnswered > 0 || courses.some((item) => item.started),
    totals: {
      pages: totalPages,
      visitedPages,
      percent: totalProgressSteps ? Math.round((completedProgressSteps / totalProgressSteps) * 100) : 0,
      modules: totalModules,
      completedModules,
      quizAnswered,
      quizCorrect,
      quizPercent: quizAnswered ? Math.round((quizCorrect / quizAnswered) * 100) : null,
    },
    continueCourse: preferredCourse,
  };
}

function homeContinueMeta(overview) {
  if (!overview?.continueModule) return "Starta utbildningen";

  if (isFinalExamModule(overview.continueModule)) {
    const exam = state.finalExams[overview.courseId] || null;
    if (exam?.completedAt) return "Slutprovet är inlämnat";
    if (exam) return `${Object.keys(exam.answers || {}).length}/${exam.questionIds?.length || FINAL_EXAM_SIZE} svarade`;
    return `${FINAL_EXAM_SIZE} slumpade frågor`;
  }

  if (!overview.continueLesson || !overview.continuePage) return "Starta utbildningen";
  return `${overview.continueLesson.title} · ${overview.continuePage.title.replace(/^Sida\s+\d+:\s*/, "")}`;
}

function courseStatusLabel(overview) {
  if (overview.locked) return { text: "Låst", tone: "locked" };
  if (overview.complete) return { text: "Klar", tone: "complete" };
  if (overview.started) return { text: "Pågår", tone: "active" };
  return { text: "Redo", tone: "ready" };
}

function renderHomeCourseCard(overview) {
  const status = courseStatusLabel(overview);
  const icon = overview.courseId === "vu2" ? "shield-check" : "book-open";
  const description =
    overview.courseId === "vu2"
      ? "Fördjupning som bygger vidare på VU1 med praktiska situationer, arbetsmiljö och avancerad juridik."
      : "Första delen av väktarutbildningen med grunderna i juridik, arbetsmiljö och yrkesetik.";
  const actionLabel = overview.membershipLocked ? "Lås upp med Premium" : overview.locked ? "Slutför VU1 först" : "Öppna kurs";
  const actionAttribute = overview.courseId === "vu2" ? "data-open-vu2" : "data-open-course";

  return `
    <article class="home-course-card ${overview.locked ? "is-locked" : ""}">
      <div class="home-course-top">
        <span class="home-course-icon"><i data-lucide="${icon}"></i></span>
        <span class="home-status home-status-${status.tone}">
          ${overview.locked ? '<i data-lucide="lock"></i>' : ""}
          ${status.text}
        </span>
      </div>
      <h3>${escapeHtml(overview.course.fullTitle)}</h3>
      <p>${escapeHtml(description)}</p>
      <div class="home-course-progress">
        <div class="home-progress-row">
          <span>Framsteg</span>
          <strong>${overview.progress.percent}%</strong>
        </div>
        <div class="home-progress-track" aria-label="${overview.progress.percent}% klart">
          <span style="width: ${overview.progress.percent}%"></span>
        </div>
        <small>${overview.moduleStats.completed} av ${overview.moduleStats.total} moduler klara</small>
        ${overview.membershipLocked ? '<small class="home-course-lock-note"><i data-lucide="lock"></i> Ingår i Premium</small>' : overview.locked ? '<small class="home-course-lock-note"><i data-lucide="circle-alert"></i> Slutför VU1 för att låsa upp</small>' : ""}
      </div>
      <button class="home-course-action" type="button" ${overview.membershipLocked ? 'data-premium-lock="vu2"' : overview.locked ? 'disabled aria-disabled="true" title="Slutför VU1 för att låsa upp VU2"' : actionAttribute}>
        <span>${actionLabel}</span>
        <i data-lucide="${overview.locked ? "lock" : "arrow-right"}"></i>
      </button>
    </article>
  `;
}

function renderHome() {
  const homeData = getHomeData();
  const emblemOverview = getEmblemOverview(homeData);
  const newlyUnlockedEmblems = registerEmblemPresentation(emblemOverview);
  state.emblems = emblemOverview.emblems;
  const continueOverview = homeData.continueCourse;
  const quizMetrics = getStudentQuizMetrics();
  const accuracyDetail = quizMetrics.accuracy.total
    ? `${quizMetrics.accuracy.correct} av ${quizMetrics.accuracy.total} rätt${quizMetrics.accuracy.total === QUIZ_ACCURACY_WINDOW ? " · senaste 100" : ""}`
    : "Gör ett quiz för att börja mäta";
  const repeatValue = `${quizMetrics.review.due} ${quizMetrics.review.due === 1 ? "fråga" : "frågor"}`;
  const repeatDetail = quizMetrics.review.due
    ? "Redo nu i Quizportalen"
    : quizMetrics.review.waiting
      ? `${quizMetrics.review.waiting} ${quizMetrics.review.waiting === 1 ? "schemalagd" : "schemalagda"} till senare`
      : "Du är ikapp";
  const vu2Overview = homeData.courses.find((overview) => overview.courseId === "vu2");
  const continueModule = continueOverview?.continueModule;
  const continueTitle = continueModule
    ? `${continueOverview.course.shortLabel} · Modul ${moduleNumber(continueModule)}: ${moduleDisplayTitle(continueModule)}`
    : "Starta utbildningen";
  const continueMeta = homeContinueMeta(continueOverview);
  const continuePosition = continueOverview?.continuePosition || { moduleIndex: 0, lessonIndex: 0, pageIndex: 0 };
  const firstName = state.user.firstName || "Sven";
  const displayName = state.user.displayName || firstName;
  const initials = userInitials(displayName, "");
  const welcomeTitle = homeData.hasAnyProgress ? `Välkommen tillbaka, ${firstName}` : `Välkommen, ${firstName}`;
  const welcomeCopy = homeData.hasAnyProgress
    ? "Här är en överblick över dina framsteg och nästa steg i väktarutbildningen."
    : "Här startar din väktarutbildning. Börja med VU1 och lås upp VU2 när första delen är klar.";
  const vu2NavAttributes = vu2Overview?.membershipLocked
    ? 'data-premium-lock="vu2"'
    : vu2Overview?.locked
      ? 'disabled aria-disabled="true" title="Slutför VU1 för att låsa upp VU2"'
      : "data-open-vu2";

  els.homePanel.innerHTML = `
    <section class="home-dashboard" aria-labelledby="homeDashboardTitle">
      <div class="home-dashboard-body">
        <div class="home-mobile-head">
          <div class="home-shell-brand">
            <img class="app-brand-icon" src="/assets/logo/vaktskolan-icon-512.png" alt="" aria-hidden="true">
            <img class="app-brand-wordmark" src="/assets/logo/vaktskolan-wordmark.png" alt="vaktskolan.">
          </div>
          <div class="home-mobile-avatar mobile-auth-user-button" data-mobile-auth-user-button aria-label="Öppna profilmeny">${escapeHtml(initials)}</div>
        </div>

        <div class="home-dashboard-head">
          <span>Hem</span>
          <h1 id="homeDashboardTitle">${escapeHtml(welcomeTitle)}</h1>
          <p>${escapeHtml(welcomeCopy)}</p>
        </div>

        <section class="home-stat-grid" aria-label="Din utbildningsstatistik">
          <div class="home-stat">
            <p>
              <span class="home-stat-dot is-blue" aria-hidden="true"></span>
              <span>Kursframsteg</span>
            </p>
            <strong>${continueOverview?.progress.percent || 0}%</strong>
            <span class="home-stat-detail">${escapeHtml(continueOverview?.course.shortLabel || "VU1")} · aktuell kurs</span>
          </div>
          <div class="home-stat">
            <p>
              <span class="home-stat-dot is-green" aria-hidden="true"></span>
              <span>Moduler klara</span>
            </p>
            <strong>${continueOverview?.moduleStats.completed || 0}<small>/ ${continueOverview?.moduleStats.total || 0}</small></strong>
            <span class="home-stat-detail">${escapeHtml(continueOverview?.course.shortLabel || "VU1")}</span>
          </div>
          <div class="home-stat">
            <p>
              <span class="home-stat-dot is-purple" aria-hidden="true"></span>
              <span>Quizträffsäkerhet</span>
            </p>
            <strong>${quizMetrics.accuracy.percent === null ? "–" : `${quizMetrics.accuracy.percent}%`}</strong>
            <span class="home-stat-detail">${escapeHtml(accuracyDetail)}</span>
          </div>
          <div class="home-stat">
            <p>
              <span class="home-stat-dot is-orange" aria-hidden="true"></span>
              <span>Att repetera</span>
            </p>
            <strong>${escapeHtml(repeatValue)}</strong>
            <span class="home-stat-detail">${escapeHtml(repeatDetail)}</span>
          </div>
        </section>

        <section class="home-continue" aria-labelledby="homeContinueTitle">
          <div class="home-continue-copy">
            <span>Fortsätt där du slutade</span>
            <h2 id="homeContinueTitle">${escapeHtml(continueTitle)}</h2>
            <p>${escapeHtml(continueMeta)}</p>
          </div>
          <button class="home-primary-action" type="button"
            data-home-continue-course="${continueOverview?.courseId || "vu1"}"
            data-home-continue-module="${continuePosition.moduleIndex}"
            data-home-continue-lesson="${continuePosition.lessonIndex}"
            data-home-continue-page="${continuePosition.pageIndex}">
            <span>Fortsätt</span>
            <i data-lucide="arrow-right"></i>
          </button>
        </section>

        <section class="home-courses" aria-labelledby="homeCoursesTitle">
          <div class="home-section-head">
            <h2 id="homeCoursesTitle">Dina kurser</h2>
            <p>Öppna en kurs eller fortsätt från nästa tillgängliga sida.</p>
          </div>
          <div class="home-course-grid">
            ${homeData.courses.map((overview) => renderHomeCourseCard(overview)).join("")}
          </div>
        </section>

        <section class="home-emblems" aria-labelledby="homeEmblemsTitle">
          <div class="home-emblems-head">
            <div>
              <h2 id="homeEmblemsTitle">Dina emblem</h2>
              <p>Små milstolpar från din faktiska kursprogression.</p>
            </div>
            <span>${emblemOverview.unlockedCount} av ${emblemOverview.totalCount} upplåsta</span>
          </div>
          <div class="home-emblem-list" role="group" aria-label="Emblem">
            ${emblemOverview.emblems.map((emblem, index) => renderHomeEmblem(emblem, index, newlyUnlockedEmblems.has(emblem.id))).join("")}
          </div>
        </section>

        <button class="home-quick-links" type="button" data-show-quiz aria-label="Gå till Quiz Portal">
          <span class="home-quick-icon"><i data-lucide="target"></i></span>
          <span class="home-quick-copy">
            <strong>Träna inför provet</strong>
            <small>Använd Quiz Portal för att repetera frågor, scenarier och flashcards.</small>
          </span>
          <span class="home-secondary-action">
            <span>Gå till Quiz Portal</span>
            <i data-lucide="arrow-right"></i>
          </span>
        </button>
      </div>

      <nav class="home-mobile-tabbar" aria-label="Mobil huvudmeny">
        <button class="home-mobile-tab is-active" type="button" data-open-home>
          <i data-lucide="home"></i>
          <span>Hem</span>
        </button>
        <button class="home-mobile-tab" type="button" data-open-course>
          <i data-lucide="book-open"></i>
          <span>VU1</span>
        </button>
        <button class="home-mobile-tab ${vu2Overview?.locked ? "is-disabled" : ""}" type="button" data-mobile-course="vu2" ${vu2NavAttributes}>
          <i data-lucide="shield-check"></i>
          <span>VU2</span>
        </button>
        <button class="home-mobile-tab" type="button" data-show-quiz>
          <i data-lucide="target"></i>
          <span>Quiz</span>
        </button>
        <button class="home-mobile-tab" type="button" data-open-final-exam-portal>
          <i data-lucide="clipboard-check"></i>
          <span>Slutprov</span>
        </button>
      </nav>
    </section>
  `;

  const newNames = emblemOverview.emblems
    .filter((emblem) => newlyUnlockedEmblems.has(emblem.id))
    .map((emblem) => emblem.label);
  if (newNames.length) {
    window.setTimeout(
      () => showToast(`${newNames.length > 1 ? "Nya emblem" : "Nytt emblem"}: ${newNames.join(", ")}`),
      0
    );
  }
}

function getFinalExamQuestions() {
  const ids = Array.isArray(state.finalExam?.questionIds) ? state.finalExam.questionIds : [];
  return ids.map((id) => state.finalExamPool.find((question) => question.id === id)).filter(Boolean);
}

function getFinalExamAnsweredCount() {
  return Object.keys(isPlainObject(state.finalExam?.answers) ? state.finalExam.answers : {}).length;
}

function getFinalExamScore() {
  const answers = isPlainObject(state.finalExam?.answers) ? state.finalExam.answers : {};
  const questions = getFinalExamQuestions();
  const correct = questions.filter((question) => answers[question.id] === question.correct).length;
  return { correct, total: questions.length, percent: questions.length ? Math.round((correct / questions.length) * 100) : 0 };
}

function getFinalExamOptionText(question, letter) {
  if (!letter) return "Ej besvarad";
  const option = question.options.find((item) => item.letter === letter);
  return option ? `${letter}. ${option.text}` : letter;
}

function getFinalExamResult() {
  const answers = isPlainObject(state.finalExam?.answers) ? state.finalExam.answers : {};
  const questions = getFinalExamQuestions();
  const breakdownMap = new Map();
  const wrongQuestions = [];
  let correct = 0;
  let answered = 0;

  questions.forEach((question, index) => {
    const selected = answers[question.id];
    const isAnswered = Boolean(selected);
    const isCorrect = selected === question.correct;

    if (isAnswered) answered += 1;
    if (isCorrect) correct += 1;

    const key = question.source || "Blandade frågor";
    const current = breakdownMap.get(key) || { label: key, correct: 0, total: 0 };
    current.total += 1;
    if (isCorrect) current.correct += 1;
    breakdownMap.set(key, current);

    const reviewItem = {
      index: index + 1,
      source: key,
      question: question.question,
      selected: getFinalExamOptionText(question, selected),
      correct: getFinalExamOptionText(question, question.correct),
      explanation: question.explanation,
      isCorrect,
    };

    if (!isCorrect) wrongQuestions.push(reviewItem);
  });

  const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return {
    answered,
    correct,
    total: questions.length,
    percent,
    passed: percent >= FINAL_EXAM_PASS_PERCENT,
    wrongQuestions,
    reviewQuestions: questions.map((question, index) => {
      const selected = answers[question.id];
      return {
        index: index + 1,
        source: question.source || "Blandade frågor",
        question: question.question,
        selected: getFinalExamOptionText(question, selected),
        correct: getFinalExamOptionText(question, question.correct),
        explanation: question.explanation,
        isCorrect: selected === question.correct,
      };
    }),
    breakdown: [...breakdownMap.values()],
  };
}

function getFinalExamLockInfo() {
  const completedAt = Number(state.finalExam?.completedAt || 0);
  if (!completedAt) return { locked: false, remaining: 0 };
  const score = getFinalExamScore();
  if (score.total && score.percent >= FINAL_EXAM_PASS_PERCENT) return { locked: false, remaining: 0 };

  const remaining = FINAL_EXAM_LOCK_MS - (Date.now() - completedAt);
  return { locked: remaining > 0, remaining: Math.max(0, remaining) };
}

function formatRemainingTime(milliseconds) {
  const totalMinutes = Math.ceil(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} tim`;
  return `${hours} tim ${minutes} min`;
}

function formatClockTime(milliseconds, options = {}) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, "0");

  if (options.forceHours || hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function getFinalExamRequiredCorrect(total = FINAL_EXAM_SIZE) {
  return Math.ceil((total * FINAL_EXAM_PASS_PERCENT) / 100);
}

function getFinalExamTimerRemaining() {
  const endsAt = Number(state.finalExam?.endsAt || 0);
  if (!endsAt || state.finalExam?.completedAt) return 0;
  return Math.max(0, endsAt - Date.now());
}

function stopFinalExamTimer() {
  if (state.finalExamTimer) {
    window.clearInterval(state.finalExamTimer);
    state.finalExamTimer = null;
  }
}

function startFinalExamTimer() {
  stopFinalExamTimer();
  if (!state.finalExam || state.finalExam.completedAt || !state.finalExam.endsAt) return;

  state.finalExamTimer = window.setInterval(() => {
    if (state.mode !== "final-exam" || !state.finalExam || state.finalExam.completedAt) {
      stopFinalExamTimer();
      return;
    }

    const remaining = getFinalExamTimerRemaining();
    const timerNode = document.querySelector("[data-final-exam-timer]");
    if (timerNode) {
      timerNode.textContent = formatClockTime(remaining);
      timerNode.classList.toggle("is-low", remaining > 0 && remaining < 2 * 60 * 1000);
    }

    if (remaining <= 0) {
      stopFinalExamTimer();
      submitFinalExam({ reason: "timeout" });
    }
  }, 1000);
}

function getFinalExamPortalOverview(courseId) {
  return withCourseContext(courseId, () => {
    const course = getCourseConfig(courseId);
    const courseProgress = getCourseProgress();
    const moduleStats = getContentModuleStats();
    const activeSession = state.finalExam && !state.finalExam.completedAt;
    const completedSession = Boolean(state.finalExam?.completedAt);
    const lock = getFinalExamLockInfo();
    const finalExamReady = canStartFinalExam();
    const courseUnlocked = isCourseUnlocked(courseId);
    const answered = getFinalExamAnsweredCount();
    const total = state.finalExam?.questionIds?.length || FINAL_EXAM_SIZE;
    const score = completedSession ? getFinalExamScore() : null;
    const poolCount = state.finalExamPool.length;

    let tone = "ready";
    let status = "Redo";
    let detail = `${poolCount} frågor i underlaget`;
    let action = "start";
    let actionLabel = completedSession ? "Starta nytt prov" : "Starta slutprov";
    let disabled = false;
    let icon = "clipboard-check";

    if (!courseUnlocked) {
      tone = "locked";
      status = "Kurs låst";
      detail = "Slutför VU1 för att låsa upp VU2.";
      actionLabel = "Låst";
      disabled = true;
      icon = "lock";
    } else if (poolCount < FINAL_EXAM_SIZE) {
      tone = "locked";
      status = "Ej redo";
      detail = `Frågepoolen har ${poolCount} av ${FINAL_EXAM_SIZE} frågor.`;
      actionLabel = "Ej redo";
      disabled = true;
      icon = "circle-alert";
    } else if (!finalExamReady && !state.finalExam) {
      tone = "locked";
      status = "Låst";
      detail = `${moduleStats.completed} av ${moduleStats.total} moduler klara.`;
      actionLabel = "Låst";
      disabled = true;
      icon = "lock";
    } else if (activeSession) {
      tone = "active";
      status = "Pågående";
      detail = `${answered}/${total} frågor besvarade.`;
      action = "resume";
      actionLabel = "Fortsätt prov";
      icon = "play-circle";
    } else if (completedSession && lock.locked) {
      tone = "submitted";
      status = "Inlämnat";
      detail = `${score.correct}/${score.total} rätt. Nytt prov om ${formatRemainingTime(lock.remaining)}.`;
      action = "resume";
      actionLabel = "Visa resultat";
      icon = "eye";
    } else if (completedSession) {
      tone = "complete";
      status = "Redo igen";
      detail = `${score.correct}/${score.total} rätt senast. Nytt prov kan startas.`;
      actionLabel = "Starta nytt prov";
      icon = "rotate-ccw";
    }

    return {
      courseId,
      course,
      courseProgress,
      moduleStats,
      poolCount,
      tone,
      status,
      detail,
      action,
      actionLabel,
      disabled,
      icon,
    };
  });
}

function renderFinalPortalMobileHead() {
  const initials = userInitials(state.user.displayName || state.user.firstName || "Sven", "");
  return `
    <div class="final-portal-mobile-head">
      <div class="final-portal-mobile-brand">
        <img class="app-brand-icon" src="/assets/logo/vaktskolan-icon-512.png" alt="" aria-hidden="true">
        <img class="app-brand-wordmark" src="/assets/logo/vaktskolan-wordmark.png" alt="vaktskolan.">
      </div>
      <div class="final-portal-mobile-avatar mobile-auth-user-button" data-mobile-auth-user-button aria-label="Öppna profilmeny">${escapeHtml(initials)}</div>
    </div>
  `;
}

function renderFinalPortalMobileTabbar() {
  return `
    <nav class="final-portal-mobile-tabbar" aria-label="Mobil huvudmeny">
      <button class="final-portal-mobile-tab" type="button" data-open-home>
        <i data-lucide="home"></i>
        <span>Hem</span>
      </button>
      <button class="final-portal-mobile-tab" type="button" data-open-course>
        <i data-lucide="book-open"></i>
        <span>VU1</span>
      </button>
      <button class="final-portal-mobile-tab" type="button" data-open-vu2 data-mobile-course="vu2">
        <i data-lucide="shield-check"></i>
        <span>VU2</span>
      </button>
      <button class="final-portal-mobile-tab" type="button" data-show-quiz>
        <i data-lucide="target"></i>
        <span>Quiz</span>
      </button>
      <button class="final-portal-mobile-tab is-active" type="button" data-open-final-exam-portal>
        <i data-lucide="clipboard-check"></i>
        <span>Slutprov</span>
      </button>
    </nav>
  `;
}

function finalPortalCourseDescription(courseId) {
  return courseId === "vu2"
    ? "Fördjupande slutprov för VU2 med situationer, arbetsmiljö och avancerad juridik."
    : "Slutprov för VU1 med regler, juridik, arbetsmiljö och yrkesetik från grundutbildningen.";
}

function renderFinalExamPortalCard(overview) {
  const cardDescription = finalPortalCourseDescription(overview.courseId);
  const actionIcon = overview.disabled ? "lock" : overview.action === "resume" ? "play-circle" : "arrow-right";

  return `
    <article class="final-portal-card final-portal-card-${overview.tone}">
      <div class="final-portal-card-head">
        <span class="final-portal-icon"><i data-lucide="${overview.icon}"></i></span>
        <span class="final-portal-status final-portal-status-${overview.tone}">${escapeHtml(overview.status)}</span>
      </div>
      <div class="final-portal-card-copy">
        <span>${escapeHtml(overview.course.shortLabel)}</span>
        <h2>${escapeHtml(overview.course.finalExamLabel)}</h2>
        <p>${escapeHtml(cardDescription)}</p>
      </div>
      <div class="final-portal-stats" aria-label="${escapeHtml(overview.course.shortLabel)} slutprovsstatus">
        <div>
          <span>Moduler klara</span>
          <strong>${overview.moduleStats.completed}/${overview.moduleStats.total}</strong>
        </div>
        <div>
          <span>Kursprogress</span>
          <strong>${overview.courseProgress.percent}%</strong>
        </div>
        <div>
          <span>Frågepool</span>
          <strong>${overview.poolCount}</strong>
        </div>
      </div>
      <p class="final-portal-detail">${escapeHtml(overview.detail)}</p>
      <button class="final-portal-action" type="button"
        data-final-portal-course="${overview.courseId}"
        data-final-portal-action="${overview.action}"
        ${overview.disabled ? 'disabled aria-disabled="true"' : ""}>
        <span>${escapeHtml(overview.actionLabel)}</span>
        <i data-lucide="${actionIcon}"></i>
      </button>
    </article>
  `;
}

function renderFinalExamPortal() {
  const overviews = Object.keys(COURSE_CONFIG).map((courseId) => getFinalExamPortalOverview(courseId));

  return `
    <section class="final-portal" aria-labelledby="finalPortalTitle">
      ${renderFinalPortalMobileHead()}
      <div class="final-portal-head">
        <div>
          <span>Väktarutbildning</span>
          <h1 id="finalPortalTitle">Slutprov</h1>
          <p>Provläge · en fråga i taget · inget facit förrän du lämnat in.</p>
        </div>
      </div>
      <section class="final-portal-hero" aria-label="Information om slutprov">
        <div class="final-portal-hero-copy">
          <span>Skarpt kunskapstest</span>
          <h2>Dags för slutprovet</h2>
          <p>Slutprovet är ditt skarpa kunskapstest. Till skillnad från Quiz Portalen får du inget facit under provets gång — du svarar på alla frågor, lämnar in, och ser sedan ditt resultat. Läs varje fråga noga.</p>
        </div>
        <div class="final-portal-rules" aria-label="Regler">
          <div><i data-lucide="clock-3"></i><span>${Math.round(FINAL_EXAM_DURATION_MS / 60000)} min tidsgräns</span></div>
          <div><i data-lucide="badge-check"></i><span>Godkänt vid ${getFinalExamRequiredCorrect(FINAL_EXAM_SIZE)}/${FINAL_EXAM_SIZE}</span></div>
          <div><i data-lucide="lock"></i><span>24h spärr vid underkänt</span></div>
        </div>
      </section>

      <section class="final-portal-exam-list" aria-label="Välj prov">
        <div class="final-portal-list-head">
          <h2>Välj prov</h2>
          <span>VU1 och VU2</span>
        </div>
      <div class="final-portal-grid">
        ${overviews.map((overview) => renderFinalExamPortalCard(overview)).join("")}
      </div>
      </section>
      ${renderFinalPortalMobileTabbar()}
    </section>
  `;
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function pickFinalExamQuestions() {
  const previousIds = new Set(state.finalExam?.questionIds || []);
  const freshQuestions = state.finalExamPool.filter((question) => !previousIds.has(question.id));
  const fallbackQuestions = state.finalExamPool.filter((question) => previousIds.has(question.id));
  return [...shuffleItems(freshQuestions), ...shuffleItems(fallbackQuestions)].slice(0, FINAL_EXAM_SIZE);
}

function startFinalExam() {
  if (!isPremiumMember()) {
    openPremiumModal("final_exam");
    return;
  }

  if (state.finalExam && !state.finalExam.completedAt) {
    showFinalExam();
    return;
  }

  const lock = getFinalExamLockInfo();
  if (lock.locked) {
    showToast(`Nytt slutprov kan startas om ${formatRemainingTime(lock.remaining)}.`);
    showFinalExam();
    return;
  }

  if (!canStartFinalExam()) {
    showToast("Slutprovet låses upp när alla moduler är klara.");
    return;
  }

  if (state.finalExamPool.length < FINAL_EXAM_SIZE) {
    showToast("Frågepoolen är för liten för ett slutprov på 30 frågor.");
    return;
  }

  const selectedQuestions = pickFinalExamQuestions();
  state.finalExam = {
    id: `${state.courseId}-final-${Date.now()}`,
    createdAt: Date.now(),
    completedAt: null,
    currentIndex: 0,
    endsAt: Date.now() + FINAL_EXAM_DURATION_MS,
    reviewMode: false,
    questionIds: selectedQuestions.map((question) => question.id),
    answers: {},
  };
  saveFinalExam();
  showFinalExam();
}

function ensureFinalExamIntegrity() {
  if (!state.finalExam?.questionIds?.length) return;

  const availableIds = new Set(state.finalExamPool.map((question) => question.id));
  const isValid = state.finalExam.questionIds.every((id) => availableIds.has(id));
  if (!isValid) {
    state.finalExam = null;
    saveFinalExam();
  }
}

function renderBreadcrumbs() {
  const module = getCurrentModule();
  const lesson = getCurrentLesson();
  const course = getCourseConfig();
  els.breadcrumbs.innerHTML = `
    <span>${course.shortLabel}</span>
    <i data-lucide="chevron-right"></i>
    <span>Modul ${moduleNumber(module)}</span>
    <i data-lucide="chevron-right"></i>
    <span>${escapeHtml(lessonNumber(lesson) || "Sammanfattning")}</span>
  `;
}

function isFinalExamNavigationUnlocked() {
  return Object.keys(COURSE_CONFIG).some((courseId) => {
    if (!isCourseUnlocked(courseId)) return false;
    return withCourseContext(courseId, () => canStartFinalExam() || Boolean(state.finalExam));
  });
}

function updateNavigationLock(selector, lockId, locked, label, reason) {
  const button = document.querySelector(`.main-nav ${selector}`);
  const lock = button?.querySelector(`[data-nav-lock="${lockId}"]`);
  if (!button || !lock) return;

  lock.hidden = !locked;
  button.classList.toggle("is-locked", locked);
  button.setAttribute("aria-label", locked ? `${label}, låst. ${reason}` : label);
}

function renderNavigationLocks() {
  updateNavigationLock(
    "[data-open-vu2]",
    "vu2",
    !isCourseUnlocked("vu2"),
    "VU2",
    "Slutför och klara VU1 för att låsa upp."
  );
  updateNavigationLock(
    "[data-open-final-exam-portal]",
    "final-exam",
    !isFinalExamNavigationUnlocked(),
    "Slutprov",
    "Slutför kursens moduler för att låsa upp."
  );

  const vu2Locked = !isCourseUnlocked("vu2");
  const vu2LockReason = isPremiumMember()
    ? "Slutför och klara VU1 för att låsa upp."
    : "Premium krävs för att låsa upp.";
  document.querySelectorAll('[data-mobile-course="vu2"]').forEach((button) => {
    button.classList.toggle("is-disabled", vu2Locked);
    button.setAttribute("aria-label", vu2Locked ? `VU2, låst. ${vu2LockReason}` : "VU2");
  });
}

function renderActiveNav() {
  document.querySelectorAll(".main-nav .nav-item").forEach((item) => item.classList.remove("is-active"));
  document.querySelectorAll(".vu1-hub-mobile-tabbar .vu1-hub-mobile-tab").forEach((item) => item.classList.remove("is-active"));
  document.querySelectorAll(".quiz-portal-mobile-tabbar .quiz-portal-mobile-tab").forEach((item) => item.classList.remove("is-active"));
  document.querySelectorAll(".final-portal-mobile-tabbar .final-portal-mobile-tab").forEach((item) => item.classList.remove("is-active"));

  const selector =
    state.mode === "home"
      ? "[data-open-home]"
      : state.mode === "knowledge-base"
        ? "[data-open-knowledge-base]"
      : state.mode === "final-exam-portal" || state.mode === "final-exam"
        ? "[data-open-final-exam-portal]"
        : state.mode === "quiz" || state.mode === "quiz-overview"
        ? "[data-show-quiz]"
        : state.mode === "vu2"
          ? "[data-open-vu2]"
          : state.mode === "hub"
            ? "[data-open-course]"
            : state.courseId === "vu2"
              ? "[data-open-vu2]"
              : "[data-open-course]";
  document.querySelector(`.main-nav ${selector}`)?.classList.add("is-active");
  document.querySelector(`.vu1-hub-mobile-tabbar ${selector}`)?.classList.add("is-active");
  document.querySelector(`.quiz-portal-mobile-tabbar ${selector}`)?.classList.add("is-active");
  document.querySelector(`.final-portal-mobile-tabbar ${selector}`)?.classList.add("is-active");
  renderNavigationLocks();
}

function renderModuleContext() {
  const module = getCurrentModule();
  if (!module) return;
  const course = getCourseConfig();
  const progress = getModuleProgress(module, state.moduleIndex);

  els.moduleHeroMeta.textContent = `${course.educationLabel} · Modul ${moduleNumber(module)}`;
  els.moduleHeroTitle.textContent = moduleDisplayTitle(module);
  els.moduleHeroText.textContent = sentenceCase(module.objective || "Följ kursen sida för sida och repetera nyckelrutor inför quiz.");
  els.moduleInfoProgress.textContent = `${progress}%`;
  els.moduleInfoTime.textContent = moduleMetaSummary(module);
  els.moduleInfoLessons.innerHTML = module.lessons
    .map(
      (item, index) => `
        <li class="${index === state.lessonIndex ? "is-active" : ""}" ${index === state.lessonIndex ? 'aria-current="step"' : ""}>
          <span>${index + 1}</span>
          <strong>${escapeHtml(item.title.replace(/^\d+\.\d+\s+/, ""))}</strong>
        </li>
      `
    )
    .join("");
  els.moduleInfoPanel.hidden = true;
  els.moduleInfoButton.setAttribute("aria-expanded", "false");
  els.moduleInfoButton.setAttribute("aria-label", "Visa modulinformation");
}

function setBodyLayoutMode(mode = "") {
  const isModernCourseHub = mode === "course-hub-modern";
  if (mode !== "final-exam-focus") stopFinalExamTimer();
  if (els.knowledgeBasePanel) els.knowledgeBasePanel.hidden = mode !== "knowledge-base";
  document.body.classList.toggle("home-mode", mode === "home");
  document.body.classList.toggle("knowledge-base-mode", mode === "knowledge-base");
  document.body.classList.toggle("cv-builder-mode", mode === "knowledge-base" && state.knowledgeBaseTab === "cv");
  document.body.classList.toggle("quiz-overview-mode", mode === "quiz-overview");
  document.body.classList.toggle("final-portal-mode", mode === "final-portal");
  document.body.classList.toggle("final-exam-focus-mode", mode === "final-exam-focus");
  document.body.classList.toggle("final-exam-result-mode", mode === "final-exam-result");
  document.body.classList.toggle("module-milestone-mode", mode === "module-milestone");
  document.body.classList.toggle("lesson-mobile-mode", mode === "lesson");
  document.body.classList.toggle("course-hub-modern-mode", isModernCourseHub);
  document.body.classList.toggle("vu1-hub-mode", isModernCourseHub && state.courseId === "vu1");
  document.body.classList.toggle("vu2-hub-mode", isModernCourseHub && state.courseId === "vu2");
}

function showKnowledgeBase(tab) {
  if (KNOWLEDGE_BASE_TABS.has(tab)) state.knowledgeBaseTab = tab;
  else if (!KNOWLEDGE_BASE_TABS.has(state.knowledgeBaseTab)) state.knowledgeBaseTab = "lonekollen";
  state.mode = "knowledge-base";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = true;
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = true;
  els.quizButton.hidden = true;
  setBodyLayoutMode("knowledge-base");
  els.lessonTitle.textContent = "Kunskapsbas";
  els.breadcrumbs.innerHTML = "";
  renderKnowledgeBaseSidebar();
  renderKnowledgeBasePanel();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "auto" });
}

function showHome() {
  state.mode = "home";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = false;
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = true;
  els.quizButton.hidden = false;
  setBodyLayoutMode("home");
  els.lessonTitle.textContent = "Hem";
  els.breadcrumbs.innerHTML = "";
  setQuizButtonLabel("Starta quiz");

  hideModuleList();
  renderHome();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function showFinalExamPortal() {
  if (!isPremiumMember()) {
    openPremiumModal("final_exam");
    return;
  }

  state.mode = "final-exam-portal";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = false;
  els.homePanel.innerHTML = renderFinalExamPortal();
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = true;
  els.quizButton.hidden = true;
  setBodyLayoutMode("final-portal");
  els.lessonTitle.textContent = "Slutprov";
  els.breadcrumbs.innerHTML = "";

  hideModuleList();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function renderModuleMilestone() {
  const module = getCurrentModule();
  if (!module) return;

  const course = getCourseConfig();
  const topics = allPages(module);
  const quizCount = module.quiz.length;
  const actionState = getModuleActionState(state.moduleIndex);
  const currentModuleNumber = moduleNumber(module);

  if (els.moduleMilestoneKickerIcon) {
    els.moduleMilestoneKickerIcon.innerHTML = `<i data-lucide="${actionState.icon}"></i>`;
  }
  els.moduleMilestoneKicker.textContent = `${course.shortLabel} · Modul ${currentModuleNumber} · ${actionState.status}`;
  els.moduleMilestoneTitle.textContent = moduleDisplayTitle(module);
  els.moduleMilestoneObjective.textContent = sentenceCase(
    hasVisitedAnyPage(state.moduleIndex) || isModuleComplete(state.moduleIndex)
      ? actionState.objective
      : module.objective || actionState.objective
  );
  els.moduleMilestoneOutline.innerHTML = module.lessons
    .map((lesson, lessonIndex) => {
      const item = moduleOutlineItem(lesson, currentModuleNumber, lessonIndex);
      return `
        <li class="${item.isSummary ? "is-summary" : ""}">
          <span class="module-milestone-outline-index">
            ${item.isSummary ? '<i data-lucide="flag"></i>' : escapeHtml(item.badge)}
          </span>
          <span>${escapeHtml(item.title)}</span>
        </li>
      `;
    })
    .join("");
  els.moduleMilestoneTime.textContent = moduleMetaSummary(module);
  els.moduleMilestonePages.textContent = `${topics.length} ämnen`;
  els.moduleMilestoneQuiz.textContent = quizCount ? `${quizCount} frågor` : "Inget quiz";
  els.moduleMilestoneStartButton.dataset.module = state.moduleIndex;
  els.moduleMilestoneStartButton.dataset.lesson = state.lessonIndex;
  els.moduleMilestoneStartButton.dataset.page = state.pageIndex;
  els.moduleMilestoneStartButton.querySelector("span").textContent = actionState.label;
}

function showModuleMilestone(moduleIndex, lessonIndex = 0, pageIndex = 0) {
  const requestedModule = state.modules[moduleIndex];
  if (!requestedModule) return;

  state.moduleIndex = Math.max(0, Math.min(moduleIndex, state.modules.length - 1));
  state.lessonIndex = Math.max(0, Math.min(lessonIndex, requestedModule.lessons.length - 1));
  const requestedLesson = requestedModule.lessons[state.lessonIndex];
  state.pageIndex = Math.max(0, Math.min(pageIndex, (requestedLesson?.pages.length || 1) - 1));
  state.mode = "module-milestone";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = true;
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = false;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = true;
  els.quizButton.hidden = true;
  setBodyLayoutMode("module-milestone");
  els.lessonTitle.textContent = `Modul ${moduleNumber(requestedModule)}`;
  els.breadcrumbs.innerHTML = `
    <span>${getCourseConfig().shortLabel}</span>
    <i data-lucide="chevron-right"></i>
    <span>${state.moduleIndex === 0 ? "Modulstart" : "Milstolpe"}</span>
  `;

  renderModuleMilestone();
  renderModuleList();
  renderContext();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCourseHubMobileProgress() {
  const module = getCurrentModule();
  if (!module || isFinalExamModule(module)) {
    return "";
  }

  const progress = getModuleProgress(module, state.moduleIndex);
  const lessons = module.lessons
    .map((lesson, lessonIndex) => {
      const pageSummary = lesson.pages
        .map((page) => page.title.replace(/^Sida\s+\d+:\s*/, ""))
        .filter(Boolean)
        .join(" · ");
      const isActive = lessonIndex === state.lessonIndex;

      return `
        <div class="vu1-mobile-progress-step ${isActive ? "is-active" : ""}">
          <span class="vu1-mobile-progress-dot"></span>
          <div>
            <strong>${escapeHtml(lesson.title)}</strong>
            ${pageSummary ? `<p>${escapeHtml(pageSummary)}</p>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="vu1-mobile-progress-head">
      <span>Din progress · Modul ${moduleNumber(module)}</span>
      <strong>${progress}%</strong>
    </div>
    <div class="vu1-mobile-progress-track"><span style="width: ${progress}%"></span></div>
    <p>${escapeHtml(sentenceCase(module.objective || "Kursmaterial med lektionssidor, sammanfattning och quiz."))}</p>
    <div class="vu1-mobile-progress-subhead">
      <span>Aktuell modul</span>
      <small>${escapeHtml(moduleMetaSummary(module))}</small>
    </div>
    <div class="vu1-mobile-progress-list">${lessons}</div>
  `;
}

function renderCourseHub() {
  const course = getCourseConfig();
  const courseProgress = getCourseProgress();
  const moduleStats = getContentModuleStats();
  const hasFinalExam = state.modules.some((module) => isFinalExamModule(module));
  const continuePosition = getLastAccessiblePosition();
  const continueModule = state.modules[continuePosition.moduleIndex];
  const continueLesson = continueModule?.lessons[continuePosition.lessonIndex];
  const continuePage = continueLesson?.pages[continuePosition.pageIndex];
  const moduleProgress = continueModule ? getModuleProgress(continueModule, continuePosition.moduleIndex) : 0;
  const quizSummary = getQuizSummary();

  const courseTitle = course.fullTitle.replace(" - ", " \u2013 ");
  els.courseHubTitle.textContent = courseTitle;
  els.courseHubMeta.textContent = `${moduleStats.total} moduler${hasFinalExam ? " · slutprov" : ""} · lektionssidor och quiz`;
  els.courseHubPercent.textContent = `${courseProgress.percent}%`;
  els.courseHubRing.style.setProperty("--ring-progress", String(courseProgress.percent));
  if (els.vu1HubMobileAvatar && !state.authClient?.user) {
    els.vu1HubMobileAvatar.textContent = userInitials(state.user.displayName || state.user.firstName || "Sven", "");
  }
  if (els.vu1HubMobileProgress) {
    els.vu1HubMobileProgress.innerHTML = renderCourseHubMobileProgress();
  }
  els.hubContinueTitle.textContent = continueModule
    ? `Modul ${moduleNumber(continueModule)} · ${moduleDisplayTitle(continueModule)}`
    : course.shortLabel;
  els.hubContinueMeta.textContent = isFinalExamModule(continueModule)
    ? state.finalExam?.completedAt
      ? "Slutprovet är inlämnat"
      : state.finalExam
        ? `${getFinalExamAnsweredCount()}/${state.finalExam.questionIds.length} svarade`
        : `${FINAL_EXAM_SIZE} slumpade frågor`
    : continuePage
      ? `${continueLesson.title} · ${continuePage.title.replace(/^Sida\s+\d+:\s*/, "")}`
      : "Starta utbildningen";
  els.hubContinueBar.style.width = `${moduleProgress}%`;
  els.hubContinueButton.dataset.module = continuePosition.moduleIndex;
  els.hubContinueButton.dataset.lesson = continuePosition.lessonIndex;
  els.hubContinueButton.dataset.page = continuePosition.pageIndex;
  els.hubCompletedModules.textContent = `${moduleStats.completed} av ${moduleStats.total}`;
  els.hubCompletedPages.textContent = `${courseProgress.visited} av ${courseProgress.total}`;
  els.hubQuizScore.textContent = quizSummary.percent === null ? "Ej startat" : `${quizSummary.percent}%`;
  els.hubModuleCount.textContent = `${moduleStats.completed} av ${moduleStats.total} moduler klara`;

  els.hubModuleList.innerHTML = state.modules
    .map((module, moduleIndex) => {
      const progress = getModuleProgress(module, moduleIndex);
      const complete = isModuleComplete(moduleIndex);
      const membershipLocked = isModuleMembershipLocked(moduleIndex);
      const progressionLocked = !membershipLocked && (isFinalExamModule(module) ? !canAccessFinalExam() : !isModuleUnlocked(moduleIndex));
      const locked = membershipLocked || progressionLocked;
      const pages = allPages(module);
      const quizCount = module.quiz.length;
      const detailText = isFinalExamModule(module)
        ? `${FINAL_EXAM_SIZE} slumpade frågor`
        : quizCount
          ? `${pages.length} sidor · ${quizCount} frågor`
          : `${pages.length} sidor`;
      const statusText = isFinalExamModule(module)
        ? locked
          ? "Låst"
          : state.finalExam?.completedAt
          ? "Inlämnat"
          : state.finalExam
            ? "Fortsätt prov"
            : "Redo"
        : complete
          ? `Klar · ${pages.length}/${pages.length}`
          : locked
            ? "Låst"
            : progress
              ? `${progress}%`
              : "Ej påbörjad";
      return `
        <button class="hub-module-row ${complete ? "is-complete" : ""} ${moduleIndex === state.moduleIndex && state.mode !== "home" ? "is-current" : ""} ${locked ? "is-locked" : ""} ${membershipLocked ? "is-premium-lock" : ""}"
          type="button" data-hub-module="${moduleIndex}" ${membershipLocked ? 'data-premium-lock="content" aria-label="Låst Premium-modul. Visa Premium."' : progressionLocked ? 'disabled aria-disabled="true"' : ""}>
          <span class="hub-module-index">${membershipLocked ? '<i data-lucide="lock"></i>' : complete ? '<i data-lucide="check"></i>' : moduleNumber(module)}</span>
          <span class="hub-module-copy">
            <strong>${escapeHtml(moduleDisplayTitle(module))}</strong>
            <small>${escapeHtml(detailText)}</small>
          </span>
          <span class="hub-module-status">
            ${statusText}
          </span>
        </button>
      `;
    })
    .join("");
}

function showCourseHub() {
  activateCourse("vu1");
  state.mode = "hub";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = true;
  els.courseHub.hidden = false;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = true;
  els.quizButton.hidden = false;
  setBodyLayoutMode("course-hub-modern");
  els.lessonTitle.textContent = getCourseConfig().shortLabel;
  els.breadcrumbs.innerHTML = "";
  setQuizButtonLabel("Starta quiz");

  renderCourseHub();
  renderModuleList();
  renderContext();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function showVu2() {
  if (!isPremiumMember()) {
    openPremiumModal("vu2");
    return;
  }

  if (!isCourseUnlocked("vu2")) {
    showToast("VU2 låses upp när VU1 är klar.");
    showHome();
    return;
  }

  activateCourse("vu2");
  state.mode = "vu2";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = false;
  els.courseHub.hidden = false;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = true;
  els.quizButton.hidden = false;
  setBodyLayoutMode("course-hub-modern");
  els.lessonTitle.textContent = getCourseConfig().shortLabel;
  els.breadcrumbs.innerHTML = "";
  setQuizButtonLabel("Starta quiz");

  els.homePanel.hidden = true;
  els.homePanel.innerHTML = "";

  renderCourseHub();
  renderModuleList();
  renderContext();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function renderReader() {
  const module = getCurrentModule();
  const lesson = getCurrentLesson();
  const page = getCurrentPage();

  if (!module || !lesson || !page) return;

  els.homePanel.hidden = true;
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = false;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = state.mode !== "lesson";
  els.quizPanel.hidden = state.mode !== "quiz";
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = false;
  els.quizButton.hidden = false;
  setBodyLayoutMode(state.mode === "lesson" ? "lesson" : "");
  els.lessonTitle.textContent = lesson.title.replace(/^\d+\.\d+\s+/, "");
  els.timeEstimate.textContent = moduleMetaSummary(module);
  els.pageCount.textContent = `Sida ${state.pageIndex + 1} av ${lesson.pages.length}`;
  setQuizButtonLabel(isFinalExamModule(module) ? "Starta slutprov" : "Starta quiz");
  renderModuleContext();

  const mobilePageTitle = page.title.replace(/^Sida\s+\d+:\s*/, "");
  const mobileProgress = ((state.pageIndex + 1) / lesson.pages.length) * 100;
  els.pageTabs.innerHTML = `
    <div class="lesson-step-progress">
      <span>Steg ${state.pageIndex + 1} av ${lesson.pages.length}</span>
      <strong>${escapeHtml(mobilePageTitle)}</strong>
      <div aria-hidden="true"><i style="width: ${mobileProgress}%"></i></div>
    </div>
  `;

  els.article.innerHTML = `<h1>${escapeHtml(mobilePageTitle)}</h1><div class="lesson-reading-time"><i data-lucide="clock-3"></i><span>${estimateReadingMinutes(page)} min</span></div>${renderBlocks(page.body)}${
    isFinalExamModule(module) ? renderFinalExamInlineCta() : ""
  }`;

  const flatPages = allPages(module);
  const flatIndex = flatPages.findIndex(
    (item) => item.lessonIndex === state.lessonIndex && item.pageIndex === state.pageIndex
  );
  const hasPreviousPage = flatIndex > 0;
  els.prevButton.disabled = !hasPreviousPage;
  els.prevButton.style.visibility = hasPreviousPage ? "visible" : "hidden";
  els.prevButton.setAttribute("aria-hidden", String(!hasPreviousPage));
  els.prevButton.tabIndex = hasPreviousPage ? 0 : -1;
  els.nextButton.querySelector("span").textContent =
    flatIndex === flatPages.length - 1
      ? isFinalExamModule(module)
        ? "Till slutprov"
        : "Till quiz"
      : "Nästa sida";

  renderBreadcrumbs();
  renderModuleList();
  renderContext();
  renderQuiz();
  renderActiveNav();
  refreshIcons();
}

function renderContext() {
  const module = getCurrentModule();
  const progress = getModuleProgress(module, state.moduleIndex);
  els.progressModule.textContent = `Modul ${moduleNumber(module)}`;
  els.progressPercent.textContent = `${progress}%`;
  els.progressBar.style.width = `${progress}%`;
  els.moduleHours.textContent = moduleMetaSummary(module);

  if (isFinalExamModule(module)) {
    const activeSession = state.finalExam && !state.finalExam.completedAt;
    const completedSession = state.finalExam?.completedAt;
    const lock = getFinalExamLockInfo();
    const statusText = completedSession
      ? lock.locked
        ? `Inlämnat. Nytt prov om ${formatRemainingTime(lock.remaining)}.`
        : "Inlämnat. Nytt prov kan startas."
      : activeSession
        ? `${getFinalExamAnsweredCount()}/${state.finalExam.questionIds.length} frågor besvarade.`
        : `${FINAL_EXAM_SIZE} slumpade frågor.`;

    els.progressSummary.textContent = `Slutprov med ${FINAL_EXAM_SIZE} slumpade frågor.`;
    els.lessonTimeline.innerHTML = `
      <div class="lesson-step is-active">
        <span class="step-dot"></span>
        <div>
          <div class="timeline-title">
            <h3>Modul ${moduleNumber(module)} Slutprov</h3>
          </div>
          <div class="step-pages">
            <span class="step-page is-active">${statusText}</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  els.progressSummary.textContent = sentenceCase(module.objective || "Kursmaterial med lektionssidor, sammanfattning och quiz.");

  els.lessonTimeline.innerHTML = module.lessons
    .map((lesson, lessonIndex) => {
      const pages = lesson.pages
        .map((page, pageIndex) => {
          const id = pageId(state.moduleIndex, lessonIndex, pageIndex);
          const isActive = lessonIndex === state.lessonIndex && pageIndex === state.pageIndex;
          const unlocked = isPageUnlocked(state.moduleIndex, lessonIndex, pageIndex);
          return `
            <span class="step-page ${isActive ? "is-active" : ""} ${state.visited.has(id) ? "is-visited" : ""} ${unlocked ? "" : "is-locked"}"
              ${isActive ? 'aria-current="step"' : ""}>
              ${escapeHtml(page.title.replace(/^Sida\s+\d+:\s*/, ""))}
            </span>
          `;
        })
        .join("");
      const lessonUnlocked = isPageUnlocked(state.moduleIndex, lessonIndex, 0);

      return `
        <div class="lesson-step ${lessonIndex === state.lessonIndex ? "is-active" : ""} ${lessonUnlocked ? "" : "is-locked"}">
          <span class="step-dot"></span>
          <div>
            <div class="timeline-title">
              <h3>${escapeHtml(lesson.title)}</h3>
            </div>
            <div class="step-pages">${pages}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function resetQuizPortalSession(view = state.quizPortal.view) {
  stopQuizPortalQuestionTimer();
  state.quizPortal.view = view;
  state.quizPortal.sessionQuestions = [];
  state.quizPortal.currentIndex = 0;
  state.quizPortal.selectedOption = null;
  state.quizPortal.answers = [];
  state.quizPortal.isAnswered = false;
  state.quizPortal.timedOut = false;
  state.quizPortal.questionTimeRemaining = QUIZ_PORTAL_QUESTION_TIME_SECONDS;
  state.quizPortal.questionDeadline = 0;
  state.quizPortal.score = 0;
  state.quizPortal.showResults = false;
  state.quizPortal.historyAttemptId = "";
  state.quizPortal.flashcardIndex = 0;
  state.quizPortal.flashcardFlipped = false;
}

let quizPortalDataPromise = null;
let quizPortalCountdownToken = 0;
let quizPortalCountdownTimers = [];
let quizPortalQuestionTimer = null;

const QUIZ_PORTAL_SESSION_SIZE = 15;
const QUIZ_PORTAL_QUESTION_TIME_SECONDS = 30;
const QUIZ_PORTAL_QUESTION_TIME_MS = QUIZ_PORTAL_QUESTION_TIME_SECONDS * 1000;

const QUIZ_PORTAL_BANK_CONFIG = {
  vu1: {
    collectionId: "vu1_quiz",
    title: "Väktarutbildning 1 (VU1)",
    expectedCount: 154,
    sourceType: "portal_vu1",
    courseId: "vu1",
  },
  vu2: {
    collectionId: "vu2_quiz",
    title: "Väktarutbildning 2 (VU2)",
    expectedCount: 74,
    sourceType: "portal_vu2",
    courseId: "vu2",
  },
  scenario: {
    collectionId: "scenario_quiz",
    title: "Scenario Quiz",
    expectedCount: 300,
    sourceType: "portal_scenario",
    courseId: "general",
  },
};

const SALARY_CHECK_CONFIG = {
  reviewed: "22 juli 2026",
  agreementPeriod: "1 juni 2025–31 maj 2027",
  hourlyDivisor: 166,
  medianSalary: 35000,
  steps: [
    { key: "new", name: "Nyanställd", period: "0–6 mån", amount: 27004, exact: true },
    { key: "base", name: "Grundlön", period: "6–15 mån", amount: 28296, exact: true },
    { key: "group-b", name: "Lönegrupp B", period: "efter 15 mån", amount: 32354, exact: true },
    { key: "group-c", name: "Lönegrupp C", period: "efter 15 mån", amount: 32889, exact: true },
    { key: "group-d", name: "Lönegrupp D", period: "efter 15 mån", amount: 33648, exact: false },
    { key: "group-e", name: "Lönegrupp E", period: "efter 15 mån", amount: 34059, exact: false },
  ],
  ob: [
    { key: "a", label: "OB a", name: "Vardagskväll och natt", schedule: "mån–fre 18–06", amount: 27, tone: "blue" },
    { key: "b", label: "OB b", name: "Helgdag", schedule: "lör–sön 06–18", amount: 40, tone: "green" },
    { key: "b1", label: "OB b1", name: "Helgnatt", schedule: "lör–sön 18–06", amount: 45, tone: "purple" },
    { key: "c", label: "OB c", name: "Storhelg", schedule: "enligt avtalets tider", amount: 79, tone: "orange" },
    { key: "d", label: "OB d", name: "Jul, nyår och midsommar", schedule: "avtalets högsta OB", amount: 176, tone: "red" },
  ],
  presets: [
    { key: "day", name: "Dag, vardag", hours: { a: 0, b: 0, b1: 0, c: 0, d: 0 } },
    { key: "evening", name: "Kvällspass", hours: { a: 60, b: 8, b1: 0, c: 0, d: 0 } },
    { key: "night", name: "Nattpass", hours: { a: 84, b: 0, b1: 28, c: 2, d: 0 } },
    { key: "weekend", name: "Helgmix", hours: { a: 36, b: 20, b1: 16, c: 2, d: 0 } },
  ],
};

const salaryCheckState = {
  stepKey: "base",
  presetKey: "day",
  hours: Object.fromEntries(SALARY_CHECK_CONFIG.ob.map((item) => [item.key, 0])),
};

function shuffledQuizOptions(rows) {
  const options = [...rows]
    .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0))
    .map((option) => ({ text: option.option_text, correct: Boolean(option.is_correct) }));

  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }
  return options;
}

function humanizeQuizTopic(value) {
  const words = String(value || "")
    .replace(/[_-]+/g, " ")
    .trim();
  return words ? `${words.charAt(0).toUpperCase()}${words.slice(1)}` : "Kunskapsområde";
}

function getQuizPortalQuestionTopics(row, config) {
  const moduleNumberValue = Number(row.module_number);
  if (config.courseId !== "general" && Number.isInteger(moduleNumberValue) && moduleNumberValue > 0) {
    return {
      topicKeys: [`${config.courseId}:module:${moduleNumberValue}`],
      topicLabels: [row.metadata?.module_label || row.title || `Modul ${moduleNumberValue}`],
      contextKey: null,
      contextLabel: null,
    };
  }

  const excludedTags = new Set([
    row.metadata?.category,
    row.metadata?.level,
    row.metadata?.source,
    row.source,
    "general",
    "grund",
    "fordjupning",
    "v1",
    "v2",
  ].filter(Boolean));
  const topicTags = (Array.isArray(row.tags) ? row.tags : []).filter((tag) => !excludedTags.has(tag));
  const resolvedTags = topicTags.length ? topicTags : [row.metadata?.category || "scenario"];
  return {
    topicKeys: resolvedTags.map((tag) => `scenario:${tag}`),
    topicLabels: resolvedTags.map(humanizeQuizTopic),
    contextKey: row.metadata?.category || null,
    contextLabel: row.metadata?.category_label || row.title || null,
  };
}

function buildQuizPortalQuiz(rows, config) {
  if (rows.length !== config.expectedCount) {
    throw new Error(`${config.title} innehåller ${rows.length} av förväntade ${config.expectedCount} frågor.`);
  }

  return {
    title: config.title,
    questions: rows
      .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0))
      .map((row) => {
        const options = shuffledQuizOptions(row.quiz_answer_options || []);
        const topics = getQuizPortalQuestionTopics(row, config);
        if (options.length !== 4 || options.filter((option) => option.correct).length !== 1) {
          throw new Error(`Frågan ${row.id} har ogiltiga svarsalternativ.`);
        }
        return {
          id: row.id,
          collectionId: row.collection_id,
          sourceType: config.sourceType,
          courseId: config.courseId,
          moduleNumber: Number(row.module_number) || null,
          question: row.prompt,
          options: options.map((option) => option.text),
          answer: options.findIndex((option) => option.correct),
          explanation: row.explanation || "Rätt svar framgår av det markerade alternativet.",
          ...topics,
        };
      }),
  };
}

function buildQuizPortalFlashcards(rows) {
  if (rows.length !== 200) {
    throw new Error(`Flashcards innehåller ${rows.length} av förväntade 200 kort.`);
  }
  return rows
    .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0))
    .map((row) => ({
      id: row.id,
      term: row.prompt,
      definition: row.answer_text,
      category: row.metadata?.category_label || "Väktarkunskap",
      level: row.metadata?.level || "grund",
    }));
}

function loadQuizPortalData() {
  if (state.quizPortal.dataStatus === "ready") return Promise.resolve();
  if (quizPortalDataPromise) return quizPortalDataPromise;

  state.quizPortal.dataStatus = "loading";
  state.quizPortal.dataError = "";
  quizPortalDataPromise = (async () => {
    try {
      const api = window.vaktskolanSupabase;
      if (!api?.select) throw new Error("Supabase-anslutningen är inte tillgänglig.");
      const collectionIds = [...Object.values(QUIZ_PORTAL_BANK_CONFIG).map((config) => config.collectionId), "flashcards"];
      const rows = await api.select("quiz_questions", {
        select:
          "id,collection_id,course_id,module_number,title,prompt,answer_text,explanation,tags,source,sort_order,metadata,quiz_answer_options(label,option_text,is_correct,sort_order)",
        collection_id: `in.(${collectionIds.join(",")})`,
        status: "eq.published",
        order: "sort_order.asc",
        limit: 1000,
      }, { auth: "public" });

      state.quizPortal.quizzes = Object.fromEntries(
        Object.entries(QUIZ_PORTAL_BANK_CONFIG).map(([view, config]) => [
          view,
          buildQuizPortalQuiz(rows.filter((row) => row.collection_id === config.collectionId), config),
        ])
      );
      state.quizPortal.flashcards = buildQuizPortalFlashcards(rows.filter((row) => row.collection_id === "flashcards"));
      state.quizPortal.dataStatus = "ready";
    } catch (error) {
      console.error("Quiz Portal-data kunde inte laddas.", error);
      state.quizPortal.dataStatus = "error";
      state.quizPortal.dataError = error?.message || "Frågebankerna kunde inte laddas.";
    } finally {
      quizPortalDataPromise = null;
      if (state.mode === "quiz-overview") {
        if (els.quizPortal?.querySelector("[data-quiz-portal-countdown]")) {
          renderQuizPortalSidebar();
        } else if (state.quizPortal.view === "home") {
          updateQuizPortalModuleMeta();
        } else {
          renderQuizOverview();
          refreshIcons();
        }
      }
    }
  })();
  return quizPortalDataPromise;
}

function getQuizPortalQuiz(view = state.quizPortal.view) {
  return state.quizPortal.quizzes[view] || null;
}

function getQuizPortalQuestionByKey(questionKey) {
  if (!questionKey.startsWith("portal:")) return null;
  const questionId = questionKey.slice("portal:".length);
  for (const quiz of Object.values(state.quizPortal.quizzes)) {
    const question = quiz.questions.find((item) => item.id === questionId);
    if (question) return question;
  }
  return null;
}

function getModuleReviewQuestion(item) {
  const match = item.questionKey.match(/^module:(vu1|vu2):(\d+):(\d+)$/);
  if (!match) return null;
  const [, courseId, moduleNumberValue, questionNumberValue] = match;

  return withCourseContext(courseId, () => {
    const module = state.modules.find((candidate) => String(moduleNumber(candidate)) === moduleNumberValue);
    const question = module?.quiz.find((candidate) => String(candidate.number) === questionNumberValue);
    if (!module || !question) return null;
    const answerIndex = question.options.findIndex((option) => option.letter === question.correct);
    if (answerIndex < 0) return null;
    return {
      id: item.questionKey,
      questionId: null,
      historyQuestionKey: item.questionKey,
      originSourceType: item.originSourceType,
      courseId,
      moduleNumber: Number(moduleNumberValue),
      question: question.question,
      options: question.options.map((option) => option.text),
      answer: answerIndex,
      explanation: question.explanation || "Rätt svar framgår av det markerade alternativet.",
      topicKeys: item.topicKeys,
      topicLabels: item.topicLabels,
      contextKey: item.contextKey,
      contextLabel: item.contextLabel,
    };
  });
}

function resolveQuizReviewQuestion(item) {
  const portalQuestion = getQuizPortalQuestionByKey(item.questionKey);
  if (portalQuestion) {
    return {
      ...portalQuestion,
      questionId: portalQuestion.id,
      historyQuestionKey: item.questionKey,
      originSourceType: item.originSourceType,
      topicKeys: item.topicKeys,
      topicLabels: item.topicLabels,
      contextKey: item.contextKey,
      contextLabel: item.contextLabel,
    };
  }
  return getModuleReviewQuestion(item);
}

function buildQuizReviewSessionQuestions() {
  return getQuizReviewQueue().due
    .map(resolveQuizReviewQuestion)
    .filter(Boolean)
    .slice(0, QUIZ_REVIEW_SESSION_SIZE);
}

function getQuizPortalSessionQuiz(view = state.quizPortal.view) {
  if (view === "review") {
    return {
      title: "Att repetera",
      questions: view === state.quizPortal.view ? state.quizPortal.sessionQuestions : [],
    };
  }
  const quiz = getQuizPortalQuiz(view);
  if (!quiz) return null;

  if (view === state.quizPortal.view && !state.quizPortal.sessionQuestions.length) {
    state.quizPortal.sessionQuestions = shuffleItems(quiz.questions).slice(0, QUIZ_PORTAL_SESSION_SIZE);
  }

  return {
    title: quiz.title,
    questions: view === state.quizPortal.view ? state.quizPortal.sessionQuestions : [],
  };
}

function startQuizPortalHistoryAttempt(view = state.quizPortal.view) {
  if (state.quizPortal.historyAttemptId) {
    return state.quizHistory.attempts.find((attempt) => attempt.id === state.quizPortal.historyAttemptId) || null;
  }
  const config = view === "review"
    ? { sourceType: "review", collectionId: null, courseId: "general" }
    : QUIZ_PORTAL_BANK_CONFIG[view];
  const quiz = getQuizPortalSessionQuiz(view);
  if (!config || !quiz?.questions.length) return null;

  const attemptId = createClientUuid();
  const attempt = recordQuizAttempt({
    id: attemptId,
    sourceType: config.sourceType,
    sourceRef: `${view === "review" ? "review" : "portal"}:${view}:${attemptId}`,
    collectionId: config.collectionId,
    courseId: config.courseId,
    questionCount: quiz.questions.length,
    correctCount: 0,
    completed: false,
  });
  state.quizPortal.historyAttemptId = attempt?.id || "";
  return attempt;
}

function recordQuizPortalAnswer(question, selectedOption, timedOut = false) {
  const attempt = startQuizPortalHistoryAttempt();
  if (!attempt || !question) return;
  const correctOption = question.answer;
  const isReview = state.quizPortal.view === "review";
  recordQuizAnswer({
    attemptId: attempt.id,
    questionId: Object.prototype.hasOwnProperty.call(question, "questionId") ? question.questionId : question.id,
    questionKey: question.historyQuestionKey || `portal:${question.id}`,
    sourceType: isReview ? "review" : question.sourceType,
    courseId: question.courseId,
    moduleNumber: question.moduleNumber,
    topicKeys: question.topicKeys,
    topicLabels: question.topicLabels,
    contextKey: question.contextKey,
    contextLabel: question.contextLabel,
    selectedAnswer: Number.isInteger(selectedOption) ? question.options[selectedOption] : null,
    correctAnswer: question.options[correctOption],
    isCorrect: Number.isInteger(selectedOption) && selectedOption === correctOption,
    timedOut,
  });
}

function completeQuizPortalHistoryAttempt() {
  if (!state.quizPortal.historyAttemptId) return;
  updateQuizAttempt(state.quizPortal.historyAttemptId, {
    questionCount: state.quizPortal.sessionQuestions.length,
    correctCount: state.quizPortal.score,
    completed: true,
    completedAt: new Date().toISOString(),
  });
}

async function startQuizPortalReviewSession() {
  cancelQuizPortalCountdown();
  resetQuizPortalSession("review");
  renderQuizOverview();
  refreshIcons();

  if (state.quizPortal.dataStatus !== "ready") await loadQuizPortalData();
  if (state.mode !== "quiz-overview" || state.quizPortal.view !== "review") return;

  state.quizPortal.sessionQuestions = buildQuizReviewSessionQuestions();
  if (state.quizPortal.sessionQuestions.length) startQuizPortalHistoryAttempt("review");
  renderQuizOverview();
  refreshIcons();
  scrollQuizPortalToTop();
}

function stopQuizPortalQuestionTimer() {
  if (quizPortalQuestionTimer) window.clearInterval(quizPortalQuestionTimer);
  quizPortalQuestionTimer = null;
  state.quizPortal.questionDeadline = 0;
}

function scrollQuizPortalToTop() {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const isMobileViewport = window.matchMedia?.("(max-width: 940px)").matches;
  els.contentScroll.scrollTo({
    top: 0,
    behavior: prefersReducedMotion || isMobileViewport ? "auto" : "smooth",
  });
}

function renderQuizPortalPreservingAnchor(selector) {
  const scrollTop = els.contentScroll.scrollTop;
  const anchor = els.quizPortal?.querySelector(selector);
  const anchorTop = anchor?.getBoundingClientRect().top;

  renderQuizOverview();
  refreshIcons();

  const nextAnchor = els.quizPortal?.querySelector(selector);
  if (Number.isFinite(anchorTop) && nextAnchor) {
    const anchorOffset = nextAnchor.getBoundingClientRect().top - anchorTop;
    els.contentScroll.scrollTop = scrollTop + anchorOffset;
    return;
  }

  els.contentScroll.scrollTop = scrollTop;
}

function updateQuizPortalQuestionTimerUi() {
  const timer = els.quizPortal?.querySelector("[data-quiz-portal-question-timer]");
  if (!timer || !state.quizPortal.questionDeadline) return;

  const remainingMs = Math.max(0, state.quizPortal.questionDeadline - Date.now());
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  state.quizPortal.questionTimeRemaining = remainingSeconds;
  timer.style.setProperty("--quiz-time-progress", String(remainingMs / QUIZ_PORTAL_QUESTION_TIME_MS));
  timer.classList.toggle("is-warning", remainingSeconds <= 5 && remainingSeconds > 0);
  timer.classList.toggle("is-expired", remainingSeconds === 0);
  timer.setAttribute("aria-label", `${remainingSeconds} sekunder kvar`);

  const value = timer.querySelector("[data-quiz-portal-question-time]");
  if (value) value.textContent = String(remainingSeconds);
}

function quizPortalUsageKindForView(view) {
  if (view === "vu1") return "vu1_question";
  if (view === "scenario") return "scenario_question";
  return "";
}

async function answerQuizPortalQuestion(selectedOption, timedOut = false) {
  if (state.membership.usagePending || state.quizPortal.isAnswered) return;
  const quiz = getQuizPortalSessionQuiz();
  const question = quiz?.questions[state.quizPortal.currentIndex];
  if (!quiz || !question) return;

  if (!isPremiumMember() && ["review", "vu2", "general"].includes(state.quizPortal.view)) {
    openPremiumModal("content");
    return;
  }

  stopQuizPortalQuestionTimer();
  state.membership.usagePending = true;
  try {
    const usageKind = quizPortalUsageKindForView(state.quizPortal.view);
    if (usageKind && !(await consumeMembershipAllowance(usageKind, createClientUuid()))) return;

    state.quizPortal.questionTimeRemaining = timedOut ? 0 : state.quizPortal.questionTimeRemaining;
    state.quizPortal.answers[state.quizPortal.currentIndex] = Number.isInteger(selectedOption) ? selectedOption : null;
    state.quizPortal.selectedOption = Number.isInteger(selectedOption) ? selectedOption : null;
    state.quizPortal.isAnswered = true;
    state.quizPortal.timedOut = timedOut;
    if (Number.isInteger(selectedOption) && selectedOption === question.answer) state.quizPortal.score += 1;
    recordQuizPortalAnswer(question, selectedOption, timedOut);
    renderQuizPortalPreservingAnchor(
      Number.isInteger(selectedOption) ? `[data-quiz-portal-option="${selectedOption}"]` : ".quiz-portal-question h3"
    );
  } catch (error) {
    console.error("Quizsvaret kunde inte registreras mot medlemskapet.", error);
    showToast("Svaret kunde inte registreras. Försök igen.");
    if (!timedOut) startQuizPortalQuestionTimer();
  } finally {
    state.membership.usagePending = false;
  }
}

async function toggleQuizPortalFlashcard() {
  if (state.membership.usagePending) return;
  if (state.quizPortal.flashcardFlipped) {
    state.quizPortal.flashcardFlipped = false;
    renderQuizOverview();
    refreshIcons();
    return;
  }

  state.membership.usagePending = true;
  try {
    if (!(await consumeMembershipAllowance("flashcard_flip", createClientUuid()))) return;
    state.quizPortal.flashcardFlipped = true;
    renderQuizOverview();
    refreshIcons();
  } catch (error) {
    console.error("Flashcard-vändningen kunde inte registreras mot medlemskapet.", error);
    showToast("Kortet kunde inte vändas. Försök igen.");
  } finally {
    state.membership.usagePending = false;
  }
}

async function handleQuizPortalQuestionTimeout() {
  if (
    state.mode !== "quiz-overview" ||
    !Object.prototype.hasOwnProperty.call(QUIZ_PORTAL_BANK_CONFIG, state.quizPortal.view) ||
    state.quizPortal.isAnswered ||
    state.quizPortal.showResults
  ) {
    stopQuizPortalQuestionTimer();
    return;
  }
  await answerQuizPortalQuestion(null, true);
}

function startQuizPortalQuestionTimer() {
  stopQuizPortalQuestionTimer();
  if (
    state.mode !== "quiz-overview" ||
    !Object.prototype.hasOwnProperty.call(QUIZ_PORTAL_BANK_CONFIG, state.quizPortal.view) ||
    state.quizPortal.isAnswered ||
    state.quizPortal.showResults ||
    !getQuizPortalSessionQuiz()?.questions[state.quizPortal.currentIndex]
  ) {
    return;
  }

  state.quizPortal.questionTimeRemaining = QUIZ_PORTAL_QUESTION_TIME_SECONDS;
  state.quizPortal.questionDeadline = Date.now() + QUIZ_PORTAL_QUESTION_TIME_MS;
  updateQuizPortalQuestionTimerUi();
  quizPortalQuestionTimer = window.setInterval(() => {
    if (Date.now() >= state.quizPortal.questionDeadline) {
      void handleQuizPortalQuestionTimeout();
      return;
    }
    updateQuizPortalQuestionTimerUi();
  }, 200);
}

function quizPortalModuleMeta(module) {
  if (module.comingSoon) return "Kommer snart";
  const lockReason = quizPortalLockReason(module);
  if (lockReason && ["review", "vu2", "general"].includes(module.view)) return "Ingår i Premium";
  if (!isPremiumMember()) {
    const usage = quizPortalUsageForView(module.view);
    if (usage) return `${usage.remaining} av ${usage.limit} kostnadsfria kvar`;
  }
  if (module.view === "review") {
    const queue = getQuizReviewQueue();
    if (queue.due.length) return `${queue.due.length} ${queue.due.length === 1 ? "fråga" : "frågor"} · redo nu`;
    if (queue.waiting.length) return `${queue.waiting.length} ${queue.waiting.length === 1 ? "schemalagd" : "schemalagda"} · du är ikapp`;
    return "Du är ikapp";
  }
  if (state.quizPortal.dataStatus === "loading" || state.quizPortal.dataStatus === "idle") return "Laddar innehåll…";
  if (state.quizPortal.dataStatus === "error") return "Kunde inte laddas";
  if (module.view === "flashcards") {
    return `${state.quizPortal.flashcards.length} kort · vänd & lär`;
  }

  const questionCount = getQuizPortalQuiz(module.view)?.questions.length || 0;
  return `${questionCount} frågor · flerval`;
}

function quizPortalModuleAction(module) {
  if (module.comingSoon) return "Inte tillgänglig";
  if (quizPortalLockReason(module)) return "Bli Premium";
  if (module.view === "review") {
    return getQuizReviewQueue().due.length ? "Börja repetera" : "Visa status";
  }
  return "Starta";
}

function quizPortalUsageForView(view) {
  if (view === "vu1") return state.membership.usage.vu1Question;
  if (view === "scenario") return state.membership.usage.scenarioQuestion;
  if (view === "flashcards") return state.membership.usage.flashcardFlip;
  return null;
}

function quizPortalLockReason(module) {
  if (isPremiumMember() || module.comingSoon) return "";
  if (["review", "vu2", "general"].includes(module.view)) return "content";
  const usage = quizPortalUsageForView(module.view);
  if (!usage || usage.remaining > 0) return "";
  return module.view === "vu1" ? "vu1_question" : module.view === "scenario" ? "scenario_question" : "flashcard_flip";
}

function updateQuizPortalModuleMeta() {
  quizPortalModules.forEach((module) => {
    document.querySelectorAll(`[data-quiz-portal-meta="${module.view}"]`).forEach((element) => {
      element.textContent = quizPortalModuleMeta(module);
    });
  });
}

function getQuizPortalModule(view) {
  return quizPortalModules.find((module) => module.view === view) || quizPortalModules[0];
}

function cancelQuizPortalCountdown() {
  quizPortalCountdownTimers.forEach((timer) => window.clearTimeout(timer));
  quizPortalCountdownTimers = [];
  quizPortalCountdownToken += 1;
}

function isQuizPortalCountdownCurrent(view, token) {
  return Boolean(
    state.mode === "quiz-overview" &&
      state.quizPortal.view === view &&
      !els.quizOverviewPanel.hidden &&
      els.quizPortal?.querySelector(`[data-quiz-portal-countdown="${token}"]`)
  );
}

function renderQuizPortalCountdown(view, token) {
  const module = getQuizPortalModule(view);
  renderQuizPortalSidebar();
  let cards = els.quizPortal.querySelectorAll(`.quiz-portal-card[data-quiz-portal-view="${view}"]`);
  if (!cards.length) {
    els.quizPortal.innerHTML = `${renderQuizPortalMobileHead()}${renderQuizPortalHome()}${renderQuizPortalMobileTabbar()}`;
    cards = els.quizPortal.querySelectorAll(`.quiz-portal-card[data-quiz-portal-view="${view}"]`);
  }

  cards.forEach((card) => {
    card.classList.add("is-countdown");
    card.disabled = true;
    card.setAttribute("aria-busy", "true");
    card.innerHTML = `
      <span class="quiz-portal-countdown" data-quiz-portal-countdown="${token}" role="status" aria-label="Gör dig redo. ${escapeHtml(module.title)} börjar strax.">
        <span class="quiz-portal-countdown-orbits" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="quiz-portal-countdown-stage">
          <span class="quiz-portal-countdown-kicker">Gör dig redo</span>
          <strong class="quiz-portal-countdown-number is-entering" aria-live="assertive" aria-atomic="true">3</strong>
          <span class="quiz-portal-countdown-title">${escapeHtml(module.title)}</span>
          <span class="quiz-portal-countdown-copy">Quizet börjar strax</span>
          <span class="quiz-portal-countdown-steps" aria-hidden="true">
            <i class="is-active" data-countdown-step="3"></i>
            <i data-countdown-step="2"></i>
            <i data-countdown-step="1"></i>
          </span>
        </span>
      </span>
    `;
  });
}

function updateQuizPortalCountdown(view, token, value) {
  if (!isQuizPortalCountdownCurrent(view, token)) return;
  els.quizPortal.querySelectorAll(`[data-quiz-portal-countdown="${token}"]`).forEach((countdown) => {
    const number = countdown.querySelector(".quiz-portal-countdown-number");
    number.classList.remove("is-entering");
    number.textContent = String(value);
    void number.offsetWidth;
    number.classList.add("is-entering");
    countdown.querySelectorAll("[data-countdown-step]").forEach((step) => {
      step.classList.toggle("is-active", Number(step.dataset.countdownStep) === value);
    });
  });
}

async function finishQuizPortalCountdown(view, token) {
  if (!isQuizPortalCountdownCurrent(view, token)) return;
  if (state.quizPortal.dataStatus !== "ready") await loadQuizPortalData();
  if (!isQuizPortalCountdownCurrent(view, token)) return;

  quizPortalCountdownTimers = [];
  startQuizPortalHistoryAttempt(view);
  renderQuizOverview();
  refreshIcons();
  startQuizPortalQuestionTimer();

  const module = getQuizPortalModule(view);
  const question = els.quizPortal.querySelector(".quiz-portal-question");
  if (question) question.classList.add(`quiz-theme-${module.theme}`, "is-countdown-entry");
  scrollQuizPortalToTop();
}

function startQuizPortalCountdown(view) {
  cancelQuizPortalCountdown();
  const token = quizPortalCountdownToken;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const stepDuration = reducedMotion ? 360 : 650;

  resetQuizPortalSession(view);
  renderQuizPortalCountdown(view, token);
  refreshIcons();

  [2, 1].forEach((value, index) => {
    quizPortalCountdownTimers.push(
      window.setTimeout(() => updateQuizPortalCountdown(view, token, value), stepDuration * (index + 1))
    );
  });
  quizPortalCountdownTimers.push(
    window.setTimeout(() => void finishQuizPortalCountdown(view, token), stepDuration * 3)
  );
}

function quizOptionLetter(index) {
  return String.fromCharCode(65 + index);
}

function renderQuizPortalMobileHead() {
  const initials = userInitials(state.user.displayName || state.user.firstName || "Sven", "");
  return `
    <div class="quiz-portal-mobile-head">
      <div class="quiz-portal-mobile-brand">
        <img class="app-brand-icon" src="/assets/logo/vaktskolan-icon-512.png" alt="" aria-hidden="true">
        <img class="app-brand-wordmark" src="/assets/logo/vaktskolan-wordmark.png" alt="vaktskolan.">
      </div>
      <div class="quiz-portal-mobile-avatar mobile-auth-user-button" data-mobile-auth-user-button aria-label="Öppna profilmeny">${escapeHtml(initials)}</div>
    </div>
  `;
}

function renderQuizPortalMobileTabbar() {
  return `
    <nav class="quiz-portal-mobile-tabbar" aria-label="Mobil huvudmeny">
      <button class="quiz-portal-mobile-tab" type="button" data-open-home>
        <i data-lucide="home"></i>
        <span>Hem</span>
      </button>
      <button class="quiz-portal-mobile-tab" type="button" data-open-course>
        <i data-lucide="book-open"></i>
        <span>VU1</span>
      </button>
      <button class="quiz-portal-mobile-tab" type="button" data-open-vu2 data-mobile-course="vu2">
        <i data-lucide="shield-check"></i>
        <span>VU2</span>
      </button>
      <button class="quiz-portal-mobile-tab is-active" type="button" data-show-quiz>
        <i data-lucide="target"></i>
        <span>Quiz</span>
      </button>
      <button class="quiz-portal-mobile-tab" type="button" data-open-final-exam-portal>
        <i data-lucide="clipboard-check"></i>
        <span>Slutprov</span>
      </button>
    </nav>
  `;
}

function renderQuizPortalSidebar() {
  els.moduleListWrap.hidden = false;
  els.moduleListTitle.textContent = "Quizmoduler";
  els.moduleCount.textContent = "5 quiz · 1 kortlek";
  els.moduleList.innerHTML = quizPortalModules
    .map((module) => {
      const isActive = state.quizPortal.view === module.view;
      const lockReason = quizPortalLockReason(module);
      return `
        <button class="quiz-sidebar-card quiz-theme-${module.theme} ${isActive ? "is-active" : ""} ${lockReason ? "is-premium-lock" : ""}" type="button" ${
          module.comingSoon ? `data-coming-soon="${escapeHtml(module.title)}"` : lockReason ? `data-premium-lock="${lockReason}"` : `data-quiz-portal-view="${module.view}"`
        }>
          <span class="quiz-sidebar-icon"><i data-lucide="${lockReason ? "lock" : module.icon}"></i></span>
          <span class="quiz-sidebar-copy">
            <strong>${escapeHtml(module.title)}</strong>
            <small data-quiz-portal-meta="${module.view}">${escapeHtml(quizPortalModuleMeta(module))}</small>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderQuizPortalHome() {
  return `
    <div class="quiz-portal-home-desktop">
      <header class="quiz-portal-desktop-head">
        <div class="quiz-portal-page-head">
          <span>Väktarutbildning</span>
          <h1>Quiz Portal</h1>
        </div>
        <div class="quiz-portal-training-mode" role="status">
          <span aria-hidden="true"></span>
          <strong>Träningsläge</strong>
          <small>resultat sparas i din personliga statistik</small>
        </div>
      </header>

      <section class="quiz-portal-hero-desktop" aria-labelledby="quizOverviewTitleDesktop">
        <div>
          <h2 id="quizOverviewTitleDesktop">Välkommen till QuizPortalen</h2>
          <p>Håll kunskaperna skarpa — testa dig själv, repetera viktiga juridiska begrepp och öva på scenarier från verkligheten.</p>
        </div>
        <span class="quiz-portal-repeat-pill"><i data-lucide="clock-3"></i>Repetera så ofta du vill</span>
      </section>

      <section class="quiz-portal-modules quiz-portal-modules-desktop" aria-labelledby="quizPortalModulesTitleDesktop">
        <div class="quiz-portal-section-head">
          <h2 id="quizPortalModulesTitleDesktop">Välj en modul</h2>
          <span>6 sätt att träna</span>
        </div>
        <div class="quiz-portal-grid quiz-portal-grid-desktop">
          ${quizPortalModules
            .map(
              (module, index) => `
                <button class="quiz-portal-card quiz-portal-card-desktop quiz-theme-${module.theme} ${module.comingSoon ? "is-coming-soon" : ""} ${quizPortalLockReason(module) ? "is-premium-lock" : ""}" style="--quiz-card-index:${index}" type="button" ${
                  module.comingSoon ? `data-coming-soon="${escapeHtml(module.title)}"` : quizPortalLockReason(module) ? `data-premium-lock="${quizPortalLockReason(module)}"` : `data-quiz-portal-view="${module.view}"`
                }>
                  <span class="quiz-portal-card-top">
                    <span class="quiz-portal-card-icon"><i data-lucide="${quizPortalLockReason(module) ? "lock" : module.icon}"></i></span>
                    <span class="quiz-portal-card-badge">${escapeHtml(module.comingSoon ? "Kommer snart" : quizPortalLockReason(module) ? "Premium" : module.badge)}</span>
                  </span>
                  <span class="quiz-portal-card-body">
                    <strong>${escapeHtml(module.title)}</strong>
                    <span class="quiz-portal-card-copy">${escapeHtml(module.description)}</span>
                    <span class="quiz-portal-card-foot">
                      <small data-quiz-portal-meta="${module.view}">${escapeHtml(quizPortalModuleMeta(module))}</small>
                      <span class="quiz-portal-card-action">${escapeHtml(quizPortalModuleAction(module))}${module.comingSoon ? "" : ` <i data-lucide="${quizPortalLockReason(module) ? "lock" : "arrow-right"}"></i>`}</span>
                    </span>
                  </span>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    </div>

    <div class="quiz-portal-home-mobile">
      <section class="quiz-portal-mobile-intro" aria-labelledby="quizOverviewTitleMobile">
        <span class="quiz-portal-mobile-kicker">Väktarutbildning</span>
        <h1 id="quizOverviewTitleMobile">Quiz Portal</h1>
        <p>Testa dig själv, repetera juridik och öva på verkliga scenarier — så ofta du vill.</p>
        <div class="quiz-portal-mobile-mode" role="status">
          <span aria-hidden="true"></span>
          <strong>Träningsläge — resultat sparas</strong>
        </div>
      </section>

      <section class="quiz-portal-modules quiz-portal-modules-mobile" aria-labelledby="quizPortalModulesTitleMobile">
        <div class="quiz-portal-section-head quiz-portal-section-head-mobile">
          <h2 id="quizPortalModulesTitleMobile">Välj en modul</h2>
          <span>5 quiz · 1 kortlek</span>
        </div>
        <div class="quiz-portal-grid quiz-portal-grid-mobile">
          ${quizPortalModules
            .map(
              (module, index) => `
                <button class="quiz-portal-card quiz-portal-card-mobile quiz-theme-${module.theme} ${module.comingSoon ? "is-coming-soon" : ""} ${quizPortalLockReason(module) ? "is-premium-lock" : ""}" style="--quiz-card-index:${index}" type="button" ${
                  module.comingSoon ? `data-coming-soon="${escapeHtml(module.title)}"` : quizPortalLockReason(module) ? `data-premium-lock="${quizPortalLockReason(module)}"` : `data-quiz-portal-view="${module.view}"`
                }>
                  <span class="quiz-portal-card-top">
                    <span class="quiz-portal-card-icon"><i data-lucide="${quizPortalLockReason(module) ? "lock" : module.icon}"></i></span>
                    <span class="quiz-portal-card-badge">${escapeHtml(module.comingSoon ? "Kommer snart" : quizPortalLockReason(module) ? "Premium" : module.badge)}</span>
                  </span>
                  <span class="quiz-portal-card-body">
                    <strong>${escapeHtml(module.title)}</strong>
                    <span class="quiz-portal-card-copy">${escapeHtml(module.description)}</span>
                    <span class="quiz-portal-card-foot">
                      <small data-quiz-portal-meta="${module.view}">${escapeHtml(quizPortalModuleMeta(module))}</small>
                      <span class="quiz-portal-card-action">${escapeHtml(quizPortalModuleAction(module))}${module.comingSoon ? "" : ` <i data-lucide="${quizPortalLockReason(module) ? "lock" : "arrow-right"}"></i>`}</span>
                    </span>
                  </span>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function formatQuizReviewDueAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "senare";
  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderQuizPortalReviewEmpty() {
  const queue = getQuizReviewQueue();
  const nextItem = [...queue.waiting].sort((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt))[0];
  const title = nextItem ? "Du är ikapp för tillfället" : "Du är ikapp";
  const copy = nextItem
    ? `${queue.waiting.length} ${queue.waiting.length === 1 ? "fråga är schemalagd" : "frågor är schemalagda"}. Nästa repetition blir tillgänglig ${formatQuizReviewDueAt(nextItem.dueAt)}.`
    : "Frågor du svarar fel på hamnar här automatiskt. Ett rätt svar schemalägger frågan igen efter 24 timmar; nästa rätt markerar den som inlärd.";
  return `
    <section class="quiz-portal-data-state quiz-portal-review-empty quiz-theme-orange" aria-labelledby="quizReviewEmptyTitle">
      <span class="quiz-portal-data-state-icon"><i data-lucide="badge-check"></i></span>
      <h2 id="quizReviewEmptyTitle">${escapeHtml(title)}</h2>
      <p>${escapeHtml(copy)}</p>
      <button class="quiz-portal-button quiz-portal-button-primary" type="button" data-quiz-portal-home>
        <i data-lucide="arrow-left"></i>
        <span>Till Quizportalen</span>
      </button>
    </section>
  `;
}

function renderQuizPortalResults(quiz) {
  const percentage = Math.round((state.quizPortal.score / quiz.questions.length) * 100);
  const passed = percentage >= 80;
  const isReview = state.quizPortal.view === "review";
  const remainingReviewCount = isReview ? getQuizReviewQueue().due.length : 0;
  const retryLockReason = quizPortalLockReason(getQuizPortalModule(state.quizPortal.view));
  const feedbackTitle = isReview
    ? remainingReviewCount
      ? "Några frågor behöver en omgång till"
      : "Bra jobbat — du är ikapp"
    : passed
      ? "Starkt resultat"
      : "Repetera och försök igen";
  const feedbackText = isReview
    ? remainingReviewCount
      ? `${remainingReviewCount} ${remainingReviewCount === 1 ? "fråga ligger" : "frågor ligger"} kvar för repetition.`
      : "Rätt besvarade frågor kommer tillbaka efter 24 timmar. Nästa rätta svar markerar dem som inlärda."
    : passed
      ? "Du har bra koll på området, men gå gärna igenom frågorna nedan för att befästa detaljerna."
      : "Titta igenom genomgången nedan och repetera quizet när du är redo.";
  const ringColor = isReview ? (remainingReviewCount ? "#ea580c" : "#16a34a") : passed ? "#16a34a" : "#2563eb";
  const reviewItems = quiz.questions
    .map((question, index) => {
      const answerIndex = state.quizPortal.answers[index];
      const isCorrect = answerIndex === question.answer;
      const userAnswer = Number.isInteger(answerIndex) ? question.options[answerIndex] : "Inget svar";
      const correctAnswer = question.options[question.answer];
      return `
        <article class="quiz-portal-review-item">
          <span class="quiz-portal-review-mark ${isCorrect ? "is-correct" : "is-wrong"}">${isCorrect ? "✓" : "!"}</span>
          <div>
            <h3>${escapeHtml(question.question)}</h3>
            <p class="${isCorrect ? "is-correct" : "is-wrong"}">Ditt svar: ${escapeHtml(userAnswer)}</p>
            ${isCorrect ? "" : `<p class="is-correct">Rätt svar: ${escapeHtml(correctAnswer)}</p>`}
            <small>${escapeHtml(question.explanation)}</small>
          </div>
        </article>
      `;
    })
    .join("");
  return `
    <section class="quiz-portal-result" aria-labelledby="quizPortalResultTitle">
      <div class="quiz-portal-result-summary">
        <div class="quiz-portal-result-ring" style="--result-deg: ${percentage * 3.6}deg; --result-color: ${ringColor};">
          <span>${percentage}%</span>
        </div>
        <div>
          <span class="quiz-portal-result-kicker">${isReview ? "Personlig repetition" : "Resultat"} · ${escapeHtml(quiz.title)}</span>
          <h2 id="quizPortalResultTitle">${feedbackTitle}</h2>
          <p>Du fick ${state.quizPortal.score} av ${quiz.questions.length} rätt. ${feedbackText}</p>
          <div class="quiz-portal-result-actions">
            ${
              isReview && !remainingReviewCount
                ? `
                  <button class="quiz-portal-button quiz-portal-button-primary" type="button" data-quiz-portal-home>
                    <span>Till Quizportalen</span>
                    <i data-lucide="arrow-right"></i>
                  </button>
                `
                : `
                  <button class="quiz-portal-button quiz-portal-button-primary" type="button" ${retryLockReason ? `data-premium-lock="${retryLockReason}"` : "data-quiz-portal-reset"}>
                    <i data-lucide="${retryLockReason ? "lock" : "refresh-cw"}"></i>
                    <span>${retryLockReason ? "Fortsätt med Premium" : isReview ? "Repetera kvarvarande" : "Repetera quizet"}</span>
                  </button>
                  <button class="quiz-portal-button quiz-portal-button-secondary" type="button" data-quiz-portal-home>
                    <span>Till portalen</span>
                  </button>
                `
            }
          </div>
        </div>
      </div>

      <section class="quiz-portal-review" aria-label="Genomgång fråga för fråga">
        <h3>Genomgång</h3>
        <div>${reviewItems}</div>
      </section>
    </section>
  `;
}

function renderQuizPortalQuiz() {
  const quiz = getQuizPortalSessionQuiz();
  if (!quiz) return renderQuizPortalHome();
  const isReview = state.quizPortal.view === "review";
  if (isReview && !quiz.questions.length) return renderQuizPortalReviewEmpty();
  if (state.quizPortal.showResults) return renderQuizPortalResults(quiz);

  const question = quiz.questions[state.quizPortal.currentIndex];
  const progress = ((state.quizPortal.currentIndex + (state.quizPortal.isAnswered ? 1 : 0)) / quiz.questions.length) * 100;
  const reviewItem = isReview
    ? state.quizHistory.reviewItems.find((item) => item.questionKey === question.historyQuestionKey)
    : null;
  const explanationTitle = isReview
    ? state.quizPortal.selectedOption === question.answer
      ? reviewItem?.stage === "mastered"
        ? "Rätt — frågan är inlärd"
        : "Rätt — frågan återkommer om 24 timmar"
      : "Inte riktigt — frågan ligger kvar"
    : state.quizPortal.selectedOption === question.answer
      ? "Rätt svar!"
      : state.quizPortal.timedOut
        ? "Tiden är slut"
        : "Faktainfo";

  return `
    <section class="quiz-portal-engine ${isReview ? "is-review quiz-theme-orange" : ""}" aria-labelledby="quizPortalEngineTitle">
      <button class="quiz-portal-back" type="button" data-quiz-portal-home>
        <i data-lucide="arrow-left"></i>
        <span>Till Quiz Portalen</span>
      </button>

      <div class="quiz-portal-engine-head">
        <div>
          <h2 id="quizPortalEngineTitle">${escapeHtml(quiz.title)}</h2>
          <p>${isReview ? "Personlig repetition · " : ""}Fråga ${state.quizPortal.currentIndex + 1} av ${quiz.questions.length}</p>
        </div>
        ${
          isReview
            ? '<span class="quiz-portal-review-mode-label"><i data-lucide="heart-pulse"></i>Utan tidspress</span>'
            : `
              <div class="quiz-portal-question-timer ${state.quizPortal.questionTimeRemaining === 0 ? "is-expired" : state.quizPortal.questionTimeRemaining <= 5 ? "is-warning" : ""}" style="--quiz-time-progress: ${state.quizPortal.questionTimeRemaining / QUIZ_PORTAL_QUESTION_TIME_SECONDS}" data-quiz-portal-question-timer role="timer" aria-label="${state.quizPortal.questionTimeRemaining} sekunder kvar">
                <span class="quiz-portal-question-timer-copy">
                  <i data-lucide="timer"></i>
                  <strong data-quiz-portal-question-time>${state.quizPortal.questionTimeRemaining}</strong>
                  <small>sek</small>
                </span>
                <span class="quiz-portal-question-timer-track" aria-hidden="true"><span></span></span>
              </div>
            `
        }
      </div>
      <div class="quiz-portal-progress" aria-hidden="true"><span style="width: ${progress}%"></span></div>

      <article class="quiz-portal-question">
        <h3>${escapeHtml(question.question)}</h3>
        <div class="quiz-portal-options">
          ${question.options
            .map((option, index) => {
              const selected = state.quizPortal.selectedOption === index;
              const correct = state.quizPortal.isAnswered && index === question.answer;
              const wrong = state.quizPortal.isAnswered && selected && index !== question.answer;
              const muted = state.quizPortal.isAnswered && !correct && !wrong;
              return `
                <button class="quiz-portal-option ${selected ? "is-selected" : ""} ${correct ? "is-correct" : ""} ${wrong ? "is-wrong" : ""} ${muted ? "is-muted" : ""}"
                  type="button" data-quiz-portal-option="${index}" ${state.quizPortal.isAnswered ? "disabled" : ""}>
                  <span class="quiz-portal-option-letter">${quizOptionLetter(index)}</span>
                  <span>${escapeHtml(option)}</span>
                  <strong class="quiz-portal-option-mark">${correct ? "✓" : wrong ? "!" : ""}</strong>
                </button>
              `;
            })
            .join("")}
        </div>

        ${
          state.quizPortal.isAnswered
            ? `
              <div class="quiz-portal-explanation ${state.quizPortal.selectedOption === question.answer ? "is-correct" : ""} ${state.quizPortal.timedOut ? "is-timeout" : ""}">
                <i data-lucide="${state.quizPortal.selectedOption === question.answer ? "circle-check-big" : state.quizPortal.timedOut ? "timer-off" : "triangle-alert"}"></i>
                <div>
                  <strong>${escapeHtml(explanationTitle)}</strong>
                  ${state.quizPortal.timedOut ? `<p class="quiz-portal-timeout-answer">Rätt svar: ${escapeHtml(question.options[question.answer])}</p>` : ""}
                  <p>${escapeHtml(question.explanation)}</p>
                </div>
              </div>
            `
            : ""
        }

        <div class="quiz-portal-question-actions">
          ${
            state.quizPortal.isAnswered
              ? `
                <button class="quiz-portal-button quiz-portal-button-primary" type="button" data-quiz-portal-next>
                  <span>${state.quizPortal.currentIndex + 1 < quiz.questions.length ? "Nästa fråga" : "Visa resultat"}</span>
                  <i data-lucide="arrow-right"></i>
                </button>
              `
              : ""
          }
        </div>
      </article>
    </section>
  `;
}

function renderQuizPortalFlashcards() {
  const cards = state.quizPortal.flashcards;
  const card = cards[state.quizPortal.flashcardIndex];
  if (!card) return renderQuizPortalDataState();
  return `
    <section class="quiz-portal-flashcards" aria-labelledby="quizPortalFlashcardsTitle">
      <button class="quiz-portal-back" type="button" data-quiz-portal-home>
        <i data-lucide="arrow-left"></i>
        <span>Till Quiz Portalen</span>
      </button>

      <div class="quiz-portal-engine-head">
        <div>
          <h2 id="quizPortalFlashcardsTitle">Flashcards</h2>
          <p>Kort ${state.quizPortal.flashcardIndex + 1} av ${cards.length} · ${escapeHtml(card.category)}</p>
        </div>
      </div>

      <button class="quiz-portal-flashcard ${state.quizPortal.flashcardFlipped ? "is-flipped" : ""}" type="button" data-flashcard-toggle aria-label="Vänd flashcard">
        <span class="quiz-portal-flashcard-inner">
          <span class="quiz-portal-flashcard-face quiz-portal-flashcard-front">
            <small>Begrepp</small>
            <strong>${escapeHtml(card.term)}</strong>
            <em>Tryck på kortet för att vända</em>
          </span>
          <span class="quiz-portal-flashcard-face quiz-portal-flashcard-back">
            <small>Förklaring</small>
            <strong>${escapeHtml(card.definition)}</strong>
            <em>Tryck för att vända tillbaka</em>
          </span>
        </span>
      </button>

      <div class="quiz-portal-flashcard-controls" aria-label="Flashcard-kontroller">
        <button type="button" data-flashcard-prev>
          <i data-lucide="arrow-left"></i>
          <span>Föregående</span>
        </button>
        <button type="button" class="is-primary" data-flashcard-toggle>
          <span>Vänd kortet</span>
        </button>
        <button type="button" data-flashcard-next>
          <span>Nästa kort</span>
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </section>
  `;
}

function renderQuizPortalDataState() {
  const failed = state.quizPortal.dataStatus === "error";
  return `
    <section class="quiz-portal-data-state" role="${failed ? "alert" : "status"}">
      <span class="quiz-portal-data-state-icon"><i data-lucide="${failed ? "circle-alert" : "loader-circle"}"></i></span>
      <h2>${failed ? "Innehållet kunde inte laddas" : "Laddar frågebankerna"}</h2>
      <p>${failed ? escapeHtml(state.quizPortal.dataError || "Försök igen om en liten stund.") : "VU1, VU2, flashcards och scenariofrågor hämtas från Supabase."}</p>
      ${failed ? '<button class="quiz-portal-button quiz-portal-button-primary" type="button" data-retry-quiz-portal-data><i data-lucide="refresh-cw"></i><span>Försök igen</span></button>' : ""}
    </section>
  `;
}

function renderQuizOverview() {
  if (!els.quizPortal) return;

  renderQuizPortalSidebar();

  let content = "";
  const requiresData = ["vu1", "vu2", "scenario", "flashcards", "review"].includes(state.quizPortal.view);
  if (requiresData && state.quizPortal.dataStatus !== "ready") {
    content = renderQuizPortalDataState();
  } else if (state.quizPortal.view === "review") {
    content = state.quizPortal.sessionQuestions.length
      ? renderQuizPortalQuiz()
      : renderQuizPortalReviewEmpty();
  } else if (state.quizPortal.view === "flashcards") {
    content = renderQuizPortalFlashcards();
  } else if (getQuizPortalQuiz()) {
    content = renderQuizPortalQuiz();
  } else {
    content = renderQuizPortalHome();
  }

  els.quizPortal.innerHTML = `${renderQuizPortalMobileHead()}${content}${renderQuizPortalMobileTabbar()}`;
}

function renderFinalExamInlineCta() {
  const course = getCourseConfig();
  const activeSession = state.finalExam && !state.finalExam.completedAt;
  const completedSession = state.finalExam?.completedAt;
  const lock = getFinalExamLockInfo();
  const finalExamReady = canStartFinalExam();
  const answered = getFinalExamAnsweredCount();
  const total = state.finalExam?.questionIds?.length || FINAL_EXAM_SIZE;
  const isLockedAfterSubmit = Boolean(completedSession) && lock.locked;
  const buttonAction = activeSession || isLockedAfterSubmit ? "data-resume-final-exam" : "data-start-final-exam";
  const buttonLabel = activeSession ? "Fortsätt slutprov" : isLockedAfterSubmit ? "Visa resultat" : "Starta slutprov";
  const statusText = activeSession
    ? `${answered}/${total} svarade`
    : isLockedAfterSubmit
      ? `Nytt prov om ${formatRemainingTime(lock.remaining)}`
      : !finalExamReady
        ? "Låst tills modulerna är klara"
      : "Redo för nytt prov";

  return `
    <section class="final-exam-inline" aria-label="Starta slutprov">
      <div>
        <span>${course.finalExamLabel}</span>
        <h2>30 slumpade frågor</h2>
        <p>Provet visar en fråga per sida och blandas om vid varje nytt provtillfälle. När provet lämnas in spärras nytt prov i 24 timmar.</p>
      </div>
      <div class="final-exam-inline-stats">
        <span>${state.finalExamPool.length} frågor i underlaget</span>
        <span>30 frågor per prov</span>
        <span>${statusText}</span>
      </div>
      <button class="dark-action" type="button" ${buttonAction} ${state.finalExamPool.length < FINAL_EXAM_SIZE || (!finalExamReady && !state.finalExam) ? "disabled" : ""}>
        <span>${buttonLabel}</span>
        <i data-lucide="clipboard-check"></i>
      </button>
    </section>
  `;
}

function renderFinalExamSummary(result) {
  const lock = getFinalExamLockInfo();
  const ringColor = result.passed ? "#16a34a" : "#dc2626";
  const requiredCorrect = getFinalExamRequiredCorrect(result.total);
  const feedbackTitle = result.passed
    ? result.percent === 100
      ? "Perfekt — godkänt prov!"
      : "Godkänt prov!"
    : "Underkänt prov";
  const feedbackText = result.passed
    ? `Du fick ${result.correct} av ${result.total} rätt och klarade slutprovet. Bra jobbat!`
    : `Du fick ${result.correct} av ${result.total} rätt. Det krävs ${requiredCorrect} rätt för godkänt — gå igenom genomgången nedan och försök igen efter spärren.`;
  const reviewItems = Array.isArray(result.reviewQuestions) ? result.reviewQuestions : [];
  const lockVisible = !result.passed && lock.locked;

  return `
    ${renderFinalPortalMobileHead()}
    <section class="final-result-summary ${result.passed ? "is-passed" : "is-failed"}">
      <div class="final-result-overview">
        <div class="final-result-ring" style="--result-deg: ${result.percent * 3.6}deg; --result-color: ${ringColor};">
          <span><strong>${result.correct}</strong><small>av ${result.total}</small></span>
        </div>
        <div class="final-result-copy">
          <span class="final-result-kicker">${result.passed ? "Godkänd" : "Underkänd"}</span>
          <h4>${feedbackTitle}</h4>
          <p>${feedbackText}</p>
          <div class="final-result-actions">
            <button class="final-result-portal-button" type="button" data-open-final-exam-portal>
              <span>Till provportalen</span>
            </button>
          </div>
        </div>
      </div>

      <div class="final-result-lock" ${lockVisible ? "" : "hidden"}>
        <i data-lucide="lock"></i>
        <div>
          <strong>Nytt försök är spärrat i 24 timmar</strong>
          <span>Använd tiden till att repetera i Quiz Portalen och Flashcards.</span>
        </div>
        <time>${formatClockTime(lock.remaining, { forceHours: true })}<small>till nästa försök</small></time>
      </div>

      <div class="final-result-breakdown">
        <h5>Resultat per modul</h5>
        <div>
          ${result.breakdown
            .map((item) => {
              const percent = item.total ? Math.round((item.correct / item.total) * 100) : 0;
              const barColor = percent >= 70 ? "#16a34a" : percent >= 40 ? "#f59e0b" : "#dc2626";
              return `
                <div class="breakdown-row">
                  <div>
                    <span>${escapeHtml(item.label)}</span>
                    <strong style="color: ${barColor};">${item.correct} / ${item.total}</strong>
                  </div>
                  <i><b style="width: ${percent}%; background: ${barColor};"></b></i>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="final-result-review">
        <h5>Genomgång — fråga för fråga</h5>
        <div class="final-result-review-list">
          ${reviewItems
            .map((item) => `
              <article class="final-review-row ${item.isCorrect ? "is-correct" : "is-wrong"}">
                <span class="final-review-mark">${item.isCorrect ? "✓" : "✕"}</span>
                <div>
                  <span class="final-review-source">${escapeHtml(item.source)}</span>
                  <strong>${item.index}. ${escapeHtml(item.question)}</strong>
                  <p class="${item.isCorrect ? "is-correct" : "is-wrong"}">Ditt svar: ${escapeHtml(item.selected)}</p>
                  ${item.isCorrect ? "" : `<p class="is-correct">Rätt svar: ${escapeHtml(item.correct)}</p>`}
                  <small>${escapeHtml(item.explanation || "")}</small>
                </div>
              </article>
            `)
            .join("")}
        </div>
      </div>
    </section>
    ${renderFinalPortalMobileTabbar()}
  `;
}

function renderFinalExamReview(questions, answers, answeredCount) {
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const warningText = unansweredCount === 1
    ? "1 fråga är obesvarad och räknas som fel."
    : `${unansweredCount} frågor är obesvarade och räknas som fel.`;

  return `
    <section class="final-exam-review-screen" aria-label="Granska dina svar">
      <div class="final-exam-review-head">
        <h4>Granska dina svar</h4>
        <p>Klicka på en fråga för att gå tillbaka och ändra ditt svar innan du lämnar in.</p>
      </div>

      <div class="final-exam-review-card">
        <div class="final-exam-review-legend" aria-hidden="true">
          <span><i class="is-answered"></i>Besvarad</span>
          <span><i></i>Obesvarad</span>
        </div>
        <div class="final-exam-review-grid">
          ${questions
            .map((question, index) => {
              const isAnswered = Boolean(answers[question.id]);
              return `
                <button class="${isAnswered ? "is-answered" : ""}" type="button" data-final-question-index="${index}">
                  ${index + 1}
                </button>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="final-exam-review-submit">
        <div>
          <strong>${answeredCount} av ${questions.length} besvarade</strong>
          <span ${unansweredCount ? "" : "hidden"}><i data-lucide="triangle-alert"></i>${warningText}</span>
        </div>
      </div>

      <div class="final-exam-review-actions">
        <button class="ghost-action" type="button" data-final-review-back>
          <i data-lucide="chevron-left"></i>
          <span>Tillbaka till provet</span>
        </button>
        <button class="dark-action" type="button" data-final-submit>
          <i data-lucide="clipboard-check"></i>
          <span>Lämna in prov</span>
        </button>
      </div>
    </section>
  `;
}

function showQuizOverview() {
  state.mode = "quiz-overview";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = true;
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = false;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = true;
  els.quizButton.hidden = true;
  setBodyLayoutMode("quiz-overview");
  els.lessonTitle.textContent = "Quiz";
  els.breadcrumbs.innerHTML = "";
  setQuizButtonLabel("Starta quiz");
  hideModuleList();

  renderQuizOverview();
  renderActiveNav();
  refreshIcons();
  void loadQuizPortalData();
  scrollQuizPortalToTop();
}

function showFinalExam() {
  if (!state.finalExam) {
    startFinalExam();
    return;
  }

  state.mode = "final-exam";
  saveLocation();
  closeDrawers();

  els.homePanel.hidden = true;
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = true;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = true;
  els.finalExamPanel.hidden = false;
  els.metaPills.hidden = true;
  els.quizButton.hidden = true;
  const isSubmitted = Boolean(state.finalExam?.completedAt);
  setBodyLayoutMode(isSubmitted ? "final-exam-result" : "final-exam-focus");
  const course = getCourseConfig();
  els.lessonTitle.textContent = course.finalExamLabel;
  if (els.finalExamHeadLabel) els.finalExamHeadLabel.textContent = course.finalExamLabel;
  els.breadcrumbs.innerHTML = "";
  els.timeEstimate.textContent = "Slutprov";

  renderFinalExam();
  hideModuleList();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFinalExam() {
  const questions = getFinalExamQuestions();
  if (!state.finalExam || !questions.length) {
    els.finalExamQuestion.innerHTML = "<p>Slutprovet kunde inte laddas. Gå tillbaka till Quiz och starta ett nytt prov.</p>";
    els.finalExamFooter.hidden = true;
    return;
  }

  state.finalExam.currentIndex = Math.max(0, Math.min(Number(state.finalExam.currentIndex || 0), questions.length - 1));
  const questionIndex = state.finalExam.currentIndex;
  const question = questions[questionIndex];
  const answers = isPlainObject(state.finalExam.answers) ? state.finalExam.answers : {};
  const selected = answers[question.id];
  const answeredCount = getFinalExamAnsweredCount();
  const submitted = Boolean(state.finalExam.completedAt);
  const result = submitted ? getFinalExamResult() : null;
  const isLastQuestion = questionIndex === questions.length - 1;
  const reviewMode = Boolean(state.finalExam.reviewMode);
  const course = getCourseConfig();
  const timerRemaining = getFinalExamTimerRemaining();

  els.finalExamTitle.textContent = submitted
    ? "Resultat"
    : course.finalExamLabel;
  els.finalExamSubtitle.textContent = submitted
    ? `${result.correct}/${result.total} rätt`
    : "Slutprov · fokusläge";
  els.finalExamAnswered.textContent = submitted ? `${result.percent}%` : formatClockTime(timerRemaining);
  els.finalExamAnswered.classList.toggle("is-low", !submitted && timerRemaining > 0 && timerRemaining < 2 * 60 * 1000);
  els.pageCount.textContent = submitted ? `${result.correct}/${result.total} rätt` : `${answeredCount}/${questions.length} svarade`;
  els.finalExamProgress.style.width = `${submitted || reviewMode ? 100 : Math.round(((questionIndex + 1) / questions.length) * 100)}%`;
  els.finalExamSteps.hidden = true;
  if (els.finalExamNavCount) els.finalExamNavCount.textContent = `${answeredCount} av ${questions.length} besvarade`;

  if (submitted) {
    els.finalExamQuestion.innerHTML = renderFinalExamSummary(result);
    els.finalExamProgress.style.width = "100%";
    els.finalExamFooter.hidden = true;
    els.finalExamPrevButton.hidden = true;
    els.finalExamNextButton.hidden = true;
    els.finalExamSubmitButton.hidden = true;
    if (els.finalExamNavCount) els.finalExamNavCount.hidden = true;
    stopFinalExamTimer();
    saveFinalExam();
    return;
  }

  startFinalExamTimer();

  if (reviewMode) {
    els.finalExamFooter.hidden = true;
    els.finalExamPrevButton.hidden = true;
    els.finalExamNextButton.hidden = true;
    els.finalExamSubmitButton.hidden = true;
    if (els.finalExamNavCount) els.finalExamNavCount.hidden = true;
    els.finalExamQuestion.innerHTML = renderFinalExamReview(questions, answers, answeredCount);
    saveFinalExam();
    return;
  }

  els.finalExamFooter.hidden = false;
  if (els.finalExamNavCount) els.finalExamNavCount.hidden = false;
  els.finalExamQuestion.innerHTML = `
    <div class="final-exam-question-shell">
      <div class="final-exam-question-meta">
        <span>${escapeHtml(question.source || "Blandade frågor")}</span>
        <strong>Fråga ${questionIndex + 1} av ${questions.length}</strong>
      </div>
      <article class="final-exam-card">
        <h4>${inlineMarkdown(question.question)}</h4>
        <div class="answer-list">
          ${question.options
            .map((option) => {
              const classes = ["answer-option", selected === option.letter ? "is-selected" : ""].join(" ");
              return `
                <button class="${classes}" type="button" data-final-answer="${option.letter}">
                  <span class="answer-letter">${option.letter}</span>
                  <span class="answer-copy">${inlineMarkdown(option.text)}</span>
                  <span class="answer-check"><i data-lucide="check"></i></span>
                </button>
              `;
            })
            .join("")}
        </div>
      </article>
    </div>
  `;

  els.finalExamPrevButton.disabled = questionIndex === 0;
  els.finalExamPrevButton.hidden = false;
  els.finalExamNextButton.hidden = false;
  els.finalExamNextButton.disabled = false;
  els.finalExamNextButton.querySelector("span").textContent = isLastQuestion ? "Granska & lämna in" : "Nästa fråga";
  els.finalExamSubmitButton.hidden = true;
  els.finalExamSubmitButton.disabled = true;
  saveFinalExam();
}

function goFinalExamRelative(direction) {
  if (!state.finalExam) return;
  const questions = getFinalExamQuestions();
  state.finalExam.reviewMode = false;
  state.finalExam.currentIndex = Math.max(
    0,
    Math.min(Number(state.finalExam.currentIndex || 0) + direction, questions.length - 1)
  );
  saveFinalExam();
  renderFinalExam();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function goFinalExamQuestion(index) {
  if (!state.finalExam) return;
  const questions = getFinalExamQuestions();
  state.finalExam.reviewMode = false;
  state.finalExam.currentIndex = Math.max(0, Math.min(index, questions.length - 1));
  saveFinalExam();
  renderFinalExam();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function showFinalExamReview() {
  if (!state.finalExam || state.finalExam.completedAt) return;
  state.finalExam.reviewMode = true;
  saveFinalExam();
  renderFinalExam();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function goFinalExamNext() {
  if (!state.finalExam) return;
  const questions = getFinalExamQuestions();
  const currentIndex = Number(state.finalExam.currentIndex || 0);
  if (currentIndex >= questions.length - 1) {
    showFinalExamReview();
    return;
  }
  goFinalExamRelative(1);
}

function submitFinalExam(options = {}) {
  if (!state.finalExam || state.finalExam.completedAt) return;

  state.finalExam.reviewMode = false;
  state.finalExam.completedAt = Date.now();
  saveFinalExam();
  stopFinalExamTimer();
  showFinalExam();
  refreshIcons();
  showToast(options.reason === "timeout" ? "Tiden är slut. Slutprovet är inlämnat." : "Slutprovet är inlämnat.");
}

function renderQuiz() {
  const module = getCurrentModule();
  const key = answerKey();
  const answers = isPlainObject(state.answers[key]) ? state.answers[key] : {};
  const isSubmitted = Boolean(state.quizSubmissions[key]);
  const answeredCount = Object.keys(answers).length;
  const quizResult = getModuleQuizResult(state.moduleIndex);
  const correctCount = quizResult.correct;
  const quizPassed = quizResult.passed;
  const nextModule = state.modules[state.moduleIndex + 1];
  const nextIsFinalExam = isFinalExamModule(nextModule);
  const nextModuleLabel = nextIsFinalExam ? "Till slutprov" : "Starta nästa modul";
  const nextActionText = nextModule ? (nextIsFinalExam ? "gå vidare till slutprovet" : "fortsätta till nästa modul") : "gå tillbaka till lektionen";

  els.quizTitle.textContent = `Testa Modul ${moduleNumber(module)}: ${module.title}`;
  els.quizScore.textContent = `${isSubmitted ? correctCount : answeredCount}/${module.quiz.length}`;
  els.quizScore.setAttribute(
    "aria-label",
    isSubmitted
      ? `${correctCount} av ${module.quiz.length} rätt`
      : `${answeredCount} av ${module.quiz.length} frågor besvarade`
  );
  els.resetQuizButton.disabled = answeredCount === 0;
  const resultSummary = isSubmitted
    ? `<section class="quiz-submission-result ${quizPassed ? "is-passed" : "is-failed"}" role="status" aria-live="polite">
        <span>${quizPassed ? "Godkänd" : "Inte godkänd"}</span>
        <strong>${correctCount} av ${module.quiz.length} rätt</strong>
        <p>${
          quizPassed
            ? "Gå igenom frågorna nedan för att se rätt svar och förklaringar."
            : `Det krävs minst ${quizResult.requiredCorrect} rätt för godkänt. Nollställ svaren och försök igen.`
        }</p>
      </section>`
    : "";

  els.quizQuestions.innerHTML = module.quiz.length
    ? resultSummary + module.quiz
        .map((question) => {
          const selected = answers[question.number];
          const explanation = isSubmitted && selected
            ? `<p class="answer-explanation">${inlineMarkdown(question.explanation)}</p>`
            : "";
          return `
            <section class="question-card">
              <h4>Fråga ${question.number}. ${inlineMarkdown(question.question)}</h4>
              <div class="answer-list">
                ${question.options
                  .map((option) => {
                    const isCorrect = isSubmitted && selected && option.letter === question.correct;
                    const isWrong = isSubmitted && selected === option.letter && option.letter !== question.correct;
                    const classes = [
                      "answer-option",
                      selected === option.letter ? "is-selected" : "",
                      isCorrect ? "is-correct" : "",
                      isWrong ? "is-wrong" : "",
                    ].join(" ");
                    return `
                      <button class="${classes}" type="button" data-question="${question.number}" data-answer="${option.letter}" ${isSubmitted ? 'disabled aria-disabled="true"' : ""}>
                        <span class="answer-letter">${option.letter}</span>
                        <span>${inlineMarkdown(option.text)}</span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
              ${explanation}
            </section>
          `;
        })
        .join("")
    : `<p>Det finns inget quiz för den här modulen ännu.</p>`;

  const allQuestionsAnswered = answeredCount === module.quiz.length && module.quiz.length > 0;
  const canContinue = state.moduleIndex < state.modules.length - 1 && isModuleComplete(state.moduleIndex);
  const primaryAction = canContinue
    ? `<button class="dark-action" type="button" data-next-module><span>${nextModuleLabel}</span><i data-lucide="arrow-right"></i></button>`
    : `<button class="dark-action" type="button" data-return-lesson><span>Till lektion</span><i data-lucide="book-open"></i></button>`;

  els.quizFooter.innerHTML = `
    <div class="quiz-complete ${isSubmitted ? "is-complete" : "is-navigation"}">
      <div class="quiz-complete-copy">
        <h4>${isSubmitted ? (quizPassed ? "Quiz godkänt" : "Quiz behöver göras om") : "Quiz"}</h4>
        <p>${
          isSubmitted
            ? quizPassed
              ? `Du fick ${correctCount} av ${module.quiz.length} rätt. Du kan nollställa svaren eller ${nextActionText}.`
              : `Du fick ${correctCount} av ${module.quiz.length} rätt. Det krävs ${quizResult.requiredCorrect} rätt för godkänt.`
            : allQuestionsAnswered
              ? "Skicka in dina svar när du känner dig redo."
              : `Besvara alla frågor för att skicka in. ${answeredCount} av ${module.quiz.length} är klara.`
        }</p>
      </div>
      <div class="quiz-complete-actions">
        <button class="quiz-home-action" type="button" data-open-home><i data-lucide="home"></i><span>Hem</span></button>
        ${
          isSubmitted
            ? primaryAction
            : `<button class="quiz-submit-action" type="button" data-submit-module-quiz ${allQuestionsAnswered ? "" : 'disabled aria-disabled="true"'}><span>Skicka in</span><i data-lucide="send"></i></button>`
        }
      </div>
    </div>
  `;
}

function goTo(moduleIndex, lessonIndex = 0, pageIndex = 0, mode = "lesson", options = {}) {
  const requestedModule = state.modules[moduleIndex];
  if (isModuleMembershipLocked(moduleIndex)) {
    openPremiumModal(isFinalExamModule(requestedModule) ? "final_exam" : "content");
    return;
  }
  if (isFinalExamModule(requestedModule)) {
    if (!canAccessFinalExam()) {
      showToast("Slutprovet låses upp när alla moduler är klara.");
      return;
    }

    state.moduleIndex = Math.max(0, Math.min(moduleIndex, state.modules.length - 1));
    state.lessonIndex = 0;
    state.pageIndex = 0;
    startFinalExam();
    return;
  }

  if (!isModuleUnlocked(moduleIndex) || !isPageUnlocked(moduleIndex, lessonIndex, pageIndex)) {
    showToast("Det avsnittet låses upp när du har gått igenom föregående material.");
    return;
  }

  if (shouldShowModuleMilestone(moduleIndex, options)) {
    showModuleMilestone(moduleIndex, lessonIndex, pageIndex);
    return;
  }

  state.moduleIndex = Math.max(0, Math.min(moduleIndex, state.modules.length - 1));
  const module = getCurrentModule();
  state.lessonIndex = Math.max(0, Math.min(lessonIndex, module.lessons.length - 1));
  const lesson = getCurrentLesson();
  state.pageIndex = Math.max(0, Math.min(pageIndex, lesson.pages.length - 1));
  state.mode = mode;
  saveLocation();
  closeDrawers();
  renderReader();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function goRelative(direction) {
  const module = getCurrentModule();
  const flatPages = allPages(module);
  const index = flatPages.findIndex(
    (item) => item.lessonIndex === state.lessonIndex && item.pageIndex === state.pageIndex
  );
  const next = flatPages[index + direction];

  if (direction > 0 && index >= 0 && !isFinalExamModule(module)) {
    const currentPage = flatPages[index];
    const id = pageId(state.moduleIndex, currentPage.lessonIndex, currentPage.pageIndex);
    if (!state.visited.has(id)) {
      state.visited.add(id);
      saveVisited();
    }
  }

  if (next) {
    goTo(state.moduleIndex, next.lessonIndex, next.pageIndex);
  } else if (direction > 0) {
    if (isFinalExamModule(module)) {
      startFinalExam();
    } else {
      showQuiz();
    }
  }
}

function showQuiz() {
  if (isFinalExamModule(getCurrentModule())) {
    startFinalExam();
    return;
  }

  const module = getCurrentModule();
  const pagesComplete = allPages(module).every((item) =>
    isPageVisited(state.moduleIndex, item.lessonIndex, item.pageIndex)
  );
  if (!UNLOCK_MODULE_NAVIGATION && !pagesComplete) {
    showToast("Quizet låses upp när du har gått igenom alla sidor i modulen.");
    return;
  }

  state.mode = "quiz";
  saveLocation();
  closeDrawers();
  els.homePanel.hidden = true;
  els.courseHub.hidden = true;
  els.quizOverviewPanel.hidden = true;
  els.moduleContextBar.hidden = false;
  els.moduleMilestonePanel.hidden = true;
  els.readerPanel.hidden = true;
  els.quizPanel.hidden = false;
  els.finalExamPanel.hidden = true;
  els.metaPills.hidden = false;
  els.quizButton.hidden = false;
  setBodyLayoutMode();
  renderModuleContext();
  els.lessonTitle.textContent = `Quiz Modul ${moduleNumber(getCurrentModule())}`;
  els.pageCount.textContent = `${getCurrentModule().quiz.length} frågor`;
  renderBreadcrumbs();
  renderQuiz();
  renderActiveNav();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function returnToLesson() {
  state.mode = "lesson";
  saveLocation();
  renderReader();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  mountMobileUserButtons();
}

function mountMobileUserButtons() {
  if (!state.authClient?.user) return;

  document.querySelectorAll("[data-mobile-auth-user-button]").forEach((container) => {
    if (container.dataset.authMounted === "true") return;
    container.dataset.authMounted = "true";
    container.textContent = "";
    state.authClient.mountUserButton(container);
  });
}

function closeDrawers() {
  els.courseSidebar.classList.remove("is-open");
  els.contextSidebar.classList.remove("is-open");
  els.navOverlay.classList.remove("is-open");
}

function openDrawer(which) {
  closeDrawers();
  if (which === "nav") els.courseSidebar.classList.add("is-open");
  if (which === "context") els.contextSidebar.classList.add("is-open");
  els.navOverlay.classList.add("is-open");
}

function syncModalOpenState() {
  const hasOpenModal =
    !els.quizResetModal.hidden ||
    !els.emblemModal.hidden ||
    !els.premiumModal.hidden ||
    Boolean(els.cvDesktopModal && !els.cvDesktopModal.hidden);
  document.body.classList.toggle("modal-open", hasOpenModal);
}

const PREMIUM_MODAL_REASONS = {
  content: "Den här delen av utbildningen ingår i Premium. Lås upp hela Vaktskolan och fortsätt utan begränsningar.",
  vu2: "VU2 ingår i Premium. Du får hela fördjupningsutbildningen, alla övningar och slutprovet.",
  final_exam: "Slutproven ingår i Premium och låses upp när kursens moduler är slutförda.",
  vu1_question: "Du har använt dina 10 kostnadsfria VU1-frågor. Med Premium kan du fortsätta träna obegränsat.",
  scenario_question: "Du har använt dina 10 kostnadsfria scenariofrågor. Med Premium får du hela scenariobanken.",
  flashcard_flip: "Du har använt dina 10 kostnadsfria flashcard-vändningar. Med Premium kan du repetera alla kort obegränsat.",
};

function openPremiumModal(reason = "content", trigger = null) {
  if (isPremiumMember()) {
    showToast("Premium är redan aktivt på ditt konto.");
    return;
  }
  state.membership.dialogTrigger = trigger || document.activeElement;
  els.premiumModalDescription.textContent = PREMIUM_MODAL_REASONS[reason] || PREMIUM_MODAL_REASONS.content;
  els.premiumCheckoutButton.disabled = false;
  els.premiumCheckoutButton.classList.remove("is-loading");
  els.premiumModal.hidden = false;
  syncModalOpenState();
  refreshIcons();
  els.premiumModal.querySelector("[data-close-premium]")?.focus();
}

function closePremiumModal() {
  if (els.premiumModal.hidden) return;
  els.premiumModal.hidden = true;
  syncModalOpenState();
  state.membership.dialogTrigger?.focus?.();
  state.membership.dialogTrigger = null;
}

async function handlePremiumCheckout() {
  if (els.premiumCheckoutButton.disabled) return;
  els.premiumCheckoutButton.disabled = true;
  els.premiumCheckoutButton.classList.add("is-loading");
  try {
    await startPremiumCheckout();
  } catch (error) {
    console.error("Stripe Checkout kunde inte startas.", error);
    els.premiumCheckoutButton.disabled = false;
    els.premiumCheckoutButton.classList.remove("is-loading");
    showToast("Betalningen kunde inte startas. Försök igen om en stund.");
  }
}

function openEmblemModal(emblemId, trigger) {
  const emblem = state.emblems.find((item) => item.id === emblemId);
  if (!emblem) return;

  state.emblemDialogTrigger = trigger || null;
  els.emblemModal.className = `emblem-modal home-emblem-theme-${emblem.theme}`;
  els.emblemModalMedallion.className = `emblem-modal-medallion home-emblem-theme-${emblem.theme} ${emblem.unlocked ? "is-unlocked" : "is-locked"}`;
  els.emblemModalIcon.innerHTML = `<i data-lucide="${emblem.icon}"></i>`;
  els.emblemModalStatus.textContent = emblem.unlocked ? "Upplåst emblem" : "Låst emblem";
  els.emblemModalStatus.classList.toggle("is-unlocked", emblem.unlocked);
  els.emblemModalTitle.textContent = emblem.title;
  els.emblemModalDescription.textContent = emblem.description;
  els.emblemModalCriterion.textContent = emblem.criterion;
  els.emblemModalProgress.textContent = emblem.progressLabel;
  els.emblemModalProgressBar.style.width = `${emblem.percent}%`;
  els.emblemModalProgressBar.parentElement.setAttribute("aria-valuenow", String(emblem.percent));
  els.emblemModal.hidden = false;
  syncModalOpenState();
  refreshIcons();
  els.emblemModal.querySelector("[data-close-emblem]")?.focus();
}

function closeEmblemModal() {
  if (els.emblemModal.hidden) return;
  els.emblemModal.hidden = true;
  syncModalOpenState();
  state.emblemDialogTrigger?.focus?.();
  state.emblemDialogTrigger = null;
}

function openQuizResetModal() {
  els.quizResetModal.hidden = false;
  syncModalOpenState();
  refreshIcons();
}

function closeQuizResetModal() {
  els.quizResetModal.hidden = true;
  syncModalOpenState();
}

function resetQuizHistory() {
  state.answers = {};
  state.quizSubmissions = {};
  state.scenarioProgress = {};
  state.finalExams = {};
  state.finalExam = null;
  saveAnswers();
  saveQuizSubmissions();
  saveScenarioProgress();
  saveFinalExam();
  resetQuizPortalSession("home");
  closeQuizResetModal();
  rerenderAfterQuizReset();
  showToast("Quizhistoriken är nollställd.");
  refreshIcons();
}

function rerenderAfterQuizReset() {
  if (state.mode === "quiz-overview") {
    showQuizOverview();
  } else if (state.mode === "final-exam" || state.mode === "final-exam-portal") {
    showFinalExamPortal();
  } else if (state.mode === "hub") {
    showCourseHub();
  } else if (state.mode === "vu2") {
    showVu2();
  } else if (state.mode === "home") {
    showHome();
  } else if (state.mode === "module-milestone") {
    renderModuleMilestone();
    renderModuleList();
    renderContext();
  } else if (state.mode === "quiz") {
    renderQuiz();
    renderContext();
  } else if (state.mode === "lesson") {
    renderReader();
  }
}

function rerenderAfterMembershipChange() {
  rerenderAfterQuizReset();
  renderNavigationLocks();
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  els.toast.textContent = message;
  els.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

function restoreSavedLocation() {
  const saved = readSavedLocation();
  if (!saved) return "home";

  if (!isCourseUnlocked(saved.courseId)) {
    activateCourse("vu1");
    return "home";
  }

  activateCourse(saved.courseId);
  if (KNOWLEDGE_BASE_TABS.has(saved.knowledgeBaseTab)) state.knowledgeBaseTab = saved.knowledgeBaseTab;
  if (!state.modules.length) return "home";

  state.moduleIndex = Math.max(0, Math.min(saved.moduleIndex, state.modules.length - 1));
  if (!isModuleUnlocked(state.moduleIndex)) {
    state.moduleIndex = 0;
  }

  const module = getCurrentModule();
  if (!module?.lessons?.length) {
    state.lessonIndex = 0;
    state.pageIndex = 0;
    return saved.mode === "final-exam" ? "final-exam" : "home";
  }

  state.lessonIndex = Math.max(0, Math.min(saved.lessonIndex, module.lessons.length - 1));

  const lesson = getCurrentLesson();
  state.pageIndex = Math.max(0, Math.min(saved.pageIndex, lesson.pages.length - 1));
  if (!isPageUnlocked(state.moduleIndex, state.lessonIndex, state.pageIndex)) {
    state.lessonIndex = 0;
    state.pageIndex = 0;
  }
  state.mode = "lesson";

  if (saved.mode === "quiz") return "quiz";
  if (saved.mode === "quiz-overview") return "quiz-overview";
  if (saved.mode === "knowledge-base") return "knowledge-base";
  if (saved.mode === "module-milestone") return "module-milestone";
  if (saved.mode === "final-exam-portal") return "final-exam-portal";
  if (saved.mode === "final-exam") return "final-exam";
  if (saved.mode === "hub") return "hub";
  if (saved.mode === "vu2") return "vu2";
  if (saved.mode === "home") return "home";
  return "lesson";
}

function bindEvents() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      prepareHomeReturn();
      return;
    }
    returnHomeOnResume();
  });

  window.addEventListener("pagehide", prepareHomeReturn);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) returnHomeOnResume();
  });
  window.addEventListener("popstate", (event) => {
    const historyLocation = event.state?.[PORTAL_HISTORY_STATE_KEY];
    restorePortalHistory(historyLocation || portalLocationFromHash(window.location.hash));
  });

  document.addEventListener("click", (event) => {
    const premiumLock = event.target.closest("[data-premium-lock]");
    if (premiumLock) {
      openPremiumModal(premiumLock.dataset.premiumLock || "content", premiumLock);
      closeDrawers();
      return;
    }

    if (event.target === els.premiumModal || event.target.closest("[data-close-premium]")) {
      closePremiumModal();
      return;
    }

    if (event.target === els.cvDesktopModal || event.target.closest("[data-close-cv-desktop]")) {
      closeCvDesktopModal();
      return;
    }

    if (event.target.closest("[data-start-premium-checkout]")) {
      void handlePremiumCheckout();
      return;
    }

    const comingSoon = event.target.closest("[data-coming-soon]");
    if (comingSoon) {
      showToast(`${comingSoon.dataset.comingSoon} är inte aktiverat ännu.`);
      closeDrawers();
      return;
    }

    const moduleInfoButton = event.target.closest("#moduleInfoButton");
    if (moduleInfoButton) {
      const isOpen = !els.moduleInfoPanel.hidden;
      els.moduleInfoPanel.hidden = isOpen;
      els.moduleInfoButton.setAttribute("aria-expanded", String(!isOpen));
      els.moduleInfoButton.setAttribute("aria-label", isOpen ? "Visa modulinformation" : "Dölj modulinformation");
      return;
    }

    if (event.target === els.emblemModal || event.target.closest("[data-close-emblem]")) {
      closeEmblemModal();
      return;
    }

    const emblemButton = event.target.closest("[data-emblem-id]");
    if (emblemButton) {
      openEmblemModal(emblemButton.dataset.emblemId, emblemButton);
      return;
    }

    if (event.target === els.quizResetModal || event.target.closest("[data-cancel-quiz-reset]")) {
      closeQuizResetModal();
      return;
    }

    const openQuizResetButton = event.target.closest("[data-open-quiz-reset]");
    if (openQuizResetButton) {
      openQuizResetModal();
      return;
    }

    const confirmQuizResetButton = event.target.closest("[data-confirm-quiz-reset]");
    if (confirmQuizResetButton) {
      resetQuizHistory();
      return;
    }

    const homeButton = event.target.closest("[data-open-home]");
    if (homeButton) {
      showHome();
      return;
    }

    const cvBuilderTab = event.target.closest("[data-open-cv-builder]");
    if (cvBuilderTab) {
      if (isCompactCvViewport()) openCvDesktopModal();
      else showKnowledgeBase("cv");
      return;
    }

    const knowledgeBaseButton = event.target.closest("[data-open-knowledge-base], [data-open-salary-check]");
    if (knowledgeBaseButton) {
      showKnowledgeBase(knowledgeBaseButton.hasAttribute("data-open-salary-check") ? "lonekollen" : undefined);
      return;
    }

    const cvActionButton = event.target.closest("[data-cv-action]");
    if (cvActionButton && state.mode === "knowledge-base" && state.knowledgeBaseTab === "cv") {
      handleCvBuilderAction(cvActionButton.dataset.cvAction);
      return;
    }

    const cvRemoveExperienceButton = event.target.closest("[data-cv-remove-experience]");
    if (cvRemoveExperienceButton) {
      const id = cvRemoveExperienceButton.dataset.cvRemoveExperience;
      cvBuilderState.experiences = cvBuilderState.experiences.filter((entry) => entry.id !== id);
      saveCvBuilderState();
      renderCvExperienceForms();
      updateCvPreview();
      return;
    }

    const cvRemoveEducationButton = event.target.closest("[data-cv-remove-education]");
    if (cvRemoveEducationButton) {
      const id = cvRemoveEducationButton.dataset.cvRemoveEducation;
      cvBuilderState.educations = cvBuilderState.educations.filter((entry) => entry.id !== id);
      saveCvBuilderState();
      renderCvEducationForms();
      updateCvPreview();
      return;
    }

    const salaryCalculatorLink = event.target.closest("[data-salary-calculator-link]");
    if (salaryCalculatorLink && state.mode === "knowledge-base") {
      event.preventDefault();
      const calculator = els.knowledgeBasePanel?.querySelector("#salary-calculator");
      calculator?.scrollIntoView({ behavior: "smooth", block: "start" });
      calculator?.querySelector("button, input")?.focus({ preventScroll: true });
      return;
    }

    const salaryStepButton = event.target.closest("[data-salary-step]");
    if (salaryStepButton) {
      salaryCheckState.stepKey = salaryStepButton.dataset.salaryStep;
      updateSalaryCalculator();
      return;
    }

    const salaryPresetButton = event.target.closest("[data-salary-preset]");
    if (salaryPresetButton) {
      const preset = SALARY_CHECK_CONFIG.presets.find((item) => item.key === salaryPresetButton.dataset.salaryPreset);
      if (!preset) return;
      salaryCheckState.presetKey = preset.key;
      salaryCheckState.hours = { ...preset.hours };
      updateSalaryCalculator();
      return;
    }

    const vu2Button = event.target.closest("[data-open-vu2]");
    if (vu2Button) {
      showVu2();
      return;
    }

    const finalExamPortalButton = event.target.closest("[data-open-final-exam-portal]");
    if (finalExamPortalButton) {
      showFinalExamPortal();
      return;
    }

    const homeContinueButton = event.target.closest("[data-home-continue-course]");
    if (homeContinueButton) {
      activateCourse(homeContinueButton.dataset.homeContinueCourse || "vu1");
      goTo(
        Number(homeContinueButton.dataset.homeContinueModule),
        Number(homeContinueButton.dataset.homeContinueLesson),
        Number(homeContinueButton.dataset.homeContinuePage)
      );
      return;
    }

    const courseButton = event.target.closest("[data-open-course]");
    if (courseButton && !event.target.closest("[data-next-module]")) {
      showCourseHub();
      return;
    }

    const moduleMilestoneStartButton = event.target.closest("#moduleMilestoneStartButton");
    if (moduleMilestoneStartButton) {
      goTo(
        Number(moduleMilestoneStartButton.dataset.module),
        Number(moduleMilestoneStartButton.dataset.lesson),
        Number(moduleMilestoneStartButton.dataset.page),
        "lesson",
        { skipMilestone: true }
      );
      return;
    }

    const hubContinueButton = event.target.closest("#hubContinueButton");
    if (hubContinueButton) {
      goTo(Number(hubContinueButton.dataset.module), Number(hubContinueButton.dataset.lesson), Number(hubContinueButton.dataset.page));
      return;
    }

    const hubModuleButton = event.target.closest("[data-hub-module]");
    if (hubModuleButton) {
      const target = getModuleResumePosition(Number(hubModuleButton.dataset.hubModule));
      goTo(target.moduleIndex, target.lessonIndex, target.pageIndex);
      return;
    }

    const nextModuleButton = event.target.closest("[data-next-module]");
    if (nextModuleButton) {
      goTo(state.moduleIndex + 1, 0, 0);
      return;
    }

    const returnLessonButton = event.target.closest("[data-return-lesson]");
    if (returnLessonButton) {
      returnToLesson();
      return;
    }

    const finalResultDoneButton = event.target.closest("[data-final-result-done]");
    if (finalResultDoneButton) {
      if (state.courseId === "vu2") {
        showVu2();
      } else {
        showCourseHub();
      }
      return;
    }

    const moduleButton = event.target.closest("[data-module]");
    if (moduleButton && moduleButton.classList.contains("module-card")) {
      goTo(Number(moduleButton.dataset.module));
      return;
    }

    const pageButton = event.target.closest("[data-page]");
    if (pageButton?.dataset.lesson !== undefined) {
      goTo(state.moduleIndex, Number(pageButton.dataset.lesson), Number(pageButton.dataset.page));
      return;
    }

    const quizTrigger = event.target.closest("[data-show-quiz]");
    if (quizTrigger) {
      cancelQuizPortalCountdown();
      resetQuizPortalSession("home");
      showQuizOverview();
      return;
    }

    const quizPortalHomeButton = event.target.closest("[data-quiz-portal-home]");
    if (quizPortalHomeButton) {
      cancelQuizPortalCountdown();
      resetQuizPortalSession("home");
      renderQuizOverview();
      refreshIcons();
      scrollQuizPortalToTop();
      return;
    }

    const quizPortalViewButton = event.target.closest("[data-quiz-portal-view]");
    if (quizPortalViewButton) {
      const view = quizPortalViewButton.dataset.quizPortalView;
      const module = getQuizPortalModule(view);
      const lockReason = quizPortalLockReason(module);
      if (lockReason) {
        openPremiumModal(lockReason, quizPortalViewButton);
        return;
      }
      if (view === "review") {
        void startQuizPortalReviewSession();
        return;
      }
      if (Object.prototype.hasOwnProperty.call(QUIZ_PORTAL_BANK_CONFIG, view)) {
        startQuizPortalCountdown(view);
        return;
      }

      cancelQuizPortalCountdown();
      resetQuizPortalSession(view);
      renderQuizOverview();
      refreshIcons();
      scrollQuizPortalToTop();
      return;
    }

    const retryQuizPortalDataButton = event.target.closest("[data-retry-quiz-portal-data]");
    if (retryQuizPortalDataButton) {
      state.quizPortal.dataStatus = "idle";
      state.quizPortal.dataError = "";
      renderQuizOverview();
      refreshIcons();
      void loadQuizPortalData().then(() => {
        if (state.quizPortal.dataStatus === "ready") {
          if (state.quizPortal.view === "review") {
            void startQuizPortalReviewSession();
          } else {
            startQuizPortalHistoryAttempt();
            startQuizPortalQuestionTimer();
          }
        }
      });
      return;
    }

    const quizPortalOptionButton = event.target.closest("[data-quiz-portal-option]");
    if (quizPortalOptionButton && state.mode === "quiz-overview" && !state.quizPortal.isAnswered) {
      void answerQuizPortalQuestion(Number(quizPortalOptionButton.dataset.quizPortalOption));
      return;
    }

    const quizPortalNextButton = event.target.closest("[data-quiz-portal-next]");
    if (quizPortalNextButton && state.mode === "quiz-overview") {
      const quiz = getQuizPortalSessionQuiz();
      if (!quiz) return;

      stopQuizPortalQuestionTimer();
      if (state.quizPortal.currentIndex + 1 < quiz.questions.length) {
        state.quizPortal.currentIndex += 1;
        state.quizPortal.selectedOption = null;
        state.quizPortal.isAnswered = false;
        state.quizPortal.timedOut = false;
        state.quizPortal.questionTimeRemaining = QUIZ_PORTAL_QUESTION_TIME_SECONDS;
      } else {
        state.quizPortal.showResults = true;
        completeQuizPortalHistoryAttempt();
      }
      renderQuizOverview();
      refreshIcons();
      if (!state.quizPortal.showResults) startQuizPortalQuestionTimer();
      scrollQuizPortalToTop();
      return;
    }

    const quizPortalResetButton = event.target.closest("[data-quiz-portal-reset]");
    if (quizPortalResetButton && state.mode === "quiz-overview") {
      const lockReason = quizPortalLockReason(getQuizPortalModule(state.quizPortal.view));
      if (lockReason) {
        openPremiumModal(lockReason, quizPortalResetButton);
        return;
      }
      if (state.quizPortal.view === "review") {
        void startQuizPortalReviewSession();
        return;
      }
      resetQuizPortalSession(state.quizPortal.view);
      startQuizPortalHistoryAttempt();
      renderQuizOverview();
      refreshIcons();
      startQuizPortalQuestionTimer();
      scrollQuizPortalToTop();
      return;
    }

    const flashcardToggle = event.target.closest("[data-flashcard-toggle]");
    if (flashcardToggle && state.mode === "quiz-overview") {
      void toggleQuizPortalFlashcard();
      return;
    }

    const flashcardPrev = event.target.closest("[data-flashcard-prev]");
    if (flashcardPrev && state.mode === "quiz-overview") {
      const cards = state.quizPortal.flashcards;
      if (!cards.length) return;
      state.quizPortal.flashcardFlipped = false;
      state.quizPortal.flashcardIndex = (state.quizPortal.flashcardIndex - 1 + cards.length) % cards.length;
      renderQuizOverview();
      refreshIcons();
      return;
    }

    const flashcardNext = event.target.closest("[data-flashcard-next]");
    if (flashcardNext && state.mode === "quiz-overview") {
      const cards = state.quizPortal.flashcards;
      if (!cards.length) return;
      state.quizPortal.flashcardFlipped = false;
      state.quizPortal.flashcardIndex = (state.quizPortal.flashcardIndex + 1) % cards.length;
      renderQuizOverview();
      refreshIcons();
      return;
    }

    const finalPortalButton = event.target.closest("[data-final-portal-course][data-final-portal-action]");
    if (finalPortalButton) {
      const courseId = finalPortalButton.dataset.finalPortalCourse;
      const action = finalPortalButton.dataset.finalPortalAction;

      if (!isCourseUnlocked(courseId)) {
        showToast("Kursen är låst just nu.");
        return;
      }

      activateCourse(courseId);
      if (action === "resume" && state.finalExam) {
        showFinalExam();
      } else {
        startFinalExam();
      }
      return;
    }

    const finalExamStartButton = event.target.closest("[data-start-final-exam]");
    if (finalExamStartButton) {
      startFinalExam();
      return;
    }

    const finalExamResumeButton = event.target.closest("[data-resume-final-exam]");
    if (finalExamResumeButton) {
      showFinalExam();
      return;
    }

    const mixedQuizButton = event.target.closest("[data-start-mixed-quiz]");
    if (mixedQuizButton) {
      showToast("Blandat scenarioquiz kommer i nästa steg.");
      return;
    }

    const reviewWrongButton = event.target.closest("[data-review-wrong]");
    if (reviewWrongButton) {
      showToast("Övning på tidigare fel kommer i nästa steg.");
      return;
    }

    const scenarioButton = event.target.closest("[data-scenario-quiz]");
    if (scenarioButton) {
      const scenario = quizScenarios.find((item) => item.id === Number(scenarioButton.dataset.scenarioQuiz));
      showToast(`${scenario?.title || "Scenarioquiz"} kommer i nästa steg.`);
      return;
    }

    const finalQuestionButton = event.target.closest("[data-final-question-index]");
    if (finalQuestionButton) {
      goFinalExamQuestion(Number(finalQuestionButton.dataset.finalQuestionIndex));
      return;
    }

    const finalReviewBackButton = event.target.closest("[data-final-review-back]");
    if (finalReviewBackButton) {
      if (state.finalExam) state.finalExam.reviewMode = false;
      saveFinalExam();
      renderFinalExam();
      refreshIcons();
      return;
    }

    const finalSubmitButton = event.target.closest("[data-final-submit]");
    if (finalSubmitButton) {
      submitFinalExam();
      return;
    }

    const finalAnswerButton = event.target.closest("[data-final-answer]");
    if (finalAnswerButton && state.finalExam && !state.finalExam.completedAt) {
      const questions = getFinalExamQuestions();
      const question = questions[state.finalExam.currentIndex || 0];
      if (!question) return;

      state.finalExam.answers = isPlainObject(state.finalExam.answers) ? state.finalExam.answers : {};
      state.finalExam.answers[question.id] = finalAnswerButton.dataset.finalAnswer;
      saveFinalExam();
      renderFinalExam();
      refreshIcons();
      return;
    }

    const answerButton = event.target.closest("[data-question][data-answer]");
    if (answerButton) {
      const key = answerKey();
      if (state.quizSubmissions[key]) return;
      const moduleAnswers = isPlainObject(state.answers[key]) ? state.answers[key] : {};
      moduleAnswers[answerButton.dataset.question] = answerButton.dataset.answer;
      state.answers[key] = moduleAnswers;
      saveAnswers();
      renderQuiz();
      refreshIcons();
      return;
    }

    const submitQuizButton = event.target.closest("[data-submit-module-quiz]");
    if (submitQuizButton) {
      const module = getCurrentModule();
      const key = answerKey();
      const moduleAnswers = isPlainObject(state.answers[key]) ? state.answers[key] : {};
      if (!module?.quiz.length || Object.keys(moduleAnswers).length !== module.quiz.length) return;
      state.quizSubmissions[key] = Date.now();
      saveQuizSubmissions();
      recordModuleQuizAttempt(module, moduleAnswers, state.quizSubmissions[key]);
      renderQuiz();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  });

  document.addEventListener("input", (event) => {
    const salaryObInput = event.target.closest?.("[data-salary-ob]");
    if (!salaryObInput) return;
    salaryCheckState.hours[salaryObInput.dataset.salaryOb] = Number(salaryObInput.value) || 0;
    salaryCheckState.presetKey = "";
    updateSalaryCalculator();
  });

  els.prevButton.addEventListener("click", () => goRelative(-1));
  els.nextButton.addEventListener("click", () => goRelative(1));
  els.quizButton.addEventListener("click", showQuiz);
  els.backToLessonButton.addEventListener("click", returnToLesson);
  els.finalExamPrevButton.addEventListener("click", () => goFinalExamRelative(-1));
  els.finalExamNextButton.addEventListener("click", goFinalExamNext);
  els.finalExamSubmitButton.addEventListener("click", submitFinalExam);
  els.resetQuizButton.addEventListener("click", () => {
    const key = answerKey();
    delete state.answers[key];
    delete state.quizSubmissions[key];
    saveAnswers();
    saveQuizSubmissions();
    renderQuiz();
    refreshIcons();
  });
  els.knowledgeBasePanel?.addEventListener("input", handleCvBuilderFieldInput);
  els.knowledgeBasePanel?.addEventListener("change", handleCvBuilderFieldInput);
  $("#openNavButton").addEventListener("click", () => openDrawer("nav"));
  $("#closeNavButton").addEventListener("click", closeDrawers);
  $("#openContextButton").addEventListener("click", () => openDrawer("context"));
  $("#closeContextButton").addEventListener("click", closeDrawers);
  els.navOverlay.addEventListener("click", closeDrawers);
  document.addEventListener("keydown", (event) => {
    const isTyping = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
    const openDialog = !els.premiumModal.hidden
      ? els.premiumModal
      : !els.emblemModal.hidden
        ? els.emblemModal
        : els.cvDesktopModal && !els.cvDesktopModal.hidden
          ? els.cvDesktopModal
          : null;
    if (event.key === "Tab" && openDialog) {
      const focusable = Array.from(openDialog.querySelectorAll("button:not([disabled]), a[href]"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    if (event.key === "Escape") {
      closePremiumModal();
      closeEmblemModal();
      closeQuizResetModal();
      closeCvDesktopModal();
      closeDrawers();
    }

    if (!isTyping && state.mode === "lesson" && event.key === "ArrowRight") {
      goRelative(1);
    }

    if (!isTyping && state.mode === "lesson" && event.key === "ArrowLeft") {
      goRelative(-1);
    }

    if (!isTyping && state.mode === "final-exam" && event.key === "ArrowRight") {
      goFinalExamNext();
    }

    if (!isTyping && state.mode === "final-exam" && event.key === "ArrowLeft") {
      goFinalExamRelative(-1);
    }
  });
}

async function init() {
  const canLoadPlatform = await requireAuthenticatedUser();
  if (!canLoadPlatform) return;
  if (await maybeStartPremiumCheckout()) return;

  bindEvents();
  initializeSupabaseConnection();
  await initializeMembership();
  const response = await fetch("utbildning.md?v=20260723-quiz-balans");
  const markdown = await response.text();
  state.courses = parseCourses(markdown);
  state.finalExamPools = Object.fromEntries(
    Object.entries(state.courses).map(([courseId, modules]) => [courseId, buildFinalExamPool(modules)])
  );
  activateCourse("vu1");
  const progressReady = await initializeProgressSync();
  if (!progressReady) {
    renderPlatformUnavailable(
      "Din progression kunde inte synkas",
      "Vi öppnar inte kursen förrän din kontosparning är ansluten. Dina framsteg ska följa med mellan dina enheter."
    );
    return;
  }
  await initializeQuizHistory();
  activateCourse("vu1");
  ensureFinalExamIntegrity();
  activateCourse("vu2");
  ensureFinalExamIntegrity();
  activateCourse("vu1");

  if (!state.modules.length) {
    els.article.innerHTML = "<p>Kursmaterialet kunde inte läsas in.</p>";
    revealPlatform();
    return;
  }

  const initialMode = restoreSavedLocation();
  hideModuleList();
  renderContext();
  renderQuiz();
  if (initialMode === "hub") {
    showCourseHub();
  } else if (initialMode === "vu2") {
    showVu2();
  } else if (initialMode === "quiz-overview") {
    showQuizOverview();
  } else if (initialMode === "knowledge-base") {
    showKnowledgeBase();
  } else if (initialMode === "module-milestone") {
    showModuleMilestone(state.moduleIndex, state.lessonIndex, state.pageIndex);
  } else if (initialMode === "final-exam-portal") {
    showFinalExamPortal();
  } else if (initialMode === "final-exam" && state.finalExam) {
    showFinalExam();
  } else if (initialMode === "quiz") {
    showQuiz();
  } else if (initialMode === "lesson") {
    renderReader();
  } else {
    showHome();
  }

  initializePortalHistory();
  revealPlatform();
  void confirmPremiumAfterCheckout();
}

init().catch((error) => {
  console.error(error);
  renderPlatformUnavailable(
    "Lärplattformen kunde inte laddas",
    "Ett oväntat fel uppstod innan kursen var redo. Försök igen om en stund."
  );
});
