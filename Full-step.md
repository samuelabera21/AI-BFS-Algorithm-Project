# Full Step Flow for Password Analysis Using `123`

This file shows the complete request path from the moment a user enters the password `123` until the final result comes back to the frontend.

The reason some files were not explained in the shorter version is simple: that version was a presentation summary, not a full runtime trace. In this full version, I include the direct execution path and the helper files that are actually used during analysis.

## 1. User starts in the frontend
The flow begins in [frontend/app/page.tsx](frontend/app/page.tsx).

When the user types `123` and clicks the analyze button:
- the `password` state stores the input,
- `handleAnalyze()` is called,
- `handleAnalyze()` calls `analyzeInput(password, true)`,
- and the frontend prepares to send the request.

## 2. Frontend sends the request
Inside [frontend/app/page.tsx](frontend/app/page.tsx), the `analyzeInput()` function:
- trims the password,
- sends a `POST` request to `/api/analyze`,
- waits for the backend response,
- stores the returned analysis data,
- and opens the result modal.

At this point, the frontend is no longer doing the analysis itself. It is only sending the password to the API route.

## 3. API route receives the request
The next file in the chain is [frontend/app/api/analyze/route.ts](frontend/app/api/analyze/route.ts).

This file is the Next.js server route for password analysis.

Its `POST()` function:
- reads the JSON request body,
- extracts the `password` field,
- trims the password,
- checks whether the password is empty,
- and returns an error if nothing was provided.

If the password is valid, it calls `getBackendAnalysis(password)` from [frontend/lib/backend.ts](frontend/lib/backend.ts).

## 4. Next.js bridge launches Python
The file [frontend/lib/backend.ts](frontend/lib/backend.ts) is the bridge between the Next.js app and the Python analyzer.

Its `getBackendAnalysis(password)` function:
- builds the path to `api_bridge.py`,
- creates the Python command arguments,
- runs the command `python api_bridge.py --password 123 --bfs-depth 4 --bfs-char-limit 6`,
- waits for the Python process to finish,
- and parses the printed JSON output.

This file does not analyze the password directly. It only launches Python and reads the response.

## 5. Python bridge receives the command-line input
The next file is [api_bridge.py](api_bridge.py).

This file is the Python entry point used by the frontend.

Its job is to:
- read command-line arguments,
- call the password analysis function,
- add extra UI-friendly fields,
- and print the final JSON response.

### What `main()` does
`main()` is the command-line controller.

It:
1. reads `--password`, `--bfs-depth`, and `--bfs-char-limit`,
2. sends those values into `build_payload()`,
3. and prints the returned object as JSON.

### What `build_payload()` does
`build_payload()`:
- calls `analyze_password()` from [analyzer/estimator.py](analyzer/estimator.py),
- converts the analysis result into a dictionary,
- adds extra fields for the frontend,
- and prepares BFS trace data for the queue and graph pages.

The extra UI fields include:
- `password_length`,
- `charset_size`,
- `guesses_per_second`,
- and `bfs` trace information.

## 6. Main analysis happens in the estimator
The core analysis is in [analyzer/estimator.py](analyzer/estimator.py).

This is the file that decides how strong the password is and what feedback to return.

For `123`, `analyze_password()` runs in this order:

### Step 1: estimate crack time
`estimate_crack_time(password)`:
- calls `estimate_attempts(password)`,
- calculates the search space size,
- and estimates the crack time using the guess-rate constant.

For this project, the guess rate is `1,000,000,000` guesses per second.

### Step 2: dictionary check
`check_dictionary_password(password)` comes from [attacks/dictionary.py](attacks/dictionary.py).

This function:
- loads common passwords from [data/common_passwords.txt](data/common_passwords.txt),
- compares the input password against that list,
- and returns whether the password was found.

For `123`, the result depends on whether it exists in the list used by the project.

### Step 3: weakness detection
`detect_weaknesses(password)` comes from [analyzer/patterns.py](analyzer/patterns.py).

This function checks for things like:
- repeated characters,
- simple sequences,
- and other weak patterns.

### Step 4: BFS search simulation
`run_bfs_prefix_search(...)` comes from [attacks/brute_force.py](attacks/brute_force.py).

