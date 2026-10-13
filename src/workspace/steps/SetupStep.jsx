import { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../../api/client.js';
import { Button, Notice, Panel, Pill, StepHeader, unwrap, yearLabel } from '../../components/ui.jsx';
import { Input, Label, LabelInputContainer } from '../../components/aceternity/FormInputs.jsx';
import { CardSpotlight } from '../../components/aceternity/CardSpotlight.jsx';
import { saveExam } from '../store.js';
import { cn } from '../../lib/utils.js';
import { IconArrow } from '../../components/Icons.jsx';

const LEVELS = [
  ['lenient', 'Lenient', 'Credit for the idea, even when the wording is loose.'],
  ['balanced', 'Balanced', 'Key points must be there. Wording can differ.'],
  ['strict', 'Strict', 'Missing points cost marks. Vague answers lose more.'],
  ['examiner', 'Examiner', 'Close to your reference in content and precision.'],
];
const SEM = { FE: 1, SE: 3, TE: 5, BE: 7 };

export default function SetupStep({ ctx }) {
  const { token, role, exam } = ctx;
  const [form, setForm] = useState({ course_code: '', semester: SEM[role.academic_year] || 1, division: 'A', strictness: 'balanced' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function create(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = unwrap(await api.createExam(token, { subject: role.subject, course_code: form.course_code.trim(), semester: Number(form.semester), division: form.division.trim(), strictness: form.strictness }));
      saveExam(r, role.key);
      ctx.onCreated(r.id);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  if (exam) {
    return (
      <>
        <StepHeader title={`${role.subject} is set up`}>This workspace is only for {yearLabel(role.academic_year) || 'this class'}. Marks from your other classes never mix with it.</StepHeader>
        <Panel>
          <dl className="grid gap-5 sm:grid-cols-4">
            {[['Course code', exam.course_code], ['Semester', exam.semester], ['Division', exam.division], ['Strictness', exam.strictness]].map(([k, v]) => (
              <div key={k}><dt className="text-xs text-chalk-faint">{k}</dt><dd className="mt-1 font-display text-2xl capitalize text-chalk">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-6 flex items-center justify-between border-t border-board-700 pt-5">
            <Pill tone={exam.status === 'approved' ? 'good' : 'warn'}>{exam.status === 'approved' ? 'Locked for marking' : 'Draft'}</Pill>
            <Button onClick={() => ctx.go('uploads')}>Continue to uploads <IconArrow className="h-4 w-4" /></Button>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <StepHeader title="Set up this class">Add the details for {role.subject}{role.academic_year ? `, ${yearLabel(role.academic_year)}` : ''}, then choose how strict the marking should be.</StepHeader>
      <form onSubmit={create} className="space-y-8">
        <Panel>
          <div className="grid gap-5 sm:grid-cols-3">
            <LabelInputContainer>
              <Label htmlFor="code">Course code</Label>
              <Input id="code" required value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} placeholder="CS201" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="sem">Semester</Label>
              <Input id="sem" type="number" min="1" max="12" required value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="div">Division</Label>
              <Input id="div" required value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} />
            </LabelInputContainer>
          </div>
        </Panel>

        <fieldset>
          <legend className="mb-3 font-display text-2xl text-chalk">How strict should marking be?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {LEVELS.map(([v, name, text]) => {
              const on = form.strictness === v;
              return (
                <CardSpotlight key={v} as="label" className={cn('cursor-pointer p-5 transition-colors', on && 'border-mustard bg-board-800')}>
                  <input type="radio" name="strictness" value={v} checked={on} onChange={() => setForm({ ...form, strictness: v })} className="sr-only" />
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-chalk">{name}</span>
                    <motion.span animate={{ scale: on ? 1 : 0.6, opacity: on ? 1 : 0.25 }} className="h-3 w-3 rounded-full bg-mustard" />
                  </div>
                  <p className="mt-1 text-sm text-chalk-dim">{text}</p>
                </CardSpotlight>
              );
            })}
          </div>
        </fieldset>

        <Notice error={error} />
        <Button busy={busy} type="submit">Create class workspace</Button>
      </form>
    </>
  );
}
