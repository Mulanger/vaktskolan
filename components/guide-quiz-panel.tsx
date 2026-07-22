"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type GuideQuizQuestion = {
  question: string;
  options: readonly string[];
  answer: number;
  explanation: string;
};

type SavedGuideQuiz = {
  currentQuestion: number;
  score: number;
  selected: number | null;
  completed: boolean;
  answered: number;
  answers: Array<number | null>;
  updatedAt: string;
};

type SavedQuizState = {
  version: 1;
  guides: Record<string, SavedGuideQuiz>;
  lastGuide?: string;
  lastLabel?: string;
  lastScore?: number;
};

type GuideQuizPanelProps = {
  guideSlug: string;
  guideLabel: string;
};

const STORAGE_KEY = "vaktskolan-guide-quiz-v1";

const DEFAULT_QUESTIONS: readonly GuideQuizQuestion[] = [
  {
    question: "Vilket sätt hjälper bäst när du ska minnas ett begrepp?",
    options: ["Läsa samma stycke utan paus", "Återkalla svaret utan att titta", "Markera varje mening"],
    answer: 1,
    explanation: "Aktiv återkallning gör att du tränar på att plocka fram kunskapen, inte bara känna igen texten.",
  },
  {
    question: "Vad bör du göra när du är osäker på en regel?",
    options: ["Kontrollera en primärkälla", "Välja det svar som låter mest rimligt", "Hoppa över frågan permanent"],
    answer: 0,
    explanation: "Källkontroll och rätt sammanhang är viktigare än att gissa när regler eller befogenheter berörs.",
  },
  {
    question: "Vad är poängen med korta repetitionspass?",
    options: ["Att slippa öva på svåra delar", "Att bygga återkommande minnesspår", "Att bara träna kvällen före provet"],
    answer: 1,
    explanation: "Utspridd repetition ger flera tillfällen att plocka fram samma kunskap över tid.",
  },
];

