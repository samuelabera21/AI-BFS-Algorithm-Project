# AI-Based Password Security Analyzer

## Introduction
The AI-Based Password Security Analyzer is a web-based learning system that evaluates password strength, estimates how hard a password may be to crack, and explains the result in a visual and easy-to-understand way. It combines a Python analysis engine with a Next.js frontend so a user can enter a password and instantly see feedback, risk signals, and search visualizations.

The goal of the project is not only to say whether a password is weak or strong, but also to explain why. That makes the system useful for both security awareness and algorithm demonstration.

## Problem
Many people still create passwords that are short, common, predictable, or built from simple patterns such as names, dates, repeated numbers, or keyboard sequences. These passwords are easy to guess or crack, but users often do not get a clear explanation of the risk.

This project addresses that problem by:
- giving users a quick password check,
- explaining the reason behind the result,
- showing how dictionary checks, pattern detection, and brute-force style analysis work,
- and demonstrating queue-based search behavior in a visual way.

## General Overview of the System
The system has three main parts:

1. Python analysis engine
   - This is the core logic of the application.
   - It checks patterns, dictionary matches, brute-force possibilities, and estimated crack time.

2. API bridge
   - This file connects the frontend to the Python backend.
   - It sends the password to the analyzer and returns the result as JSON.

3. Next.js frontend
   - This is the user interface.
   - It displays the password result, improvement suggestions, queue flow view, and BFS graph view.

### Simple flow
User enters password -> frontend sends the request -> Python analyzer processes it -> API bridge returns JSON -> frontend displays the analysis.

## How the System Works
When a user submits a password, the system performs several analysis steps:

- It checks password length and character variety.
- It looks for common weaknesses such as repeated characters, sequences, and simple patterns.
- It checks whether the password exists in a list of common passwords.
- It estimates how many guesses may be needed to crack it.
- It simulates BFS-style search behavior to show queue movement and exploration depth.
- It generates suggestions to help improve password strength.

The frontend presents this information in a readable format using result cards, feedback messages, queue flow pages, and a BFS graph page.




## System Analysis Walkthrough Using `123`
This section shows the exact flow from the moment a user enters the password `123` until the final result appears on the screen.

### 1. First file called from the user input
The first file used on the main screen is [frontend/app/page.tsx](frontend/app/page.tsx).

Inside this file, the `handleAnalyze()` function calls `analyzeInput(password, true)`.

### 2. What happens inside [frontend/app/page.tsx](frontend/app/page.tsx)
The `analyzeInput()` function does the following:
- trims the entered password,
- sends a `POST` request to `/api/analyze`,
- waits for the response,
- stores the returned analysis data,
- and opens the result modal.

For the password `123`, this is the first user-facing step.

### 3. Second file called: [frontend/app/api/analyze/route.ts](frontend/app/api/analyze/route.ts)
This file receives the request from the frontend.

Its `POST()` function:
- reads the JSON body,
- extracts the password,
- checks that the password is not empty,
- and then calls `getBackendAnalysis(password)` from [frontend/lib/backend.ts](frontend/lib/backend.ts).

### 4. Third file called: [frontend/lib/backend.ts](frontend/lib/backend.ts)
This file is the bridge between Next.js and Python.

Its `getBackendAnalysis(password)` function:
- builds the path to `api_bridge.py`,
- creates the Python command arguments,
- runs `python api_bridge.py --password 123 --bfs-depth 4 --bfs-char-limit 6`,
- waits for the Python output,
- and parses the JSON result.

### 5. Fourth file called: [api_bridge.py](api_bridge.py)
This file is the Python entry point used by the frontend.

Its flow is:
1. `main()` reads the command-line arguments.
2. `main()` calls `build_payload(password, bfs_depth, bfs_char_limit)`.
3. `build_payload()` calls `analyze_password()` from [analyzer/estimator.py](analyzer/estimator.py).
4. `build_payload()` also adds extra UI fields such as `password_length`, `charset_size`, `guesses_per_second`, and BFS trace data.
5. `main()` prints the final JSON to the terminal.

### 6. Fifth file called: [analyzer/estimator.py](analyzer/estimator.py)
This file performs the main password analysis.

For `123`, the function `analyze_password()` runs in this order:

1. `estimate_crack_time(password)`
   - calculates the search space size,
   - estimates the time to crack,
   - and returns `combinations`, `time_seconds`, and `attempts`.

2. `check_dictionary_password(password)` from [attacks/dictionary.py](attacks/dictionary.py)
   - checks whether `123` exists in the common-password list,
   - for this example, it does not match.

3. `detect_weaknesses(password)` from [analyzer/patterns.py](analyzer/patterns.py)
   - checks repeated characters, sequences, and common substitutions,
   - for `123`, it does not find a pattern warning in this version of the code.

4. `run_bfs_prefix_search(...)` from [attacks/brute_force.py](attacks/brute_force.py)
   - builds the BFS queue trace,
   - records visited nodes, levels, and queue snapshots,
   - and stops when the target prefix is found.

5. `simulate_search_strategy(password, max_depth=3)`
   - creates a small safe preview of BFS expansion for UI display.

6. `build_feedback(password, weaknesses, dictionary_result["found"])`
   - creates improvement suggestions for the user.

After that, `analyze_password()` returns a `PasswordAnalysis` object.

### 7. Math steps for `123`
The math for the password `123` is simple and clear:

