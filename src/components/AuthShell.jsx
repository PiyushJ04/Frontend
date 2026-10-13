import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Spotlight } from './aceternity/Spotlight.jsx';
import { BackgroundBeams } from './aceternity/BackgroundBeams.jsx';
import { TextGenerateEffect } from './aceternity/TextGenerateEffect.jsx';
import { IconShield } from './Icons.jsx';

const POINTS = [
  'You approve every reference answer before any paper is marked.',
  'Theory is 75 of the marks. You choose the factors for the other 25.',
  'Each mark shows how far the answer sat from your reference.',
];

export default function AuthShell({ children, title, subtitle, wide }) {
  return (
    <div className="grid min-h-screen bg-board-950 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative isolate hidden overflow-hidden border-r border-board-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <BackgroundBeams className="opacity-60" />
        <Spotlight className="-top-40 left-0" fill="#ECEFE4" />
        <Link to="/" className="relative z-10 font-display text-3xl text-chalk">Marklane</Link>
        <div className="relative z-10">
          <TextGenerateEffect as="p" words="Grading you can show your students." speed={0.16} className="font-display text-5xl leading-[1.02] text-chalk" />
          <ul className="mt-10 space-y-5">
            {POINTS.map((p, i) => (
              <motion.li key={p} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 + i * 0.35 }} className="flex gap-3 text-chalk-dim">
                <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-tick" />
                <span className="max-w-sm leading-relaxed">{p}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-sm text-chalk-faint">Your papers and approvals stay tied to your account.</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-14">
        <div className={wide ? 'w-full max-w-xl' : 'w-full max-w-md'}>
          <Link to="/" className="mb-8 block font-display text-3xl text-chalk lg:hidden">Marklane</Link>
          <h1 className="font-display text-4xl leading-tight text-chalk md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 text-chalk-dim">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
