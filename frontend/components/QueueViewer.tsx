"use client";

import { useEffect, useMemo, useState } from "react";

type Step = {
  step: number;
  depth: number;
  popped: string;
  enqueued: string[];
  queue_head: string[];
};

type Props = {
  bfs: {
    steps: Step[];
    target_prefix: string;
    found: boolean;
  };
};

export default function QueueViewer({ bfs }: Props) {
  const steps = bfs.steps ?? [];
  const target = bfs.target_prefix ?? "";

  const foundIndex = useMemo(() => {
    if (!target) return -1;
    return steps.findIndex((s) => s.popped === target);
  }, [steps, target]);

  const lastIndex = foundIndex >= 0 ? foundIndex : steps.length - 1;
  const visibleSteps = useMemo(() => steps.slice(0, lastIndex + 1), [steps, lastIndex]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [motionTick, setMotionTick] = useState(0);

  useEffect(() => {
    if (!playing) return;
    if (currentIndex >= visibleSteps.length - 1) {
      setPlaying(false);
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => {
        const nextIndex = Math.min(index + 1, visibleSteps.length - 1);
        if (nextIndex === index) {
          setPlaying(false);
        }
        return nextIndex;
      });
    }, 950);

    return () => window.clearInterval(timer);
  }, [playing, visibleSteps.length, currentIndex]);

  useEffect(() => {
    if (currentIndex === foundIndex && foundIndex >= 0) {
      setPlaying(false);
    }
  }, [currentIndex, foundIndex]);

  useEffect(() => {
    setMotionTick((tick) => tick + 1);
  }, [currentIndex]);

  function goToStep(index: number) {
    const clamped = Math.max(0, Math.min(index, visibleSteps.length - 1));
    setCurrentIndex(clamped);
    setPlaying(false);
  }

  const currentStep = visibleSteps[currentIndex] || null;
  const isFoundStep = currentIndex === foundIndex && foundIndex >= 0;

  const explanation = currentStep
    ? [
        `Step ${currentStep.step}: pop ${currentStep.popped} from the front of the queue.`,
        currentStep.enqueued.length
          ? `Push ${currentStep.enqueued.join(", ")} to the back of the queue.`
          : "No new items were pushed for this step.",
        `Queue head after the update is ${currentStep.queue_head.length ? currentStep.queue_head.join(", ") : "empty"}.`,
      ]
    : [];

  return (
    <div className="queue-viewer single-step">
      <div className="viewer-controls">
        <div className="ctrl-left">
          <button className="btn" onClick={() => goToStep(0)} title="Go to start">⏮️</button>
          <button className="btn" onClick={() => goToStep(currentIndex - 1)} title="Previous step">◀️</button>
          <button className="btn primary" onClick={() => setPlaying((p) => !p)} title="Toggle autoplay">
            {playing ? "Pause" : "Auto-play"}
          </button>
          <button className="btn" onClick={() => goToStep(currentIndex + 1)} title="Next step">▶️</button>
          <button className="btn" onClick={() => goToStep(visibleSteps.length - 1)} title="Go to end">⏭️</button>
        </div>
        <div className="ctrl-right">
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Step <strong>{currentIndex + 1}</strong> / {visibleSteps.length}
          </div>
        </div>
      </div>

      <div className="table-first-wrap">
        <div className="table-first-header">
          <div>
            <div className="step-breadcrumb">Traversal table</div>
            <h3>All logged queue steps</h3>
          </div>
          <div className="table-first-status">
            <span className={`status-dot ${isFoundStep ? "found" : ""}`}></span>
            <span>{isFoundStep ? "Target reached" : "Traversing"}</span>
          </div>
        </div>

        <div className="table-wrap queue-table-wrap">
          <table className="step-table queue-table viewer-table">
            <thead>
              <tr>
                <th style={{ width: 66 }}>Now</th>
                <th style={{ width: 70 }}>Step</th>
                <th style={{ width: 70 }}>Depth</th>
                <th style={{ width: 160 }}>Popped</th>
                <th>Enqueued</th>
                <th>Queue Head After Step</th>
                <th style={{ width: 110 }}>State</th>
              </tr>
            </thead>
            <tbody>
              {visibleSteps.map((step, index) => {
                const isCurrent = index === currentIndex;
                const isFound = index === foundIndex;
                return (
                  <tr
                    key={step.step}
                    className={`${isCurrent ? "current-row active-step" : ""} ${isFound ? "found-row" : ""}`}
                    onClick={() => goToStep(index)}
                    role="button"
                    tabIndex={0}
                    title="Click to jump to this step"
                  >
                    <td className="step-number">
                      <span className={`row-beacon ${isCurrent ? "live" : ""}`}>
                        {isCurrent ? "●" : "○"}
                      </span>
                    </td>
                    <td className="step-number">{step.step}</td>
                    <td>{step.depth}</td>
                    <td>
                      <span className={`queue-pill ${isFound ? "found" : ""} ${isCurrent ? "token-anim" : ""}`}>
                        {step.popped}
                        {isFound ? <span className="found-badge">FOUND</span> : null}
                      </span>
                    </td>
                    <td>
                      <div className="queue-list">
                        {step.enqueued.length ? step.enqueued.map((item, itemIndex) => (
                          <span key={`${item}-${itemIndex}`} className={`queue-token ${isCurrent ? "token-append" : ""}`}>
                            {item}
                          </span>
                        )) : <span className="queue-empty">-</span>}
                      </div>
                    </td>
                    <td>
                      <div className="queue-list">
                        {step.queue_head.length ? step.queue_head.map((item, itemIndex) => (
                          <span key={`${item}-${itemIndex}`} className={`queue-token ${isCurrent ? "token-shift" : ""}`}>
                            {item}
                          </span>
                        )) : <span className="queue-empty">-</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`step-state ${isCurrent ? "state-live" : ""} ${isFound ? "state-found" : ""}`}>
                        {isFound ? "Found" : isCurrent ? "Now" : "Done"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="step-explainer">
        <div className={`step-token ${isFoundStep ? "found" : ""}`} data-motion={motionTick}>
          <span className="step-token-label">Current pop</span>
          <strong>{currentStep ? currentStep.popped : "-"}</strong>
          {isFoundStep ? <span className="found-badge">FOUND</span> : null}
        </div>

        <div className="step-details">
          <div className="step-breadcrumb">What this step does</div>
          <div className="step-notes">
            {explanation.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="queue-rail">
            <div className="rail-inner">
              {currentStep && currentStep.queue_head.length ? currentStep.queue_head.map((t, i) => (
                <div key={`${t}-${i}`} className="rail-token">{t}</div>
              )) : <div className="queue-empty">(empty)</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="viewer-footer">
        <div style={{ color: 'var(--muted)' }}>
          {currentStep ? (
            <>
              Popped <strong>{currentStep.popped}</strong> and pushed <strong>{currentStep.enqueued.length}</strong> new item{currentStep.enqueued.length === 1 ? "" : "s"}.
            </>
          ) : null}
        </div>
        <div className="footer-actions">
          <button className="btn" onClick={() => goToStep(foundIndex >= 0 ? foundIndex : visibleSteps.length - 1)}>Go to Found</button>
        </div>
      </div>
    </div>
  );
}
