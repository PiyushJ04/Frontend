import { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Card Spotlight (cursor-following radial reveal)
export function CardSpotlight({ children, radius = 320, color = 'rgba(94,216,164,0.16)', className, as: Tag = 'div', ...props }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hover, setHover] = useState(false);
  const handleMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };
  const bg = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 80%)`;
  return (
    <Tag
      className={cn('group/spot relative overflow-hidden rounded-2xl border border-board-600/60 bg-board-900', className)}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <motion.div className="pointer-events-none absolute -inset-px rounded-2xl transition duration-300" style={{ background: bg, opacity: hover ? 1 : 0 }} />
      <div className="relative z-10 h-full">{children}</div>
    </Tag>
  );
}
