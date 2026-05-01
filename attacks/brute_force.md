

Big picture first:
- This file does not crack real passwords.
- It simulates search behavior for learning/visualization.
- It also computes basic estimate numbers (charset size, combinations).

## 1) `CHARSET_SIZES = {...}`

What it is:
- A dictionary (key-value map) that says:
  - lowercase letters = 26
  - uppercase letters = 26
  - digits = 10
  - symbols = 32

Why:
- Used to estimate how many characters are possible for a password.

---

## 2) `detect_charset_size(password: str) -> int`

Purpose:
- Detects which character groups appear in password.
- Returns total character set size used for estimation.

Line by line:
- `charset_size = 0`
  - Start counter at zero.
- `if any(char.islower() for char in password):`
  - Check if password has at least one lowercase letter.
- `charset_size += CHARSET_SIZES["lowercase"]`
  - If yes, add 26.
- `if any(char.isupper() for char in password):`
  - Check if at least one uppercase letter exists.
- `charset_size += CHARSET_SIZES["uppercase"]`
  - If yes, add 26.
- `if any(char.isdigit() for char in password):`
  - Check if at least one digit exists.
- `charset_size += CHARSET_SIZES["digits"]`
  - If yes, add 10.
- `if any(not char.isalnum() for char in password):`
  - Check if any symbol exists (not letter or number).
- `charset_size += CHARSET_SIZES["symbols"]`
  - If yes, add 32.
- `return charset_size or CHARSET_SIZES["lowercase"]`
  - Return total.
  - If total is 0 (empty password), fallback to 26.

Example:
- password `1997` -> digits only -> returns `10`.
- password `Ab@1` -> upper + lower + symbol + digit -> `26+26+32+10 = 94`.

---

## 3) `estimate_attempts(password: str) -> int`

Purpose:
- Estimate total brute-force combinations.

Line by line:
- `charset_size = detect_charset_size(password)`
  - Get possible characters count.
- `return charset_size ** len(password)`
  - Calculate combinations = charset_size ^ length.

Example:
- `1997`: charset 10, length 4 -> `10^4 = 10000`.

---

## 4) `simulate_search_strategy(password: str, max_depth: int = 3) -> tuple[str, list[str]]`

Purpose:
- Create a small BFS preview list (max 12 items).
- Educational only.

Line by line:
- `alphabet = sorted(set(password[:3] or "abc"))`
  - Take first 3 chars of password.
  - Remove duplicates using `set`.
  - Sort them.
  - If empty password, use `"abc"` fallback.
- `queue = deque([""])`
  - Start BFS queue with root empty string.
- `preview = []`
  - Store generated candidates.

- `while queue and len(preview) < 12:`
  - Continue while queue has items and preview has fewer than 12 candidates.
- `current = queue.popleft()`
  - Pop front item (BFS behavior).
- `if len(current) >= max_depth: continue`
  - Stop expanding this node if depth reached.

- `for char in alphabet:`
  - Try each alphabet char as next child.
- `candidate = current + char`
  - Build child string.
- `preview.append(candidate)`
  - Save in preview output.
- `queue.append(candidate)`
  - Push child to BFS queue.
- `if len(preview) >= 12: break`
  - Stop once preview has 12 items.

- `return "BFS", preview`
  - Return strategy name + preview list.

---

## 5) `simulate_depth_first_preview(password: str, max_depth: int = 3) -> tuple[str, list[str]]`

Purpose:
- Similar to above, but DFS style (recursive).

Line by line:
- `alphabet = sorted(set(password[:3] or "abc"))`
  - Same alphabet logic.
- `preview = []`
  - Output list.

Inner function:
- `def dfs(current: str, depth: int) -> None:`
  - Recursive helper.
- `if len(preview) >= 12 or depth >= max_depth: return`
  - Stop condition.
- `for char in alphabet:`
  - Try each child.
- `candidate = current + char`
  - Build next string.
- `preview.append(candidate)`
  - Save candidate.
- `dfs(candidate, depth + 1)`
  - Go deeper first (DFS style).

After defining:
- `dfs("", 0)`
  - Start at root.
- `return "DFS", preview`
  - Return strategy name + preview list.

---

## 6) `_first_unique_chars(password: str, char_limit: int) -> list[str]`

Purpose:
- Get unique characters from password in original order.
- Stop when reaching char_limit.

Line by line:
- `chars = []`
  - Start empty result list.
- `for char in password:`
  - Read each character in order.
- `if char not in chars: chars.append(char)`
  - Add only first occurrence.
- `if len(chars) >= char_limit: break`
  - Stop if limit reached.
- `return chars`

Example:
- password `1997`, limit 6 -> `["1","9","7"]`
- password `aabbcc`, limit 2 -> `["a","b"]`

---

## 7) `_display_prefix(prefix: str) -> str`

