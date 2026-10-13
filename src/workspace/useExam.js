import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { unwrap } from '../components/ui.jsx';
import { readFlags, saveExam, writeFlags } from './store.js';

export function useExam(token, examId, roleKeyValue) {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [baselines, setBaselines] = useState({}); // qid -> versions (newest first)
  const [schemes, setSchemes] = useState({}); // qid -> scheme | null
  const [flags, setFlagsState] = useState(() => readFlags(examId));
  const [loading, setLoading] = useState(!!examId);
  const [error, setError] = useState('');

  const seq = useRef(0); // only the newest load may write state, so a slow older response can't undo a newer one

  // Run tasks a few at a time. Firing 2 requests per question at once is what trips the server's rate limit.
  const pool = async (items, size, fn) => {
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }));
  };

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!examId) { setExam(null); setQuestions([]); setLoading(false); return; }
    const mine = ++seq.current;
    try {
      const [e, q] = await Promise.all([api.getExam(token, examId), api.questions(token, examId)]);
      const ex = unwrap(e);
      const qs = unwrap(q) || [];
      const bl = {}, sc = {};
      let partial = false;
      await pool(qs, 3, async (qu) => {
        try { const v = unwrap(await api.baselineVersions(token, examId, qu.id)); bl[qu.id] = Array.isArray(v) ? v : []; } catch { partial = true; }
        // A marking scheme cannot exist until the reference answer is approved.
        // Do not issue a GET that is guaranteed to return 404 for questions that are
        // still waiting for teacher approval. This also removes noisy browser 404s
        // during normal workspace loading.
        if (Array.isArray(bl[qu.id]) && bl[qu.id][0]?.status === 'approved') {
          try { sc[qu.id] = unwrap(await api.schemeGet(token, examId, qu.id)); } catch (err) { if (err.status === 404) sc[qu.id] = null; else partial = true; }
        } else {
          sc[qu.id] = null;
        }
      });
      if (mine !== seq.current) return; // a newer load has started; drop this one
      setExam(ex);
      saveExam(ex, roleKeyValue);
      setQuestions(qs);
      // A failed request must never be treated as "nothing there": keep what we already had for that question.
      setBaselines((prev) => ({ ...Object.fromEntries(qs.map((x) => [x.id, prev[x.id] || []])), ...bl }));
      setSchemes((prev) => ({ ...Object.fromEntries(qs.map((x) => [x.id, prev[x.id] ?? null])), ...sc }));
      setError(partial ? 'Some details could not be refreshed. Showing what was loaded last.' : '');
    } catch (err) {
      if (mine === seq.current && !silent) setError(err.message);
    } finally {
      if (mine === seq.current) setLoading(false);
    }
  }, [token, examId, roleKeyValue]);

  useEffect(() => { setFlagsState(readFlags(examId)); setLoading(!!examId); load(); }, [load, examId]);

  const setFlags = (patch) => setFlagsState(writeFlags(examId, patch));
  const latest = (qid) => (baselines[qid] || [])[0] || null;

  const done = {
    setup: !!exam,
    uploads: flags.syllabus.length > 0 && flags.notes.length > 0 && questions.length > 0,
    reference: questions.length > 0 && questions.every((q) => latest(q.id)?.status === 'approved'),
    factors: exam?.status === 'approved',
    evaluate: !!flags.evaluated,
    results: false,
  };

  return { exam, questions, baselines, schemes, setBaselines, setSchemes, flags, setFlags, latest, done, loading, error, reload: load, setExam };
}
