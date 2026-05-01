

backend.ts is the bridge between the Next.js frontend and the Python backend.

What each part does

- `import { execFile } from "child_process";`
  - Runs another program from Node.js.
  - Here it is used to start Python and execute api_bridge.py.

- `import path from "path";`
  - Builds file paths safely.
  - This keeps the code working on Windows and other systems without hard-coded path strings.

- `import { promisify } from "util";`
  - Converts callback-style functions into promise-based ones.
  - That lets this file use `await`.

- `import type { BackendAnalysis } from "@/lib/types";`
  - Tells TypeScript what shape the final JSON should have.
  - This is for type checking only.

Main flow in the file

- `const execFileAsync = promisify(execFile);`
  - Makes `execFile` usable with `await`.

- `parseJsonOutput(stdout: string)`
  - Takes the text printed by Python.
  - Tries to convert it into JSON.
  - If the output has extra lines, it takes the last valid line and parses that.
  - This is a safety helper so the frontend can still read the result cleanly.

- `getBackendAnalysis(password: string)`
  - Builds the path to api_bridge.py.
  - Calls Python with:
    - `--password`
    - `--bfs-depth 4`
    - `--bfs-char-limit 6`
  - Waits for Python to finish.
  - Checks `stderr` for real errors.
  - Converts the Python output into a `BackendAnalysis` object and returns it.

Why this file exists

This file is the one that connects the browser UI to the Python logic. Without it:
- the frontend would not know how to run the analyzer
- the Python result would not come back in a format React can use
- the analysis page, queue-flow page, and BFS graph page would not get their data

In simple terms, this file does one job:
- send password to Python
- get analysis JSON back
- hand that result to the frontend

Best way to understand it mentally

Think of it like a courier:
- frontend asks: "analyze this password"
- backend.ts sends the request to Python
- Python returns the answer
- backend.ts gives that answer back to the page

