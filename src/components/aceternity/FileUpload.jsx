import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.js';
import { IconUpload } from '../Icons.jsx';

// Aceternity UI: File Upload (native drag and drop, no extra dependency)
function GridPattern() {
  const columns = 41, rows = 11;
  return (
    <div className="flex bg-board-800 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const odd = (row * columns + col) % 2 === 0;
          return <div key={`${col}-${row}`} className={cn('w-10 h-10 flex shrink-0 rounded-[2px]', odd ? 'bg-board-900' : 'bg-board-900 shadow-[0px_0px_1px_3px_rgba(8,20,16,1)_inset]')} />;
        })
      )}
    </div>
  );
}

const size = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function FileUpload({ onChange, accept = '.pdf', multiple = true, title = 'Upload files', hint = 'Drag files here or click to choose', disabled, files: controlled, className }) {
  const [internal, setInternal] = useState([]);
  const files = controlled ?? internal;
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const exts = accept.split(',').map((s) => s.trim().toLowerCase());
  const ok = (f) => exts.some((e) => f.name.toLowerCase().endsWith(e));
  const take = (list) => {
    const picked = Array.from(list).filter(ok);
    const next = multiple ? [...files, ...picked] : picked.slice(0, 1);
    setInternal(next);
    onChange?.(next);
  };
  const remove = (i) => {
    const next = files.filter((_, j) => j !== i);
    setInternal(next);
    onChange?.(next);
  };
  return (
    <div className={cn('w-full', className)}>
      <motion.div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled) take(e.dataTransfer.files); }}
        whileHover={disabled ? undefined : { scale: 1.005 }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && inputRef.current?.click()}
        className={cn('group/file relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-dashed p-8 transition-colors', drag ? 'border-mustard bg-board-800' : 'border-board-500 bg-board-900', disabled && 'cursor-not-allowed opacity-50')}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden disabled={disabled} onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"><GridPattern /></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="font-display text-2xl text-chalk">{title}</p>
          <p className="mt-1 text-sm text-chalk-dim">{hint}</p>
          <div className="relative mx-auto mt-8 w-full max-w-xl space-y-3">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={file.name + idx}
                  layoutId={idx === 0 ? 'file-upload' : 'file-upload-' + idx}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-40 mx-auto flex w-full flex-col items-start justify-start overflow-hidden rounded-xl bg-board-800 p-4 text-left shadow-sm border border-board-600/60"
                >
                  <div className="flex w-full items-center justify-between gap-4">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xs truncate text-base text-chalk">{file.name}</motion.p>
                    <div className="flex items-center gap-3">
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-fit shrink-0 rounded-lg bg-board-950 px-2 py-0.5 text-xs text-chalk-dim">{size(file.size)}</motion.p>
                      <button type="button" aria-label={`Remove ${file.name}`} onClick={() => remove(idx)} className="text-xs text-chalk-faint hover:text-pen">Remove</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={{ initial: { x: 0, y: 0 }, animate: { x: 16, y: -16, opacity: 0.9 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative z-40 mx-auto mt-4 flex h-28 w-full max-w-[9rem] items-center justify-center rounded-md bg-board-800 border border-board-600/60 shadow-[0px_10px_50px_rgba(0,0,0,0.35)] group-hover/file:shadow-2xl"
                >
                  {drag ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-mustard">Drop it<IconUpload className="h-4 w-4 mt-1" /></motion.p>
                  ) : (
                    <IconUpload className="h-5 w-5 text-chalk-dim" />
                  )}
                </motion.div>
                <motion.div variants={{ initial: { opacity: 0 }, animate: { opacity: 1 } }} className="absolute inset-0 z-30 mx-auto mt-4 flex h-28 w-full max-w-[9rem] items-center justify-center rounded-md border border-dashed border-mustard/70 bg-transparent opacity-0" />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
