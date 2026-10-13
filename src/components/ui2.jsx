// Ports of Aceternity UI patterns: Background Beams, Sidebar (hover-expand), plus a wait-state "Thinking" scene.
import {useState,useEffect} from 'react';
import {motion,AnimatePresence} from 'motion/react';
import {Link} from 'react-router-dom';
export function BackgroundBeams(){
  const paths=Array.from({length:14},(_,i)=>`M-${380-i*20} -${189+i*8}C-${380-i*20} -${189+i*8} -${312-i*20} ${216-i*8} ${152-i*20} ${343-i*8}C${616-i*20} ${470-i*8} ${684-i*20} ${875-i*8} ${684-i*20} ${875-i*8}`);
  return <svg aria-hidden className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice"><g transform="translate(380 190)">
    {paths.map((d,i)=><motion.path key={i} d={d} fill="none" stroke={i%3?'#F6D55C':'#E4572E'} strokeWidth=".6" initial={{pathLength:0,opacity:0}}
      animate={{pathLength:[0,1,1],opacity:[0,.9,0]}} transition={{duration:5+i%4,repeat:Infinity,delay:i*.35,ease:'easeInOut'}}/>)}</g></svg>;
}
export function Thinking({title,lines,compact}){
  const [i,setI]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setI(n=>(n+1)%lines.length),1400);return()=>clearInterval(t)},[lines]);
  return <div className={'relative grid place-items-center overflow-hidden rounded-xl bg-ink text-white '+(compact?'py-8':'min-h-[65vh]')}>
    <BackgroundBeams/><div className="relative px-6 text-center">
      <motion.div className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-hi border-t-pen" animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}/>
      <h2 className="text-3xl font-extrabold">{title}</h2>
      <div className="mt-3 h-6"><AnimatePresence mode="wait"><motion.p key={i} initial={{opacity:0,y:8,filter:'blur(4px)'}} animate={{opacity:1,y:0,filter:'blur(0)'}} exit={{opacity:0,y:-8}} className="text-white/75">{lines[i]}</motion.p></AnimatePresence></div></div></div>;
}
export function SideBar({items,active,fresh,onPick}){
  const [open,setOpen]=useState(false);
  return <motion.aside onHoverStart={()=>setOpen(true)} onHoverEnd={()=>setOpen(false)} animate={{width:open?236:72}} transition={{type:'spring',stiffness:300,damping:30}}
    className="sticky top-0 z-30 flex h-screen shrink-0 flex-col gap-1 overflow-hidden bg-ink p-3 text-white">
    <Link to="/" className="mb-6 flex h-11 items-center gap-3 px-2 font-display text-xl font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-md bg-hi text-ink">M</span><motion.span animate={{opacity:open?1:0}}>Marklane</motion.span></Link>
    <AnimatePresence initial={false}>{items.map((it,n)=><motion.button key={it.id} layout initial={{opacity:0,x:-40,scale:.7}} animate={{opacity:1,x:0,scale:1}} transition={{type:'spring',stiffness:350,damping:20}}
      onClick={()=>onPick(it.id)} className="relative flex h-11 shrink-0 items-center gap-3 rounded-lg px-2 text-left">
      {active===it.id&&<motion.span layoutId="nav" className="absolute inset-0 rounded-lg bg-white/15"/>}
      {fresh===it.id&&<motion.span className="absolute inset-0 rounded-lg ring-2 ring-hi" animate={{opacity:[1,0],scale:[1,1.15]}} transition={{duration:1.1,repeat:3}}/>}
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/40 text-sm font-bold">{n+1}</span>
      <motion.span animate={{opacity:open?1:0}} className="relative whitespace-nowrap font-semibold">{it.label}</motion.span></motion.button>)}</AnimatePresence></motion.aside>;
}
