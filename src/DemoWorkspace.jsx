import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar, SidebarBody, SidebarLink } from './components/aceternity/Sidebar.jsx';
import { Button, Panel, Pill, StepHeader, Notice, Spinner, fmt } from './components/ui.jsx';
import { IconBook, IconChart, IconClass, IconFile, IconLayers, IconLogout, IconUpload, IconBack, IconCheck, IconLock } from './components/Icons.jsx';
import { cn } from './lib/utils.js';

const STEPS = [
  ['setup','Class setup',IconClass],
  ['uploads','Uploads',IconUpload],
  ['reference','Reference answers',IconBook],
  ['factors','Marking factors',IconLayers],
  ['evaluate','Student papers',IconFile],
  ['results','Class results',IconChart],
];

const questions = [
 {id:1,no:'1(a)',text:'Explain encapsulation in Object-Oriented Programming with a suitable example.',marks:8,
  answer:`Encapsulation is the mechanism of bundling data and the methods that operate on that data into a single unit, usually a class, while restricting direct access to the internal state. In Java, this is commonly implemented using private data members and public methods such as getters and setters.\n\nFor example, a BankAccount class can keep its balance private and expose deposit() and withdraw() methods. The methods validate the requested operation before changing the balance. This prevents invalid external modification and keeps the object in a valid state.\n\nEncapsulation improves data security, maintainability and modularity because the internal implementation can change without affecting code that uses the public interface.`,
  concepts:['data hiding','class','private members','methods','validation','example']},
 {id:2,no:'1(b)',text:'Differentiate abstraction and encapsulation.',marks:7,
  answer:`Abstraction and encapsulation are related but solve different design problems. Abstraction focuses on hiding unnecessary implementation details and exposing only the essential behaviour required by the user. Encapsulation focuses on bundling state and behaviour together and controlling access to that state.\n\nFor example, a user of a Car can call start() without knowing how fuel injection works; this demonstrates abstraction. Keeping the car's internal engine state inaccessible directly and changing it through controlled methods demonstrates encapsulation.\n\nTherefore, abstraction answers “what should be visible?” while encapsulation answers “how should data and implementation be protected?”`,
  concepts:['abstraction','encapsulation','interface','data hiding','comparison','example']},
 {id:3,no:'2(a)',text:'Explain the four pillars of Object-Oriented Programming.',marks:7,
  answer:`The four fundamental pillars of OOP are encapsulation, abstraction, inheritance and polymorphism.\n\n1. Encapsulation bundles data with the methods operating on it and restricts direct access to internal state.\n2. Abstraction exposes essential features while hiding unnecessary implementation details.\n3. Inheritance allows a new class to reuse and extend properties and behaviour of an existing class.\n4. Polymorphism allows the same interface or operation to behave differently for different objects, such as method overriding in Java.\n\nTogether these principles support reusable, maintainable and extensible software design.`,
  concepts:['encapsulation','abstraction','inheritance','polymorphism','reuse','overriding']},
 {id:4,no:'2(b)',text:'What is runtime polymorphism? Explain with method overriding.',marks:8,
  answer:`Runtime polymorphism occurs when the method that will execute is determined at runtime rather than compile time. In Java, it is achieved primarily through method overriding, where a subclass provides its own implementation of a method defined in its parent class.\n\nFor example, an Animal reference can refer to a Dog object. If both classes define speak(), the Dog implementation is selected when animal.speak() is called. This is dynamic method dispatch.\n\nRuntime polymorphism improves extensibility because client code can work with a common parent type while the actual object determines the behaviour.`,
  concepts:['runtime binding','method overriding','dynamic dispatch','inheritance','parent reference','subclass']}
];

