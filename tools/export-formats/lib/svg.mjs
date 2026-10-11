// レイヤー情報から編集できるSVG（Figma / Illustrator 取り込み用）を組み立てる
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => +(+v).toFixed(2);
const col = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/** 角丸（四隅別・楕円対応）の矩形パス。CSSと同じく半径の合計が辺を超える場合は縮める */
function roundRect(x, y, w, h, radii) {
  let r = radii.map(([rx, ry]) => [Math.max(0, rx), Math.max(0, ry)]);
  const f = Math.min(1,
    w / (r[0][0] + r[1][0] || Infinity), w / (r[3][0] + r[2][0] || Infinity),
    h / (r[0][1] + r[3][1] || Infinity), h / (r[1][1] + r[2][1] || Infinity));
  r = r.map(([a, b]) => [a * f, b * f]);
  const [tl, tr, br, bl] = r;
  if (r.every(([a, b]) => a === 0 && b === 0)) return `M${n(x)} ${n(y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`;
  return [
    `M${n(x + tl[0])} ${n(y)}`, `H${n(x + w - tr[0])}`, tr[0] ? `A${n(tr[0])} ${n(tr[1])} 0 0 1 ${n(x + w)} ${n(y + tr[1])}` : '',
    `V${n(y + h - br[1])}`, br[0] ? `A${n(br[0])} ${n(br[1])} 0 0 1 ${n(x + w - br[0])} ${n(y + h)}` : '',
    `H${n(x + bl[0])}`, bl[0] ? `A${n(bl[0])} ${n(bl[1])} 0 0 1 ${n(x)} ${n(y + h - bl[1])}` : '',
    `V${n(y + tl[1])}`, tl[0] ? `A${n(tl[0])} ${n(tl[1])} 0 0 1 ${n(x + tl[0])} ${n(y)}` : '', 'Z',
  ].join('');
}

/** XMLのidとして使える一意のレイヤー名 */
export function layerNamer() {
  const used = new Map();
  return (s) => {
    let b = String(s).normalize('NFKC').replace(/[^\p{L}\p{N}_.-]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'layer';
    if (!/^[\p{L}_]/u.test(b)) b = '_' + b;
    const c = used.get(b) || 0;
    used.set(b, c + 1);
    return c ? `${b}_${c + 1}` : b;
  };
}

/**
 * @param {object} doc   collect() の結果
 * @param {Array}  layers [{item, png(base64)|null, x, y, w, h}]
 */
export function buildSvg(doc, layers, { fontCss = '' } = {}) {
  const { w, h, x: ox, y: oy } = doc.rect;
  const name = layerNamer();
  const out = [];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${n(w)}" height="${n(h)}" viewBox="0 0 ${n(w)} ${n(h)}">`);
  out.push(`<title>${esc(doc.title || 'design')}</title>`);
  if (fontCss) out.push(`<style>${esc(fontCss)}</style>`);
  for (const L of layers) {
    const it = L.item;
    const prefix = it.kind === 'text' ? 'T' : it.kind === 'box' ? (it.atomic ? 'IMG' : 'BOX') : 'FX';
    const id = name(`${prefix}_${/[\p{L}\p{N}]/u.test(it.name) ? it.name : it.label || it.name}`);
    const op = it.opacity < 1 ? ` opacity="${it.opacity}"` : '';
    const m = it.matrix ? ` transform="matrix(${it.matrix.map(n).join(' ')})"` : '';
    // matrix はページ座標→ページ座標。アートボード原点へ平行移動して使う
    const pre = it.matrix ? `<g transform="translate(${n(-ox)} ${n(-oy)})"><g${m}>` : `<g transform="translate(${n(-ox)} ${n(-oy)})">`;
    const post = it.matrix ? '</g></g>' : '</g>';
    if (L.vector && it.kind === 'box') {
      const v = it.vector;
      const parts = [];
      if (v.fill[3] > 0) parts.push(`<path d="${roundRect(v.x, v.y, v.w, v.h, v.radii)}" fill="${col(v.fill)}"${v.fill[3] < 1 ? ` fill-opacity="${v.fill[3]}"` : ''}/>`);
      if (v.border) {
        const b = v.border.w / 2;
        parts.push(`<path d="${roundRect(v.x + b, v.y + b, v.w - 2 * b, v.h - 2 * b, v.radii.map(([a, c]) => [a - b, c - b]))}" fill="none" stroke="${col(v.border.color)}" stroke-width="${n(v.border.w)}"${v.border.color[3] < 1 ? ` stroke-opacity="${v.border.color[3]}"` : ''}/>`);
      }
      out.push(`<g id="${id}" data-name="${esc(it.name)}"${op}>${pre}${parts.join('')}${post}</g>`);
    } else if (L.vector && it.kind === 'text') {
      const lines = it.lines.map((l) => l.runs.map((r) => {
        const fam = r.family.replace(/"/g, "'");
        return `<tspan x="${n(r.x)}" y="${n(r.base)}" font-family="${esc(fam)}" font-size="${n(r.size)}" font-weight="${r.weight}"${r.style !== 'normal' ? ` font-style="${r.style}"` : ''} fill="${col(r.fill)}"${r.fill[3] < 1 ? ` fill-opacity="${r.fill[3]}"` : ''}${r.ls ? ` letter-spacing="${n(r.ls)}"` : ''}${r.deco ? ` text-decoration="${r.deco}"` : ''}>${esc(r.text)}</tspan>`;
      }).join('')).join('');
      out.push(`<g id="${id}" data-name="${esc(it.name)}"${op}>${pre}<text xml:space="preserve">${lines}</text>${post}</g>`);
    } else if (L.png) {
      out.push(`<g id="${id}" data-name="${esc(it.name)}"><image x="${n(L.x)}" y="${n(L.y)}" width="${n(L.w)}" height="${n(L.h)}" preserveAspectRatio="none" xlink:href="data:image/png;base64,${L.png}"/></g>`);
    }
  }
  out.push('</svg>');
  return out.join('\n');
}
