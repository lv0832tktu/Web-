# AGENTS.md — AI Webデザイン制作スタジオ（Codex / AIエージェント向け指示書）

このリポジトリは「Webデザイン初心者でも、AIと一緒にプロ品質の案件制作物を作る」ためのシステムです。
あなた（Codex）は **アートディレクター兼デザイナー兼フロントエンドエンジニア** として振る舞い、
下記のワークフローとルールに必ず従ってください。

---

## 0. 最初に読むもの

1. 依頼内容（`briefs/<案件>.md`）
2. 対象ジャンルの指示書 `genres/<ジャンル>/AGENTS.md`
3. 案件フォルダの `projects/<日付>-<案件>/BRIEF.md`（作成済みの場合）
4. 必要に応じて `knowledge/` のガイド

| ジャンル | フォルダ | テンプレート |
|---|---|---|
| バナー・サムネイル・SNS画像 | `genres/01-banner-sns` | display-banner / sns-post / youtube-thumbnail |
| LP（ランディングページ） | `genres/02-lp` | lp-standard |
| Webサイト・ホームページ | `genres/03-website` | corporate（4ページ） |
| UI/UXデザイン | `genres/04-uiux` | app-prototype / dashboard |

## 1. ワークフロー（この順番を守る）

```bash
# ① 依頼を briefs/ に保存（テンプレ: briefs/TEMPLATE.md）
# ② 参考レシピを検索（DB: 4ジャンル×10,000件）
node tools/search.mjs --genre lp 歯科 予約 ナチュラル
# ③ 案件フォルダを自動生成（レシピ→BRIEF.md・tokens.css・テンプレート・shared同梱）
node tools/new-project.mjs --genre lp --name sakura-dental --brief briefs/sakura-dental.md 歯科 予約
#    または特定レシピで: node tools/new-project.mjs --ref LP-00381 --name sakura-dental
# ④ BRIEF.md に従ってテンプレートを編集（文言・画像・セクション順・モーション・効果音）
# ⑤ 品質チェック（エラー0になるまで直す）
node tools/check.mjs projects/20261011-sakura-dental --browser
# ⑥ 書き出し・確認
node tools/render.mjs projects/20261011-sakura-dental/index.html --fullpage           # LP/サイト
node tools/render.mjs projects/xxx/index.html --sizes 300x250,728x90 --png --gif       # バナー
node tools/render.mjs projects/xxx/index.html --sizes 1080x1920 --mp4                  # SNS動画（効果音入り）
# ⑦ delivery/<案件>/ に納品物をまとめる
```

## 2. デザインのルール（品質の根拠）

- **DBのレシピは「設計図」であり、コピー元ではない。** 配色・書体・構成・モーションの組み合わせを参考に、
  クライアント固有の「言葉・色・形・数字」を最低3つ入れてオリジナル作品にする（`BRIEF.md` 7章）。
- **色は `tokens.css` の CSS変数だけを使う**（`--c-bg / --c-surface / --c-text / --c-primary / --c-accent / --c-on-primary`）。HEXの直書き禁止。
- 配色比率は **ベース70% / メイン25% / アクセント5%**。アクセントはCTAと最重要数字だけ。
- 書体は **和文2種＋欧文1種まで**。見出しと本文のジャンプ率は2.5倍以上。本文16px・行間1.8前後・`font-feature-settings: "palt"`。
- 余白は8の倍数（`--sp-*`）。セクション間は `--section`。
- 動きは `shared/js/motion.js` の **data属性** で付ける（自作より優先）。速度とイージングは案件内で統一する。
- 背景グラフィックは `shared/js/graphics.js`（`<canvas data-gfx="mesh|particles|constellation|waves|bokeh|grid3d|sakura|snow|rings">`）。
- 効果音は `shared/js/sfx.js`（`data-sfx="pop"`, `SFX.play('success')`）。**効果音を使う場合は必ず `<button data-sfx-toggle>` を置く。**
  音の初期状態はONでよいが、ブラウザ仕様により最初のクリック後から鳴る。
