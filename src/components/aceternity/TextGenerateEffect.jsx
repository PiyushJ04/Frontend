import { useEffect } from 'react';
import { motion, stagger, useAnimate } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Text Generate Effect. `run` lets callers start it when scrolled into view.
export function TextGenerateEffect({ words, className, filter = true, duration = 0.5, run = true, as: Tag = 'div', speed = 0.2 }) {
  const [scope, animate] = useAnimate();
  const wordsArray = String(words || '').split(' ');
  useEffect(() => {
    if (!run || !scope.current) return;
    animate('span', { opacity: 1, filter: filter ? 'blur(0px)' : 'none' }, { duration: duration || 1, delay: stagger(speed) });
  }, [run, words]);
  return (
    <Tag className={cn(className)}>
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <motion.span key={word + idx} className="opacity-0" style={{ filter: filter ? 'blur(10px)' : 'none' }}>
            {word}{' '}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
