import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../../api/client.js';
import { Button, Notice, Panel, Pill, StepHeader, fmt, unwrap } from '../../components/ui.jsx';
import { MultiStepLoader } from '../../components/aceternity/MultiStepLoader.jsx';
import { MovingBorderButton } from '../../components/aceternity/MovingBorder.jsx';
import { Input } from '../../components/aceternity/FormInputs.jsx';
import { IconArrow, IconCheck, IconLock, IconPlus, IconTrash } from '../../components/Icons.jsx';
import { cn } from '../../lib/utils.js';

const STEPS = [{ text: 'Reading the approved answer' }, { text: 'Checking what the question asks for' }, { text: 'Choosing factors for diagrams, presentation and handwriting' }, { text: 'Balancing the weights to 25' }];
const norm = (s) => ({ ...s, factors: (s.factors || []).map((f) => ({ ...f, weight_percent: Number(f.weight_percent), enabled: f.enabled !== false })) });
const totalOf = (s) => (s?.factors || []).filter((f) => f.enabled !== false).reduce((a, f) => a + Number(f.weight_percent || 0), 0);

function Ring({ value }) {
  const r = 38, c = 2 * Math.PI * r, ok = Math.abs(value - 25) < 0.001, over = value > 25;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${fmt(value)} of 25 percent assigned`}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a382e" strokeWidth="9" />
        <motion.circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - Math.min(value, 25) / 25), stroke: ok ? '#5ED8A4' : over ? '#FF6A5C' : '#F1D26A' }} transition={{ type: 'spring', stiffness: 80, damping: 18 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center"><span className="font-display text-2xl leading-none text-chalk">{fmt(value, value % 1 ? 1 : 0)}<span className="block text-[10px] font-body text-chalk-faint">of 25</span></span></div>
    </div>
  );
}

export default function FactorsStep({ ctx }) {
  const { token, examId, questions, schemes, setSchemes, latest, exam, reload } = ctx;
  const [sel, setSel] = useState(questions[0]?.id);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [readiness, setReadiness] = useState(null);

  useEffect(() => { setDrafts(Object.fromEntries(Object.entries(schemes).filter(([, s]) => s).map(([k, s]) => [k, norm(s)]))); }, [schemes]);
  const allApproved = questions.length > 0 && questions.every((q) => schemes[q.id]?.status === 'approved');
  useEffect(() => { if (allApproved) api.readiness(token, examId).then((r) => setReadiness(unwrap(r))).catch(() => setReadiness(null)); }, [allApproved, token, examId]);

  const q = questions.find((x) => x.id === sel) || questions[0];
  const s = q && drafts[q.id];
  const approvedBase = q && latest(q.id)?.status === 'approved';
  const locked = s?.status === 'approved' || exam?.status === 'approved';
  const total = totalOf(s);
  const update = (patch) => setDrafts((d) => ({ ...d, [q.id]: { ...d[q.id], ...patch } }));
  const setFactor = (i, patch) => update({ factors: s.factors.map((f, j) => (j === i ? { ...f, ...patch } : f)) });

  const payload = (sc) => ({ teacher_notes: sc.teacher_notes || null, factors: sc.factors.map((f) => ({ name: f.name, description: f.description || f.name, weight_percent: Number(f.weight_percent), enabled: f.enabled !== false })) });
  const setOne = (qid, sc) => setSchemes((m) => ({ ...m, [qid]: sc }));

  async function generate(qids) {
    setBusy('generate'); setError('');
    try { for (const id of qids) setOne(id, unwrap(await api.schemeDraft(token, examId, id))); await reload(); } catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  async function save(qid, approve) {
    const sc = drafts[qid];
    if (Math.abs(totalOf(sc) - 25) > 0.001) throw new Error(`Enabled factors for this question must total exactly 25. They total ${fmt(totalOf(sc))}.`);
    let r = unwrap(await api.schemeUpdate(token, examId, qid, payload(sc)));
    if (approve) r = unwrap(await api.schemeApprove(token, examId, qid));
    setOne(qid, r);
  }
  async function act(kind) {
    setBusy(kind); setError('');
    try { await save(q.id, kind === 'approve'); await reload(); } catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  async function approveAll() {
    setBusy('approve-all'); setError('');
    try { for (const x of questions) if (drafts[x.id] && drafts[x.id].status !== 'approved') await save(x.id, true); await reload(); } catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  async function lock() {
    setBusy('lock'); setError('');
    try { await api.approveExam(token, examId); await reload(); } catch (err) { setError(err.message); } finally { setBusy(''); }
  }

  const missing = useMemo(() => questions.filter((x) => !schemes[x.id]).map((x) => x.id), [questions, schemes]);
  const approvable = questions.every((x) => drafts[x.id] && Math.abs(totalOf(drafts[x.id]) - 25) < 0.001);

  return (
    <>
      <MultiStepLoader steps={STEPS} loading={busy === 'generate'} duration={2300} title="Choosing marking factors" hint="You can change every factor afterwards." />
      <StepHeader title="Decide the other 25%">Theory content carries 75 of the marks. These factors share the remaining 25. Add, remove or reweight them until each question totals exactly 25.</StepHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Pill tone={allApproved ? 'good' : 'warn'}>{questions.filter((x) => schemes[x.id]?.status === 'approved').length} of {questions.length} approved</Pill>
        {missing.length > 0 && !locked && <Button kind="ghost" busy={busy === 'generate'} onClick={() => generate(missing)}>Suggest factors for {missing.length === questions.length ? 'every question' : `the other ${missing.length}`}</Button>}
        {missing.length === 0 && !allApproved && <Button kind="ghost" busy={busy === 'approve-all'} disabled={!approvable} onClick={approveAll}>Approve every question</Button>}
      </div>
      <Notice error={error} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Questions" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {questions.map((x, i) => {
            const st = schemes[x.id]?.status;
            return (
              <button key={x.id} onClick={() => setSel(x.id)} className={cn('flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors lg:w-full', q?.id === x.id ? 'border-mustard/60 bg-board-800' : 'border-board-700 bg-board-900 hover:bg-board-800')}>
                <span className="font-hand text-2xl text-mustard">Q{x.question_no || i + 1}</span>
                <span className="flex-1 text-xs text-chalk-dim">{x.max_marks} marks</span>
                <span className={cn('h-2.5 w-2.5 rounded-full', st === 'approved' ? 'bg-tick' : schemes[x.id] ? 'bg-mustard' : 'bg-board-600')} />
              </button>
            );
          })}
        </nav>

        <Panel>
          {!s ? (
            <div className="rounded-xl border border-dashed border-board-600 p-8 text-center">
              <p className="text-chalk-dim">{approvedBase ? 'No factors for this question yet.' : 'Approve the reference answer for this question first.'}</p>
              <Button className="mt-4" disabled={!approvedBase} busy={busy === 'generate'} onClick={() => generate([q.id])}>Suggest factors</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-5">
                <Ring value={total} />
                <div className="min-w-0 flex-1">
                  <p className="text-chalk">{q.question_text}</p>
                  <p className="mt-1 text-sm text-chalk-dim">{Math.abs(total - 25) < 0.001 ? 'The factors add up to 25.' : total > 25 ? `${fmt(total - 25)} too much. Lower a weight.` : `${fmt(25 - total)} still to assign.`}</p>
                </div>
                <Pill tone={s.status === 'approved' ? 'good' : 'warn'}>{s.status}</Pill>
              </div>

              <ul className="mt-6 space-y-3">
                <AnimatePresence initial={false}>
                  {s.factors.map((f, i) => (
                    <motion.li key={f.id || `n${i}`} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className={cn('flex flex-wrap items-center gap-3 rounded-xl bg-board-800 p-3', f.enabled === false && 'opacity-50')}>
                        <input type="checkbox" aria-label={`Use ${f.name}`} checked={f.enabled !== false} disabled={locked} onChange={(e) => setFactor(i, { enabled: e.target.checked })} className="h-4 w-4 accent-[#F1D26A]" />
                        <input aria-label="Factor name" value={f.name} disabled={locked} onChange={(e) => setFactor(i, { name: e.target.value })} className="min-w-[140px] flex-1 bg-transparent text-sm text-chalk focus-visible:outline-none" />
                        <input aria-label={`${f.name} weight`} type="range" min="0" max="25" step="0.5" value={f.weight_percent} disabled={locked} onChange={(e) => setFactor(i, { weight_percent: Number(e.target.value) })} className="w-32 accent-[#F1D26A]" />
                        <span className="flex items-center gap-1">
                          <input aria-label="Weight in percent" type="number" min="0" max="25" step="0.5" value={f.weight_percent} disabled={locked} onChange={(e) => setFactor(i, { weight_percent: Number(e.target.value) })} className="h-8 w-16 rounded-md bg-board-950 px-2 text-right text-sm text-chalk tabular-nums" />
                          <span className="text-sm text-chalk-dim">%</span>
                        </span>
                        {!locked && <button aria-label={`Remove ${f.name}`} onClick={() => update({ factors: s.factors.filter((_, j) => j !== i) })} className="text-chalk-faint hover:text-pen"><IconTrash className="h-4 w-4" /></button>}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              {!locked && <button onClick={() => update({ factors: [...s.factors, { name: 'New factor', description: '', weight_percent: 0, enabled: true }] })} className="mt-3 inline-flex items-center gap-1.5 text-sm text-chalk-dim hover:text-mustard"><IconPlus className="h-4 w-4" /> Add a factor</button>}

              <div className="mt-6 space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-chalk">Notes for this question (optional)</label>
                <Input as="textarea" id="notes" disabled={locked} value={s.teacher_notes || ''} onChange={(e) => update({ teacher_notes: e.target.value })} placeholder="For example: a diagram is only needed for part (b)." />
              </div>
              {!locked && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-board-700 pt-5">
                  <Button kind="ghost" busy={busy === 'save'} onClick={() => act('save')}>Save changes</Button>
                  <Button busy={busy === 'approve'} disabled={Math.abs(total - 25) > 0.001} onClick={() => act('approve')}><IconCheck className="h-4 w-4" /> Approve this question</Button>
                </div>
              )}
            </>
          )}
        </Panel>
      </div>

      <AnimatePresence>
        {allApproved && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative mt-8 overflow-hidden rounded-2xl border border-board-600/60 bg-board-900 p-6 md:p-8">
            <h2 className="font-display text-3xl text-chalk">{exam?.status === 'approved' ? 'The scheme is locked' : 'Lock the scheme before marking'}</h2>
            <p className="mt-2 max-w-xl text-chalk-dim">{exam?.status === 'approved' ? 'Student papers can now be marked. The scheme can no longer change.' : 'Once locked, reference answers and factors cannot change, so every paper is judged by the same rules.'}</p>
            {readiness?.checks && (
              <ul className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
                {Object.entries(readiness.checks).map(([k, v]) => <li key={k} className={cn('flex items-center gap-2', v ? 'text-tick' : 'text-mustard')}>{v ? <IconCheck className="h-4 w-4" /> : <span className="h-4 w-4 text-center">-</span>}{k.replaceAll('_', ' ')}</li>)}
              </ul>
            )}
            {exam?.status === 'approved' ? (
              <>
                <motion.div initial={{ scale: 2.2, rotate: -14, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }} transition={{ type: 'spring', stiffness: 360, damping: 18 }} className="absolute right-6 top-6 hidden items-center gap-2 rounded-lg border-[3px] border-pen px-4 py-2 font-hand text-4xl font-bold text-pen sm:flex"><IconLock className="h-6 w-6" /> Locked</motion.div>
                <div className="mt-6"><Button onClick={() => ctx.go('evaluate')}>Continue to student papers <IconArrow className="h-4 w-4" /></Button></div>
              </>
            ) : (
              <div className="mt-6">
                <MovingBorderButton onClick={lock} disabled={busy === 'lock' || (readiness && readiness.ready === false)} containerClassName="h-12 w-64" className="gap-2">
                  <IconLock className="h-4 w-4" /> {busy === 'lock' ? 'Locking' : 'Approve and lock'}
                </MovingBorderButton>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