Purpose:
- Better label for UI.

Line by line:
- `return "start" if prefix == "" else prefix`
  - Empty root shown as `"start"` instead of blank.

---

## 8) `run_bfs_prefix_search(password: str, max_depth: int = 4, char_limit: int = 6) -> dict[str, object]`

This is the core BFS function used by your queue-flow and bfs-graph pages.

### 8.1 Early return for empty password
- `if not password: return {...}`
  - If password is empty, return safe default structure.
  - Includes fields like `found`, `visited_nodes`, `levels`, `steps`, etc.

### 8.2 Normalize limits and setup
- `max_depth = max(1, min(max_depth, 6))`
  - Force depth range to 1..6.
- `char_limit = max(2, min(char_limit, 10))`
  - Force char limit range to 2..10.
- `target_prefix = password[:max_depth]`
  - Target BFS should find.
- `alphabet = _first_unique_chars(password, char_limit)`
  - Build alphabet from password unique chars.
- `if not alphabet: alphabet = ["a"]`
  - Safety fallback.

### 8.3 Create BFS state variables
- `queue = deque([""])`
  - BFS queue starts at root.
- `edges = []`
  - Graph edges list `(parent, child)`.
- `depth_by_prefix = {"": 0}`
  - Track depth per node.
- `visited_order = []`
  - Record pop order.
- `queue_snapshots = {}`
  - Queue view per depth.
- `levels = {0: ["start"]}`
  - Nodes grouped by level.
- `steps = []`
  - Detailed step table for UI.
- `step_counter = 1`
  - Step numbering starts at 1.
- `found_prefix = ""`
  - Empty until found.

### 8.4 BFS level loop
- `for depth in range(0, max_depth + 1):`
  - Process each depth level.
- `if not queue: break`
  - Stop if queue empty.
- `queue_snapshots[depth] = ...`
  - Save first 12 queue items for this depth.
- `level_size = len(queue)`
  - Number of nodes at this level (important BFS rule).

### 8.5 Process each node in current level
- `for _ in range(level_size):`
  - Ensures only current level nodes are processed now.
- `current = queue.popleft()`
  - Pop front node.
- `visited_order.append(current)`
  - Save visit order.
- `enqueued = []`
  - Track children added this step.

### 8.6 Found check
- `if current == target_prefix:`
  - Target found.
- Append step with `enqueued: []` and queue head.
- `found_prefix = current`
  - Mark found.
- `queue.clear()`
  - Stop future processing.
- `break`
  - Break level loop.

### 8.7 Max depth node check
- `if len(current) >= max_depth:`
  - If node already max depth, do not expand.
- Append step with no enqueued children.
- `step_counter += 1`
- `continue`

### 8.8 Expand children
- `for char in alphabet:`
  - For each alphabet char:
- `child = current + char`
  - Build child node.
- `edges.append((current, child))`
  - Save graph edge.
- `depth_by_prefix[child] = len(child)`
  - Save child depth.
- `child_depth = len(child)`
- `if child_depth not in levels: levels[child_depth] = []`
  - Ensure level bucket exists.
- `levels[child_depth].append(child)`
  - Add child to level list.
- `enqueued.append(child)`
  - Record for step log.
- `queue.append(child)`
  - Add to BFS queue.

### 8.9 Save one step log
- Append dictionary:
  - `step`
  - `depth`
  - `popped`
  - `enqueued` (first 8 for UI brevity)
  - `queue_head` (first 8 after update)
- `step_counter += 1`

### 8.10 Stop if found
- `if found_prefix: break`
  - End outer depth loop once found.

### 8.11 Final return
Returns one big dictionary with:
- `found`
- `visited_nodes`
- `depth_found`
- `target_prefix`
- `branching_factor`
- `alphabet`
- `edges`
- `depth_by_prefix`
- `visited_order`
- `queue_snapshots`
- `levels`
- `steps` (capped to 120 entries)
- `found_prefix`

---

## 9) `bfs_search_for_prefix(password: str, max_depth: int | None = None)`

Purpose:
- Backward-compatible wrapper.
- Older code can still call this name.

Line by line:
- `depth = max_depth if max_depth is not None else 4`
  - Use provided depth, else default 4.
- `return run_bfs_prefix_search(password=password, max_depth=depth, char_limit=6)`
  - Forward call to new main BFS function.

---

## Quick summary in one sentence per function

- `detect_charset_size`: decides total character pool size.
- `estimate_attempts`: computes combinations count.
- `simulate_search_strategy`: tiny BFS demo preview.
- `simulate_depth_first_preview`: tiny DFS demo preview.
- `_first_unique_chars`: gets unique chars in order.
- `_display_prefix`: replaces empty prefix with `"start"`.
- `run_bfs_prefix_search`: full BFS trace generator for UI.
- `bfs_search_for_prefix`: compatibility wrapper.

