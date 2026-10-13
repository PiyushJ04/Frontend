import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../../api/client.js';
import { Button, Notice, Panel, Pill, StepHeader, unwrap } from '../../components/ui.jsx';
import { MultiStepLoader } from '../../components/aceternity/MultiStepLoader.jsx';
import { paragraphs, rich, splitParts } from '../../lib/answerParts.jsx';
import { Input } from '../../components/aceternity/FormInputs.jsx';
import { IconArrow, IconCheck, IconRefresh } from '../../components/Icons.jsx';
import { cn } from '../../lib/utils.js';

const DRAFT_STEPS = [
  { text: 'Reading your notes' },
  { text: 'Finding the passages that match each question' },
  { text: 'Writing the reference answers' },
  { text: 'Checking each answer against your syllabus' },
];
const REVISE_STEPS = [{ text: 'Reading your feedback' }, { text: 'Rewriting the answer' }, { text: 'Checking it against your notes again' }];

export default function ReferenceStep({ ctx }) {
  const { token, examId, questions, baselines, setBaselines, latest, done, reload } = ctx;
  const [sel, setSel] = useState(questions[0]?.id);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [idx, setIdx] = useState(0); // which sub-question is open
  const [dir, setDir] = useState(1);
  const [mode, setMode] = useState('steps'); // 'steps' | 'full'
  const [seen, setSeen] = useState({});

  const q = questions.find((x) => x.id === sel) || questions[0];
  const versions = (q && baselines[q.id]) || [];
  const cur = versions[0];

  const qParts = splitParts(q?.question_text);
  const aParts = cur ? splitParts(cur.reference_answer) : { parts: [] };
  // Phase 12 stores sub-questions structurally. Prefer that data so the UI
  // does not have to guess boundaries from the generated answer text.
  // The parser remains as a fallback for older reference-answer versions.
  const items = Array.isArray(cur?.sub_answers) && cur.sub_answers.length
    ? cur.sub_answers.map((p, i) => ({
        label: p.label || String.fromCharCode(97 + i),
        q: p.question || qParts.parts[i]?.text || '',
        a: p.answer || '',
        marks: Number(p.marks || q?.max_marks || 0),
      }))
    : aParts.parts.length > 1
      ? aParts.parts.map((p, i) => ({ label: p.label, q: qParts.parts[i]?.text || '', a: p.text }))
      : cur ? [{ label: null, q: q?.question_text || '', a: cur.reference_answer }] : [];
  const item = items[Math.min(idx, Math.max(0, items.length - 1))];
  const wordCount = (text = '') => String(text).trim().split(/\s+/).filter(Boolean).length;
  const depthTarget = (marks = 0) => {
    if (marks <= 2) return [70, 120];
    if (marks === 3) return [110, 160];
    if (marks === 4) return [140, 220];
    if (marks === 5) return [180, 260];
    if (marks === 6) return [220, 320];
    if (marks === 7) return [260, 390];
    if (marks === 8) return [300, 450];
    if (marks === 9) return [330, 480];
    return [360, Math.min(600, 360 + marks * 20)];
  };
  const marksForItem = (it) => Number(it?.marks || it?.q?.match(/(?:\[|\(|,|;|\s)(\d+)\s*(?:marks?|m)\b/i)?.[1] || q?.max_marks || 0);
  const itemMarks = marksForItem(item);
  const [targetMin, targetMax] = depthTarget(itemMarks);
  const itemWords = wordCount(item?.a || '');
  const depthOk = !item || itemWords >= targetMin;
  const allPartsDepthOk = items.every((it) => { const marks = marksForItem(it); const [min] = depthTarget(marks); const count = wordCount(it.a); return count >= min; });
  const split = items.length > 1;
  const seenCount = items.filter((_, i) => seen[`${q?.id}:${cur?.id}:${i}`]).length;
  const go = (n) => { const t = Math.max(0, Math.min(items.length - 1, n)); if (t !== idx) { setDir(t > idx ? 1 : -1); setIdx(t); } };

  useEffect(() => { setIdx(0); setDir(1); }, [q?.id, cur?.id]);
  useEffect(() => { if (cur && item) setSeen((m) => ({ ...m, [`${q?.id}:${cur.id}:${idx}`]: true })); }, [q?.id, cur?.id, idx]);
  useEffect(() => {
    const k = (e) => {
      if (/input|textarea/i.test(e.target.tagName) || mode !== 'steps') return;
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const refresh = async (qid) => {
    const v = unwrap(await api.baselineVersions(token, examId, qid));
    setBaselines((b) => ({ ...b, [qid]: Array.isArray(v) ? v : [] }));
  };

  async function run(kind, qid) {
    setBusy(kind); setError('');
    try {
      if (kind === 'draft') await api.baselineDraft(token, examId, qid, {});
      if (kind === 'revise') await api.baselineRevise(token, examId, qid, feedback);
      if (kind === 'approve') await api.baselineApprove(token, examId, qid);
      await refresh(qid);
      setFeedback('');
      await reload();
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }

  async function draftAll() {
    setBusy('draft-all'); setError('');
    try {
      for (const x of questions) {
        const existing = latest(x.id);
        const existingParts = existing ? splitParts(existing.reference_answer).parts : [];
        const needsDepth = !existing || existingParts.some((part) => {
          const marks = Number(part.text.match(/(?:\[|\(|,|;|\s)(\d+)\s*(?:marks?|m)\b/i)?.[1] || x.max_marks);
          const [min] = depthTarget(marks);
          const count = wordCount(part.text);
          return count < min;
        });
        if (needsDepth) await api.baselineDraft(token, examId, x.id, {});
        await refresh(x.id);
      }
      await reload();
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }

  async function approveAll() {
    setBusy('approve-all'); setError('');
    try {
      for (const x of questions) {
        const v = latest(x.id);
        if (v && v.status !== 'approved') await api.baselineApprove(token, examId, x.id);
        await refresh(x.id);
      }
      await reload();
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }

  const approvedCount = questions.filter((x) => latest(x.id)?.status === 'approved').length;
  const shortApprovedCount = questions.filter((x) => {
    const v = latest(x.id);
    if (!v || v.status !== 'approved') return false;
    return splitParts(v.reference_answer).parts.some((part) => {
      const marks = Number(part.text.match(/(?:\[|\(|,|;|\s)(\d+)\s*(?:marks?|m)\b/i)?.[1] || x.max_marks);
      const [min] = depthTarget(marks);
      return wordCount(part.text) < min;
    });
  }).length;
  const draftedCount = questions.filter((x) => latest(x.id)).length;
  const loaderSteps = busy === 'revise' ? REVISE_STEPS : DRAFT_STEPS;
  const loading = ['draft', 'draft-all', 'revise'].includes(busy);

  if (!questions.length) {
    return (<><StepHeader title="Reference answers" /><Notice>Upload the question paper first. The questions appear here once it has been read.</Notice></>);
  }

  return (
    <>
      <MultiStepLoader steps={loaderSteps} loading={loading} duration={2300} title={busy === 'revise' ? 'Rewriting the answer' : 'Writing reference answers'} hint="This is the slow part. Each answer is checked against your notes." />
      <StepHeader title="Review the reference answers">Every student is compared to these. Read each one, ask for a rewrite where it is off, and approve it when it matches what you would accept.</StepHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Pill tone={approvedCount === questions.length ? 'good' : 'warn'}>{approvedCount} of {questions.length} approved</Pill>
        {draftedCount < questions.length && <Button kind="ghost" busy={busy === 'draft-all'} onClick={draftAll}>Write answers for all {questions.length - draftedCount} remaining</Button>}
        {draftedCount === questions.length && approvedCount < questions.length && shortApprovedCount === 0 && <Button kind="ghost" busy={busy === 'approve-all'} onClick={approveAll}>Approve everything as written</Button>}
        {shortApprovedCount > 0 && <Pill tone="warn">{shortApprovedCount} approved answer{shortApprovedCount > 1 ? 's are' : ' is'} below mark depth</Pill>}
      </div>
      <Notice error={error} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Questions" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {questions.map((x, i) => {
            const v = latest(x.id);
            const active = q?.id === x.id;
            return (
              <div key={x.id} className={cn('rounded-xl border p-2', active ? 'border-mustard/50 bg-board-800/80' : 'border-board-700 bg-board-900')}>
                <button onClick={() => { setSel(x.id); setFeedback(''); setIdx(0); }} className="flex w-full items-center gap-3 px-2 py-2 text-left">
                  <span className="font-hand text-2xl text-mustard">Q{x.question_no || i + 1}</span>
                  <span className="flex-1 text-xs text-chalk-dim">{x.max_marks} marks</span>
                  <span className={cn('h-2.5 w-2.5 rounded-full', v?.status === 'approved' ? 'bg-tick' : v ? 'bg-mustard' : 'bg-board-600')} title={v?.status || 'not written'} />
                </button>
                {active && qParts.parts.length > 1 && (
                  <div className="mt-1 space-y-1 border-t border-board-700 pt-2">
                    {qParts.parts.map((part, partIndex) => (
                      <button key={part.label} onClick={() => { setMode('steps'); go(partIndex); }} className={cn('flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors', idx === partIndex ? 'bg-mustard/10 text-mustard' : 'text-chalk-dim hover:bg-board-700/60 hover:text-chalk')}>
                        <span className="font-semibold uppercase">({part.label})</span>
                        <span className="line-clamp-2 flex-1">{part.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <Panel>
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-xl text-chalk">{q?.question_text}</p>
            {cur && <Pill tone={cur.status === 'approved' ? 'good' : 'warn'}>v{cur.version} {cur.status}</Pill>}
          </div>

          <AnimatePresence mode="wait">
            {!cur ? (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-xl border border-dashed border-board-600 p-8 text-center">
                <p className="text-chalk-dim">No reference answer yet.</p>
                <Button className="mt-4" busy={busy === 'draft'} onClick={() => run('draft', q.id)}>Write it from my notes</Button>
              </motion.div>
            ) : (
              <motion.div key={cur.id + cur.version} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {qParts.intro && <p className="mt-5 text-xs uppercase tracking-[0.14em] text-chalk-faint">{qParts.intro.replace(/[\[\]]/g, '')}</p>}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  {split ? (
                    <ol className="flex items-center" aria-label="Sub-questions">
                      {items.map((it, i) => {
                        const on = i === idx, done = seen[`${q.id}:${cur.id}:${i}`] && !on;
                        return (
                          <li key={i} className="flex items-center">
                            {i > 0 && <span className={cn('h-px w-8 transition-colors duration-500 sm:w-12', done || on ? 'bg-tick/60' : 'bg-board-600')} />}
                            <button onClick={() => { setMode('steps'); go(i); }} aria-current={on ? 'step' : undefined} aria-label={`Part ${it.label}`} className={cn('relative grid h-10 w-10 place-items-center rounded-full border font-hand text-sm font-bold uppercase transition-all duration-300 hover:scale-105', on ? 'border-mustard bg-mustard text-board-950 shadow-[0_0_0_4px_rgba(241,210,106,.15)]' : done ? 'border-tick/50 bg-tick/15 text-tick' : 'border-board-600 text-chalk-dim hover:border-chalk-faint')}>
                              {done ? <IconCheck className="h-4 w-4" /> : it.label}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  ) : <span />}
                  {split && (
                    <div className="inline-flex rounded-lg border border-board-600/60 bg-board-900 p-0.5 text-xs" role="tablist" aria-label="Reading mode">
                      {[['steps', 'One at a time'], ['full', 'Full answer']].map(([v, l]) => (
                        <button key={v} role="tab" aria-selected={mode === v} onClick={() => setMode(v)} className={cn('rounded-md px-3 py-1.5 font-medium transition-colors', mode === v ? 'bg-board-700 text-chalk' : 'text-chalk-dim hover:text-chalk')}>{l}</button>
                      ))}
                    </div>
                  )}
                </div>

                {mode === 'steps' || !split ? (
                  <div className="mt-6">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.article key={`${cur.id}-${idx}`} initial={{ opacity: 0, x: 28 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 * dir }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                        {split && <p className="font-hand text-xs uppercase tracking-[0.2em] text-mustard">Part {item.label} of {items.length}</p>}
                        {split && item.q && <h3 className="mt-2 max-w-2xl font-display text-2xl leading-snug text-chalk md:text-[28px]">{rich(item.q)}</h3>}
                        <div className="mt-5 rounded-2xl border border-board-600/50 bg-board-800/70 p-6 md:p-8">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-mustard/30 bg-mustard/10 px-3 py-1 text-xs text-mustard">{itemMarks} marks</span>
                    <span className={cn('rounded-full border px-3 py-1 text-xs', depthOk ? 'border-tick/30 bg-tick/10 text-tick' : 'border-red-400/30 bg-red-400/10 text-red-300')}>{itemWords} words · minimum {targetMin}</span>
                  </div>
                          <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-faint"><span className="h-px w-5 bg-chalk-faint/60" /> Reference answer</p>
                          <div className="max-w-[68ch] space-y-4 text-[17px] leading-[1.85] text-chalk">
                            {paragraphs(item.a).map((p, i) => <p key={i}>{rich(p)}</p>)}
                          </div>
                        </div>
                      </motion.article>
                    </AnimatePresence>
                    {split && (
                      <div className="mt-4 flex items-center justify-between">
                        <Button kind="quiet" disabled={idx === 0} onClick={() => go(idx - 1)}><IconArrow className="h-4 w-4 rotate-180" /> Previous</Button>
                        <span className="text-xs text-chalk-faint">Use the arrow keys to move</span>
                        <Button kind="ghost" disabled={idx === items.length - 1} onClick={() => go(idx + 1)}>Next part <IconArrow className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 divide-y divide-board-700 rounded-2xl border border-board-600/50 bg-board-800/70">
                    {items.map((it) => (
                      <section key={it.label} className="p-6 md:p-8">
                        <p className="font-hand text-xs uppercase tracking-[0.2em] text-mustard">Part {it.label}</p>
                        {it.q && <h3 className="mt-2 max-w-2xl font-display text-xl leading-snug text-chalk">{rich(it.q)}</h3>}
                        <div className="mt-4 max-w-[68ch] space-y-4 text-[17px] leading-[1.85] text-chalk-dim">{paragraphs(it.a).map((p, i) => <p key={i}>{rich(p)}</p>)}</div>
                      </section>
                    ))}
                  </div>
                )}

                {(cur.expected_points || []).length > 0 && (
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-chalk-faint">A good answer should include</p>
                    <ul className="flex flex-wrap gap-2">{cur.expected_points.map((p) => <li key={p} className="rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs text-sky">{p}</li>)}</ul>
                  </div>
                )}

                {cur.status !== 'approved' ? (
                  <div className="mt-6 space-y-3 border-t border-board-700 pt-5">
                    {split && <p className={cn('text-xs', seenCount === items.length ? 'text-tick' : 'text-chalk-faint')}>{seenCount} of {items.length} parts read</p>}
                    <label htmlFor="fb" className="block text-sm font-medium text-chalk">Something off? Tell it what to change</label>
                    <Input as="textarea" id="fb" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Add the difference between abstraction and encapsulation. Keep it under 80 words." />
                    <div className="flex flex-wrap gap-2">
                      <Button kind="ghost" busy={busy === 'revise'} disabled={!feedback.trim()} onClick={() => run('revise', q.id)}><IconRefresh className="h-4 w-4" /> Rewrite with my feedback</Button>
                      <Button kind={allPartsDepthOk ? 'solid' : 'ghost'} busy={busy === 'approve'} disabled={!allPartsDepthOk} onClick={() => run('approve', q.id)}><IconCheck className="h-4 w-4" /> {allPartsDepthOk ? 'Approve this answer' : 'Complete the short parts first'}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3 border-t border-board-700 pt-5">
                    <p className={cn('flex items-center gap-2 text-sm', allPartsDepthOk ? 'text-tick' : 'text-amber-300')}><IconCheck className="h-4 w-4" /> Approved. Changing it later means reviewing this question's factors again.</p>
                    {!allPartsDepthOk && <Button kind="ghost" busy={busy === 'draft'} onClick={() => run('draft', q.id)}><IconRefresh className="h-4 w-4" /> Regenerate full-depth answer</Button>}
                  </div>
                )}

                {versions.length > 1 && (
                  <details className="mt-5 text-sm text-chalk-dim">
                    <summary className="cursor-pointer hover:text-chalk">Earlier versions ({versions.length - 1})</summary>
                    <ul className="mt-2 space-y-1">{versions.slice(1).map((v) => <li key={v.id}>v{v.version}, {v.status}{v.created_at ? `, ${new Date(v.created_at).toLocaleString()}` : ''}</li>)}</ul>
                  </details>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      </div>

      {done.reference && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end">
          <Button onClick={() => ctx.go('factors')}>Continue to marking factors <IconArrow className="h-4 w-4" /></Button>
        </motion.div>
      )}
    </>
  );
}
