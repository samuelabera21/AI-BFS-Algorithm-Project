# Libraries Guide

This project uses three kinds of libraries:

1. Third-party libraries from npm or the Python app structure.
2. Built-in libraries from Node.js or Python.
3. Local project modules written inside this repository.

## 1. Next.js

Next.js is the framework for the frontend app. It handles pages, navigation, server components, API routes, and route-based rendering.

Why it is here:

- `frontend/app/page.tsx` and the other route pages are built with Next.js.
- `Link` is used for navigation without full page reloads.
- `dynamic()` is used to load some client-only components safely.
- `app/api/analyze/route.ts` uses the Next.js route handler style.

What to remember:

- Next.js is the app framework, not just a UI library.
- It decides how pages are loaded and how server/client code is split.

## 2. React

React is the UI library used inside Next.js pages and components.

Why it is here:

- Components like `QueueViewer` and `ChoiceCards` are React components.
- Hooks like `useState`, `useEffect`, `useMemo`, and `useRef` manage state and updates.

What to remember:

- React draws the interface.
- It updates the screen when state changes.

## 3. Node.js built-in libraries

These are not installed packages. They come with Node.js.

### `child_process`

Used in `frontend/lib/backend.ts`.

Purpose:

- Runs the Python backend script from the frontend.
- This is how the Next.js app asks Python to calculate analysis results.

### `path`

Used in `frontend/lib/backend.ts`.

Purpose:

- Builds correct file paths across Windows, macOS, and Linux.
- Prevents hard-coded path mistakes.

### `util`

Used in `frontend/lib/backend.ts`.

Purpose:

- `promisify()` converts callback-style functions into promise-based ones.
- That lets the frontend use `await`.

## 4. Python standard library

These are built into Python and do not need pip installation.

### `dataclasses`

Used in `analyzer/estimator.py`.

Purpose:

- Defines structured data objects like `PasswordAnalysis`.
- Makes the analysis result easier to pass around and convert to JSON.

### `typing`

Used in `analyzer/estimator.py`.

Purpose:

- Adds type hints like `List[str]`.
- Helps readability and editor support.

### `collections.deque`

Used in `attacks/brute_force.py`.

Purpose:

- Implements the queue for BFS.
- `popleft()` removes from the front efficiently, which is exactly what BFS needs.

### `re`

Used in `analyzer/patterns.py`.

Purpose:

- Finds repeated patterns in passwords.
- Used for checks like repeated characters.

### `pathlib.Path`

Used in `attacks/dictionary.py`.

Purpose:

- Reads the common password list file in a safe, cross-platform way.

### `argparse`

Used in `api_bridge.py` and `main.py`.

Purpose:

- Reads command-line arguments like `--password` and BFS limits.

### `json`

Used in `api_bridge.py`.

Purpose:

- Converts the Python analysis result into JSON so the frontend can read it.

### `sys`

Used in `main.py`.

Purpose:

- Reads command-line arguments when the Python CLI is run.

## 5. Local project modules

These are files written inside this repository.

### `analyzer/estimator.py`

This is the main analysis orchestrator.

What it does:

- Computes password combinations.
- Estimates crack time.
- Assigns strength labels.
- Collects BFS data and suggestions.

### `analyzer/patterns.py`

This checks whether the password looks weak.

What it does:

- Looks for sequences.
- Looks for repeated characters.
- Looks for common substitutions like `@` for `a`.

### `analyzer/strength.py`

This turns estimated time into a strength category.

What it does:

- Very fast to crack -> Weak.
- Slower -> Medium.
- Much slower -> Strong or Very Strong.

### `attacks/brute_force.py`

This creates the BFS queue flow and prefix tree.

What it does:

- Builds the alphabet from the password characters.
- Expands nodes level by level.
- Stops when the target prefix is found.

### `attacks/dictionary.py`

This checks whether the password is in a common password list.

What it does:

- Helps mark obvious passwords as very weak.

### `frontend/lib/backend.ts`

This connects Next.js to Python.

What it does:

- Runs `api_bridge.py`.
- Parses JSON output.
- Returns structured analysis data to the frontend.

## 6. Why these libraries are needed together

The frontend needs Next.js and React to show the interface.
The backend needs Python standard libraries to calculate the analysis.
The bridge between them uses Node.js built-ins to run Python and read the result.

So the flow is:

