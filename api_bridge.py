"""Backend bridge for frontend integration.

Runs the Python analyzer and prints JSON so the Next.js UI can display
backend-computed results.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from analyzer.estimator import GUESS_RATE, analyze_password
from attacks.brute_force import detect_charset_size, run_bfs_prefix_search


def build_payload(password: str, bfs_depth: int = 4, bfs_char_limit: int = 6) -> dict[str, object]:
    report = analyze_password(password, bfs_max_depth=bfs_depth, bfs_char_limit=bfs_char_limit)
    payload = asdict(report)

    # Preserve precision for UI by sending very large integers as strings.
    payload["combinations"] = str(payload["combinations"])
    payload["estimated_attempts"] = str(payload["estimated_attempts"])
    payload["password_length"] = len(password)
    payload["charset_size"] = detect_charset_size(password)
    payload["guesses_per_second"] = GUESS_RATE
    payload["bfs"] = run_bfs_prefix_search(password=password, max_depth=bfs_depth, char_limit=bfs_char_limit)
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Return password analysis JSON for frontend UI")
    parser.add_argument("--password", required=True, help="Password to analyze")
    parser.add_argument("--bfs-depth", type=int, default=4, help="BFS depth limit")
    parser.add_argument("--bfs-char-limit", type=int, default=6, help="BFS unique character limit")
    args = parser.parse_args()

    payload = build_payload(args.password, bfs_depth=args.bfs_depth, bfs_char_limit=args.bfs_char_limit)
    print(json.dumps(payload, ensure_ascii=True))


if __name__ == "__main__":
    main()
