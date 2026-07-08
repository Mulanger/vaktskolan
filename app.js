const STORAGE_KEYS = {
  version: "vakt-storage-version",
  visited: "vakt-visited-pages",
  answers: "vakt-quiz-answers",
  scenarioProgress: "vakt-scenario-progress",
  finalExam: "vakt-final-exam",
  location: "vakt-current-location",
};

const STORAGE_VERSION = "vu2-course-split-2026-07-04";
const UNLOCK_MODULE_NAVIGATION = true;
const ENFORCE_COURSE_LOCKS = false;
const FINAL_EXAM_SIZE = 30;
const FINAL_EXAM_LOCK_MS = 24 * 60 * 60 * 1000;
const FINAL_EXAM_PASS_PERCENT = 80;
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

    localStorage.removeItem(STORAGE_KEYS.visited);
    localStorage.removeItem(STORAGE_KEYS.answers);
    localStorage.removeItem(STORAGE_KEYS.scenarioProgress);
    localStorage.removeItem(STORAGE_KEYS.finalExam);
    localStorage.removeItem(STORAGE_KEYS.location);
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
  return {
    id: typeof session.id === "string" ? session.id : `restored-final-${Date.now()}`,
    createdAt: Number(session.createdAt || Date.now()),
    completedAt: completedAt > 0 ? completedAt : null,
    currentIndex: toSafeIndex(session.currentIndex),
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
  scenarioProgress: readObjectStorage(STORAGE_KEYS.scenarioProgress),
  finalExams: readFinalExamStorage(),
  finalExam: null,
  finalExamPools: { vu1: [], vu2: [] },
  finalExamPool: [],
  visited: new Set(readArrayStorage(STORAGE_KEYS.visited).filter((id) => typeof id === "string")),
  user: {
    displayName: "Sven Svensson",
    firstName: "Sven",
  },
  quizPortal: {
    view: "home",
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

// Demo-only Quiz Portal content from D:\v_ktarquiz_portalen.tsx.
// These questions and flashcards are placeholders and must not be treated as the real course question bank.
const quizPortalDemoQuizzes = {
  vu1: {
    title: "Väktarutbildning 1 (VU1)",
    questions: [
      {
        question: "Vad är det huvudsakliga syftet med en bevakningsinstruktion?",
        options: [
          "Att ange väktarens lönegrad och arbetstider.",
          "Att detaljerat beskriva vad som ska bevakas och hur uppdraget ska utföras.",
          "Att ge väktaren polisiära befogenheter på ett specifikt objekt.",
        ],
        answer: 1,
        explanation: "Bevakningsinstruktionen är det dokument som styr väktarens arbete på det specifika objektet.",
      },
      {
        question: "Vilka förutsättningar krävs för att ett envarsgripande (RB 24:7) ska vara lagligt?",
        options: [
          "Brottet måste ha fängelse i straffskalan och personen ska tas på bar gärning eller flyende fot.",
          "Det räcker med stark misstanke om stöld, oavsett straffskala.",
          "Brottet måste ha anmälts till polis inom de senaste 24 timmarna.",
        ],
        answer: 0,
        explanation:
          "Envarsgripande kräver att brottet har fängelse i straffskalan samt att gripandet sker på bar gärning eller flyende fot.",
      },
      {
        question: "Vad innebär nödvärn i svensk lag?",
        options: [
          "Rätten att försvara sig själv eller annan mot ett påbörjat eller överhängande brottsligt angrepp.",
          "Rätten att gripa personer för alla typer av brott.",
          "Rätten att bryta mot trafikregler vid brådskande utryckning.",
        ],
        answer: 0,
        explanation:
          "Nödvärnsrätten (BrB 24:1) ger rätt att bruka visst våld för att avvärja ett angrepp på person eller egendom.",
      },
    ],
  },
  vu2: {
    title: "Väktarutbildning 2 (VU2)",
    questions: [
      {
        question: "Vilken myndighet utövar tillsyn och kontroll över auktoriserade bevakningsföretag?",
        options: ["Polismyndigheten", "Länsstyrelsen", "Säkerhetspolisen"],
        answer: 1,
        explanation:
          "Det är Länsstyrelsen som prövar frågor om auktorisation och utövar tillsyn över bevakningsföretagen.",
      },
      {
        question: "Vad innebär proportionalitetsprincipen vid en makttillämpning, till exempel våldsanvändning?",
        options: [
          "Att man alltid får använda så mycket våld man anser behövs för att vinna situationen.",
          "Att skadan eller faran man orsakar inte får stå i missförhållande till syftet med ingripandet.",
          "Att våldet alltid måste vara av samma grad som det våld man utsätts för.",
        ],
        answer: 1,
        explanation:
          "Proportionalitetsprincipen innebär att en åtgärd inte får vara mer ingripande än vad som är försvarligt med hänsyn till ändamålet.",
      },
      {
        question: "Får en väktare tillämpa Polislagens 13 § för att avvisa eller avlägsna en störande person?",
        options: ["Ja, om väktaren anser det nödvändigt.", "Nej, det är endast en befogenhet för polismän och ordningsvakter.", "Ja, men endast nattetid."],
        answer: 1,
        explanation:
          "Väktare har inte befogenhet enligt PL 13 §. Denna befogenhet är förbehållen polis och förordnade ordningsvakter.",
      },
    ],
  },
  general: {
    title: "Vanlig Quiz (Allmänt)",
    questions: [
      {
        question: "Vilken typ av släckare är oftast bäst lämpad för bränder i elektrisk utrustning?",
        options: ["Vattensläckare", "Koldioxidsläckare (CO2)", "Skumsläckare"],
        answer: 1,
        explanation: "Koldioxid leder inte ström och lämnar inga rester, vilket gör den idealisk för elbränder.",
      },
      {
        question: "Vilket av följande är inte en av de fyra grundstenarna i Rädda, Varna, Larma, Släck?",
        options: ["Rädda", "Förhöra", "Släck"],
        answer: 1,
        explanation: "Förhöra är inte en del av den allmänna handlingsplanen vid brand.",
      },
    ],
  },
  scenario: {
    title: "Scenario Quiz",
    questions: [
      {
        question:
          "Du ronderar i ett köpcentrum och observerar tydligt hur en person stoppar in obetalda varor, värde cirka 2000 kr, innanför jackan och passerar kassalinjen. Vad gör du?",
        options: [
          "Skriker åt personen att stanna och kastar mig över personen.",
          "Genomför ett envarsgripande då stöld har fängelse i straffskalan och personen tas på bar gärning.",
          "Låter personen gå men skriver en avvikelserapport när jag kommer tillbaka till kontoret.",
        ],
        answer: 1,
        explanation:
          "Stöld ger fängelse i straffskalan. Då brottet ses på bar gärning har du rätt att göra ett envarsgripande i väntan på polis.",
      },
      {
        question:
          "Du arbetar i en reception. En mycket berusad och aggressiv person kommer in och drar plötsligt fram ett knivliknande föremål. Vad bör vara din primära åtgärd?",
        options: [
          "Backa, sätt dig omedelbart i säkerhet och larma 112.",
          "Dra din batong, om du bär sådan, och beordra personen att släppa vapnet.",
          "Försöka tala personen tillrätta och erbjuda en kopp kaffe för att lugna ner situationen.",
        ],
        answer: 0,
        explanation:
          "Din egen säkerhet går först. Vid väpnat hot är det oftast säkrast att sätta sig i säkerhet och tillkalla polis.",
      },
    ],
  },
};

const quizPortalDemoFlashcards = [
  {
    term: "Envarsgripande (RB 24:7)",
    definition:
      "Rätt för var och en att gripa den som har begått ett brott på vilket fängelse kan följa, om personen tas på bar gärning eller flyende fot.",
  },
  {
    term: "Nödvärn (BrB 24:1)",
    definition: "Rätten att bruka våld för att avvärja ett påbörjat eller överhängande brottsligt angrepp på person eller egendom.",
  },
  {
    term: "Nöd (BrB 24:4)",
    definition: "Rätt att begå en annars straffbar handling för att avvärja omedelbar fara för liv, hälsa eller värdefull egendom.",
  },
  {
    term: "Proportionalitetsprincipen",
    definition:
      "En maktbefogenhet, till exempel våld, får inte användas om den skada som kan orsakas är oproportionerlig i förhållande till syftet.",
  },
  {
    term: "Bevakningsinstruktion",
    definition: "Dokumentet som i detalj beskriver hur bevakningen av ett specifikt objekt ska utföras och vilka regler som gäller.",
  },
  {
    term: "Ordningsvakt vs Väktare",
    definition:
      "Ordningsvakter har begränsade polisiära befogenheter. Väktare bevakar egendom och har medborgerliga rättigheter som nödvärn och envarsgripande.",
  },
];

const quizPortalModules = [
  {
    view: "vu1",
    title: "VU1 Quiz",
    description: "Repetera grunderna från Väktarutbildning 1. Frågor om instruktioner, etik och juridiska grunder.",
    icon: "shield",
  },
  {
    view: "vu2",
    title: "VU2 Quiz",
    description: "Fördjupande frågor från Väktarutbildning 2. Tillsyn, arbetsmiljö och mer avancerad juridik.",
    icon: "shield",
  },
  {
    view: "flashcards",
    title: "Flashcards",
    description: "Vänd på korten för att träna in och memorera viktiga lagrum, paragrafer och facktermer.",
    icon: "book-open",
  },
  {
    view: "general",
    title: "Vanlig Quiz",
    description: "En mix av allmänna säkerhetsfrågor relaterade till bevakningsyrket, brand och sjukvård.",
    icon: "brain-circuit",
  },
  {
    view: "scenario",
    title: "Scenario Quiz",
    description: "Sätts på prov i realistiska och svåra situationer du kan stöta på ute på fältet.",
    icon: "triangle-alert",
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
  finalExamHeadLabel: $(".final-exam-head span"),
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
  writeStorage(STORAGE_KEYS.visited, [...state.visited]);
}

function saveAnswers() {
  writeStorage(STORAGE_KEYS.answers, state.answers);
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
}

function saveLocation() {
  writeStorage(STORAGE_KEYS.location, {
    courseId: state.courseId,
    moduleIndex: state.moduleIndex,
    lessonIndex: state.lessonIndex,
    pageIndex: state.pageIndex,
    mode: state.mode,
  });
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

function isModuleComplete(moduleIndex) {
  const module = state.modules[moduleIndex];
  if (!module) return false;
  if (isFinalExamModule(module)) return Boolean(state.finalExam?.completedAt);

  const pages = allPages(module);
  return pages.length > 0 && pages.every((item) => isPageVisited(moduleIndex, item.lessonIndex, item.pageIndex));
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
    if (state.finalExam?.completedAt) return 100;
    const total = state.finalExam?.questionIds?.length || FINAL_EXAM_SIZE;
    return Math.round((getFinalExamAnsweredCount() / total) * 100);
  }

  const pages = allPages(module);
  if (!pages.length) return 0;
  const visited = pages.filter((item) => state.visited.has(pageId(moduleIndex, item.lessonIndex, item.pageIndex))).length;
  return Math.round((visited / pages.length) * 100);
}

function getCourseProgress() {
  const pages = state.modules
    .map((module, moduleIndex) => ({ module, moduleIndex }))
    .filter((item) => !isFinalExamModule(item.module))
    .flatMap((item) => allPages(item.module).map((pageItem) => ({ ...pageItem, moduleIndex: item.moduleIndex })));
  if (!pages.length) return { total: 0, visited: 0, percent: 0 };

  const visited = pages.filter((item) => isPageVisited(item.moduleIndex, item.lessonIndex, item.pageIndex)).length;
  return { total: pages.length, visited, percent: Math.round((visited / pages.length) * 100) };
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
    const answers = isPlainObject(state.answers[answerKey(moduleIndex)]) ? state.answers[answerKey(moduleIndex)] : {};
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
    const started = progress.visited > 0 || Object.keys(state.answers).some((key) => key.startsWith(`${courseId}:`));
    const complete = progress.total > 0 && progress.visited === progress.total;

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
    courses.find((item) => !item.locked && item.progress.visited > 0 && item.progress.percent < 100) ||
    courses.find((item) => !item.locked) ||
    courses[0];

  return {
    courses,
    hasAnyProgress: visitedPages > 0 || quizAnswered > 0 || courses.some((item) => item.started),
    totals: {
      pages: totalPages,
      visitedPages,
      percent: totalPages ? Math.round((visitedPages / totalPages) * 100) : 0,
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
      <aside class="home-shell-sidebar" aria-label="Hemnavigation">
        <div class="home-shell-sidebar-main">
          <div class="home-shell-brand">
            <span class="home-shell-mark">VS</span>
            <strong>Vaktskolan <span>· Lärplattform</span></strong>
          </div>
          <nav class="home-shell-tabs" aria-label="Huvudmeny">
            <button class="home-shell-tab is-active" type="button" data-open-home>
              <i data-lucide="home"></i>
              <span>Hem</span>
            </button>
            <button class="home-shell-tab" type="button" data-open-course>
              <i data-lucide="book-open"></i>
              <span>VU1</span>
            </button>
            <button class="home-shell-tab ${vu2Overview?.locked ? "is-disabled" : ""}" type="button" ${vu2NavAttributes}>
              <i data-lucide="shield-check"></i>
              <span>VU2</span>
            </button>
            <button class="home-shell-tab" type="button" data-show-quiz>
              <i data-lucide="target"></i>
              <span>Quiz Portal</span>
            </button>
            <button class="home-shell-tab" type="button" data-open-final-exam-portal>
              <i data-lucide="clipboard-check"></i>
              <span>Slutprov</span>
            </button>
          </nav>
        </div>
        <div class="home-shell-user">
          <span>${escapeHtml(initials)}</span>
          <div>
            <strong>${escapeHtml(displayName)}</strong>
            <small>Elev</small>
          </div>
        </div>
      </aside>

      <div class="home-dashboard-body">
        <div class="home-mobile-head">
          <div class="home-shell-brand">
            <span class="home-shell-mark">VS</span>
            <strong>Vaktskolan</strong>
          </div>
          <span class="home-mobile-avatar">${escapeHtml(initials)}</span>
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

    if (!isCorrect) {
      wrongQuestions.push({
        index: index + 1,
        source: key,
        question: question.question,
        selected: selected || "Ej svarat",
        correct: question.correct,
      });
    }
  });

  const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return {
    answered,
    correct,
    total: questions.length,
    percent,
    passed: percent >= FINAL_EXAM_PASS_PERCENT,
    wrongQuestions,
    breakdown: [...breakdownMap.values()],
  };
}

function getFinalExamLockInfo() {
  const completedAt = Number(state.finalExam?.completedAt || 0);
  if (!completedAt) return { locked: false, remaining: 0 };

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

function renderFinalExamPortalCard(overview) {
  return `
    <article class="final-portal-card final-portal-card-${overview.tone}">
      <div class="final-portal-card-head">
        <span class="final-portal-icon"><i data-lucide="${overview.icon}"></i></span>
        <span class="final-portal-status final-portal-status-${overview.tone}">${escapeHtml(overview.status)}</span>
      </div>
      <div class="final-portal-card-copy">
        <span>${escapeHtml(overview.course.shortLabel)}</span>
        <h2>${escapeHtml(overview.course.finalExamLabel)}</h2>
        <p>${escapeHtml(overview.detail)}</p>
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
      <button class="final-portal-action" type="button"
        data-final-portal-course="${overview.courseId}"
        data-final-portal-action="${overview.action}"
        ${overview.disabled ? 'disabled aria-disabled="true"' : ""}>
        <span>${escapeHtml(overview.actionLabel)}</span>
        <i data-lucide="${overview.disabled ? "lock" : "arrow-right"}"></i>
      </button>
    </article>
  `;
}

function renderFinalExamPortal() {
  const overviews = Object.keys(COURSE_CONFIG).map((courseId) => getFinalExamPortalOverview(courseId));

  return `
    <section class="final-portal" aria-labelledby="finalPortalTitle">
      <div class="final-portal-head">
        <div>
          <span>Slutprov</span>
          <h1 id="finalPortalTitle">Välj slutprov</h1>
          <p>Starta, fortsätt eller visa resultat för VU1 och VU2. Varje prov består av ${FINAL_EXAM_SIZE} slumpade frågor och nytt prov spärras i 24 timmar efter inlämning.</p>
        </div>
      </div>
      <div class="final-portal-grid">
        ${overviews.map((overview) => renderFinalExamPortalCard(overview)).join("")}
      </div>
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
}

function renderModuleContext() {
  const module = getCurrentModule();
  if (!module) return;
  const course = getCourseConfig();

  els.moduleHeroMeta.textContent = `${course.educationLabel} · Modul ${moduleNumber(module)}`;
  els.moduleHeroTitle.textContent = moduleDisplayTitle(module);
  els.moduleHeroText.textContent = sentenceCase(module.objective || "Följ kursen sida för sida och repetera nyckelrutor inför quiz.");
  els.moduleInfoPanel.hidden = true;
  els.moduleInfoButton.setAttribute("aria-expanded", "false");
}

function setBodyLayoutMode(mode = "") {
  const isModernCourseHub = mode === "course-hub-modern";
  document.body.classList.toggle("home-mode", mode === "home");
  document.body.classList.toggle("quiz-overview-mode", mode === "quiz-overview");
  document.body.classList.toggle("module-milestone-mode", mode === "module-milestone");
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
  setBodyLayoutMode("home");
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
  els.courseHubRing.style.setProperty("--ring-progress", `${courseProgress.percent * 3.6}deg`);
  if (els.vu1HubMobileAvatar) {
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

  state.visited.add(pageId(state.moduleIndex, state.lessonIndex, state.pageIndex));
  saveVisited();

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
  setBodyLayoutMode();
  els.lessonTitle.textContent = lesson.title.replace(/^\d+\.\d+\s+/, "");
  els.timeEstimate.textContent = moduleMetaSummary(module);
  els.pageCount.textContent = `Sida ${state.pageIndex + 1} av ${lesson.pages.length}`;
  setQuizButtonLabel(isFinalExamModule(module) ? "Starta slutprov" : "Starta quiz");
  renderModuleContext();

  els.pageTabs.style.setProperty("--step-count", lesson.pages.length);
  els.pageTabs.innerHTML = `
    <div class="stepper-rail" aria-hidden="true">
      <span class="stepper-track"></span>
      <span class="stepper-fill"></span>
    </div>
    ${lesson.pages
    .map((item, index) => {
      const unlocked = isPageUnlocked(state.moduleIndex, state.lessonIndex, index);
      return `
      <div class="page-tab ${index === state.pageIndex ? "is-active" : ""} ${index < state.pageIndex ? "is-complete" : ""} ${unlocked ? "" : "is-locked"}"
        aria-current="${index === state.pageIndex ? "step" : "false"}" aria-label="${escapeHtml(item.title.replace(/^Sida\s+\d+:\s*/, ""))}">
        <span class="step-label">${escapeHtml(item.title.replace(/^Sida\s+\d+:\s*/, ""))}</span>
        <span class="step-dot-large" aria-hidden="true"></span>
      </div>
    `;
    })
    .join("")}
  `;
  updatePageStepperLine();

  els.article.innerHTML = `<h1>${escapeHtml(page.title.replace(/^Sida\s+\d+:\s*/, ""))}</h1>${renderBlocks(page.body)}${
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

function getQuizPortalQuiz(view = state.quizPortal.view) {
  return quizPortalDemoQuizzes[view] || null;
}

function quizPortalModuleMeta(module) {
  if (module.view === "flashcards") {
    return `${quizPortalDemoFlashcards.length} kort · vänd & lär`;
  }

  const questionCount = getQuizPortalQuiz(module.view)?.questions.length || 0;
  return `${questionCount} frågor · flerval`;
}

function quizOptionLetter(index) {
  return String.fromCharCode(65 + index);
}

function renderQuizPortalMobileHead() {
  const initials = userInitials(state.user.displayName || state.user.firstName || "Sven", "");
  return `
    <div class="quiz-portal-mobile-head">
      <div class="quiz-portal-mobile-brand">
        <span>VS</span>
        <strong>Vaktskolan</strong>
      </div>
      <span class="quiz-portal-mobile-avatar">${escapeHtml(initials)}</span>
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
  els.moduleCount.textContent = "4 quiz + kort";
  els.moduleList.innerHTML = quizPortalModules
    .map((module) => {
      const isActive = state.quizPortal.view === module.view;
      return `
        <button class="quiz-sidebar-card ${isActive ? "is-active" : ""}" type="button" data-quiz-portal-view="${module.view}">
          <span class="quiz-sidebar-icon"><i data-lucide="${module.icon}"></i></span>
          <span class="quiz-sidebar-copy">
            <strong>${escapeHtml(module.title)}</strong>
            <small>${escapeHtml(quizPortalModuleMeta(module))}</small>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderQuizPortalHome() {
  return `
    <div class="quiz-portal-page-head">
      <span>Väktarutbildning</span>
      <h1>Quiz Portal</h1>
      <p>Träningsläge · resultat sparas inte · repetera så ofta du vill</p>
    </div>

    <section class="quiz-portal-hero" aria-labelledby="quizOverviewTitle">
      <div class="quiz-portal-hero-copy">
        <h2 id="quizOverviewTitle">Välkommen till <span>QuizPortalen</span></h2>
        <p>
          <span class="quiz-portal-copy-desktop">Denna plattform är skapad för dig som redan genomgått din väktarutbildning och vill hålla kunskaperna skarpa. Här kan du testa dig själv, repetera viktiga juridiska begrepp och öva på komplexa scenarier från verkligheten.</span>
          <span class="quiz-portal-copy-mobile">Testa dig själv, repetera viktiga juridiska begrepp och öva på scenarier från verkligheten.</span>
        </p>
        <div class="quiz-portal-alert" role="note">
          <i data-lucide="triangle-alert"></i>
          <span class="quiz-portal-copy-desktop">Välj en av modulerna nedan för att börja träna. Dina framsteg sparas ej ännu, så fokusera på att lära dig!</span>
          <span class="quiz-portal-copy-mobile">Välj en modul nedan för att börja träna. Dina framsteg sparas ej ännu!</span>
        </div>
      </div>
    </section>

    <section class="quiz-portal-modules" aria-labelledby="quizPortalModulesTitle">
      <h2 id="quizPortalModulesTitle"><i data-lucide="layers"></i><span>Välj en modul</span></h2>
      <div class="quiz-portal-grid">
        ${quizPortalModules
          .map(
            (module) => `
              <button class="quiz-portal-card" type="button" data-quiz-portal-view="${module.view}">
                <span class="quiz-portal-card-icon"><i data-lucide="${module.icon}"></i></span>
                <span class="quiz-portal-card-demo">Demo</span>
                <strong>${escapeHtml(module.title)}</strong>
                <span class="quiz-portal-card-copy">${escapeHtml(module.description)}</span>
                <span class="quiz-portal-card-foot">
                  <small>${escapeHtml(quizPortalModuleMeta(module))}</small>
                  <span class="quiz-portal-card-action">Starta <i data-lucide="arrow-right"></i></span>
                </span>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
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
            <button class="quiz-portal-button quiz-portal-button-primary" type="button" data-demo-quiz-reset>
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
                  type="button" data-demo-quiz-option="${index}" ${state.quizPortal.isAnswered ? "disabled" : ""}>
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
                <button class="quiz-portal-button quiz-portal-button-primary" type="button" data-demo-quiz-next>
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
  const card = quizPortalDemoFlashcards[state.quizPortal.flashcardIndex];
  return `
    <section class="quiz-portal-flashcards" aria-labelledby="quizPortalFlashcardsTitle">
      <button class="quiz-portal-back" type="button" data-quiz-portal-home>
        <i data-lucide="arrow-left"></i>
        <span>Till Quiz Portalen</span>
      </button>

      <div class="quiz-portal-engine-head">
        <div>
          <h2 id="quizPortalFlashcardsTitle">Flashcards</h2>
          <p>Kort ${state.quizPortal.flashcardIndex + 1} av ${quizPortalDemoFlashcards.length}</p>
        </div>
      </div>

      <button class="quiz-portal-flashcard ${state.quizPortal.flashcardFlipped ? "is-flipped" : ""}" type="button" data-demo-flashcard-toggle aria-label="Vänd flashcard">
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
        <button type="button" data-demo-flashcard-prev>
          <i data-lucide="arrow-left"></i>
          <span>Föregående</span>
        </button>
        <button type="button" class="is-primary" data-demo-flashcard-toggle>
          <span>Vänd kortet</span>
        </button>
        <button type="button" data-demo-flashcard-next>
          <span>Nästa kort</span>
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </section>
  `;
}

function renderQuizOverview() {
  if (!els.quizPortal) return;

  renderQuizPortalSidebar();

  let content = "";
  if (state.quizPortal.view === "flashcards") {
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
  const repeatItems = result.wrongQuestions.slice(0, 6);
  const repeatList = repeatItems.length
    ? repeatItems
        .map((item) => `
          <li>
            <strong>Fråga ${item.index} · ${escapeHtml(item.source)}</strong>
            <span>${escapeHtml(item.question)}</span>
            <small>Ditt svar: ${escapeHtml(item.selected)} · Rätt svar: ${escapeHtml(item.correct)}</small>
          </li>
        `)
        .join("")
    : `<li><strong>Inga fel att repetera</strong><span>Alla svar var rätt i detta prov.</span></li>`;

  return `
    <section class="final-result-summary ${result.passed ? "is-passed" : "is-failed"}">
      <div class="final-result-hero">
        <span>${result.passed ? "Godkänd" : "Behöver repeteras"}</span>
        <h4>${result.percent}%</h4>
        <p>${result.correct} av ${result.total} rätt. Godkändgränsen är ${FINAL_EXAM_PASS_PERCENT}%.</p>
      </div>

      <div class="final-result-stats">
        <div>
          <span>Rätt</span>
          <strong>${result.correct}</strong>
        </div>
        <div>
          <span>Fel</span>
          <strong>${result.total - result.correct}</strong>
        </div>
        <div>
          <span>Besvarade</span>
          <strong>${result.answered}/${result.total}</strong>
        </div>
        <div>
          <span>Nästa försök</span>
          <strong>${lock.locked ? formatRemainingTime(lock.remaining) : "Tillgängligt"}</strong>
        </div>
      </div>

      <div class="final-result-breakdown">
        <h5>Resultat per område</h5>
        <div>
          ${result.breakdown
            .map((item) => {
              const percent = item.total ? Math.round((item.correct / item.total) * 100) : 0;
              return `
                <div class="breakdown-row">
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${item.correct}/${item.total}</strong>
                  <i style="width: ${percent}%"></i>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="final-result-repeat">
        <h5>Att repetera</h5>
        <ul>${repeatList}</ul>
      </div>

      <div class="final-result-actions">
        <button class="dark-action" type="button" data-final-result-done aria-label="Klar, gå tillbaka till ${getCourseConfig().shortLabel}">
          <span>Klar</span>
          <i data-lucide="check"></i>
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
  els.metaPills.hidden = false;
  els.quizButton.hidden = true;
  setBodyLayoutMode("quiz-overview");
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

  els.finalExamTitle.textContent = submitted
    ? "Sammanfattning"
    : `Fråga ${questionIndex + 1} av ${questions.length}`;
  els.finalExamSubtitle.textContent = submitted
    ? `${result.passed ? "Godkänt resultat" : "Resultatet nådde inte godkändgränsen"} · ${result.correct}/${result.total} rätt`
    : question.source;
  els.finalExamAnswered.textContent = submitted ? `${result.percent}%` : `${answeredCount}/${questions.length} svarade`;
  els.pageCount.textContent = submitted ? `${result.correct}/${result.total} rätt` : `${answeredCount}/${questions.length} svarade`;
  els.finalExamProgress.style.width = `${submitted ? 100 : Math.round((answeredCount / questions.length) * 100)}%`;
  els.finalExamSteps.hidden = submitted;

  if (submitted) {
    els.finalExamQuestion.innerHTML = renderFinalExamSummary(result);
    els.finalExamFooter.hidden = true;
    els.finalExamPrevButton.hidden = true;
    els.finalExamNextButton.hidden = true;
    els.finalExamSubmitButton.hidden = true;
    saveFinalExam();
    return;
  }

  els.finalExamSteps.innerHTML = questions
    .map((item, index) => {
      const isAnswered = Boolean(answers[item.id]);
      const isCurrent = index === questionIndex;
      return `
        <button class="final-step ${isCurrent ? "is-current" : ""} ${isAnswered ? "is-answered" : ""}"
          type="button" data-final-question-index="${index}" aria-label="Fråga ${index + 1}${isAnswered ? ", besvarad" : ""}">
          ${index + 1}
        </button>
      `;
    })
    .join("");

  els.finalExamFooter.hidden = false;
  els.finalExamQuestion.innerHTML = `
    <h4>${inlineMarkdown(question.question)}</h4>
    <div class="answer-list">
      ${question.options
        .map((option) => {
          const isCorrect = submitted && option.letter === question.correct;
          const isWrong = submitted && selected === option.letter && option.letter !== question.correct;
          const classes = [
            "answer-option",
            selected === option.letter ? "is-selected" : "",
            isCorrect ? "is-correct" : "",
            isWrong ? "is-wrong" : "",
          ].join(" ");
          return `
            <button class="${classes}" type="button" data-final-answer="${option.letter}" ${submitted ? "disabled" : ""}>
              <span class="answer-letter">${option.letter}</span>
              <span>${inlineMarkdown(option.text)}</span>
            </button>
          `;
        })
        .join("")}
    </div>
    ${
      submitted
        ? `<p class="answer-explanation"><strong>Rätt svar: ${question.correct}.</strong> ${inlineMarkdown(question.explanation)}</p>`
        : ""
    }
  `;

  els.finalExamPrevButton.disabled = questionIndex === 0;
  els.finalExamPrevButton.hidden = false;
  els.finalExamNextButton.hidden = isLastQuestion;
  els.finalExamNextButton.disabled = isLastQuestion;
  els.finalExamNextButton.querySelector("span").textContent = "Nästa";
  els.finalExamSubmitButton.hidden = !isLastQuestion;
  els.finalExamSubmitButton.disabled = false;
  saveFinalExam();
}

function goFinalExamRelative(direction) {
  if (!state.finalExam) return;
  const questions = getFinalExamQuestions();
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
  state.finalExam.currentIndex = Math.max(0, Math.min(index, questions.length - 1));
  saveFinalExam();
  renderFinalExam();
  refreshIcons();
  els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
}

function submitFinalExam() {
  if (!state.finalExam || state.finalExam.completedAt) return;

  const questions = getFinalExamQuestions();
  const answeredCount = getFinalExamAnsweredCount();
  if (answeredCount < questions.length) {
    const firstMissingIndex = questions.findIndex((question) => !state.finalExam.answers?.[question.id]);
    state.finalExam.currentIndex = Math.max(0, firstMissingIndex);
    saveFinalExam();
    renderFinalExam();
    refreshIcons();
    showToast(`${questions.length - answeredCount} frågor saknar svar. Jag visar första obesvarade frågan.`);
    return;
  }

  state.finalExam.completedAt = Date.now();
  saveFinalExam();
  renderFinalExam();
  renderQuizOverview();
  refreshIcons();
  showToast("Slutprovet är inlämnat. Ett nytt prov kan startas om 24 timmar.");
}

function renderQuiz() {
  const module = getCurrentModule();
  const answers = isPlainObject(state.answers[answerKey()]) ? state.answers[answerKey()] : {};
  const answeredCount = Object.keys(answers).length;
  const correctCount = module.quiz.filter((question) => answers[question.number] === question.correct).length;
  const nextModule = state.modules[state.moduleIndex + 1];
  const nextIsFinalExam = isFinalExamModule(nextModule);
  const nextModuleLabel = nextIsFinalExam ? "Till slutprov" : "Nästa modul";
  const nextActionText = nextModule ? (nextIsFinalExam ? "gå vidare till slutprovet" : "fortsätta till nästa modul") : "gå tillbaka till lektionen";

  els.quizTitle.textContent = `Testa Modul ${moduleNumber(module)}: ${module.title}`;
  els.quizScore.textContent = `${correctCount}/${module.quiz.length}`;
  els.resetQuizButton.disabled = answeredCount === 0;
  els.quizQuestions.innerHTML = module.quiz.length
    ? module.quiz
        .map((question) => {
          const selected = answers[question.number];
          const explanation = selected
            ? `<p class="answer-explanation">${inlineMarkdown(question.explanation)}</p>`
            : "";
          return `
            <section class="question-card">
              <h4>Fråga ${question.number}. ${inlineMarkdown(question.question)}</h4>
              <div class="answer-list">
                ${question.options
                  .map((option) => {
                    const isCorrect = selected && option.letter === question.correct;
                    const isWrong = selected === option.letter && option.letter !== question.correct;
                    const classes = [
                      "answer-option",
                      selected === option.letter ? "is-selected" : "",
                      isCorrect ? "is-correct" : "",
                      isWrong ? "is-wrong" : "",
                    ].join(" ");
                    return `
                      <button class="${classes}" type="button" data-question="${question.number}" data-answer="${option.letter}">
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

  els.quizFooter.innerHTML =
    answeredCount === module.quiz.length && module.quiz.length
      ? `
        <div class="quiz-complete">
          <div>
            <h4>Quiz klart</h4>
            <p>Du fick ${correctCount} av ${module.quiz.length} rätt. Du kan nollställa svaren eller ${nextActionText}.</p>
          </div>
          ${
            state.moduleIndex < state.modules.length - 1 && isModuleComplete(state.moduleIndex)
              ? `<button class="dark-action" type="button" data-next-module><span>${nextModuleLabel}</span><i data-lucide="arrow-right"></i></button>`
              : `<button class="dark-action" type="button" data-return-lesson><span>Till lektion</span><i data-lucide="book-open"></i></button>`
          }
        </div>
      `
      : "";
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
  state.scenarioProgress = {};
  state.finalExams = {};
  state.finalExam = null;
  saveAnswers();
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

function updatePageStepperLine() {
  const lesson = getCurrentLesson();
  if (!lesson || lesson.pages.length <= 1) {
    els.pageTabs.style.setProperty("--track-left", "0px");
    els.pageTabs.style.setProperty("--track-width", "0px");
    els.pageTabs.style.setProperty("--track-fill", "0px");
    return;
  }

  window.requestAnimationFrame(() => {
    const dots = [...els.pageTabs.querySelectorAll(".step-dot-large")];
    const activeDot = dots[state.pageIndex];
    const firstDot = dots[0];
    if (!activeDot || !firstDot) return;

    const firstRect = firstDot.getBoundingClientRect();
    const lastRect = dots[dots.length - 1].getBoundingClientRect();
    const activeRect = activeDot.getBoundingClientRect();
    const containerRect = els.pageTabs.getBoundingClientRect();
    const firstCenter = firstRect.left + firstRect.width / 2;
    const lastCenter = lastRect.left + lastRect.width / 2;
    const activeCenter = activeRect.left + activeRect.width / 2;
    const dotCenterY = firstRect.top + firstRect.height / 2;

    els.pageTabs.style.setProperty("--track-left", `${firstCenter - containerRect.left}px`);
    els.pageTabs.style.setProperty("--track-top", `${dotCenterY - containerRect.top}px`);
    els.pageTabs.style.setProperty("--track-width", `${Math.max(0, lastCenter - firstCenter)}px`);
    els.pageTabs.style.setProperty("--track-fill", `${Math.max(0, activeCenter - firstCenter)}px`);
  });
}

window.addEventListener("resize", updatePageStepperLine);

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
      resetQuizPortalSession("home");
      showQuizOverview();
      return;
    }

    const quizPortalHomeButton = event.target.closest("[data-quiz-portal-home]");
    if (quizPortalHomeButton) {
      resetQuizPortalSession("home");
      renderQuizOverview();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const quizPortalViewButton = event.target.closest("[data-quiz-portal-view]");
    if (quizPortalViewButton) {
      resetQuizPortalSession(quizPortalViewButton.dataset.quizPortalView);
      renderQuizOverview();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const demoQuizOptionButton = event.target.closest("[data-demo-quiz-option]");
    if (demoQuizOptionButton && state.mode === "quiz-overview" && !state.quizPortal.isAnswered) {
      const quiz = getQuizPortalQuiz();
      const question = quiz?.questions[state.quizPortal.currentIndex];
      if (!quiz || !question) return;

      state.quizPortal.selectedOption = Number(demoQuizOptionButton.dataset.demoQuizOption);
      state.quizPortal.answers[state.quizPortal.currentIndex] = state.quizPortal.selectedOption;
      state.quizPortal.isAnswered = true;
      if (state.quizPortal.selectedOption === question.answer) {
        state.quizPortal.score += 1;
      }
      renderQuizOverview();
      refreshIcons();
      return;
    }

    const demoQuizSubmitButton = event.target.closest("[data-demo-quiz-submit]");
    if (demoQuizSubmitButton && state.mode === "quiz-overview") {
      const quiz = getQuizPortalQuiz();
      const question = quiz?.questions[state.quizPortal.currentIndex];
      if (!quiz || !question || state.quizPortal.isAnswered || state.quizPortal.selectedOption === null) return;

      state.quizPortal.isAnswered = true;
      if (state.quizPortal.selectedOption === question.answer) {
        state.quizPortal.score += 1;
      }
      renderQuizOverview();
      refreshIcons();
      return;
    }

    const demoQuizNextButton = event.target.closest("[data-demo-quiz-next]");
    if (demoQuizNextButton && state.mode === "quiz-overview") {
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

    const demoQuizResetButton = event.target.closest("[data-demo-quiz-reset]");
    if (demoQuizResetButton && state.mode === "quiz-overview") {
      resetQuizPortalSession(state.quizPortal.view);
      renderQuizOverview();
      refreshIcons();
      els.contentScroll.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const demoFlashcardToggle = event.target.closest("[data-demo-flashcard-toggle]");
    if (demoFlashcardToggle && state.mode === "quiz-overview") {
      state.quizPortal.flashcardFlipped = !state.quizPortal.flashcardFlipped;
      renderQuizOverview();
      refreshIcons();
      return;
    }

    const demoFlashcardPrev = event.target.closest("[data-demo-flashcard-prev]");
    if (demoFlashcardPrev && state.mode === "quiz-overview") {
      state.quizPortal.flashcardFlipped = false;
      state.quizPortal.flashcardIndex =
        (state.quizPortal.flashcardIndex - 1 + quizPortalDemoFlashcards.length) % quizPortalDemoFlashcards.length;
      renderQuizOverview();
      refreshIcons();
      return;
    }

    const demoFlashcardNext = event.target.closest("[data-demo-flashcard-next]");
    if (demoFlashcardNext && state.mode === "quiz-overview") {
      state.quizPortal.flashcardFlipped = false;
      state.quizPortal.flashcardIndex = (state.quizPortal.flashcardIndex + 1) % quizPortalDemoFlashcards.length;
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
      const moduleAnswers = isPlainObject(state.answers[key]) ? state.answers[key] : {};
      moduleAnswers[answerButton.dataset.question] = answerButton.dataset.answer;
      state.answers[key] = moduleAnswers;
      saveAnswers();
      renderQuiz();
      refreshIcons();
      return;
    }
  });

  els.prevButton.addEventListener("click", () => goRelative(-1));
  els.nextButton.addEventListener("click", () => goRelative(1));
  els.quizButton.addEventListener("click", showQuiz);
  els.backToLessonButton.addEventListener("click", returnToLesson);
  els.finalExamPrevButton.addEventListener("click", () => goFinalExamRelative(-1));
  els.finalExamNextButton.addEventListener("click", () => goFinalExamRelative(1));
  els.finalExamSubmitButton.addEventListener("click", submitFinalExam);
  els.resetQuizButton.addEventListener("click", () => {
    delete state.answers[answerKey()];
    saveAnswers();
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
      goFinalExamRelative(1);
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
