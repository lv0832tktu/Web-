# 秋じかん v1 — 人による最終確認待ち

架空ブランドの自主制作。契約実績や実店舗の商品紹介ではありません。

入力は仕様PR [#2](https://github.com/lv0832tktu/Web-/pull/2) の `5046c0ddc5fd5ae253dc862e8eb965594bd1789c`。`work-receipt.json` に受信SHAと4ファイルのハッシュを保存。handoffは変更していません。ユーザーの本チャット指示を当該SHAの制作許可として記録し、GitHubのレビュー承認済みとは主張しません。

## 成果物

- `06-delivery/P01.png`〜`P06.png`: 1080×1350、静止画カルーセル。
- `06-delivery/B01.png`: 1080×1080、単独バナー。
- 同名SVG7枚: 写真・フォントを埋込み、文字はSVG textで編集可能。
- `assets/IMG01.png`〜`IMG05.png`: 独立したAI生成写真5点。実在の場所・人物・商品を証明する写真ではありません。
- `06-delivery/copy-and-alt.json`: 全コピーと画像別代替テキスト。
- `06-delivery/asset-ledger.json`: 生成日時・プロンプト・出典・SHA256・配置・権利状態。
- `fonts/`: Noto Sans JP Medium / Noto Serif JP Bold、WOFF2とTTF、SIL OFL 1.1本文。
- `05-qa/`: 検証報告と独立QA。`evidence/`: 原寸/375/768/1440幅の証拠、構造・寸法・コントラスト・再書出し・Web回帰ログ。

## 再制作・編集

既存の隔離チェックアウト `/workspace/Web-` を使い、worktreeは不要です。Node24、Python3.12、Pillow12.3、Chromiumを使いました。リポジトリルートで `npm ci` 後:

```sh
python3 codex/autumn-weekend-v1/compose.py
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node codex/autumn-weekend-v1/render.mjs
python3 codex/autumn-weekend-v1/validate.py
```

`compose.py` の text/heading/action を編集して再書出しできます。`design-spec.json` は承認仕様の抽出コピーです。SVGの写真はdata URIで保持。ブラウザでは埋込みWOFF2を使用。デスクトップ編集ソフトでフォント埋込みCSSを認識しない場合は同梱TTFをインストールしてください。Canva/PSD/AI形式ではありません。文字アウトライン化はしていません。

PNGはChromiumの `--force-color-profile=srgb` で描画。原寸1080px、本文最小42px、ブランド/番号/注記36px。表示幅の検証は画像を変形せず343/540/432pxに比例縮小。確認用HTMLギャラリーは納品しないためキーボード・フォーカス・Motionの検査は対象外です。

## 未完了事項

生成写真の利用条件の確認と人による素材権利レビュー、最終画像承認は未完了です。素材台帳で `UNVERIFIED/NOT_RUN` としており、納品完成・公開可とは扱いません。Instagram上での実表示・保存率・エンゲージメントは未検証。マージ・投稿・公開・顧客送信はしていません。

GitHub APIはネットワーク403。実装PRを作るには環境設定の `api.github.com` 許可ドラフトを保存・Publishする必要があります。通常ページで仕様PR本文は確認できました。PR本文案は `PR-BODY.md` に保存しています。
