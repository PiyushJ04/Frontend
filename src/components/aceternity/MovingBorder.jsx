import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Moving Border
export function MovingBorderButton({ borderRadius = '1rem', children, as: Component = 'button', containerClassName, borderClassName, duration = 2600, className, ...otherProps }) {
  return (
    <Component
      className={cn('relative h-12 p-[1px] overflow-hidden bg-transparent disabled:opacity-50 disabled:pointer-events-none', containerClassName)}
      style={{ borderRadius }}
      {...otherProps}
    >
      <div className="absolute inset-0" style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}>
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div className={cn('h-20 w-20 opacity-[0.9] bg-[radial-gradient(#F1D26A_40%,transparent_60%)]', borderClassName)} />
        </MovingBorder>
      </div>
      <div
        className={cn('relative bg-board-900/90 border border-board-600/60 backdrop-blur-xl text-chalk flex items-center justify-center gap-2 w-full h-full text-sm font-medium antialiased px-6', className)}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  );
}

export function MovingBorder({ children, duration = 2000, rx, ry, ...other }) {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);
  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) progress.set((time * (length / duration)) % length);
  });
  const x = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).x);
  const y = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).y);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute h-full w-full" width="100%" height="100%" {...other}>
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div style={{ position: 'absolute', top: 0, left: 0, display: 'inline-block', transform }}>{children}</motion.div>
    </>
  );
}
