import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, inside, write, requirements } from './lib/production.mjs';
export function createProject({ name, brief, template = 'landing-page' }) {
  if (!/^[a-z0-9][a-z0-9-]{1,49}$/.test(name || '')) throw new Error('案件名は英小文字・数字・ハイフンの2〜50文字');
  if (!['corporate', 'landing-page', 'creative-3d'].includes(template)) throw new Error('未対応テンプレート');
  const original = brief ? fs.readFileSync(inside(ROOT, brief), 'utf8') : '（案件文未提出）';
  const data = requirements(original);
  const destination = path.join(ROOT, 'projects/client-projects', name);
  if (fs.existsSync(destination)) throw new Error('既存案件を保護するため中断');
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(path.join(ROOT, 'production/template'), destination, {
    recursive: true, filter: source => !/(?:^|[/\\])(?:node_modules|dist|test-results|playwright-report)(?:[/\\]|$)/.test(source)
  });
  write(path.join(destination, 'request.md'), original);
  write(path.join(destination, 'requirements.json'), data);
  const facts = Object.entries(data).filter(([,v]) => typeof v === 'object');
  write(path.join(destination, 'BRIEF.md'), '# 案件仕様\n\n' + facts.map(([k,v]) => `- ${k}: ${v.value}（${v.status === 'provided' ? '提供情報・要照合' : '仮設定'}）`).join('\n') + '\n\n原文: request.md。自由文の未抽出事項を追記すること。\n');
  write(path.join(destination, 'DESIGN-SPEC.md'), `# 制作仕様書\n\nテンプレート: ${template}\n\n## コンセプト・コピー・UI作成手順\n1. requirements.jsonを原文と照合し、確定・仮設定・要確認を区別。\n2. design-research担当が既存DBから異なる方向性を3案抽出。\n3. creative-director担当が「${data.strengths.value}」を色・形・写真・文字組みに翻訳し、採用理由を記録。\n4. copy-seo担当が「${data.target.value}」に「${data.goal.value}」を伝える見出し・CTA・本文を作成。数値や口コミは事実確認。\n5. ui-ux担当がページ構成、各節の目的、CTA、キーボード導線、375/768/1440pxの仕様を記入。\n\n## 要記入\n- 固有要素3点:\n- 採用コンセプトと不採用理由:\n- コピーと根拠:\n- UI構成・画像仕様:\n- 演出の目的・reduced-motion代替:\n- 容量予算: 画像400KB/枚、JS gzip 200KB目安（例外は理由記載）\n\nこれは作業手順であり、完成したブランドデザインではありません。\n`);
  write(path.join(destination, 'assets.json'), { assets: [] });
  write(path.join(destination, 'REVIEW.md'), '# レビュー記録\n\nproduction/REVIEW-RUBRIC.mdを参照。各指摘に画面・根拠・修正・再確認を記録。\n');
  write(path.join(destination, 'DELIVERY-CHECKLIST.md'), '# 納品チェック\n\n' + ['仮設定を依頼主と確認','ブランド固有の要素とコピーを検証','素材の出典・権利・alt・寸法を記録','Stitch資料と実装を目視比較','npm run build','npm run test:e2e（PC・タブレット・スマホ）','キーボード・reduced-motion・リンク・画像・コンソール検査','画像・フォント・JSの容量確認','REVIEW.mdの指摘解消','READMEに利用方法・未実装・追加費用を記載','公開・課金・削除は事前承認'].map(s => '- [ ] ' + s).join('\n') + '\n');
  write(path.join(destination, 'README.md'), `# ${name}\n\n案件固有デザイン・コピー・画像は制作待ち。仮設定はBRIEF.mdを参照。\n\n\`npm ci\` → \`npm run dev\` → \`npm run build\` → \`npx playwright install chromium\` → \`npm run test:e2e\`\n\nStitch資料はルートから \`node scripts/import-stitch.mjs projects/client-projects/${name} <資料フォルダ>\`。素材はassets.jsonで管理し、\`node scripts/check-assets.mjs projects/client-projects/${name}\`で検査。\n\n追加費用: 標準APIなし。外部フォーム・ホスティング・有料素材は別途承認。\n`);
  if (template === 'creative-3d') {
    fs.cpSync(path.join(ROOT, 'templates/creative-3d/Scene.jsx'), path.join(destination, 'src/Scene.jsx'));
    fs.cpSync(path.join(ROOT, 'templates/creative-3d/OptionalScene.jsx'), path.join(destination, 'src/OptionalScene.jsx'));
    write(path.join(destination, 'THREE-SETUP.md'), '3Dが案件に必要と判断した後、npm install three @react-three/fiber を実行し、OptionalSceneを必要な画面のみで利用。初期状態では依存もロードもありません。\n');
  }
  return destination;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const get = key => { const index = args.indexOf('--' + key); return index < 0 ? undefined : args[index + 1]; };
  try { console.log(createProject({ name: get('name'), brief: get('brief'), template: get('template') })); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
