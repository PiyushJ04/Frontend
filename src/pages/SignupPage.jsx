import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { api } from "../api/client.js";

const YEARS = [
  { value: "FE", label: "FE (1st yr)" },
  { value: "SE", label: "SE (2nd yr)" },
  { value: "TE", label: "TE (3rd yr)" },
  { value: "BE", label: "BE (4th yr)" }
];
const DEPARTMENTS = ["CSE", "IT", "ENTC", "Mechanical", "Civil", "Electrical", "Basic Sciences"];
const blankRow = () => ({ academic_year: "FE", subject: "" });

export default function SignupPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", department: "" });
  const [rows, setRows] = useState([blankRow()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setRow = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  // Mirrors what the backend will accept; the backend stays the real check.
  function validate() {
    if (f.name.trim().length < 2) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return "That email doesn't look right.";
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
      return "Password needs at least 8 characters, with a letter and a number.";
    if (f.password !== f.confirm) return "The two passwords don't match.";
    if (!f.department.trim()) return "Add your department.";
    if (!rows.some((r) => r.subject.trim())) return "Add at least one subject you teach.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    setBusy(true);
    try {
      await api.signup({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        department: f.department.trim(),
        teaching_assignments: rows
          .filter((r) => r.subject.trim())
          .map((r) => ({ academic_year: r.academic_year, subject: r.subject.trim() }))
      });
      navigate("/login", { state: { notice: "Account created. Log in to continue." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <form className="form wide-form" onSubmit={onSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="lead">For teachers who check papers. Admins are set up by the institution.</p>

        {error && <div className="err" role="alert">{error}</div>}

        <div className="two">
          <label>Full name
            <input value={f.name} onChange={set("name")} placeholder="Dr Atharv Patil" autoComplete="name" />
          </label>
          <label>Department
            <input value={f.department} onChange={set("department")} list="depts" placeholder="CSE" />
            <datalist id="depts">{DEPARTMENTS.map((d) => <option key={d} value={d} />)}</datalist>
          </label>
        </div>

        <label>College email
          <input type="email" value={f.email} onChange={set("email")} placeholder="name@college.edu" autoComplete="email" />
        </label>

        <div className="two">
          <label>Password
            <input type="password" value={f.password} onChange={set("password")} autoComplete="new-password" />
          </label>
          <label>Confirm password
            <input type="password" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </label>
        </div>

        <fieldset>
          <legend>What do you teach?</legend>
          <p className="hint">You'll only see papers for these subjects.</p>
          {rows.map((r, i) => (
            <div className="row" key={i}>
              <select value={r.academic_year} onChange={(e) => setRow(i, "academic_year", e.target.value)} aria-label="Year">
                {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
              <input value={r.subject} onChange={(e) => setRow(i, "subject", e.target.value)}
                placeholder="e.g. DBMS" aria-label="Subject" />
              <button type="button" className="ghost x" aria-label="Remove subject"
                disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="ghost add" onClick={() => setRows([...rows, blankRow()])}>
            + add another subject
          </button>
        </fieldset>

        <button className="btn wide" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        <p className="swap">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
