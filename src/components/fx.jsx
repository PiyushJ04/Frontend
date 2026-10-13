import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useScroll, useSpring } from 'motion/react';
import { cn } from '../lib/utils.js';

// Thin gradient bar that fills as the page is read.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div aria-hidden="true" style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-tick via-mustard to-sky" />;
}

// A soft light that follows the pointer.
export function CursorGlow() {
  const x = useMotionValue(-400), y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 90, damping: 20 }), sy = useSpring(y, { stiffness: 90, damping: 20 });
  useEffect(() => {
    const m = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('pointermove', m, { passive: true });
    return () => window.removeEventListener('pointermove', m);
  }, [x, y]);
  return <motion.div aria-hidden="true" style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-0 -ml-[260px] -mt-[260px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(241,210,106,.10),rgba(94,216,164,.04)_45%,transparent_70%)]" />;
}

// Buttons lean toward the pointer.
export function Magnetic({ children, strength = 0.3, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 14 }), sy = useSpring(y, { stiffness: 220, damping: 14 });
  const move = (e) => { const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * strength); y.set((e.clientY - r.top - r.height / 2) * strength); };
  const leave = () => { x.set(0); y.set(0); };
  return <motion.div ref={ref} onPointerMove={move} onPointerLeave={leave} whileTap={{ scale: 0.96 }} style={{ x: sx, y: sy }} className={cn('inline-block', className)}>{children}</motion.div>;
}

// 3D tilt that follows the pointer.
export function Tilt({ children, max = 7, className }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 }), ry = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 });
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2); rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2); };
  const leave = () => { rx.set(0); ry.set(0); };
  return <motion.div onPointerMove={move} onPointerLeave={leave} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }} className={className}>{children}</motion.div>;
}

// Fade, rise and un-blur as it scrolls into view.
export function Reveal({ children, delay = 0, y = 26, className }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-70px' }} transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function CountUp({ to, suffix = '' }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}
