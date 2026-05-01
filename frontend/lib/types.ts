export type BackendStep = {
  step: number;
  depth: number;
  popped: string;
  enqueued: string[];
  queue_head: string[];
};

export type BackendBFS = {
  found: boolean;
  visited_nodes: number;
  depth_found: number;
  target_prefix: string;
  branching_factor: number;
  alphabet: string[];
  queue_snapshots: Record<string, string[]>;
  levels: Record<string, string[]>;
  steps: BackendStep[];
};

export type BackendAnalysis = {
  password: string;
  password_length: number;
  charset_size: number;
  combinations: string;
  estimated_attempts: string;
  estimated_time_seconds: number;
  strength: string;
  suggestions: string[];
  weaknesses: string[];
  guesses_per_second: number;
  bfs: BackendBFS;
};

export function formatBigIntString(value: string): string {
  try {
    return BigInt(value).toLocaleString("en-US");
  } catch {
    return value;
  }
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return "near 0";
  if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
  if (seconds < 86400 * 365) return `${(seconds / 86400).toFixed(2)} days`;
  return `${(seconds / (86400 * 365)).toFixed(2)} years`;
}
