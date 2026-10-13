import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../../api/client.js';
import { Button, Notice, Panel, Pill, Spinner, StepHeader, unwrap } from '../../components/ui.jsx';
import { FileUpload } from '../../components/aceternity/FileUpload.jsx';
import { FlipWords } from '../../components/aceternity/FlipWords.jsx';
import { MovingBorderButton } from '../../components/aceternity/MovingBorder.jsx';
import DotGlobe from '../../components/DotGlobe.jsx';
import { IconArrow, IconCheck } from '../../components/Icons.jsx';
import { cn } from '../../lib/utils.js';

function jobFailureText(job) {
  if (job?.error_message) return job.error_message;
  const failures = job?.result_json?.failures || [];
  if (!failures.length) return '';
  return failures.map((f) => `${f.student_identifier || f.sheet_id}: ${f.error}`).join(' | ');
}

function Progress({ job, title = 'Marking', note }) {
  const total = job.progress_total || 0, got = job.progress_completed || 0;
  const pct = total ? Math.min(100, Math.round((got / total) * 100)) : 0;
  const running = !['completed', 'failed'].includes(job.status);
  const failure = jobFailureText(job);
  const level = !running ? (job.status === 'failed' ? pct / 100 : 1) : total ? pct / 100 : null;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-board-700 bg-board-900/60 px-6 py-10 text-center md:flex-row md:gap-14 md:px-14 md:text-left">
      <DotGlobe size={200} progress={level} className="relative shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-hand text-[11px] uppercase tracking-[0.22em] text-chalk-faint">{title}</p>
        {running && !total ? (
          <p className="mt-3 font-display text-4xl text-chalk">Working<span className="animate-pulse">...</span></p>
        ) : (
          <p className="mt-2 font-display text-7xl leading-none tabular-nums text-chalk">{pct}<span className="text-3xl text-chalk-faint">%</span></p>
        )}
        <div className="mt-5 h-px w-full max-w-xs overflow-hidden bg-board-600 max-md:mx-auto"><motion.div className="h-full bg-mustard" animate={{ width: `${running && !total ? 30 : pct}%` }} transition={{ type: 'spring', stiffness: 60, damping: 18 }} /></div>
        {running ? (
          <p className="mt-4 text-sm text-chalk-dim">{note || `${got} of ${total} done. You can leave this page open.`}</p>
        ) : job.status === 'failed' ? (
          <p className="mt-4 text-sm text-pen-soft">{failure || 'Some items could not be processed. Fix the failed items and run it again.'}</p>
        ) : (
          <p className="mt-4 text-sm text-chalk-dim">{title === 'Marking' ? 'Every eligible paper finished with the locked scheme.' : 'All uploaded PDFs were processed and are ready for marking.'}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function EvaluateStep({ ctx }) {
  const { token, examId, exam, flags, setFlags } = ctx;
  const [sheets, setSheets] = useState([]);
  const [zip, setZip] = useState([]);
  const [job, setJob] = useState(null);
  const [uploadJob, setUploadJob] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const uploadTimer = useRef(null);
  const markTimer = useRef(null);

  const load = async () => {
    try {
      const list = unwrap(await api.students(token, examId)) || [];
      setSheets(list);
      // If marking finished while this page was closed, the browser flag was never set. Trust the server.
      const settled = list.length > 0 && list.every((s) => s.status === 'evaluated' || s.status === 'failed');
      if (settled && list.some((s) => s.status === 'evaluated') && !flags.evaluated) setFlags({ evaluated: true });
    } catch (err) { setError(err.message); }
  };
  useEffect(() => { load(); }, [examId]);

  async function upload() {
    setBusy('upload'); setError('');
    try {
      const response = await api.uploadStudents(token, examId, zip[0]);
      setSheets(response.data || []);
      setUploadJob({ id: response.job_id, status: response.job_status, progress_total: response.data?.length || 0, progress_completed: 0, result_json: null, error_message: null });
      setZip([]);
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  async function start() {
    setBusy('queue'); setError('');
    try { setJob(unwrap(await api.evaluateAll(token, examId))); } catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  useEffect(() => {
    if (!uploadJob?.id || ['completed', 'failed'].includes(uploadJob.status)) return;
    uploadTimer.current = setInterval(async () => {
      try {
        const j = unwrap(await api.job(token, uploadJob.id));
        setUploadJob(j);
        const currentSheets = unwrap(await api.students(token, examId)) || [];
        setSheets(currentSheets);
        if (['completed', 'failed'].includes(j.status)) clearInterval(uploadTimer.current);
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(uploadTimer.current);
  }, [uploadJob?.id, uploadJob?.status, token, examId]);

  useEffect(() => {
    if (!job?.id || ['completed', 'failed'].includes(job.status)) return;
    markTimer.current = setInterval(async () => {
      try {
        const j = unwrap(await api.job(token, job.id));
        setJob(j);
        if (['completed', 'failed'].includes(j.status)) { clearInterval(markTimer.current); load(); if (j.status === 'completed') setFlags({ evaluated: true }); }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(markTimer.current);
  }, [job?.id, job?.status, token, examId]);

  const ready = sheets.some((s) => s.status === 'ready');
  const ingestRunning = uploadJob && !['completed', 'failed'].includes(uploadJob.status);
  const running = job && !['completed', 'failed'].includes(job.status);
  const locked = exam?.status !== 'approved';

  return (
    <>
      <StepHeader title="Mark the class">Upload one zip with a PDF for every student. Marking runs in the background, so you can watch each paper finish.</StepHeader>
      <Notice error={error} />
      <div className="mt-4 space-y-5">
        {busy === 'upload' && <Progress job={{ status: 'running' }} title="Uploading" note="Sending your zip to the server. Large files take a moment." />}
        {!running && !ingestRunning && busy !== 'upload' && (
          <Panel>
            <FileUpload accept=".zip" multiple={false} files={zip} onChange={setZip} title="Add the class zip" hint="One PDF per student. The student's name or roll number comes from the file name." disabled={locked || !!busy} />
            {zip.length > 0 && <div className="mt-4 flex justify-end"><Button busy={busy === 'upload'} onClick={upload}>Upload zip</Button></div>}
          </Panel>
        )}

        {uploadJob && <Progress job={uploadJob} title="Upload processing" />}
        {job && <Progress job={job} title="Marking" />}

        {sheets.length > 0 && (
          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl text-chalk">{sheets.length} answer sheets</h2>
              <button onClick={load} className="text-sm text-chalk-dim hover:text-chalk">Refresh</button>
            </div>
            <ul className="divide-y divide-board-700">
              {sheets.map((s, i) => (
                <motion.li key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.04 }} className="flex items-center gap-4 py-2.5">
                  <div className="min-w-0 flex-1"><p className="truncate text-chalk">{s.student_identifier}</p><p className="truncate text-xs text-chalk-faint">{s.original_file_name}{s.page_count ? `, ${s.page_count} pages` : ''}</p>{s.error_message && <p className="mt-1 text-xs text-pen-soft">{s.error_message}</p>}</div>
                  {running && s.status === 'ready' ? <Spinner className="text-mustard" /> : <Pill tone={s.status === 'ready' || s.status === 'evaluated' ? 'good' : s.status === 'failed' ? 'bad' : 'warn'}>{s.status}</Pill>}
                </motion.li>
              ))}
            </ul>
          </Panel>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!running && !(job?.status === 'completed') && (
            <MovingBorderButton onClick={start} disabled={!ready || ingestRunning || locked || busy === 'queue'} containerClassName="h-12 w-64">{busy === 'queue' ? 'Queueing' : `Mark all ${sheets.filter((s) => s.status === 'ready').length || ''} papers`}</MovingBorderButton>
          )}
          {(flags.evaluated || job?.status === 'completed') && <Button onClick={() => ctx.go('results')} className="ml-auto">See class results <IconArrow className="h-4 w-4" /></Button>}
        </div>
      </div>
    </>
  );
}
