"use client";

import { useState } from "react";

const questions = [
  {
    question: "När kan ett envarsgripande bli aktuellt?",
    options: [
      "När någon verkar misstänkt",
      "När någon påträffas på bar gärning eller flyende fot efter ett brott där fängelse kan följa",
      "När en arbetsledare ger sitt tillstånd",
    ],
    answer: 1,
    explanation: "Rättegångsbalken 24 kap. 7 § kräver bland annat ett brott där fängelse kan följa och bar gärning eller flyende fot.",
  },
  {
    question: "Vad beskriver bäst en nödvärnssituation?",
    options: [
      "Ett påbörjat eller överhängande brottsligt angrepp",
      "Varje vägran att följa en väktares instruktion",
      "En risk som kan uppstå längre fram",
    ],
    answer: 0,
    explanation: "Nödvärn kan bland annat föreligga mot ett påbörjat eller överhängande brottsligt angrepp på person eller egendom.",
  },
];

export function QuizDemo() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const finished = step >= questions.length;

  function choose(index: number) {
    if (selected !== null || finished) return;
    setSelected(index);
    if (index === questions[step].answer) setScore((value) => value + 1);
  }

  function next() {
    setStep((value) => value + 1);
    setSelected(null);
  }

  function restart() {
    setStep(0);
    setScore(0);
    setSelected(null);
  }

  if (finished) {
    return (
      <div className="quiz-demo" aria-live="polite">
        <p className="eyebrow">Quiz klart</p>
        <h3>{score} av {questions.length} rätt</h3>
        <p>Resultatet är en snabb temperaturmätare, inte ett officiellt provresultat.</p>
        <button className="button button--dark" type="button" onClick={restart}>Gör om quizet</button>
      </div>
    );
  }

  const current = questions[step];
  return (
    <div className="quiz-demo">
      <div className="quiz-demo__meta">
        <span>Fråga {step + 1} av {questions.length}</span>
        <span>{score} rätt</span>
      </div>
      <h3>{current.question}</h3>
      <div className="quiz-options" role="group" aria-label={`Svarsalternativ för fråga ${step + 1}`}>
        {current.options.map((option, index) => {
          const state = selected === null ? "" : index === current.answer ? "is-correct" : selected === index ? "is-wrong" : "";
          return (
            <button
              className={state}
              disabled={selected !== null}
              key={option}
              onClick={() => choose(index)}
              type="button"
            >
              <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              {option}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="quiz-feedback" aria-live="polite">
          <strong>{selected === current.answer ? "Rätt." : "Inte riktigt."}</strong> {current.explanation}
          <button className="text-link" type="button" onClick={next}>
            {step + 1 === questions.length ? "Visa resultat" : "Nästa fråga"} →
          </button>
        </div>
      )}
    </div>
  );
}