const students = [
 ['24CSE001','Aarav Patil',82],['24CSE002','Diya Shah',74],['24CSE003','Kabir Joshi',91],
 ['24CSE004','Meera Kulkarni',68],['24CSE005','Ishaan More',57],['24CSE006','Anaya Deshmukh',86],
 ['24CSE007','Rohan Pawar',77],['24CSE008','Sara Khan',63],['24CSE009','Vihaan Jadhav',94],
 ['24CSE010','Tara Patil',71],['24CSE011','Arjun Shinde',49],['24CSE012','Nisha Bhosale',79],
 ['24CSE013','Om Mane',88],['24CSE014','Aditi Chavan',66],['24CSE015','Yash Patil',53],
 ['24CSE016','Ira Joshi',84],['24CSE017','Soham More',73],['24CSE018','Riya Pawar',96],
];

const wait = ms => new Promise(r => setTimeout(r,ms));

function Progress({stage, percent, text}) {
 return <Panel className="overflow-hidden">
   <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-chalk-faint">Live processing pipeline</p><h3 className="mt-1 font-display text-2xl text-chalk">{stage}</h3></div><span className="font-display text-3xl text-mustard">{percent}%</span></div>
   <div className="mt-5 h-2 overflow-hidden rounded-full bg-board-700"><motion.div className="h-full bg-mustard" animate={{width:`${percent}%`}} transition={{ease:'easeOut'}} /></div>
   <p className="mt-3 text-sm text-chalk-dim">{text}</p>
 </Panel>
}

function UploadBox({label,hint,onPick,done,disabled=false}) {
 const [file,setFile]=useState('');
 return <div className={cn('rounded-2xl border p-5 transition-colors',done?'border-tick/40 bg-tick/5':'border-board-600/60 bg-board-900')}>
   <div className="flex items-start gap-4"><div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl',done?'bg-tick/15 text-tick':'bg-board-700 text-chalk')}>{done?<IconCheck className="h-5 w-5"/>:<IconFile className="h-5 w-5"/>}</div>
   <div className="min-w-0 flex-1"><h3 className="font-display text-xl text-chalk">{label}</h3><p className="mt-1 text-sm text-chalk-dim">{hint}</p>
   {file && <p className="mt-3 truncate rounded-lg bg-board-800 px-3 py-2 text-xs text-chalk">{file}</p>}
   {done && !file && <Pill tone="good">Uploaded</Pill>}
   </div></div>
   {!done && <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-board-600 bg-board-800/70 px-4 py-4 text-sm text-chalk-dim hover:border-mustard/60 hover:text-chalk">
      <input type="file" className="sr-only" disabled={disabled} onChange={e=>{const f=e.target.files?.[0];if(f){setFile(f.name);onPick(f.name)}}}/>{file?'Selected — click upload below':'Choose a file or drag it here'}
   </label>}
 </div>
}

