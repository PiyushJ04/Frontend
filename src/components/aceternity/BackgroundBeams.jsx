import { motion } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Background Beams (paths generated from the original curve family)
const PATHS = Array.from({ length: 36 }, (_, i) => {
  const a = 380 - i * 5, b = 189 + i * 6, c = 312 - i * 5, d = 216 - i * 6, e = 152 - i * 5, f = 343 - i * 6;
  const g = 616 - i * 5, h = 470 - i * 6, j = 684 - i * 5, k = 875 - i * 6;
  return `M-${a} -${b}C-${a} -${b} -${c} ${d} ${e} ${f}C${g} ${h} ${j} ${k} ${j} ${k}`;
});

export function BackgroundBeams({ className }) {
  return (
    <div className={cn('absolute inset-0 flex h-full w-full items-center justify-center [mask-repeat:no-repeat] [mask-size:40px] pointer-events-none', className)} aria-hidden="true">
      <svg className="pointer-events-none absolute z-0 h-full w-full" width="100%" height="100%" viewBox="0 0 696 316" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={PATHS.join(' ')} stroke="url(#beam-base)" strokeOpacity="0.35" strokeWidth="0.5" />
        {PATHS.map((path, index) => (
          <motion.path
            key={`beam-${index}`}
            d={path}
            stroke={`url(#beam-grad-${index})`}
            strokeOpacity="0.5"
            strokeWidth="0.5"
          />
        ))}
        <defs>
          {PATHS.map((_, index) => (
            <motion.linearGradient
              id={`beam-grad-${index}`}
              key={`beam-grad-${index}`}
              initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
              animate={{ x1: ['0%', '100%'], x2: ['0%', '95%'], y1: ['0%', '100%'], y2: ['0%', `${93 + (index % 8) * 1}%`] }}
              transition={{ duration: 9 + (index % 9), ease: 'easeInOut', repeat: Infinity, delay: (index % 7) * 0.6 }}
            >
              <stop stopColor="#F1D26A" stopOpacity="0" />
              <stop stopColor="#F1D26A" />
              <stop offset="32.5%" stopColor="#5ED8A4" />
              <stop offset="100%" stopColor="#5ED8A4" stopOpacity="0" />
            </motion.linearGradient>
          ))}
          <radialGradient id="beam-base" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)">
            <stop offset="0.0666667" stopColor="#d4d4d4" />
            <stop offset="0.243243" stopColor="#d4d4d4" />
            <stop offset="0.43594" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