This function does not perform a real attack. It creates a safe educational BFS trace that shows:
- the queue state,
- visited nodes,
- branching factor,
- levels,
- and the prefix search path.

### Step 5: search preview
`simulate_search_strategy(password, max_depth=3)` also comes from [attacks/brute_force.py](attacks/brute_force.py).

It creates a small preview of generated candidates for UI display.

### Step 6: feedback generation
`build_feedback(password, weaknesses, dictionary_result["found"])` creates the suggestions shown to the user.

It usually recommends things like:
- increasing password length,
- adding symbols,
- avoiding common words,
- avoiding repeated or sequential patterns.

### Step 7: final analysis object
After all checks, `analyze_password()` returns a `PasswordAnalysis` object.

That object contains:
- the original password,
- combinations,
- estimated attempts,
- estimated crack time,
- strength label,
- BFS settings,
- BFS trace data,
- weaknesses,
- suggestions,
- and dictionary match information.

## 7. Helper file: password dictionary lookup
The dictionary helper is [attacks/dictionary.py](attacks/dictionary.py).

Its flow is:
1. `load_common_passwords()` reads [data/common_passwords.txt](data/common_passwords.txt).
2. The passwords are cleaned and stored in a list.
3. `check_dictionary_password(password)` compares the input against that list.
4. If a match is found, it returns `found = True` and the matched rank.
5. If no match is found, it returns `found = False`.

This file is important because dictionary matches are treated as highly risky.

## 8. Helper file: brute-force and BFS simulation
The safe brute-force helpers are in [attacks/brute_force.py](attacks/brute_force.py).

This file provides the logic for the educational search visualization.

Important functions:
- `detect_charset_size(password)`
- `estimate_attempts(password)`
- `run_bfs_prefix_search(...)`
- `simulate_search_strategy(password, max_depth=3)`

### `detect_charset_size(password)`
This function checks what types of characters appear in the password:
- lowercase letters,
- uppercase letters,
- digits,
- symbols.

It adds the size of each detected character group to build the charset size.

### `estimate_attempts(password)`
This function raises the charset size to the password length.

So the general idea is:
- charset size ^ password length = estimated combinations.

### `run_bfs_prefix_search(...)`
This function builds the queue trace for BFS.

It records:
- the current node,
- children added to the queue,
- queue snapshots,
- visited order,
- levels,
- and whether the target prefix was found.

## 9. Final decision inside the estimator
Back in [analyzer/estimator.py](analyzer/estimator.py), the system decides the final strength.

If the password is found in the dictionary list:
- the strength is forced to `Very Weak`,
- estimated time becomes `0.0`,
- and the dictionary rank is used as the attempt value.

If it is not found:
- the strength is classified from the crack-time estimate,
- and the normal brute-force estimate is used.

Then the function attaches all the BFS and suggestion data to the final object.

## 10. Response goes back to the frontend
Once the Python script prints the JSON:
- [api_bridge.py](api_bridge.py) writes the result to standard output,
- [frontend/lib/backend.ts](frontend/lib/backend.ts) reads and parses the JSON,
- [frontend/app/api/analyze/route.ts](frontend/app/api/analyze/route.ts) returns the JSON response,
- and [frontend/app/page.tsx](frontend/app/page.tsx) stores the result and opens the UI modal.

## 11. Full runtime chain for `123`
The full flow is:

1. User enters `123` in [frontend/app/page.tsx](frontend/app/page.tsx).
2. `handleAnalyze()` calls `analyzeInput(password, true)`.
3. `analyzeInput()` sends `POST /api/analyze`.
4. [frontend/app/api/analyze/route.ts](frontend/app/api/analyze/route.ts) receives the request.
5. The route calls `getBackendAnalysis(password)`.
6. [frontend/lib/backend.ts](frontend/lib/backend.ts) runs `python api_bridge.py ...`.
7. [api_bridge.py](api_bridge.py) parses the arguments.
8. `main()` calls `build_payload()`.
9. `build_payload()` calls `analyze_password()`.
10. [analyzer/estimator.py](analyzer/estimator.py) runs crack-time, dictionary, weakness, and BFS checks.
11. The Python code prints JSON.
12. The JSON travels back through the bridge and route.
13. The frontend receives the final result and displays it.

