# 標準技術の更新（2026-10-13）

標準: React / Vite / Tailwind CSS / GSAP / Three.js / React Three Fiber。

Three.js (^0.186.1) とReact Three Fiber (^9.8.1) を共通Reactテンプレートのdependencies・lockfileへ追加。全React案件でnpm ciだけで導入できる。Scene.jsx・OptionalScene.jsxをproduction/template/srcへ集約し、corporate / landing-page / creative-3dおよび既存React生成CLIから利用できる。既に生成済みの顧客案件は自動変更していない。

AGENTS.md、13担当のfrontend定義、README、生成仕様、CIを更新。3Dを描画する画面ではOptionalSceneを配置し、操作後に動的importで読み込む。WebGL非対応・読込失敗・reduced-motionには静的代替を表示。

## 検証
- node --test tests/*.test.mjs: 4件合格。3種すべての生成案件にThree/R3F依存と3D部品があることを検査。
- 共通Reactテンプレート: ビルド成功。JS gzip 116.22KB。標準依存の追加後も通常ページに3Dコードを含めない。
- PC1440・タブレット768・スマホ375のPlaywright: 15件合格。
- npm ciから作成した3D検証案件: ビルド成功。標準3D部品のPlaywright検査3件合格。操作前はScene要求なし、操作後は要求・描画あり、reduced-motion変更後はcanvasなし。
- 3Dを配置したビルド: 本体gzip117.21KB、3Dチャンクgzip248.16KB。500KB超のチャンク警告あり。モデル・描画負荷の軽量化は案件ごとに確認。
- 初回のブラウザ検査は環境のChromium実行ファイル欠落で失敗。再導入後に上記18件を実行し合格。
- git diff --check成功。検証用に新規生成した一時案件は清掃。

追加の有料API・APIキーは不要。公開・課金・既存案件削除・mainへのマージは実行していない。
