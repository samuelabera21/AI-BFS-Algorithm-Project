"use client";

import { useEffect, useRef, useState } from "react";
import ChoiceCards from "@/components/ChoiceCards";
import type { BackendAnalysis } from "@/lib/types";

export default function HomePage() {
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<BackendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const restoredQueryRef = useRef("");

  async function analyzeInput(value: string, openModal: boolean) {
    if (!value.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value.trim() }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Failed to analyze password");
        return;
      }

      setSubmitted(value.trim());
      setResult(payload as BackendAnalysis);
      setShowModal(openModal);
    } catch {
      setError("Could not connect to backend analyzer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const restoredPassword = new URLSearchParams(window.location.search).get("password")?.trim() ?? "";
    if (!restoredPassword) return;
    if (restoredQueryRef.current === restoredPassword) return;

    restoredQueryRef.current = restoredPassword;
    setPassword(restoredPassword);
    void analyzeInput(restoredPassword, false);
  }, []);

  async function handleAnalyze() {
    await analyzeInput(password, true);
  }

  return (
    <main>
      <div className="card">
        <h1>AI Password Security Analyzer UI</h1>
        <p>Type one password once, get a clear popup, then open separate pages for each learning view.</p>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>Main Input</h2>
        <div className="grid" style={{ gridTemplateColumns: "1fr auto", gap: 10 }}>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button
            className="primary"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {error ? <p style={{ color: "#b91c1c", marginTop: 8 }}>{error}</p> : null}
      </section>

      {result ? <ChoiceCards password={submitted} /> : null}

      {showModal && result ? (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Result Summary</h2>
            <p style={{ marginBottom: 12 }}>Password: {result.password}</p>
            <div className="grid grid-2">
              <div className="card">
                <h3>Strength</h3>
                <p>{result.strength}</p>
              </div>
              <div className="card">
                <h3>Suggestions</h3>
                <ul>
                  {result.suggestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
