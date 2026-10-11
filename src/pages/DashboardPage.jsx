import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Placeholder so login has somewhere to land. Replace when the real dashboard is built.
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="wrap" style={{ padding: "80px 24px" }}>
      <p className="tag">Dashboard</p>
      <h1>Hello, {user?.username?.replace(/_/g, " ")}.</h1>
      <p className="lead">Signed in as {user?.role}. The real dashboard is coming.</p>
      <button className="btn" onClick={() => { logout(); navigate("/"); }}>Log out</button>
    </div>
  );
}
