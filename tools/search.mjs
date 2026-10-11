#!/usr/bin/env node
/**
 * search.mjs — デザインレシピDB（40,000件）を検索する
 *
 *   node tools/search.mjs --genre lp 歯科 予約
 *   node tools/search.mjs --genre banner-sns セール Instagram --style ポップ --limit 5
 *   node tools/search.mjs --genre uiux 家計簿 ダーク --level プロ
 *   node tools/search.mjs --id LP-00042          # 1件の全情報
 *   node tools/search.mjs --genre website カフェ --json > refs.json
 *
 *  --genre  banner-sns | lp | website | uiux | all（既定 all）
 *  --style  スタイル名の一部（ミニマル/ラグジュアリー/ナチュラル/ポップ/テック/和モダン/レトロ/エディトリアル/かわいい/信頼/スポーティ/シネマ/グラス/ブルータリズム/パステル/ネオン/手書き/北欧/ジオメトリック/3D）
 *  --level  中級 | 上級 | プロ
 *  --format バナーのサイズ（例: 300x250, ig-story, yt-thumb）
 *  --any    いずれかのキーワードに一致（既定は全て一致）
 */
import { resolveGenre, search, byId } from './lib/db.mjs';

const argv = process.argv.slice(2);
const opts = {}; const words = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json' || a === '--any') opts[a.slice(2)] = true;
  else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i];
  else words.push(a);
}

if (opts.id) {
  const r = byId(opts.id);
  if (!r) { console.error('見つかりません: ' + opts.id); process.exit(1); }
  console.log(JSON.stringify(r, null, 2));
  process.exit(0);
}

const res = search({ genres: resolveGenre(opts.genre), words, style: opts.style, level: opts.level, format: opts.format, any: !!opts.any, limit: +(opts.limit || 10) });
if (opts.json) { console.log(JSON.stringify(res, null, 2)); process.exit(0); }
if (!res.length) { console.log('該当なし。キーワードを減らすか --any を付けてください。'); process.exit(0); }

const sw = (hex) => { const n = parseInt(hex.slice(1), 16); return `\x1b[48;2;${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}m  \x1b[0m`; };
const color = process.stdout.isTTY;
for (const r of res) {
  const p = r.palette;
  const chips = color ? [p.bg, p.surface, p.text, p.primary, p.accent].map(sw).join('') : [p.bg, p.primary, p.accent].join(' ');
  console.log(`\n${r.id}  ${r.title}  [${r.level}]`);
  console.log(`  ${chips}  ${p.name} ／ 書体: ${r.fonts.head} + ${r.fonts.en}`);
  console.log(`  ${r.concept}`);
  if (r.motion?.length) console.log(`  動き: ${r.motion.join(', ')}${r.sfx?.length ? `  ｜ 音: ${r.sfx.join(', ')}` : ''}`);
}
console.log(`\n${res.length}件。詳細: node tools/search.mjs --id <ID> ／ 制作開始: node tools/new-project.mjs --ref <ID> --name <案件名>`);
