"""Weakness pattern detection for educational password analysis."""

import re


COMMON_SUBSTITUTIONS = {
	"@": "a",
	"0": "o",
	"1": "i",
	"3": "e",
	"4": "a",
	"$": "s",
	"5": "s",
	"7": "t",
}


def _has_sequence(password: str) -> bool:
	lowered = password.lower()
	sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789"]
	for sequence in sequences:
		for start in range(len(sequence) - 3):
			fragment = sequence[start : start + 4]
			if fragment in lowered:
				return True
	return False


def _has_repetition(password: str) -> bool:
	return bool(re.search(r"(.)\1{3,}", password))


def _has_common_substitution(password: str) -> bool:
	normalized = "".join(COMMON_SUBSTITUTIONS.get(char, char).lower() for char in password)
	patterns = ["password", "admin", "welcome", "qwerty", "letmein"]
	return any(word in normalized for word in patterns)


def detect_weaknesses(password: str) -> list[str]:
	weaknesses = []

	if _has_sequence(password):
		weaknesses.append("Sequential pattern detected")

	if _has_repetition(password):
		weaknesses.append("Repeated characters detected")

	if _has_common_substitution(password):
		weaknesses.append("Common substitutions detected")

	return weaknesses
