import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { Input, Label, LabelInputContainer, BottomGradient } from '../components/aceternity/FormInputs.jsx';
import { Notice, Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to pick up your classes where you left them.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Notice tone="good">{state?.notice}</Notice>
        <Notice error={error} />
        <LabelInputContainer>
          <Label htmlFor="email">College email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@college.edu" autoComplete="email" required />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="pr-16" required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-chalk-dim hover:text-chalk" aria-pressed={show}>{show ? 'Hide' : 'Show'}</button>
          </div>
        </LabelInputContainer>
        <button disabled={busy || !email || !password} className="group/btn relative flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-chalk font-semibold text-board-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
          {busy && <Spinner />}{busy ? 'Checking' : 'Log in'}
          <BottomGradient />
        </button>
        <p className="text-center text-sm text-chalk-dim">New here? <Link to="/signup" className="text-chalk underline underline-offset-4 hover:text-mustard">Create a teacher account</Link></p>
      </form>
    </AuthShell>
  );
}
