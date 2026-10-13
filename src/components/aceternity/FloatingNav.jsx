import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Floating Navbar (hides while scrolling down, returns on scroll up)
export function FloatingNav({ navItems, actions, className }) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    if (typeof current !== 'number') return;
    const prev = scrollYProgress.getPrevious() ?? 0;
    if (scrollYProgress.get() < 0.04) setVisible(true);
    else setVisible(current - prev < 0);
  });
  return (
    <AnimatePresence mode="wait">
      <motion.nav
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        aria-label="Primary"
        className={cn('fixed top-4 inset-x-0 mx-auto z-[5000] flex max-w-fit items-center gap-1 rounded-full border border-chalk/10 bg-board-900/80 backdrop-blur-xl pl-5 pr-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,.45)]', className)}
      >
        <a href="/" className="font-display text-xl text-chalk pr-3 mr-1 border-r border-chalk/10">Marklane</a>
        {navItems.map((item) => (
          <a key={item.name} href={item.link} className="hidden sm:block rounded-full px-3 py-1.5 text-sm text-chalk-dim hover:text-chalk hover:bg-board-700/60 transition-colors">
            {item.name}
          </a>
        ))}
        <div className="flex items-center gap-1 pl-1">{actions}</div>
      </motion.nav>
    </AnimatePresence>
  );
}
