# Password AI Analysis — IEEE-Style Presentation

## Abstract
This project implements an educational password analysis and visualization tool that estimates password strength, detects common weaknesses, checks against a dictionary of common passwords, and produces an educational BFS search trace. The system provides a Next.js frontend and a Python analysis backend to deliver explainable, reproducible feedback to users and demonstrators.

## Keywords
password strength, password analysis, BFS simulation, dictionary check, explainable security, Next.js, Python

## 1. Introduction
Passwords remain the primary authentication factor for many online services. Users frequently choose weak or predictable passwords, leading to account compromise. This project demonstrates an explainable tool for analyzing passwords, estimating time-to-crack, detecting structural weaknesses, and visualizing an illustrative search strategy.

## 2. Problem Statement
Users and practitioners need actionable, easy-to-understand feedback about password risk. Existing meters often provide opaque scores. The goal is to produce reproducible strength estimates, highlight common weaknesses, detect dictionary matches, and provide a safe educational visualization showing how brute-force search expands candidate prefixes.

## 3. Related Work
- zxcvbn — a popular password strength estimator based on pattern matching and heuristics.
- NIST SP 800-63 guidance on memorized secrets and entropy considerations.
This project emphasizes explainability and an educational BFS simulation rather than pure attacker realism.

## 4. System Overview
The system has two main parts:
- Frontend: a Next.js application (TypeScript, React) that collects passwords and displays results.
- Backend: a Python analysis pipeline that returns JSON results for the frontend to render.

Key files and components:
- Frontend route and UI: `frontend/app/page.tsx`, `frontend/app/api/analyze/route.ts`.
- Bridge: `frontend/lib/backend.ts` launches the Python backend and parses JSON.
- Python entry: `api_bridge.py` parses CLI args and prints JSON.
- Analysis engine: `analyzer/estimator.py` orchestrates estimation, weakness detection, BFS, and suggestions.
- Utilities: `attacks/brute_force.py`, `attacks/dictionary.py`, `analyzer/patterns.py`, `analyzer/strength.py`.
- Data: `data/common_passwords.txt` (common password corpus).

Architecture summary: the frontend sends a password to an API route, which calls `getBackendAnalysis()` (bridge). The bridge runs `api_bridge.py` with arguments; Python analyzes the password and returns JSON back to the frontend for display.

## 5. Methodology
- Crack-time estimation: detect character classes, compute charset size, estimate combinations as charset_size ^ length, and divide by a guesses-per-second constant (default: 1,000,000,000) to get time-to-crack.
- Dictionary check: lookup against `data/common_passwords.txt` to flag highly risky matches.
- Weakness detection: pattern checks for sequences, repetition, and simple substitutions (via `analyzer/patterns.py`).
- BFS simulation: `attacks/brute_force.py` produces an educational breadth-first expansion trace (queue snapshots, visited order, branching factor) to illustrate how candidate prefixes grow.
- Feedback generation: combine findings into human-friendly suggestions (length, symbol use, avoidance of common words).

## 6. Implementation Details
- Frontend: Next.js (TypeScript). UI components are under `frontend/app` and `frontend/components`.
- Backend: Python 3 script `api_bridge.py` and analysis modules under `analyzer/` and `attacks/`.
- Inter-process bridge: `frontend/lib/backend.ts` invokes Python using command-line args and reads JSON output.
- Configuration: tune BFS depth/char-limit via bridge arguments (e.g., `--bfs-depth`, `--bfs-char-limit`).

## 7. Evaluation and Example
Example: analyzing the password `123` demonstrates the flow and expected outputs.
- Detected charset: digits only (size 10).
- Combinations: 10^3 = 1,000.
- Guesses/sec assumption: 1,000,000,000 → estimated time = 0.000001 s.
- Dictionary check: depends on `data/common_passwords.txt` (if present, `found=True`).
- BFS trace: small queue snapshots and a target-found step illustrating breadth-first expansion.

Metrics and qualitative evaluation:
- Correctness: checks for dictionary hits and pattern detection.
- Explainability: whether UI fields (guesses-per-second, charset_size, bfs trace) help users understand risk.

## 8. Results and Discussion
The system demonstrates clear, reproducible estimates with explainable fields. Educational BFS traces help non-experts visualize search growth. Limitations: the BFS is illustrative (not attack-optimized), and guess-rate assumptions can drastically change time estimates.

## 9. Conclusion
This project provides a demonstrator for explainable password analysis combining deterministic estimation, dictionary checks, weakness detection, and an educational BFS visualization. It is intended for demonstrations, teaching, and as a prototype for richer, user-facing advice.

## 10. Future Work
- Integrate password-hash-based offline attack simulations with caution and strict safety controls.
- Expand dictionary corpora and support ranked datasets for improved risk ranking.
- Add configurable guess-rate profiles (online vs. offline attacker models) and uncertainty visualization.
- Improve pattern detection using sequence models or learned heuristics.

## 11. How to Run (Quick Start)
Prerequisites:
- Python 3.8+ and packages listed in `requirements.txt`.
- Node.js and dependencies for the frontend (see `frontend/package.json`).

Run backend analysis directly (example):
```
python api_bridge.py --password "123" --bfs-depth 4 --bfs-char-limit 6
```

Run the frontend (typical Next.js dev server):
```
cd frontend
npm install
npm run dev
```

API endpoint: POST `/api/analyze` with JSON body `{ "password": "..." }`; the route runs the bridge and returns the analysis JSON.

## 12. References
- Dropbox zxcvbn: https://github.com/dropbox/zxcvbn
- NIST SP 800-63 (Digital Identity Guidelines)
- Academic and practitioner literature on password security and entropy estimation

## Appendix: Repository map (selected)
- `frontend/` — Next.js app and UI components
- `api_bridge.py` — Python CLI entry point
- `analyzer/` — analysis orchestration (`estimator.py`, `patterns.py`, `strength.py`)
- `attacks/` — educational simulation helpers (`brute_force.py`, `dictionary.py`)
- `data/common_passwords.txt` — common password list used for dictionary checks

---
If you want, I can (a) commit this README into the repo, (b) include an example JSON response for `123`, or (c) generate a short slide deck derived from this README. Which would you like next?
