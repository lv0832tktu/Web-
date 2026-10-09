# 制作基盤の再実行結果

2026-10-09（日本時間）、実装コミット `6346083` を現在のクラウド環境で再検証した。既存アプリ、素材、テンプレート、過去の報告書は維持。

## 実行結果

| コマンド | 結果 |
| --- | --- |
| npm ci --cache /tmp/npm-cache --no-audit --no-fund | 成功、235パッケージ導入 |
| npm run build | 成功 |
| npm run typecheck | 成功 |
| npm run lint | 成功、指摘0件 |
| npm test | 5件成功、失敗・スキップ0件 |
| PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e | 18件成功（21.2秒）、失敗・スキップ0件 |

Node.js 24.19.0 / npm 11.9.0 / Chromium 151。ロックファイルを使い再インストールした。
ESLint 9.39.5にサポート終了の非推奨警告がある。実行エラーではなく、lint検査は成功した。ESLint 10への移行は設定と関連パッケージの互換性を検証する別作業として残る。

## 画面・操作の確認

1440×900、768×1024、375×812で全ページ画像を撮影して目視確認。ヒーロー、商品一覧、スマホメニューの部分画像も確認した。文字の欠け、意図しない横スクロール、カードの重なり、新たな表示崩れは確認されなかった。今回は追加のアプリ修正を必要とする不具合は見つからなかった。

Playwrightはキーボード操作、Escapeで閉じる・フォーカス復帰、リンク先フォーカス、本文スキップ、JavaScript無効時の表示、reduced-motionを検査。全セクション表示後のaxe検査でも3幅ともWCAG関連の検出違反なし。別途ブラウザ操作でタブレット・スマホのメニュー外クリックによる閉鎖と、PC幅へ変更して元に戻した際の閉じた状態を確認した。

開発サーバーは4173番で稼働し、HTTP応答とSUIの本文を確認。接続先は内部検証用で、公開ページではない。

## 証跡

現在の機内: `/workspace/validation/current-run/`
- install.log / build.log / typecheck.log / lint.log / unit.log / playwright.log
- site-desktop.png / site-tablet.png / site-mobile.png（全ページ）
- desktop-hero.png / tablet-collection.png / mobile-menu.pngなど（部分画面）
- previous-test-results/（再実行前の成果物を保存）

機内のログ・画像はGitに含めない。報告書を開発ブランチに保存する。既存PRの修正を保持し、マージ・公開は実施しない。

## 検証範囲

Chromiumの端末エミュレーションで検証。実機Safari、Firefox、公開先での動作は今回未検証。Lighthouseは今回の依頼には含まれないため再実行していない。前回の評価はPR-1-REVIEW.mdを参照。
