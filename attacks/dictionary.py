"""Dictionary-based password lookup for realistic weakness detection."""

from pathlib import Path


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "common_passwords.txt"


def load_common_passwords() -> list[str]:
	if not DATA_FILE.exists():
		return []

	with DATA_FILE.open("r", encoding="utf-8") as handle:
		return [line.strip() for line in handle if line.strip()]


def check_dictionary_password(password: str) -> dict[str, object]:
	common_passwords = load_common_passwords()
	lowered_password = password.strip().lower()

	for index, candidate in enumerate(common_passwords, start=1):
		if lowered_password == candidate.lower():
			return {
				"found": True,
				"attempts": index,
				"time_seconds": 0.0,
				"strength": "Very Weak",
			}

	return {
		"found": False,
		"attempts": 0,
		"time_seconds": None,
		"strength": None,
	}
