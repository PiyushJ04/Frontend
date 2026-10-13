import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);
const KEY = 'aea_session';
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(read);
  useEffect(() => {
    if (!session.token) return;
    api.me(session.token)
      .then((user) => setSession((s) => ({ ...s, user: user?.data || user })))
      .catch((err) => { if (err.status === 401 || err.status === 403) { localStorage.removeItem(KEY); setSession({}); } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function login(email, password) {
    const data = await api.login(email, password);
    const next = { token: data.access_token, refresh: data.refresh_token, user: data.user };
    localStorage.setItem(KEY, JSON.stringify(next));
    setSession(next);
    return data.user;
  }
  function logout() { localStorage.removeItem(KEY); setSession({}); }
  return <AuthContext.Provider value={{ ...session, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
