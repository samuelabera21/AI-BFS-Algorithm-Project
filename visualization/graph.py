"""Data-driven visualizations for the password analysis workflow."""

import matplotlib.pyplot as plt
import networkx as nx

from attacks.brute_force import detect_charset_size
from attacks.brute_force import run_bfs_prefix_search


def _build_workflow_graph(report) -> tuple[nx.DiGraph, dict[str, tuple[float, float]], dict[str, str]]:
	graph = nx.DiGraph()
	charset_size = detect_charset_size(report.password)
	workflow_nodes = [
		("input", f"Input\n{report.password}"),
		("charset", f"Detect charset\nsize = {charset_size}"),
		("dictionary", f"Dictionary check\n{'found' if report.dictionary_match else 'not found'}"),
		("patterns", f"Pattern scan\n{len(report.weaknesses)} weakness(es)"),
		("estimate", f"Estimate space\n{report.combinations:,} combos"),
		("strength", f"Classify\n{report.strength}"),
		("feedback", f"Feedback\n{len(report.suggestions)} suggestion(s)"),
	]

	for left, right in zip(workflow_nodes, workflow_nodes[1:]):
		graph.add_edge(left[0], right[0])

	positions = {
		"input": (0.0, 0.0),
		"charset": (1.6, 0.0),
		"dictionary": (3.2, 0.45),
		"patterns": (3.2, -0.45),
		"estimate": (4.9, 0.0),
		"strength": (6.5, 0.0),
		"feedback": (8.0, 0.0),
	}

	labels = {node_id: label for node_id, label in workflow_nodes}
	return graph, positions, labels


def _build_bfs_tree_from_trace(report) -> tuple[nx.DiGraph, dict[str, tuple[float, float]], dict[str, str], set[str], list[str], dict[int, list[str]]]:
	bfs_result = run_bfs_prefix_search(
		password=report.password,
		max_depth=report.bfs_max_depth,
		char_limit=report.bfs_char_limit,
	)

	graph = nx.DiGraph()
	for parent, child in bfs_result["edges"]:
		graph.add_edge(parent, child)
	if "" not in graph:
		graph.add_node("")

	depth_by_prefix = bfs_result["depth_by_prefix"]
	positions = {}
	level_counts = {}
	for node_id, depth in depth_by_prefix.items():
		level_index = level_counts.get(depth, 0)
		level_counts[depth] = level_index + 1
		positions[node_id] = (float(depth), float(-level_index))

	labels = {prefix: ("start" if prefix == "" else prefix) for prefix in depth_by_prefix.keys()}
	found_node = bfs_result["target_prefix"] if bfs_result["found"] else ""

	return (
		graph,
		positions,
		labels,
		{found_node} if found_node else set(),
		bfs_result["visited_order"],
		bfs_result["queue_snapshots"],
	)


def _draw_nodes(graph: nx.DiGraph, positions: dict[str, tuple[float, float]], labels: dict[str, str], ax, title: str, node_color: str, highlight_nodes: set[str] | None = None) -> None:
	node_colors = []
	highlight_nodes = highlight_nodes or set()
	for node in graph.nodes:
		node_colors.append("#f7c6c7" if node in highlight_nodes else node_color)
	nx.draw_networkx_nodes(graph, positions, ax=ax, node_size=1500, node_color=node_colors, edgecolors="#2f4858", linewidths=1.0)
	nx.draw_networkx_edges(graph, positions, ax=ax, arrows=True, arrowstyle="-|>", arrowsize=14, width=1.4, alpha=0.75)
	nx.draw_networkx_labels(graph, positions, labels=labels, ax=ax, font_size=8)
	ax.set_title(title)
	ax.axis("off")


def visualize_analysis_workflow(report) -> None:
	workflow_graph, workflow_pos, workflow_labels = _build_workflow_graph(report)
	bfs_graph, bfs_pos, bfs_labels, found_nodes, visited_order, queue_snapshots = _build_bfs_tree_from_trace(report)

	max_level = max(report.bfs_max_depth, 0)
	queue_lines = [f"Level {level}: {', '.join(queue_snapshots.get(level, [])) or '[]'}" for level in range(0, max_level + 1)]
	queue_text = "Queue snapshots by level\n" + "\n".join(queue_lines)

	fig, axes = plt.subplots(1, 2, figsize=(18, 6))
	_draw_nodes(
		workflow_graph,
		workflow_pos,
		workflow_labels,
		axes[0],
		"Real Analysis Workflow",
		"#d9edf7",
	)
	_draw_nodes(
		bfs_graph,
		bfs_pos,
		bfs_labels,
		axes[1],
		"Real BFS Search Tree (Levels 0-4)",
		"#fce4d6",
		highlight_nodes=found_nodes,
	)

	for level in range(0, max_level + 1):
		axes[1].text(float(level), 1.0, f"L{level}", fontsize=9, ha="center", va="bottom", color="#2f4858")

	axes[1].text(
		1.02,
		0.5,
		queue_text,
		transform=axes[1].transAxes,
		fontsize=8,
		va="center",
		ha="left",
		bbox={"boxstyle": "round", "facecolor": "#f7f7f7", "edgecolor": "#2f4858"},
	)
	fig.suptitle(
		f"Password Analysis for '{report.password}' | BFS visits {max(len(visited_order) - 1, 0)} node(s)",
		fontsize=14,
	)
	plt.tight_layout()
	plt.show()