## 12. Why some files were not in the shorter version
Some files were not explained before because they are helper-only files, not the main runtime entry points.

For example:
- [analyzer/patterns.py](analyzer/patterns.py) is used by the estimator, but the estimator is the main orchestrator.
- [analyzer/strength.py](analyzer/strength.py) is used only for strength labeling inside the estimator.
- [data/common_passwords.txt](data/common_passwords.txt) is a data source, not executable logic.

In the full flow, the most important files are the ones that receive input, process it, and return output.
# Full Step Flow for Password Analysis Using `123`

This document shows the complete path from user input to backend processing and result display. It expands the short presentation version so every important file and function is included.

## Why Some Files Were Skipped in the Short Version
The shorter explanation grouped helper logic together so it was easier to read in a presentation.

This full version expands those grouped steps and shows the exact file-by-file flow:
- frontend input file
- API route file
- frontend Python bridge file
- Python entry file
- analyzer file
- helper files for math, dictionary checks, weakness detection, and BFS

## Full Flow From Scratch

### 1. User enters the password
The user types `123` in [frontend/app/page.tsx](frontend/app/page.tsx).

The first function used is `handleAnalyze()`.

What it does:
- reads the current input value,
- calls `analyzeInput(password, true)`,
- and starts the analysis request.

### 2. Frontend sends the request
Still inside [frontend/app/page.tsx](frontend/app/page.tsx), the `analyzeInput()` function:
- trims the password,
- sends a `POST` request to `/api/analyze`,
- waits for the response,
- stores the returned result,
- and opens the result modal.

At this point, the frontend is only sending data. The real analysis happens in the backend path below.

### 3. API route receives the request
The request reaches [frontend/app/api/analyze/route.ts](frontend/app/api/analyze/route.ts).

The `POST()` function does the following:
- reads the JSON body,
- extracts the password,
- checks that the password is not empty,
- and calls `getBackendAnalysis(password)` from [frontend/lib/backend.ts](frontend/lib/backend.ts).

If the password is missing, the route returns an error immediately.

### 4. Frontend bridge launches Python
The file [frontend/lib/backend.ts](frontend/lib/backend.ts) connects Next.js to Python.

Its `getBackendAnalysis(password)` function:
- builds the path to `api_bridge.py`,
- creates the Python command arguments,
- runs `python api_bridge.py --password 123 --bfs-depth 4 --bfs-char-limit 6`,
- waits for the Python process to finish,
- and parses the JSON output.

This file does not analyze the password itself. It only runs the Python backend and reads the result.

### 5. Python entry file starts the backend
The Python script [api_bridge.py](api_bridge.py) is the backend entry point used by the frontend.

Its flow is:
1. `main()` reads command-line arguments.
2. `main()` calls `build_payload(password, bfs_depth, bfs_char_limit)`.
3. `build_payload()` calls `analyze_password()` from [analyzer/estimator.py](analyzer/estimator.py).
4. `build_payload()` adds extra fields for the UI, including password length, charset size, guesses per second, and BFS trace data.
5. `main()` prints the final JSON result.

### 6. Main password analysis starts
The main analysis work happens in [analyzer/estimator.py](analyzer/estimator.py).

For the password `123`, `analyze_password()` runs in this order:

1. `estimate_crack_time(password)`
2. `check_dictionary_password(password)` from [attacks/dictionary.py](attacks/dictionary.py)
3. `detect_weaknesses(password)` from [analyzer/patterns.py](analyzer/patterns.py)
4. `run_bfs_prefix_search(...)` from [attacks/brute_force.py](attacks/brute_force.py)
5. `simulate_search_strategy(password, max_depth=3)` from [attacks/brute_force.py](attacks/brute_force.py)
6. `build_feedback(password, weaknesses, dictionary_result["found"])`
7. Strength classification using [analyzer/strength.py](analyzer/strength.py)

After that, the function returns a `PasswordAnalysis` object.

## Helper Files Used Inside the Main Analysis

### 7. Math and crack-time estimate
The function `estimate_crack_time(password)` in [analyzer/estimator.py](analyzer/estimator.py) calls `estimate_attempts(password)` from [attacks/brute_force.py](attacks/brute_force.py).

