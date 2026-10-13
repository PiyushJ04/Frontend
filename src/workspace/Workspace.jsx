import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar, SidebarBody, SidebarLink } from '../components/aceternity/Sidebar.jsx';
import { IconBack, IconBook, IconChart, IconClass, IconFile, IconLayers, IconLogout, IconUpload } from '../components/Icons.jsx';
import { Notice, Spinner, yearLabel } from '../components/ui.jsx';
import { WorkspaceSkeleton } from '../components/loaders.jsx';
import { useExam } from './useExam.js';
import SetupStep from './steps/SetupStep.jsx';
import UploadsStep from './steps/UploadsStep.jsx';
import ReferenceStep from './steps/ReferenceStep.jsx';
import FactorsStep from './steps/FactorsStep.jsx';
import EvaluateStep from './steps/EvaluateStep.jsx';
import ResultsStep from './steps/ResultsStep.jsx';
import { cn } from '../lib/utils.js';

const STEPS = [
  { id: 'setup', label: 'Class setup', icon: IconClass, hint: '', Page: SetupStep },
  { id: 'uploads', label: 'Uploads', icon: IconUpload, hint: 'Set up the class first.', Page: UploadsStep },
  { id: 'reference', label: 'Reference answers', icon: IconBook, hint: 'Upload the syllabus, notes and question paper first.', Page: ReferenceStep },
  { id: 'factors', label: 'Marking factors', icon: IconLayers, hint: 'Approve every reference answer first.', Page: FactorsStep },
  { id: 'evaluate', label: 'Student papers', icon: IconFile, hint: 'Approve the factors and lock the scheme first.', Page: EvaluateStep },
  { id: 'results', label: 'Class results', icon: IconChart, hint: 'Mark the student papers first.', Page: ResultsStep },
];

export default function Workspace({ token, role, examId, onCreated, onBack, onLogout }) {
  const ex = useExam(token, examId, role.key);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(examId ? null : 'setup');
  const [fresh, setFresh] = useState({});
  const [toast, setToast] = useState(null);
  const seen = useRef(null);

  const unlocked = (i) => i === 0 || ex.done[STEPS[i - 1].id];
  const stateOf = (i) => (!unlocked(i) ? 'locked' : step === STEPS[i].id ? 'active' : ex.done[STEPS[i].id] ? 'done' : 'open');

  // Resume at the first step that still needs work.
  useEffect(() => {
    if (ex.loading || step) return;
    const next = STEPS.findIndex((s, i) => unlocked(i) && !ex.done[s.id]);
    setStep(STEPS[next === -1 ? STEPS.length - 1 : next].id);
  }, [ex.loading]);

  // When a step unlocks, mark it new and say so.
  useEffect(() => {
    if (ex.loading) return;
    const now = STEPS.filter((_, i) => unlocked(i)).map((s) => s.id);
    if (seen.current) {
      const added = now.filter((id) => !seen.current.includes(id));
      if (added.length) {
        const s = STEPS.find((x) => x.id === added[added.length - 1]);
        setFresh((f) => ({ ...f, ...Object.fromEntries(added.map((id) => [id, true])) }));
        setToast(s);
        const t = setTimeout(() => setToast(null), 6000);
        seen.current = now;
        return () => clearTimeout(t);
      }
    }
    seen.current = now;
  }, [ex.loading, ex.done.setup, ex.done.uploads, ex.done.reference, ex.done.factors, ex.done.evaluate]);

  const go = (id) => { setStep(id); setFresh((f) => ({ ...f, [id]: false })); setToast(null); document.getElementById('ws-main')?.scrollTo({ top: 0, behavior: 'smooth' }); };
  const ctx = { ...ex, token, role, examId, go, onCreated };
  const Page = STEPS.find((s) => s.id === step)?.Page;
  const doneCount = STEPS.filter((s) => ex.done[s.id]).length;

  return (
    <div className="flex h-screen flex-col bg-board-950 md:flex-row">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div className="mb-6 flex items-center gap-3 px-3 py-1">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-chalk font-display text-lg text-board-950">M</span>
              <motion.span animate={{ opacity: open ? 1 : 0, display: open ? 'inline-block' : 'none' }} className="font-display text-2xl text-chalk">Marklane</motion.span>
            </div>
            <nav aria-label="Steps" className="flex flex-col gap-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return <SidebarLink key={s.id} link={{ label: s.label, icon: <Icon className="h-5 w-5" />, state: stateOf(i), hint: s.hint, fresh: fresh[s.id], onClick: () => go(s.id) }} />;
              })}
            </nav>
          </div>
          <div className="flex flex-col gap-1 border-t border-board-700 pt-3">
            <SidebarLink link={{ label: 'All my classes', icon: <IconBack className="h-5 w-5" />, state: 'open', onClick: onBack }} />
            <SidebarLink link={{ label: 'Log out', icon: <IconLogout className="h-5 w-5" />, state: 'open', onClick: onLogout }} />
          </div>
        </SidebarBody>
      </Sidebar>

      <main id="ws-main" className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-10">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <motion.div layoutId={`role-${role.key}`} className="rounded-xl border border-board-600 bg-board-800 px-4 py-2" transition={{ type: 'spring', stiffness: 220, damping: 26 }}>
              <p className="font-display text-xl leading-none text-chalk">{role.subject}</p>
              <p className="mt-1 text-xs text-chalk-dim">{[yearLabel(role.academic_year), role.department].filter(Boolean).join(', ')}</p>
            </motion.div>
            <div className="flex flex-1 items-center gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length - 1} aria-valuenow={doneCount} aria-label="Workflow progress">
              {STEPS.slice(0, -1).map((s) => <motion.span key={s.id} className="h-1.5 flex-1 rounded-full bg-board-700" animate={{ backgroundColor: ex.done[s.id] ? '#5ED8A4' : step === s.id ? '#F1D26A' : '#1a382e' }} />)}
            </div>
          </div>

          {ex.loading ? (
            <WorkspaceSkeleton />
          ) : (
            <>
              {ex.error && <div className="mb-5"><Notice error={ex.error} /></div>}
              <AnimatePresence mode="wait">
                {Page && (
                  <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <Page ctx={ctx} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div role="status" initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-4 rounded-2xl border border-mustard/40 bg-board-900 p-4 shadow-[0_20px_60px_rgba(0,0,0,.5)]">
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mustard/15 text-mustard"><toast.icon className="h-5 w-5" /></span>
              <div className="min-w-0"><p className="text-sm font-semibold text-chalk">{toast.label} unlocked</p><p className="text-xs text-chalk-dim">A new button is waiting in the sidebar.</p></div>
              <button onClick={() => go(toast.id)} className={cn('shrink-0 rounded-lg bg-chalk px-3 py-1.5 text-sm font-semibold text-board-950 hover:bg-white')}>Go</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
