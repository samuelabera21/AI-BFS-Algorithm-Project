I’m going to map the workspace by folder and then give you the exact learning order so you can understand the app without jumping around.

Starting: *Map workspace folder roles* (1/3)

Here is the overall map of your workspace, in the order I’d understand it.

Your app has two main parts:

1. Frontend in frontend
2. Python analysis engine in analyzer, attacks, api_bridge.py, and main.py

How each folder/file is used

- frontend
  - This is the user interface part.
  - It shows the pages, buttons, charts, queue flow, and BFS graph.
  - It sends the password to the backend and displays the result.

- frontend/app
  - This is where the pages live.
  - page.tsx is the home page.
  - analysis/page.tsx shows the mathematical strength analysis.
  - queue-flow/page.tsx shows the BFS queue trace step by step.
  - bfs-graph/page.tsx shows the BFS level graph.
  - api/analyze/route.ts is an API route for backend-style requests.

- frontend/components
  - Reusable UI parts.
  - ChoiceCards.tsx helps the home page show options.
  - QueueViewer.tsx renders the queue trace table and explanation.

- frontend/lib
  - Helper code for the frontend.
  - backend.ts runs the Python backend and reads the JSON result.
  - analyzer.ts and types.ts help with data formatting and shared types.

- analyzer
  - This is the Python analysis logic.
  - estimator.py is the main brain for password scoring and crack-time math.
  - patterns.py checks for weak patterns like repeats and sequences.
  - strength.py decides whether the password is Weak, Medium, Strong, etc.

- attacks
  - This contains safe simulation logic for educational search behavior.
  - brute_force.py builds the BFS prefix tree and queue flow.
  - dictionary.py checks common-password matches.

- visualization
  - This is for graph-related display or export logic.
  - graph.py likely builds visual output from the analysis data.

- data
  - Static data files used by the Python side.
  - common_passwords.txt is the dictionary list for weak password checking.

- utils
  - Small helper functions shared by Python code.

- api_bridge.py
  - The bridge between frontend and Python.
  - It runs the analysis and prints JSON for the frontend to read.

- main.py
  - Command-line entry point for running the Python analyzer directly.

- requirements.txt
  - Python package list for installation.

- libraries.md
  - Human-readable explanation of the libraries and why they exist.

- requirement.ts
  - You removed this already, and that was fine because it was only a note file, not part of the app.

The real flow of the app is:

1. User enters password in frontend.
2. Frontend calls backend.ts.
3. backend.ts runs api_bridge.py.
4. api_bridge.py calls analyzer.estimator.py.
5. estimator.py calls the weakness, strength, dictionary, and BFS logic.
6. The result comes back as JSON.
7. Frontend displays it in the analysis, queue-flow, and BFS graph pages.

The best next step to understand the app clearly is this exact order:

1. backend.ts
2. api_bridge.py
3. estimator.py
4. brute_force.py
5. patterns.py
6. strength.py

