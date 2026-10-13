import {useState,useEffect,useRef} from 'react';
import {motion,AnimatePresence} from 'motion/react';
import {BorderButton,CardSpotlight,TextGenerate} from '../components/ui';
import {Thinking,SideBar} from '../components/ui2';
import {FALLBACK,draftReference,wait,FACTORS0,STUDENTS} from '../lib/mock';
import {cn} from '../lib/utils';

const STEPS={upload:'Uploads',reference:'Reference answers',factors:'Marking factors',papers:'Student papers',results:'Class results'};
const PASS=12,CONTENT=75,FACTORS=25;
const Stamp=({children})=><motion.span initial={{scale:2.5,rotate:-12,opacity:0}} animate={{scale:1,rotate:-6,opacity:1}} transition={{type:'spring',stiffness:300,damping:12}} className="inline-block rounded border-4 border-tick px-3 py-1 font-display text-xl font-extrabold text-tick">{children}</motion.span>;

function Drop({label,hint,accept,onFile,disabled}){
  const [over,setOver]=useState(false),ref=useRef();
  return <motion.div animate={{scale:over?1.02:1,borderColor:over?'#E4572E':'rgba(20,33,61,.3)'}} onDragOver={e=>{e.preventDefault();!disabled&&setOver(true)}} onDragLeave={()=>setOver(false)}
    onDrop={e=>{e.preventDefault();setOver(false);!disabled&&e.dataTransfer.files[0]&&onFile(e.dataTransfer.files[0].name)}}
    className={cn('rounded-xl border-2 border-dashed bg-white p-6',disabled&&'opacity-40')}>
    <p className="font-display text-xl font-bold">{label}</p><p className="text-ink/70">{hint}</p>
    <div className="mt-4 flex gap-4"><input ref={ref} type="file" accept={accept} hidden onChange={e=>e.target.files[0]&&onFile(e.target.files[0].name)}/>
      <button disabled={disabled} onClick={()=>ref.current.click()} className="rounded-lg bg-ink px-4 py-2 font-semibold text-white hover:bg-pen">Choose file</button>
      <button disabled={disabled} onClick={()=>onFile('sample_'+label.toLowerCase().replace(/ /g,'_')+'.pdf')} className="font-semibold underline decoration-pen decoration-2 underline-offset-4">Use sample</button></div></motion.div>;
}

function Upload({files,setFiles,onDone}){
  const SL=[['syllabus','Syllabus','The topics your paper can ask about.'],['notes','Theory notes','What answers are checked against.'],['paper','Question paper','Questions with their marks.']];
  const [busy,setBusy]=useState(null);
  async function take(k,name){setBusy(k);await wait(4200);setFiles(f=>({...f,[k]:name}));setBusy(null);if(k==='paper')onDone()}
  const done=files.paper;
  return <div className="mx-auto max-w-2xl space-y-5"><h1 className="text-4xl font-extrabold">{done?'Your uploaded material':'Teach Marklane your course'}</h1>
    {SL.map(([k,l,h],i)=>{const ok=files[k],ready=i===0||files[SL[i-1][0]];
      return <motion.div key={k} layout>{ok?<motion.div initial={{scale:.96}} animate={{scale:1}} className="flex items-center justify-between rounded-xl border border-tick bg-white p-5"><div><p className="font-bold">{l}</p><p className="text-sm text-ink/70">{ok} · stored and indexed</p></div><Stamp>Stored</Stamp></motion.div>
        :busy===k?<Thinking compact title={'Reading your '+l.toLowerCase()} lines={['Reading pages','Running OCR on scanned pages','Splitting into passages','Embedding passages for retrieval']}/>
        :<Drop label={l} hint={h} accept=".pdf" disabled={!ready||busy} onFile={n=>take(k,n)}/>}</motion.div>})}
  </div>;
}

function Reference({data,onApprove,approved}){
  const [qs,setQs]=useState(null);useEffect(()=>{data&&setQs(data)},[data]);
  if(!qs)return <Thinking title="Writing reference answers" lines={['Searching your notes for each question','Pulling the best passages','Drafting answers from those passages only','Attaching source pages']}/>;
  return <div className="mx-auto max-w-3xl space-y-5"><h1 className="text-4xl font-extrabold">Review the reference line</h1><TextGenerate className="text-ink/75" text="Edit anything you disagree with. These answers decide the content marks for every student."/>
    {qs.map((q,i)=><motion.div key={q.id} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:i*.15}}><CardSpotlight className="p-5">
      <div className="flex justify-between font-bold"><span>{q.q}</span><span>{q.marks} marks</span></div>
      <textarea disabled={approved} value={q.a} onChange={e=>setQs(s=>s.map(x=>x.id===q.id?{...x,a:e.target.value}:x))} rows={4} className="mt-3 w-full resize-y rounded-lg border border-ink/20 bg-desk p-3 outline-none focus:border-pen"/>
      <div className="mt-2 flex flex-wrap gap-2">{q.ev.map(e=><span key={e} className="rounded bg-hi/60 px-2 py-1 text-xs font-semibold">{e}</span>)}</div></CardSpotlight></motion.div>)}
    {approved?<Stamp>Approved</Stamp>:<BorderButton onClick={onApprove}>Approve reference answers</BorderButton>}</div>;
}