`Next.js page -> Node.js bridge -> Python analysis -> JSON result -> React UI`

## 7. What to study first

If you want to understand the project step by step, start in this order:

1. `frontend/lib/backend.ts`
2. `api_bridge.py`
3. `analyzer/estimator.py`
4. `attacks/brute_force.py`
5. `analyzer/patterns.py`
6. `analyzer/strength.py`

That order shows how the password moves from the UI into the analysis engine and back to the screen.

---

## 8. Additional Python packages installed in your environment

Below are the exact packages you showed from `pip list` and plain-English explanations for each. Treat this as the "what and why" for someone who is new to Python packages.

Install these locally with:

```bash
# activate the environment first (example using conda):
conda activate password_ai

# then install via requirements file:
pip install -r requirements.txt
```

- `colorama==0.4.6`
	- What: Small utility that makes colored text work across Windows and Unix terminals.
	- Why here: Some console output or progress indicators may use colored text for readability during CLI runs.

- `contourpy==1.3.2`
	- What: A plotting backend used by Matplotlib to draw contour plots.
	- Why here: Matplotlib delegates contour drawing to this library on newer installs.

- `cycler==0.12.1`
	- What: Helper used by Matplotlib to cycle over plotting styles (colors, markers).
	- Why here: Matplotlib depends on it to produce consistent plot style layers.

- `fonttools==4.62.1`
	- What: Tools to parse and manipulate font files (TTF/OTF).
	- Why here: Matplotlib may use it to load and manage fonts for rendered labels.

- `kiwisolver==1.5.0`
	- What: A small constraint solver used by Matplotlib for layout computations.
	- Why here: Matplotlib uses it internally to place text, legends, and axes correctly.

- `matplotlib==3.10.9`
	- What: The primary plotting library in Python (creates charts and figures).
	- Why here: The visualization folder uses Matplotlib to render graphs of analysis or visual summaries.
	- Beginner tip: You can run a script that produces PNG/SVG visualizations locally; Matplotlib writes image files.

- `networkx==3.4.2`
	- What: Graph / network library for Python (nodes/edges, traversal algorithms).
	- Why here: It helps build and visualize the BFS prefix tree and related graph data structures.
	- Beginner tip: Think of it as a structured way to represent relationships between items (nodes) with lines (edges).

- `numpy==2.2.6`
	- What: Numerical arrays and fast math operations.
	- Why here: Many plotting and graph libraries depend on NumPy for numeric arrays and efficient computation.
	- Beginner tip: Use it when you need lists of numbers manipulated quickly (e.g., coordinates, matrices).

- `packaging==26.0`
	- What: Utility used for parsing package versions and metadata.
	- Why here: Tools that parse/compare versions depend on it (used indirectly by pip and other libs).

- `pillow==12.2.0`
	- What: Image processing library (PIL fork).
	- Why here: Matplotlib or other parts may use it to read/write images during visualization.

- `pyparsing==3.3.2`
	- What: Small library for building parsers; used by packaging and some plotting internals.
	- Why here: Indirect dependency used by higher-level libraries.

- `python-dateutil==2.9.0.post0`
	- What: Utilities for parsing and manipulating dates and times.
	- Why here: Helpful when formatting timestamps or logging analysis events.

- `six==1.17.0`
	- What: Compatibility helpers that make code work on Python 2 and 3 (mostly historical).
	- Why here: Some libraries include it as a lightweight compatibility dependency.

- `tqdm==4.67.3`
	- What: Progress-bar utility for loops in CLI scripts.
	- Why here: Long-running operations (visualization or scanning) may display a progress bar for user feedback.

- `wheel==0.46.3`
	- What: Packaging artifact format for Python distributions; used when installing packages.
	- Why here: Installed automatically and useful for building or installing other packages.

- `zxcvbn==4.5.0`
	- What: A password-strength estimation library originally by Dropbox; provides heuristics for password guessability.
	- Why here: The project may use it for additional strength checks or comparisons.

If any of these packages are not strictly required for your minimal runs, you can install only the subset you need. But installing the full `requirements.txt` above will reproduce the environment you showed.

---

If you want, I can also:

1. Add a short `README.md` with the exact setup commands for Windows (conda) and Unix.
2. Provide a small script `setup_env.sh` / `setup_env.bat` to automate environment creation and `pip install -r requirements.txt`.

Tell me which one you prefer and I will add it next.
