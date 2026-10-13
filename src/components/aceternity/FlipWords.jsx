import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Flip Words
export function FlipWords({ words, duration = 2600, className }) {
  const [current, setCurrent] = useState(words[0]);
  const [animating, setAnimating] = useState(false);
  const next = useCallback(() => {
    setCurrent(words[(words.indexOf(current) + 1) % words.length]);
    setAnimating(true);
  }, [current, words]);
  useEffect(() => {
    if (animating) return;
    const t = setTimeout(next, duration);
    return () => clearTimeout(t);
  }, [animating, duration, next]);
  return (
    <AnimatePresence onExitComplete={() => setAnimating(false)}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        exit={{ opacity: 0, y: -40, x: 40, filter: 'blur(8px)', scale: 2, position: 'absolute' }}
        className={cn('relative z-10 inline-block text-left', className)}
        key={current}
      >
        {current.split(' ').map((word, wi) => (
          <motion.span key={word + wi} initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: wi * 0.3, duration: 0.3 }} className="inline-block whitespace-nowrap">
            {word.split('').map((l, li) => (
              <motion.span key={word + li} initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: wi * 0.3 + li * 0.04, duration: 0.2 }} className="inline-block">
                {l}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
