import { motion } from 'motion/react';
import { IconCheck } from '../components/Icons.jsx';

export function OwnedVisual() {
  return (
    <div className="relative h-full overflow-hidden rounded-xl bg-board-800 p-4">
      <div className="space-y-2">
        {[92, 100, 78, 64].map((w, i) => (
          <motion.div key={i} className="h-2 rounded-full bg-chalk/25" initial={{ width: 0 }} whileInView={{ width: `${w}%` }} viewport={{ once: true }} transition={{ delay: 0.15 * i, duration: 0.7 }} />
        ))}
      </div>
      <motion.div initial={{ scale: 2, opacity: 0, rotate: -12 }} whileInView={{ scale: 1, opacity: 1, rotate: -6 }} viewport={{ once: true }} transition={{ delay: 0.8, type: 'spring', stiffness: 360, damping: 18 }} className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-md border-[3px] border-tick px-3 py-1 font-hand text-3xl font-bold text-tick">
        <IconCheck className="h-5 w-5" /> You approved this
      </motion.div>
    </div>
  );
}

export function DistanceVisual() {
  const dots = [[12, 38], [26, 62], [44, 30], [58, 55], [71, 40], [83, 50]];
  return (
    <div className="relative h-full overflow-hidden rounded-xl bg-board-800">
      <div className="absolute inset-y-0 right-[10%] border-r-2 border-dashed border-mustard/70" />
      <span className="absolute right-[11%] top-2 text-[11px] text-mustard">your reference</span>
      {dots.map(([x, y], i) => (
        <motion.span key={i} className="absolute h-3 w-3 rounded-full bg-tick" style={{ top: `${y}%` }} initial={{ left: '2%', opacity: 0 }} whileInView={{ left: `${x}%`, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 * i, type: 'spring', stiffness: 60, damping: 14 }} />
      ))}
    </div>
  );
}

export function SplitVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 rounded-xl bg-board-800 p-4">
      <div className="flex h-9 overflow-hidden rounded-lg text-sm font-semibold">
        <motion.div className="grid place-items-center bg-chalk text-board-950" initial={{ width: 0 }} whileInView={{ width: '75%' }} viewport={{ once: true }} transition={{ duration: 0.9 }}>Content 75</motion.div>
        <motion.div className="grid flex-1 place-items-center bg-mustard text-board-950" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>25</motion.div>
      </div>
      <p className="text-xs text-chalk-dim">Diagrams, presentation and legibility share the 25.</p>
    </div>
  );
}

export function SourceVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded-xl bg-board-800 p-4">
      {['oop_notes.pdf p.3', 'oop_notes.pdf p.4', 'syllabus.pdf p.1'].map((c, i) => (
        <motion.div key={c} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.18 }} className="w-fit rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs text-sky">{c}</motion.div>
      ))}
    </div>
  );
}

export function ReaderVisual() {
  return (
    <div className="grid h-full grid-cols-2 gap-3 rounded-xl bg-board-800 p-4 text-center">
      <div className="flex flex-col justify-center rounded-lg border border-board-600 p-3">
        <p className="font-display text-2xl text-chalk">Model</p>
        <p className="mt-1 text-xs text-chalk-dim">reads handwriting and text</p>
      </div>
      <div className="flex flex-col justify-center rounded-lg border border-mustard/50 p-3">
        <p className="font-display text-2xl text-mustard">Your scheme</p>
        <p className="mt-1 text-xs text-chalk-dim">and similarity decide the mark</p>
      </div>
    </div>
  );
}
