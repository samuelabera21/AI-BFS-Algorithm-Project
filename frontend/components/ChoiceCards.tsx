"use client";

import Link from "next/link";

type Props = {
  password: string;
};

export default function ChoiceCards({ password }: Props) {
  const query = `?password=${encodeURIComponent(password)}`;

  return (
    <section className="grid grid-3" style={{ marginTop: 14 }}>
      <Link className="card btn" href={`/analysis${query}`}>
        <h3>1. System Analysis</h3>
        <p>See charset math, combinations, strength, and suggestions.</p>
      </Link>
      <Link className="card btn" href={`/bfs-graph${query}`}>
        <h3>2. BFS Clear Graph</h3>
        <p>View BFS levels in a clean, non-bulky layout.</p>
      </Link>
      <Link className="card btn" href={`/queue-flow${query}`}>
        <h3>3. Queue Workflow</h3>
        <p>Step-by-step queue pop and enqueue trace.</p>
      </Link>
    </section>
  );
}
