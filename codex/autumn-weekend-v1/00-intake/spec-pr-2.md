20代会社員向けの「秋にやりたいこと」画像制作を、練習・ポートフォリオ用の仕様として整理しました。カルーセル1投稿6枚（1080×1350px）と単独バナー1枚（1080×1080px）、編集可能SVGを提案範囲とします。実案件の契約・実績とは扱いません。

変更は projects/autumn-weekend/handoff/ の brief.md・references.md・design-spec.md・acceptance.md の4ファイルのみ。原文、判明/推定/不足、2方向の比較、全コピー、写真5点の生成指示、保存CTA、確認表示幅、権利台帳、要件R01–R06と受入条件A01–A06を記載しました。

ベースは feat/ai-web-design-production です。v1ワークフローはmainに未反映のため、main向けのPRに制作基盤変更を混在させません。

## Codexへの引継ぎ
仕様head commit SHA: 5046c0ddc5fd5ae253dc862e8eb965594bd1789c
仕様ブランチ: work-handoff/autumn-weekend-v1
入力: projects/autumn-weekend/handoff/
このSHAが人にレビュー・承認された後に受信してください。PR作成自体は承認ではありません。Workは画像制作・実装をしていません。

```sh
git status --short
git fetch origin work-handoff/autumn-weekend-v1
npm run work:receive -- 5046c0ddc5fd5ae253dc862e8eb965594bd1789c autumn-weekend /tmp/autumn-weekend-input-v1
npm run production -- validate /tmp/autumn-weekend-input-v1
```

画像は静止画です。既存CLIのWeb実装計画やbuildをPNG品質の検証に読み替えないでください。承認後はcodex/autumn-weekend-v1で画像生成・編集元・書出し・全幅目視・権利確認・納品一覧を作成し、実装PRを提出します。

## 確認済み
- 接続先Web-のpush権限。
- docs/work-codex-workflow.md、work-intake-prompt.md、mock-suminiwaの4例とcatalog.jsonの閲覧。
- カタログ5件は全件架空データ。
- 関連メディア2件の公式公開ページ本文の検索・閲覧（2026-10-09 JST）。実投稿成果・画像許諾は含まない。
- 各MarkdownのJSONブロック1個、schemaVersion=1、JSON解析、要件IDの重複なし、全要件の受入条件対応（Workでの構造確認）。

## 未確認・未実行
- CLI production validateとCI。
- 写真生成、PNG/SVG書出し、画像・縮小時QA。
- フォント/生成素材の利用条件と人による権利確認。
- Instagram本体の投稿デザイン/保存率/エンゲージメント調査。
- 予算、納期、実マニュアル、修正回数契約（練習用のため未指定）。
- 人による仕様レビュー・承認。

仕様変更はwork-handoff/autumn-weekend-v2の新しいPRにします。このPRはマージ・公開・Instagram投稿・顧客送信を行いません。