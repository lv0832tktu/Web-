#!/usr/bin/env node
/**
 * new-project.mjs — 案件フォルダを作成し、DBのレシピから「デザインの方向性」と「テンプレート」を自動セットアップ
 *
 *   node tools/new-project.mjs --genre lp --name sakura-dental 歯科 予約 ナチュラル
 *   node tools/new-project.mjs --ref LP-00381 --name sakura-dental
 *   node tools/new-project.mjs --genre banner-sns --template sns-post --name cafe-insta カフェ Instagram
 *   node tools/new-project.mjs --brief briefs/sakura-dental.md --genre lp --name sakura-dental
 *
 * 生成されるもの（projects/<日付>-<name>/）:
 *   BRIEF.md         … 選ばれたレシピを「制作指示書」に展開（Codexはまずこれを読む）
 *   references.json  … 採用レシピ1件＋代替案4件の全データ
 *   tokens.css       … レシピの配色・書体をCSS変数化
 *   index.html など  … ジャンルのテンプレート（shared/ も同梱して納品可能な形に）
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, GENRES, resolveGenre, search, byId, googleFontsUrl, tokensCss } from './lib/db.mjs';
import { MOTIONS, SFX, INDUSTRIES, STYLES } from './taxonomy/common.mjs';

const argv = process.argv.slice(2);
const opts = {}; const words = [];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a === '--force') opts.force = true; else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]; else words.push(a); }
if (!opts.name) { console.error('使い方: node tools/new-project.mjs --genre <lp|website|banner-sns|uiux> --name <案件名> [キーワード...] [--ref ID] [--template 名前] [--brief briefs/xxx.md]'); process.exit(1); }

// briefs/ の依頼文からキーワードを拾う（業種 → 目的 → イメージワードの優先順）
let briefText = '';
if (opts.brief) {
  briefText = fs.readFileSync(path.resolve(opts.brief), 'utf8');
  if (!words.length) {
    const line = (label) => (briefText.match(new RegExp(label + '[^：:\\n]*[：:](.+)')) || [])[1] || '';
    const industryLine = line('業種');
    const ind = INDUSTRIES.find((i) => i.name.split(/[・（）/]/).filter((t) => t.length >= 2).some((t) => industryLine.includes(t) || t.includes(industryLine.trim())));
    if (ind) words.push(ind.name.split(/[・（]/).find((t) => industryLine.includes(t)) || ind.name.split(/[・（]/)[0]);
    const goalLine = line('ゴール') + line('制作物');
    ['予約', '資料請求', '購入', '登録', 'セミナー', '採用', 'LINE', 'セール', '新商品', 'Instagram', 'YouTube'].forEach((w) => { if (goalLine.includes(w)) words.push(w); });
    const mood = line('イメージワード');
    const st = STYLES.find((x) => x.keywords.some((k) => mood.includes(k)));
    if (st) words.push(st.keywords.find((k) => mood.includes(k)));
    console.log(`  依頼文から抽出したキーワード: ${words.join(' ') || '（なし）'}`);
  }
}

let primary, alts;
if (opts.ref) {
  primary = byId(opts.ref);
  if (!primary) { console.error('レシピが見つかりません: ' + opts.ref); process.exit(1); }
  alts = search({ genres: [primary.genre], words: [primary.industry || primary.app_type, primary.style_id].filter(Boolean), limit: 5, any: true }).filter((r) => r.id !== primary.id).slice(0, 4);
} else {
  const genres = resolveGenre(opts.genre || 'lp');
  // 全キーワード一致 → 0件なら後ろのキーワードから1つずつ外して再検索 → 最後にOR検索
  const w = [...words];
  let res = search({ genres, words: w, format: opts.format, limit: 30 });
  while (!res.length && w.length > 1) { w.pop(); res = search({ genres, words: w, format: opts.format, limit: 30 }); }
  if (!res.length) res = search({ genres, words, format: opts.format, any: true, limit: 30 });
  if (!res.length) { console.error('一致するレシピがありません。キーワードを減らしてください。'); process.exit(1); }
  // 上位から「スタイルが被らない」ように5件選ぶ（提案時に方向性の違う案を出せる）
  const picked = []; const seenStyle = new Set();
  for (const r of res) { if (!seenStyle.has(r.style_id)) { picked.push(r); seenStyle.add(r.style_id); } if (picked.length === 5) break; }
  for (const r of res) { if (picked.length >= 5) break; if (!picked.includes(r)) picked.push(r); }
  [primary, ...alts] = picked;
}

const genre = primary.genre;
const G = GENRES[genre];
let template = opts.template;
if (!template) {
  if (genre === 'banner-sns') template = primary.format?.kind === 'thumbnail' ? 'youtube-thumbnail' : primary.format?.kind === 'sns' ? 'sns-post' : 'display-banner';
  else if (genre === 'uiux') template = /ダッシュボード|Webアプリ|管理/.test(primary.platform) ? 'dashboard' : 'app-prototype';
  else template = G.templates[0];
}
const tplDir = path.join(ROOT, 'genres', G.dir, 'templates', template);
if (!fs.existsSync(tplDir)) { console.error(`テンプレートがありません: ${template}（${G.templates.join(' / ')}）`); process.exit(1); }

const d = new Date();
const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const slug = opts.name.replace(/[^\w\-ぁ-んァ-ヶ一-龠ー]/g, '-');
const out = path.join(ROOT, 'projects', `${stamp}-${slug}`);
if (fs.existsSync(out) && !opts.force) { console.error(`既に存在します: ${path.relative(ROOT, out)}（上書きは --force）`); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

// テンプレート＋shared をコピーし、パスを書き換え
fs.cpSync(tplDir, out, { recursive: true });
fs.cpSync(path.join(ROOT, 'shared'), path.join(out, 'shared'), { recursive: true });
const fontsUrl = googleFontsUrl(primary.fonts);
for (const f of fs.readdirSync(out)) {
  if (!/\.(html|css|js)$/.test(f)) continue;
  const p = path.join(out, f);
  let s = fs.readFileSync(p, 'utf8').replaceAll('../../../../shared/', 'shared/');
  if (f.endsWith('.html')) s = s.replace(/(<link id="gfonts" rel="stylesheet" href=")[^"]*(")/, `$1${fontsUrl.replace(/&/g, '&amp;')}$2`);
  fs.writeFileSync(p, s);
}
fs.writeFileSync(path.join(out, 'tokens.css'), tokensCss(primary));
fs.writeFileSync(path.join(out, 'references.json'), JSON.stringify({ primary, alternatives: alts }, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'BRIEF.md'), brief(primary, alts, template, briefText));
fs.mkdirSync(path.join(out, 'images'), { recursive: true });

console.log(`✔ 作成: ${path.relative(ROOT, out)}/`);
console.log(`  採用レシピ: ${primary.id} ${primary.title}`);
console.log(`  テンプレート: ${template} ／ 書体: ${primary.fonts.head} + ${primary.fonts.body} + ${primary.fonts.en}`);
console.log(`  代替案: ${alts.map((a) => a.id).join(', ')}`);
console.log(`\n次: ${path.relative(ROOT, out)}/BRIEF.md を読み、テンプレートの文言・画像・構成をレシピに合わせて編集してください。`);

// ---------------------------------------------------------------------------
function brief(r, alts, template, briefText) {
  const L = [];
  const p = r.palette;
  L.push(`# 制作指示書 — ${opts.name}`, '');
  L.push(`> このファイルは \`tools/new-project.mjs\` が デザインレシピDB の **${r.id}** から自動生成しました。`);
  L.push(`> Codex / 制作者はこの指示書 → \`AGENTS.md\` → \`genres/${G.dir}/AGENTS.md\` の順に読んでから着手してください。`, '');
  if (briefText) L.push('## 0. クライアントの依頼内容（原文）', '', '```', briefText.trim(), '```', '');
  L.push('## 1. デザインの方向性', '');
  L.push(`- **レシピ**: ${r.id}「${r.title}」（難易度: ${r.level}）`);
  L.push(`- **コンセプト**: ${r.concept}`);
  if (r.target) L.push(`- **ターゲット**: ${r.target}`);
  L.push(`- **スタイル**: ${r.style}`);
  if (r.format) L.push(`- **サイズ**: ${r.format.name}（${r.format.width}×${r.format.height}px）`);
  if (r.purpose) L.push(`- **目的**: ${r.purpose}`);
  if (r.goal) L.push(`- **ゴール / KPI**: ${r.goal}（${r.kpi}）`);
  if (r.site_type) L.push(`- **サイト種別**: ${r.site_type}`);
  if (r.app_type) L.push(`- **アプリ種別**: ${r.app_type}／${r.platform}（${r.frame}）— ${r.platform_guide}`);
  L.push(`- **テンプレート**: \`genres/${G.dir}/templates/${template}\` をコピー済み`, '');

  L.push('## 2. 配色（tokens.css に反映済み）', '', '| 役割 | 色 | 使う割合 |', '|---|---|---|');
  L.push(`| 背景 --c-bg | \`${p.bg}\` | 70% |`, `| 面 --c-surface | \`${p.surface}\` | （背景の一部） |`, `| 文字 --c-text | \`${p.text}\` | — |`, `| メイン --c-primary | \`${p.primary}\` | 25% |`, `| アクセント --c-accent | \`${p.accent}\` | 5%（CTA・重要数字のみ） |`);
  L.push('', `本文コントラスト比: **${p.contrast}:1**（4.5以上でOK）／ primary上の文字色: \`${p.on_primary}\``, '');

  L.push('## 3. タイポグラフィ', '', `- 見出し: **${r.fonts.head}**`, `- 本文: **${r.fonts.body}**`, `- 英字・数字: **${r.fonts.en}**`, `- Google Fonts: ${googleFontsUrl(r.fonts)}`, '- ジャンプ率（見出し/本文）は 2.5倍以上。本文は16px・行間1.8前後。', '');

  L.push('## 4. 構成・レイアウト', '');
  if (r.layout) L.push(`- レイアウト: **${r.layout}**`);
  if (r.copy?.char_limit) L.push(`- 文字量: ${r.copy.char_limit}`);
  if (r.framework) L.push(`- 構成の型: **${r.framework}**`);
  if (r.first_view) L.push(`- ファーストビュー: **${r.first_view.pattern}**（動き: ${r.first_view.motion}）`, `- キャッチの型: ${r.first_view.copy_formula}`);
  if (r.sections) { L.push('- セクション順:'); r.sections.forEach((s, i) => L.push(`  ${i + 1}. ${s.split(':')[1]}（\`${s.split(':')[0]}\`）`)); }
  if (r.sitemap) L.push(`- サイトマップ: ${r.sitemap.join(' / ')}`);
  if (r.header) L.push(`- ヘッダー: ${r.header}`);
  if (r.hero) L.push(`- ヒーロー: ${r.hero}`);
  if (r.grid) L.push(`- グリッド: ${r.grid}`);
  if (r.page_transition) L.push(`- ページ遷移: ${r.page_transition}`);
  if (r.signature_details) L.push(`- 印象に残す仕掛け: ${r.signature_details.join('／')}`);
  if (r.screens) L.push(`- 画面一覧: ${r.screens.join(' / ')}`);
  if (r.ux_patterns) { L.push('- UXパターン:'); r.ux_patterns.forEach((u) => L.push(`  - ${u}`)); }
  if (r.ux_laws) L.push(`- 根拠にするUX法則: ${r.ux_laws.join('／')}`);
  if (r.persona) L.push(`- ペルソナ: ${r.persona.name}（${r.persona.age}歳）— 目的「${r.persona.goal}」／不満「${r.persona.pain}」`);
  if (r.design_tokens) L.push(`- UIトークン: 角丸 ${r.design_tokens.radius}／余白 ${r.design_tokens.spacing}／影 ${r.design_tokens.elevation}／ダークモード ${r.design_tokens.dark_mode ? 'あり' : 'なし'}`);
  if (r.interactions) L.push(`- インタラクション: ${r.interactions.join('／')}`);
  L.push('');

  L.push('## 5. コピー', '');
  for (const [k, v] of Object.entries(r.copy || {})) L.push(`- ${k}: ${v}`);
  L.push('', '※ ブランド名・数値はダミー。クライアントの実データに必ず差し替える。', '');

  L.push('## 6. グラフィック・モーション・効果音', '');
  if (r.graphics) L.push(`- グラフィック要素: ${r.graphics.join('／')}`);
  if (r.gfx_background) L.push(`- 動く背景: \`<canvas data-gfx="${r.gfx_background}">\`（shared/js/graphics.js）`);
  if (r.animation) { L.push(`- アニメーション構成: **${r.animation.name}**（${r.animation.loop}／書き出し ${r.animation.export}）`); r.animation.steps.forEach((s) => L.push(`  - ${s}`)); }
  if (r.motion?.length) { L.push('', '| モーション | 実装 | 効果 |', '|---|---|---|'); r.motion.forEach((m) => L.push(`| ${m} | \`${MOTIONS[m]?.impl || ''}\` | ${MOTIONS[m]?.desc || ''} |`)); }
  if (r.sfx?.length) { L.push('', '| 効果音 | 使いどころ | 実装 |', '|---|---|---|'); r.sfx.forEach((s) => L.push(`| ${s} | ${SFX[s] || ''} | \`data-sfx="${s}"\` / \`SFX.play('${s}')\` |`)); L.push('', '効果音を使う場合は必ず `<button data-sfx-toggle>` で ON/OFF を付けること。'); }
  L.push('');

  L.push('## 7. オリジナリティを出す一手', '', `- ${r.originality}`, '- 参考レシピをそのまま使わず、クライアント固有の「言葉・色・形・数字」を最低3つ入れる。', '');
  L.push('## 8. 納品前チェック', '');
  [...(r.quality_check || []), ...(r.accessibility || [])].forEach((q) => L.push(`- [ ] ${q}`));
  L.push('- [ ] `node tools/check.mjs ' + path.relative(ROOT, out) + '` がエラー0', '- [ ] PC/スマホのスクショを `node tools/render.mjs ... --fullpage`（バナーは `--sizes ... --png --gif`）で確認', '');

  L.push('## 9. 代替案（クライアントに2〜3案出すとき用）', '');
  alts.forEach((a) => L.push(`- **${a.id}** ${a.title} — ${a.palette.name}（${a.palette.primary} / ${a.palette.accent}）、${a.fonts.head}`));
  L.push('', '別案で作り直す: `node tools/new-project.mjs --ref <ID> --name ' + opts.name + '-b`', '');
  return L.join('\n');
}
