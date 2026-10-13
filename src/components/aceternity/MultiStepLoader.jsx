import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils.js';
import { IconCheck } from '../Icons.jsx';

// Full-screen progress for long jobs. A sheet of paper is scanned inside a progress ring while the steps tick off.
function Orb({ pct }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-40 w-40 place-items-center" aria-hidden="true">
      <motion.div className="absolute inset-3 rounded-full bg-[conic-gradient(from_0deg,transparent,#F1D26A,#5ED8A4,transparent_70%)] opacity-50 blur-2xl" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <defs><linearGradient id="orbg" x1="0" x2="1"><stop offset="0" stopColor="#5ED8A4" /><stop offset="1" stopColor="#F1D26A" /></linearGradient></defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1a382e" strokeWidth="4" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke="url(#orbg)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ type: 'spring', stiffness: 40, damping: 16 }} />
      </svg>
      <motion.div className="relative h-[72px] w-14 overflow-hidden rounded-md bg-paper shadow-[0_12px_30px_rgba(0,0,0,.5)]" animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="space-y-[7px] p-2 pt-3">{[100, 82, 94, 60, 88].map((w, i) => <motion.div key={i} className="h-[3px] rounded-full bg-ink/25" initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }} />)}</div>
        <motion.div className="absolute inset-x-0 h-[2px] bg-mustard shadow-[0_0_14px_3px_rgba(241,210,106,.8)]" animate={{ top: ['6%', '94%'] }} transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      </motion.div>
    </div>
  );
}

function Dots() {
  return <span className="ml-1 inline-flex gap-0.5" aria-hidden="true">{[0, 1, 2].map((i) => <motion.span key={i} className="h-1 w-1 rounded-full bg-mustard" animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />)}</span>;
}

export function MultiStepLoader({ steps, loading, duration = 2000, title, hint }) {
  const [current, setCurrent] = useState(0);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!loading) { setCurrent(0); return; }
    const t = setTimeout(() => setCurrent((p) => Math.min(p + 1, steps.length - 1)), duration);
    return () => clearTimeout(t);
  }, [current, loading, duration, steps.length]);
  useEffect(() => {
    if (!loading) { setSecs(0); return; }
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);
  const pct = Math.min(0.96, (current + 0.55) / steps.length);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div role="status" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} className="grain fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-board-950/90 backdrop-blur-2xl">
          <motion.div aria-hidden="true" className="absolute left-1/4 top-1/4 h-[420px] w-[420px] rounded-full bg-tick/15 blur-[120px]" animate={{ x: [0, 50, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden="true" className="absolute bottom-1/4 right-1/4 h-[360px] w-[360px] rounded-full bg-mustard/10 blur-[120px]" animate={{ x: [0, -40, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
            <Orb pct={pct} />
            {title && <h2 className="mt-6 text-center font-display text-4xl leading-tight text-chalk">{title}</h2>}
            {hint && <p className="mt-2 text-center text-sm text-chalk-dim">{hint}</p>}

            <ol className="mt-8 w-full space-y-1.5 rounded-2xl border border-board-600/50 bg-board-900/70 p-2.5 shadow-[0_24px_70px_rgba(0,0,0,.45)]">
              {steps.map((s, i) => {
                const st = i < current ? 'done' : i === current ? 'now' : 'next';
                return (
                  <motion.li key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: st === 'next' ? 0.45 : 1, x: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-500', st === 'now' && 'bg-board-800 ring-1 ring-mustard/30')}>
                    <span className="relative grid h-6 w-6 shrink-0 place-items-center">
                      {st === 'done' && <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 16 }} className="grid h-6 w-6 place-items-center rounded-full bg-tick text-board-950"><IconCheck className="h-3.5 w-3.5" /></motion.span>}
                      {st === 'now' && <><span className="absolute inset-0 animate-ping2 rounded-full bg-mustard/40" /><span className="h-3 w-3 rounded-full bg-mustard" /></>}
                      {st === 'next' && <span className="h-2 w-2 rounded-full bg-board-500" />}
                    </span>
                    <span className={cn('text-[15px] transition-colors duration-500', st === 'done' && 'text-chalk-dim', st === 'now' && 'font-medium text-chalk', st === 'next' && 'text-chalk-faint')}>{s.text}</span>
                    {st === 'now' && <Dots />}
                  </motion.li>
                );
              })}
            </ol>

            <div className="mt-5 flex w-full items-center gap-3">
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-board-700">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-tick to-mustard" animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 40, damping: 16 }} />
                <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)] bg-[length:50%_100%]" />
              </div>
              <span className="w-10 text-right font-hand text-xs tabular-nums text-chalk-faint">{secs}s</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
