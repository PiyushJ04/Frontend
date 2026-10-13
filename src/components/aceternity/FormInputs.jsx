import { forwardRef } from 'react';
import { useMotionTemplate, useMotionValue, motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../../lib/utils.js';

// Aceternity UI: Signup Form primitives (Label, Input with hover radial, LabelInputContainer, BottomGradient)
export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-chalk leading-none', className)} {...props} />;
}

export const Input = forwardRef(function Input({ className, type, as = 'input', ...props }, ref) {
  const radius = 110;
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const onMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };
  const Tag = as;
  return (
    <motion.div
      style={{ background: useMotionTemplate`radial-gradient(${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px, #F1D26A, transparent 80%)` }}
      onMouseMove={onMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="group/input rounded-lg p-[2px] transition duration-300"
    >
      <Tag
        type={as === 'input' ? type : undefined}
        className={cn('flex w-full rounded-md border-none bg-board-800 px-3 py-2 text-sm text-chalk shadow-input transition duration-400 placeholder:text-chalk-faint focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-mustard/70 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none', as === 'input' ? 'h-10' : 'min-h-[88px]', className)}
        ref={ref}
        {...props}
      />
    </motion.div>
  );
});

export const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-mustard to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-tick to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

export const LabelInputContainer = ({ children, className }) => <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