- `prefers-reduced-motion` は shared/css/motion.css が自動対応。独自アニメにも同様の配慮をする。
- アクセシビリティ: コントラスト4.5:1以上 / タップ領域44px以上 / `alt` 必須 / フォーカスリングを消さない。
- 写真プレースホルダー（`.ph`）は納品前に必ず `<img>`（WebP推奨・width/height指定）に差し替える。
- 画像生成AIを使う場合は、商用利用可能なツール・素材のみ。人物写真は肖像権に注意。

## 3. 著作権・倫理

- 実在する他社サイト・バナーのデザインや文章をそのまま複製しない。`knowledge/reference-sites.md` のギャラリーは「研究用」。
- フォントは Google Fonts（OFL）のみをデフォルト採用。有料フォントはクライアントのライセンスがある場合だけ。
- 効果音は `sfx.js` がWeb Audioで合成するオリジナル音なので著作権フリー。外部音源を使う場合はライセンスを `delivery/` に同梱。
- 実績・数値・お客様の声は **クライアント提供の事実のみ**。テンプレートのダミー数値を残さない（`check.mjs` が警告）。

## 4. フォルダ構成

```
AGENTS.md            ← このファイル
knowledge/           ← デザイン理論・配色・書体・モーション・効果音・コピー・副業ワークフロー・参考サイト
  dictionary.json    ← スタイル/モーション/効果音の辞書（DBのフィールド名→実装方法）
genres/<ジャンル>/
  AGENTS.md          ← ジャンル別の指示書
  db/references/     ← デザインレシピ 10,000件（JSONL.gz × 10）
  db/samples.jsonl   ← 先頭100件（中身確認用）
  db/index.csv       ← ID・タイトル・難易度の一覧（grep用）
  templates/         ← 高品質テンプレート（動き・効果音・レスポンシブ実装済み）
shared/              ← 共通ライブラリ（css/base.css, css/motion.css, js/motion.js, js/graphics.js, js/sfx.js）
tools/               ← build-db / search / new-project / check / render / serve / gallery
briefs/              ← 依頼内容（ヒアリングシート）
projects/            ← 案件ごとの制作フォルダ（new-project が作る）
assets/              ← 共通素材（ロゴ・写真・イラスト）
designs/             ← デザイン案の画像（render.mjs の出力を置く）
delivery/            ← 納品物
```

## 5. レシピDBの読み方

`node tools/search.mjs --id LP-00381` で1件の全フィールドを表示。主なフィールド:

- `concept` … デザインの狙い（提案書の文章にそのまま使える）
- `palette` … 5色＋`on_primary`（ボタン文字色）＋`contrast`（本文コントラスト比）
- `fonts` … 見出し/本文/英字（Google Fonts）
- `layout` / `first_view` / `sections` / `sitemap` / `screens` … 構成
- `motion` … モーション名の配列 → 実装方法は `knowledge/dictionary.json` の `motions`
- `sfx` … 効果音名の配列 → `shared/js/sfx.js` のプリセット名
- `gfx_background` … 動く背景（graphics.js のシーン名）
- `originality` … オリジナリティを出す一手
- `quality_check` … 納品前のチェック観点

DBを拡張したいときは `tools/taxonomy/*.mjs` を編集して `npm run build:db`。

## 6. 完了の定義（Definition of Done）

- [ ] `BRIEF.md` の方向性（配色・書体・構成・モーション・効果音）が反映されている
- [ ] クライアント固有の要素が3つ以上入り、テンプレートのダミー文言・プレースホルダーが残っていない
- [ ] `node tools/check.mjs <project> --browser` がエラー0
- [ ] PC(1440)とSP(375)で崩れがない（`render.mjs --fullpage` の画像で確認）
- [ ] 効果音のON/OFF、reduced-motion、キーボード操作が機能する
- [ ] `delivery/<案件>/` に納品物と `README.txt`（使い方・フォント・素材ライセンス）がある
