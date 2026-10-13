import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import AuthShell from '../components/AuthShell.jsx';
import { Input, Label, LabelInputContainer, BottomGradient } from '../components/aceternity/FormInputs.jsx';
import { Notice, Spinner } from '../components/ui.jsx';
import { api } from '../api/client.js';
import { IconPlus, IconTrash } from '../components/Icons.jsx';

const YEARS = [['FE', '1st year (FE)'], ['SE', '2nd year (SE)'], ['TE', '3rd year (TE)'], ['BE', '4th year (BE)']];
const DEPARTMENTS = ['CSE', 'IT', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'Basic Sciences'];
const blankRow = () => ({ key: Math.random().toString(36).slice(2), academic_year: 'FE', subject: '' });

export default function SignupPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', department: '' });
  const [rows, setRows] = useState([blankRow()]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setRow = (key, k, v) => setRows(rows.map((r) => (r.key === key ? { ...r, [k]: v } : r)));

  // Mirrors what the backend accepts; the backend stays the real check.
  function validate() {
    if (f.name.trim().length < 2) return 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return 'That email does not look right.';
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) return 'Use at least 8 characters, with a letter and a number.';
    if (f.password !== f.confirm) return 'The two passwords do not match.';
    if (!f.department.trim()) return 'Add your department.';
    if (!rows.some((r) => r.subject.trim())) return 'Add at least one subject you teach.';
    return '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError('');
    setBusy(true);
    try {
      await api.signup({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        department: f.department.trim(),
        teaching_assignments: rows.filter((r) => r.subject.trim()).map((r) => ({ academic_year: r.academic_year, subject: r.subject.trim() })),
      });
      navigate('/login', { state: { notice: 'Account created. Log in to continue.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell wide title="Create your account" subtitle="For teachers who check papers. Admins are set up by the institution.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Notice error={error} />
        <div className="grid gap-5 sm:grid-cols-2">
          <LabelInputContainer>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={f.name} onChange={set('name')} placeholder="Dr Atharv Patil" autoComplete="name" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={f.department} onChange={set('department')} list="depts" placeholder="CSE" />
            <datalist id="depts">{DEPARTMENTS.map((d) => <option key={d} value={d} />)}</datalist>
          </LabelInputContainer>
        </div>
        <LabelInputContainer>
          <Label htmlFor="email">College email</Label>
          <Input id="email" type="email" value={f.email} onChange={set('email')} placeholder="name@college.edu" autoComplete="email" />
        </LabelInputContainer>
        <div className="grid gap-5 sm:grid-cols-2">
          <LabelInputContainer>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={f.password} onChange={set('password')} autoComplete="new-password" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </LabelInputContainer>
        </div>

        <fieldset className="rounded-xl border border-board-600/60 p-4">
          <legend className="px-2 text-sm font-medium text-chalk">Classes you teach</legend>
          <p className="mb-3 text-xs text-chalk-dim">Each year and subject becomes its own workspace, so marks never mix between classes.</p>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {rows.map((r, i) => (
                <motion.div key={r.key} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-end gap-2 py-0.5">
                    <LabelInputContainer className="w-40 shrink-0">
                      <Label htmlFor={`year-${r.key}`} className="sr-only">Year</Label>
                      <select id={`year-${r.key}`} value={r.academic_year} onChange={(e) => setRow(r.key, 'academic_year', e.target.value)} className="h-10 w-full rounded-md bg-board-800 px-2 text-sm text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustard/70">
                        {YEARS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </LabelInputContainer>
                    <LabelInputContainer>
                      <Label htmlFor={`subject-${r.key}`} className="sr-only">Subject</Label>
                      <Input id={`subject-${r.key}`} value={r.subject} onChange={(e) => setRow(r.key, 'subject', e.target.value)} placeholder="Object Oriented Programming" />
                    </LabelInputContainer>
                    {rows.length > 1 && (
                      <button type="button" aria-label={`Remove class ${i + 1}`} onClick={() => setRows(rows.filter((x) => x.key !== r.key))} className="mb-2 text-chalk-faint hover:text-pen"><IconTrash className="h-5 w-5" /></button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button type="button" onClick={() => setRows([...rows, blankRow()])} className="mt-3 inline-flex items-center gap-1.5 text-sm text-chalk-dim hover:text-mustard"><IconPlus className="h-4 w-4" /> Add another class</button>
        </fieldset>

        <button disabled={busy} className="group/btn relative flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-chalk font-semibold text-board-950 transition-colors hover:bg-white disabled:opacity-50">
          {busy && <Spinner />}{busy ? 'Creating account' : 'Create account'}
          <BottomGradient />
        </button>
        <p className="text-center text-sm text-chalk-dim">Already registered? <Link to="/login" className="text-chalk underline underline-offset-4 hover:text-mustard">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
