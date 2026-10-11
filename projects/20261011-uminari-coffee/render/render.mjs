#!/usr/bin/env node
// 写真風CG（WebGL2レイマーチング）を書き出す: node projects/20261011-uminari-coffee/render/render.mjs [scene...] [--scale 0.5]
// 出力: images/<name>.png（後で WebP に変換）
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, process.env.OUT || '../images');
const FRAG = fs.readFileSync(path.join(dir, 'scene.frag'), 'utf8');
const RUNTIME = fs.readFileSync(path.join(dir, 'runtime.js'), 'utf8');
const SCENES = [
  ['hero', 1920, 1080], ['eaves', 960, 1280], ['seats', 1280, 960], ['ingredients', 1280, 960], ['reserved', 1280, 960],
  ['menu-blend', 800, 800], ['menu-latte', 800, 800], ['menu-soda', 800, 800], ['menu-cheesecake', 800, 800],
  ['hero-sp', 900, 1600],
];
const args = process.argv.slice(2);
const si = args.indexOf('--scale'); const scale = si >= 0 ? +args.splice(si, 2)[1] : 1;
const pick = args.length ? args.map(Number) : SCENES.map((_, i) => i);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const i of pick) {
  const [name, w0, h0] = SCENES[i]; const w = Math.round(w0 * scale), h = Math.round(h0 * scale);
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  // シェーダーは scene.frag、描画ループは runtime.js（HTMLファイルを置かないので品質チェック対象外）
  await p.goto(`data:text/html,<canvas id="c"></canvas>`);
  await p.evaluate(([frag, js, q]) => { window.FRAG = frag; history.replaceState(null, '', location.href); window.QS = q; }, [FRAG, RUNTIME, `?scene=${i}&w=${w}&h=${h}`]);
  await p.addScriptTag({ content: RUNTIME.replace('new URLSearchParams(location.search)', 'new URLSearchParams(window.QS)') });
  await p.waitForFunction(() => window.ready || false, null, { timeout: 60000 }).catch(() => {});
  if (errs.length) { console.error(name, errs.join('\n')); await p.close(); continue; }
  const t0 = Date.now(); const step = 24;
  await p.evaluate(([a, c]) => window.renderStrip(a, c), [0, step]); // 1本目はウォームアップ
  for (let y = 0; y < h; y += step) await p.evaluate(([a, c]) => window.renderStrip(a, c), [y, Math.min(h, y + step)]);
  const data = await p.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  const file = path.join(out, `${name}.png`);
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  console.log(`✔ ${name} ${w}x${h} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await p.close();
}
await b.close();
