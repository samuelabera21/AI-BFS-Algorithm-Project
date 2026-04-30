

api_bridge.py is the middleman between the frontend and the Python analysis code.

What it does in one sentence
- It takes the password from the command line, runs the Python analysis, adds extra fields for the UI, and prints the final result as JSON.

Line by line in simple words

- The top docstring
  - Says this file is the backend bridge for frontend integration.
  - That means: Next.js does not talk to the analyzer directly; it goes through this file.

- `from __future__ import annotations`
  - Lets Python treat type hints more flexibly.
  - You can think of it as a modern Python style setting.

- `import argparse`
  - Reads command-line arguments.
  - This file uses it to accept `--password`, `--bfs-depth`, and `--bfs-char-limit`.

- `import json`
  - Converts Python data into JSON text.
  - JSON is the format the frontend can read.

- `from dataclasses import asdict`
  - Converts a dataclass object into a normal dictionary.
  - That makes it easier to turn into JSON.

- `from analyzer.estimator import GUESS_RATE, analyze_password`
  - Imports the main password analysis function.
  - Also imports the guess rate constant used in the crack-time estimate.

- `from attacks.brute_force import detect_charset_size, run_bfs_prefix_search`
  - Imports helper functions for:
    - figuring out the character set size
    - generating the BFS trace

What `build_payload()` does

This function prepares the final data object that the frontend will receive.

Step by step:
- It calls `analyze_password(...)`
  - This runs the main analysis logic.
- It converts the dataclass result to a normal dictionary with `asdict(report)`
- It changes some large numbers into strings
  - `combinations`
  - `estimated_attempts`
- Why?
  - Very large numbers can sometimes lose precision in JavaScript.
  - Strings are safer for the frontend to display exactly.
- It adds `password_length`
  - The real length of the typed password.
- It adds `charset_size`
  - How many character types were detected.
- It adds `guesses_per_second`
  - The constant used for the time estimate.
- It adds `bfs`
  - The BFS queue trace from `run_bfs_prefix_search(...)`
- Finally it returns the full payload

So this function is basically:
- collect analysis
- make it UI-safe
- return it

What `main()` does

This is the command-line entry point.

Step by step:
- It creates an argument parser
  - This lets the script read values from terminal commands.
- It requires `--password`
  - So the script knows what to analyze.
- It also accepts:
  - `--bfs-depth`
  - `--bfs-char-limit`
- It reads those arguments from the command line.
- It calls `build_payload(...)`
- It prints the result as JSON using `json.dumps(...)`

Why that print matters
- The frontend runs this Python script and captures its printed output.
- So the printed JSON is the actual response sent back to Next.js.

What happens when you run it

If you run something like:
```bash
python api_bridge.py --password 1997 --bfs-depth 4 --bfs-char-limit 6
```

Then:
- `argparse` reads those inputs
- `build_payload()` calls the analyzer
- the analyzer computes the result
- this file prints the final JSON
- the frontend reads that JSON and shows the UI

The important role of this file
- It is not the analyzer itself.
- It is not the frontend itself.
- It is the translator between them.

Simple mental model
- backend.ts calls this file
- this file calls the real analyzer
- this file formats the result as JSON
- the frontend receives that JSON







What `main()` does exactly

1. It creates a command-line parser
- `parser = argparse.ArgumentParser(...)`
- This tells Python: “I expect arguments like `--password`.”

2. It defines expected inputs
- `--password` (required)
- `--bfs-depth` (optional, default `4`)
- `--bfs-char-limit` (optional, default `6`)

So if you don’t pass the optional ones, Python uses 4 and 6 automatically.

3. It reads actual values from the command
- `args = parser.parse_args()`
- Example command:
  ```bash
  python api_bridge.py --password 1997
  ```
  then:
  - `args.password = "1997"`
  - `args.bfs_depth = 4`
  - `args.bfs_char_limit = 6`

4. It calls `build_payload(...)`
- Uses those parsed argument values.
- Gets back a Python dictionary with all analysis data.

5. It prints JSON text
- `print(json.dumps(payload, ensure_ascii=True))`
- This is crucial because the frontend (backend.ts) reads this printed text as `stdout`.

Why `main()` is important

Without `main()`:
- the script would define functions but nothing would execute automatically when called.
- backend.ts would run Python but get no output JSON.

What this line means

- `if __name__ == "__main__":`
  - Run `main()` only when this file is executed directly.
  - Do not auto-run when imported by another Python file.

Simple mental model

- `build_payload()` = cook the meal
- `main()` = take the order (args), call the cook, and serve it (print JSON)

So in this project:
- backend.ts calls `python api_bridge.py ...`
- `main()` receives args and prints the result
- frontend gets that printed JSON and shows UI

