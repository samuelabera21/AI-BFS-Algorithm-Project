"""Password analysis orchestration and mathematical crack-time estimation."""

from dataclasses import dataclass, field
from typing import List

from analyzer.patterns import detect_weaknesses
from analyzer.strength import classify_strength
from attacks.dictionary import check_dictionary_password
from attacks.brute_force import run_bfs_prefix_search, estimate_attempts, simulate_search_strategy


GUESS_RATE = 1_000_000_000
# # Yes, but only in some scenarios.

# 1,000,000,000 guesses per second is not realistic for a normal online login system. It is much too fast for a web app, because real systems have network delay, rate limits, lockouts, and sometimes MFA. For online guessing, the effective rate is usually far lower.

# It can be plausible only in offline attack simulations, where an attacker already has a password hash and is testing guesses on powerful hardware like GPUs or specialized rigs. Even then, 1 billion per second is an aggressive assumption and depends heavily on:
# - hash type
# - hardware
# - password length
# - implementation quality

# So in your app, that number should be treated as an educational estimate, not a real-world universal speed. If you want the analysis to feel more realistic, I can help you change it to:
# 1. a lower default for normal users,
# 2. a configurable value,
# 3. or separate online vs offline estimate modes.

@dataclass
class PasswordAnalysis:
	password: str
	combinations: int
	estimated_attempts: int
	estimated_time_seconds: float
	strength: str
	bfs_max_depth: int = 4
	bfs_char_limit: int = 6
	bfs_branching_factor: int = 0
	bfs_alphabet: List[str] = field(default_factory=list)
	bfs_nodes_visited: int = 0
	bfs_depth_found: int = 0
	bfs_target_prefix: str = ""
	bfs_queue_snapshots: dict[int, List[str]] = field(default_factory=dict)
	weaknesses: List[str] = field(default_factory=list)
	suggestions: List[str] = field(default_factory=list)
	dictionary_match: bool = False
	dictionary_rank: int | None = None
	search_strategy: str = "BFS"
	search_preview: List[str] = field(default_factory=list)


def estimate_crack_time(password: str) -> tuple[int, float, int]:
	attempts = estimate_attempts(password)
	combinations = attempts
	time_seconds = combinations / GUESS_RATE if combinations else 0.0
	return combinations, time_seconds, attempts


def build_feedback(password: str, weaknesses: List[str], dictionary_match: bool) -> List[str]:
	suggestions = []

	if len(password) < 12:
		suggestions.append("Increase password length")
	if not any(char.isdigit() for char in password) or not any(not char.isalnum() for char in password):
		suggestions.append("Add symbols")
	if dictionary_match:
		suggestions.append("Avoid common words")
	if weaknesses:
		suggestions.append("Avoid sequences or repeated characters")

	if not suggestions:
		suggestions.append("Add randomness")

	return suggestions


def analyze_password(password: str, bfs_max_depth: int = 4, bfs_char_limit: int = 6) -> PasswordAnalysis:
	combinations, time_seconds, attempts = estimate_crack_time(password)
	
	
	dictionary_result = check_dictionary_password(password)
	weaknesses = detect_weaknesses(password)
	bfs_result = run_bfs_prefix_search(password=password, max_depth=bfs_max_depth, char_limit=bfs_char_limit)



	if dictionary_result["found"]:
		strength = "Very Weak"
		estimated_attempts = dictionary_result["attempts"]
		estimated_time_seconds = 0.0
	else:
		strength = classify_strength(time_seconds)
		estimated_attempts = attempts
		estimated_time_seconds = time_seconds

	search_strategy, search_preview = simulate_search_strategy(password, max_depth=3)
	suggestions = build_feedback(password, weaknesses, dictionary_result["found"])

	return PasswordAnalysis(
		password=password,
		combinations=combinations,
		estimated_attempts=estimated_attempts,
		estimated_time_seconds=estimated_time_seconds,
		strength=strength,
		bfs_max_depth=bfs_max_depth,
		bfs_char_limit=bfs_char_limit,
		bfs_branching_factor=bfs_result["branching_factor"],
		bfs_alphabet=bfs_result["alphabet"],
		bfs_nodes_visited=bfs_result["visited_nodes"],
		bfs_depth_found=bfs_result["depth_found"],
		bfs_target_prefix=bfs_result["target_prefix"],
		bfs_queue_snapshots=bfs_result["queue_snapshots"],
		weaknesses=weaknesses,
		suggestions=suggestions,
		dictionary_match=dictionary_result["found"],
		dictionary_rank=dictionary_result.get("attempts"),
		search_strategy=search_strategy,
		search_preview=search_preview,
	)
