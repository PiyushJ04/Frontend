import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../../api/client.js';
import { Button, Notice, Panel, Pill, StepHeader } from '../../components/ui.jsx';
import { FileUpload } from '../../components/aceternity/FileUpload.jsx';
import { MultiStepLoader } from '../../components/aceternity/MultiStepLoader.jsx';
import { IconArrow, IconCheck, IconFile } from '../../components/Icons.jsx';
import { cn } from '../../lib/utils.js';

const LOADER = {
  knowledge: [{ text: 'Opening your PDFs' }, { text: 'Reading every page' }, { text: 'Splitting into passages' }, { text: 'Indexing them for search' }],
  paper: [{ text: 'Opening the question paper' }, { text: 'Finding each question' }, { text: 'Reading the marks for every part' }, { text: 'Saving the structure' }],
};

function Stage({ n, title, text, done, locked, children, files }) {
  return (
    <motion.div layout className={cn('rounded-2xl border p-5 md:p-6 transition-colors', locked ? 'border-board-700 bg-board-900/50 opacity-60' : 'border-board-600/60 bg-board-900')}>
      <div className="mb-4 flex items-start gap-4">
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-xl', done ? 'bg-tick/20 text-tick' : 'bg-board-700 text-chalk')}>{done ? <IconCheck className="h-5 w-5" /> : n}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl text-chalk">{title}</h2>
          <p className="text-sm text-chalk-dim">{locked ? 'Finish the step above to unlock this one.' : text}</p>
        </div>
        {done && <Pill tone="good">Uploaded</Pill>}
      </div>
      {!locked && children}
      {files?.length > 0 && (
        <ul className="mt-4 space-y-1.5" aria-label={`${title} uploaded`}>
          {files.map((f, i) => <li key={f + i} className="flex items-center gap-2 text-sm text-chalk-dim"><IconFile className="h-4 w-4" />{f}</li>)}
        </ul>
      )}
    </motion.div>
  );
}
export default function UploadsStep({ ctx }) {
  const { token, examId, flags, setFlags, questions, reload } = ctx;
  const [picked, setPicked] = useState({ syllabus: [], notes: [], sample: [], paper: [] });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [sample, setSample] = useState(false);

  const syllabusDone = flags.syllabus.length > 0;
  const notesDone = flags.notes.length > 0;
  const paperDone = flags.paper.length > 0 || questions.length > 0;

  async function send(kind) {
    setBusy(kind); setError('');
    try {
      const files = picked[kind];
      if (kind === 'paper') await api.uploadQuestionPaper(token, examId, files[0]);
      else await api.uploadKnowledge(token, examId, { syllabus: 'syllabus', notes: 'theory_notes', sample: 'sample_answer' }[kind], files);
      setFlags({ [kind]: [...flags[kind], ...files.map((f) => f.name)] });
      setPicked((p) => ({ ...p, [kind]: [] }));
      await reload();
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }

  const upload = (kind, label, multiple) => (
    <>
      <FileUpload multiple={multiple} files={picked[kind]} onChange={(f) => setPicked((p) => ({ ...p, [kind]: f }))} title={label} hint={multiple ? 'Drag PDFs here or click to choose. You can add several.' : 'Drag the PDF here or click to choose.'} disabled={!!busy} />
      {picked[kind].length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button busy={busy === kind} onClick={() => send(kind)}>Upload {picked[kind].length} {picked[kind].length === 1 ? 'file' : 'files'}</Button>
        </div>
      )}
    </>
  );

  const all = ctx.done.uploads;

  return (
    <>
      <MultiStepLoader steps={busy === 'paper' ? LOADER.paper : LOADER.knowledge} loading={!!busy} duration={1900} title={busy === 'paper' ? 'Reading your question paper' : 'Reading your material'} hint="Large PDFs take a minute. You can keep this tab open." />
      <StepHeader title="Upload what you teach from">Go in order: syllabus, then theory notes, then the question paper. Reference answers are written only from what you upload here.</StepHeader>
      <Notice error={error} />
      <div className="mt-4 space-y-4">
        <Stage n={1} title="Syllabus" text="The topics this paper covers." done={syllabusDone} files={flags.syllabus}>{upload('syllabus', 'Add your syllabus', true)}</Stage>
        <Stage n={2} title="Theory notes" text="Short notes for each topic. Answers will cite these pages." done={notesDone} locked={!syllabusDone} files={flags.notes}>
          {upload('notes', 'Add your theory notes', true)}
          <div className="mt-4">
            <button type="button" onClick={() => setSample(!sample)} className="text-sm text-chalk-dim underline-offset-4 hover:text-mustard hover:underline" aria-expanded={sample}>{sample ? 'Hide sample answers' : 'Add sample answers (optional)'}</button>
            <AnimatePresence initial={false}>
              {sample && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4">
                    {upload('sample', 'Add sample answers', true)}
                    {flags.sample.length > 0 && <ul className="mt-3 space-y-1.5">{flags.sample.map((f, i) => <li key={f + i} className="flex items-center gap-2 text-sm text-chalk-dim"><IconFile className="h-4 w-4" />{f}</li>)}</ul>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Stage>
        <Stage n={3} title="Question paper" text="The questions and the marks for each part." done={paperDone} locked={!notesDone} files={flags.paper}>{upload('paper', 'Add the question paper', false)}</Stage>
      </div>

      {questions.length > 0 && (
        <Panel className="mt-6">
          <h2 className="font-display text-2xl text-chalk">{questions.length} questions found</h2>
          <ul className="mt-3 divide-y divide-board-700">
            {questions.map((q, i) => (
              <motion.li key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-start gap-4 py-3">
                <span className="w-10 shrink-0 font-hand text-2xl text-mustard">Q{q.question_no || i + 1}</span>
                <span className="flex-1 text-chalk">{q.question_text}</span>
                <span className="shrink-0 text-sm text-chalk-dim">{q.max_marks} marks</span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      )}

      {all && (
        <div className="mt-6 flex justify-end">
          <Button onClick={() => ctx.go('reference')}>Continue to reference answers <IconArrow className="h-4 w-4" /></Button>
        </div>
      )}
    </>
  );
}
