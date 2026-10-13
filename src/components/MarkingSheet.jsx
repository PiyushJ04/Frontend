import {useState,useEffect} from 'react';
import {motion} from 'motion/react';
// One orchestrated moment: a pen marks an answer, factor chips land, the ledger totals. Loops every 11s.
const CHIPS=[['Content vs reference line','5 / 6','tick',2.4],['Diagram','0.5 / 1','pen',3.3],['Presentation','1 / 1','tick',4.2]];
const LINES=['Encapsulation binds data and methods into one unit,','and private members keep state hidden from callers.','Abstraction exposes only what a caller needs.'];
export default function MarkingSheet(){
  const [k,setK]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setK(n=>n+1),11000);return()=>clearInterval(t)},[]);
  return <div key={k} className="relative mx-auto w-full max-w-md">
    <motion.div initial={{rotate:-4,y:30,opacity:0}} animate={{rotate:-1.5,y:0,opacity:1}} transition={{type:'spring',damping:16}}
      className="rounded-lg border border-ink/20 bg-white p-6 shadow-[6px_6px_0_#14213D]">
      <p className="mb-4 flex justify-between text-sm text-ink/60"><span>Student 014 · Q1(a)</span><span>8 marks</span></p>
      <div className="space-y-3 font-display text-lg leading-snug">
        {LINES.map((l,i)=><p key={i} className="relative">{l}
          {i===1&&<svg className="absolute -bottom-1 left-0 h-3 w-full" viewBox="0 0 300 10" preserveAspectRatio="none">
            <motion.path d="M0 6 Q40 0 80 6 T160 6 T240 6 T300 5" fill="none" stroke="#E4572E" strokeWidth="2.5" strokeLinecap="round"
              initial={{pathLength:0}} animate={{pathLength:1}} transition={{delay:1.2,duration:.9}}/></svg>}</p>)}
      </div>
      <div className="mt-6 space-y-2 border-t border-dashed border-ink/25 pt-4">
        {CHIPS.map(([n,v,c,d])=><motion.div key={n} initial={{opacity:0,x:24,scale:.9}} animate={{opacity:1,x:0,scale:1}}
          transition={{delay:d,type:'spring',stiffness:260,damping:18}} className="flex items-center justify-between rounded-md bg-desk px-3 py-2 text-sm">
          <span>{n}</span><span className={c==='tick'?'font-semibold text-tick':'font-semibold text-pen'}>{v}</span></motion.div>)}
        <motion.div initial={{opacity:0,scale:.6}} animate={{opacity:1,scale:1}} transition={{delay:5.2,type:'spring',stiffness:300,damping:12}}
          className="flex items-center justify-between pt-2 font-display text-2xl font-bold"><span>Total</span><span className="rotate-[-3deg] rounded bg-hi px-3 py-1">6.5 / 8</span></motion.div>
      </div>
    </motion.div>
  </div>;
}
