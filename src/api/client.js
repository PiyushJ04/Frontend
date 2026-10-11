const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const BASE_URL = `${API_ORIGIN}/api/v1`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(errorText(body, res.status));
  return body;
}

// FastAPI sends a string for our own errors but a list of objects for 422s.
function errorText(body, status) {
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) return body.detail.map((d) => d.msg).join(", ");
  return `Request failed: ${status}`;
}

export const api = {
  health: () => request("/health"),
  // The route schema says `email`, the auth service says `identifier`. Send both
  // so this keeps working whichever way the backend settles.
  login: (email, password) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, identifier: email, password })
  }),
  // payload: { name, email, password, department, teaching_assignments: [{ academic_year, subject }] }
  signup: (payload) => request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  me: (token) => request("/auth/me", { headers: authHeaders(token) }),
  changePassword: (token, current_password, new_password) => request("/auth/change-password", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ current_password, new_password })
  }),
  listUsers: (token, role = "") => request(`/admin/users${role ? `?role=${encodeURIComponent(role)}` : ""}`, {
    headers: authHeaders(token)
  }),
  createUser: (token, user) => request("/admin/users", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(user)
  }),
  setUserStatus: (token, userId, is_active) => request(`/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ is_active })
  })
};

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}
