import { Children } from 'react';
import { cn } from '../lib/utils.js';
import { BottomGradient } from './aceternity/FormInputs.jsx';

export function Spinner({ className }) {
  return (
    <svg role="status" aria-label="Loading" viewBox="0 0 24 24" fill="none" className={cn('inline-block h-4 w-4 animate-spin', className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".22" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Button({ children, kind = 'solid', className, busy, disabled, ...p }) {
  const kinds = {
    solid: 'bg-chalk text-board-950 hover:bg-white',
    ghost: 'bg-board-800 text-chalk hover:bg-board-700 border border-board-600/60',
    quiet: 'text-chalk-dim hover:text-chalk hover:bg-board-800',
    danger: 'bg-pen/15 text-pen-soft hover:bg-pen/25 border border-pen/30',
  };
  return (
    <button
      className={cn('group/btn relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-45', kinds[kind], className)}
      {...p}
      disabled={!!busy || !!disabled}
    >
      {busy && <Spinner />}
      {children}
      {kind === 'solid' && <BottomGradient />}
    </button>
  );
}

const tones = {
  good: 'bg-tick/15 text-tick border-tick/30',
  warn: 'bg-mustard/15 text-mustard border-mustard/30',
  bad: 'bg-pen/15 text-pen-soft border-pen/30',
  neutral: 'bg-board-800 text-chalk-dim border-board-600/60',
};
export function Pill({ tone = 'neutral', children, className }) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>{Children.toArray(children).join('').replaceAll('_', ' ')}</span>;
}

export function Notice({ error, children, tone }) {
  const text = error || children;
  if (!text) return null;
  return (
    <div role={error ? 'alert' : 'status'} className={cn('rounded-xl border px-4 py-3 text-sm', error ? 'border-pen/40 bg-pen/10 text-pen-soft' : tone === 'good' ? 'border-tick/30 bg-tick/10 text-tick' : 'border-board-600 bg-board-800 text-chalk-dim')}>
      {text}
    </div>
  );
}

export function Panel({ className, children, ...p }) {
  return <section className={cn('rounded-2xl border border-board-600/60 bg-board-900 p-5 md:p-6', className)} {...p}>{children}</section>;
}

export function StepHeader({ title, children }) {
  return (
    <header className="mb-6 max-w-2xl">
      <h1 className="font-display text-4xl md:text-5xl leading-[1.05] text-chalk">{title}</h1>
      {children && <p className="mt-3 text-chalk-dim leading-relaxed">{children}</p>}
    </header>
  );
}

export const fmt = (n, d = 1) => Number(n || 0).toFixed(d);
export const unwrap = (r) => (r && r.data !== undefined ? r.data : r);
export const YEAR_LABEL = { FE: '1st year', SE: '2nd year', TE: '3rd year', BE: '4th year' };
export const yearLabel = (y) => YEAR_LABEL[y] || y || '';
