# Webデザイン作成

Webサイト・LP・バナー・サムネイル・UI/UXデザインの制作ファイルを管理するリポジトリです。

## フォルダ構成

- projects/：案件ごとの実装ファイル
- assets/：写真・イラスト・ロゴなどの素材
- briefs/：依頼内容・要件・制作指示
- designs/：デザイン案・画面画像
- delivery/：納品用ファイル

## 使い方

1. briefs/ に案件の依頼内容を保存します。
2. projects/ に案件名のフォルダを作り、制作ファイルを追加します。
3. 素材やデザイン案を対応するフォルダに保存します。
4. 完成した納品ファイルを delivery/ にまとめます。

## AI Web Design Production System
WorkとCodexをGitHubの仕様PRでつなぐ制作基盤を追加しました。[ワークフローとコマンド](docs/work-codex-workflow.md)、[Workへ渡す指示](docs/work-intake-prompt.md)、[模擬案件](projects/mock-suminiwa/request.md)を参照してください。SUIの既存LP・検証を維持し、独自デザインの庭設計LPと10役割の制作計画を追加しています。実際のWork自動起動や顧客送信は行いません。
