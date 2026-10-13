import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Hover Border Gradient
export function HoverBorderGradient({ children, containerClassName, className, as: Tag = 'button', duration = 1, clockwise = true, ...props }) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState('TOP');
  const rotateDirection = (d) => {
    const dirs = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];
    const i = dirs.indexOf(d);
    return dirs[clockwise ? (i - 1 + dirs.length) % dirs.length : (i + 1) % dirs.length];
  };
  const movingMap = {
    TOP: 'radial-gradient(20.7% 50% at 50% 0%, #F1D26A 0%, rgba(241,210,106,0) 100%)',
    LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, #F1D26A 0%, rgba(241,210,106,0) 100%)',
    BOTTOM: 'radial-gradient(20.7% 50% at 50% 100%, #F1D26A 0%, rgba(241,210,106,0) 100%)',
    RIGHT: 'radial-gradient(16.2% 41.2% at 100% 50%, #F1D26A 0%, rgba(241,210,106,0) 100%)',
  };
  const highlight = 'radial-gradient(75% 181% at 50% 50%, #5ED8A4 0%, rgba(94,216,164,0) 100%)';
  useEffect(() => {
    if (hovered) return;
    const i = setInterval(() => setDirection((p) => rotateDirection(p)), duration * 1000);
    return () => clearInterval(i);
  }, [hovered]);
  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn('relative flex rounded-full border border-chalk/10 content-center bg-board-900/70 hover:bg-board-800/60 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit', containerClassName)}
      {...props}
    >
      <div className={cn('w-auto text-chalk z-10 bg-board-950 px-5 py-2.5 rounded-[inherit] font-medium', className)}>{children}</div>
      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{ filter: 'blur(2px)', position: 'absolute', width: '100%', height: '100%' }}
        initial={{ background: movingMap[direction] }}
        animate={{ background: hovered ? [movingMap[direction], highlight] : movingMap[direction] }}
        transition={{ ease: 'linear', duration: duration ?? 1 }}
      />
      <div className="bg-board-950 absolute z-[1] flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}