const GUIDE_QUIZZES: Record<string, readonly GuideQuizQuestion[]> = {
  "lagstod/envarsgripande": [
    {
      question: "När kan ett envarsgripande bli aktuellt?",
      options: ["När någon verkar misstänkt", "Vid bar gärning eller flyende fot efter ett brott där fängelse kan följa", "När en arbetsledare ger sitt tillstånd"],
      answer: 1,
      explanation: "Rättegångsbalken 24 kap. 7 § kräver bland annat bar gärning eller flyende fot och ett brott där fängelse kan följa.",
    },
    {
      question: "Vad betyder flyende fot i sammanhanget?",
      options: ["Att personen lämnar platsen direkt efter gärningen", "Att personen saknar legitimation", "Att personen springer från en ordningsvakt"],
      answer: 0,
      explanation: "Bedömningen handlar om den direkta kopplingen mellan gärningen och att personen påträffas på flykt.",
    },
    {
      question: "Vad ska ske efter ett gripande?",
      options: ["Personen ska förhöras färdigt på plats", "Personen ska skyndsamt överlämnas till polis", "Personen ska alltid köras hem"],
      answer: 1,
      explanation: "Ett envarsgripande är inte ett eget förhörsförfarande. Personen ska skyndsamt överlämnas till polis.",
    },
  ],
  "lagstod/nodvarn-och-nod": [
    {
      question: "Vad beskriver bäst en nödvärnssituation?",
      options: ["Ett påbörjat eller överhängande brottsligt angrepp", "Varje vägran att följa en instruktion", "En risk som kan uppstå längre fram"],
      answer: 0,
      explanation: "Nödvärn gäller mot ett påbörjat eller överhängande brottsligt angrepp på person eller egendom.",
    },
    {
      question: "Vad är en central begränsning vid nödvärn?",
      options: ["Åtgärden får aldrig avbrytas", "Försvaret får inte vara uppenbart oförsvarligt", "Endast polis får bedöma situationen"],
      answer: 1,
      explanation: "Nödvärnsrätten har gränser. Åtgärden måste bedömas utifrån angreppet och får inte vara uppenbart oförsvarlig.",
    },
    {
      question: "Vad är viktigt efter en ingripande situation?",
      options: ["Dokumentera händelsen sakligt", "Ändra berättelsen om någon blir missnöjd", "Undvika att lämna några tider"],
      answer: 0,
      explanation: "En tydlig och saklig redogörelse för händelseförloppet hjälper den fortsatta bedömningen.",
    },
  ],
  studieteknik: [
    {
      question: "Vilken metod tränar aktiv återkallning?",
      options: ["Läsa om sidan flera gånger", "Förklara regeln utan att titta", "Samla så många markeringar som möjligt"],
      answer: 1,
      explanation: "När du förklarar utan stöd upptäcker du vad du faktiskt kan plocka fram.",
    },
    {
      question: "Vad är utspridd repetition?",
      options: ["Flera kortare pass över tid", "Ett långt pass kvällen före provet", "Att bara repetera det du redan kan"],
      answer: 0,
      explanation: "Utspridda pass ger hjärnan flera tillfällen att återkalla och förstärka kunskapen.",
    },
    {
      question: "Vad bör en bra genomgång avslutas med?",
      options: ["En snabb kontroll utan facit", "Nya färger på anteckningarna", "Att radera gamla frågor"],
      answer: 0,
      explanation: "En kort självtest visar vilka delar som behöver en ny repetition.",
    },
  ],
  "vaktarprov/vu1-ovningsfragor": [
    {
      question: "Vad är en bra strategi när du fastnar på en övningsfråga?",
      options: ["Läs förklaringen och försök återberätta regeln", "Memorera bara rätt bokstav", "Hoppa över alla liknande frågor"],
      answer: 0,
      explanation: "Förklaringen blir mest användbar när du kan återberätta principen med egna ord.",
    },
    {
      question: "Vad ska du göra innan du litar på ett quizresultat?",
      options: ["Kontrollera att du förstår varför svaret är rätt", "Räkna bara antalet rätt", "Jämföra med en kompis"],
      answer: 0,
      explanation: "Ett resultat är en signal om vad du ska repetera, inte ett bevis på behörighet.",
    },
    {
      question: "Vad hjälper mest inför nästa repetitionspass?",
      options: ["Spara de frågor du missade", "Byta ämne varje minut", "Undvika att läsa förklaringar"],
      answer: 0,
      explanation: "Dina misstag pekar ut nästa konkreta repetitionspunkt.",
    },
  ],
  "vaktarprov/vu2-ovningsfragor": [
    {
      question: "Vad kännetecknar en bra scenariogenomgång?",
      options: ["Den kopplar beslut till regel och omständighet", "Den har alltid bara ett ord som svar", "Den utgår från magkänsla"],
      answer: 0,
      explanation: "I scenarier behöver du kunna förklara både vilken regel som gäller och vilka fakta som påverkar bedömningen.",
    },
    {
      question: "Vad gör du när två svar verkar möjliga?",
      options: ["Identifiera vilket villkor frågan faktiskt testar", "Välja det längsta svaret", "Alltid välja det mest ingripande"],
      answer: 0,
      explanation: "Börja med att ringa in frågans villkor innan du värderar alternativen.",
    },
    {
      question: "Vad ska ett fel svar leda till?",
      options: ["En kort repetition av den bakomliggande principen", "Att du slutar försöka", "Att du bara tränar på samma bokstav"],
      answer: 0,
      explanation: "Målet är att omvandla felet till en tydlig kunskapslucka att täppa igen.",
    },
  ],
  "vaktare-eller-ordningsvakt": [
    {
      question: "Vad skiljer främst en ordningsvakt från en väktare?",
      options: ["Ordningsvakten har ett offentligrättsligt förordnande", "Väktaren får automatiskt fler polisiära befogenheter", "Det finns ingen skillnad"],
      answer: 0,
      explanation: "Rollerna har olika utbildning, uppdrag och rättslig grund. Kontrollera alltid aktuella krav i primärkällor.",
    },
    {
      question: "Vad är en väktares grunduppgift?",
      options: ["Att utföra bevakning enligt uppdrag och instruktioner", "Att ersätta polis i alla situationer", "Att besluta om straff"],
      answer: 0,
      explanation: "Väktarens uppdrag styrs av bevakningsuppdraget, arbetsgivarens instruktioner och gällande rätt.",
    },
    {
      question: "Var hittar du säkrast aktuella behörighetskrav?",
      options: ["I en aktuell myndighets- eller utbildningskälla", "I ett gammalt forumssvar", "I en anonym kommentar"],
      answer: 0,
      explanation: "Krav och utbildningsvägar kan ändras. Börja därför i en aktuell primärkälla.",
    },
  ],
};

