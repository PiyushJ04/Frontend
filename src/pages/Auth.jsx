import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {motion,AnimatePresence} from 'motion/react';
import {BorderButton} from '../components/ui';
import {login,signup} from '../lib/api';

function Field({label,type='text',value,onChange,...p}){
  return <label className="group relative block">
    <input {...p} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder=" " required
      className="peer w-full border-b-2 border-ink/25 bg-transparent px-0 pb-2 pt-6 outline-none transition focus:border-transparent"/>
    <span className="pointer-events-none absolute left-0 top-6 origin-left text-ink/55 transition-all peer-focus:top-0 peer-focus:scale-75 peer-focus:text-pen peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75">{label}</span>
    <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-pen transition-transform duration-300 peer-focus:scale-x-100"/>
  </label>;
}

export default function Auth(){
  const nav=useNavigate();const [mode,setMode]=useState('login');
  const [f,setF]=useState({name:'',email:'',password:'',department:''});
  const [rows,setRows]=useState([{academic_year:'',subject:''}]);
  const [err,setErr]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(null);
  const set=k=>v=>setF(s=>({...s,[k]:v}));
  const setRow=(i,k,v)=>setRows(r=>r.map((x,j)=>j===i?{...x,[k]:v}:x));

  async function submit(e){
    e.preventDefault();setErr('');setBusy(true);
    try{
      if(mode==='signup')await signup({...f,teaching_assignments:rows.filter(r=>r.academic_year&&r.subject)});
      const u=await login(f.email,f.password);setDone(u);localStorage.setItem('user',JSON.stringify(u));
      if(mode==='signup'){const a=rows.filter(r=>r.academic_year&&r.subject);if(a.length)localStorage.setItem('assignments',JSON.stringify(a))}
      setTimeout(()=>nav('/dashboard'),700);
    }catch(x){setErr(x.message==='Failed to fetch'?'Cannot reach the server. Check that the backend is running and VITE_API_URL is correct.':x.message)}
    finally{setBusy(false)}
  }

  return <div className="grid min-h-screen md:grid-cols-[.9fr_1.1fr]">
    <aside className="relative hidden overflow-hidden bg-ink p-12 text-white md:flex md:flex-col md:justify-between">
      <Link to="/" className="font-display text-2xl font-extrabold">Marklane</Link>
      <div>
        <motion.div initial={{rotate:-8,scale:2,opacity:0}} animate={{rotate:-6,scale:1,opacity:1}} transition={{delay:.6,type:'spring',stiffness:200,damping:12}}
          className="mb-8 inline-block rounded-md border-4 border-pen px-4 py-2 font-display text-3xl font-extrabold text-pen">Approved by faculty</motion.div>
        <h2 className="max-w-sm text-4xl font-extrabold leading-tight">Nothing is marked until you sign off on the reference.</h2>
        <p className="mt-4 max-w-sm text-white/70">Sign in to review reference sheets, approve factors and open class reports.</p>
      </div>
      <motion.div aria-hidden className="absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-hi/20 blur-3xl" animate={{scale:[1,1.2,1]}} transition={{duration:8,repeat:Infinity}}/>
    </aside>

    <main className="grid place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="relative mb-8 flex rounded-full border border-ink/20 bg-white p-1" role="tablist">
          {['login','signup'].map(m=><button key={m} role="tab" aria-selected={mode===m} onClick={()=>{setMode(m);setErr('')}} className="relative z-10 flex-1 rounded-full py-2 font-semibold">
            {mode===m&&<motion.span layoutId="tab" className="absolute inset-0 -z-10 rounded-full bg-hi" transition={{type:'spring',stiffness:400,damping:30}}/>}{m==='login'?'Sign in':'Create account'}</button>)}
        </div>
        <AnimatePresence mode="wait"><motion.form key={mode} onSubmit={submit} initial={{opacity:0,x:mode==='login'?-20:20}} animate={{opacity:1,x:0}} exit={{opacity:0}} className="space-y-5">
          <h1 className="text-3xl font-extrabold">{mode==='login'?'Welcome back':'Set up your faculty account'}</h1>
          {mode==='signup'&&<Field label="Full name" value={f.name} onChange={set('name')} autoComplete="name"/>}
          <Field label="Email" type="email" value={f.email} onChange={set('email')} autoComplete="email"/>
          <Field label="Password" type="password" value={f.password} onChange={set('password')} autoComplete={mode==='login'?'current-password':'new-password'}/>
          {mode==='signup'&&<>
            <Field label="Department" value={f.department} onChange={set('department')}/>
            <fieldset className="space-y-3"><legend className="font-semibold">What do you teach?</legend>
              <AnimatePresence initial={false}>{rows.map((r,i)=><motion.div key={i} initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="grid grid-cols-2 gap-4 overflow-hidden">
                <Field label="Academic year" value={r.academic_year} onChange={v=>setRow(i,'academic_year',v)}/><Field label="Subject" value={r.subject} onChange={v=>setRow(i,'subject',v)}/></motion.div>)}</AnimatePresence>
              <button type="button" onClick={()=>setRows(r=>[...r,{academic_year:'',subject:''}])} className="text-sm font-semibold underline decoration-pen decoration-2 underline-offset-4">Add another subject</button></fieldset></>}
          <AnimatePresence>{err&&<motion.p role="alert" initial={{opacity:0,x:-8}} animate={{opacity:1,x:[0,-6,6,0]}} exit={{opacity:0}} className="rounded-md border-l-4 border-pen bg-pen/10 px-3 py-2 text-sm">{err}</motion.p>}</AnimatePresence>
          {done&&<motion.p initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} className="rounded-md border-l-4 border-tick bg-tick/10 px-3 py-2 text-sm">Signed in as {done.username}. Opening your dashboard.</motion.p>}
          <BorderButton type="submit">{busy?'Working…':mode==='login'?'Sign in':'Create account'}</BorderButton>
        </motion.form></AnimatePresence>
      </div>
    </main>
  </div>;
}
