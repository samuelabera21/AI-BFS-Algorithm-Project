

Key pieces (concise, line-by-line intent)

- Imports:
  - `matplotlib.pyplot as plt`, `networkx as nx` — plotting and graph structures.
  - `detect_charset_size`, `run_bfs_prefix_search` from `attacks.brute_force` — reuse BFS and charset detection logic.

- _build_workflow_graph(report):
  - Builds a directed graph of the analysis steps (`input`, `charset`, `dictionary`, `patterns`, `estimate`, `strength`, `feedback`).
  - Computes `charset_size = detect_charset_size(report.password)`.
  - Creates nodes with readable multiline labels (e.g., `Input\n{password}`, `Detect charset\nsize = {n}`).
  - Adds edges between consecutive workflow nodes.
  - Returns `(graph, positions, labels)` where `positions` is a hard-coded layout dict and `labels` map node ids → display text.

- _build_bfs_tree_from_trace(report):
  - Calls `run_bfs_prefix_search(...)` with `report` parameters to generate BFS trace (edges, depth_by_prefix, visited order, queue snapshots, found flag/target).
  - Builds a directed graph from `bfs_result["edges"]`.
  - Ensures root node `""` exists.
  - Computes node `positions` using `depth` as x and per-level index (negative) as y so nodes at same depth stack vertically.
  - Prepares `labels` (prefix or "start"), determines `found_node` (target prefix if found), and returns `(graph, positions, labels, {found_node}, visited_order, queue_snapshots)`.

- _draw_nodes(graph, positions, labels, ax, title, node_color, highlight_nodes=None):
  - Compose node color list, highlighting any nodes in `highlight_nodes`.
  - Draw nodes, edges, and labels on the given Axes with consistent styling.
  - Turn off axis ticks and set panel title.

- visualize_analysis_workflow(report):
  - Calls the two builders to get workflow and BFS graphs + metadata.
  - Builds `queue_text` showing queue snapshots per level (string shown in plot).
  - Creates a 1x2 subplot figure and draws:
    - Left: workflow graph.
    - Right: BFS tree with `found_nodes` highlighted.
  - Adds level labels above the BFS plot and places the queue snapshot box at the side.
  - Sets a suptitle including `report.password` and number of BFS visits, calls `plt.show()`.

Notes / behavior implications
- BFS layout: x = depth, y = negative index → readable left-to-right depth progression with stacked nodes per level.
- Highlighting: found target prefix is emphasized via different node color.
- The visualization is synchronous (blocks on `plt.show()`), intended for manual/local inspection — not for server-side rendering.
- Depends on `report` having attributes: `password`, `bfs_max_depth`, `bfs_char_limit`, `dictionary_match`, `weaknesses`, `combinations`, `strength`, `suggestions`.

