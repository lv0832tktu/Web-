#!/usr/bin/env node
/**
 * works.mjs — 参考作品（実在の受賞作・高評価作品の研究ノート）を検索する
 *
 *   node tools/works.mjs                       # 全作品の一覧
 *   node tools/works.mjs --genre lp            # ジャンルで絞る（website / lp / banner-sns / uiux）
 *   node tools/works.mjs ダーク SaaS           # キーワード
 *   node tools/works.mjs --style luxury        # スタイルID（tools/taxonomy/common.mjs の STYLES）
 *   node tools/works.mjs --id REF-WEB-001      # 詳細
 *
 * 案件に組み込む: node tools/new-project.mjs --genre website --name xxx --work REF-WEB-001
 */
import { WORKS } from './taxonomy/works.mjs';
import { resolveGenre } from './lib/db.mjs';

const argv = process.argv.slice(2);
const opt = {}; const words = [];
for (let i = 0; i < argv.length; i++) { if (argv[i] === '--json') opt.json = true; else if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i]; else words.push(argv[i]); }

if (opt.id) {
  const w = WORKS.find((x) => x.id.toUpperCase() === opt.id.toUpperCase());
  if (!w) { console.error('見つかりません: ' + opt.id); process.exit(1); }
  if (opt.json) { console.log(JSON.stringify(w, null, 2)); process.exit(0); }
  console.log(`\n${w.id}  ${w.title}（${w.by}）${w.verified === 'confirmed' ? '' : '  ※詳細未確認・実物で研究'}`);
  console.log(`URL: ${w.url}\n評価: ${w.recognition}\n`);
  console.log('■ 確認できた事実'); w.facts.forEach((f) => console.log('  - ' + f));
  console.log('■ 学べる設計パターン'); w.takeaways.forEach((f) => console.log('  - ' + f));
  console.log(`■ キットで再現: テンプレート ${w.kit.template} ／ 動き ${w.kit.motion.join(', ') || '—'} ／ 音 ${w.kit.sfx.join(', ') || '—'} ／ 背景 ${w.kit.gfx || '—'}`);
  console.log(`■ 案件への応用: ${w.apply}`);
  console.log('■ 出典'); w.sources.forEach((u) => console.log('  ' + u));
  process.exit(0);
}

const genres = opt.genre ? resolveGenre(opt.genre) : null;
const res = WORKS.filter((w) => (!genres || genres.includes(w.genre)) && (!opt.style || w.styles.includes(opt.style))
  && words.every((k) => JSON.stringify(w).toLowerCase().includes(k.toLowerCase())));
if (opt.json) { console.log(JSON.stringify(res, null, 2)); process.exit(0); }
for (const w of res) console.log(`${w.verified === 'confirmed' ? '✅' : '🔎'} ${w.id.padEnd(12)} ${w.title} — ${w.recognition.split('／')[0].trim()}`);
console.log(`\n${res.length}作品（✅=デザイン詳細確認済み 🔎=受賞のみ確認）。詳細: node tools/works.mjs --id <ID>`);
