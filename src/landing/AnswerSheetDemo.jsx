import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue } from 'motion/react';

function Tick({ delay, run }) {
  return (
    <motion.svg viewBox="0 0 28 28" className="absolute -right-9 top-0 h-7 w-7" initial="hidden" animate={run ? 'show' : 'hidden'} aria-hidden="true">
      <motion.path
        d="M4 15 L11 22 L24 5"
        fill="none"
        stroke="#D8372A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { delay, duration: 0.35 } } }}
      />
    </motion.svg>
  );
}

function Counter({ to, run, delay = 0, digits = 1 }) {
  const mv = useMotionValue(0);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const controls = animate(mv, to, { duration: 1.2, delay, ease: 'easeOut' });
    const off = mv.on('change', (x) => setV(x));
    return () => { controls.stop(); off(); };
  }, [run]);
  return <>{v.toFixed(digits)}</>;
}

const SENTENCES = [
  'Encapsulation means wrapping data and methods together inside one class.',
  "The variables are kept private, so outside code can't change them directly.",
  'Example: a BankAccount keeps balance private and has a deposit() method.',
];

export default function AnswerSheetDemo() {
  const ref = useRef(null);
  const run = useInView(ref, { once: true, amount: 0.35 });
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[520px] pb-24 sm:pb-20">
      <motion.div
        initial={{ opacity: 0, rotate: 3, y: 30 }}
        animate={run ? { opacity: 1, rotate: -1.6, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 70, damping: 14 }}
        className="relative rounded-md bg-paper p-6 pr-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)] paper-ruled"
        role="img"
        aria-label="A student answer on paper being marked with red ticks and a score of 6.5 out of 8"
      >
        <div className="absolute left-0 top-0 h-full w-8 border-r border-pen/30" aria-hidden="true" />
        <p className="pl-6 font-semibold text-ink text-[15px] leading-8">
          Q1(a). Explain encapsulation with an example. <span className="font-normal text-ink/60">(8 marks)</span>
        </p>
        <div className="pl-6 pt-2">
          {SENTENCES.map((s, i) => (
            <div key={s} className="relative mb-0">
              <motion.p
                className="hand-ink text-[24px] leading-8"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={run ? { clipPath: 'inset(0 0% 0 0)' } : {}}
                transition={{ delay: 0.5 + i * 0.7, duration: 0.65, ease: 'easeOut' }}
              >
                {s}
              </motion.p>
              <Tick delay={1.0 + i * 0.7} run={run} />
            </div>
          ))}
          <motion.p
            className="hand-pen ml-4 mt-1 -rotate-2 text-[22px] leading-8"
            initial={{ opacity: 0, x: -8 }}
            animate={run ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 2.9, duration: 0.4 }}
          >
            withdraw() has no validation: −1.1
          </motion.p>
        </div>
        <div className="relative mt-3 flex justify-end pr-2">
          <svg viewBox="0 0 160 70" className="absolute -top-1 right-0 h-[72px] w-[150px]" aria-hidden="true">
            <motion.ellipse
              cx="80" cy="35" rx="72" ry="28" fill="none" stroke="#D8372A" strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={run ? { pathLength: 1 } : {}} transition={{ delay: 3.4, duration: 0.7 }}
            />
          </svg>
          <p className="hand-pen relative px-6 py-3 text-[34px] font-bold leading-none">
            <Counter to={6.5} run={run} delay={3.4} /> / 8
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={run ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 3.9, type: 'spring', stiffness: 90, damping: 16 }}
        className="absolute bottom-0 left-2 right-2 sm:left-8 sm:right-auto sm:w-[380px] rounded-xl border border-board-600 bg-board-900/95 p-4 backdrop-blur"
      >
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-chalk">Distance from your approved answer</span>
          <span className="text-tick tabular-nums"><Counter to={0.82} run={run} delay={4} digits={2} /> similar</span>
        </div>
        <div className="relative mt-3 h-2 rounded-full bg-board-700">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-mustard to-tick" initial={{ width: 0 }} animate={run ? { width: '82%' } : {}} transition={{ delay: 4, duration: 1.2, ease: 'easeOut' }} />
          <div className="absolute -top-1.5 right-0 h-5 w-0.5 bg-chalk" />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-chalk-faint"><span>far</span><span>your reference</span></div>
        <p className="mt-2 text-xs text-chalk-dim">Content 4.9 of 6, factors 1.6 of 2, total 6.5 of 8.</p>
      </motion.div>
    </div>
  );
}
