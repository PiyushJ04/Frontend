// Small local helpers. The backend stays the source of truth for exams and marks;
// this only remembers which classes you opened and which files you sent from this browser.
const EXAMS = 'aea_exams';
const ROLES = 'aea_extra_roles';
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const readExams = () => read(EXAMS, []);
export function saveExam(exam, roleKey) {
  const all = readExams();
  const prev = all.find((x) => x.id === exam.id);
  const merged = { ...prev, ...exam, role_key: roleKey || prev?.role_key, touched_at: new Date().toISOString() };
  write(EXAMS, [merged, ...all.filter((x) => x.id !== exam.id)]);
  return merged;
}

export const readExtraRoles = () => read(ROLES, []);
export const saveExtraRoles = (r) => write(ROLES, r);

const flagKey = (id) => `aea_flags_${id}`;
const blank = { syllabus: [], notes: [], sample: [], paper: [], evaluated: false };
export const readFlags = (id) => ({ ...blank, ...(id ? read(flagKey(id), {}) : {}) });
export function writeFlags(id, patch) {
  const next = { ...readFlags(id), ...patch };
  if (id) write(flagKey(id), next);
  return next;
}

export const roleKey = (r) => `${r.academic_year || ''}|${(r.subject || '').toLowerCase()}`;
export function buildRoles(user) {
  const base = user?.teaching_assignments || user?.assignments || [];
  const all = [...base, ...readExtraRoles()].map((a) => ({
    academic_year: a.academic_year || a.year || '',
    subject: a.subject || a.name || '',
    department: a.department || user?.department || '',
  })).filter((a) => a.subject);
  const seen = new Set();
  return all.map((a) => ({ ...a, key: roleKey(a) })).filter((a) => (seen.has(a.key) ? false : seen.add(a.key)));
}
