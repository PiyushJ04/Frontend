import {useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'motion/react';
import {BorderButton,CardSpotlight,FlipWords,TextGenerate} from '../components/ui';
import MarkingSheet from '../components/MarkingSheet';

// Backend Phase 6 currently enforces 65/35. Change both together if you change this.
const CONTENT=75,FACTORS=25;

const STAGES=[
['Upload one zip','Syllabus, theory notes, optional sample answers and every student answer PDF go in together. Scanned pages are read with OCR.'],
['Choose strictness','Lenient, standard or strict sets how far an answer may drift from the reference before it loses marks.'],
['Review the reference sheet',`The system drafts model answers from your own notes. You edit them. This sheet is the line that decides the ${CONTENT}% of marks for content.`],
['Approve the factors',`The other ${FACTORS}% is split into named factors such as diagrams and presentation. You see every weight before anything is marked.`],
['Mark, with receipts','Each answer is compared with the reference line. Every mark carries the factor and the evidence behind it.'],
['Read the class','Toppers, fails, and for every student and question: how far from the line, and which factors moved the mark.']];

function Panel({i}){
  const box='flex h-80 w-full flex-col justify-center gap-3 rounded-xl border border-ink/20 bg-white p-6 shadow-[6px_6px_0_#14213D]';
  const rise=(d)=>({initial:{opacity:0,y:16},animate:{opacity:1,y:0},transition:{delay:d,type:'spring',damping:18}});
  const body=[
    ['syllabus.pdf','theory_notes.pdf','sample_answers.pdf','students.zip'].map((f,j)=><motion.div key={f} {...rise(j*.15)} className="rounded-md border border-dashed border-ink/40 px-3 py-2 text-sm">{f}</motion.div>),
    ['Lenient','Standard','Strict'].map((s,j)=><motion.div key={s} {...rise(j*.1)} className="relative rounded-md border border-ink/20 px-4 py-3">
      {j===2&&<motion.span layoutId="pick" className="absolute inset-0 rounded-md border-2 border-pen bg-pen/10"/>}<span className="relative">{s}</span></motion.div>),
    [92,78,85,60].map((w,j)=><motion.div key={j} className="h-3 rounded bg-ink/15" initial={{width:0}} animate={{width:w+'%'}} transition={{delay:j*.12,duration:.5}}/>)
      .concat(<motion.p key="e" {...rise(.7)} className="w-fit rounded bg-hi px-2 py-1 text-sm font-semibold">Edited by you</motion.p>),
    [<div key="b" className="flex h-12 overflow-hidden rounded-md text-sm font-semibold"><motion.div className="grid place-items-center bg-ink text-white" initial={{width:0}} animate={{width:CONTENT+'%'}} transition={{duration:.7}}>{CONTENT}% content</motion.div>
      <motion.div className="grid place-items-center bg-hi" initial={{width:0}} animate={{width:FACTORS+'%'}} transition={{duration:.7,delay:.3}}>{FACTORS}%</motion.div></div>]
      .concat(['Diagram','Presentation','Handwriting legibility'].map((f,j)=><motion.p key={f} {...rise(.5+j*.12)} className="rounded-md bg-desk px-3 py-2 text-sm">{f}</motion.p>)),
    [<svg key="s" viewBox="0 0 300 150" className="w-full"><line x1="0" x2="300" y1="75" y2="75" stroke="#14213D" strokeWidth="2" strokeDasharray="6 4"/>
      {[[40,40],[90,100],[140,62],[190,88],[240,70]].map(([x,y],j)=><g key={x}><motion.line x1={x} x2={x} y1="75" y2={y} stroke="#E4572E" initial={{pathLength:0}} animate={{pathLength:1}} transition={{delay:.4+j*.15}}/>
        <motion.circle cx={x} cy={y} r="6" fill="#14213D" initial={{scale:0}} animate={{scale:1}} transition={{delay:.3+j*.15,type:'spring'}}/></g>)}</svg>,
      <p key="t" className="text-sm text-ink/70">Dashed line: your reference sheet. Red: distance of each answer.</p>],
    [<div key="h" className="flex h-44 items-end gap-2">{[2,4,7,11,9,6,3,1].map((h,j)=><motion.div key={j} className={j<2?'flex-1 bg-pen':'flex-1 bg-ink'} initial={{height:0}} animate={{height:h*14}} transition={{delay:j*.06,type:'spring',damping:15}}/>)}</div>,
      <p key="t" className="text-sm text-ink/70">Marks distribution. Red bars sit below the pass line.</p>]][i];
  return <motion.div key={i} className={box} initial={{opacity:0,rotate:2}} animate={{opacity:1,rotate:0}} exit={{opacity:0}}>{body}</motion.div>;
}

function Pipeline(){
  const [a,setA]=useState(0);
  return <section id="workflow" className="mx-auto max-w-6xl px-5 py-24">
    <h2 className="max-w-2xl text-4xl font-extrabold md:text-5xl">From a zip file to a class report, with you approving every step that matters</h2>
    <div className="mt-14 grid gap-10 md:grid-cols-2">
      <ol>{STAGES.map(([t,d],i)=><motion.li key={t} onViewportEnter={()=>setA(i)} viewport={{margin:'-45% 0px -45% 0px'}}
        className="flex min-h-[46vh] gap-4 md:min-h-[60vh]" animate={{opacity:a===i?1:.35}}>
        <span className={'mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink text-sm font-bold '+(a===i?'bg-ink text-white':'')}>{i+1}</span>
        <div><h3 className="text-2xl font-bold">{t}</h3><p className="mt-2 max-w-sm text-ink/75">{d}</p></div></motion.li>)}</ol>
      <div className="relative hidden md:block"><div className="sticky top-28"><AnimatePresence mode="wait"><Panel i={a} key={a}/></AnimatePresence></div></div>
    </div>
    <div className="md:hidden"><Panel i={a}/></div>
  </section>;
}

const TRUST=[
['Fixed by code','Totals add up to the question marks. Factor weights must sum exactly. Marks are arithmetic, not opinion.'],
['Drawn from your material','Reference answers are built from passages of your syllabus and notes, and the source page travels with them.'],
['Drafted by the model, decided by you','Reference answers and factors stay drafts until you approve them. Nothing is marked before that.']];

export default function Landing(){
  return <div className="min-h-screen">
    <motion.header initial={{y:-40,opacity:0}} animate={{y:0,opacity:1}} className="sticky top-3 z-20 mx-auto mt-3 flex max-w-5xl items-center justify-between rounded-full border border-ink/15 bg-white/85 px-5 py-2 backdrop-blur">
      <Link to="/" className="font-display text-xl font-extrabold">Marklane</Link>
      <nav className="flex items-center gap-5 text-sm font-semibold"><a href="#workflow" className="hidden hover:text-pen sm:block">How it works</a><a href="#trust" className="hidden hover:text-pen sm:block">Why trust it</a>
        <Link to="/auth" className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-pen">Sign in</Link></nav></motion.header>

    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 md:grid-cols-[1.1fr_.9fr] md:pt-24">
      <div>
        <h1 className="text-5xl font-extrabold leading-[1.02] md:text-7xl">Every mark is <FlipWords words={['traceable','uniform','reviewable','explained']}/></h1>
        <TextGenerate className="mt-6 max-w-lg text-lg text-ink/75" text="Marklane measures every answer sheet against a reference you approved, then shows exactly why each student got each mark."/>
        <div className="mt-8 flex flex-wrap gap-4"><BorderButton to="/auth">Start grading</BorderButton><a href="#workflow" className="rounded-xl border-2 border-ink px-5 py-3 font-semibold transition hover:bg-hi">See the workflow</a></div>
      </div>
      <MarkingSheet/>
    </section>

    <Pipeline/>

    <section id="trust" className="mx-auto max-w-6xl px-5 py-24">
      <h2 className="max-w-2xl text-4xl font-extrabold md:text-5xl">The model writes drafts. You and the arithmetic decide.</h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">{TRUST.map(([t,d],i)=><motion.div key={t} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.12}}>
        <CardSpotlight className="h-full p-6"><h3 className="text-xl font-bold">{t}</h3><p className="mt-3 text-ink/75">{d}</p></CardSpotlight></motion.div>)}</div>
    </section>

    <section className="mx-auto max-w-6xl px-5 pb-24"><div className="rounded-2xl bg-ink p-10 text-white md:p-16">
      <h2 className="max-w-xl text-4xl font-extrabold">Bring one class's answer sheets. See every mark explained.</h2>
      <div className="mt-8"><BorderButton to="/auth" dark={false}>Create your account</BorderButton></div></div></section>
  </div>;
}
