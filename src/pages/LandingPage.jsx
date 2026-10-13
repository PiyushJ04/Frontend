import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { CountUp, CursorGlow, Magnetic, Reveal, ScrollProgress, Tilt } from '../components/fx.jsx';
import { Spotlight } from '../components/aceternity/Spotlight.jsx';
import { BackgroundBeams } from '../components/aceternity/BackgroundBeams.jsx';
import { TextGenerateEffect } from '../components/aceternity/TextGenerateEffect.jsx';
import { FlipWords } from '../components/aceternity/FlipWords.jsx';
import { HoverBorderGradient } from '../components/aceternity/HoverBorderGradient.jsx';
import { MovingBorderButton } from '../components/aceternity/MovingBorder.jsx';
import { FloatingNav } from '../components/aceternity/FloatingNav.jsx';
import { BentoGrid, BentoGridItem } from '../components/aceternity/BentoGrid.jsx';
import { CardSpotlight } from '../components/aceternity/CardSpotlight.jsx';
import AnswerSheetDemo from '../landing/AnswerSheetDemo.jsx';
import { UploadVisual, StrictnessVisual, ReferenceVisual, FactorsVisual, LockVisual, ZipVisual, StatsVisual } from '../landing/StepVisuals.jsx';
import { OwnedVisual, DistanceVisual, SplitVisual, SourceVisual, ReaderVisual } from '../landing/BentoVisuals.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { IconArrow } from '../components/Icons.jsx';

const NAV = [
  { name: 'How it works', link: '#how' },
  { name: 'Why you can trust it', link: '#trust' },
];

const STEPS = [
  { id: 'uploads', title: 'Upload what you teach from', body: 'Add the syllabus, then your theory notes, then the question paper. Sample answers are optional. Everything you upload stays listed on the page so you can see what the system is reading.', Visual: UploadVisual },
  { id: 'strict', title: 'Choose how strict to be', body: 'From lenient to examiner. This sets how closely a student answer has to sit to your reference before it earns full content marks.', Visual: StrictnessVisual },
  { id: 'reference', title: 'Review the reference answers', body: 'Each answer is drafted only from your notes, with the page it came from. Ask for a rewrite or correct it. Nothing moves on until you approve every answer.', Visual: ReferenceVisual },
  { id: 'factors', title: 'Decide the other 25%', body: 'Theory content carries 75% of the marks. Diagrams, presentation and handwriting share the remaining 25%. Add or remove factors until they total exactly 25.', Visual: FactorsVisual },
  { id: 'lock', title: 'Approve and lock', body: 'Once you approve, the scheme is locked. It cannot shift while students are being marked, so the first paper and the last paper are judged the same way.', Visual: LockVisual },
  { id: 'zip', title: 'Drop in the class zip', body: 'One PDF per student, in a single zip. Marking runs in the background and you watch each paper finish.', Visual: ZipVisual },
  { id: 'stats', title: 'Read the class', body: 'See toppers and fails, how far each question sits from your reference, and where the factor marks went. Every number traces back to a paper.', Visual: StatsVisual },
];

function StepText({ index, step, active, onEnter }) {
  const ref = useRef(null);
  const hit = useInView(ref, { margin: '-45% 0px -45% 0px' });
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const { Visual } = step;
  useEffect(() => { if (hit) onEnter(); }, [hit]);
  return (
    <li ref={ref} className="py-12 lg:flex lg:min-h-[78vh] lg:items-center lg:py-0">
      <div className={`transition-all duration-500 ${active ? 'opacity-100' : 'lg:opacity-30 lg:blur-[1px]'}`}>
        <div className="flex items-baseline gap-4">
          <span className="font-display text-7xl leading-none text-board-600">{String(index + 1).padStart(2, '0')}</span>
          <p className="font-hand text-3xl text-mustard">Step {index + 1}</p>
        </div>
        <h3 className="mt-3 font-display text-4xl leading-tight text-chalk md:text-5xl">{step.title}</h3>
        <p className="mt-4 max-w-md leading-relaxed text-chalk-dim">{step.body}</p>
        <div className="mt-8 lg:hidden"><Visual active={seen} /></div>
      </div>
    </li>
  );
}

