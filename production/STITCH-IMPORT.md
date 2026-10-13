# Stitchデザイン手動インポート
確認日: 2026-10-13。Google公式CodelabsでStitch MCP連携を確認。
https://codelabs.developers.google.com/design-to-code-with-antigravity-stitch?hl=en
公式セットアップ: https://stitch.withgoogle.com/docs/mcp/setup

この環境にはStitch MCP接続がないため認証・呼出しは未検証。公式CodelabsにはCloud billing有効化の前提があるため、無断設定せず手動取込を標準にする。

```sh
node scripts/import-stitch.mjs projects/client-projects/yohaku ./stitch-export
```

許可形式の資料をコピーし、SHA256・容量のmanifestを生成。取込済み資料は上書きしない。秘密情報のパターン検査は補助であり、取り込み前の目視確認も必要。未信頼HTMLは自動実行せず、Reactへ移植して検査する。
Stitchの公式API使用可否・権限・レート制限は利用時に最新の仕様を確認してください。APIキーの入力・購入は必須にしません。

1. 対象案件の `stitch/` にStitchがエクスポートした画面画像、HTML/CSS、関連素材を保存（出力可能な形式のみ）。
2. 情報設計・コンポーネント・カラー・フォントを整理し、`src/` のReactへ移植。
3. 外部のデザインと混在する素材のライセンスを `ASSETS.md` へ記録。
4. 生成コードは依存関係と読み込み先を点検。外部API、トラッカー、秘密情報を無断追加しない。
5. モバイルとキーボード操作を再検証。Stitch画面のスクリーンショットと実装の差分を目視で比較する。

`stitch/` へアップロードしたAPIキー、認証済みCookie、個人情報はGitにコミットしないでください。
