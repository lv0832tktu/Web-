# AI Web Production v2（既存制作キットの非破壊拡張）

既存の `AGENTS.md`、`tools/new-project.mjs`、40,000件の設計レシピ、HTML テンプレート、検査ツールはそのまま利用します。この拡張は新規 React 案件専用です。

## 既存基盤との関係
- バナー／SNS／静的HTML案件：従来通り `node tools/new-project.mjs` を利用。
- ReactのLP・Webサイト：`node production/new-react-project.mjs --name sample --brief briefs/sample.md` で独立した案件を生成。
- 既存 `shared/js/motion.js` とGSAPを同一要素へ同時適用しないこと（二重アニメーション防止）。
- 既存プロジェクト・ルートの `package.json` と `package-lock.json` は変更しない。案件フォルダ単位で依存関係をインストール。

## 操作
```sh
node production/new-react-project.mjs --name yohaku --brief briefs/yohaku.md
cd projects/<生成された日付>-yohaku-react
npm install
npm run dev
npm run build
npx playwright install chromium
npm run test:e2e
```

## 制作順序
1. `AGENTS.md` と元案件文を読み、`BRIEF.md` に確定事項・仮設定・要確認事項を分離。
2. 参考作品は分析のみ。ブランドの固有要素3点、独自コピー、情報設計を決める。架空実績は掲載しない。
3. Stitchの出力は `stitch/` に手動取り込み。HTML / CSS / 画像 / デザイントークンからReactコンポーネントへ再構成し、ライセンスを確認。未検証のAPI連携に依存しない。
4. `public/assets/` の写真・図・ロゴは `ASSETS.md` に出典・作成者・利用権利・加工可否・altを記録。
5. GSAPは必要なセクションだけで使用。`prefers-reduced-motion` に従う。Three.jsとReact Three Fiberを標準依存として全React案件に導入。3D描画は必要な画面で分割ロード。
6. PC/タブレット/SPでPlaywright検査、目視レビュー、画像権利確認、納品チェックを行う。

## 13担当の役割マッピング（存在する定義を優先）
orchestrator / requirements / design-research / creative-director / ui-ux / copy-seo / visual-assets / motion-designer / frontend / responsive / quality-assurance / design-review / delivery。
役割の詳細は `production/AGENT-ROLES.md`。将来既存のエージェント定義が見つかったら、それを置換せず参照する。

## 課金と公開
React・Vite・Tailwind・GSAP・Three.js・React Three Fiber・Playwright の標準的なローカル使用は追加の有料APIを必須としません。外部画像サービス、クラウドホスティング、Stitch等のサービス提供条件・利用枠は個別に確認。デプロイ・課金・削除は承認後に実行。

## 未自動化
画像の著作権判断、デザイン独自性、画面の美的品質、Stitch公式APIの接続可否は自動判定できません。各案件で手動レビューが必要です。

## 指定構成の追加フロー

新規推奨: `node scripts/new-project.mjs --name yohaku --template landing-page --brief briefs/yohaku.md`。既存CLIは従来どおり利用可能。新CLIはprojects/client-projectsへ生成し、旧案件を移動しない。

- 原文request.md、抽出requirements.json、BRIEF.md、DESIGN-SPEC.md、assets.json、REVIEW.md、納品チェック、READMEを作成。
- 明示ラベル: ブランド名・目的・ターゲット・納品形式・独自性・制約。自由文はAI担当が読み取り、抽出漏れを補う。自動生成だけで完成した要件・デザインとはしない。
- `node scripts/import-stitch.mjs <案件> <資料フォルダ>`で取込、元バイト・容量・SHA256を保存。Stitch未接続でも利用可能。
- 素材台帳の各項目: path（public/assetsからのパス）、type、source、creator、rights、modification、alt、width、height、review（approved/pending）。`node scripts/check-assets.mjs <案件>`で検査。承認済みでも権利判断の証拠を保存。
- GSAP部品はsrc/components/Motion.jsx。ScrollReveal / AnimatedText / PageTransitionを再利用。routeKey変更を接続し、ルート変更時のフォーカスは呼出側で管理。
- corporate / landing-page / creative-3dの全案件にThree.js・React Three Fiberの依存とScene.jsx・OptionalScene.jsxを標準搭載。操作前は3Dシーンをロードしない。
- Node.js 22.12以上。lockfileをコミットし、案件はnpm ciで導入。

GitHub Actionsは基盤と生成した3種の案件をビルド・検査。実案件を追加したら、同じコマンドを案件の納品前にも実行する。美観・権利・外部リンクの状態は人による確認を含む。
