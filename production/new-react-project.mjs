#!/usr/bin/env node
// 既存の new-project.mjs は変更しない。React案件だけ別フローで生成する。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf('--' + name); return i === -1 ? undefined : args[i + 1]; };
const name = option('name');
if (!name || !/^[a-z0-9][a-z0-9-]{1,49}$/i.test(name)) {
  console.error('使用法: node production/new-react-project.mjs --name project-slug [--brief briefs/project.md]');
  process.exit(1);
}
const briefPath = option('brief');
let original = '';
if (briefPath) {
  const file = path.resolve(root, briefPath);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
    console.error('指定されたbriefsファイルがリポジトリ内にありません'); process.exit(1);
  }
  original = fs.readFileSync(file, 'utf8');
}
const stamp = new Date().toLocaleDateString('en-CA').replaceAll('-', '');
const destination = path.join(root, 'projects', stamp + '-' + name + '-react');
if (fs.existsSync(destination)) {
  console.error('既存案件を保護するため中断: ' + destination); process.exit(1);
}
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.cpSync(path.join(here, 'template'), destination, { recursive: true, errorOnExist: true, force: false });
for (const folder of ['public/assets/images','public/assets/illustrations','public/assets/diagrams','public/assets/logos','stitch']) {
  fs.mkdirSync(path.join(destination, folder), { recursive: true });
}
fs.writeFileSync(path.join(destination, 'BRIEF.md'), [
  '# 案件仕様（制作開始前に更新）', '', '## 依頼原文（提供された情報）',
  original || '（未提出。案件内容を記入すること）', '',
  '## 確定情報', '- ゴール：未確定', '- ターゲット：未確定', '- 納品形式：未確定', '',
  '## 仮設定（クライアント確認前）', '- ブランド名：仮', '- デザインコンセプト：仮', '',
  '## 要確認', '- 使用画像のライセンスと納品媒体', '- 実績数字・口コミの事実確認',
  '- お問い合わせ・決済等の外部連携', ''
].join('\n'));
fs.writeFileSync(path.join(destination, 'ASSETS.md'),
  '# アセット台帳\n\n| ファイル | 種類 | 出典/制作者 | 利用権利 | 改変可否 | alt | 確認状況 |\n|---|---|---|---|---|---|---|\n');
fs.writeFileSync(path.join(destination, 'DELIVERY-CHECKLIST.md'),
  '# 納品チェック\n\n- [ ] 仮設定を確認済み\n- [ ] npm run build 成功\n- [ ] npm run test:e2e 成功（3画面幅）\n- [ ] キーボード操作・reduced-motion確認\n- [ ] 主要リンク／外部リンク・コンソールエラーを確認\n- [ ] 全素材の出典と商用権利を確認\n- [ ] AI画像の違和感を目視検査\n- [ ] 画像・フォント・JSの容量を確認\n- [ ] READMEに実行方法・ライセンス・未実装内容を記載\n- [ ] 公開・課金が必要な場合は依頼主の事前承認\n');
fs.writeFileSync(path.join(destination, 'README.md'),
  '# ' + name + '\n\nこの案件は production/template から生成されました。\n\n' +
  '## 実行\n\n```sh\nnpm install\nnpm run dev\nnpm run build\nnpx playwright install chromium\nnpm run test:e2e\n```\n\n' +
  '## 導入方針\nGSAPは標準。Three.jsは必要な案件でのみ追加してください。Stitchからの手動取り込みは stitch/ を利用。\n\n' +
  '## 依存・素材・未完成項目\n- 依存パッケージ：package.json を参照\n- 素材の権利情報：ASSETS.md を参照\n- 未完成：案件固有のデザイン、原稿、実データ、画像差し替え\n');
console.log('作成: ' + path.relative(root, destination));
