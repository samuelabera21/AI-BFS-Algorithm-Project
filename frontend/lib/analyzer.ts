export type Strength = "Weak" | "Medium" | "Strong" | "Very Strong";

export type AnalysisResult = {
  password: string;
  length: number;
  charsetSize: number;
  combinations: bigint;
  guessesPerSecond: number;
  seconds: number;
  strength: Strength;
  weaknesses: string[];
  suggestions: string[];
  bfs: BFSResult;
};

export type BFSResult = {
  alphabet: string[];
  branchingFactor: number;
  maxDepth: number;
  targetPrefix: string;
  visitedNodes: number;
  queueSnapshots: Record<number, string[]>;
  steps: Array<{ step: number; depth: number; popped: string; enqueued: string[]; queueHead: string[] }>;
  levels: Record<number, string[]>;
};

const GUESSES_PER_SECOND = 1_000_000_000;

function detectCharsetSize(password: string): number {
  let size = 0;
  if ([...password].some((c) => /[a-z]/.test(c))) size += 26;
  if ([...password].some((c) => /[A-Z]/.test(c))) size += 26;
  if ([...password].some((c) => /\d/.test(c))) size += 10;
  if ([...password].some((c) => /[^A-Za-z0-9]/.test(c))) size += 32;
  return size || 26;
}

function classifyStrength(seconds: number): Strength {
  if (seconds < 1) return "Weak";
  if (seconds < 3600) return "Medium";
  if (seconds < 86400 * 365) return "Strong";
  return "Very Strong";
}

function detectWeaknesses(password: string): string[] {
  const weaknesses: string[] = [];
  const lower = password.toLowerCase();

  const alpha = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  for (let i = 0; i <= alpha.length - 4; i += 1) {
    if (lower.includes(alpha.slice(i, i + 4))) {
      weaknesses.push("Sequential pattern detected");
      break;
    }
  }
  if (!weaknesses.includes("Sequential pattern detected")) {
    for (let i = 0; i <= nums.length - 4; i += 1) {
      if (lower.includes(nums.slice(i, i + 4))) {
        weaknesses.push("Sequential pattern detected");
        break;
      }
    }
  }

  if (/(.)\1{3,}/.test(password)) {
    weaknesses.push("Repeated characters detected");
  }

  const map: Record<string, string> = { "@": "a", "0": "o", "1": "i", "3": "e", "4": "a", "$": "s", "5": "s", "7": "t" };
  const normalized = [...password].map((c) => map[c] ?? c.toLowerCase()).join("");
  const weakWords = ["password", "admin", "welcome", "qwerty", "letmein"];
  if (weakWords.some((w) => normalized.includes(w))) {
    weaknesses.push("Common substitutions detected");
  }

  return weaknesses;
}

function buildSuggestions(password: string, weaknesses: string[]): string[] {
  const out: string[] = [];
  if (password.length < 12) out.push("Increase password length");
  if (![...password].some((c) => /\d/.test(c)) || ![...password].some((c) => /[^A-Za-z0-9]/.test(c))) {
    out.push("Add symbols");
  }
  if (weaknesses.length > 0) out.push("Avoid sequences or repeated characters");
  if (out.length === 0) out.push("Add randomness");
  return out;
}

function runBFS(password: string, maxDepth = 4, charLimit = 6): BFSResult {
  const uniq: string[] = [];
  for (const ch of password) {
    if (!uniq.includes(ch)) uniq.push(ch);
    if (uniq.length >= charLimit) break;
  }
  if (uniq.length === 0) uniq.push("a");

  const targetPrefix = password.slice(0, maxDepth);
  const queue: string[] = [""];
  const steps: BFSResult["steps"] = [];
  const queueSnapshots: Record<number, string[]> = {};
  const levels: Record<number, string[]> = { 0: ["start"] };
  let visitedNodes = 0;
  let stepNo = 1;

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    queueSnapshots[depth] = queue.map((q) => (q === "" ? "start" : q)).slice(0, 12);
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i += 1) {
      const popped = queue.shift() ?? "";
      if (popped !== "") visitedNodes += 1;

      if (popped === targetPrefix) {
        steps.push({
          step: stepNo,
          depth,
          popped: popped || "start",
          enqueued: [],
          queueHead: queue.map((q) => (q === "" ? "start" : q)).slice(0, 8),
        });
        return {
          alphabet: uniq,
          branchingFactor: uniq.length,
          maxDepth,
          targetPrefix,
          visitedNodes,
          queueSnapshots,
          steps,
          levels,
        };
      }

      const enqueued: string[] = [];
      if (popped.length < maxDepth) {
        for (const ch of uniq) {
          const child = popped + ch;
          queue.push(child);
          enqueued.push(child);
          const childDepth = child.length;
          if (!levels[childDepth]) levels[childDepth] = [];
          levels[childDepth].push(child);
        }
      }

      steps.push({
        step: stepNo,
        depth,
        popped: popped || "start",
        enqueued: enqueued.slice(0, 6),
        queueHead: queue.map((q) => (q === "" ? "start" : q)).slice(0, 8),
      });
      stepNo += 1;

      if (steps.length >= 80) {
        return {
          alphabet: uniq,
          branchingFactor: uniq.length,
          maxDepth,
          targetPrefix,
          visitedNodes,
          queueSnapshots,
          steps,
          levels,
        };
      }
    }
  }

  return {
    alphabet: uniq,
    branchingFactor: uniq.length,
    maxDepth,
    targetPrefix,
    visitedNodes,
    queueSnapshots,
    steps,
    levels,
  };
}

export function analyzePassword(password: string): AnalysisResult {
  const clean = password.trim();
  const length = clean.length;
  const charsetSize = detectCharsetSize(clean);
  const combinations = BigInt(charsetSize) ** BigInt(length);
  const seconds = Number(combinations) / GUESSES_PER_SECOND;
  const weaknesses = detectWeaknesses(clean);
  const suggestions = buildSuggestions(clean, weaknesses);
  const bfs = runBFS(clean, 4, 6);

  return {
    password: clean,
    length,
    charsetSize,
    combinations,
    guessesPerSecond: GUESSES_PER_SECOND,
    seconds,
    strength: classifyStrength(seconds),
    weaknesses,
    suggestions,
    bfs,
  };
}

export function formatBigInt(value: bigint): string {
  return value.toLocaleString("en-US");
}

export function formatTime(seconds: number): string {
  if (seconds < 1) return `${seconds.toFixed(2)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
  if (seconds < 86400 * 365) return `${(seconds / 86400).toFixed(2)} days`;
  return `${(seconds / (86400 * 365)).toFixed(2)} years`;
}