Inside [attacks/brute_force.py](attacks/brute_force.py):
- `detect_charset_size(password)` checks which character groups appear in the password,
- then `estimate_attempts(password)` calculates the total combinations.

For `123`:
- length = 3
- character type = digits only
- charset size = 10
- combinations = $10^3 = 1000$
- guess rate = $1{,}000{,}000{,}000$ guesses per second
- estimated time = $1000 \div 1{,}000{,}000{,}000 = 0.000001$ seconds

That is why the password is classified as weak in this example.

### 8. Dictionary check
The function `check_dictionary_password(password)` in [attacks/dictionary.py](attacks/dictionary.py) checks whether the password is present in `data/common_passwords.txt`.

Its internal steps are:
- load the common password list,
- lowercase and trim the input,
- compare the input with each common password,
- return `found=True` if there is an exact match.

For `123`, there is no match, so:
- `dictionary_match = false`
- `dictionary_rank = 0`

### 9. Weakness detection
The function `detect_weaknesses(password)` in [analyzer/patterns.py](analyzer/patterns.py) looks for weak structure in the password.

It checks for:
- repeated characters,
- sequences,
- and common substitution patterns.

For `123`, this specific version does not flag a weakness, so the weakness list remains empty.

### 10. BFS search simulation
The function `run_bfs_prefix_search(...)` in [attacks/brute_force.py](attacks/brute_force.py) creates the queue-based BFS trace.

For `123`:
- BFS alphabet = `['1', '2', '3']`
- branching factor = 3
- target prefix = `123`

The BFS trace builds and records:
- edges,
- visited order,
- queue snapshots,
- levels,
- and the step-by-step queue state.

This is only a safe educational simulation. It is not cracking a real password hash.

### 11. Search preview for the UI
The function `simulate_search_strategy(password, max_depth=3)` in [attacks/brute_force.py](attacks/brute_force.py) creates a small preview of the BFS-style expansion.

For `123`, the preview starts with:
- `1`
- `2`
- `3`
- `11`
- `12`
- `13`

The preview is used for explanation and learning.

### 12. Strength classification
The function `classify_strength(time_to_crack_seconds)` in [analyzer/strength.py](analyzer/strength.py) turns the crack-time estimate into a label.

For `123`, the time is much less than 1 second, so the label becomes:
- `Weak`

### 13. Feedback suggestions
The function `build_feedback(...)` in [analyzer/estimator.py](analyzer/estimator.py) creates suggestions for the user.

For `123`, the suggestions are:
- Increase password length
- Add symbols

## Exact Backend Result for `123`
After all helper functions finish, [analyzer/estimator.py](analyzer/estimator.py) returns a `PasswordAnalysis` object with values such as:

- password = `123`
- combinations = `1000`
- estimated_attempts = `1000`
- estimated_time_seconds = `0.000001`
- strength = `Weak`
- dictionary_match = `false`
- bfs_branching_factor = `3`
- bfs_target_prefix = `123`
- bfs_nodes_visited = `18`
- bfs_depth_found = `3`

Then [api_bridge.py](api_bridge.py) converts that object into JSON and adds UI fields like:
- `password_length`
- `charset_size`
- `guesses_per_second`
- `bfs`

## Final Return Path Back to the Screen
After Python finishes, the result returns in this order:

1. [api_bridge.py](api_bridge.py) prints JSON.
2. [frontend/lib/backend.ts](frontend/lib/backend.ts) reads and parses the JSON.
3. [frontend/app/api/analyze/route.ts](frontend/app/api/analyze/route.ts) returns the JSON response.
4. [frontend/app/page.tsx](frontend/app/page.tsx) stores the result in state and opens the modal.

That is the full path from user input to backend analysis output for the password `123`.

## BFS Queue Flow Summary for `123`
The main queue flow is:

- Start queue: `[start]`
- After first pop: `[1, 2, 3]`
- After level 2 expansion: `[11, 12, 13, 21, 22, 23, 31, 32, 33]`
- After level 3 expansion: `[111, 112, 113, 121, 122, 123, 131, 132, 133, 211, 212, 213]`
- Target found at step 19 when `123` is popped

This is the same BFS structure shown in the queue flow visualization.