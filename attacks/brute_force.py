"""Safe brute-force simulation helpers used only for estimation and visualization."""

from collections import deque


CHARSET_SIZES = {
	"lowercase": 26,
	"uppercase": 26,
	"digits": 10,
	"symbols": 32,
}


def detect_charset_size(password: str) -> int:
	charset_size = 0
	if any(char.islower() for char in password):
		charset_size += CHARSET_SIZES["lowercase"]
	if any(char.isupper() for char in password):
		charset_size += CHARSET_SIZES["uppercase"]
	if any(char.isdigit() for char in password):
		charset_size += CHARSET_SIZES["digits"]
	if any(not char.isalnum() for char in password):
		charset_size += CHARSET_SIZES["symbols"]
	return charset_size or CHARSET_SIZES["lowercase"]


def estimate_attempts(password: str) -> int:
	charset_size = detect_charset_size(password)
	return charset_size ** len(password)


def simulate_search_strategy(password: str, max_depth: int = 3) -> tuple[str, list[str]]:
	"""Generate a tiny safe BFS preview; no real cracking is performed."""

	alphabet = sorted(set(password[:3] or "abc"))
	queue = deque([""])
	preview = []

	while queue and len(preview) < 12:
		current = queue.popleft()
		if len(current) >= max_depth:
			continue

		for char in alphabet:
			candidate = current + char
			preview.append(candidate)
			queue.append(candidate)
			if len(preview) >= 12:
				break

	return "BFS", preview


def simulate_depth_first_preview(password: str, max_depth: int = 3) -> tuple[str, list[str]]:
	alphabet = sorted(set(password[:3] or "abc"))
	preview = []

	def dfs(current: str, depth: int) -> None:
		if len(preview) >= 12 or depth >= max_depth:
			return
		for char in alphabet:
			candidate = current + char
			preview.append(candidate)
			dfs(candidate, depth + 1)

	dfs("", 0)
	return "DFS", preview


def _first_unique_chars(password: str, char_limit: int) -> list[str]:
	chars = []
	for char in password:
		if char not in chars:
			chars.append(char)
		if len(chars) >= char_limit:
			break
	return chars


def _display_prefix(prefix: str) -> str:
	return "start" if prefix == "" else prefix


def run_bfs_prefix_search(password: str, max_depth: int = 4, char_limit: int = 6) -> dict[str, object]:
	"""Run bounded BFS on prefixes derived from the real password characters.

	This is a safe educational search: it explores a small finite prefix tree and
	returns trace data for reporting and visualization.
	"""

	if not password:
		return {
			"found": False,
			"visited_nodes": 0,
			"depth_found": 0,
			"target_prefix": "",
			"branching_factor": 0,
			"alphabet": [],
			"edges": [],
			"depth_by_prefix": {"": 0},
			"visited_order": [],
			"queue_snapshots": {},
			"levels": {0: ["start"]},
			"steps": [],
			"found_prefix": "",
		}

	max_depth = max(1, min(max_depth, 6))
	char_limit = max(2, min(char_limit, 10))
	target_prefix = password[:max_depth]
	alphabet = _first_unique_chars(password, char_limit)
	if not alphabet:
		alphabet = ["a"]

	queue = deque([""])
	edges: list[tuple[str, str]] = []
	depth_by_prefix = {"": 0}
	visited_order: list[str] = []
	queue_snapshots: dict[int, list[str]] = {}
	levels: dict[int, list[str]] = {0: ["start"]}
	steps: list[dict[str, object]] = []
	step_counter = 1
	found_prefix = ""

	for depth in range(0, max_depth + 1):
		if not queue:
			break
		queue_snapshots[depth] = [_display_prefix(item) for item in list(queue)[:12]]
		level_size = len(queue)

		for _ in range(level_size):
			current = queue.popleft()
			visited_order.append(current)
			enqueued: list[str] = []

			if current == target_prefix:
				steps.append(
					{
						"step": step_counter,
						"depth": depth,
						"popped": _display_prefix(current),
						"enqueued": [],
						"queue_head": [_display_prefix(item) for item in list(queue)[:8]],
					}
				)
				found_prefix = current
				queue.clear()
				break

			if len(current) >= max_depth:
				steps.append(
					{
						"step": step_counter,
						"depth": depth,
						"popped": _display_prefix(current),
						"enqueued": [],
						"queue_head": [_display_prefix(item) for item in list(queue)[:8]],
					}
				)
				step_counter += 1
				continue

			for char in alphabet:
				child = current + char
				edges.append((current, child))
				depth_by_prefix[child] = len(child)
				child_depth = len(child)
				if child_depth not in levels:
					levels[child_depth] = []
				levels[child_depth].append(child)
				enqueued.append(child)
				queue.append(child)

			steps.append(
				{
					"step": step_counter,
					"depth": depth,
					"popped": _display_prefix(current),
					"enqueued": [_display_prefix(item) for item in enqueued[:8]],
					"queue_head": [_display_prefix(item) for item in list(queue)[:8]],
				}
			)
			step_counter += 1

		if found_prefix:
			break

	return {
		"found": found_prefix == target_prefix,
		"visited_nodes": max(len(visited_order) - 1, 0),
		"depth_found": len(found_prefix),
		"target_prefix": target_prefix,
		"branching_factor": len(alphabet),
		"alphabet": alphabet,
		"edges": edges,
		"depth_by_prefix": depth_by_prefix,
		"visited_order": [_display_prefix(item) for item in visited_order],
		"queue_snapshots": queue_snapshots,
		"levels": levels,
		"steps": steps[:120],
		"found_prefix": found_prefix,
	}


def bfs_search_for_prefix(password: str, max_depth: int | None = None) -> dict[str, object]:
	"""Backward-compatible wrapper used by existing analysis code paths."""

	depth = max_depth if max_depth is not None else 4
	return run_bfs_prefix_search(password=password, max_depth=depth, char_limit=6)
