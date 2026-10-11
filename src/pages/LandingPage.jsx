import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const STEPS = [
  { who: "Admin", title: "Set up the structure", text: "The admin creates departments, subjects and years, then assigns each teacher their subjects with a deadline." },
  { who: "Teacher", title: "Upload the answer papers", text: "Drop in scanned PDFs or photos once the exam is over. The system reads the handwriting and splits it question by question." },
  { who: "AI", title: "Get a first-pass mark", text: "For every answer you see a suggested mark and how confident the model is. Low confidence gets flagged, not hidden." },
  { who: "Teacher", title: "Review and finalise", text: "Accept, adjust or reject each suggestion. Only when you confirm are the marks locked, and the action is logged." }
];

const RULES = [
  { n: "Rule 1", t: "AI assists. You decide.", d: "Nothing the AI suggests becomes a final mark on its own. A teacher signs off every time." },
  { n: "Rule 2", t: "You only see your subjects.", d: "Access follows your assignments. A CSE teacher can't open ECE papers, even by guessing a link." },
  { n: "Rule 3", t: "Everything is on record.", d: "Who uploaded, who changed a mark, and when. Useful when a student asks for a re-check." }
];

function Scribble() {
  return (
    <svg className="scrib" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 9 C 40 2, 70 13, 110 6 S 190 3, 230 9 S 280 5, 298 8" fill="none" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// A fake graded answer sheet so visitors see what the product does.
function Sheet() {
  return (
    <div className="sheet" aria-label="Example of a graded answer">
      <p className="mono">SE · DBMS · Q3 · [5 marks]</p>
      <p className="q">Explain third normal form with an example.</p>
      <p className="ans">
        A table is in 3NF if every non-key column depends on the key, the whole key, and{" "}
        <span className="circ">nothing but the key</span>. For example, splitting Student(id, city, pincode) so that pincode
        goes to its own table.
      </p>
      <p className="mark note-l">✓ definition correct<br />– no transitive example given</p>
      <div className="score">
        <span className="mark big">4 / 5</span>
        <span className="mono">AI · 82% sure</span>
      </div>
      <div className="chips">
        <span className="chip ok">Accept</span><span className="chip">Adjust</span><span className="chip">Reject</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <section className="hero wrap">
        <div>
          <p className="tag">Exam evaluation for colleges</p>
          <h1>
            Marking papers shouldn't eat{" "}
            <span className="under">your whole weekend.<Scribble /></span>
          </h1>
          <p className="lead">
            AI Edu Assess reads scanned answer sheets and suggests marks question by question.
            You review each one. A faster first pass, with the final say still in your hands.
          </p>
          <div className="cta">
            <Link to="/signup" className="btn">Create teacher account</Link>
            <Link to="/login" className="link">I already have one →</Link>
          </div>
        </div>
        <Sheet />
      </section>

      <section id="how" className="wrap block">
        <p className="tag">How it works</p>
        <h2>From a stack of scripts to final marks in four steps</h2>
        <div className="ledger">
          <div className="l-head mono"><span>No.</span><span>Step</span><span>Who</span></div>
          {STEPS.map((s, i) => (
            <div className="l-row" key={s.title}>
              <span className="num mono">{String(i + 1).padStart(2, "0")}</span>
              <div><h3>{s.title}</h3><p>{s.text}</p></div>
              <span className={`who ${s.who === "AI" ? "ai" : ""}`}>{s.who}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="rules" className="band">
        <div className="wrap">
          <p className="tag light">Principles</p>
          <h2>Built so the teacher stays in charge</h2>
          <div className="rules">
            {RULES.map((r) => (
              <div key={r.n}><span className="mono red">{r.n}</span><h3>{r.t}</h3><p>{r.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap block roles">
        <div className="role">
          <h3>Teachers</h3>
          <ul>
            <li>Upload answer papers for your subjects</li>
            <li>See AI suggestions with confidence scores</li>
            <li>Override any mark, with the reason on record</li>
          </ul>
        </div>
        <div className="role">
          <h3>Admins</h3>
          <ul>
            <li>Create teacher accounts and assignments</li>
            <li>Track deadlines and overdue checking</li>
            <li>Review the audit log</li>
          </ul>
        </div>
      </section>

      <section className="wrap final">
        <h2>Ready for the next exam season?</h2>
        <Link to="/signup" className="btn">Get started</Link>
      </section>

      <footer className="foot">
        <div className="wrap"><span>AI Edu Assess</span><span>College group project · 2026</span></div>
      </footer>
    </>
  );
}
