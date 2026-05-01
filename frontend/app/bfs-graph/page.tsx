import Link from "next/link";
import { getBackendAnalysis } from "@/lib/backend";

export default async function BFSGraphPage({ searchParams }: { searchParams: { password?: string } }) {
  const password = (searchParams.password ?? "").trim();
  if (!password) {
    return (
      <main>
        <div className="card">
          <h1>BFS Clear Graph</h1>
          <p>No password provided. Go back and enter a password first.</p>
          <Link className="btn primary" href="/" style={{ marginTop: 12, display: "inline-block" }}>
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const result = await getBackendAnalysis(password);

  return (
    <main>
      <div className="card">
        <h1>BFS Clear Graph</h1>
        <p>
          Alphabet: <span className="mono">[{result.bfs.alphabet.join(", ")}]</span> | Branching factor: {result.bfs.branching_factor} |
          Target prefix: <span className="mono">{result.bfs.target_prefix}</span>
        </p>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>Level-by-Level Nodes (0 to 4)</h2>
        <div className="levels">
          {[0, 1, 2, 3, 4].map((level) => {
            const data = result.bfs.levels[String(level)] ?? [];
            return (
              <div className="level" key={level}>
                <h3>L{level}</h3>
                <p className="mono">
                  {level === 0 ? "start" : data.slice(0, 24).join(", ") || "-"}
                </p>
                <p style={{ marginTop: 8 }}>Count: {level === 0 ? 1 : data.length}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>Queue Snapshots</h3>
          {[0, 1, 2, 3, 4].map((level) => (
            <p key={level} className="mono" style={{ marginBottom: 6 }}>
              L{level}: {(result.bfs.queue_snapshots[String(level)] ?? []).join(", ") || "-"}
            </p>
          ))}
        </div>
        <div className="card">
          <h3>Search Result</h3>
          <p>BFS Nodes Visited: {result.bfs.visited_nodes}</p>
          <p>Depth Found: {result.bfs.depth_found}</p>
          <p>Target Prefix: {result.bfs.target_prefix}</p>
        </div>
      </section>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <Link className="btn" href={`/?password=${encodeURIComponent(password)}`}>
          Back to Home
        </Link>
        <Link className="btn" href={`/queue-flow?password=${encodeURIComponent(password)}`}>
          Open Queue Workflow
        </Link>
      </div>
    </main>
  );
}
