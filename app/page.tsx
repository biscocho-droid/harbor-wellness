"use client";

import { useEffect, useMemo, useState } from "react";

type PathKey = "depression" | "panic" | "anxiety" | "rumination";

type Step = {
  eyebrow: string;
  title: string;
  body: string;
  prompt?: string;
  options?: string[];
  practice?: "breathe" | "ground" | "release" | "activate";
};

const paths: Record<
  PathKey,
  { title: string; note: string; symbol: string; steps: Step[] }
> = {
  depression: {
    title: "Depression",
    note: "A gentle path toward one small next step",
    symbol: "☂",
    steps: [
      {
        eyebrow: "Arrive",
        title: "You don’t have to fix everything.",
        body: "For this moment, the goal is only to meet yourself where you are. Take one slow breath and let today be difficult without judging yourself for it.",
        prompt: "How heavy does everything feel right now?",
        options: ["A little heavy", "Very heavy", "I feel shut down"],
      },
      {
        eyebrow: "Reconnect",
        title: "Choose the smallest possible act of care.",
        body: "Motivation often follows action—not the other way around. Pick something that asks almost nothing of you.",
        practice: "activate",
      },
      {
        eyebrow: "Be kind",
        title: "Speak to yourself like someone worth protecting.",
        body: "Try this: “I’m having a hard time. I don’t need to earn rest or care. One small thing is enough for now.”",
        prompt: "What would feel supportive next?",
        options: ["Rest without guilt", "Reach out to someone", "Do one tiny task"],
      },
    ],
  },
  panic: {
    title: "Panic",
    note: "Slow the alarm and return to the present",
    symbol: "≈",
    steps: [
      {
        eyebrow: "Right now",
        title: "This feeling is intense, and it will pass.",
        body: "You are not required to make the panic disappear. Let’s help your body notice that this moment can be survived.",
        prompt: "Can you place both feet on the floor?",
        options: ["Yes, they’re grounded", "I’m sitting or lying down", "Not right now"],
      },
      {
        eyebrow: "Breathe",
        title: "Follow the moon’s rhythm.",
        body: "Breathe gently—never force a deep breath. Inhale for four, pause for two, and exhale for six. A longer exhale can help the body soften.",
        practice: "breathe",
      },
      {
        eyebrow: "Orient",
        title: "Come back through your senses.",
        body: "There is no rush. Notice each item around you and tap it when you find one.",
        practice: "ground",
      },
    ],
  },
  anxiety: {
    title: "Anxiety",
    note: "Untangle the worry and find what you control",
    symbol: "⌁",
    steps: [
      {
        eyebrow: "Name it",
        title: "A worried mind is trying to protect you.",
        body: "Anxiety speaks in possibilities. Naming the worry can make a little space between you and the story your mind is telling.",
        prompt: "What kind of worry is this?",
        options: ["Something happening now", "Something that might happen", "A feeling I can’t explain"],
      },
      {
        eyebrow: "Sort it",
        title: "Separate what is true from what is predicted.",
        body: "Ask: What do I know for certain? What am I imagining? Uncertainty is uncomfortable, but it is not proof that something bad will happen.",
        prompt: "Which statement feels most useful?",
        options: ["A thought is not a forecast", "I can handle the next step", "I don’t need certainty right now"],
      },
      {
        eyebrow: "Regain choice",
        title: "Return to your circle of control.",
        body: "Choose one action that belongs to you. It can be practical, soothing, or simply deciding to revisit the worry later.",
        options: ["Take one practical step", "Pause and regulate", "Set a time to revisit this"],
      },
    ],
  },
  rumination: {
    title: "Rumination",
    note: "Step out of the loop without fighting it",
    symbol: "◎",
    steps: [
      {
        eyebrow: "Notice",
        title: "You’ve found the loop.",
        body: "Catching yourself replaying a thought is already a shift. You don’t need to solve it again right now.",
        prompt: "What is the loop asking you to do?",
        options: ["Replay the past", "Solve the unsolvable", "Prepare for every outcome"],
      },
      {
        eyebrow: "Unhook",
        title: "Let the thought be a thought.",
        body: "Try adding these words before it: “I’m noticing that my mind is telling me…” You can hear a thought without obeying it.",
        practice: "release",
      },
      {
        eyebrow: "Redirect",
        title: "Give your attention somewhere to land.",
        body: "Choose a sensory activity for ten minutes. The thought may return; each gentle redirect is the practice.",
        options: ["Listen to one song", "Take a slow walk", "Do something with my hands"],
      },
    ],
  },
};

