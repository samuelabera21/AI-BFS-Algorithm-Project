"""Password strength classification rules."""


def classify_strength(time_to_crack_seconds: float) -> str:
	if time_to_crack_seconds < 1:
		return "Weak"
	if time_to_crack_seconds < 3600:
		return "Medium"
	if time_to_crack_seconds < 86400 * 365:
		return "Strong"
	return "Very Strong"
