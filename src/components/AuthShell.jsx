import { Logo } from "./Navbar.jsx";

// Shared two-column frame for login + signup.
export default function AuthShell({ children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo light />
        <div>
          <p className="side-quote">
            The AI gives you a first pass.<br />The marks are still yours.
          </p>
          <p className="side-note">Every suggestion waits for a teacher's review before it counts.</p>
        </div>
        <span className="stamp" aria-hidden="true">A+</span>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}
