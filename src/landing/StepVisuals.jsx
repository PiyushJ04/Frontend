import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react';
import { cn } from '../lib/utils.js';
import { TextGenerateEffect } from '../components/aceternity/TextGenerateEffect.jsx';
import { IconCheck, IconFile, IconLock, IconPlus } from '../components/Icons.jsx';

const shell = 'rounded-2xl border border-board-600/60 bg-board-900 p-5 min-h-[260px]';

/* 1. Uploads */
export function UploadVisual({ active }) {
  const files = [
    ['syllabus.pdf', '3 topics found'],
    ['theory_notes.pdf', '18 pages read'],
    ['question_paper.pdf', '2 questions, 6 parts'],
  ];
  return (
    <div className={shell}>
      <div className="space-y-2.5">
        {files.map(([name, note], i) => (
          <motion.div key={name} initial={{ opacity: 0, x: -16 }} animate={active ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 + i * 0.9, type: 'spring', stiffness: 120, damping: 16 }} className="flex items-center gap-3 rounded-xl bg-board-800 px-3.5 py-3">
            <IconFile className="h-5 w-5 text-chalk-dim" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-chalk">{name}</p>
              <p className="text-xs text-chalk-faint">{note}</p>
            </div>
            <motion.span initial={{ scale: 0 }} animate={active ? { scale: 1 } : {}} transition={{ delay: 0.9 + i * 0.9, type: 'spring', stiffness: 300, damping: 14 }} className="grid h-6 w-6 place-items-center rounded-full bg-tick/20 text-tick"><IconCheck className="h-3.5 w-3.5" /></motion.span>
          </motion.div>
        ))}
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-board-600 px-3.5 py-3 text-sm text-chalk-faint">
          <IconPlus className="h-5 w-5" /> Sample answers, if you have them
        </div>
      </div>
    </div>
  );
}

