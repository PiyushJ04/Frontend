import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <form className="form" onSubmit={onSubmit} noValidate>
        <h1>Log in</h1>
        <p className="lead">Use the email your college gave you.</p>

        {state?.notice && <div className="note">{state.notice}</div>}
        {error && <div className="err" role="alert">{error}</div>}

        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="name@college.edu" autoComplete="email" required />
        </label>

        <label>Password
          <span className="pw">
            <input type={show ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            <button type="button" className="ghost" onClick={() => setShow(!show)}>
              {show ? "hide" : "show"}
            </button>
          </span>
        </label>

        <button className="btn wide" disabled={busy || !email || !password}>
          {busy ? "Checking..." : "Log in"}
        </button>

        <p className="swap">New here? <Link to="/signup">Create a teacher account</Link></p>
      </form>
    </AuthShell>
  );
}