- Password length = 3
- Character set type = digits only
- Charset size = 10
- Combinations = $10^3 = 1000$
- Guess rate = $1{,}000{,}000{,}000$ guesses per second
- Estimated time = $1000 \div 1{,}000{,}000{,}000 = 0.000001$ seconds

So the system classifies `123` as **Weak** because the estimated cracking time is less than 1 second.

The JSON result for this example also shows:
- `dictionary_match = false`
- `strength = Weak`
- `suggestions = ["Increase password length", "Add symbols"]`

### 8. BFS queue flow for `123`
The BFS section uses the password characters themselves as the alphabet.

For `123`, the BFS alphabet is:
- `1`
- `2`
- `3`

So the branching factor is 3.

The target prefix is `123`, because the BFS search compares against the first 4 characters of the password, and here the whole password is only 3 characters long.

#### BFS queue steps
The queue begins with the start node:
- Queue = `[start]`

Step 1:
- Pop `start`
- Enqueue `1`, `2`, `3`
- Queue becomes `[1, 2, 3]`

Step 2:
- Pop `1`
- Enqueue `11`, `12`, `13`

Step 3:
- Pop `2`
- Enqueue `21`, `22`, `23`

Step 4:
- Pop `3`
- Enqueue `31`, `32`, `33`

Step 5:
- Pop `11`
- Enqueue `111`, `112`, `113`

Step 6:
- Pop `12`
- Enqueue `121`, `122`, `123`

Step 7:
- Pop `13`
- Enqueue `131`, `132`, `133`

Step 8:
- Pop `21`
- Enqueue `211`, `212`, `213`

Step 9:
- Pop `22`
- Enqueue `221`, `222`, `223`

Step 10:
- Pop `23`
- Enqueue `231`, `232`, `233`

Step 11:
- Pop `31`
- Enqueue `311`, `312`, `313`

Step 12:
- Pop `32`
- Enqueue `321`, `322`, `323`

Step 13:
- Pop `33`
- Enqueue `331`, `332`, `333`

Step 14:
- Pop `111`
- Enqueue `1111`, `1112`, `1113`

Step 15:
- Pop `112`
- Enqueue `1121`, `1122`, `1123`

Step 16:
- Pop `113`
- Enqueue `1131`, `1132`, `1133`

Step 17:
- Pop `121`
- Enqueue `1211`, `1212`, `1213`

Step 18:
- Pop `122`
- Enqueue `1221`, `1222`, `1223`

Step 19:
- Pop `123`
- Target found
- Search stops

### 9. Queue snapshots shown by the backend
The backend also saves queue snapshots by level:

- Level 0: `[start]`
- Level 1: `[1, 2, 3]`
- Level 2: `[11, 12, 13, 21, 22, 23, 31, 32, 33]`
- Level 3: `[111, 112, 113, 121, 122, 123, 131, 132, 133, 211, 212, 213]`

These snapshots are what the queue flow page and BFS graph page can display as visual learning material.

### 10. Final result returned to the frontend
After Python finishes, the JSON result goes back in this order:

1. `api_bridge.py` prints JSON.
2. `frontend/lib/backend.ts` reads and parses the JSON.
3. `frontend/app/api/analyze/route.ts` returns the JSON response.
4. `frontend/app/page.tsx` stores the result in state and opens the modal.

That is the full analysis path for the password `123`.

## Algorithm and Queue Flow
The algorithm section explains the internal logic of the analyzer, including how the system evaluates password characteristics and how the search process moves through different states.

You can insert your algorithm image here later:

![Algorithm Diagram Placeholder](images/algorithm-diagram.png)

The queue flow section shows how nodes are processed step by step during BFS. It helps the audience understand how the queue changes after each pop and enqueue operation.

You can insert your queue flow image here later:

![Queue Flow Placeholder](images/queue-flow.png)

## Real-World Use
This project solves a real-world security awareness problem by helping users understand password risk before they use a password in an account.

It is useful because it:
- warns users about weak passwords before they are reused online,
- helps people create stronger passwords with clear suggestions,
- teaches brute force, dictionary attacks, and search-based analysis,
- and makes a technical topic easier to understand through visuals and simple language.

In real-world use, this kind of tool can improve password habits and strengthen digital safety awareness.

## Who Can Use It
This system can be used by several groups:

- Students: to learn about password security, BFS, and queue behavior.
- Teachers and lecturers: to demonstrate search algorithms and cybersecurity concepts.
- Developers: to test password validation ideas or build security awareness features.
- Security learners: to understand how password strength analysis works.
- General users: to check whether a password is too weak or too common.

## Where It Can Be Used
This project can be used in many settings:

- Class presentations and university projects
- Cybersecurity lessons and lab demos
- Developer workshops and coding demonstrations
- Personal password awareness checks
- Web-based learning platforms
- Internal awareness tools for teams and small organizations

## Conclusion
The AI-Based Password Security Analyzer is a practical and educational system that combines password checking, search simulation, and visual explanation in one application. It does more than label a password as weak or strong. It explains the reason, shows the process, and helps users learn how to create better passwords.

This makes the project valuable both as a security tool and as a learning tool. It is simple enough for general users, but detailed enough for student presentations and technical demonstrations.

## Presentation Closing
In summary, this project helps users understand password security in a clear, visual, and practical way. It shows how analysis, queue flow, and BFS visualization can be applied to a real cybersecurity problem.
