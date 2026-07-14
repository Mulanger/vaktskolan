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
};

const STORAGE_VERSION = "vu2-course-split-2026-07-04";
const UNLOCK_MODULE_NAVIGATION = true;
const ENFORCE_COURSE_LOCKS = false;
const FINAL_EXAM_SIZE = 30;
const FINAL_EXAM_DURATION_MS = 15 * 60 * 1000;
const FINAL_EXAM_LOCK_MS = 24 * 60 * 60 * 1000;
const FINAL_EXAM_PASS_PERCENT = 80;
const MODULE_QUIZ_PASS_PERCENT = 80;
const PROGRESS_SCHEMA_VERSION = 1;
const PROGRESS_TABLE = "student_learning_progress";
const RESTORABLE_MODES = new Set([
  "home",
  "hub",
  "vu2",
  "lesson",
  "module-milestone",
  "quiz",
  "quiz-overview",
  "final-exam-portal",
  "final-exam",
]);

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

const state = {
  courses: { vu1: [], vu2: [] },
  courseId: "vu1",
  modules: [],
  moduleIndex: 0,
  lessonIndex: 0,
  pageIndex: 0,
  mode: "home",
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
  progressSync: {
    userId: "",
    ready: false,
    syncing: false,
    queued: false,
    timer: null,
    error: null,
  },
  quizPortal: {
    view: "home",
    dataStatus: "idle",
    dataError: "",
    quizzes: {},
    flashcards: [],
    currentIndex: 0,
    selectedOption: null,
    answers: [],
    isAnswered: false,
    score: 0,
    showResults: false,
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

function saveLocation(mode = state.mode) {
  writeStorage(STORAGE_KEYS.location, {
    courseId: state.courseId,
    moduleIndex: state.moduleIndex,
    lessonIndex: state.lessonIndex,
    pageIndex: state.pageIndex,
    mode,
  });
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
  if (!userId || !supabaseApi?.ready || !supabaseApi?.select) return;

  try {
    const storedOwner = readStorage(STORAGE_KEYS.progressOwner, "");
    if (storedOwner && storedOwner !== userId) {
      applyProgressSnapshot({ completedPages: [], quizAnswers: {}, quizSubmissions: {}, finalExams: {} });
      try {
        localStorage.removeItem(STORAGE_KEYS.location);
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
  } catch (error) {
    sync.error = error;
    sync.ready = false;
    console.warn("Kontosynkning av progression är inte tillgänglig. Lokal progression används.", error);
  }
}

let shouldReturnHomeOnResume = false;

function prepareHomeReturn() {
  shouldReturnHomeOnResume = true;
  saveLocation("home");
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

function renderAuthError(error) {
  console.error(error);
  console.warn("Auth kunde inte kontrolleras. Dashboarden laddas utan auth-gate.");
}

function revealPlatform() {
  document.body.classList.remove("app-booting");
  const bootScreen = document.querySelector("#appBootScreen");
  if (bootScreen) bootScreen.hidden = true;
}

async function requireAuthenticatedUser() {
  const auth = window.vaktskolanAuthProvider;
  if (!auth?.ready) return true;

  try {
    const authClient = await auth.ready;
    if (!authClient) return true;

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
    renderAuthError(error);
    return true;
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

function isModuleUnlocked(moduleIndex) {
  if (UNLOCK_MODULE_NAVIGATION) return true;
  if (moduleIndex <= 0) return true;
  return hasVisitedAnyPage(moduleIndex) || isModuleComplete(moduleIndex - 1);
}

function getFlatPageIndex(module, lessonIndex, pageIndex) {
  return allPages(module).findIndex((item) => item.lessonIndex === lessonIndex && item.pageIndex === pageIndex);
}

function isPageUnlocked(moduleIndex, lessonIndex, pageIndex) {
  const module = state.modules[moduleIndex];
  if (!module || !isModuleUnlocked(moduleIndex)) return false;

  if (moduleIndex === state.moduleIndex && lessonIndex === state.lessonIndex && pageIndex === state.pageIndex) {
    return true;
  }

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
      const locked = isFinalExamModule(module) ? !canAccessFinalExam() : !isModuleUnlocked(index);
      const progressContent = complete
        ? '<i data-lucide="check" aria-hidden="true"></i>'
        : `<span class="module-progress-value">${progress}%</span>`;
      return `
        <button class="module-card ${index === state.moduleIndex ? "is-active" : ""} ${complete ? "is-complete" : ""} ${locked ? "is-locked" : ""}"
          type="button" data-module="${index}" ${locked ? 'disabled aria-disabled="true" title="Låses upp när föregående modul är klar"' : ""}>
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
  return UNLOCK_MODULE_NAVIGATION || areContentModulesComplete();
}

function canAccessFinalExam() {
  return canStartFinalExam() || Boolean(state.finalExam);
}

function isCourseUnlocked(courseId) {
  if (!COURSE_CONFIG[courseId]) return false;
  if (!ENFORCE_COURSE_LOCKS || courseId === "vu1") return true;
  if (courseId === "vu2") {
    return withCourseContext("vu1", () => areContentModulesComplete());
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
  const actionLabel = overview.locked ? "Slutför VU1 först" : "Öppna kurs";
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
        ${overview.locked ? '<small class="home-course-lock-note"><i data-lucide="circle-alert"></i> Slutför VU1 för att låsa upp</small>' : ""}
      </div>
      <button class="home-course-action" type="button" ${overview.locked ? 'disabled aria-disabled="true" title="Slutför VU1 för att låsa upp VU2"' : actionAttribute}>
        <span>${actionLabel}</span>
        <i data-lucide="${overview.locked ? "lock" : "arrow-right"}"></i>
      </button>
    </article>
  `;
}

function renderHome() {
  const homeData = getHomeData();
  const continueOverview = homeData.continueCourse;
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
  const vu2NavAttributes = vu2Overview?.locked ? 'disabled aria-disabled="true" title="Slutför VU1 för att låsa upp VU2"' : "data-open-vu2";

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

        <section class="home-stat-grid" aria-label="Snabb översikt">
          <div class="home-stat">
            <p>
              <span class="home-stat-dot is-blue" aria-hidden="true"></span>
              <span class="home-stat-label-full">Total utbildning</span>
              <span class="home-stat-label-short">Utbildning</span>
            </p>
            <strong>${homeData.totals.percent}%</strong>
          </div>
          <div class="home-stat">
            <p>
              <span class="home-stat-dot is-green" aria-hidden="true"></span>
              <span class="home-stat-label-full">Avklarade moduler</span>
              <span class="home-stat-label-short">Moduler</span>
            </p>
            <strong>${homeData.totals.completedModules}<small>/ ${homeData.totals.modules}</small></strong>
          </div>
          <div class="home-stat">
            <p>
              <span class="home-stat-dot is-purple" aria-hidden="true"></span>
              <span>Quiz-snitt</span>
            </p>
            <strong>${homeData.totals.quizPercent === null ? "–" : `${homeData.totals.quizPercent}%`}</strong>
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
            <h2 id="homeEmblemsTitle">Dina emblem</h2>
            <span>1 av 5 upplåsta</span>
          </div>
          <div class="home-emblem-list" role="list" aria-label="Emblem">
            <div class="home-emblem-item home-emblem-vu1 is-unlocked" role="listitem" style="--home-emblem-index: 0">
              <span class="home-emblem-medallion" aria-hidden="true">
                <span class="home-emblem-inner"><i data-lucide="book-open"></i></span>
              </span>
              <strong>VU1</strong>
            </div>
            <div class="home-emblem-item is-locked" role="listitem" style="--home-emblem-index: 1">
              <span class="home-emblem-medallion" aria-hidden="true">
                <span class="home-emblem-inner"><i data-lucide="shield"></i></span>
                <span class="home-emblem-lock"><i data-lucide="lock"></i></span>
              </span>
              <strong>VU2</strong>
            </div>
            <div class="home-emblem-item is-locked" role="listitem" style="--home-emblem-index: 2">
              <span class="home-emblem-medallion" aria-hidden="true">
                <span class="home-emblem-inner"><i data-lucide="badge-check"></i></span>
                <span class="home-emblem-lock"><i data-lucide="lock"></i></span>
              </span>
              <strong>Prov 1</strong>
            </div>
            <div class="home-emblem-item is-locked" role="listitem" style="--home-emblem-index: 3">
              <span class="home-emblem-medallion" aria-hidden="true">
                <span class="home-emblem-inner"><i data-lucide="star"></i></span>
                <span class="home-emblem-lock"><i data-lucide="lock"></i></span>
              </span>
              <strong>Prov 2</strong>
            </div>
            <div class="home-emblem-item is-locked" role="listitem" style="--home-emblem-index: 4">
              <span class="home-emblem-medallion" aria-hidden="true">
                <span class="home-emblem-inner"><i data-lucide="target"></i></span>
                <span class="home-emblem-lock"><i data-lucide="lock"></i></span>
              </span>
              <strong>Quiz</strong>
            </div>
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
        <button class="home-mobile-tab ${vu2Overview?.locked ? "is-disabled" : ""}" type="button" ${vu2NavAttributes}>
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
      <button class="final-portal-mobile-tab" type="button" data-open-vu2>
        <i data-lucide="shield"></i>
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

function renderFinalExamSidebar() {
  const overviews = Object.keys(COURSE_CONFIG).map((courseId) => getFinalExamPortalOverview(courseId));
  els.moduleListWrap.hidden = false;
  els.moduleListTitle.textContent = "Tillgängliga prov";
  els.moduleCount.textContent = "VU1 + VU2";
  els.moduleList.innerHTML = overviews
    .map((overview) => {
      const isActive = state.courseId === overview.courseId;
      return `
        <button class="final-sidebar-card ${isActive ? "is-active" : ""} final-sidebar-card-${overview.tone}"
          type="button"
          data-final-portal-course="${overview.courseId}"
          data-final-portal-action="${overview.action}"
          ${overview.disabled ? 'disabled aria-disabled="true"' : ""}>
          <span class="final-sidebar-index">${escapeHtml(overview.course.shortLabel.replace("VU", ""))}</span>
          <span class="final-sidebar-copy">
            <strong>${escapeHtml(overview.course.finalExamLabel)}</strong>
            <small>${escapeHtml(overview.detail)}</small>
          </span>
          <span class="final-sidebar-status">${escapeHtml(overview.status)}</span>
        </button>
      `;
    })
    .join("");
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

function renderActiveNav() {
  document.querySelectorAll(".main-nav .nav-item").forEach((item) => item.classList.remove("is-active"));
  document.querySelectorAll(".vu1-hub-mobile-tabbar .vu1-hub-mobile-tab").forEach((item) => item.classList.remove("is-active"));
  document.querySelectorAll(".quiz-portal-mobile-tabbar .quiz-portal-mobile-tab").forEach((item) => item.classList.remove("is-active"));
  document.querySelectorAll(".final-portal-mobile-tabbar .final-portal-mobile-tab").forEach((item) => item.classList.remove("is-active"));

  const selector =
    state.mode === "home"
      ? "[data-open-home]"
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
  document.body.classList.toggle("home-mode", mode === "home");
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

  renderFinalExamSidebar();
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
      const locked = isFinalExamModule(module) ? !canAccessFinalExam() : !isModuleUnlocked(moduleIndex);
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
        <button class="hub-module-row ${complete ? "is-complete" : ""} ${moduleIndex === state.moduleIndex && state.mode !== "home" ? "is-current" : ""} ${locked ? "is-locked" : ""}"
          type="button" data-hub-module="${moduleIndex}" ${locked ? 'disabled aria-disabled="true"' : ""}>
          <span class="hub-module-index">${complete ? '<i data-lucide="check"></i>' : moduleNumber(module)}</span>
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
  state.quizPortal.view = view;
  state.quizPortal.currentIndex = 0;
  state.quizPortal.selectedOption = null;
  state.quizPortal.answers = [];
  state.quizPortal.isAnswered = false;
  state.quizPortal.score = 0;
  state.quizPortal.showResults = false;
  state.quizPortal.flashcardIndex = 0;
  state.quizPortal.flashcardFlipped = false;
}

let quizPortalDataPromise = null;
let quizPortalCountdownToken = 0;
let quizPortalCountdownTimers = [];

const QUIZ_PORTAL_BANK_CONFIG = {
  vu1: { collectionId: "vu1_quiz", title: "Väktarutbildning 1 (VU1)", expectedCount: 154 },
  vu2: { collectionId: "vu2_quiz", title: "Väktarutbildning 2 (VU2)", expectedCount: 74 },
  scenario: { collectionId: "scenario_quiz", title: "Scenario Quiz", expectedCount: 300 },
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
        if (options.length !== 4 || options.filter((option) => option.correct).length !== 1) {
          throw new Error(`Frågan ${row.id} har ogiltiga svarsalternativ.`);
        }
        return {
          id: row.id,
          question: row.prompt,
          options: options.map((option) => option.text),
          answer: options.findIndex((option) => option.correct),
          explanation: row.explanation || "Rätt svar framgår av det markerade alternativet.",
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
          "id,collection_id,prompt,answer_text,explanation,sort_order,metadata,quiz_answer_options(label,option_text,is_correct,sort_order)",
        collection_id: `in.(${collectionIds.join(",")})`,
        status: "eq.published",
        order: "sort_order.asc",
        limit: 1000,
      });

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

function quizPortalModuleMeta(module) {
  if (module.comingSoon) return "Kommer snart";
  if (state.quizPortal.dataStatus === "loading" || state.quizPortal.dataStatus === "idle") return "Laddar innehåll…";
  if (state.quizPortal.dataStatus === "error") return "Kunde inte laddas";
  if (module.view === "flashcards") {
    return `${state.quizPortal.flashcards.length} kort · vänd & lär`;
  }

  const questionCount = getQuizPortalQuiz(module.view)?.questions.length || 0;
  return `${questionCount} frågor · flerval`;
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
  renderQuizOverview();
  refreshIcons();

  const module = getQuizPortalModule(view);
  const question = els.quizPortal.querySelector(".quiz-portal-question");
  if (question) question.classList.add(`quiz-theme-${module.theme}`, "is-countdown-entry");
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
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
      <button class="quiz-portal-mobile-tab" type="button" data-open-vu2>
        <i data-lucide="shield"></i>
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
  els.moduleCount.textContent = "4 quiz · 1 kortlek";
  els.moduleList.innerHTML = quizPortalModules
    .map((module) => {
      const isActive = state.quizPortal.view === module.view;
      return `
        <button class="quiz-sidebar-card quiz-theme-${module.theme} ${isActive ? "is-active" : ""}" type="button" ${
          module.comingSoon ? `data-coming-soon="${escapeHtml(module.title)}"` : `data-quiz-portal-view="${module.view}"`
        }>
          <span class="quiz-sidebar-icon"><i data-lucide="${module.icon}"></i></span>
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
          <small>resultat sparas inte — repetera fritt</small>
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
          <span>5 sätt att träna</span>
        </div>
        <div class="quiz-portal-grid quiz-portal-grid-desktop">
          ${quizPortalModules
            .map(
              (module, index) => `
                <button class="quiz-portal-card quiz-portal-card-desktop quiz-theme-${module.theme} ${module.comingSoon ? "is-coming-soon" : ""}" style="--quiz-card-index:${index}" type="button" ${
                  module.comingSoon ? `data-coming-soon="${escapeHtml(module.title)}"` : `data-quiz-portal-view="${module.view}"`
                }>
                  <span class="quiz-portal-card-top">
                    <span class="quiz-portal-card-icon"><i data-lucide="${module.icon}"></i></span>
                    <span class="quiz-portal-card-badge">${escapeHtml(module.comingSoon ? "Kommer snart" : module.badge)}</span>
                  </span>
                  <span class="quiz-portal-card-body">
                    <strong>${escapeHtml(module.title)}</strong>
                    <span class="quiz-portal-card-copy">${escapeHtml(module.description)}</span>
                    <span class="quiz-portal-card-foot">
                      <small data-quiz-portal-meta="${module.view}">${escapeHtml(quizPortalModuleMeta(module))}</small>
                      <span class="quiz-portal-card-action">${module.comingSoon ? "Inte tillgänglig" : 'Starta <i data-lucide="arrow-right"></i>'}</span>
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
          <strong>Träningsläge — resultat sparas inte</strong>
        </div>
      </section>

      <section class="quiz-portal-modules quiz-portal-modules-mobile" aria-labelledby="quizPortalModulesTitleMobile">
        <div class="quiz-portal-section-head quiz-portal-section-head-mobile">
          <h2 id="quizPortalModulesTitleMobile">Välj en modul</h2>
          <span>4 quiz · 1 kortlek</span>
        </div>
        <div class="quiz-portal-grid quiz-portal-grid-mobile">
          ${quizPortalModules
            .map(
              (module, index) => `
                <button class="quiz-portal-card quiz-portal-card-mobile quiz-theme-${module.theme} ${module.comingSoon ? "is-coming-soon" : ""}" style="--quiz-card-index:${index}" type="button" ${
                  module.comingSoon ? `data-coming-soon="${escapeHtml(module.title)}"` : `data-quiz-portal-view="${module.view}"`
                }>
                  <span class="quiz-portal-card-top">
                    <span class="quiz-portal-card-icon"><i data-lucide="${module.icon}"></i></span>
                    <span class="quiz-portal-card-badge">${escapeHtml(module.comingSoon ? "Kommer snart" : module.badge)}</span>
                  </span>
                  <span class="quiz-portal-card-body">
                    <strong>${escapeHtml(module.title)}</strong>
                    <span class="quiz-portal-card-copy">${escapeHtml(module.description)}</span>
                    <span class="quiz-portal-card-foot">
                      <small data-quiz-portal-meta="${module.view}">${escapeHtml(quizPortalModuleMeta(module))}</small>
                      <span class="quiz-portal-card-action">${module.comingSoon ? "Inte tillgänglig" : 'Starta <i data-lucide="arrow-right"></i>'}</span>
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

function renderQuizPortalResults(quiz) {
  const percentage = Math.round((state.quizPortal.score / quiz.questions.length) * 100);
  const passed = percentage >= 80;
  const feedbackTitle = passed ? "Starkt resultat" : "Repetera och försök igen";
  const feedbackText = passed
    ? "Du har bra koll på området, men gå gärna igenom frågorna nedan för att befästa detaljerna."
    : "Titta igenom genomgången nedan och repetera quizet när du är redo.";
  const ringColor = passed ? "#16a34a" : "#2563eb";
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
          <span class="quiz-portal-result-kicker">Resultat · ${escapeHtml(quiz.title)}</span>
          <h2 id="quizPortalResultTitle">${feedbackTitle}</h2>
          <p>Du fick ${state.quizPortal.score} av ${quiz.questions.length} rätt. ${feedbackText}</p>
          <div class="quiz-portal-result-actions">
            <button class="quiz-portal-button quiz-portal-button-primary" type="button" data-quiz-portal-reset>
              <i data-lucide="refresh-cw"></i>
              <span>Repetera quizet</span>
            </button>
            <button class="quiz-portal-button quiz-portal-button-secondary" type="button" data-quiz-portal-home>
              <span>Till portalen</span>
            </button>
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
  const quiz = getQuizPortalQuiz();
  if (!quiz) return renderQuizPortalHome();
  if (state.quizPortal.showResults) return renderQuizPortalResults(quiz);

  const question = quiz.questions[state.quizPortal.currentIndex];
  const progress = ((state.quizPortal.currentIndex + (state.quizPortal.isAnswered ? 1 : 0)) / quiz.questions.length) * 100;

  return `
    <section class="quiz-portal-engine" aria-labelledby="quizPortalEngineTitle">
      <button class="quiz-portal-back" type="button" data-quiz-portal-home>
        <i data-lucide="arrow-left"></i>
        <span>Till Quiz Portalen</span>
      </button>

      <div class="quiz-portal-engine-head">
        <div>
          <h2 id="quizPortalEngineTitle">${escapeHtml(quiz.title)}</h2>
          <p>Fråga ${state.quizPortal.currentIndex + 1} av ${quiz.questions.length}</p>
        </div>
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
              <div class="quiz-portal-explanation ${state.quizPortal.selectedOption === question.answer ? "is-correct" : ""}">
                <i data-lucide="triangle-alert"></i>
                <div>
                  <strong>${state.quizPortal.selectedOption === question.answer ? "Rätt svar!" : "Faktainfo"}</strong>
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
  const requiresData = ["vu1", "vu2", "scenario", "flashcards"].includes(state.quizPortal.view);
  if (requiresData && state.quizPortal.dataStatus !== "ready") {
    content = renderQuizPortalDataState();
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
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
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
  if (isSubmitted) {
    renderFinalExamSidebar();
  } else {
    hideModuleList();
  }
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

function openQuizResetModal() {
  els.quizResetModal.hidden = false;
  document.body.classList.add("modal-open");
  refreshIcons();
}

function closeQuizResetModal() {
  els.quizResetModal.hidden = true;
  document.body.classList.remove("modal-open");
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

  document.addEventListener("click", (event) => {
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
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const quizPortalViewButton = event.target.closest("[data-quiz-portal-view]");
    if (quizPortalViewButton) {
      const view = quizPortalViewButton.dataset.quizPortalView;
      if (Object.prototype.hasOwnProperty.call(QUIZ_PORTAL_BANK_CONFIG, view)) {
        startQuizPortalCountdown(view);
        return;
      }

      cancelQuizPortalCountdown();
      resetQuizPortalSession(view);
      renderQuizOverview();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const retryQuizPortalDataButton = event.target.closest("[data-retry-quiz-portal-data]");
    if (retryQuizPortalDataButton) {
      state.quizPortal.dataStatus = "idle";
      state.quizPortal.dataError = "";
      renderQuizOverview();
      refreshIcons();
      void loadQuizPortalData();
      return;
    }

    const quizPortalOptionButton = event.target.closest("[data-quiz-portal-option]");
    if (quizPortalOptionButton && state.mode === "quiz-overview" && !state.quizPortal.isAnswered) {
      const quiz = getQuizPortalQuiz();
      const question = quiz?.questions[state.quizPortal.currentIndex];
      if (!quiz || !question) return;

      state.quizPortal.selectedOption = Number(quizPortalOptionButton.dataset.quizPortalOption);
      state.quizPortal.answers[state.quizPortal.currentIndex] = state.quizPortal.selectedOption;
      state.quizPortal.isAnswered = true;
      if (state.quizPortal.selectedOption === question.answer) {
        state.quizPortal.score += 1;
      }
      renderQuizOverview();
      refreshIcons();
      return;
    }

    const quizPortalNextButton = event.target.closest("[data-quiz-portal-next]");
    if (quizPortalNextButton && state.mode === "quiz-overview") {
      const quiz = getQuizPortalQuiz();
      if (!quiz) return;

      if (state.quizPortal.currentIndex + 1 < quiz.questions.length) {
        state.quizPortal.currentIndex += 1;
        state.quizPortal.selectedOption = null;
        state.quizPortal.isAnswered = false;
      } else {
        state.quizPortal.showResults = true;
      }
      renderQuizOverview();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const quizPortalResetButton = event.target.closest("[data-quiz-portal-reset]");
    if (quizPortalResetButton && state.mode === "quiz-overview") {
      resetQuizPortalSession(state.quizPortal.view);
      renderQuizOverview();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const flashcardToggle = event.target.closest("[data-flashcard-toggle]");
    if (flashcardToggle && state.mode === "quiz-overview") {
      state.quizPortal.flashcardFlipped = !state.quizPortal.flashcardFlipped;
      renderQuizOverview();
      refreshIcons();
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
      renderQuiz();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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
  $("#openNavButton").addEventListener("click", () => openDrawer("nav"));
  $("#closeNavButton").addEventListener("click", closeDrawers);
  $("#openContextButton").addEventListener("click", () => openDrawer("context"));
  $("#closeContextButton").addEventListener("click", closeDrawers);
  els.navOverlay.addEventListener("click", closeDrawers);
  document.addEventListener("keydown", (event) => {
    const isTyping = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
    if (event.key === "Escape") {
      closeQuizResetModal();
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

  bindEvents();
  initializeSupabaseConnection();
  const response = await fetch("utbildning.md?v=20260704-vu2");
  const markdown = await response.text();
  state.courses = parseCourses(markdown);
  state.finalExamPools = Object.fromEntries(
    Object.entries(state.courses).map(([courseId, modules]) => [courseId, buildFinalExamPool(modules)])
  );
  activateCourse("vu1");
  await initializeProgressSync();
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

  revealPlatform();
}

init().catch((error) => {
  console.error(error);
  els.article.innerHTML = "<p>Ett fel uppstod när kursen laddades.</p>";
  revealPlatform();
});
