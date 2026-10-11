import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function Logo({ light }) {
  return (
    <Link to="/" className={`logo ${light ? "light" : ""}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="2" y="2" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 14l4 4 8-10" fill="none" stroke="#c0392b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>AI Edu Assess</span>
    </Link>
  );
}

export default function Navbar() {
  const { token } = useAuth();
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Logo />
        <nav>
          <a href="/#how">How it works</a>
          <a href="/#rules">Principles</a>
          {token ? (
            <Link to="/dashboard" className="btn sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="btn sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