function Steps() {
  const [active, setActive] = useState(0);
  const { Visual } = STEPS[active];
  return (
    <div className="mx-auto mt-10 grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <ol>{STEPS.map((s, i) => <StepText key={s.id} index={i} step={s} active={active === i} onEnter={() => setActive(i)} />)}</ol>
      <div className="hidden lg:block">
        <div className="sticky top-24 flex h-[calc(100vh-8rem)] items-center">
          <div className="relative w-full overflow-hidden rounded-3xl border border-board-600/60 bg-board-900/80 p-8 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur">
            <div className="absolute inset-0 dot-grid opacity-40" aria-hidden="true" />
            <div className="relative mb-6 flex items-center justify-between">
              <div className="flex gap-1.5">{STEPS.map((s, i) => <button key={s.id} aria-label={`Show step ${i + 1}`} onClick={() => document.getElementById('how')?.scrollIntoView()} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-mustard' : i < active ? 'w-3 bg-tick' : 'w-3 bg-board-600'}`} />)}</div>
              <span className="font-hand text-2xl text-chalk-faint">{active + 1} / {STEPS.length}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -16, scale: 0.98, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="relative min-h-[360px]">
                <Visual active />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const FACTS = [['75', '% of marks for theory content'], ['25', '% shared by factors you choose'], ['7', 'steps, each unlocked in turn'], ['1', 'zip for the whole class']];
const WORDS = ['paper correction', 'theory answers', 'class results', 'student queries'];

export default function LandingPage() {
  const { token } = useAuth();
  return (
    <div className="relative min-h-screen overflow-x-clip bg-board-950">
      <ScrollProgress />
      <CursorGlow />
      <FloatingNav
        navItems={NAV}
        actions={
          token ? (
            <Link to="/dashboard" className="rounded-full bg-chalk px-4 py-1.5 text-sm font-semibold text-board-950">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-1.5 text-sm text-chalk-dim hover:text-chalk">Log in</Link>
              <Link to="/signup" className="rounded-full bg-chalk px-4 py-1.5 text-sm font-semibold text-board-950">Sign up</Link>
            </>
          )
        }
      />

      {/* Hero */}
      <header className="grain relative isolate overflow-hidden px-6 pb-12 pt-32 md:pt-40">
        <motion.div aria-hidden="true" className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-tick/15 blur-[110px]" animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div aria-hidden="true" className="absolute -right-24 top-40 h-[380px] w-[380px] rounded-full bg-mustard/10 blur-[110px]" animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 line-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden="true" />
        <BackgroundBeams className="opacity-70" />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-40" fill="#ECEFE4" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div>
            <TextGenerateEffect as="h1" words="Marks you can trace back to the page." speed={0.14} className="font-display text-6xl leading-[0.98] text-chalk md:text-7xl" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-chalk-dim">
              You approve the reference answers. Marklane marks every student paper against them and shows how far each answer sits from yours, so every mark is something you can check.
            </p>
            <p className="mt-5 text-chalk-dim">
              Built for <FlipWords className="font-display text-2xl text-mustard" words={['paper correction', 'theory answers', 'class results', 'student queries']} />
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link to={token ? '/dashboard' : '/signup'} className="group">
                  <HoverBorderGradient as="span" containerClassName="rounded-full" className="sheen flex items-center gap-2 bg-board-950 text-base">
                    {token ? 'Open your classes' : 'Start grading'} <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </HoverBorderGradient>
                </Link>
              </Magnetic>
              <a href="#how" className="ulink px-1 py-2.5 text-chalk-dim hover:text-chalk">See how it works</a>
            </div>
          </div>
          <Tilt className="will-change-transform"><AnswerSheetDemo /></Tilt>
        </div>
        <Reveal delay={0.2} className="relative z-10 mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-board-600/60 bg-board-600/40 md:grid-cols-4">
          {FACTS.map(([n, t]) => (
            <div key={t} className="group bg-board-900/90 p-5 transition-colors duration-300 hover:bg-board-800">
              <p className="font-display text-5xl leading-none text-chalk transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-mustard"><CountUp to={Number(n)} /></p>
              <p className="mt-2 text-sm text-chalk-dim">{t}</p>
            </div>
          ))}
        </Reveal>
      </header>

      <div className="marquee relative border-y border-board-700 bg-board-900/60 py-5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]" aria-hidden="true">
        <div className="marquee-track">{[...WORDS, ...WORDS, ...WORDS, ...WORDS].map((w, i) => <span key={i} className="mx-8 flex items-center gap-8 font-display text-3xl text-chalk-dim">{w}<span className="h-1.5 w-1.5 rounded-full bg-mustard" /></span>)}</div>
      </div>

      {/* Workflow explainer */}
      <section id="how" className="relative px-6 py-20" aria-labelledby="how-title">
        <div className="mx-auto max-w-5xl">
          <Reveal><h2 id="how-title" className="max-w-2xl font-display text-5xl leading-[1.05] text-chalk md:text-6xl">From a folder of PDFs to a marked class</h2>
          <p className="mt-4 max-w-xl text-chalk-dim">Seven steps. Each one unlocks when the one before it is done, and you stay in control of every approval.</p></Reveal>
        </div>
        <Steps />
      </section>

      {/* Trust */}
      <section id="trust" className="relative px-6 py-24" aria-labelledby="trust-title">
        <div className="mx-auto mb-12 max-w-6xl">
          <Reveal><h2 id="trust-title" className="max-w-3xl font-display text-5xl leading-[1.05] text-chalk md:text-6xl">The language model reads. You and the scheme decide.</h2></Reveal>
        </div>
        <Reveal y={40}><BentoGrid>
          <BentoGridItem className="md:col-span-2" header={<OwnedVisual />} title="The reference answer is yours" description="Drafts come from your notes and carry page references. A student is only ever compared to an answer you approved." />
          <BentoGridItem header={<SplitVisual />} title="75 for content, 25 for the rest" description="You set the factors and their weights. They always add up to 25." />
          <BentoGridItem header={<SourceVisual />} title="Every answer shows its source" description="See which page of your notes each reference answer was built from." />
          <BentoGridItem className="md:col-span-2" header={<DistanceVisual />} title="Marks follow distance, not opinion" description="Each student answer is placed against your reference. The closer it sits, the more content marks it earns, and you can see where every answer landed." />
          <BentoGridItem className="md:col-span-3 md:auto-rows-auto" header={<ReaderVisual />} title="Same scheme for the first paper and the last" description="The model reads handwriting and text. Marks come from your locked scheme and a similarity score, so a re-run applies the same rules." />
        </BentoGrid></Reveal>
      </section>

      {/* Closing */}
      <section className="relative isolate overflow-hidden px-6 py-28">
        <BackgroundBeams className="opacity-60" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <CardSpotlight className="px-8 py-14 text-center md:px-14">
            <h2 className="font-display text-5xl leading-[1.05] text-chalk">Bring one question paper and watch the marks fall.</h2>
            <p className="mx-auto mt-4 max-w-lg text-chalk-dim">Create an account, pick the class you teach, and upload your syllabus. The first reference answers arrive while you set up the rest.</p>
            <div className="mt-8 flex justify-center">
              <Magnetic strength={0.4}>
                <Link to={token ? '/dashboard' : '/signup'}>
                  <MovingBorderButton as="span" borderRadius="1rem" containerClassName="h-14 w-64" className="sheen text-base">{token ? 'Open your classes' : 'Create a teacher account'}</MovingBorderButton>
                </Link>
              </Magnetic>
            </div>
          </CardSpotlight>
        </div>
      </section>

      <footer className="border-t border-board-700 px-6 py-8 text-sm text-chalk-faint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="font-display text-xl text-chalk-dim">Marklane</span>
          <span>Teachers approve. The system applies it consistently.</span>
        </div>
      </footer>
    </div>
  );
}
