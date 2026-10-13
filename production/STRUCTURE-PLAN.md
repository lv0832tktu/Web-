# 既存調査と実装差分

調査日: 2026-10-13

main（8a18481）: 40,000件の設計レシピ、43参考研究ノート、静的HTMLテンプレート、sharedの動き・背景・音、案件生成・検査・書出し。Reactとagents/はmainにない。

既存feature/ai-web-production-v2-20261013（39d735f）: production/templateにReact/Vite/Tailwind/GSAP、別案件生成、3幅のPlaywright、CI、production/AGENT-ROLES.mdの13担当がある。個別agents/、指定のdesign-system構成、Stitch取込CLI、再利用React部品、3Dコードは未整備。

feat/ai-web-design-productionも調査。別のTypeScript基盤・handoffワークフローがあり、mainとは異なる全体構成。無断で統合・置換せず、今回の基点は39d735fとする。

## 計画
1. 既存の13担当表からagents/を補助定義として追加。
2. 既存knowledge・参考ノートを参照するdesign-system・catalogを追加。
3. production/templateを共通基盤として3種の案件開始点を追加。
4. 新しいscriptsで案件生成・Stitch資料取込・素材検査。旧CLIは維持。
5. GSAP部品・任意3D・PC/タブレット/スマホテストを整備。
6. npm lockfileとCI・README・テスト記録を追加。専用ブランチからPRへ。

削除・公開・課金・mainへのマージは実行しない。既存のブランチにある実装も同じPRへ含まれるため、レビュー時にproduction/全体を確認する。