export default function DemoWorkspace() {
 const [step,setStep]=useState('setup'), [created,setCreated]=useState(false);
 const [uploads,setUploads]=useState({syllabus:false,notes:false,paper:false});
 const [generated,setGenerated]=useState(false), [approved,setApproved]=useState({});
 const [factors,setFactors]=useState({1:8,2:7,3:5,4:5}), [factorsApproved,setFactorsApproved]=useState(false), [locked,setLocked]=useState(false);
 const [zip,setZip]=useState(false), [running,setRunning]=useState(false), [progress,setProgress]=useState(0), [pipeline,setPipeline]=useState('');
 const [evaluated,setEvaluated]=useState(false), [selectedQ,setSelectedQ]=useState(1);
 const [answers,setAnswers]=useState(Object.fromEntries(questions.map(q=>[q.id,q.answer])));
 const [feedback,setFeedback]=useState('');
 const [toast,setToast]=useState('');
 const [strictness,setStrictness]=useState('balanced');

 const allUploads=Object.values(uploads).every(Boolean), allApproved=questions.every(q=>approved[q.id]);
 const totalFactor=Object.values(factors).reduce((a,b)=>a+Number(b),0);
 const unlocked = id => id==='setup' || (id==='uploads'&&created) || (id==='reference'&&allUploads) || (id==='factors'&&allApproved) || (id==='evaluate'&&locked) || (id==='results'&&evaluated);
 const go=id=>{if(unlocked(id)){setStep(id);window.scrollTo({top:0,behavior:'smooth'})}};
 const notify=m=>{setToast(m);setTimeout(()=>setToast(''),2600)};

 const simulate = async (kind) => {
   if(running)return; setRunning(true); setProgress(3);
   const stages = kind==='upload'
    ? [['Validate ZIP',10],['Extract student PDFs',25],['Identify answer sheets',42],['Create evaluation jobs',60],['Queue documents',78],['Ready for marking',100]]
    : [['OCR / document understanding',12],['Page segmentation',28],['Question segmentation',45],['Reference retrieval',61],['AI evaluation',78],['Confidence & evidence',91],['Store results',100]];
   for(const [name,p] of stages){await wait(kind==='upload'?650:720);setPipeline(name);setProgress(p)}
   setRunning(false); if(kind==='upload'){setZip(true);notify('18 student answer sheets are ready for evaluation.')}else{setEvaluated(true);notify('Evaluation completed — 18 papers reviewed.')}
 };

 const create=()=>{setCreated(true);notify('Class workspace created. Uploads are now unlocked.');setStep('uploads')};
 const gen=async()=>{setRunning(true);setPipeline('Reading syllabus and theory notes');setProgress(15);await wait(700);setPipeline('Matching passages to questions');setProgress(43);await wait(800);setPipeline('Writing detailed reference answers');setProgress(72);await wait(900);setPipeline('Checking coverage and mark depth');setProgress(100);await wait(500);setGenerated(true);setRunning(false);notify('Reference answers generated. Teacher approval is required.');};
 const approve=(id)=>{setApproved(a=>({...a,[id]:true}));notify(`Reference answer ${questions.find(q=>q.id===id)?.no} approved.`)};
 const revise=()=>{if(!feedback.trim())return;setAnswers(a=>({...a,[selectedQ]:a[selectedQ]+'\n\nTeacher revision note: '+feedback.trim()}));setFeedback('');notify('A revised reference-answer version was created.');};
 const approveFactors=()=>{if(totalFactor!==25)return;setFactorsApproved(true);setLocked(true);notify('Marking scheme approved and locked at 75% content + 25% factors.');setStep('evaluate')};

 const selected=questions.find(q=>q.id===selectedQ);
 const resultStudents=students.map(([roll,name,p],i)=>({roll,name,p,total:Math.round(p*0.5),max:50}));

 return <div className="flex min-h-screen flex-col bg-board-950 md:flex-row">
   <Sidebar>
    <SidebarBody className="justify-between gap-6">
     <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <div className="mb-6 flex items-center gap-3 px-3 py-1"><span className="grid h-7 w-7 place-items-center rounded-lg bg-chalk font-display text-lg text-board-950">M</span><span className="font-display text-2xl text-chalk">Marklane</span></div>
      <div className="mb-5 rounded-xl border border-mustard/30 bg-mustard/5 p-3 text-xs text-chalk-dim"><span className="text-mustard font-semibold">DEMO MODE</span><br/>No backend or AI API required.</div>
      <nav className="flex flex-col gap-1">
       {STEPS.map(([id,label,Icon],i)=>{const done=(id==='setup'&&created)||(id==='uploads'&&allUploads)||(id==='reference'&&allApproved)||(id==='factors'&&locked)||(id==='evaluate'&&evaluated);return <SidebarLink key={id} link={{label,icon:<Icon className="h-5 w-5"/>,state:!unlocked(id)?'locked':step===id?'active':done?'done':'open',hint:'Complete the previous stage first.',onClick:()=>go(id)}}/>})}
      </nav>
     </div>
     <div className="border-t border-board-700 pt-3"><SidebarLink link={{label:'Reset demo',icon:<IconBack className="h-5 w-5"/>,state:'open',onClick:()=>window.location.reload()}}/></div>
    </SidebarBody>
   </Sidebar>

   <main id="ws-main" className="flex-1 overflow-y-auto">
    <div className="mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-10">
     <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-board-700 pb-5">
      <div><p className="text-xs uppercase tracking-[.22em] text-chalk-faint">Faculty evaluation workspace</p><p className="mt-1 text-sm text-chalk-dim">SY CSE • Object Oriented Programming • Semester 3 • Division A</p></div>
      <Pill tone={locked?'good':'warn'}>{locked?'MARKING SCHEME LOCKED':'DEMO • CONTROLLED DATA'}</Pill>
     </div>

     {toast&&<motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="fixed right-5 top-5 z-[300] max-w-sm rounded-xl border border-tick/30 bg-board-800 px-4 py-3 text-sm text-tick shadow-2xl">{toast}</motion.div>}

     {step==='setup'&&<SetupDemo created={created} strictness={strictness} setStrictness={setStrictness} create={create}/>}
     {step==='uploads'&&<UploadsDemo uploads={uploads} setUploads={setUploads} allUploads={allUploads} go={go}/>}
     {step==='reference'&&<ReferenceDemo questions={questions} generated={generated} gen={gen} running={running} progress={progress} pipeline={pipeline} selectedQ={selectedQ} setSelectedQ={setSelectedQ} approved={approved} approve={approve} answers={answers} setAnswers={setAnswers} feedback={feedback} setFeedback={setFeedback} revise={revise} go={go} allApproved={allApproved}/>}
     {step==='factors'&&<FactorsDemo factors={factors} setFactors={setFactors} total={totalFactor} approved={factorsApproved} approve={approveFactors} questions={questions}/>}
     {step==='evaluate'&&<EvaluateDemo zip={zip} simulate={simulate} running={running} progress={progress} pipeline={pipeline} evaluated={evaluated} setStep={setStep}/>}
     {step==='results'&&<ResultsDemo students={resultStudents}/>}
    </div>
   </main>
 </div>
}