/* 2. Strictness */
const LEVELS = [
  ['Lenient', 'Credit for the idea, even when the wording is loose.'],
  ['Balanced', 'Key points must be there. Wording can differ.'],
  ['Strict', 'Missing points cost marks. Vague answers lose more.'],
  ['Examiner', 'Close to your reference in content and precision.'],
];
export function StrictnessVisual({ active }) {
  const [i, setI] = useState(1);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((p) => (p + 1) % LEVELS.length), 2000);
    return () => clearInterval(t);
  }, [active]);
  return (
    <div className={shell}>
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-board-800 p-1.5 sm:grid-cols-4" role="tablist" aria-label="Strictness preview">
        {LEVELS.map(([name], k) => (
          <button key={name} role="tab" aria-selected={k === i} onClick={() => setI(k)} className={cn('relative rounded-lg px-2 py-2 text-sm transition-colors', k === i ? 'text-board-950' : 'text-chalk-dim hover:text-chalk')}>
            {k === i && <motion.span layoutId="strict-pill" className="absolute inset-0 rounded-lg bg-chalk" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            <span className="relative">{name}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-6 font-display text-3xl text-chalk leading-tight">
          {LEVELS[i][1]}
        </motion.p>
      </AnimatePresence>
      <div className="mt-8">
        <p className="mb-2 text-xs text-chalk-faint">Similarity needed for full content marks</p>
        <div className="h-1.5 rounded-full bg-board-700">
          <motion.div className="h-full rounded-full bg-mustard" animate={{ width: `${[55, 68, 80, 90][i]}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
      </div>
    </div>
  );
}

/* 3. Reference answer review */
export function ReferenceVisual({ active }) {
  const [approved, setApproved] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setApproved(true), 5200);
    return () => clearTimeout(t);
  }, [active]);
  return (
    <div className={shell}>
      <p className="text-xs text-chalk-faint">Q1(a). Explain encapsulation with an example. 8 marks</p>
      <div className="mt-3 min-h-[118px] rounded-xl bg-board-800 p-4 text-[15px] leading-relaxed text-chalk">
        <TextGenerateEffect run={active} speed={0.12} duration={0.4} words="Encapsulation binds data and the methods that act on it into one class and hides state behind private members. A BankAccount keeps balance private and exposes deposit() and withdraw(), so every change passes through validation." />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {['oop_notes.pdf p.3', 'syllabus.pdf p.1'].map((c, k) => (
          <motion.span key={c} initial={{ opacity: 0, scale: 0.9 }} animate={active ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 4.4 + k * 0.2 }} className="rounded-full border border-sky/30 bg-sky/10 px-2.5 py-0.5 text-xs text-sky">{c}</motion.span>
        ))}
        <div className="ml-auto">
          <motion.button layout className={cn('rounded-lg px-3 py-1.5 text-sm font-semibold', approved ? 'bg-tick/20 text-tick' : 'bg-chalk text-board-950')}>
            {approved ? 'Approved' : 'Approve answer'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* 4. Factors that make up the other 25% */
export function FactorsVisual({ active }) {
  const [rows, setRows] = useState(2);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setRows(3), 2200);
    return () => clearTimeout(t);
  }, [active]);
  const all = [['Diagram, where asked for', 10], ['Presentation and structure', 8], ['Legibility', 7]];
  const total = all.slice(0, rows).reduce((a, [, w]) => a + w, 0);
  return (
    <div className={shell}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-chalk-dim">Content carries 75. Factors share the rest.</p>
        <motion.p animate={{ color: total === 25 ? '#5ED8A4' : '#F1D26A' }} className="font-display text-3xl tabular-nums">{total} / 25</motion.p>
      </div>
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {all.slice(0, rows).map(([name, w]) => (
            <motion.div key={name} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="flex justify-between text-sm"><span className="text-chalk">{name}</span><span className="text-chalk-dim tabular-nums">{w}%</span></div>
              <div className="mt-1.5 h-1.5 rounded-full bg-board-700"><motion.div className="h-full rounded-full bg-mustard" initial={{ width: 0 }} animate={{ width: `${(w / 10) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} /></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs text-chalk-faint"><IconPlus className="h-4 w-4" /> Add or remove factors until the total is exactly 25.</p>
    </div>
  );
}

/* 5. Approve & lock */
export function LockVisual({ active }) {
  return (
    <div className={cn(shell, 'relative overflow-hidden')}>
      <div className="space-y-3 opacity-80">
        {['Reference answers: 6 of 6 approved', 'Factors: 25 of 25 on every question', 'Strictness: Balanced'].map((t) => (
          <div key={t} className="flex items-center gap-3 rounded-xl bg-board-800 px-4 py-3 text-sm text-chalk"><IconCheck className="h-4 w-4 text-tick" />{t}</div>
        ))}
      </div>
      <motion.div
        initial={{ scale: 2.4, rotate: -14, opacity: 0 }}
        animate={active ? { scale: 1, rotate: -7, opacity: 1 } : {}}
        transition={{ delay: 1.4, type: 'spring', stiffness: 380, damping: 18 }}
        className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border-[3px] border-pen px-4 py-2 font-hand text-4xl font-bold text-pen"
      >
        <IconLock className="h-6 w-6" /> Locked
      </motion.div>
    </div>
  );
}

/* 6. Class zip evaluation */
const STUDENTS = ['Aarav K.', 'Diya M.', 'Kabir S.', 'Meera P.', 'Ishaan R.', 'Anaya T.'];
export function ZipVisual({ active }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setDone((d) => (d < STUDENTS.length ? d + 1 : d)), 900);
    return () => clearInterval(t);
  }, [active]);
  return (
    <div className={shell}>
      <div className="mb-3 flex items-center justify-between text-sm"><span className="text-chalk">class_2nd_year.zip</span><span className="text-chalk-dim tabular-nums">{done} of {STUDENTS.length} marked</span></div>
      <div className="space-y-1.5">
        {STUDENTS.map((s, i) => (
          <div key={s} className="flex items-center gap-3 rounded-lg bg-board-800 px-3 py-2">
            <span className="w-24 truncate text-sm text-chalk">{s}</span>
            <div className="h-1.5 flex-1 rounded-full bg-board-700">
              <motion.div className="h-full rounded-full bg-tick" initial={{ width: 0 }} animate={{ width: i < done ? '100%' : i === done ? '60%' : '0%' }} transition={{ duration: i === done ? 1.6 : 0.4, ease: 'easeOut' }} />
            </div>
            <span className="w-5">{i < done && <IconCheck className="h-4 w-4 text-tick" />}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 7. Class statistics */
export function StatsVisual({ active }) {
  const bars = [18, 34, 52, 78, 100, 84, 56, 30];
  const qs = [['Q1', 74], ['Q2', 61]];
  return (
    <div className={shell}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-chalk-faint">How the class scored</p>
          <div className="flex h-28 items-end gap-1.5">
            {bars.map((h, i) => (
              <motion.div key={i} className="flex-1 rounded-t bg-mustard/80" initial={{ height: 0 }} animate={active ? { height: `${h}%` } : {}} transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 120, damping: 16 }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-chalk-faint"><span>0%</span><span>100%</span></div>
        </div>
        <div>
          <p className="mb-2 text-xs text-chalk-faint">Class average against your reference</p>
          <div className="space-y-4 pt-1">
            {qs.map(([q, v], i) => (
              <div key={q}>
                <div className="flex justify-between text-sm"><span className="text-chalk">{q}</span><span className="text-chalk-dim tabular-nums">{v}%</span></div>
                <div className="relative mt-1.5 h-2 rounded-full bg-board-700">
                  <motion.div className="h-full rounded-full bg-tick" initial={{ width: 0 }} animate={active ? { width: `${v}%` } : {}} transition={{ delay: 0.6 + i * 0.2, duration: 0.9 }} />
                  <div className="absolute -top-1 right-0 h-4 border-r-2 border-dashed border-chalk/70" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2 text-xs">
            <span className="rounded-full bg-tick/15 px-2.5 py-1 text-tick">3 toppers</span>
            <span className="rounded-full bg-pen/15 px-2.5 py-1 text-pen-soft">2 below pass</span>
          </div>
        </div>
      </div>
    </div>
  );
}
