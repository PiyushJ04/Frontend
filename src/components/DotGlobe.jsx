import { useEffect, useRef } from 'react';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// A globe of dots you can play with: drag to spin (it keeps its momentum), hover to push the dots apart,
// click for a ripple. With `progress` (0 to 1) it fills from the top like a level rising; without it, a band of light sweeps over it.
export default function DotGlobe({ size = 200, progress = null, interactive = true, className }) {
  const ref = useRef(null);
  const hint = useRef(null);
  const prog = useRef(progress);
  prog.current = progress;

  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.height = size * dpr;
    ctx.scale(dpr, dpr);
    const N = 560, G = Math.PI * (3 - Math.sqrt(5));
    const pts = Array.from({ length: N }, (_, i) => { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = G * i; return { x: Math.cos(t) * r, y, z: Math.sin(t) * r, i }; });
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const R = size * 0.43, c = size / 2, HOME = -0.38;
    const S = { yaw: 0, pitch: HOME, vy: 0, vp: 0, drag: false, lx: 0, ly: 0, px: -999, py: -999, hover: 0, over: false, moved: 0 };
    const ripples = [];
    let shown = 0, raf;

    const at = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (size / r.width), (e.clientY - r.top) * (size / r.height)]; };
    const down = (e) => {
      cv.setPointerCapture(e.pointerId);
      S.drag = true; S.moved = 0; S.vy = S.vp = 0;
      [S.lx, S.ly] = at(e); [S.px, S.py] = [S.lx, S.ly];
      cv.style.cursor = 'grabbing';
      if (hint.current) hint.current.style.opacity = 0;
    };
    const move = (e) => {
      const [x, y] = at(e);
      S.px = x; S.py = y; S.over = true;
      if (!S.drag) return;
      const dx = x - S.lx, dy = y - S.ly;
      S.moved += Math.abs(dx) + Math.abs(dy);
      S.yaw += dx * 0.012; S.pitch = clamp(S.pitch - dy * 0.01, -1, 1);
      S.vy = dx * 0.012; S.vp = -dy * 0.01;
      S.lx = x; S.ly = y;
    };
    const up = () => {
      if (S.drag && S.moved < 5) ripples.push({ x: S.px, y: S.py, t: performance.now() });
      S.drag = false; cv.style.cursor = 'grab';
    };
    const leave = () => { S.over = false; if (!S.drag) { S.px = S.py = -999; } };
    if (interactive) {
      cv.style.cursor = 'grab';
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', leave);
    }

    const draw = (now) => {
      ctx.clearRect(0, 0, size, size);
      if (!S.drag) {
        S.yaw += S.vy; S.pitch = clamp(S.pitch + S.vp, -1, 1);
        S.vy *= 0.95; S.vp *= 0.95;
        const idle = 1 - Math.min(1, Math.abs(S.vy) / 0.01);
        S.yaw += (calm ? 0 : 0.0065) * idle * (1 - 0.75 * S.hover); // slows down while you hover, so it is easy to aim at
        S.pitch += (HOME - S.pitch) * 0.004;
      }
      S.hover += ((S.over ? 1 : 0) - S.hover) * 0.12;
      const p = prog.current;
      if (p != null) shown += (p - shown) * 0.06;
      const sweep = Math.sin(now * 0.0014);
      const ca = Math.cos(S.yaw), sa = Math.sin(S.yaw), ct = Math.cos(S.pitch), st = Math.sin(S.pitch);
      for (let k = ripples.length - 1; k >= 0; k--) if (now - ripples[k].t > 1400) ripples.splice(k, 1);

      const out = pts.map((q) => {
        const x = q.x * ca + q.z * sa, z = -q.x * sa + q.z * ca;
        return { x, y: q.y * ct - z * st, z: q.y * st + z * ct, oy: q.y, i: q.i };
      }).sort((m, n) => m.z - n.z);

      for (const q of out) {
        const d = (q.z + 1) / 2;
        let sx = c + q.x * R, sy = c + q.y * R;
        // hover: dots near the pointer swell and are pushed away from it
        const dx = sx - S.px, dy = sy - S.py, dist = Math.hypot(dx, dy) || 1;
        const infl = S.hover * Math.pow(Math.max(0, 1 - dist / 48), 2);
        if (infl > 0) { sx += (dx / dist) * infl * 8; sy += (dy / dist) * infl * 8; }
        // click: a ring of light travels outward from the point you clicked
        let wave = 0;
        for (const r of ripples) {
          const age = now - r.t, rr = age * 0.17;
          wave = Math.max(wave, Math.max(0, 1 - Math.abs(Math.hypot(sx - r.x, sy - r.y) - rr) / 16) * (1 - age / 1400));
        }
        const lit = p != null ? q.i / N < shown : Math.abs(q.oy - sweep) < 0.1;
        const edge = p != null && Math.abs(q.i / N - shown) < 0.012;
        const glow = Math.max(infl, wave);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.6 + d * 1.5 + (edge ? 0.8 : 0) + infl * 2.4 + wave * 2.6, 0, 6.2832);
        ctx.fillStyle = lit || glow > 0.05 ? `rgba(241,210,106,${Math.min(1, 0.35 + d * 0.5 + glow * 0.5)})` : `rgba(236,239,228,${0.07 + d * 0.5})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('pointerleave', leave);
    };
  }, [size, interactive]);

  return (
    <div className={className} style={{ width: size }}>
      <canvas ref={ref} aria-hidden="true" style={{ width: size, height: size, touchAction: 'pan-y' }} />
      {interactive && <p ref={hint} className="text-center text-[11px] text-chalk-faint transition-opacity duration-500">Drag to spin, click for a ripple</p>}
    </div>
  );
}
