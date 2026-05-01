import Link from "next/link";
import { getBackendAnalysis } from "@/lib/backend";
import { formatBigIntString, formatTime } from "@/lib/types";

function explainCharset(password: string) {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigits = /\d/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  const parts: string[] = [];
  if (hasLower) parts.push("26 (lowercase)");
  if (hasUpper) parts.push("26 (uppercase)");
  if (hasDigits) parts.push("10 (digits)");
  if (hasSymbols) parts.push("32 (symbols)");
  return parts;
}

export default async function AnalysisPage({ searchParams }: { searchParams: { password?: string } }) {
  const password = (searchParams.password ?? "").trim();
  if (!password) {
    return (
      <main>
        <div className="card">
          <h1>System Analysis</h1>
          <p>No password provided. Go back and enter a password first.</p>
          <Link className="btn primary" href="/" style={{ marginTop: 12, display: "inline-block" }}>
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const result = await getBackendAnalysis(password);
  const charsetParts = explainCharset(result.password);
  const combinationsPretty = formatBigIntString(result.combinations);
  const attemptsPretty = formatBigIntString(result.estimated_attempts);
  const secondsPretty = result.estimated_time_seconds.toLocaleString("en-US", { maximumFractionDigits: 6 });

  return (
    <main>
      <div className="card">
        <h1>System Analysis</h1>
        <p>Detailed pipeline math from input to final decision, with formula substitution at each step.</p>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>Step-by-Step Formula Flow</h2>
        <div className="formula-block" style={{ marginTop: 10 }}>
          <h3>Step 1: Character Set Detection</h3>
          <p>
            Detected sets: {charsetParts.join(" + ")} = <strong>{result.charset_size}</strong>
          </p>
          <p className="mono">charset_size = {result.charset_size}</p>
        </div>

        <div className="formula-block" style={{ marginTop: 10 }}>
          <h3>Step 2: Password Length</h3>
          <p className="mono">length = {result.password_length}</p>
        </div>

        <div className="formula-block" style={{ marginTop: 10 }}>
          <h3>Step 3: Search Space (Combinations)</h3>
          <p className="mono">combinations = charset_size ^ length</p>
          <p className="mono">combinations = {result.charset_size} ^ {result.password_length}</p>
          <p className="mono">combinations = {combinationsPretty}</p>
        </div>

        <div className="formula-block" style={{ marginTop: 10 }}>
          <h3>Step 4: Estimated Time to Crack</h3>
          <p className="mono">time_seconds = combinations / guesses_per_second</p>
          <p className="mono">
            time_seconds = {combinationsPretty} / {result.guesses_per_second.toLocaleString("en-US")}
          </p>
          <p className="mono">time_seconds = {secondsPretty}</p>
          <p>Human-readable time: <strong>{formatTime(result.estimated_time_seconds)}</strong></p>
        </div>

        <div className="formula-block" style={{ marginTop: 10 }}>
          <h3>Step 5: Strength Classification Rule</h3>
          <p className="mono">if time &lt; 1 second - Weak</p>
          <p className="mono">else if time &lt; 1 hour - Medium</p>
          <p className="mono">else if time &lt; 1 year - Strong</p>
          <p className="mono">else - Very Strong</p>
          <p>
            Final decision for this password: <strong>{result.strength}</strong>
          </p>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>Input</h3>
          <p className="mono">{result.password}</p>
        </div>
        <div className="card">
          <h3>Charset Detection</h3>
          <p>Charset size = {result.charset_size}</p>
          <p>Length = {result.password_length}</p>
        </div>
        <div className="card">
          <h3>Combinations</h3>
          <p className="mono">{combinationsPretty}</p>
          <p>Formula: charset_size ^ length</p>
        </div>
        <div className="card">
          <h3>Time Estimate</h3>
          <p>Guess rate: {result.guesses_per_second.toLocaleString()} / sec</p>
          <p>Estimated: {formatTime(result.estimated_time_seconds)}</p>
        </div>
        <div className="card">
          <h3>Strength</h3>
          <p>{result.strength}</p>
        </div>
        <div className="card">
          <h3>Attempts Meaning</h3>
          <p className="mono">{attemptsPretty}</p>
          <p>
            This is the estimated brute-force search size. Worst case tries all; average case is roughly half.
          </p>
        </div>
        <div className="card">
          <h3>Suggestions</h3>
          <ul>
            {result.suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>Term Explanations</h2>
        <ul className="explain-list">
          <li>
            <strong>Charset size:</strong> Number of possible characters per position based on the character categories detected in the password.
          </li>
          <li>
            <strong>Combinations:</strong> Total possible passwords of the same length under the detected charset.
          </li>
          <li>
            <strong>Guesses per second:</strong> Assumed attacker speed used only for estimation.
          </li>
          <li>
            <strong>Estimated crack time:</strong> Mathematical estimate from combinations divided by guess rate, not a real active attack.
          </li>
          <li>
            <strong>Strength:</strong> Category derived from the estimated time thresholds.
          </li>
        </ul>
      </section>

      <div style={{ marginTop: 14 }}>
        <Link className="btn" href={`/?password=${encodeURIComponent(password)}`}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