function getQuestions(guideSlug: string): readonly GuideQuizQuestion[] {
  return GUIDE_QUIZZES[guideSlug] ?? DEFAULT_QUESTIONS;
}

function readSavedQuiz(): SavedQuizState {
  if (typeof window === "undefined") return { version: 1, guides: {} };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, guides: {} };
    const parsed = JSON.parse(raw) as Partial<SavedQuizState>;
    if (parsed.version !== 1 || !parsed.guides || typeof parsed.guides !== "object") return { version: 1, guides: {} };
    return { version: 1, guides: parsed.guides as Record<string, SavedGuideQuiz>, lastGuide: parsed.lastGuide, lastScore: parsed.lastScore };
  } catch {
    return { version: 1, guides: {} };
  }
}

function saveQuiz(guideSlug: string, guideLabel: string, progress: SavedGuideQuiz) {
  if (typeof window === "undefined") return;
  const current = readSavedQuiz();
  const next: SavedQuizState = {
    version: 1,
    guides: { ...current.guides, [guideSlug]: progress },
    lastGuide: guideSlug,
    lastLabel: guideLabel,
    lastScore: progress.completed ? progress.score : current.lastScore,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing and storage limits should not block the quiz.
  }
}

function trackGuideQuizEvent(eventName: string, guideSlug: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void };
  analyticsWindow.gtag?.("event", eventName, { guide_slug: guideSlug, ...params });
}

function initialProgress(): SavedGuideQuiz {
  return { currentQuestion: 0, score: 0, selected: null, completed: false, answered: 0, answers: [], updatedAt: new Date().toISOString() };
}