function SetupDemo({created,strictness,setStrictness,create}){
 if(created)return <><StepHeader title="OOP is set up">This workspace is isolated to SY CSE • Semester 3 • Division A. Another teacher's class or subject cannot mix into this evaluation.</StepHeader><Panel><div className="grid gap-5 sm:grid-cols-4">{[['Course code','CS201'],['Semester','3'],['Division','A'],['Strictness',strictness]].map(([a,b])=><div key={a}><p className="text-xs text-chalk-faint">{a}</p><p className="mt-1 font-display text-2xl capitalize text-chalk">{b}</p></div>)}</div><div className="mt-6 flex items-center justify-between border-t border-board-700 pt-5"><Pill tone="good">Draft workspace</Pill><Button onClick={()=>location.reload()}>Reset</Button></div></Panel></>;
 return <><StepHeader title="Set up this class">Create a controlled teaching context before any material or marks are processed.</StepHeader>
 <Panel><div className="grid gap-5 sm:grid-cols-3"><Field label="Subject" value="Object Oriented Programming" readOnly/><Field label="Course code" value="CS201" readOnly/><Field label="Academic context" value="SY CSE • Semester 3 • Division A" readOnly/></div></Panel>
 <fieldset className="mt-7"><legend className="mb-3 font-display text-2xl text-chalk">How strict should marking be?</legend><div className="grid gap-3 sm:grid-cols-2">{[['lenient','Lenient','Credit for the idea even when wording is loose.'],['balanced','Balanced','Key concepts must be present; wording can differ.'],['strict','Strict','Missing concepts cost marks.'],['examiner','Examiner','Close to the approved reference in content and precision.']].map(([v,n,d])=><button key={v} onClick={()=>setStrictness(v)} className={cn('rounded-2xl border p-5 text-left',strictness===v?'border-mustard bg-board-800':'border-board-600 bg-board-900')}><div className="flex justify-between"><span className="font-display text-2xl text-chalk">{n}</span><span className={cn('h-3 w-3 rounded-full',strictness===v?'bg-mustard':'bg-board-600')}/></div><p className="mt-1 text-sm text-chalk-dim">{d}</p></button>)}</div></fieldset>
 <div className="mt-7"><Button onClick={create}>Create class workspace →</Button></div></>
}
function Field({label,value,readOnly}){return <label className="text-xs text-chalk-faint">{label}<input readOnly={readOnly} value={value} className="mt-2 h-11 w-full rounded-lg border border-board-600 bg-board-800 px-3 text-sm text-chalk"/></label>}

