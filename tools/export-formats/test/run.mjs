// 書き出しツールの動作確認: サンプルを全形式に書き出し、ファイル・レイヤー・再現度を検査する
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readPsd } from 'ag-psd';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const out = path.join(ROOT, 'sample', 'export-formats', 'test');
fs.rmSync(out, { recursive: true, force: true });
execFileSync(process.execPath, [path.join(ROOT, 'export.mjs'), path.join(ROOT, 'sample', 'banner.html'), '--out', out, '--name', 'banner'], { stdio: 'inherit' });

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? '✔' : '✘'} ${msg}`); if (!ok) failed++; };

for (const ext of ['svg', 'psd', 'ai', 'pdf', 'png']) check(fs.existsSync(path.join(out, `banner.${ext}`)), `banner.${ext} が出力された`);
const m = JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'), 'utf8'));
check(m.size.width === 1200 && m.size.height === 628, `アートボード寸法 ${m.size.width}×${m.size.height}`);
check(m.checks.svgVsPng.mean >= 0.97, `SVGの再現度 ${(m.checks.svgVsPng.mean * 100).toFixed(1)}% ≥ 97%`);
if (m.checks.pdfVsPng) check(m.checks.pdfVsPng.mean >= 0.97, `PDF/AIの再現度 ${(m.checks.pdfVsPng.mean * 100).toFixed(1)}% ≥ 97%`);
check(m.layers.editableText >= 5, `編集できる文字レイヤー ${m.layers.editableText} 件`);
check(m.layers.vectorShapes >= 2, `ベクター図形 ${m.layers.vectorShapes} 件`);

const svg = fs.readFileSync(path.join(out, 'banner.svg'), 'utf8');
check(/<text[^>]*>.*家庭菜園/.test(svg.replace(/\n/g, '')), 'SVGに見出しが文字として入っている');
check(/id="T_NEW_OPEN"[^>]*>.*matrix\(/.test(svg), '回転した文字が回転付きで入っている');

const psd = readPsd(fs.readFileSync(path.join(out, 'banner.psd')), { skipLayerImageData: true, skipCompositeImageData: true });
check(psd.width === 1200 && psd.height === 628, `PSD寸法 ${psd.width}×${psd.height}`);
check(psd.children.length >= 8, `PSDレイヤー ${psd.children.length} 枚`);
check(psd.children.filter((c) => c.text).length >= 5, `PSDの文字レイヤー ${psd.children.filter((c) => c.text).length} 枚`);

const ai = fs.readFileSync(path.join(out, 'banner.ai'));
check(ai.subarray(0, 5).toString() === '%PDF-', 'AIファイルがPDF互換形式');

console.log(failed ? `\n${failed} 件失敗` : '\nすべて合格');
process.exit(failed ? 1 : 0);
