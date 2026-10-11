/**
 * graphics.js — Canvas/SVG のジェネラティブ・グラフィック（依存なし）
 *
 *   <canvas data-gfx="particles" data-colors="#fff,#8cf"></canvas>
 *   <canvas data-gfx="waves"></canvas>
 *   <canvas data-gfx="mesh" data-colors="#ff6b6b,#ffd93d,#6bcBef,#845ef7"></canvas>
 *   <canvas data-gfx="constellation"></canvas>   ネットワーク/テック系
 *   <canvas data-gfx="bokeh"></canvas>           光の玉（ラグジュアリー/美容）
 *   <canvas data-gfx="grid3d"></canvas>          レトロ/サイバーの3Dグリッド
 *   <canvas data-gfx="sakura"></canvas>          花びら（和モダン/春）
 *   <canvas data-gfx="snow"></canvas>            雪（冬/クリスマス）
 *   <canvas data-gfx="rings"></canvas>           同心円波紋（ミニマル）
 *
 * canvas は親要素いっぱいに自動リサイズ。画面外では描画を止めて省電力。
 * GFX.mount(canvas, type, opts) で手動起動も可能。GFX.svg.blob(seed) でランダムなブロブSVGパスを生成。
 */
(function (global) {
  'use strict';
  const reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const hexA = (hex, a) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  const cssVar = (name, fb) => (getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb);

  const scenes = {
    particles(g, w, h, o) {
      const n = o.count || Math.round((w * h) / 9000);
      const ps = Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(0.6, 2.6), vx: rand(-0.2, 0.2), vy: rand(-0.5, -0.1), c: pick(o.colors), a: rand(0.3, 0.9) }));
      return () => {
        g.clearRect(0, 0, w, h);
        ps.forEach((p) => {
          p.x += p.vx; p.y += p.vy;
          if (p.y < -5) { p.y = h + 5; p.x = rand(0, w); }
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fillStyle = hexA(p.c, p.a); g.fill();
        });
      };
    },
    constellation(g, w, h, o) {
      const n = o.count || Math.min(110, Math.round((w * h) / 12000));
      const ps = Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), vx: rand(-0.35, 0.35), vy: rand(-0.35, 0.35) }));
      const c = o.colors[0];
      const D = o.dist || 130;
      return (t, m) => {
        g.clearRect(0, 0, w, h);
        ps.forEach((p) => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; });
        for (let i = 0; i < n; i++) {
          const a = ps[i];
          for (let j = i + 1; j < n; j++) {
            const b = ps[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < D) { g.strokeStyle = hexA(c, (1 - d / D) * 0.5); g.lineWidth = 0.7; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
          }
          if (m) { const d = Math.hypot(a.x - m.x, a.y - m.y); if (d < D * 1.4) { g.strokeStyle = hexA(o.colors[1] || c, (1 - d / (D * 1.4)) * 0.8); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(m.x, m.y); g.stroke(); } }
          g.fillStyle = hexA(c, 0.9); g.beginPath(); g.arc(a.x, a.y, 1.6, 0, 7); g.fill();
        }
      };
    },
    waves(g, w, h, o) {
      const layers = o.layers || 4;
      return (t) => {
        g.clearRect(0, 0, w, h);
        for (let l = 0; l < layers; l++) {
          g.beginPath();
          const amp = h * (0.04 + l * 0.015), base = h * (0.55 + l * 0.1), k = 0.004 + l * 0.0012, sp = t * (0.0006 + l * 0.0002);
          g.moveTo(0, h);
          for (let x = 0; x <= w; x += 8) g.lineTo(x, base + Math.sin(x * k + sp + l) * amp + Math.sin(x * k * 2.3 - sp) * amp * 0.4);
          g.lineTo(w, h); g.closePath();
          g.fillStyle = hexA(o.colors[l % o.colors.length], 0.18 + l * 0.12); g.fill();
        }
      };
    },
    mesh(g, w, h, o) {
      const blobs = o.colors.map((c, i) => ({ c, x: rand(0, w), y: rand(0, h), r: Math.max(w, h) * rand(0.45, 0.75), ph: i * 1.7, sp: rand(0.00012, 0.00028) }));
      return (t) => {
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = o.bg || o.colors[0]; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'lighter';
        blobs.forEach((b) => {
          const x = b.x + Math.cos(t * b.sp + b.ph) * w * 0.25, y = b.y + Math.sin(t * b.sp * 1.3 + b.ph) * h * 0.25;
          const gr = g.createRadialGradient(x, y, 0, x, y, b.r);
          gr.addColorStop(0, hexA(b.c, 0.85)); gr.addColorStop(1, hexA(b.c, 0));
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
        });
        g.globalCompositeOperation = 'source-over';
      };
    },
    bokeh(g, w, h, o) {
      const ps = Array.from({ length: o.count || 26 }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(12, 70), c: pick(o.colors), ph: rand(0, 6), sp: rand(0.0003, 0.001) }));
      return (t) => {
        g.clearRect(0, 0, w, h);
        ps.forEach((p) => {
          const a = 0.12 + (Math.sin(t * p.sp + p.ph) + 1) * 0.12;
          const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          gr.addColorStop(0, hexA(p.c, a)); gr.addColorStop(0.7, hexA(p.c, a * 0.6)); gr.addColorStop(1, hexA(p.c, 0));
          g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y - Math.sin(t * p.sp) * 10, p.r, 0, 7); g.fill();
        });
      };
    },
    grid3d(g, w, h, o) {
      const c = o.colors[0];
      return (t) => {
        g.clearRect(0, 0, w, h);
        const hor = h * 0.45, sp = (t * 0.04) % 40;
        g.strokeStyle = hexA(c, 0.7); g.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
          const z = i * 40 + 40 - sp; const y = hor + (h - hor) * (40 / z) * 2.2;
          if (y > h) continue; g.globalAlpha = Math.min(1, (y - hor) / (h - hor) * 2); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
        }
        g.globalAlpha = 1;
        for (let i = -20; i <= 20; i++) { g.beginPath(); g.moveTo(w / 2 + i * 12, hor); g.lineTo(w / 2 + i * w * 0.12, h); g.stroke(); }
        const sun = g.createLinearGradient(0, hor - h * 0.3, 0, hor);
        sun.addColorStop(0, o.colors[1] || '#ffd319'); sun.addColorStop(1, o.colors[2] || '#ff2975');
        g.fillStyle = sun; g.beginPath(); g.arc(w / 2, hor, h * 0.22, Math.PI, 0); g.fill();
      };
    },
    sakura(g, w, h, o) {
      const ps = Array.from({ length: o.count || 40 }, () => ({ x: rand(0, w), y: rand(-h, h), s: rand(6, 14), r: rand(0, 6), vr: rand(-0.03, 0.03), vy: rand(0.4, 1.2), sw: rand(0, 6), c: pick(o.colors) }));
      return (t) => {
        g.clearRect(0, 0, w, h);
        ps.forEach((p) => {
          p.y += p.vy; p.r += p.vr; p.x += Math.sin(t * 0.001 + p.sw) * 0.6;
          if (p.y > h + 20) { p.y = -20; p.x = rand(0, w); }
          g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, Math.abs(Math.sin(t * 0.002 + p.sw)) * 0.6 + 0.4);
          g.fillStyle = hexA(p.c, 0.85); g.beginPath(); g.moveTo(0, 0);
          g.bezierCurveTo(p.s * 0.6, -p.s * 0.6, p.s, p.s * 0.2, 0, p.s); g.bezierCurveTo(-p.s, p.s * 0.2, -p.s * 0.6, -p.s * 0.6, 0, 0); g.fill(); g.restore();
        });
      };
    },
    snow(g, w, h, o) {
      const ps = Array.from({ length: o.count || 120 }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(1, 3.5), vy: rand(0.3, 1.2), sw: rand(0, 6) }));
      return (t) => {
        g.clearRect(0, 0, w, h); g.fillStyle = hexA(o.colors[0], 0.9);
        ps.forEach((p) => { p.y += p.vy; p.x += Math.sin(t * 0.001 + p.sw) * 0.4; if (p.y > h) { p.y = -5; p.x = rand(0, w); } g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); });
      };
    },
    rings(g, w, h, o) {
      return (t) => {
        g.clearRect(0, 0, w, h);
        const cx = w * (o.x ?? 0.7), cy = h * (o.y ?? 0.5), max = Math.hypot(w, h) * 0.6;
        for (let i = 0; i < 8; i++) {
          const r = ((t * 0.03 + i * (max / 8)) % max);
          g.strokeStyle = hexA(o.colors[i % o.colors.length], (1 - r / max) * 0.5); g.lineWidth = 1.2;
          g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
        }
      };
    },
  };

  function mount(cv, type, opts = {}) {
    const g = cv.getContext('2d');
    const colors = (opts.colors || cv.dataset.colors || '').split(',').map((s) => s.trim()).filter(Boolean);
    const o = Object.assign({}, opts, {
      colors: colors.length ? colors : [cssVar('--c-primary', '#5b8cff'), cssVar('--c-accent', '#ff5f6d'), cssVar('--c-surface', '#ffffff')],
      bg: opts.bg || cv.dataset.bg,
      count: opts.count || +cv.dataset.count || undefined,
    });
    let w, h, draw, mouse = null, visible = true, raf;
    const fit = () => {
      const r = (cv.parentElement || cv).getBoundingClientRect();
      const dpr = Math.min(2, global.devicePixelRatio || 1);
      w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw = scenes[type](g, w, h, o);
    };
    fit();
    new ResizeObserver(fit).observe(cv.parentElement || cv);
    cv.parentElement && cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    cv.parentElement && cv.parentElement.addEventListener('pointerleave', () => { mouse = null; });
    if ('IntersectionObserver' in global) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(performance.now()); }).observe(cv);
    function loop(t) { cancelAnimationFrame(raf); draw(t, mouse); if (visible && !reduce) raf = requestAnimationFrame(loop); }
    loop(performance.now());
    return { stop: () => cancelAnimationFrame(raf) };
  }

  // ---------- SVG ヘルパー ----------
  const svg = {
    /** なめらかなランダムブロブ（ヒーロー背景・写真マスクに） */
    blob(seed = Math.random(), points = 8, r = 100) {
      let s = Math.floor(seed * 1e9) || 1;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const pts = Array.from({ length: points }, (_, i) => { const a = (i / points) * Math.PI * 2; const rr = r * (0.75 + rnd() * 0.5); return [r + Math.cos(a) * rr, r + Math.sin(a) * rr]; });
      let d = '';
      pts.forEach((p, i) => { const n = pts[(i + 1) % points]; const m = [(p[0] + n[0]) / 2, (p[1] + n[1]) / 2]; d += i === 0 ? `M${m[0].toFixed(1)},${m[1].toFixed(1)}` : ''; const nn = pts[(i + 2) % points]; const m2 = [(n[0] + nn[0]) / 2, (n[1] + nn[1]) / 2]; d += ` Q${n[0].toFixed(1)},${n[1].toFixed(1)} ${m2[0].toFixed(1)},${m2[1].toFixed(1)}`; });
      return d + 'Z';
    },
    /** 波形の区切り線 */
    wave(width = 1440, height = 80, waves = 2) {
      let d = `M0,${height / 2}`;
      for (let i = 0; i <= waves * 2; i++) { const x = (width / (waves * 2)) * i; d += ` Q${x - width / (waves * 4)},${i % 2 ? 0 : height} ${x},${height / 2}`; }
      return d + ` L${width},${height} L0,${height}Z`;
    },
  };

  function init() {
    // GIF書き出し時（?nogfx=1）は容量削減のため動く背景を止める
    if (/[?&]nogfx=1/.test(location.search)) { document.querySelectorAll('canvas[data-gfx]').forEach((c) => (c.style.display = 'none')); return; }
    document.querySelectorAll('canvas[data-gfx]').forEach((cv) => { if (!cv.dataset.gfxDone) { cv.dataset.gfxDone = 1; mount(cv, cv.dataset.gfx); } });
    document.querySelectorAll('[data-blob]').forEach((el) => {
      const p = el.querySelector('path') || el;
      p.setAttribute('d', svg.blob(parseFloat(el.dataset.blob) || Math.random()));
    });
  }

  global.GFX = { mount, init, svg, scenes };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window);
