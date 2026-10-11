/**
 * motion.js — アニメーション/インタラクション ライブラリ（依存なし）
 *
 * 読み込み: <link rel="stylesheet" href="shared/css/motion.css"><script src="shared/js/motion.js" defer></script>
 * DOMContentLoaded で Motion.init() が自動実行されます。HTMLに data 属性を書くだけで動きます。
 *
 *  data-reveal="fade-up|fade-down|fade-left|fade-right|zoom-in|clip-up|clip-left|blur-in|rotate-in|mask-wipe"
 *      data-delay="200"（ms）  data-stagger="80"（子要素を順番に）
 *  data-split="chars|words"     文字を分割して1文字ずつ出す（kinetic typography）
 *  data-parallax="0.2"          スクロール視差（負数で逆方向）
 *  data-counter="1200"          数字カウントアップ  data-suffix="件" data-decimals="1"
 *  data-magnetic                マグネティックボタン（カーソルに吸い付く）
 *  data-tilt                    3Dチルトカード
 *  data-typewriter              タイプライター（data-sfx-type で打鍵音）
 *  data-marquee="40"            無限スクロール帯（px/秒）
 *  data-scroll-progress         ページ上部のスクロール進捗バー
 *  data-pin-scrub               親(section[data-pin])のスクロール量を --p (0〜1) としてCSSに渡す
 *  data-cursor                  <body data-cursor> でカスタムカーソル
 *  data-line-draw               SVGの線を描くアニメーション
 *  data-hscroll                 縦スクロールで横に流れるセクション
 *  data-ripple                  クリック時の波紋
 *
 * prefers-reduced-motion を尊重し、動きを抑えたいユーザーには最終状態を即表示します。
 */
