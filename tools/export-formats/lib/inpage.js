/*
 * inpage.js — 書き出し対象ページの中で動く解析コード（Playwright から addScriptTag で注入）
 *
 * window.__XL.collect(selector)   … 作品をレイヤー（背景・図形・画像・テキスト）に分解して返す
 * window.__XL.isolate(id, mode)   … 指定レイヤーだけが見える状態にする（ラスター取り込み用）
 * window.__XL.reset()             … isolate を解除
 */
(() => {
  const XL = (window.__XL = {});
  const ATOMIC = new Set(['IMG', 'CANVAS', 'VIDEO', 'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT', 'PICTURE', 'OBJECT', 'EMBED', 'svg', 'SVG', 'math']);
  const els = []; // data-xl-id → Element
  let root = null;

  // ---------- 色・フォント ----------
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();
  function rgba(c) {
    if (!c) return [0, 0, 0, 0];
    if (colorCache.has(c)) return colorCache.get(c);
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = '#000';
    cx.fillStyle = c;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    // 半透明は乗算済みで返るので戻す
    const a = d[3] / 255;
    const out = a ? [Math.round(d[0] / a), Math.round(d[1] / a), Math.round(d[2] / a), +a.toFixed(3)] : [0, 0, 0, 0];
    colorCache.set(c, out);
    return out;
  }
  const ascCache = new Map();
  function ascent(font) {
    if (!ascCache.has(font)) {
      cx.font = font;
      const m = cx.measureText('Hgあ');
      ascCache.set(font, { a: m.fontBoundingBoxAscent, d: m.fontBoundingBoxDescent });
    }
    return ascCache.get(font);
  }

  // ---------- 判定 ----------
  const hasTransform = (cs) => cs.transform !== 'none' || (cs.translate && cs.translate !== 'none') || (cs.rotate && cs.rotate !== 'none') || (cs.scale && cs.scale !== 'none');
  const NOFILTER = /^(\s*(blur\(0px\)|(brightness|contrast|saturate|opacity)\(1\)|(grayscale|sepia|invert)\(0\)|hue-rotate\(0deg\)))*\s*$/;
  const fx = (cs) => (cs.filter !== 'none' && !NOFILTER.test(cs.filter)) || cs.mixBlendMode !== 'normal' || (cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none') || cs.clipPath !== 'none' || (cs.backdropFilter && cs.backdropFilter !== 'none');
  function isUnit(el, cs) {
    if (el === root) return false;
    if (cs.position !== 'static') return true;
    if (cs.zIndex !== 'auto' && el.parentElement && /flex|grid/.test(getComputedStyle(el.parentElement).display)) return true;
    return +cs.opacity < 1 || hasTransform(cs) || fx(cs) || cs.isolation === 'isolate';
  }
  const ownIdentity = (cs) => {
    if ((cs.translate && cs.translate !== 'none') || (cs.rotate && cs.rotate !== 'none') || (cs.scale && cs.scale !== 'none')) return false;
    try { return cs.transform === 'none' || new DOMMatrix(cs.transform).isIdentity; } catch { return false; }
  };
  const zOf = (cs) => (cs.zIndex === 'auto' ? 0 : parseInt(cs.zIndex, 10) || 0);
  const bucketOfUnit = (cs) => { const z = zOf(cs); return z < 0 ? 0 : z === 0 ? 3 : 4; };
  const clips = (cs) => cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || /paint|strict|content/.test(cs.contain || '');
  function boxPaint(el, cs) {
    if (rgba(cs.backgroundColor)[3] > 0) return true;
    if (cs.backgroundImage !== 'none') return true;
    if (cs.boxShadow !== 'none') return true;
    if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) return true;
    for (const s of ['Top', 'Right', 'Bottom', 'Left'])
      if (cs['border' + s + 'Style'] !== 'none' && parseFloat(cs['border' + s + 'Width']) > 0 && rgba(cs['border' + s + 'Color'])[3] > 0) return true;
    if (el.tagName === 'LI' && cs.display === 'list-item' && cs.listStyleType !== 'none') return false; // マーカーはテキスト側
    return false;
  }
  function pseudoOn(el, p) {
    const s = getComputedStyle(el, p);
    return s.content && s.content !== 'none' && s.content !== 'normal' && s.display !== 'none' && s.visibility === 'visible';
  }
  const isInline = (cs) => cs.display === 'inline' || cs.display === 'contents';

  function label(el) {
    if (el.id) return el.id;
    const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter((x) => !x.startsWith('is-') && !x.startsWith('m-'))[0] : '';
    return (el.tagName || 'el').toLowerCase() + (c ? '.' + c : '');
  }

  const vrect = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };

  // ---------- 収集 ----------
  XL.collect = (selector) => {
    root = (selector && document.querySelector(selector)) || document.querySelector('[data-artboard]') || document.body;
    const isDoc = root === document.body || root === document.documentElement;
    root.setAttribute('data-xl-root', '');
    const R = isDoc
      ? { x: 0, y: 0, w: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) }
      : vrect(root);
    const items = [];
    let dom = 0;
    const warnings = [];

    // 1) 変形（transform）を持つ要素に印を付け、見た目上の座標系を測る
    const all = [root, ...root.querySelectorAll('*')];
    const tfs = [];
    for (const el of all) { const cs = getComputedStyle(el); if (el !== root && hasTransform(cs)) { el.setAttribute('data-xl-tf', ''); tfs.push(el); } }
    if (!isDoc && hasTransform(getComputedStyle(root))) { root.setAttribute('data-xl-tf', ''); tfs.push(root); }
    const probes = new Map();
    for (const t of tfs) {
      if (ATOMIC.has(t.tagName)) continue;
      const ps = [[0, 0], [100, 0], [0, 100]].map(([l, tp]) => {
        const p = document.createElement('i');
        p.setAttribute('data-xl-probe', '');
        p.style.cssText = `position:absolute!important;left:${l}px!important;top:${tp}px!important;width:0!important;height:0!important;margin:0!important;padding:0!important;border:0!important;display:block!important`;
        t.appendChild(p);
        return p;
      });
      probes.set(t, { ps, P: ps.map((p) => { const r = p.getBoundingClientRect(); return [r.left + scrollX, r.top + scrollY]; }) });
    }

    // 2) 見た目上の矩形（ラスター取り込み用）を先に記録
    const visual = new Map();
    for (const el of all) visual.set(el, vrect(el));

    // 3) 変形を一時的に外して、レイアウト上の座標を測る
    const st = document.createElement('style');
    st.textContent = '[data-xl-tf]{transform:translate(0px)!important;translate:none!important;rotate:none!important;scale:none!important}';
    document.head.appendChild(st);
    const matrices = new Map();
    for (const [t, { ps, P }] of probes) {
      const Q = ps.map((p) => { const r = p.getBoundingClientRect(); return [r.left + scrollX, r.top + scrollY]; });
      const a = (P[1][0] - P[0][0]) / 100, b = (P[1][1] - P[0][1]) / 100, c = (P[2][0] - P[0][0]) / 100, d = (P[2][1] - P[0][1]) / 100;
      const e = P[0][0] - a * Q[0][0] - c * Q[0][1], f = P[0][1] - b * Q[0][0] - d * Q[0][1];
      const id = Math.abs(a - 1) < 1e-4 && Math.abs(d - 1) < 1e-4 && Math.abs(b) < 1e-4 && Math.abs(c) < 1e-4 && Math.abs(e) < 0.01 && Math.abs(f) < 0.01;
      matrices.set(t, id ? null : [a, b, c, d, e, f].map((v) => +v.toFixed(5)));
    }

    function textRuns(C, parts) {
      // parts: [{node, el}] 段落内のテキストノード
      const lines = [];
      let line = null, run = null, decoFx = false;
      for (const { node, el } of parts) {
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        const font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
        const m = ascent(font);
        const fill = rgba(cs.webkitTextFillColor || cs.color);
        const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0;
        const tt = cs.textTransform;
        // 下線・取り消し線（実線で文字と同じ色ならSVG/PSDの文字設定で再現、それ以外は画像にする）
        let deco = '';
        for (let e = el; e; e = e.parentElement) {
          const ds = getComputedStyle(e);
          if (ds.textDecorationLine !== 'none') {
            if (ds.textDecorationStyle !== 'solid' || rgba(ds.textDecorationColor).join() !== fill.join() || /overline/.test(ds.textDecorationLine)) decoFx = true;
            deco = ds.textDecorationLine;
          }
          if (e === C) break;
        }
        const sig = [font, fill.join(','), ls, deco].join('|');
        const s = node.data;
        const rg = document.createRange();
        for (let i = 0; i < s.length; ) {
          const cp = s.codePointAt(i);
          const n = cp > 0xffff ? 2 : 1;
          rg.setStart(node, i); rg.setEnd(node, i + n);
          let ch = s.slice(i, i + n);
          i += n;
          const rs = rg.getClientRects();
          const r = rs[rs.length - 1];
          if (!r || (r.width === 0 && /\s/.test(ch))) continue;
          if (/\s/.test(ch)) ch = ' ';
          if (tt === 'uppercase') ch = ch.toUpperCase(); else if (tt === 'lowercase') ch = ch.toLowerCase();
          const top = r.top + scrollY, bot = r.bottom + scrollY, left = r.left + scrollX, right = r.right + scrollX, mid = (top + bot) / 2;
          if (!line || mid < line.top || mid > line.bottom || left < line.right - size * 0.5) {
            if (line && ch === ' ') continue; // 行頭の空白
            line = { top, bottom: bot, right, runs: [] }; lines.push(line); run = null;
          }
          const gap = left - line.right;
          if (!run || run.sig !== sig || gap > size * 0.6 + Math.max(ls, 0)) {
            run = { sig, deco, text: '', x: left, base: top + m.a, size, family: cs.fontFamily, weight: +cs.fontWeight || 400, style: cs.fontStyle, fill, ls, top, bottom: bot };
            line.runs.push(run);
          }
          run.text += ch;
          run.right = right;
          line.top = Math.min(line.top, top); line.bottom = Math.max(line.bottom, bot); line.right = right;
        }
      }
      for (const l of lines) { const last = l.runs[l.runs.length - 1]; if (last) last.text = last.text.replace(/ +$/, ''); l.runs = l.runs.filter((r) => r.text); }
      const res = lines.filter((l) => l.runs.length);
      res.fx = decoFx;
      return res;
    }

    // 1文字ずつ inline-block で包まれた文字（テキストアニメーション用）などは、親の段落の文字として扱う
    function flatInline(el, cs) {
      if (cs.display !== 'inline-block' || ATOMIC.has(el.tagName) || boxPaint(el, cs) || pseudoOn(el, '::before') || pseudoOn(el, '::after')) return false;
      if (hasTransform(cs) && !ownIdentity(cs)) return false;
      if (fx(cs) || clips(cs)) return false;
      for (const c of el.children) { if (c.hasAttribute('data-xl-probe')) continue; const s = getComputedStyle(c); if (!isInline(s) && !flatInline(c, s)) return false; }
      return true;
    }

    function inlineParts(C, out, marks) {
      for (const n of C.childNodes) {
        if (n.nodeType === 3) { if (n.data.trim()) out.push({ node: n, el: n.parentElement }); continue; }
        if (n.nodeType !== 1 || ATOMIC.has(n.tagName) || n.hasAttribute('data-xl-probe')) continue;
        const cs = getComputedStyle(n);
        if (cs.position === 'absolute' || cs.position === 'fixed') continue;
        if (!isInline(cs) && !flatInline(n, cs)) continue;
        if (cs.visibility !== 'visible' && cs.display !== 'contents') continue;
        marks.push(n);
        inlineParts(n, out, marks);
      }
      return out;
    }

    function walk(el, ctx) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || el.hasAttribute('data-xl-probe')) return;
      const myDom = ++dom;
      const unit = isUnit(el, cs);
      const chain = unit ? [...ctx.chain, [bucketOfUnit(cs), zOf(cs), myDom]] : ctx.chain;
      const opacity = ctx.opacity * (+cs.opacity);
      const T = el.hasAttribute('data-xl-tf') ? el : ctx.T;
      const M = T ? matrices.get(T) ?? (probes.has(T) ? null : 'atomic') : null;
      const fxAnc = ctx.fx || (el !== root && fx(cs));
      const visible = cs.visibility === 'visible' && opacity > 0;
      const atomic = ATOMIC.has(el.tagName);
      const id = els.push(el) - 1;
      el.setAttribute('data-xl-id', id);
      const vis = visual.get(el) || vrect(el);
      const lay = vrect(el);
      const clipR = ctx.clip;
      const inside = (r) => !clipR || (r.x >= clipR.x - 0.5 && r.y >= clipR.y - 0.5 && r.x + r.w <= clipR.x + clipR.w + 0.5 && r.y + r.h <= clipR.y + clipR.h + 0.5);
      const base = { el: id, name: label(el), opacity: +opacity.toFixed(3), matrix: M === 'atomic' ? null : M };

      // 自分の背景・枠・画像
      if (visible && (atomic || boxPaint(el, cs)) && vis.w > 0 && vis.h > 0) {
        let vector = null;
        const rects = el.getClientRects();
        const bgClipText = /text/.test(cs.webkitBackgroundClip || cs.backgroundClip || '');
        if (!atomic && !fxAnc && rects.length <= 1 && cs.backgroundImage === 'none' && cs.boxShadow === 'none' && !bgClipText && (cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0) && cs.backgroundClip === 'border-box' && inside(vis) && M !== 'atomic') {
          const bw = ['Top', 'Right', 'Bottom', 'Left'].map((s) => (cs['border' + s + 'Style'] === 'none' ? 0 : parseFloat(cs['border' + s + 'Width']) || 0));
          const bc = ['Top', 'Right', 'Bottom', 'Left'].map((s) => cs['border' + s + 'Color']);
          const bs = ['Top', 'Right', 'Bottom', 'Left'].map((s) => cs['border' + s + 'Style']);
          const uniform = bw.every((w) => w === bw[0]) && bc.every((c) => c === bc[0]) && (bw[0] === 0 || bs.every((s) => s === 'solid'));
          if (uniform) {
            const rad = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((k) => {
              const v = cs['border' + k + 'Radius'].split(' ');
              const px = (s, ref) => (s.endsWith('%') ? (parseFloat(s) / 100) * ref : parseFloat(s) || 0);
              return [px(v[0], lay.w), px(v[1] ?? v[0], lay.h)];
            });
            vector = { type: 'rect', x: lay.x, y: lay.y, w: lay.w, h: lay.h, radii: rad, fill: rgba(cs.backgroundColor), border: bw[0] ? { w: bw[0], color: rgba(bc[0]) } : null };
          }
        }
        items.push({ ...base, kind: 'box', key: el === root ? [[-99, 0, 0]] : [...chain, [unit ? -1 : atomic ? 2 : 1, 0, myDom]], rect: vis, vector, atomic, tag: el.tagName.toLowerCase() });
      }

      // 疑似要素 ::before / ::after（装飾）
      const pseudo = (p, order) => {
        if (!pseudoOn(el, p)) return;
        const ps = getComputedStyle(el, p);
        const pu = ps.position !== 'static' || +ps.opacity < 1 || hasTransform(ps);
        const k = pu ? [...chain, [bucketOfUnit(ps), zOf(ps), order]] : [...chain, [ps.display === 'inline' ? 2 : 1, 0, order]];
        items.push({ ...base, kind: p === '::before' ? 'before' : 'after', name: base.name + p, key: [...k, [-1, 0, order]], rect: R, vector: null });
      };
      pseudo('::before', myDom + 0.1);

      // テキスト（段落ごとに1レイヤー）
      if (!atomic && !isInline(cs) && cs.visibility !== 'hidden' && !el.hasAttribute('data-xl-ti')) {
        const marks = [];
        const parts = inlineParts(el, [], marks);
        if (parts.length) {
          const lines = textRuns(el, parts);
          if (lines.length) {
            const bgClipText = [el, ...marks].some((m) => /text/.test(getComputedStyle(m).webkitBackgroundClip || ''));
            const anyFx = [el, ...marks].some((m) => { const s = getComputedStyle(m); return s.textShadow !== 'none' || parseFloat(s.webkitTextStrokeWidth) > 0 || s.writingMode !== 'horizontal-tb'; });
            const tr = vrect(el);
            const lineBox = { x: Math.min(...lines.map((l) => l.runs[0].x)), y: Math.min(...lines.map((l) => l.top)), r: Math.max(...lines.map((l) => l.right)), b: Math.max(...lines.map((l) => l.bottom)) };
            const vecOk = !bgClipText && !anyFx && !lines.fx && !fxAnc && M !== 'atomic' && lines.every((l) => l.runs.every((r) => r.fill[3] > 0)) && (M ? true : inside({ x: lineBox.x, y: lineBox.y, w: lineBox.r - lineBox.x, h: lineBox.b - lineBox.y }));
            const txt = lines.map((l) => l.runs.map((r) => r.text).join('')).join('\n');
            for (const m of marks) m.setAttribute('data-xl-ti', id);
            items.push({
              ...base, kind: 'text', label: base.name, name: txt.replace(/\s+/g, ' ').slice(0, 24), text: txt,
              key: [...chain, [unit ? 2 : 2, 0, myDom]],
              rect: visual.get(el) || tr, lines, align: cs.textAlign, box: { x: tr.x + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), w: tr.w - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth) },
              vector: vecOk ? 'text' : null, inBox: bgClipText,
            });
          }
        }
      }

      // 子要素
      if (!atomic) {
        let clip = ctx.clip;
        if (el !== root && clips(cs)) {
          const r = visual.get(el);
          clip = clip ? { x: Math.max(clip.x, r.x), y: Math.max(clip.y, r.y), w: Math.min(clip.x + clip.w, r.x + r.w) - Math.max(clip.x, r.x), h: Math.min(clip.y + clip.h, r.y + r.h) - Math.max(clip.y, r.y) } : r;
        }
        const next = { chain, opacity, T, fx: fxAnc, clip };
        for (const c of el.children) walk(c, next);
      }
      pseudo('::after', dom + 0.5);
    }

    walk(root, { chain: [], opacity: 1, T: null, fx: false, clip: null });

    // 4) 後片付け（変形を戻し、計測用の要素を消す）
    st.remove();
    for (const { ps } of probes.values()) ps.forEach((p) => p.remove());

    // 5) 重なり順に並べる
    const cmp = (a, b) => {
      for (let i = 0; i < Math.max(a.key.length, b.key.length); i++) {
        const x = a.key[i], y = b.key[i];
        if (!x) return -1; if (!y) return 1;
        for (let j = 0; j < 3; j++) if (x[j] !== y[j]) return x[j] - y[j];
      }
      return 0;
    };
    items.sort(cmp);
    items.forEach((it, i) => { it.index = i; delete it.key; });
    return { rect: R, isDoc, items, warnings, title: document.title };
  };

  // ---------- ラスター取り込み用の表示切り替え ----------
  const sty = document.createElement('style');
  XL.isolate = (it) => {
    document.querySelectorAll('[data-xl-t]').forEach((e) => e.removeAttribute('data-xl-t'));
    const el = els[it.el];
    el.setAttribute('data-xl-t', '');
    const hideAll = `html,body{background:transparent!important}[data-xl-root],[data-xl-root] *,[data-xl-root]::before,[data-xl-root]::after,[data-xl-root] *::before,[data-xl-root] *::after{visibility:hidden!important}`;
    let css = hideAll;
    if (it.kind === 'box' && it.atomic) css += `[data-xl-t],[data-xl-t] *{visibility:visible!important}`;
    else if (it.kind === 'box' && (el === document.body || el === document.documentElement)) css = `body *,body::before,body::after{visibility:hidden!important}`;
    else if (it.kind === 'box') css += `[data-xl-t]{visibility:visible!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;-webkit-text-stroke-width:0!important;text-decoration-color:transparent!important}`;
    else if (it.kind === 'before' || it.kind === 'after') css += `[data-xl-t]::${it.kind}{visibility:visible!important}`;
    else if (it.kind === 'text') {
      css += `[data-xl-t],[data-xl-ti="${it.el}"]{visibility:visible!important;background:transparent!important;border-color:transparent!important;box-shadow:none!important;outline-color:transparent!important}[data-xl-t]::before,[data-xl-t]::after,[data-xl-ti]::before,[data-xl-ti]::after{visibility:hidden!important}`;
      if (it.inBox) css = hideAll; // グラデーション文字は背景レイヤー側に含まれる
    }
    sty.textContent = css;
    if (!sty.isConnected) document.head.appendChild(sty);
  };
  XL.reset = () => { sty.remove(); document.querySelectorAll('[data-xl-t]').forEach((e) => e.removeAttribute('data-xl-t')); };

  // ---------- アニメーションを最終状態で止める ----------
  XL.freeze = () => {
    for (const a of document.getAnimations()) {
      try {
        const t = a.effect && a.effect.getComputedTiming();
        if (t && Number.isFinite(t.endTime)) a.finish(); else a.pause();
      } catch { a.pause(); }
    }
    window.requestAnimationFrame = () => 0; // canvas 等の描画ループを止める
    document.querySelectorAll('[data-reveal],[data-split],[data-stagger] > *').forEach((e) => e.classList.add('is-in'));
  };
})();