export function GuideQuizPanel({ guideSlug, guideLabel }: GuideQuizPanelProps) {
  const questions = useMemo(() => getQuestions(guideSlug), [guideSlug]);
  const [progress, setProgress] = useState<SavedGuideQuiz>(() => initialProgress());
  const [previousResult, setPreviousResult] = useState<{ label: string; score: number } | null>(null);
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const savedState = readSavedQuiz();
    const stored = savedState.guides[guideSlug];
    const restored = stored && stored.currentQuestion >= 0 && stored.currentQuestion < questions.length
      ? { ...stored, answers: Array.isArray(stored.answers) ? stored.answers : [] }
      : initialProgress();
    const hydrateId = window.setTimeout(() => {
      setProgress(restored);
      setPreviousResult(
        savedState.lastGuide && savedState.lastGuide !== guideSlug && typeof savedState.lastScore === "number"
          ? { label: savedState.lastLabel ?? "föregående guide", score: savedState.lastScore ?? 0 }
          : null,
      );
      trackGuideQuizEvent("guide_quiz_view", guideSlug, { question_count: questions.length, restored: Boolean(stored) });
    }, 0);
    return () => window.clearTimeout(hydrateId);
  }, [guideSlug, questions.length]);

  useEffect(() => {
    const node = panelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsQuizVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobileOverlayOpen) return;

    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMobileOverlayOpen(false);
      trackGuideQuizEvent("guide_quiz_overlay_close", guideSlug, { method: "escape" });
    };
    const closeOnDesktopResize = () => {
      if (mediaQuery.matches) return;
      setIsMobileOverlayOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    mediaQuery.addEventListener("change", closeOnDesktopResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      mediaQuery.removeEventListener("change", closeOnDesktopResize);
    };
  }, [guideSlug, isMobileOverlayOpen]);

  function updateProgress(next: SavedGuideQuiz) {
    setProgress(next);
    saveQuiz(guideSlug, guideLabel, next);
  }

  function chooseAnswer(index: number) {
    if (progress.selected !== null || progress.completed) return;
    const question = questions[progress.currentQuestion];
    if (!question) return;
    const nextAnswers = [...progress.answers];
    nextAnswers[progress.currentQuestion] = index;
    const nextScore = progress.score + (index === question.answer ? 1 : 0);
    const next = {
      ...progress,
      answers: nextAnswers,
      selected: index,
      score: nextScore,
      answered: progress.answered + 1,
      updatedAt: new Date().toISOString(),
    };
    updateProgress(next);
    trackGuideQuizEvent("guide_quiz_answer", guideSlug, {
      question_index: progress.currentQuestion + 1,
      is_correct: index === question.answer,
    });
  }

  function nextQuestion() {
    if (progress.selected === null) return;
    const isLast = progress.currentQuestion === questions.length - 1;
    const next = isLast
      ? { ...progress, completed: true, updatedAt: new Date().toISOString() }
      : { ...progress, currentQuestion: progress.currentQuestion + 1, selected: null, updatedAt: new Date().toISOString() };
    updateProgress(next);
    if (isLast) trackGuideQuizEvent("guide_quiz_complete", guideSlug, { score: progress.score, question_count: questions.length });
    if (window.matchMedia("(max-width: 900px)").matches) setIsMobileOverlayOpen(true);
  }

  function restart() {
    const next = initialProgress();
    updateProgress(next);
    trackGuideQuizEvent("guide_quiz_restart", guideSlug);
  }

  function scrollToQuiz() {
    setIsQuizVisible(true);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    trackGuideQuizEvent("guide_quiz_sticky_cta_click", guideSlug);
  }

  function closeMobileOverlay(method: "backdrop" | "button") {
    setIsMobileOverlayOpen(false);
    trackGuideQuizEvent("guide_quiz_overlay_close", guideSlug, { method });
  }

  const current = questions[progress.currentQuestion];
  const resultTitle = progress.score === questions.length ? "Full pott" : progress.score >= 2 ? "Bra koll" : "Bra start";

  function renderResult() {
    return (
      <div className="guide-quiz-result" aria-live="polite">
        <span className="guide-quiz-result__badge">Quiz klart</span>
        <p className="guide-quiz-result__score">{progress.score} av {questions.length} rätt</p>
        <h2>{resultTitle}</h2>
        <p>Du kan spara resultatet lokalt och fortsätta till nästa guide när du vill.</p>
        <div className="guide-quiz-result-summary" aria-label="Dina svar och rätt svar">
          {questions.map((question, index) => {
            const selectedAnswer = progress.answers[index] ?? null;
            const hasAnswer = selectedAnswer !== null;
            const isCorrect = hasAnswer && selectedAnswer === question.answer;
            return (
              <div className="guide-quiz-result-row" key={question.question}>
                <div className="guide-quiz-result-row__meta">
                  <span>Fråga {index + 1}</span>
                  <span className={`guide-quiz-result-row__status${!hasAnswer ? " is-missing" : isCorrect ? " is-correct" : " is-incorrect"}`}>
                    {!hasAnswer ? "Ej sparat" : isCorrect ? "Rätt" : "Fel"}
                  </span>
                </div>
                <p className="guide-quiz-result-row__answer">
                  <strong>Ditt svar:</strong> {selectedAnswer === null ? "Inget svar" : question.options[selectedAnswer]}
                </p>
                <p className="guide-quiz-result-row__answer">
                  <strong>Rätt svar:</strong> {question.options[question.answer]}
                </p>
              </div>
            );
          })}
        </div>
        <p className="guide-quiz-result__cta-copy">Vill du öva på fler quizfrågor? Bli medlem gratis.</p>
        <div className="guide-quiz-result__actions">
          <Link
            className="guide-quiz-panel__cta"
            href="/login?mode=sign-up&redirect_url=%2Fplattform"
            onClick={() => trackGuideQuizEvent("guide_quiz_cta_click", guideSlug, { cta: "create_account" })}
          >
            Skapa gratis konto
          </Link>
          <button className="guide-quiz-panel__text-action" type="button" onClick={restart}>Gör om quizet</button>
        </div>
      </div>
    );
  }

  function renderQuestion(showPreviousResult = true) {
    if (!current) return null;
    return (
      <div className="guide-quiz-question" aria-live="polite">
        {showPreviousResult && previousResult && progress.currentQuestion === 0 && progress.answered === 0 && (
          <p className="guide-quiz-remembered">Senast: {previousResult.score}/{questions.length} på {previousResult.label}. Fortsätt med nästa ämne.</p>
        )}
        <span className="guide-quiz-question__topic">{guideLabel}</span>
        <h2>{current.question}</h2>
        <div className="guide-quiz-options" role="group" aria-label={`Svarsalternativ för fråga ${progress.currentQuestion + 1}`}>
          {current.options.map((option, index) => {
            const selected = progress.selected === index;
            return (
              <button
                className={`guide-quiz-option${selected ? " is-selected" : ""}`}
                disabled={progress.selected !== null}
                key={option}
                onClick={() => chooseAnswer(index)}
                type="button"
              >
                <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            );
          })}
        </div>
        {progress.selected !== null && (
          <div className="guide-quiz-next">
            <button className="guide-quiz-next-button" type="button" onClick={nextQuestion}>
              {progress.currentQuestion === questions.length - 1 ? "Visa resultat" : "Nästa fråga"} <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <aside className="guide-quiz-panel" ref={panelRef} aria-label={`Snabbquiz om ${guideLabel}`}>
        <div className="guide-quiz-panel__topline">
          <span className="guide-quiz-panel__eyebrow">Testa dig själv</span>
          <span>{progress.completed ? `${progress.score}/${questions.length}` : `${Math.min(progress.currentQuestion + 1, questions.length)}/${questions.length}`}</span>
        </div>
        <div className="guide-quiz-panel__progress" aria-hidden="true">
          <span style={{ width: `${progress.completed ? 100 : ((progress.currentQuestion + (progress.selected !== null ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        {progress.completed ? renderResult() : renderQuestion()}

        <p className="guide-quiz-panel__note">Ditt resultat visas efter att du svarat på alla 3 frågor.</p>
      </aside>

      {isMobileOverlayOpen && (
        <div
          className="guide-quiz-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeMobileOverlay("backdrop");
          }}
          role="presentation"
        >
          <section
            aria-label={`Nästa fråga i quizet om ${guideLabel}`}
            aria-modal="true"
            className="guide-quiz-overlay__dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button className="guide-quiz-overlay__close" type="button" onClick={() => closeMobileOverlay("button")} aria-label="Stäng quiz">
              ×
            </button>
            <div className="guide-quiz-overlay__content">
              <p className="guide-quiz-overlay__eyebrow">Fortsätt quizet</p>
              {progress.completed ? renderResult() : renderQuestion(false)}
            </div>
          </section>
        </div>
      )}

      {!isQuizVisible && (
        <button className="guide-quiz-sticky-cta" type="button" onClick={scrollToQuiz}>
          <span>Testa dig: 3 frågor</span>
          <span aria-hidden="true">→</span>
        </button>
      )}
    </>
  );
}
