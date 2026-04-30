

- colorama==0.4.6
  - Short: Small library that makes colored terminal text work the same on Windows and Unix.
  - Real-world use: Colorizes CLI output (errors in red, success in green), improving readability for command-line tools and logs.
  - Minimal example:
    ```python
    from colorama import init, Fore
    init()
    print(Fore.RED + "Error: something failed")
    ```
  - Why here: If any CLI utilities or scripts print colored progress or status messages (e.g., during a long analysis run) colorama ensures colors show correctly across platforms, especially Windows.

- contourpy==1.3.2
  - Short: A backend that computes contour lines/filled contours for plotting.
  - Real-world use: Libraries like Matplotlib delegate contour calculations (for heatmaps, topographic maps) to fast backends like contourpy.
  - Minimal idea: You don’t call contourpy directly in simple scripts; Matplotlib uses it when you call `plt.contour()` or `plt.contourf()`.
  - Why here: Keeps Matplotlib’s contour features working and performant when visualizing analytic surfaces or density maps.

- cycler==0.12.1
  - Short: Utility to cycle sequences of properties (colors, linestyles) when plotting multiple lines.
  - Real-world use: When plotting many lines, cycler lets Matplotlib iterate styles predictably (line 1 blue, line 2 orange, etc.).
  - Why here: Matplotlib depends on it; included automatically. It ensures consistent plot style behavior.

- fonttools==4.62.1
  - Short: Tools for reading and manipulating font files (TTF, OTF).
  - Real-world use: Inspecting or subsetting fonts, embedding fonts in images/PDFs, or fixing font metadata.
  - Why here: Matplotlib uses fonttools indirectly to read system fonts and render text labels correctly in figures.

- kiwisolver==1.5.0
  - Short: Small constraint solver library used by Matplotlib for layout tasks.
  - Real-world use: Solve simple layout constraints like "legend should be to the right, axis labels not overlapping".
  - Why here: Internal Matplotlib dependency to calculate text/legend/axis placements reliably.

- matplotlib==3.10.9
  - Short: Standard plotting library in Python for charts, images, and visualizations.
  - Real-world use: Create line charts, histograms, scatter plots, and save them to PNG/SVG for reports or UI images.
  - Example:
    ```python
    import matplotlib.pyplot as plt
    plt.plot([1,2,3],[4,5,6])
    plt.savefig('chart.png')
    ```
  - Why here: The project’s visualization tools (visualization/graph.py and any image exports) use Matplotlib to produce graphs that illustrate BFS levels or analysis results.

- networkx==3.4.2
  - Short: Library for creating, manipulating, and analyzing graph structures (nodes and edges).
  - Real-world use: Model networks (social graphs, dependency graphs), run traversal algorithms (BFS, DFS, shortest paths), compute centrality measures.
  - Example (BFS-like):
    ```python
    import networkx as nx
    G = nx.DiGraph()
    G.add_edge("", "1")
    G.add_edge("", "9")
    G.add_edge("", "7")
    list(nx.bfs_tree(G, ""))  # traversal
    ```
  - Why here: Useful to represent the prefix tree or BFS graph; it can help generate level lists, draw graphs, or compute graph metrics for visualization.

- numpy==2.2.6
  - Short: Fast arrays and numerical operations.
  - Real-world use: Fast vector/matrix math, used by almost every data and plotting library.
  - Example:
    ```python
    import numpy as np
    a = np.array([1,2,3])
    print(a * 2)  # [2,4,6]
    ```
  - Why here: Matplotlib, NetworkX, and other visualization code rely on NumPy for numeric arrays and efficient computations.

- packaging==26.0
  - Short: Utilities for parsing and comparing package versions and metadata.
  - Real-world use: Tools that inspect package versions or requirements use this to parse version strings (e.g., ">=3.10").
  - Why here: An indirect dependency used by pip and other tools; you normally don’t import it in application code.

- pillow==12.2.0
  - Short: Image processing library (PIL fork).
  - Real-world use: Read/write images, resize, convert formats, draw text or overlays on images.
  - Example:
    ```python
    from PIL import Image
    img = Image.open('chart.png')
    img.thumbnail((800, 600))
    img.save('chart_small.png')
    ```
  - Why here: Matplotlib can output images; Pillow helps post-process or combine images, or load background images for visualization.

- pyparsing==3.3.2
  - Short: Small parsing library to build text parsers.
  - Real-world use: Build simple domain-specific language parsers or parse complex strings; used indirectly by some tools.
  - Why here: Indirect dependency required by higher-level libraries; you usually don’t use it directly in this project.

- python-dateutil==2.9.0.post0
  - Short: Utilities for parsing and manipulating dates/times.
  - Real-world use: Parse timestamps in logs, compute relative dates, handle timezone-aware datetimes reliably.
  - Example:
    ```python
    from dateutil import parser
    dt = parser.parse("2026-04-28T20:00:00Z")
    ```
  - Why here: Helpful for timestamp formatting in logs or in saved visualization metadata.

- six==1.17.0
  - Short: Small compatibility library to smooth differences between Python 2 and 3.
  - Real-world use: Libraries supporting older Python versions used `six`. Today it’s mostly a harmless compatibility dependency.
  - Why here: Indirect dependency included because other packages still ship code that imports it. No active use required.

- tqdm==4.67.3
  - Short: Simple progress bar wrapper for loops.
  - Real-world use: Show progress for long-running loops in CLI tools (e.g., scanning passwords, generating many plots).
  - Example:
    ```python
    from tqdm import tqdm
    for i in tqdm(range(100000)):
        pass
    ```
  - Why here: Useful for any scripts or visualization tasks that process many items and want to display progress to the user.

- wheel==0.46.3
  - Short: Packaging format/tool used when building or installing Python packages.
  - Real-world use: Building installable wheels (`.whl`) for distribution; pip uses it to install many packages faster.
  - Why here: Runtime toolchain dependency; not used directly by app code.

- zxcvbn==4.5.0
  - Short: Password-strength estimator that applies human-friendly heuristics (useful rules from Dropbox’s zxcvbn).
  - Real-world use: Evaluate password guessability with rules for common patterns, dates, substitutions, and dictionary matches.
  - Example:
    ```python
    from zxcvbn import zxcvbn
    result = zxcvbn('1997')
    print(result['score'], result['crack_times_display'])
    ```
  - Why here: Can augment the project’s own estimator by providing another view of password strength and patterns; useful for comparisons and richer suggestions.

Notes and practical tips
- Many of these packages are indirect dependencies of Matplotlib and NetworkX; you rarely need to import `cycler`, `kiwisolver`, `pyparsing`, or `packaging` directly.
- For development you should install the full requirements.txt to match your working environment. For minimal runtime of just the core analysis logic (BFS tracing, simple math), you might only need Python standard library plus `zxcvbn` (if you use it) and `networkx` if you want graph utilities.
- To verify a specific package is available in your environment:
  ```bash
  python -c "import matplotlib, networkx, numpy, zxcvbn; print('OK')"
  ```

