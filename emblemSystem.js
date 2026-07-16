(function initEmblemSystem(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.vaktskolanEmblems = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createEmblemSystem() {
  const EMBLEM_DEFINITIONS = [
    {
      id: "vu1-complete",
      label: "VU1",
      title: "Grundstenen",
      description: "Du har slutfört hela VU1 och byggt grunden för nästa del av utbildningen.",
      criterion: "Slutför alla VU1-moduler. Varje modul kräver alla sidor och ett godkänt modulquiz på minst 80 %.",
      icon: "book-open",
      theme: "blue",
      source: "course",
      courseId: "vu1",
    },
    {
      id: "vu2-complete",
      label: "VU2",
      title: "Fördjupningen",
      description: "Du har slutfört hela VU2 och tagit dig igenom utbildningens fördjupande del.",
      criterion: "Slutför alla VU2-moduler. Varje modul kräver alla sidor och ett godkänt modulquiz på minst 80 %.",
      icon: "shield-check",
      theme: "teal",
      source: "course",
      courseId: "vu2",
    },
    {
      id: "vu1-exam",
      label: "Prov 1",
      title: "Godkänd VU1",
      description: "Du har visat att kunskaperna från VU1 sitter genom att klara slutprovet.",
      criterion: "Skicka in och klara slutprovet för VU1 med minst 80 % rätt.",
      icon: "badge-check",
      theme: "violet",
      source: "exam",
      courseId: "vu1",
    },
    {
      id: "vu2-exam",
      label: "Prov 2",
      title: "Godkänd VU2",
      description: "Du har klarat utbildningens andra slutprov och bekräftat dina fördjupade kunskaper.",
      criterion: "Skicka in och klara slutprovet för VU2 med minst 80 % rätt.",
      icon: "star",
      theme: "amber",
      source: "exam",
      courseId: "vu2",
    },
    {
      id: "first-quiz-pass",
      label: "Quiz",
      title: "Första fullträffen",
      description: "Du har klarat ditt första modulquiz och tagit ett tydligt steg framåt.",
      criterion: "Skicka in och klara valfritt modulquiz i VU1 eller VU2 med minst 80 % rätt.",
      icon: "target",
      theme: "rose",
      source: "quiz",
    },
  ];

  function safeCount(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
  }

  function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  }

  function normalizeCourse(course) {
    const totalModules = safeCount(course?.totalModules);
    const completedModules = Math.min(safeCount(course?.completedModules), totalModules);
    return {
      completedModules,
      totalModules,
      finalExamPassed: course?.finalExamPassed === true,
      passedModuleQuizzes: safeCount(course?.passedModuleQuizzes),
    };
  }

  function courseMap(courses) {
    if (Array.isArray(courses)) {
      return Object.fromEntries(courses.map((course) => [course.courseId, normalizeCourse(course)]));
    }
    return Object.fromEntries(
      Object.entries(courses || {}).map(([courseId, course]) => [courseId, normalizeCourse(course)])
    );
  }

  function buildCourseEmblem(definition, course) {
    const target = course.totalModules;
    const current = course.completedModules;
    const unlocked = target > 0 && current === target;
    return {
      ...definition,
      unlocked,
      current,
      target,
      percent: target ? clampPercent((current / target) * 100) : 0,
      progressLabel: target ? `${current} av ${target} moduler klara` : "Kursen är inte tillgänglig ännu",
    };
  }

  function buildExamEmblem(definition, course) {
    const unlocked = course.finalExamPassed;
    return {
      ...definition,
      unlocked,
      current: unlocked ? 1 : 0,
      target: 1,
      percent: unlocked ? 100 : 0,
      progressLabel: unlocked ? "Slutprovet är godkänt" : "Slutprovet är inte godkänt ännu",
    };
  }

  function buildQuizEmblem(definition, courses) {
    const passedModuleQuizzes = Object.values(courses).reduce(
      (total, course) => total + course.passedModuleQuizzes,
      0
    );
    const unlocked = passedModuleQuizzes > 0;
    return {
      ...definition,
      unlocked,
      current: unlocked ? 1 : 0,
      target: 1,
      percent: unlocked ? 100 : 0,
      progressLabel: unlocked ? "Minst ett modulquiz är godkänt" : "Inget modulquiz är godkänt ännu",
    };
  }

  function buildOverview(input = {}) {
    const courses = courseMap(input.courses);
    const emblems = EMBLEM_DEFINITIONS.map((definition) => {
      if (definition.source === "course") {
        return buildCourseEmblem(definition, courses[definition.courseId] || normalizeCourse());
      }
      if (definition.source === "exam") {
        return buildExamEmblem(definition, courses[definition.courseId] || normalizeCourse());
      }
      return buildQuizEmblem(definition, courses);
    });

    return {
      emblems,
      unlockedCount: emblems.filter((emblem) => emblem.unlocked).length,
      totalCount: emblems.length,
    };
  }

  return { buildOverview };
});
