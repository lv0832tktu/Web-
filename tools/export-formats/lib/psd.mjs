// レイヤー付きPSD（Photoshop用）を組み立てる
import { writePsdBuffer } from 'ag-psd';

const WEIGHTS = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };

/** CSSのフォント指定から PostScript 名を推定（Google Fonts の命名規則: FamilyName-Weight） */
export function postScriptName(family, weight = 400, style = 'normal') {
  const first = family.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  const w = WEIGHTS[Math.round(weight / 100) * 100] || 'Regular';
  const it = style === 'italic' || style === 'oblique';
  return `${first.replace(/\s+/g, '')}-${w === 'Regular' && it ? 'Italic' : w + (it ? 'Italic' : '')}`;
}
export const firstFamily = (family) => family.split(',')[0].trim().replace(/^['"]|['"]$/g, '');

function textData(it, ox, oy, s) {
  const lines = it.lines;
  const runs = [];
  let text = '';
  lines.forEach((l, li) => {
    l.runs.forEach((r, ri) => {
      let t = r.text;
      if (ri === l.runs.length - 1 && li < lines.length - 1) t += '\n';
      text += t;
      runs.push({
        length: t.length,
        style: {
          font: { name: postScriptName(r.family, r.weight, r.style) },
          fontSize: +(r.size * s).toFixed(2),
          fillColor: { r: r.fill[0], g: r.fill[1], b: r.fill[2] },
          tracking: r.ls ? Math.round((r.ls / r.size) * 1000) : 0,
          autoKerning: true,
          underline: /underline/.test(r.deco || ''),
          strikethrough: /line-through/.test(r.deco || ''),
        },
      });
    });
  });
  const base0 = lines[0].runs[0].base;
  const leading = lines.length > 1 ? (lines[lines.length - 1].runs[0].base - base0) / (lines.length - 1) : lines[0].runs[0].size * 1.2;
  runs.forEach((r) => { r.style.leading = +(leading * s).toFixed(2); r.style.autoLeading = false; });
  const align = /center/.test(it.align) ? 'center' : /right|end/.test(it.align) ? 'right' : 'left';
  const ax = align === 'center' ? it.box.x + it.box.w / 2 : align === 'right' ? it.box.x + it.box.w : Math.min(...lines.map((l) => l.runs[0].x));
  const [a, b, c, d, e, f] = it.matrix || [1, 0, 0, 1, 0, 0];
  const px = a * ax + c * base0 + e - ox, py = b * ax + d * base0 + f - oy;
  return {
    text,
    transform: [a, b, c, d, +(px * s).toFixed(2), +(py * s).toFixed(2)],
    antiAlias: 'smooth',
    style: runs[0].style,
    styleRuns: runs,
    paragraphStyle: { justification: align },
  };
}

/**
 * @param layers [{item, img(PNG), x, y}]  x,y はアートボード左上からのピクセル位置（倍率込み）
 */
export function buildPsd(doc, layers, composite, { scale = 1, editableText = true } = {}) {
  const { x: ox, y: oy } = doc.rect;
  const children = [];
  for (const L of layers) {
    if (!L.img) continue;
    const it = L.item;
    const layer = {
      name: (it.kind === 'text' ? 'T ' : it.kind === 'box' ? (it.atomic ? '画像 ' : '') : '装飾 ') + (it.kind === 'text' ? it.text.replace(/\s+/g, ' ').slice(0, 40) : it.name),
      left: L.x, top: L.y, right: L.x + L.img.width, bottom: L.y + L.img.height,
      imageData: { width: L.img.width, height: L.img.height, data: new Uint8ClampedArray(L.img.data.buffer, L.img.data.byteOffset, L.img.data.length) },
    };
    if (it.kind === 'text' && editableText && it.vector === 'text') layer.text = textData(it, ox, oy, scale);
    children.push(layer);
  }
  const psd = {
    width: composite.width,
    height: composite.height,
    imageData: { width: composite.width, height: composite.height, data: new Uint8ClampedArray(composite.data.buffer, composite.data.byteOffset, composite.data.length) },
    children,
  };
  return writePsdBuffer(psd, { generateThumbnail: false });
}
