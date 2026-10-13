import { cn } from '../lib/utils.js';

export const Skeleton = ({ className }) => <div aria-hidden="true" className={cn('skeleton rounded-xl', className)} />;

// Shown while a class workspace opens: the page's own shape, shimmering, instead of a lone spinner.
export function WorkspaceSkeleton() {
  return (
    <div role="status" aria-label="Opening your workspace" className="animate-pulse-soft">
      <Skeleton className="h-12 w-3/5 max-w-md" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <Skeleton className="mt-2 h-4 w-4/5 max-w-lg" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-board-700 bg-board-900 p-5" style={{ opacity: 1 - i * 0.2 }}>
            <div className="flex items-center gap-4"><Skeleton className="h-9 w-9 !rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-3 w-2/3" /></div></div>
            <Skeleton className="mt-5 h-24 w-full" />
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-chalk-faint">Opening your workspace…</p>
    </div>
  );
}
