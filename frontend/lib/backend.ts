import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

import type { BackendAnalysis } from "@/lib/types";

const execFileAsync = promisify(execFile);

function parseJsonOutput(stdout: string): BackendAnalysis {
  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new Error("Backend returned empty output");
  }

  try {
    return JSON.parse(trimmed) as BackendAnalysis;
  } catch {
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    const lastLine = lines[lines.length - 1] ?? "";
    return JSON.parse(lastLine) as BackendAnalysis;
  }
}


export async function getBackendAnalysis(password: string): Promise<BackendAnalysis> {
  const scriptPath = path.resolve(process.cwd(), "..", "api_bridge.py");
  const args = [scriptPath, "--password", password, "--bfs-depth", "4", "--bfs-char-limit", "6"];

  const { stdout, stderr } = await execFileAsync("python", args, {
    cwd: path.resolve(process.cwd(), ".."),
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  if (stderr && stderr.trim()) {
    const harmless = ["SyntaxWarning"];
    const hasRealError = harmless.every((token) => !stderr.includes(token));
    if (hasRealError) {
      throw new Error(stderr.trim());
    }
  }

  return parseJsonOutput(stdout);
}
