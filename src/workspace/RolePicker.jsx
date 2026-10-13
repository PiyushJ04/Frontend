import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CardSpotlight } from '../components/aceternity/CardSpotlight.jsx';
import { TextGenerateEffect } from '../components/aceternity/TextGenerateEffect.jsx';
import { BackgroundBeams } from '../components/aceternity/BackgroundBeams.jsx';
import { Spotlight } from '../components/aceternity/Spotlight.jsx';
import { Input, Label, LabelInputContainer } from '../components/aceternity/FormInputs.jsx';
import { Button, Pill, yearLabel } from '../components/ui.jsx';
import { IconArrow, IconClock, IconLogout, IconPlus } from '../components/Icons.jsx';
import { readExams, readExtraRoles, roleKey, saveExtraRoles } from './store.js';

const YEARS = [['FE', '1st year (FE)'], ['SE', '2nd year (SE)'], ['TE', '3rd year (TE)'], ['BE', '4th year (BE)']];

function ago(iso) {
  if (!iso) return '';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
}

export default function RolePicker({ user, roles, onRolesChanged, onPick, onResume, onLogout }) {
  const [picked, setPicked] = useState(null);
  const [adding, setAdding] = useState(false);
  const [add, setAdd] = useState({ academic_year: 'FE', subject: '' });
  const past = readExams().slice(0, 6);
  const name = (user?.name || user?.username || '').replaceAll('_', ' ');

  function choose(r) {
    if (picked) return;
    setPicked(r.key);
    setTimeout(() => onPick(r), 750);
  }
  function addRole(e) {
    e.preventDefault();
    if (!add.subject.trim()) return;
    const r = { academic_year: add.academic_year, subject: add.subject.trim(), department: user?.department || '' };
    saveExtraRoles([...readExtraRoles(), r]);
    setAdd({ academic_year: 'FE', subject: '' });
    setAdding(false);
    onRolesChanged();
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-board-950">
      <BackgroundBeams className="opacity-40" />
      <Spotlight className="-top-40 left-0 md:left-60" fill="#ECEFE4" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-3xl text-chalk">Marklane</span>
        <div className="flex items-center gap-4 text-sm text-chalk-dim">
          <span className="hidden sm:inline">{name}</span>
          <button onClick={onLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-board-800 hover:text-chalk"><IconLogout className="h-4 w-4" /> Log out</button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8">
        <motion.div animate={picked ? { opacity: 0, y: -10 } : { opacity: 1 }} transition={{ duration: 0.3 }}>
          <TextGenerateEffect as="h1" words={name ? `Which class are you checking today, ${name.split(' ')[0]}?` : 'Which class are you checking today?'} speed={0.1} className="max-w-3xl font-display text-5xl leading-[1.04] text-chalk md:text-6xl" />
          <p className="mt-4 max-w-xl text-chalk-dim">Each class has its own workspace, so marks from one subject never mix with another.</p>
        </motion.div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {roles.map((r, i) => {
              const isPicked = picked === r.key;
              if (picked && !isPicked) return null;
              return (
                <motion.li key={r.key} layout layoutId={`role-${r.key}`} className="h-full" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }} transition={{ delay: picked ? 0 : 0.5 + i * 0.08, type: 'spring', stiffness: 160, damping: 20 }}>
                  <CardSpotlight as="button" onClick={() => choose(r)} className="h-full w-full p-6 text-left" aria-label={`Open ${r.subject}, ${yearLabel(r.academic_year)}`}>
                    <div className="flex h-full flex-col justify-between gap-6">
                      <div>
                        <p className="font-hand text-3xl text-mustard">{yearLabel(r.academic_year) || 'Class'}</p>
                        <h2 className="mt-1 font-display text-3xl leading-tight text-chalk">{r.subject}</h2>
                      </div>
                      <div className="flex items-center justify-between text-sm text-chalk-dim">
                        <span>{r.department}</span>
                        <span className="flex items-center gap-1.5 text-chalk">Open <IconArrow className="h-4 w-4" /></span>
                      </div>
                    </div>
                  </CardSpotlight>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {!picked && (
            <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + roles.length * 0.08 }}>
              {adding ? (
                <form onSubmit={addRole} className="space-y-3 rounded-2xl border border-board-600/60 bg-board-900 p-5">
                  <LabelInputContainer>
                    <Label htmlFor="ny">Year</Label>
                    <select id="ny" value={add.academic_year} onChange={(e) => setAdd({ ...add, academic_year: e.target.value })} className="h-10 rounded-md bg-board-800 px-2 text-sm text-chalk">{YEARS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="ns">Subject</Label>
                    <Input id="ns" autoFocus value={add.subject} onChange={(e) => setAdd({ ...add, subject: e.target.value })} placeholder="Data Structures" />
                  </LabelInputContainer>
                  <div className="flex gap-2"><Button type="submit">Add class</Button><Button type="button" kind="quiet" onClick={() => setAdding(false)}>Cancel</Button></div>
                </form>
              ) : (
                <button onClick={() => setAdding(true)} className="flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-board-500 text-chalk-dim transition-colors hover:border-mustard/60 hover:text-chalk"><IconPlus className="h-6 w-6" />Add a class</button>
              )}
            </motion.li>
          )}
        </ul>

        {!roles.length && !adding && !picked && <p className="mt-6 text-chalk-dim">No classes are listed on your account yet. Add the first one to begin.</p>}

        <AnimatePresence>
          {!picked && past.length > 0 && (
            <motion.section exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-16" aria-labelledby="recent">
              <h2 id="recent" className="font-display text-3xl text-chalk">Pick up where you left off</h2>
              <ul className="mt-4 divide-y divide-board-700 rounded-2xl border border-board-600/60 bg-board-900">
                {past.map((e) => (
                  <li key={e.id}>
                    <button onClick={() => onResume(e)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-board-800">
                      <IconClock className="h-5 w-5 shrink-0 text-chalk-faint" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-chalk">{e.subject}</span><span className="block text-xs text-chalk-dim">{e.course_code}, semester {e.semester}, division {e.division}</span></span>
                      <span className="hidden text-xs text-chalk-faint sm:block">{ago(e.touched_at)}</span>
                      <Pill tone={e.status === 'approved' ? 'good' : 'warn'}>{e.status === 'approved' ? 'locked' : 'in progress'}</Pill>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
