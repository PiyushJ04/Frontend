const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

function authHeaders(token) { return token ? { Authorization: `Bearer ${token}` } : {}; }

async function parseResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body?.detail;
    const msg = Array.isArray(detail) ? detail.map(x => x.msg || 'Invalid field').join(', ') : detail;
    const err = new Error(
      msg || body?.message ||
      (res.status === 429 ? 'Too many requests. Please wait a few seconds and try again.' : `Request failed (${res.status})`)
    );
    err.status = res.status;
    throw err;
  }
  return body;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRY_STATUS = new Set([429, 502, 503, 504]);
const IDEMPOTENT = new Set(['GET', 'PUT', 'DELETE']);
const READ_TIMEOUT_MS = 20000;

// One fetch attempt. Reads/updates time out so a stalled connection can never leave a screen waiting forever.
async function attempt(url, init, signal, timeoutMs) {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  if (signal) { if (signal.aborted) ctrl.abort(); else signal.addEventListener('abort', onAbort, { once: true }); }
  const timer = timeoutMs ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

async function request(path, { token, method='GET', body, form=false, signal } = {}) {
  const headers = { ...authHeaders(token) };
  if (!form) headers['Content-Type'] = 'application/json';
  const init = { method, headers, body: form ? body : body == null ? undefined : JSON.stringify(body) };
  const safeToRetry = IDEMPOTENT.has(method);
  const maxTries = safeToRetry ? 4 : 2;

  for (let n = 1; ; n++) {
    let res;
    try {
      res = await attempt(`${BASE_URL}${path}`, init, signal, safeToRetry ? READ_TIMEOUT_MS : 0);
    } catch (err) {
      if (signal?.aborted) throw err; // the caller cancelled on purpose
      // Network blip, timeout, or a response the browser blocked (for example a rate-limit reply without CORS headers).
      // Only repeat requests that are safe to repeat; a POST may already have been processed.
      if (safeToRetry && n < maxTries) { await sleep(500 * 2 ** (n - 1)); continue; }
      throw new Error(safeToRetry ? "Couldn't reach the server. Check your connection and try again." : "The connection dropped before the server answered. Check whether it went through, then try again.");
    }
    if (RETRY_STATUS.has(res.status) && n < maxTries) {
      const wait = Number(res.headers.get('Retry-After'));
      await sleep(Math.min(Number.isFinite(wait) && wait > 0 ? wait * 1000 : 500 * 2 ** (n - 1), 5000));
      continue;
    }
    return parseResponse(res);
  }
}

async function upload(path, token, form, signal) {
  return request(path, { token, method:'POST', body:form, form:true, signal });
}

export const api = {
  base: BASE_URL,
  health: () => request('/health'),
  login: (email, password) => request('/auth/login', {method:'POST', body:{email, identifier:email, password}}),
  signup: payload => request('/auth/signup', {method:'POST', body:payload}),
  me: token => request('/auth/me', {token}),
  changePassword: (token, current_password, new_password) => request('/auth/change-password', {token, method:'POST', body:{current_password,new_password}}),

  createExam: (token, payload) => request('/exams', {token, method:'POST', body:payload}),
  getExam: (token, examId) => request(`/exams/${examId}`, {token}),
  readiness: (token, examId) => request(`/exams/${examId}/readiness`, {token}),
  approveExam: (token, examId) => request(`/exams/${examId}/approve`, {token, method:'POST'}),
  questions: (token, examId) => request(`/exams/${examId}/questions`, {token}),

  uploadKnowledge: (token, examId, type, files) => {
    const form = new FormData(); form.append('type', type); files.forEach(f => form.append('files', f));
    return upload(`/exams/${examId}/knowledge`, token, form);
  },
  uploadQuestionPaper: (token, examId, file) => { const f=new FormData(); f.append('file',file); return upload(`/exams/${examId}/question-paper`,token,f); },

  baselineDraft: (token, examId, qid, payload={}) => request(`/exams/${examId}/questions/${qid}/baseline-answer/draft`, {token,method:'POST',body:payload}),
  baselineVersions: (token, examId, qid) => request(`/exams/${examId}/questions/${qid}/baseline-answer`, {token}),
  baselineRevise: (token, examId, qid, feedback) => request(`/exams/${examId}/questions/${qid}/baseline-answer/revise`, {token,method:'POST',body:{feedback}}),
  baselineApprove: (token, examId, qid) => request(`/exams/${examId}/questions/${qid}/baseline-answer/approve`, {token,method:'POST'}),

  schemeDraft: (token, examId, qid) => request(`/exams/${examId}/questions/${qid}/marking-scheme/draft`, {token,method:'POST'}),
  schemeGet: (token, examId, qid) => request(`/exams/${examId}/questions/${qid}/marking-scheme`, {token}),
  schemeUpdate: (token, examId, qid, payload) => request(`/exams/${examId}/questions/${qid}/marking-scheme`, {token,method:'PUT',body:payload}),
  schemeApprove: (token, examId, qid) => request(`/exams/${examId}/questions/${qid}/marking-scheme/approve`, {token,method:'POST'}),

  uploadStudents: (token, examId, file) => { const f=new FormData(); f.append('file',file); return upload(`/exams/${examId}/student-answers`,token,f); },
  students: (token, examId) => request(`/exams/${examId}/student-answers`,{token}),
  evaluate: (token, examId, sheetId) => request(`/exams/${examId}/student-answers/${sheetId}/evaluation-jobs`,{token,method:'POST'}),
  evaluateAll: (token, examId) => request(`/exams/${examId}/student-answers/evaluation-jobs`,{token,method:'POST'}),
  job: (token, jobId) => request(`/exams/evaluation-jobs/${jobId}`,{token}),
  evaluation: (token, examId, sheetId) => request(`/exams/${examId}/student-answers/${sheetId}/evaluation`,{token}),
  analytics: (token, examId) => request(`/exams/${examId}/analytics`,{token}),
};
