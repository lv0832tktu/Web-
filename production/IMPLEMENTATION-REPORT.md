# 構築結果・検証記録

追記: Three.js・React Three Fiberの標準化については[STANDARD-STACK-REPORT.md](STANDARD-STACK-REPORT.md)を参照。以下の検証は初回構築時の記録。

確認日: 2026-10-13。基点: feature/ai-web-production-v2-20261013（39d735f）。mainへのマージ・サイト公開・課金は未実行。

## 追加・変更

- `.github/workflows/production-ci.yml`
- `.gitignore`
- `AGENTS.md`
- `README.md`
- `agents/copy-seo.md`
- `agents/creative-director.md`
- `agents/delivery.md`
- `agents/design-research.md`
- `agents/design-review.md`
- `agents/frontend.md`
- `agents/motion-designer.md`
- `agents/orchestrator.md`
- `agents/quality-assurance.md`
- `agents/requirements.md`
- `agents/responsive.md`
- `agents/ui-ux.md`
- `agents/visual-assets.md`
- `design-system/animation-rules.md`
- `design-system/colors.md`
- `design-system/layout.md`
- `design-system/typography.md`
- `package.json`
- `production/README.md`
- `production/REVIEW-RUBRIC.md`
- `production/STITCH-IMPORT.md`
- `production/STRUCTURE-PLAN.md`
- `production/template/package-lock.json`
- `production/template/package.json`
- `production/template/playwright.config.js`
- `production/template/src/components/Motion.jsx`
- `production/template/src/main.jsx`
- `production/template/src/style.css`
- `production/template/src/tokens.css`
- `production/template/tests/site.spec.js`
- `projects/client-projects/README.md`
- `references/motion-catalog.json`
- `references/website-catalog.json`
- `scripts/check-assets.mjs`
- `scripts/import-stitch.mjs`
- `scripts/lib/production.mjs`
- `scripts/new-project.mjs`
- `scripts/prepare-three-smoke.mjs`
- `templates/corporate/README.md`
- `templates/creative-3d/OptionalScene.jsx`
- `templates/creative-3d/README.md`
- `templates/creative-3d/Scene.jsx`
- `templates/creative-3d/three.spec.js`
- `templates/landing-page/README.md`
- `tests/production.test.mjs`

## 実行済み検証

- node --test tests/*.test.mjs: 4/4合格。明示情報と仮設定、案件生成と上書き防止、Stitchのバイト保存、秘密情報拒否、素材漏れ検出、3D任意依存。
- production/template: npm install後npm run build成功。JS gzip 116.22KB、CSS gzip 2.09KB。Playwrightは1.56.1へ固定、lockfileを保存。
- production/template npm run test:e2e: 15/15合格。375・768・1440pxで表示、横はみ出し、コンソール、リンク、画像の検査コード、キーボード、reduced-motion起動時/変更時。標準テンプレートは画像がないため、実画像の品質は未検証。
- 任意3Dを導入しOptionalSceneを配置した一時案件: npm run build成功、three.spec.js 3/3合格。操作前canvasなし、操作後描画、軽減設定でcanvas解除。3Dチャンクgzip248.16KB、500KB超チャンク警告あり。案件は検証後清掃、検査コードはtemplates/creative-3d/three.spec.jsに保存。
- 既存npm ci・npm run search -- --genre lp 予約: 成功。ルートpackage-lock.jsonは変更なし。
- git diff --check: 成功。
- Chromiumの最初の配布先はダウンロード失敗。Playwright1.56.1の代替配布先で導入成功後、上記ブラウザテストを実行。

## 未完成・限界

- Stitch MCPの存在はGoogle公式資料で確認。実アカウント接続・認証・API呼び出しは未実行。手動インポートは実装・検査済み。
- 案件文の自動抽出は明示ラベルのみ。自由文は13担当の要件ワークフローで原文照合。ブランドコピー・独自デザインは案件ごとのAI作業として仕様書に記入し、現時点の生成だけで完成扱いしない。
- corporate/landing-pageは共通のReact開始点＋異なる制作手順。完成した案件別の企業サイトやLPではない。
- ブランド独自性・画像違和感・権利はレビュー基準と台帳を使う目視確認。自動で保証しない。
- テストはChromiumの3画面幅。Safari/Firefox、スクリーンリーダー、実スマートフォンの性能、外部リンクのHTTP状態は未検証。
- 初回構築時点ではThree/R3Fは必要案件のみ導入（標準化追記を参照）。3D警告の解消・容量や描画負荷の最適化は案件依存。
- GitHub Actions設定を追加。リモート実行結果はPRのChecksで確認すること。

## 追加費用

標準のローカル制作・テストに有料APIは不要。Stitchのアカウント条件・Cloud billing、Actionsの利用枠超過、ホスティング、有料画像/フォント、フォーム等の外部サービスは個別確認・承認後。今回は課金設定なし。