const pathOrder = Object.keys(paths) as PathKey[];

function CrisisPanel({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section
        className="crisis-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" onClick={close} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">You deserve real support</span>
        <h2 id="crisis-title">If you might hurt yourself or you’re in immediate danger</h2>
        <p>
          Call emergency services now, or contact the 988 Suicide & Crisis Lifeline
          in the United States. It is available for suicidal crisis or emotional
          distress.
        </p>
        <div className="crisis-actions">
          <a className="primary-action" href="tel:988">
            Call 988
          </a>
          <a className="secondary-action" href="sms:988">
            Text 988
          </a>
          <a
            className="text-action"
            href="https://988lifeline.org/chat/"
            target="_blank"
            rel="noreferrer"
          >
            Open online chat
          </a>
        </div>
        <p className="location-note">
          These contacts are for the United States. If you’re elsewhere, contact
          your local emergency service or crisis line.
        </p>
      </section>
    </div>
  );
}

export default function Home() {
  const [activePath, setActivePath] = useState<PathKey | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale");
  const [grounded, setGrounded] = useState<string[]>([]);

  useEffect(() => {
    if (!activePath || paths[activePath].steps[stepIndex]?.practice !== "breathe") {
      return;
    }
    const phases = [
      ["Inhale", 4000],
      ["Pause", 2000],
      ["Exhale", 6000],
    ] as const;
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      timer = setTimeout(() => {
        current = (current + 1) % phases.length;
        setBreathPhase(phases[current][0]);
        advance();
      }, phases[current][1]);
    };
    advance();
    return () => clearTimeout(timer);
  }, [activePath, stepIndex]);

  const currentPath = activePath ? paths[activePath] : null;
  const step = currentPath?.steps[stepIndex];
  const progress = currentPath ? ((stepIndex + 1) / currentPath.steps.length) * 100 : 0;
  const groundingItems = useMemo(
    () => ["5 things you can see", "4 things you can feel", "3 things you can hear", "2 things you can smell", "1 thing you can taste"],
    [],
  );

  function openPath(key: PathKey) {
    setActivePath(key);
    setStepIndex(0);
    setSelected(null);
    setGrounded([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (!currentPath) return;
    if (stepIndex < currentPath.steps.length - 1) {
      if (currentPath.steps[stepIndex + 1]?.practice === "breathe") {
        setBreathPhase("Inhale");
      }
      setStepIndex((value) => value + 1);
      setSelected(null);
    } else {
      setStepIndex(currentPath.steps.length);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((value) => value - 1);
      setSelected(null);
    } else {
      setActivePath(null);
    }
  }

  return (
    <main>
      <div className="night-sky" aria-hidden="true">
        <div className="moon" />
        <span className="star star-one">✦</span>
        <span className="star star-two">·</span>
        <span className="star star-three">✧</span>
        <div className="horizon" />
      </div>

      {!activePath ? (
        <section className="home-screen">
          <header className="brand-row">
            <a className="brand" href="#" aria-label="Harbor home">
              <span className="brand-mark">H</span>
              Harbor
            </a>
            <button className="help-pill" onClick={() => setShowCrisis(true)}>
              Get help now
            </button>
          </header>

          <div className="hero-copy">
            <span className="eyebrow">A quiet place to begin</span>
            <h1>What do you need support with?</h1>
            <p>
              Choose what feels closest. We’ll take it one gentle step at a time.
            </p>
          </div>

          <div className="path-grid">
            {pathOrder.map((key, index) => (
              <button
                className="path-card"
                key={key}
                onClick={() => openPath(key)}
                style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
              >
                <span className="path-symbol" aria-hidden="true">
                  {paths[key].symbol}
                </span>
                <span className="path-copy">
                  <strong>{paths[key].title}</strong>
                  <small>{paths[key].note}</small>
                </span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>

          <footer className="home-footer">
            <p>
              Harbor offers self-guided coping support. It does not diagnose,
              treat, or replace care from a qualified professional.
            </p>
            <button onClick={() => setShowCrisis(true)}>Need immediate help?</button>
          </footer>
        </section>
      ) : (
        <section className="guide-shell">
          <header className="guide-header">
            <button className="back-button" onClick={goBack} aria-label="Go back">
              ←
            </button>
            <div>
              <span>{currentPath?.symbol}</span>
              <strong>{currentPath?.title}</strong>
            </div>
            <button className="help-link" onClick={() => setShowCrisis(true)}>
              Help now
            </button>
          </header>
          <div className="progress-track" aria-label={`Step ${stepIndex + 1} of ${currentPath?.steps.length}`}>
            <span style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>

          {stepIndex < (currentPath?.steps.length ?? 0) && step ? (
            <article className="guide-card" key={`${activePath}-${stepIndex}`}>
              <span className="eyebrow">
                Step {stepIndex + 1} · {step.eyebrow}
              </span>
              <h2>{step.title}</h2>
              <p className="step-body">{step.body}</p>

              {step.prompt && <h3>{step.prompt}</h3>}

              {step.options && (
                <div className="option-list">
                  {step.options.map((option) => (
                    <button
                      key={option}
                      className={selected === option ? "selected" : ""}
                      onClick={() => setSelected(option)}
                    >
                      <span>{selected === option ? "✓" : ""}</span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {step.practice === "breathe" && (
                <div className={`breath-practice ${breathPhase.toLowerCase()}`}>
                  <div className="breath-orbit">
                    <span>{breathPhase}</span>
                  </div>
                  <p>Stay for three gentle rounds, or continue whenever you’re ready.</p>
                </div>
              )}

              {step.practice === "ground" && (
                <div className="ground-list">
                  {groundingItems.map((item) => {
                    const done = grounded.includes(item);
                    return (
                      <button
                        className={done ? "done" : ""}
                        key={item}
                        onClick={() =>
                          setGrounded((items) =>
                            done ? items.filter((value) => value !== item) : [...items, item],
                          )
                        }
                      >
                        <span>{done ? "✓" : ""}</span>
                        {item}
                      </button>
                    );
                  })}
                </div>
              )}

              {step.practice === "activate" && (
                <div className="tiny-actions">
                  {["Take three sips of water", "Open a curtain or step outside", "Wash your face or change clothes"].map(
                    (action) => (
                      <button
                        key={action}
                        className={selected === action ? "selected" : ""}
                        onClick={() => setSelected(action)}
                      >
                        <span>{selected === action ? "✓" : "·"}</span>
                        {action}
                      </button>
                    ),
                  )}
                </div>
              )}

              {step.practice === "release" && (
                <div className="release-card">
                  <span>Try saying slowly</span>
                  <p>“I’m noticing that my mind is telling me this again.”</p>
                  <small>The thought can be here without taking the wheel.</small>
                </div>
              )}

              <div className="guide-actions">
                <button className="primary-action" onClick={goNext}>
                  Continue
                  <span>→</span>
                </button>
                <button className="quiet-action" onClick={() => setActivePath(null)}>
                  Return home
                </button>
              </div>
            </article>
          ) : (
            <article className="guide-card completion-card">
              <span className="completion-moon">☾</span>
              <span className="eyebrow">For this moment</span>
              <h2>You showed up for yourself.</h2>
              <p className="step-body">
                You don’t need to feel completely better for this to count. Carry
                one helpful thing from this practice into the next few minutes.
              </p>
              <button className="primary-action" onClick={() => setActivePath(null)}>
                Return to Harbor
                <span>→</span>
              </button>
              <button className="text-action" onClick={() => openPath(activePath)}>
                Repeat this path
              </button>
            </article>
          )}
        </section>
      )}

      {showCrisis && <CrisisPanel close={() => setShowCrisis(false)} />}
    </main>
  );
}