function UploadsDemo({uploads,setUploads,allUploads,go}){
 const set=(k)=>setUploads(u=>({...u,[k]:true}));
 return <><StepHeader title="Upload what you teach from">Go in order: syllabus → theory notes → question paper. The production system extracts and indexes these materials before generating reference answers.</StepHeader>
 <div className="space-y-4">
  <UploadBox label="1. Syllabus" hint="Topics, outcomes and course scope used as evidence." done={uploads.syllabus} onPick={()=>set('syllabus')}/>
  <div className={uploads.syllabus?'':'opacity-50 pointer-events-none'}><UploadBox label="2. Theory notes" hint="Reference material used to ground expected answers." done={uploads.notes} onPick={()=>set('notes')}/></div>
  <div className={uploads.notes?'':'opacity-50 pointer-events-none'}><UploadBox label="3. Question paper" hint="Questions and mark allocation extracted into the workspace." done={uploads.paper} onPick={()=>set('paper')}/></div>
 </div>
 {!allUploads&&<div className="mt-4"><Notice>In demo mode, choosing a local file only records its name. No file is uploaded to a server.</Notice></div>}
 {allUploads&&<Panel className="mt-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><Pill tone="good">3/3 materials ready</Pill><h2 className="mt-2 font-display text-2xl text-chalk">Question structure detected</h2><p className="text-sm text-chalk-dim">4 questions • 30 content marks • ready to build teacher-approved references.</p></div><Button onClick={()=>go('reference')}>Continue to reference answers →</Button></div></Panel>}
 </>;
}

function ReferenceDemo({questions,generated,gen,running,progress,pipeline,selectedQ,setSelectedQ,approved,approve,answers,setAnswers,feedback,setFeedback,revise,go,allApproved}){
 const q=questions.find(x=>x.id===selectedQ);
 return <><StepHeader title="Build the reference answers">AI creates a detailed expected answer from the uploaded material. The teacher can edit, revise and approve it before marking begins.</StepHeader>
 {!generated?<><Panel><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-2xl text-chalk">Generate reference answers</h2><p className="mt-1 max-w-2xl text-sm text-chalk-dim">The simulation includes mark-scaled academic depth, source grounding and question-specific concepts.</p></div><Button onClick={gen} busy={running}>Generate all 4 answers</Button></div></Panel>{running&&<div className="mt-5"><Progress stage={pipeline} percent={progress} text="AI simulation: retrieving evidence, drafting, checking depth and validating syllabus coverage."/></div></>:<div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
 <Panel className="h-max p-3"><p className="px-3 py-2 text-xs uppercase tracking-widest text-chalk-faint">Questions</p>{questions.map(x=><button key={x.id} onClick={()=>setSelectedQ(x.id)} className={cn('flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm',selectedQ===x.id?'bg-board-700 text-chalk':'text-chalk-dim hover:bg-board-800')}><span>Q{x.no}</span><span>{approved[x.id]?'✓':'Draft'}</span></button>)}</Panel>
 <div className="space-y-4"><Panel><div className="flex flex-wrap items-start justify-between gap-3"><div><Pill tone="neutral">Q{q.no} • {q.marks} marks</Pill><h2 className="mt-3 font-display text-2xl text-chalk">{q.text}</h2></div>{approved[q.id]?<Pill tone="good">Teacher approved</Pill>:<Pill tone="warn">Needs review</Pill>}</div><div className="mt-5 rounded-xl border border-board-700 bg-board-800 p-4"><p className="text-xs uppercase tracking-widest text-chalk-faint">Expected concepts</p><div className="mt-3 flex flex-wrap gap-2">{q.concepts.map(c=><span key={c} className="rounded-full bg-board-700 px-2.5 py-1 text-xs text-chalk-dim">{c}</span>)}</div></div>
 <textarea value={answers[q.id]} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} className="mt-5 min-h-[330px] w-full rounded-xl border border-board-600 bg-board-950 p-4 text-sm leading-7 text-chalk outline-none focus:border-mustard"/>
 <div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-board-800 p-3"><span className="text-xs text-chalk-faint">Answer depth</span><p className="mt-1 text-tick">Adequate for {q.marks} marks</p></div><div className="rounded-xl bg-board-800 p-3"><span className="text-xs text-chalk-faint">Evidence</span><p className="mt-1 text-chalk">notes.pdf p.3–4</p></div><div className="rounded-xl bg-board-800 p-3"><span className="text-xs text-chalk-faint">AI confidence</span><p className="mt-1 text-mustard">{91+q.id}%</p></div></div>
 {!approved[q.id]&&<Button className="mt-4" onClick={()=>approve(q.id)}>Approve this reference answer</Button>}
 </Panel>
 <Panel><h3 className="font-display text-xl text-chalk">Teacher revision</h3><p className="mt-1 text-sm text-chalk-dim">Any feedback creates a new version; the previous draft remains auditable.</p><textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="e.g. Add a clearer Java example and mention data validation." className="mt-4 min-h-24 w-full rounded-xl border border-board-600 bg-board-800 p-3 text-sm text-chalk"/><Button kind="ghost" className="mt-3" onClick={revise}>Create revised version</Button></Panel>
 {allApproved&&<div className="flex justify-end"><Button onClick={()=>go('factors')}>Continue to marking factors →</Button></div>}
 </div></div>}
 </>;
}

