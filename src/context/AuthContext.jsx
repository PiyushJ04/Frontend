import { createContext, useContext, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);
const KEY = "aea_session";

function readSession() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  async function login(email, password) {
    const data = await api.login(email, password);
    const next = { token: data.access_token, refresh: data.refresh_token, user: data.user };
    localStorage.setItem(KEY, JSON.stringify(next));
    setSession(next);
    return data.user;
  }

  function logout() {
    localStorage.removeItem(KEY);
    setSession({});
  }

  return (
    <AuthContext.Provider value={{ ...session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
