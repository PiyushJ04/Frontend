import { cn } from '../../lib/utils.js';

// Aceternity UI: Bento Grid
export function BentoGrid({ className, children }) {
  return <div className={cn('mx-auto grid max-w-6xl grid-cols-1 gap-4 md:auto-rows-[20rem] md:grid-cols-3', className)}>{children}</div>;
}

export function BentoGridItem({ className, title, description, header }) {
  return (
    <div className={cn('group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-2xl border border-board-600/60 bg-board-900 p-5 transition duration-300 hover:border-board-500 hover:shadow-[0_0_60px_-20px_rgba(94,216,164,.35)]', className)}>
      <div className="min-h-0 flex-1">{header}</div>
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        <h3 className="font-display text-2xl text-chalk leading-tight">{title}</h3>
        <p className="mt-1.5 text-sm text-chalk-dim leading-relaxed max-w-md">{description}</p>
      </div>
    </div>
  );
}
