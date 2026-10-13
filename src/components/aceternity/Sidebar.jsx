import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils.js';
import { IconCheck, IconLock, IconMenu, IconX } from '../Icons.jsx';

// Aceternity UI: Animated Sidebar (expands on hover on desktop, slide-in drawer on mobile).
const SidebarContext = createContext(null);
export const useSidebar = () => useContext(SidebarContext);

export function Sidebar({ children, open: o, setOpen: so, animate = true }) {
  const [state, setState] = useState(false);
  const open = o !== undefined ? o : state;
  const setOpen = so !== undefined ? so : setState;
  return <SidebarContext.Provider value={{ open, setOpen, animate }}>{children}</SidebarContext.Provider>;
}

export function SidebarBody(props) {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
}

function DesktopSidebar({ className, children, ...props }) {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.aside
      className={cn('hidden h-full w-[290px] shrink-0 flex-col border-r border-board-700 bg-board-900 px-3 py-4 md:flex', className)}
      animate={{ width: animate ? (open ? '290px' : '72px') : '290px' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      aria-label="Workflow steps"
      {...props}
    >
      {children}
    </motion.aside>
  );
}

function MobileSidebar({ className, children }) {
  const { open, setOpen } = useSidebar();
  return (
    <div className="flex h-12 w-full shrink-0 items-center justify-between border-b border-board-700 bg-board-900 px-4 md:hidden">
      <span className="font-display text-xl">Marklane</span>
      <button aria-label="Open steps" onClick={() => setOpen(!open)} className="text-chalk"><IconMenu /></button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn('fixed inset-0 z-[200] flex h-full w-full flex-col justify-between bg-board-900 p-6', className)}
          >
            <button aria-label="Close steps" className="absolute right-6 top-6 text-chalk" onClick={() => setOpen(false)}><IconX /></button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// state: 'locked' | 'open' | 'active' | 'done'; fresh: just unlocked (pulses once)
export function SidebarLink({ link, className }) {
  const { open, animate, setOpen } = useSidebar();
  const locked = link.state === 'locked';
  return (
    <button
      type="button"
      disabled={locked}
      title={locked ? link.hint : undefined}
      onClick={() => { link.onClick?.(); if (window.innerWidth < 768) setOpen(false); }}
      aria-current={link.state === 'active' ? 'step' : undefined}
      className={cn(
        'group/sidebar relative flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        link.state === 'active' && 'bg-board-700 text-chalk',
        link.state === 'open' && 'text-chalk hover:bg-board-800',
        link.state === 'done' && 'text-chalk-dim hover:bg-board-800',
        locked && 'cursor-not-allowed text-chalk-faint',
        className
      )}
    >
      <span className="relative shrink-0">
        {link.icon}
        {link.fresh && !locked && link.state !== 'active' && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-mustard"><span className="absolute inset-0 animate-ping2 rounded-full bg-mustard" /></span>}
      </span>
      <motion.span
        animate={{ display: animate ? (open ? 'inline-block' : 'none') : 'inline-block', opacity: animate ? (open ? 1 : 0) : 1 }}
        className="whitespace-pre text-sm transition duration-150 group-hover/sidebar:translate-x-1"
      >
        {link.label}
      </motion.span>
      <motion.span animate={{ display: open ? 'inline-flex' : 'none', opacity: open ? 1 : 0 }} className="ml-auto">
        {locked && <IconLock className="h-4 w-4" />}
        {link.state === 'done' && <IconCheck className="h-4 w-4 text-tick" />}
      </motion.span>
    </button>
  );
}
