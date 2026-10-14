#!/usr/bin/env node
/**
 * export.mjs — HTMLで制作した作品を、Figma / Illustrator / Photoshop 指定の納品形式に書き出す
 *
 *   node tools/export-formats/export.mjs <作品.html> [オプション]
 *
 *   --size 1080x1350     アートボードの寸法（テンプレートの ?size= に渡す）
 *   --query "slide=2"    追加のURLパラメータ
 *   --selector ".ab"     書き出す要素（既定: [data-artboard]、無ければページ全体）
 *   --width 1440         ページ全体を書き出すときの画面幅（LP・サイト用）
 *   --formats svg,psd,ai,pdf,png   出力する形式（既定: すべて）
 *   --scale 1            倍率（印刷や高解像度が必要なら 2）
 *   --psd-text raster    PSDの文字を画像レイヤーにする（既定: editable＝Photoshopで編集できる文字）
 *   --out <dir>          出力先（既定: <作品のフォルダ>/export-formats/<名前>）
 *   --name <名前>        出力ファイル名（既定: HTMLファイル名＋サイズ）
 *
 * 出力:
 *   <名前>.svg   … Figma にドラッグ＆ドロップ／Illustrator で開く（図形・文字が編集できるレイヤー構造）
 *   <名前>.psd   … Photoshop 用。要素ごとのレイヤー＋編集できる文字レイヤー
 *   <名前>.ai    … Illustrator で開けるPDF互換AI（見た目の再現性重視）
 *   <名前>.pdf   … 同じ内容のPDF
 *   <名前>.png   … 確認用の完成画像
 *   manifest.json … 使用フォント・レイヤー数・再現度チェックの結果
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { decode, encode, trim, similarity } from './lib/raster.mjs';
import { buildSvg } from './lib/svg.mjs';
import { buildPsd, postScriptName, firstFamily } from './lib/psd.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const valueFlags = new Set(['size', 'query', 'selector', 'width', 'formats', 'scale', 'psd-text', 'out', 'name']);
const input = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && valueFlags.has(argv[i - 1].slice(2))));
if (!input) {
  console.error('使い方: node tools/export-formats/export.mjs <作品.html> [--size 1080x1350] [--formats svg,psd,ai,pdf,png]');
  process.exit(1);
}

let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  console.error('Playwright が見つかりません。tools/export-formats で `npm install` を実行してください。');
  process.exit(1);
}

const size = opt('size');
const scale = +opt('scale', 1);
const formats = new Set(opt('formats', 'svg,psd,ai,pdf,png').split(',').map((s) => s.trim()));
const isUrl = /^https?:\/\//.test(input);
const abs = isUrl ? null : path.resolve(input);
const baseName = opt('name', (isUrl ? 'page' : path.basename(abs, path.extname(abs))) + (size ? `-${size}` : ''));
const outDir = path.resolve(opt('out', isUrl ? path.join('export-formats', baseName) : path.join(path.dirname(abs), 'export-formats', baseName)));
fs.mkdirSync(outDir, { recursive: true });

const params = new URLSearchParams(opt('query', ''));
params.set('export', '1');
if (size) params.set('size', size);
const url = (isUrl ? input : pathToFileURL(abs).href) + (/\?/.test(input) ? '&' : '?') + params.toString();
const [sw, sh] = size ? size.split('x').map(Number) : [+opt('width', 1440), 900];

const launch = {};
if (process.env.PW_EXECUTABLE) launch.executablePath = process.env.PW_EXECUTABLE;
const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: sw, height: sh }, deviceScaleFactor: scale });
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(async () => { if (document.fonts) await document.fonts.ready; });
await page.waitForTimeout(800);
// スクロールで表示されるアニメーション・数字のカウントアップなどを最後まで出し切ってから止める
await page.evaluate(async () => {
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y < H; y += innerHeight * 0.6) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  scrollTo(0, 0);
});
await page.waitForTimeout(2500);
await page.addScriptTag({ path: path.join(HERE, 'lib/inpage.js') });
await page.evaluate(() => window.__XL.freeze());
await page.waitForTimeout(300);

// 1) レイヤーに分解
const doc = await page.evaluate((sel) => window.__XL.collect(sel), opt('selector', null));
const R = doc.rect;
const clipOf = (r) => ({ x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.max(1, r.w), height: Math.max(1, r.h) });
const shot = async (clip, omit = true) => decode(await page.screenshot({ clip, omitBackground: omit, fullPage: doc.isDoc }));

const composite = await shot(clipOf(R), false);
console.log(`▶ ${doc.items.length} 個の要素を検出（${Math.round(R.w)}×${Math.round(R.h)}px）`);

// 2) 各レイヤーを単独で描画して取り込む
const layers = [];
for (const it of doc.items) {
  const pad = 80;
  const r = it.kind === 'before' || it.kind === 'after' || it.matrix ? R : it.rect;
  const x0 = Math.max(R.x, r.x - pad), y0 = Math.max(R.y, r.y - pad);
  const x1 = Math.min(R.x + R.w, r.x + r.w + pad), y1 = Math.min(R.y + R.h, r.y + r.h + pad);
  let L = { item: it, vector: !!it.vector, img: null };
  if (x1 > x0 && y1 > y0) {
    await page.evaluate((i) => window.__XL.isolate(i), it);
    const t = trim(await shot({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }));
    if (t) {
      L = { ...L, img: t.img, px: Math.round((x0 - R.x) * scale) + t.dx, py: Math.round((y0 - R.y) * scale) + t.dy };
      L.x = L.px / scale; L.y = L.py / scale; L.w = t.img.width / scale; L.h = t.img.height / scale;
    }
  }
  if (L.img || L.vector) layers.push(L);
}
await page.evaluate(() => window.__XL.reset());

const report = { source: input, url, size: { width: Math.round(R.w), height: Math.round(R.h), scale }, layers: { total: layers.length, vectorShapes: 0, editableText: 0, raster: 0 }, fonts: [], files: [], checks: {}, notes: [] };
for (const L of layers) {
  if (L.vector && L.item.kind === 'text') report.layers.editableText++;
  else if (L.vector) report.layers.vectorShapes++;
  else report.layers.raster++;
}
const fontSet = new Map();
for (const L of layers) for (const l of L.item.lines || []) for (const r of l.runs) {
  const k = `${firstFamily(r.family)}|${r.weight}|${r.style}`;
  if (!fontSet.has(k)) fontSet.set(k, { family: firstFamily(r.family), weight: r.weight, style: r.style, postScript: postScriptName(r.family, r.weight, r.style) });
}
report.fonts = [...fontSet.values()];
const rasterText = layers.filter((L) => L.item.kind === 'text' && !L.vector && L.img).length;
if (rasterText) report.notes.push(`文字 ${rasterText} 件は影・縁取り・グラデーション等の効果があるため、SVGでは画像として配置しています（PSDでは画像レイヤー）。`);

const out = (ext) => path.join(outDir, `${baseName}.${ext}`);
const write = (ext, buf) => { fs.writeFileSync(out(ext), buf); report.files.push(path.basename(out(ext))); console.log('✔', path.relative(process.cwd(), out(ext))); };

// 3) 書き出し
if (formats.has('png')) write('png', encode(composite));

const svg = buildSvg(doc, layers.map((L) => ({ ...L, png: L.img && !L.vector ? encode(L.img).toString('base64') : null })));
if (formats.has('svg')) write('svg', svg);

if (formats.has('psd')) {
  const psdLayers = layers.filter((L) => L.img).map((L) => ({ item: L.item, img: L.img, x: L.px, y: L.py }));
  write('psd', buildPsd(doc, psdLayers, composite, { scale, editableText: opt('psd-text', 'editable') !== 'raster' }));
}

// PDFを画像にして確認する。Acrobat/Illustrator に近い pdfium（pip install pypdfium2）を優先し、無ければ poppler
function renderPdf(src, dst, s) {
  try {
    execFileSync('python3', ['-c', 'import sys,pypdfium2 as p;p.PdfDocument(sys.argv[1])[0].render(scale=float(sys.argv[3])*96/72).to_pil().save(sys.argv[2])', src, dst, String(s)], { stdio: 'ignore' });
    return 'pdfium';
  } catch {
    execFileSync('pdftocairo', ['-png', '-singlefile', '-r', String(96 * s), src, dst.replace(/\.png$/, '')], { stdio: 'ignore' });
    return 'poppler';
  }
}

// SVGを元ページの上に重ねる（フォントは元ページで読み込んだものを使う）
async function overlaySvg() {
  await page.evaluate(({ svg, R }) => {
    const host = document.createElement('div');
    host.id = '__xl_overlay';
    host.style.cssText = `position:absolute;left:${R.x}px;top:${R.y}px;width:${R.w}px;height:${R.h}px;z-index:2147483647;margin:0;padding:0;visibility:visible`;
    host.attachShadow({ mode: 'open' }).innerHTML = svg.replace(/^<\?xml[^>]*>/, '').replace('<svg ', '<svg style="display:block" ');
    document.documentElement.appendChild(host);
    const st = document.createElement('style');
    st.id = '__xl_hide';
    st.textContent = 'html,body{background:transparent!important}[data-xl-root],[data-xl-root] *,[data-xl-root]::before,[data-xl-root]::after,[data-xl-root] *::before,[data-xl-root] *::after{visibility:hidden!important}';
    document.head.appendChild(st);
  }, { svg, R });
  await page.waitForTimeout(200);
}
async function removeOverlay() {
  await page.evaluate(() => { document.getElementById('__xl_overlay')?.remove(); document.getElementById('__xl_hide')?.remove(); });
}

// 再現度チェック: SVG を描画して完成画像と比べる
await overlaySvg();
const svgShot = await shot(clipOf(R));
const simSvg = similarity(composite, svgShot);
report.checks.svgVsPng = { mean: +simSvg.mean.toFixed(4), pixelsMatch: +simSvg.pixels.toFixed(4) };
fs.writeFileSync(path.join(outDir, `${baseName}.svg-preview.png`), encode(svgShot));
await removeOverlay();

if (formats.has('ai') || formats.has('pdf')) {
  await page.emulateMedia({ media: 'screen' });
  let pdf;
  const W = Math.round(R.w), H = Math.round(R.h);
  if (doc.isDoc) {
    // ページ全体: 印刷時は vh などが変わるため、レイヤー化したSVGを印刷する
    await overlaySvg();
    await page.addStyleTag({ content: `@page{size:${W}px ${H}px;margin:0}` });
    pdf = await page.pdf({ width: `${W}px`, height: `${H}px`, printBackground: true, pageRanges: '1', preferCSSPageSize: true });
    await removeOverlay();
  } else {
    // アートボード: 元のHTMLをそのままベクターPDFにする（グラデーション等も再現）
    await page.addStyleTag({ content: `@page{size:${W}px ${H}px;margin:0}html,body{margin:0!important;padding:0!important;min-height:0!important}body>*:not([data-xl-root]):not(:has([data-xl-root])){display:none!important}[data-xl-root]{position:fixed!important;left:0!important;top:0!important;margin:0!important;transform:none!important}` });
    pdf = await page.pdf({ width: `${W}px`, height: `${H}px`, printBackground: true, pageRanges: '1', preferCSSPageSize: true });
  }
  if (formats.has('pdf')) write('pdf', pdf);
  // Illustrator は PDF 互換の .ai をそのまま開ける（Inkscape 等の「AI形式で保存」と同じ方式）
  if (formats.has('ai')) write('ai', pdf);
  try {
    const tmp = path.join(outDir, `${baseName}.pdf-preview`);
    fs.writeFileSync(tmp + '.pdf', pdf);
    report.checks.pdfRenderer = renderPdf(tmp + '.pdf', tmp + '.png', scale);
    fs.rmSync(tmp + '.pdf');
    const sim = similarity(composite, decode(fs.readFileSync(tmp + '.png')));
    report.checks.pdfVsPng = { mean: +sim.mean.toFixed(4), pixelsMatch: +sim.pixels.toFixed(4) };
  } catch { report.notes.push('PDFを画像にする道具（pypdfium2 または pdftocairo）が無いため、PDF/AI の再現度チェックは省略しました。'); }
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(report, null, 2));
console.log(`✔ ${path.relative(process.cwd(), path.join(outDir, 'manifest.json'))}`);
console.log(`  レイヤー ${report.layers.total}（編集できる文字 ${report.layers.editableText} / 図形 ${report.layers.vectorShapes} / 画像 ${report.layers.raster}）`);
console.log(`  再現度 SVG ${(report.checks.svgVsPng.mean * 100).toFixed(1)}%` + (report.checks.pdfVsPng ? ` / PDF ${(report.checks.pdfVsPng.mean * 100).toFixed(1)}%` : ''));
if (report.fonts.length) console.log('  使用フォント: ' + report.fonts.map((f) => f.postScript).join(', '));