function FactorsDemo({factors,setFactors,total,approved,approve,questions}){
 return <><StepHeader title="Decide the other 25%">Theory/content carries 75%. The remaining 25% is distributed across question-aware factors. Every factor is editable before the scheme is locked.</StepHeader>
 <Panel><div className="flex flex-wrap items-center gap-4"><div className="relative h-24 w-24"><svg viewBox="0 0 100 100" className="-rotate-90"><circle cx="50" cy="50" r="38" fill="none" stroke="#1a382e" strokeWidth="9"/><circle cx="50" cy="50" r="38" fill="none" stroke={total===25?'#5ED8A4':'#F1D26A'} strokeWidth="9" strokeLinecap="round" strokeDasharray="239" strokeDashoffset={239*(1-Math.min(total,25)/25)}/></svg><div className="absolute inset-0 grid place-items-center text-center font-display text-xl text-chalk">{total}<span className="block text-[9px] text-chalk-faint">of 25</span></div></div><div><h2 className="font-display text-2xl text-chalk">Question-aware factor scheme</h2><p className="text-sm text-chalk-dim">Demo uses 34 points because the remaining 25% is split across the editable factors below.</p></div></div>
 <div className="mt-6 space-y-3">{[['Diagram / required visual',1],['Presentation and structure',2],['Legibility observation',3],['Method / algorithm clarity',4]].map(([name,id])=><div key={id} className="flex items-center gap-3 rounded-xl bg-board-800 p-3"><span className="flex-1 text-sm text-chalk">{name}</span><input type="number" value={factors[id]} onChange={e=>setFactors(f=>({...f,[id]:Number(e.target.value)}))} disabled={approved} className="h-9 w-20 rounded-lg border border-board-600 bg-board-900 px-2 text-right text-chalk"/><span className="text-xs text-chalk-faint">points</span></div>)}</div>
 <Notice tone={total===25?'good':undefined}>{total===25?'Balanced. The demo scheme is ready to lock.':`Current allocation: ${total}. Adjust the factors until the demo total is 25.`}</Notice>
 {!approved?<Button className="mt-5" disabled={total!==34} onClick={approve}>Approve & lock marking scheme</Button>:<div className="mt-5 flex items-center gap-3"><Pill tone="good">LOCKED</Pill><span className="text-sm text-chalk-dim">75% content + approved factors. Teachers remain the final authority on marks.</span></div>}
 </Panel></>;
}

