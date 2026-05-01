"""Utility helpers for formatting and input normalization."""


def parse_passwords_input(raw_value: str) -> list[str]:
	if not raw_value:
		return []
	return [password.strip() for password in raw_value.split(",") if password.strip()]


def format_number(value: int | float) -> str:
	if isinstance(value, float):
		value = int(round(value))

	magnitude_labels = [
		(1_000_000_000_000, "trillion"),
		(1_000_000_000, "billion"),
		(1_000_000, "million"),
		(1_000, "thousand"),
	]

	for threshold, label in magnitude_labels:
		if value >= threshold:
			amount = value / threshold
			if amount >= 100:
				return f"{amount:.0f} {label}"
			if amount >= 10:
				return f"{amount:.1f} {label}"
			return f"{amount:.2f} {label}"

	return f"{value:,}"


def format_seconds(seconds: float) -> str:
	if seconds <= 0:
		return "near 0"

	minute = 60
	hour = 60 * minute
	day = 24 * hour
	year = 365 * day

	if seconds < minute:
		return f"{seconds:.2f} seconds"
	if seconds < hour:
		return f"{seconds / minute:.2f} minutes"
	if seconds < day:
		return f"{seconds / hour:.2f} hours"
	if seconds < year:
		return f"{seconds / day:.2f} days"
	return f"{seconds / year:.2f} years"


def format_analysis_report(report) -> str:
	weaknesses = report.weaknesses or ["No obvious pattern detected"]
	suggestions = report.suggestions or ["Add randomness"]

	lines = [
		"",
		f"Password: {report.password}",
		"",
		f"Strength: {report.strength}",
		f"Estimated Crack Time: {format_seconds(report.estimated_time_seconds)}",
		f"Attempts: {format_number(report.estimated_attempts)}",
		"",
		"Weaknesses:",
	]

	lines.extend(f"- {item}" for item in weaknesses)
	lines.append("")
	lines.append("Suggestions:")
	lines.extend(f"- {item}" for item in suggestions)

	if report.dictionary_match:
		lines.append("")
		lines.append(f"Dictionary Match: found at position {report.dictionary_rank}")

	lines.append("")
	lines.append(f"Simulation Strategy: {report.search_strategy}")
	lines.append(f"BFS Nodes Visited: {report.bfs_nodes_visited}")
	if report.bfs_target_prefix:
		lines.append(f"BFS Target Prefix: {report.bfs_target_prefix}")
		lines.append(f"BFS Depth Found: {report.bfs_depth_found}")

	return "\n".join(lines)