(function (global) {
  'use strict';
  const reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- split text ----------
  function split(el) {
    if (el.dataset.splitDone) return;
    const mode = el.dataset.split || 'chars';
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let i = 0;
    // <br> や <em> などのタグは残したまま、テキストだけを1文字（1単語）ずつ包む
    (function walk(node) {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 3) {
          const parts = mode === 'words' ? c.textContent.split(/(\s+)/) : Array.from(c.textContent);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const outer = document.createElement('span');
            outer.className = 'm-split';
            outer.setAttribute('aria-hidden', 'true');
            const inner = document.createElement('span');
            inner.className = 'm-split__in';
            inner.style.setProperty('--i', i++);
            inner.textContent = p;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.dataset.splitDone = '1';
  }

  // ---------- reveal ----------
  function initReveal() {
    $$('[data-split]').forEach(split);
    $$('[data-stagger]').forEach((p) => {
      const step = +p.dataset.stagger || 80;
      Array.from(p.children).forEach((c, i) => {
        if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', p.dataset.reveal || 'fade-up');
        c.style.transitionDelay = (i * step + (+p.dataset.delay || 0)) + 'ms';
      });
      if (p.dataset.reveal) p.removeAttribute('data-reveal');
    });
    const targets = $$('[data-reveal], [data-split], [data-counter], [data-typewriter], [data-line-draw]');
    targets.forEach((el) => { if (el.dataset.delay && !el.closest('[data-stagger]')) el.style.transitionDelay = el.dataset.delay + 'ms'; });
    if (reduce || !('IntersectionObserver' in global)) { targets.forEach(show); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    targets.forEach((el) => io.observe(el));
  }

  function show(el) {
    el.classList.add('is-in');
    if (el.dataset.counter !== undefined) counter(el);
    if (el.hasAttribute('data-typewriter')) typewriter(el);
    if (el.hasAttribute('data-line-draw')) lineDraw(el);
    if (el.dataset.sfxIn && global.SFX) setTimeout(() => global.SFX.play(el.dataset.sfxIn), +el.dataset.delay || 0);
  }

  // ---------- counter ----------
  function counter(el) {
    const end = parseFloat(el.dataset.counter);
    const dec = +el.dataset.decimals || 0;
    const suf = el.dataset.suffix || '';
    const pre = el.dataset.prefix || '';
    const dur = +el.dataset.duration || 1600;
    const fmt = (v) => pre + v.toLocaleString('ja-JP', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    if (reduce) { el.textContent = fmt(end); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(end * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- typewriter ----------
  function typewriter(el) {
    const text = el.dataset.text || el.textContent;
    el.dataset.text = text;
    el.setAttribute('aria-label', text);
    if (reduce) { el.textContent = text; return; }
    el.textContent = '';
    el.classList.add('m-caret');
    let i = 0;
    const speed = +el.dataset.speed || 55;
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (el.hasAttribute('data-sfx-type') && global.SFX && text[i - 1] !== ' ') global.SFX.play('typing');
      if (i < text.length) setTimeout(tick, speed + Math.random() * speed * 0.6);
      else setTimeout(() => el.classList.remove('m-caret'), 1200);
    };
    tick();
  }

  // ---------- SVG line draw ----------
  function lineDraw(el) {
    $$('path, line, polyline, circle, rect', el).forEach((p, i) => {
      if (!p.getTotalLength) return;
      const L = p.getTotalLength();
      p.style.strokeDasharray = L;
      p.style.strokeDashoffset = reduce ? 0 : L;
      p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset ${el.dataset.duration || 1600}ms cubic-bezier(.65,0,.35,1) ${i * 120}ms`;
      p.style.strokeDashoffset = 0;
    });
  }

  // ---------- scroll driven (parallax / progress / pin / hscroll) ----------
  function initScroll() {
    const par = $$('[data-parallax]');
    const prog = $$('[data-scroll-progress]');
    const pins = $$('[data-pin]');
    const hs = $$('[data-hscroll]');
    if (!par.length && !prog.length && !pins.length && !hs.length) return;
    hs.forEach((sec) => {
      const track = sec.querySelector('[data-hscroll-track]');
      if (!track) return;
      const setH = () => { sec.style.height = (track.scrollWidth - global.innerWidth + global.innerHeight) + 'px'; };
      setH(); global.addEventListener('resize', setH);
    });
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = global.innerHeight;
      const sy = global.scrollY;
      if (!reduce) par.forEach((el) => {
        const r = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        const off = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      });
      const max = document.documentElement.scrollHeight - vh;
      prog.forEach((el) => el.style.setProperty('--p', max > 0 ? sy / max : 0));
      pins.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        const p = clamp(-r.top / (r.height - vh), 0, 1);
        sec.style.setProperty('--p', p.toFixed(4));
      });
      hs.forEach((sec) => {
        const track = sec.querySelector('[data-hscroll-track]');
        if (!track) return;
        const r = sec.getBoundingClientRect();
        const p = clamp(-r.top / (r.height - vh), 0, 1);
        track.style.transform = `translate3d(${-(track.scrollWidth - global.innerWidth) * p}px,0,0)`;
      });
    };
    global.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    global.addEventListener('resize', update);
    update();
  }

  // ---------- magnetic ----------
  function initMagnetic() {
    if (reduce || matchMedia('(hover: none)').matches) return;
    $$('[data-magnetic]').forEach((el) => {
      const s = parseFloat(el.dataset.magnetic) || 0.35;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px, ${(e.clientY - r.top - r.height / 2) * s}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- tilt ----------
  function initTilt() {
    if (reduce || matchMedia('(hover: none)').matches) return;
    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 10;
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
        el.style.setProperty('--mx', (x + 0.5) * 100 + '%');
        el.style.setProperty('--my', (y + 0.5) * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- marquee ----------
  function initMarquee() {
    $$('[data-marquee]').forEach((el) => {
      const inner = el.firstElementChild;
      if (!inner || el.dataset.mqDone) return;
      el.dataset.mqDone = '1';
      el.appendChild(inner.cloneNode(true)).setAttribute('aria-hidden', 'true');
      const speed = parseFloat(el.dataset.marquee) || 40;
      requestAnimationFrame(() => el.style.setProperty('--mq-dur', (inner.offsetWidth / speed) + 's'));
    });
  }

  // ---------- cursor ----------
  function initCursor() {
    if (reduce || !document.body.hasAttribute('data-cursor') || matchMedia('(hover: none)').matches) return;
    const dot = document.createElement('div'); dot.className = 'm-cursor';
    const ring = document.createElement('div'); ring.className = 'm-cursor-ring';
    document.body.append(dot, ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    document.addEventListener('pointerover', (e) => {
      ring.classList.toggle('is-hover', !!e.target.closest('a,button,[data-magnetic],[data-cursor-hover]'));
    });
    (function loop() { rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18); ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  }

  // ---------- ripple ----------
  function initRipple() {
    document.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('[data-ripple]');
      if (!el || reduce) return;
      const r = el.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'm-ripple';
      const d = Math.max(r.width, r.height) * 2;
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      el.appendChild(s);
      setTimeout(() => s.remove(), 700);
    });
  }

  // ---------- confetti（成功時の演出） ----------
  function confetti(opts = {}) {
    if (reduce) return;
    const n = opts.count || 120;
    const colors = opts.colors || ['#ff5f6d', '#ffc371', '#47e5bc', '#5b8cff', '#c86bfa'];
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    document.body.appendChild(cv);
    const g = cv.getContext('2d'); g.scale(devicePixelRatio, devicePixelRatio);
    const ox = opts.x ?? innerWidth / 2, oy = opts.y ?? innerHeight * 0.6;
    const ps = Array.from({ length: n }, () => ({
      x: ox, y: oy, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 16 - 4,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 6, h: 3 + Math.random() * 5,
      c: colors[(Math.random() * colors.length) | 0],
    }));
    let f = 0;
    (function loop() {
      g.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach((p) => { p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); });
      if (++f < 160) requestAnimationFrame(loop); else cv.remove();
    })();
    if (global.SFX && opts.sound !== false) global.SFX.play('confetti');
  }

  function init() {
    document.documentElement.classList.add('js-motion');
    initReveal(); initScroll(); initMagnetic(); initTilt(); initMarquee(); initCursor(); initRipple();
  }

  global.Motion = { init, split, counter, typewriter, confetti, reduce };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