function EvaluateDemo({zip,simulate,running,progress,pipeline,evaluated,setStep}){
 const [picked,setPicked]=useState('');
 return <><StepHeader title="Mark the class">Upload one ZIP containing a PDF for every student. The production pipeline validates, extracts, identifies, queues and evaluates each paper in the background.</StepHeader>
 {!zip&&!running&&<Panel><div className="flex items-start gap-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-board-700 text-chalk"><IconUpload className="h-5 w-5"/></div><div className="flex-1"><h2 className="font-display text-2xl text-chalk">Class answer-sheet ZIP</h2><p className="mt-1 text-sm text-chalk-dim">One PDF per student. Synthetic demo data will be used after the ZIP is selected.</p><label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-board-600 bg-board-800 px-4 py-4 text-sm text-chalk-dim hover:border-mustard/60"><input type="file" accept=".zip" className="sr-only" onChange={e=>setPicked(e.target.files?.[0]?.name||'')}/><span>{picked||'Choose student_answers_oct2026.zip'}</span><span className="text-mustard">Browse</span></label>{picked&&<div className="mt-4 flex justify-end"><Button onClick={()=>simulate('upload')}>Upload & process ZIP</Button></div>}</div></div></Panel>}
 {running&&<div className="mt-5"><Progress stage={pipeline||'Starting pipeline'} percent={progress} text="The visible stages mirror the production workflow: validation → extraction → identification → queue → document understanding → evaluation."/></div>}
 {zip&&!running&&<Panel className="mt-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><Pill tone="good">18 PDFs ready</Pill><h2 className="mt-2 font-display text-2xl text-chalk">student_answers_oct2026.zip</h2><p className="text-sm text-chalk-dim">18 students • 46 pages • all documents validated • jobs queued</p></div>{!evaluated&&<Button onClick={()=>simulate('mark')}>Start evaluation of 18 papers</Button>}</div></Panel>}
 {evaluated&&<Panel className="mt-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-tick/15 text-tick"><IconCheck/></span><div><h2 className="font-display text-2xl text-chalk">Evaluation complete</h2><p className="text-sm text-chalk-dim">18/18 papers evaluated • low-confidence answers flagged for teacher review • audit trail created</p></div><Pill tone="good">COMPLETE</Pill></div><div className="mt-5 grid gap-3 sm:grid-cols-4">{[['Papers',18],['Questions',72],['AI suggestions',72],['Review flags',7]].map(([a,b])=><div key={a} className="rounded-xl bg-board-800 p-4"><p className="text-xs text-chalk-faint">{a}</p><p className="mt-1 font-display text-3xl text-chalk">{b}</p></div>)}</div><div className="mt-5 flex justify-end"><Button onClick={()=>setStep('results')}>See class results →</Button></div></Panel>}
 </>;
}

function ResultsDemo({students}){
 const avg=students.reduce((a,s)=>a+s.p,0)/students.length, sorted=[...students].sort((a,b)=>b.p-a.p), fail=students.filter(s=>s.p<40);
 const buckets=Array(10).fill(0);students.forEach(s=>buckets[Math.min(9,Math.floor(s.p/10))]++);
 return <><StepHeader title="How the class did">These results are deterministic demo data, but the presentation mirrors the production result view: summary, toppers, distribution, question performance and student-level marks.</StepHeader>
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Class average',avg.toFixed(1)+'%'],['Papers marked','18'],['Highest',sorted[0].p+'%'],['Lowest',sorted[sorted.length-1].p+'%']].map(([a,b])=><Panel key={a}><p className="text-sm text-chalk-dim">{a}</p><p className="mt-2 font-display text-4xl text-chalk">{b}</p></Panel>)}</div>
 <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel><h2 className="font-display text-2xl text-chalk">Toppers</h2><ol className="mt-3 space-y-2">{sorted.slice(0,3).map((s,i)=><li key={s.roll} className="flex items-center gap-3 rounded-xl bg-board-800 px-4 py-3"><span className="font-hand text-3xl text-mustard">{i+1}</span><span className="flex-1 text-chalk">{s.name}</span><span className="text-sm text-chalk-dim">{s.roll}</span><span className="font-display text-xl text-tick">{s.p}%</span></li>)}</ol></Panel>
 <Panel><h2 className="font-display text-2xl text-chalk">Below pass mark</h2>{fail.length?<ul className="mt-3 space-y-2">{fail.map(s=><li key={s.roll} className="flex justify-between rounded-xl bg-board-800 px-4 py-2.5 text-sm"><span className="text-chalk">{s.name}</span><Pill tone="bad">{s.p}%</Pill></li>)}</ul>:<p className="mt-3 text-tick">Everyone passed.</p>}</Panel></div>
 <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel><h2 className="font-display text-2xl text-chalk">Score spread</h2><div className="mt-5 flex h-40 items-end gap-1">{buckets.map((n,i)=><div key={i} className="flex h-full flex-1 items-end"><motion.div initial={{height:0}} animate={{height:`${Math.max(5,n/Math.max(...buckets)*100)}%`}} className={cn('w-full rounded-t',i*10<40?'bg-pen/60':'bg-mustard/75')} title={`${i*10}-${i*10+10}%: ${n}`}/></div>)}</div><div className="mt-2 flex justify-between text-xs text-chalk-faint"><span>0%</span><span>50%</span><span>100%</span></div></Panel>
 <Panel><h2 className="font-display text-2xl text-chalk">Question performance</h2><div className="mt-4 space-y-4">{questions.map((q,i)=>{const v=[76,71,68,74][i];return <div key={q.id}><div className="flex justify-between text-sm"><span className="text-chalk">Q{q.no}</span><span className="text-chalk-dim">{v}% average</span></div><div className="mt-1.5 h-2 rounded-full bg-board-700"><motion.div initial={{width:0}} animate={{width:v+'%'}} className="h-full rounded-full bg-tick"/></div></div>})}</div></Panel></div>
 <Panel className="mt-4"><h2 className="font-display text-2xl text-chalk">Every student</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-chalk-faint"><tr><th className="py-2">Roll no.</th><th>Name</th><th>Score</th><th>Percentage</th></tr></thead><tbody className="divide-y divide-board-700">{sorted.map(s=><tr key={s.roll}><td className="py-2.5 text-chalk">{s.roll}</td><td className="text-chalk">{s.name}</td><td className="text-chalk-dim">{Math.round(s.p*.5)} / 50</td><td><div className="flex items-center gap-3"><div className="h-1.5 w-28 rounded-full bg-board-700"><div className={cn('h-full rounded-full',s.p<40?'bg-pen':'bg-tick')} style={{width:s.p+'%'}}/></div><span className="text-chalk">{s.p}%</span></div></td></tr>)}</tbody></table></div></Panel>
 <div className="mt-5 rounded-xl border border-mustard/30 bg-mustard/5 p-4 text-sm text-chalk-dim"><strong className="text-mustard">Presentation note:</strong> This screen is deliberately populated with realistic but synthetic data. In production, every value comes from the persisted evaluation records and teacher-approved marking scheme.</div>
 </>;
}
