"""CLI controller for the AI-Based Password Security Analyzer."""

from __future__ import annotations

import sys

from analyzer.estimator import analyze_password
from utils.helpers import format_analysis_report, parse_passwords_input
from visualization.graph import visualize_analysis_workflow


DEFAULT_BFS_CHAR_LIMIT = 6
DEFAULT_BFS_DEPTH = 4


def _parse_int_option(args: list[str], prefix: str, default: int) -> int:
    for item in args:
        if item.startswith(prefix):
            value = item.split("=", 1)[1].strip()
            if value.isdigit():
                return int(value)
    return default


def main() -> None:
    print("AI-Based Password Security Analyzer (Ethical Attack Simulator)")
    print("This tool simulates password analysis and safe search visualizations only.\n")

    cli_args = [argument for argument in sys.argv[1:] if not argument.startswith("--")]
    raw_passwords = " ".join(cli_args).strip() if cli_args else input(
        "Enter one password or multiple passwords separated by commas: "
    ).strip()
    passwords = parse_passwords_input(raw_passwords)

    if not passwords:
        print("No password provided.")
        return

    visualize = "--visualize" in sys.argv[1:]
    if not cli_args:
        visualize_choice = input("Show visualization? [y/N]: ").strip().lower()
        visualize = visualize_choice in {"y", "yes"}
    bfs_char_limit = _parse_int_option(sys.argv[1:], "--bfs-char-limit=", DEFAULT_BFS_CHAR_LIMIT)
    bfs_depth = _parse_int_option(sys.argv[1:], "--bfs-depth=", DEFAULT_BFS_DEPTH)

    reports = [
        analyze_password(password, bfs_max_depth=bfs_depth, bfs_char_limit=bfs_char_limit)
        for password in passwords
    ]

    if visualize:
        visualize_analysis_workflow(reports[0])

    if len(reports) == 1:
        print(format_analysis_report(reports[0]))
        return

    print("\nComparison Summary\n" + "=" * 18)
    for report in reports:
        print(format_analysis_report(report))


if __name__ == "__main__":
    main()