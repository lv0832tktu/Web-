#!/usr/bin/env node
/**
 * render.mjs — HTMLの制作物を PNG / GIF / MP4（効果音付き）に書き出す
 *
 *   node tools/render.mjs <html> [--sizes 300x250,728x90] [--png] [--gif] [--mp4] [--out delivery/xxx]
 *   node tools/render.mjs projects/foo/index.html --fullpage           # LP/サイトの全体スクショ（PC+SP）
 *
 *  --png       最終フレームの静止画（既定）
 *  --gif       アニメーションGIF（バナー入稿用。150KB超なら自動で色数を減らす）
 *  --mp4       H.264動画。HTML内の sfxTimeline（効果音）をWAVに書き出して合成
 *  --duration  録画秒数（既定: コンテンツの loopSeconds または 6）
 *  --fullpage  PC(1440)とSP(390)のフルページスクリーンショット
 *
 * 必要: Playwright（npm i で入る）と ffmpeg（GIF/MP4のみ）
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--') && /\.html?$/.test(a));
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const flag = (k) => argv.includes('--' + k);
if (!file) { console.error('使い方: node tools/render.mjs <html> [--sizes 300x250] [--png] [--gif] [--mp4] [--fullpage]'); process.exit(1); }

let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.error('Playwright が見つかりません。`npm install` を実行してください。'); process.exit(1); }

const abs = path.resolve(file);
const outDir = path.resolve(opt('out', path.join(path.dirname(abs), 'export')));
fs.mkdirSync(outDir, { recursive: true });
const base = path.basename(abs, path.extname(abs));
const wantGif = flag('gif'), wantMp4 = flag('mp4'), wantPng = flag('png') || (!wantGif && !wantMp4);
const launch = { args: ['--autoplay-policy=no-user-gesture-required'] };
if (fs.existsSync('/opt/pw-browsers/chromium') && process.env.PW_EXECUTABLE) launch.executablePath = process.env.PW_EXECUTABLE;
const browser = await chromium.launch(launch);
const hasFfmpeg = (() => { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();

async function settle(page) {
  await page.evaluate(async () => { if (document.fonts) await document.fonts.ready; });
  await page.waitForTimeout(300);
}

if (flag('fullpage')) {
  for (const [name, vp] of [['pc', { width: 1440, height: 900 }], ['sp', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: name === 'sp' ? 2 : 1, reducedMotion: 'reduce' });
    await page.goto(pathToFileURL(abs).href);
    await settle(page);
    // reveal系を全て表示状態に
    await page.evaluate(() => document.querySelectorAll('[data-reveal],[data-split],[data-stagger] > *').forEach((e) => e.classList.add('is-in')));
    await page.waitForTimeout(500);
    const out = path.join(outDir, `${base}-${name}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log('✔', path.relative(process.cwd(), out));
    await page.close();
  }
  await browser.close();
  process.exit(0);
}

const sizes = (opt('sizes', '') || '').split(',').filter(Boolean);
if (!sizes.length) sizes.push(null);

for (const size of sizes) {
  const url = pathToFileURL(abs).href + '?export=1' + (size ? `&size=${size}` : '') + (wantGif && !wantMp4 ? '&nogfx=1' : '');
  const [w, h] = size ? size.split('x').map(Number) : [1920, 1920];
  const tag = size ? `${base}-${size}` : base;

  // 制作物の実寸を取得
  const probe = await browser.newPage({ viewport: { width: Math.max(w + 40, 400), height: Math.max(h + 40, 400) } });
  await probe.goto(url);
  await settle(probe);
  const info = await probe.evaluate(() => {
    const B = window.__BANNER__ || window.__CREATIVE__ || {};
    const el = B.el || document.querySelector('[data-artboard]') || document.body.firstElementChild;
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), duration: B.duration || 6, sfx: B.sfx || [] };
  });
  const duration = +opt('duration', info.duration);

  if (wantPng) {
    await probe.waitForTimeout(Math.min(duration, 4) * 1000);
    const out = path.join(outDir, `${tag}.png`);
    await probe.screenshot({ path: out, clip: { x: info.x, y: info.y, width: info.w, height: info.h } });
    console.log('✔', path.relative(process.cwd(), out), `${info.w}x${info.h}`);
  }

  if ((wantGif || wantMp4) && !hasFfmpeg) { console.warn('⚠ ffmpeg が無いため GIF/MP4 はスキップしました'); }
  if ((wantGif || wantMp4) && hasFfmpeg) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-'));
    // 余白なしで録画するため、要素サイズのビューポートで開き直す
    const ctx = await browser.newContext({ viewport: { width: info.w, height: info.h }, recordVideo: { dir: tmp, size: { width: info.w, height: info.h } } });
    const tRec = Date.now();
    const page = await ctx.newPage();
    await page.goto(url);
    await settle(page);
    await page.addStyleTag({ content: `body{display:block!important;min-height:0!important;margin:0!important;background:transparent!important}` });
    await page.evaluate(() => { const B = window.__BANNER__ || window.__CREATIVE__; const el = B && B.el; if (el) { el.style.position = 'fixed'; el.style.left = '0'; el.style.top = '0'; } if (B && B.restart) B.restart(); });
    const t0 = Date.now();
    await page.waitForTimeout(duration * 1000 + 400);
    let wav = null;
    if (wantMp4 && info.sfx.length) {
      wav = await page.evaluate(({ sfx, d }) => window.SFX ? window.SFX.renderTimeline(sfx, d) : null, { sfx: info.sfx, d: duration });
    }
    const video = page.video();
    await ctx.close();
    const webm = await video.path();
    // 録画開始〜アニメーション再スタートまでの読込時間を切り落とす
    const ss = ((t0 - tRec) / 1000 + 0.05).toFixed(2);

    if (wantGif) {
      const out = path.join(outDir, `${tag}.gif`);
      const tries = [{ c: 128, fps: 15, d: 'bayer:bayer_scale=5' }, { c: 64, fps: 12, d: 'none' }, { c: 48, fps: 10, d: 'none' }, { c: 32, fps: 8, d: 'none' }];
      for (const [k, t] of tries.entries()) {
        execFileSync('ffmpeg', ['-y', '-ss', ss, '-t', String(duration), '-i', webm, '-vf', `fps=${t.fps},scale=${info.w}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${t.c}:stats_mode=diff[p];[b][p]paletteuse=dither=${t.d}:diff_mode=rectangle`, out], { stdio: 'ignore' });
        const kb = fs.statSync(out).size / 1024;
        if (kb <= 150 || k === tries.length - 1) { console.log('✔', path.relative(process.cwd(), out), `${kb.toFixed(0)}KB${kb > 150 ? '（150KB超：秒数かサイズを減らしてください）' : ''}`); break; }
      }
    }
    if (wantMp4) {
      const out = path.join(outDir, `${tag}.mp4`);
      const ffargs = ['-y', '-ss', ss, '-t', String(duration), '-i', webm];
      if (wav) { const wf = path.join(tmp, 'sfx.wav'); fs.writeFileSync(wf, Buffer.from(wav, 'base64')); ffargs.push('-i', wf, '-c:a', 'aac', '-b:a', '160k', '-shortest'); }
      ffargs.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-movflags', '+faststart', out);
      execFileSync('ffmpeg', ffargs, { stdio: 'ignore' });
      console.log('✔', path.relative(process.cwd(), out), wav ? '（効果音付き）' : '');
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  await probe.close();
}
await browser.close();
