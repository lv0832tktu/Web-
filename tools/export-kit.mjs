#!/usr/bin/env node
/**
 * export-kit.mjs — このシステムを「別のプロジェクトに入れられる形」で書き出す
 *
 *   node tools/export-kit.mjs --zip                    # dist/web-design-kit.zip を作成（ダウンロードして解凍するだけ）
 *   node tools/export-kit.mjs ../my-project            # 別プロジェクトに web-design-kit/ フォルダとして追加
 *   node tools/export-kit.mjs ../my-project --name kit # フォルダ名を変える
 *
 * 追加先プロジェクトに AGENTS.md があれば、末尾に「Webデザイン制作はキットに従う」案内を追記します（既存の内容は消しません）。
 * AGENTS.md が無ければ案内だけの AGENTS.md を作ります。Codex はこれを読んでキットを参照します。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './lib/db.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const target = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--name');
const name = opt('name', 'web-design-kit');
const wantZip = argv.includes('--zip');
if (!target && !wantZip) { console.error('使い方: node tools/export-kit.mjs <追加先フォルダ> | --zip'); process.exit(1); }

// キットに含めるもの（案件データ・依存・出力物は含めない）
const INCLUDE = ['AGENTS.md', 'README.md', 'REFERENCE.md', 'package.json', 'package-lock.json', '.gitignore', 'knowledge', 'shared', 'genres', 'tools', 'briefs', 'designs/showcase'];
const EMPTY_DIRS = ['projects', 'assets', 'delivery', 'designs'];
const SKIP = (p) => /(^|\/)(node_modules|export|\.git)(\/|$)/.test(p);

function copyKit(dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of INCLUDE) {
    const src = path.join(ROOT, item);
    if (!fs.existsSync(src)) continue;
    fs.cpSync(src, path.join(dest, item), { recursive: true, filter: (s) => !SKIP(path.relative(ROOT, s)) });
  }
  for (const d of EMPTY_DIRS) {
    fs.mkdirSync(path.join(dest, d), { recursive: true });
    if (!fs.readdirSync(path.join(dest, d)).length) fs.writeFileSync(path.join(dest, d, '.gitkeep'), '');
  }
}

const POINTER = (dir) => `
## Webデザイン制作（${dir}/）

バナー・サムネイル・SNS画像・LP・Webサイト・UI/UXデザインの制作は、必ず \`${dir}/\` のキットを使うこと。

- 最初に \`${dir}/AGENTS.md\`（ワークフローとデザインルール）と \`${dir}/REFERENCE.md\`（早見表）を読む
- コマンドは \`${dir}/\` で実行する（例: \`cd ${dir} && npm install && node tools/search.mjs --genre lp 歯科 予約\`）
- 参考デザインは \`${dir}/genres/*/db\` のデザインレシピ（4ジャンル×10,000件）、テンプレートは \`${dir}/genres/*/templates\`
- 動き・グラフィック・効果音は \`${dir}/shared/\` のライブラリを使う
`;

if (target) {
  const proj = path.resolve(target);
  const dest = path.join(proj, name);
  if (fs.existsSync(dest) && !argv.includes('--force')) { console.error(`既に存在します: ${dest}（上書きは --force）`); process.exit(1); }
  copyKit(dest);
  const agents = path.join(proj, 'AGENTS.md');
  if (fs.existsSync(agents)) {
    const s = fs.readFileSync(agents, 'utf8');
    if (!s.includes(`${name}/AGENTS.md`)) fs.appendFileSync(agents, '\n' + POINTER(name));
  } else fs.writeFileSync(agents, `# AGENTS.md\n${POINTER(name)}`);
  console.log(`✔ ${path.relative(process.cwd(), dest) || dest}/ にキットを追加しました`);
  console.log(`✔ ${path.relative(process.cwd(), agents) || agents} に参照案内を追記しました`);
  console.log(`\n次: cd ${path.relative(process.cwd(), dest)} && npm install`);
}

if (wantZip) {
  const dist = path.join(ROOT, 'dist');
  const tmp = path.join(dist, name);
  fs.rmSync(tmp, { recursive: true, force: true });
  copyKit(tmp);
  fs.writeFileSync(path.join(tmp, 'INSTALL.txt'), `Webデザイン制作キット — 導入方法

1. このフォルダ（${name}/）を、あなたのプロジェクトの中にそのまま置く
2. プロジェクト直下の AGENTS.md（なければ新規作成）に、次の内容を追記する
${POINTER(name)}
3. ターミナルで:  cd ${name} && npm install
   （書き出し機能を使う場合は ffmpeg も入れる）
4. Codex に「${name}/AGENTS.md と REFERENCE.md を読んで、briefs/xxx.md の案件を制作して」と依頼する

単体で使う場合は、このフォルダをそのままプロジェクトとして開けばOK（AGENTS.md が同梱されています）。
`);
  const zip = path.join(dist, `${name}.zip`);
  fs.rmSync(zip, { force: true });
  execFileSync('zip', ['-qr', '-9', `${name}.zip`, name], { cwd: dist });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`✔ ${path.relative(ROOT, zip)}（${(fs.statSync(zip).size / 1048576).toFixed(1)}MB）`);
}
