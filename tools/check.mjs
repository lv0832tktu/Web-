#!/usr/bin/env node
/**
 * check.mjs — 納品前の品質チェック（初心者でもプロの基準を満たすための自動チェッカー）
 *
 *   node tools/check.mjs projects/20261011-sakura-dental
 *   node tools/check.mjs projects/xxx --browser     # 実ブラウザでJSエラー・横スクロール・画像切れも検査
 *
 * チェック項目: title/description/OGP・h1の数・img の alt・配色コントラスト・直書きHEX・
 *               効果音のON/OFFボタン・ダミー文言の残り・ファイルサイズ・(--browser) JSエラー/横はみ出し/リンク切れ画像
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = path.resolve(process.argv[2] || '.');
const useBrowser = process.argv.includes('--browser');
const errors = [], warns = [], oks = [];
const E = (f, m) => errors.push(`${f}: ${m}`), W = (f, m) => warns.push(`${f}: ${m}`);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.name === 'shared' || e.name === 'node_modules' || e.name === 'export' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(dir);
const htmls = files.filter((f) => f.endsWith('.html'));
const rel = (f) => path.relative(dir, f);
if (!htmls.length) { console.error('HTMLが見つかりません: ' + dir); process.exit(1); }

// ---------- コントラスト ----------
const tokens = files.find((f) => path.basename(f) === 'tokens.css');
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
if (tokens) {
  const css = fs.readFileSync(tokens, 'utf8');
  const v = (n) => (css.match(new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{6})`)) || [])[1];
  const pairs = [['c-text', 'c-bg', 4.5, '本文'], ['c-text', 'c-surface', 4.5, '面の上の本文'], ['c-on-primary', 'c-primary', 3, 'メインボタンの文字']];
  for (const [a, b, min, label] of pairs) {
    if (!v(a) || !v(b)) continue;
    const r = ratio(v(a), v(b));
    if (r < min) E('tokens.css', `${label}のコントラスト ${r.toFixed(2)}:1（${min}:1 以上必要）`); else oks.push(`${label}コントラスト ${r.toFixed(1)}:1`);
  }
} else W('-', 'tokens.css がありません（色を変数管理していない）');

// ---------- HTML静的チェック ----------
for (const f of htmls) {
  const s = fs.readFileSync(f, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const isPage = !/data-artboard|__BANNER__|__CREATIVE__/.test(s); // バナー/SNSは除外
  if (!/<html[^>]+lang=/.test(s)) E(rel(f), '<html lang="ja"> がありません');
  if (!/<title>[^<]{2,}<\/title>/.test(s)) E(rel(f), '<title> がありません');
  if (isPage) {
    if (!/<meta name="description" content="[^"]{20,}"/.test(s)) W(rel(f), 'meta description が無い/短い（80〜120字推奨）');
    if (!/og:image/.test(s)) W(rel(f), 'OGP画像（og:image）が未設定');
    const h1 = (s.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) W(rel(f), `h1 が ${h1} 個（1ページ1つ推奨）`);
    if (!/<meta name="viewport"/.test(s)) E(rel(f), 'viewport が未設定（スマホ表示が崩れる）');
  }
  (s.match(/<img\b[^>]*>/g) || []).forEach((img) => { if (!/\balt=/.test(img)) E(rel(f), `alt のない画像: ${img.slice(0, 60)}…`); if (!/\b(width|height)=/.test(img) && !/\$\{/.test(img)) W(rel(f), `width/height のない画像（CLSの原因）: ${img.slice(0, 50)}…`); });
  if (/data-sfx|SFX\.play/.test(s) && !/data-sfx-toggle/.test(s) && isPage) E(rel(f), '効果音を使っているのに ON/OFF ボタン（data-sfx-toggle）がありません');
  const dummies = ['Lumi Fit', 'LumiFit', 'KINARI', 'キナリ', 'Lorem', 'ダミー', '山田 花子', '0000', 'Orbit', 'Habit'].filter((w) => s.includes(w));
  if (dummies.length) W(rel(f), `テンプレートのダミー文言が残っている可能性: ${dummies.join(', ')}`);
  if (/class="ph[ "]/.test(s)) W(rel(f), `写真プレースホルダー(.ph)が ${(s.match(/class="ph[ "]/g) || []).length} 箇所残っています → <img> に差し替え`);
}

// ---------- CSS直書きHEX ----------
for (const f of files.filter((x) => x.endsWith('.css') && !x.endsWith('tokens.css'))) {
  const hex = (fs.readFileSync(f, 'utf8').match(/#[0-9a-fA-F]{6}\b/g) || []).filter((h) => !/^#(fff|000)/i.test(h));
  if (hex.length > 6) W(rel(f), `CSSに直書きの色が ${hex.length} 個（tokens.css の変数に寄せると修正が楽）`);
}

// ---------- 画像サイズ ----------
for (const f of files.filter((x) => /\.(png|jpe?g|webp|avif|gif)$/i.test(x))) {
  const kb = fs.statSync(f).size / 1024;
  if (/\.gif$/i.test(f) && kb > 150 && f.includes('export')) W(rel(f), `GIF ${kb.toFixed(0)}KB（広告入稿は150KB以下が多い）`);
  else if (kb > 400) W(rel(f), `画像が重い ${kb.toFixed(0)}KB → WebP/AVIF化・リサイズを`);
}

// ---------- ブラウザ検査 ----------
if (useBrowser) {
  const { chromium } = await import('playwright');
  const b = await chromium.launch();
  for (const f of htmls) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
      const p = await b.newPage({ viewport: vp });
      const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      p.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) errs.push('読込失敗 ' + r.url().split('/').slice(-2).join('/')); });
      await p.goto(pathToFileURL(f).href + '?export=1');
      await p.waitForTimeout(1200);
      // 実際に横スクロールできてしまうか（ユーザーが体感する崩れ）を測る
      const over = await p.evaluate(() => { scrollTo(9999, scrollY); const x = scrollX; scrollTo(0, scrollY); return x; });
      if (errs.length) E(`${rel(f)} @${vp.width}`, errs.join(' / '));
      if (over > 2 && !/data-artboard/.test(fs.readFileSync(f, 'utf8'))) E(`${rel(f)} @${vp.width}`, `横スクロールが発生（${over}px はみ出し）`);
      await p.close();
    }
  }
  await b.close();
  oks.push('ブラウザ検査（PC/SP）');
}

console.log(`\n品質チェック: ${path.relative(process.cwd(), dir) || '.'}\n`);
errors.forEach((m) => console.log('  ✖ ' + m));
warns.forEach((m) => console.log('  ⚠ ' + m));
oks.forEach((m) => console.log('  ✔ ' + m));
console.log(`\nエラー ${errors.length} ／ 警告 ${warns.length}${errors.length ? '  → エラーを0にしてから納品してください' : '  → 納品可能レベル（警告も可能な限り解消）'}`);
process.exit(errors.length ? 1 : 0);