function Factors({onApprove,approved}){
  const [f,setF]=useState(FACTORS0),[name,setName]=useState('');
  const sum=f.reduce((a,x)=>a+x.w,0),ok=sum===FACTORS;
  return <div className="mx-auto max-w-3xl space-y-5"><h1 className="text-4xl font-extrabold">Choose how the other {FACTORS}% is marked</h1>
    <div className="flex h-12 overflow-hidden rounded-lg border border-ink/20 font-semibold"><div className="grid place-items-center bg-ink text-white" style={{width:CONTENT+'%'}}>Content {CONTENT}%</div>
      <motion.div layout className={cn('grid place-items-center',ok?'bg-tick text-white':'bg-hi')} style={{width:Math.min(sum,100-CONTENT)/1+'%'}}>{sum}%</motion.div></div>
    <p className={ok?'text-tick':'text-pen'} role="status">{ok?'Weights add up. You can approve.':`Weights total ${sum}%. They must total ${FACTORS}% before you can approve.`}</p>
    <AnimatePresence>{f.map((x,i)=><motion.div key={x.n} layout initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:60,height:0}} className="flex items-center gap-4 rounded-xl border border-ink/15 bg-white p-4">
      <span className="flex-1 font-semibold">{x.n}</span><input type="range" min="0" max="25" disabled={approved} value={x.w} onChange={e=>setF(s=>s.map((y,j)=>j===i?{...y,w:+e.target.value}:y))} className="accent-[#E4572E]"/><span className="w-10 text-right font-bold">{x.w}%</span>
      {!approved&&<button aria-label={'Remove '+x.n} onClick={()=>setF(s=>s.filter((_,j)=>j!==i))} className="font-bold text-pen">Remove</button>}</motion.div>)}</AnimatePresence>
    {!approved&&<form onSubmit={e=>{e.preventDefault();name&&setF(s=>[...s,{n:name,w:0}]);setName('')}} className="flex gap-3"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Add a factor, e.g. Units written" className="flex-1 rounded-lg border border-ink/25 bg-white px-3 py-2 outline-none focus:border-pen"/><button className="rounded-lg bg-hi px-4 font-semibold">Add factor</button></form>}
    {approved?<Stamp>Approved</Stamp>:ok&&<BorderButton onClick={onApprove}>Approve factors</BorderButton>}</div>;
}

function Papers({onDone,done}){
  const [n,setN]=useState(-1);
  useEffect(()=>{if(n<0||n>=STUDENTS.length){n>=STUDENTS.length&&wait(600).then(onDone);return}const t=setTimeout(()=>setN(n+1),380);return()=>clearTimeout(t)},[n]);
  if(n<0)return <div className="mx-auto max-w-2xl space-y-5"><h1 className="text-4xl font-extrabold">Upload the answer sheets</h1><Drop label="Student papers zip" hint="One zip with every student's answer PDF." accept=".zip" onFile={()=>setN(0)}/></div>;
  const cur=STUDENTS[Math.min(n,STUDENTS.length-1)];
  return <div className="space-y-4"><Thinking title={`Marking paper ${Math.min(n+1,STUDENTS.length)} of ${STUDENTS.length}`} lines={['Matching each answer to the reference line','Checking key points covered','Scoring diagrams and presentation','Adding up approved factors']}/>
    <div className="h-3 overflow-hidden rounded bg-ink/15"><motion.div className="h-full bg-pen" animate={{width:n/STUDENTS.length*100+'%'}}/></div>
    <p className="text-sm text-ink/70">Last marked: {cur.name}, {cur.total}/30</p></div>;
}

