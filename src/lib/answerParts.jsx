// Turns "a) ... b) ... c) ..." text into separate parts, and tidies a part into readable paragraphs.
const LETTERS = 'abcdefghij';

export function splitParts(text = '') {
  const t = String(text);
  const found = [];
  let from = 0;
  for (const L of LETTERS) {
    const m = new RegExp(`(^|[\\s.;:\\]])\\(?${L}\\)\\s+`, 'i').exec(t.slice(from));
    if (!m) break;
    const start = from + m.index + m[1].length, end = from + m.index + m[0].length;
    found.push({ label: L, start, end });
    from = end;
  }
  if (found.length < 2) return { intro: '', parts: [{ label: null, text: t.trim() }] };
  return {
    intro: t.slice(0, found[0].start).trim(),
    parts: found.map((f, i) => ({ label: f.label, text: t.slice(f.end, found[i + 1] ? found[i + 1].start : undefined).trim() })),
  };
}

// Two sentences per paragraph keeps lines short and scannable.
export function paragraphs(text, per = 2) {
  const s = String(text).split(/(?<=[.!?])\s+(?=[A-Z(])/).filter(Boolean);
  const out = [];
  for (let i = 0; i < s.length; i += per) out.push(s.slice(i, i + per).join(' '));
  return out.length ? out : [String(text)];
}

const CODE = /(\b[A-Z]\w*\s+\w+\s*=\s*new\s+\w+\([^)]*\);?|\b[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+(?:\(\))?|\b[A-Za-z_]\w*\(\))/g;
const SKIP = new Set(['e.g', 'i.e', 'etc']);

// Wraps code-looking fragments (s1.show(), new Student();) in a monospace chip.
export function rich(text) {
  const out = [];
  let last = 0, k = 0;
  for (const m of String(text).matchAll(CODE)) {
    if (SKIP.has(m[0].toLowerCase())) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<code key={k++} className="rounded-md border border-board-600/60 bg-board-950 px-1.5 py-0.5 font-hand text-[0.82em] text-sky">{m[0]}</code>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}
