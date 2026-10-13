import { useEffect, useMemo, useState } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { api } from '../../api/client.js';
import { Notice, Panel, Pill, StepHeader, fmt, unwrap, Spinner } from '../../components/ui.jsx';
import { CardSpotlight } from '../../components/aceternity/CardSpotlight.jsx';
import { cn } from '../../lib/utils.js';

function Ticker({ value, suffix = '', digits = 1 }) {
  const mv = useMotionValue(0);
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(mv, Number(value) || 0, { duration: 1.1, ease: 'easeOut' });
    const off = mv.on('change', setV);
    return () => { c.stop(); off(); };
  }, [value]);
  return <>{v.toFixed(digits)}{suffix}</>;
}

export default function ResultsStep({ ctx }) {
  const { token, examId } = ctx;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pass, setPass] = useState(40);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setData(null); setError('');
    api.analytics(token, examId).then((r) => setData(unwrap(r))).catch((e) => setError(e.message));
  }, [token, examId]);

  const students = data?.students || [];
  const sorted = useMemo(() => [...students].sort((a, b) => b.percentage - a.percentage), [students]);
  const toppers = sorted.slice(0, 3);
  const failing = sorted.filter((s) => s.percentage < pass);
  const buckets = useMemo(() => { const b = Array(10).fill(0); students.forEach((s) => { b[Math.min(9, Math.floor((s.percentage || 0) / 10))] += 1; }); return b; }, [students]);
  const peak = Math.max(1, ...buckets);

  if (error) return (<><StepHeader title="Class results" /><Notice error={error} /><p className="mt-3 text-chalk-dim">Results appear once the papers have been marked.</p></>);
  if (!data) return (<><StepHeader title="Class results" /><div className="flex items-center gap-3 text-chalk-dim"><Spinner /> Putting the class together</div></>);

  const s = data.summary || {};
  const tiles = [['Class average', s.average_percentage, '%'], ['Papers marked', s.evaluated_students, '', 0], ['Highest', s.maximum_percentage, '%'], ['Lowest', s.minimum_percentage, '%']];
  const acad = Number(s.average_academic_points) || 0, fac = Number(s.average_factor_points) || 0, sum = acad + fac || 1;

  return (
    <>
      <StepHeader title="How the class did">Every figure below comes from the marks saved for each paper. Nothing here is estimated on this page.</StepHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, v, suf, d = 1]) => (
          <CardSpotlight key={label} className="p-5"><p className="text-sm text-chalk-dim">{label}</p><p className="mt-2 font-display text-5xl text-chalk"><Ticker value={v} suffix={suf} digits={d} /></p></CardSpotlight>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-2xl text-chalk">Toppers</h2>
          <ol className="mt-3 space-y-2">
            {toppers.map((t, i) => (
              <motion.li key={t.student_identifier} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * i }} className="flex items-center gap-4 rounded-xl bg-board-800 px-4 py-3">
                <span className="font-hand text-3xl text-mustard">{i + 1}</span>
                <span className="flex-1 truncate text-chalk">{t.student_identifier}</span>
                <span className="text-sm text-chalk-dim tabular-nums">{fmt(t.total_points)} / {fmt(t.max_points)}</span>
                <span className="w-14 text-right font-display text-xl text-tick tabular-nums">{fmt(t.percentage)}%</span>
              </motion.li>
            ))}
          </ol>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-chalk">Below pass mark</h2>
            <label className="flex items-center gap-2 text-sm text-chalk-dim">Pass mark
              <input type="number" min="0" max="100" value={pass} onChange={(e) => setPass(Number(e.target.value))} className="h-8 w-16 rounded-md bg-board-800 px-2 text-right text-chalk tabular-nums" aria-label="Pass mark in percent" />%
            </label>
          </div>
          {failing.length === 0 ? <p className="mt-4 text-tick">Everyone is at or above {pass}%.</p> : (
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {failing.map((t) => <li key={t.student_identifier} className="flex items-center justify-between rounded-xl bg-board-800 px-4 py-2.5"><span className="truncate text-chalk">{t.student_identifier}</span><Pill tone="bad">{fmt(t.percentage)}%</Pill></li>)}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-2xl text-chalk">Score spread</h2>
          <div className="mt-4 flex h-36 items-end gap-1.5" role="img" aria-label="Number of students in each ten percent band">
            {buckets.map((n, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end">
                <motion.div initial={{ height: 0 }} animate={{ height: `${(n / peak) * 100}%` }} transition={{ delay: 0.05 * i, type: 'spring', stiffness: 110, damping: 16 }} className={cn('rounded-t', i * 10 < pass ? 'bg-pen/70' : 'bg-mustard/80')} title={`${i * 10}-${i * 10 + 10}%: ${n}`} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-chalk-faint"><span>0%</span><span>50%</span><span>100%</span></div>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl text-chalk">Each question against your reference</h2>
          <div className="mt-4 space-y-4">
            {(data.questions || []).map((q, i) => (
              <div key={q.question_id}>
                <div className="flex justify-between text-sm"><span className="text-chalk">Q{q.question_no}</span><span className="text-chalk-dim tabular-nums">{fmt(q.average_percentage)}% average, {q.evaluated_students} papers</span></div>
                <div className="relative mt-1.5 h-2.5 rounded-full bg-board-700">
                  <motion.div className="h-full rounded-full bg-tick" initial={{ width: 0 }} animate={{ width: `${Math.min(100, q.average_percentage || 0)}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.9 }} />
                  <div className="absolute -top-1 right-0 h-4.5 border-r-2 border-dashed border-chalk/70" style={{ height: 18 }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-chalk-faint">The dashed line is your approved reference answer.</p>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <h2 className="font-display text-2xl text-chalk">Where the marks came from</h2>
        <div className="mt-4 flex h-9 overflow-hidden rounded-lg text-sm font-semibold">
          <motion.div className="grid place-items-center bg-chalk text-board-950" initial={{ width: 0 }} animate={{ width: `${(acad / sum) * 100}%` }} transition={{ duration: 0.9 }}>Content {fmt(acad)}</motion.div>
          <motion.div className="grid flex-1 place-items-center bg-mustard text-board-950" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>Factors {fmt(fac)}</motion.div>
        </div>
        <p className="mt-2 text-xs text-chalk-faint">Average points per paper from content and from your marking factors.</p>
      </Panel>

      <Panel className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-chalk">Every student</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or roll number" aria-label="Search students" className="h-9 w-64 rounded-md bg-board-800 px-3 text-sm text-chalk placeholder:text-chalk-faint" />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-chalk-faint"><tr><th className="py-2 font-medium">Student</th><th className="font-medium">Points</th><th className="font-medium">Percentage</th></tr></thead>
            <tbody className="divide-y divide-board-700">
              {sorted.filter((t) => t.student_identifier.toLowerCase().includes(query.toLowerCase())).map((t) => (
                <tr key={t.student_identifier}>
                  <td className="py-2.5 text-chalk">{t.student_identifier}</td>
                  <td className="text-chalk-dim tabular-nums">{fmt(t.total_points)} / {fmt(t.max_points)}</td>
                  <td><div className="flex items-center gap-3"><div className="h-1.5 w-28 rounded-full bg-board-700"><div className={cn('h-full rounded-full', t.percentage < pass ? 'bg-pen' : 'bg-tick')} style={{ width: `${Math.min(100, t.percentage)}%` }} /></div><span className="tabular-nums text-chalk">{fmt(t.percentage)}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
