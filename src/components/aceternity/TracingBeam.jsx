import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Tracing Beam
export function TracingBeam({ children, className }) {
  const ref = useRef(null);
  const contentRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 12%', 'end 60%'] });
  const [svgHeight, setSvgHeight] = useState(0);
  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => setSvgHeight(contentRef.current.offsetHeight));
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);
  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), { stiffness: 500, damping: 90 });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]), { stiffness: 500, damping: 90 });
  return (
    <motion.div ref={ref} className={cn('relative w-full max-w-5xl mx-auto', className)}>
      <div className="absolute -left-2 md:-left-10 top-3 hidden sm:block">
        <motion.div
          transition={{ duration: 0.2, delay: 0.5 }}
          animate={{ boxShadow: scrollYProgress.get() > 0 ? 'none' : 'rgba(241,210,106,.25) 0px 3px 8px' }}
          className="ml-[27px] h-4 w-4 rounded-full border border-board-600 shadow-sm flex items-center justify-center"
        >
          <motion.div
            transition={{ duration: 0.2, delay: 0.5 }}
            animate={{ backgroundColor: scrollYProgress.get() > 0 ? '#244b3f' : '#F1D26A', borderColor: scrollYProgress.get() > 0 ? '#244b3f' : '#F1D26A' }}
            className="h-2 w-2 rounded-full border border-board-600 bg-board-600"
          />
        </motion.div>
        <svg viewBox={`0 0 20 ${svgHeight}`} width="20" height={svgHeight} className="ml-4 block" aria-hidden="true">
          <motion.path d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`} fill="none" stroke="#244b3f" strokeOpacity="0.5" transition={{ duration: 10 }} />
          <motion.path d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`} fill="none" stroke="url(#tracing-grad)" strokeWidth="1.5" className="motion-reduce:hidden" transition={{ duration: 10 }} />
          <defs>
            <motion.linearGradient id="tracing-grad" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={y1} y2={y2}>
              <stop stopColor="#F1D26A" stopOpacity="0" />
              <stop stopColor="#F1D26A" />
              <stop offset="0.325" stopColor="#5ED8A4" />
              <stop offset="1" stopColor="#5ED8A4" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}
