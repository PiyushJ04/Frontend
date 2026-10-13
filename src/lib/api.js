// Compatibility exports for older pages. New application code uses src/api/client.js.
import { api } from '../api/client.js';
export async function login(email,password){const d=await api.login(email,password);return d.user;}
export const signup=payload=>api.signup(payload);
