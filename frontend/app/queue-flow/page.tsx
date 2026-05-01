import Link from "next/link";
import { getBackendAnalysis } from "@/lib/backend";
import dynamic from "next/dynamic";
const QueueViewer = dynamic(() => import("@/components/QueueViewer"), { ssr: false });

function QueueTokens({ items, emptyLabel = "-" }: { items: string[]; emptyLabel?: string }) {
  if (!items.length) {
    return <span className="queue-empty">{emptyLabel}</span>;
  }

  return (
    <div className="queue-list">
      {items.map((item, index) => (
        <span className="queue-token" key={`${item}-${index}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default async function QueueFlowPage({ searchParams }: { searchParams: { password?: string } }) {
  const password = (searchParams.password ?? "").trim();
  if (!password) {
    return (
      <main>
        <div className="card">
          <h1>Queue Workflow</h1>
          <p>No password provided. Go back and enter a password first.</p>
          <Link className="btn primary" href="/" style={{ marginTop: 12, display: "inline-block" }}>
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const result = await getBackendAnalysis(password);
  const quickFacts = [
    { label: "Target prefix", value: result.bfs.target_prefix },
    { label: "Alphabet size", value: result.bfs.alphabet.length.toString() },
    { label: "Branching factor", value: result.bfs.branching_factor.toString() },
    { label: "Visited nodes", value: result.bfs.visited_nodes.toLocaleString("en-US") },
  ];

  return (
    <main>
      <div className="card hero-card">
        <div className="hero-copy">
          <p className="eyebrow">BFS queue trace</p>
          <h1>Queue Workflow</h1>
          <p>Step-by-step BFS queue operations from pop to enqueue to queue-head update.</p>
        </div>
        <div className="metric-strip">
          {quickFacts.map((item) => (
            <div className="metric" key={item.label}>
              <span className="metric-label">{item.label}</span>
              <strong className="metric-value">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <section className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>Configuration</h2>
          <div className="info-stack">
            <div>
              <span className="info-label">Target prefix</span>
              <p className="mono info-value">{result.bfs.target_prefix}</p>
            </div>
            <div>
              <span className="info-label">Alphabet</span>
              <QueueTokens items={result.bfs.alphabet} />
            </div>
            <div>
              <span className="info-label">Branching factor</span>
              <p className="info-value">{result.bfs.branching_factor}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>How to read it</h2>
          <div className="info-stack">
            <p>The queue is shown left to right in the exact order items are processed next.</p>
            <p>
              <strong>Popped</strong> is the current node removed from the front, <strong>Enqueued</strong> is what gets appended,
              and <strong>Queue Head After Step</strong> shows the next front segment after the update.
            </p>
            <div className="summary-grid summary-grid--compact">
              <div className="summary-item">
                <span className="info-label">Found</span>
                <strong>{result.bfs.found ? "Yes" : "No"}</strong>
              </div>
              <div className="summary-item">
                <span className="info-label">Depth found</span>
                <strong>{result.bfs.depth_found}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>Queue Steps</h2>
        <p className="section-note">Each row captures one BFS pop, the children that were appended, and the resulting queue front.</p>
        <QueueViewer bfs={result.bfs} />
      </section>

      <section className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>Queue Summary</h3>
          <div className="summary-grid summary-grid--compact">
            <div className="summary-item">
              <span className="info-label">Total logged steps</span>
              <strong>{result.bfs.steps.length}</strong>
            </div>
            <div className="summary-item">
              <span className="info-label">BFS nodes visited</span>
              <strong>{result.bfs.visited_nodes.toLocaleString("en-US")}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Navigation</h3>
          <p>Use the graph view for breadth levels and this page for exact queue transitions.</p>
          <div className="button-row">
            <Link className="btn" href={`/?password=${encodeURIComponent(password)}`}>
              Back to Home
            </Link>
            <Link className="btn" href={`/bfs-graph?password=${encodeURIComponent(password)}`}>
              Open BFS Graph
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