function Results(){
  const [open,setOpen]=useState(null);
  const avg=(STUDENTS.reduce((a,s)=>a+s.total,0)/STUDENTS.length).toFixed(1),fails=STUDENTS.filter(s=>s.total<PASS).length;
  const bins=Array.from({length:6},(_,b)=>STUDENTS.filter(s=>Math.min(5,Math.floor(s.total/5))===b).length);
  const top=[...STUDENTS].sort((a,b)=>b.total-a.total);
  return <div className="mx-auto max-w-4xl space-y-6"><h1 className="text-4xl font-extrabold">Class results</h1>
    <div className="grid gap-4 sm:grid-cols-3">{[['Class average',avg+' / 30'],['Highest',top[0].name+', '+top[0].total],['Below pass mark',fails+' students']].map(([l,v],i)=><motion.div key={l} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:i*.12}}><CardSpotlight className="p-5"><p className="text-ink/70">{l}</p><p className="font-display text-3xl font-bold">{v}</p></CardSpotlight></motion.div>)}</div>
    <div className="flex h-40 items-end gap-3 rounded-xl border border-ink/15 bg-white p-5">{bins.map((c,i)=><div key={i} className="flex flex-1 flex-col items-center gap-1"><motion.div className={cn('w-full rounded-t',i<3?'bg-pen':'bg-ink')} initial={{height:0}} animate={{height:c*14}} transition={{delay:.3+i*.08,type:'spring'}}/><span className="text-xs">{i*5}-{i*5+4}</span></div>)}</div>
    <div className="overflow-hidden rounded-xl border border-ink/15 bg-white">{top.map((s,r)=><div key={s.id} className="border-b border-ink/10 last:border-0">
      <button onClick={()=>setOpen(open===s.id?null:s.id)} aria-expanded={open===s.id} className="flex w-full justify-between px-5 py-3 text-left hover:bg-hi/30"><span>{r+1}. {s.name}</span><span className={s.total<PASS?'font-bold text-pen':'font-bold'}>{s.total} / 30</span></button>
      <AnimatePresence>{open===s.id&&<motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden bg-desk"><div className="space-y-3 p-5">{s.q.map((m,qi)=><div key={qi}><div className="flex justify-between text-sm font-semibold"><span>Q{qi+1}: {m} / 15</span><span>distance from reference line {s.dist[qi].toFixed(2)}</span></div>
        <div className="mt-1 h-2 rounded bg-ink/15"><motion.div className="h-2 rounded bg-pen" initial={{width:0}} animate={{width:s.dist[qi]*100+'%'}}/></div></div>)}
        <p className="text-sm">{s.f.map(([n,v])=>n+' '+v).join(' · ')}</p></div></motion.div>}</AnimatePresence></div>)}</div></div>;
}

export default function Dashboard(){
  const roles=JSON.parse(localStorage.getItem('assignments')||'null')||FALLBACK;
  const [role,setRole]=useState(null),[unlocked,setU]=useState(['upload']),[active,setActive]=useState('upload'),[fresh,setFresh]=useState(null);
  const [files,setFiles]=useState({}),[ref,setRef]=useState(null),[ok,setOk]=useState({});
  const user=JSON.parse(localStorage.getItem('user')||'{}');
  const go=id=>{setU(u=>u.includes(id)?u:[...u,id]);setActive(id);setFresh(id)};
  const finishUpload=()=>{go('reference');draftReference().then(setRef)};
  return <AnimatePresence mode="wait">{!role?
    <motion.main key="roles" exit={{opacity:0,scale:.94,filter:'blur(10px)'}} className="mx-auto min-h-screen max-w-5xl px-5 py-16">
      <h1 className="text-5xl font-extrabold">Welcome{user.username?', '+user.username.replace(/_/g,' '):''}</h1>
      <TextGenerate className="mt-3 max-w-xl text-lg text-ink/75" text="Pick the class you are marking. Each class keeps its own files, reference answers and marks."/>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{roles.map((r,i)=><motion.button key={i} onClick={()=>setRole(r)} initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:.6+i*.12,type:'spring'}} whileHover={{y:-6}} whileTap={{scale:.97}} className="text-left">
        <CardSpotlight className="p-6"><p className="text-ink/70">{r.academic_year}</p><h2 className="text-3xl font-extrabold">{r.subject}</h2><p className="mt-4 text-sm text-ink/70">{(i*3+2)%5+1} exams marked · {(i*41+60)%120+40} papers</p></CardSpotlight></motion.button>)}</div></motion.main>
    :<motion.div key="desk" initial={{opacity:0,scale:1.05}} animate={{opacity:1,scale:1}} transition={{duration:.5}} className="flex">
      <SideBar items={unlocked.map(id=>({id,label:STEPS[id]}))} active={active} fresh={fresh} onPick={setActive}/>
      <main className="min-h-screen flex-1 px-5 py-10 md:px-10"><p className="mb-6 w-fit rounded-full bg-hi px-4 py-1 font-semibold">{role.academic_year} · {role.subject}</p>
        <AnimatePresence mode="wait"><motion.div key={active} initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}}>
          {active==='upload'&&<Upload files={files} setFiles={setFiles} onDone={finishUpload}/>}
          {active==='reference'&&<Reference data={ref} approved={ok.ref} onApprove={()=>{setOk(o=>({...o,ref:1}));go('factors')}}/>}
          {active==='factors'&&<Factors approved={ok.fac} onApprove={()=>{setOk(o=>({...o,fac:1}));go('papers')}}/>}
          {active==='papers'&&<Papers onDone={()=>go('results')}/>}
          {active==='results'&&<Results/>}
        </motion.div></AnimatePresence></main></motion.div>}</AnimatePresence>;
}
