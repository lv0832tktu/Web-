# REFERENCE — Webデザイン制作キット 早見表

制作中に「何が使えるか」をすぐ引くための1枚まとめ。詳しい説明は各リンク先へ。

---

## 1. 1案件の流れ（コマンド）

| 手順 | コマンド / ファイル |
|---|---|
| ① 依頼を書く | `briefs/TEMPLATE.md` をコピー → `briefs/<案件>.md`（記入例: `briefs/example-sakura-dental.md`） |
| ② 参考を探す | `node tools/search.mjs --genre lp 歯科 予約` |
| ③ 案件フォルダ生成 | `node tools/new-project.mjs --genre lp --name <案件> --brief briefs/<案件>.md` |
| ④ 制作 | `projects/<日付>-<案件>/BRIEF.md` に従ってテンプレートを編集 |
| ⑤ チェック | `node tools/check.mjs projects/<日付>-<案件> --browser`（エラー0まで） |
| ⑥ 書き出し | `node tools/render.mjs <html> --fullpage` ／ `--sizes 300x250 --png --gif` ／ `--sizes 1080x1920 --mp4` |
| ⑦ 納品 | `delivery/<案件>/` に制作物＋`README.txt` |
| ギャラリー | `npm run serve` → http://localhost:5173/ |

## 2. ジャンル × テンプレート × DB

| ジャンル | 指示書 | テンプレート | DB（各10,000件） | ID |
|---|---|---|---|---|
| バナー・サムネ・SNS | [genres/01-banner-sns/AGENTS.md](genres/01-banner-sns/AGENTS.md) | `display-banner` `sns-post` `youtube-thumbnail` | 22サイズ×15目的×15レイアウト | `BNR-` |
| LP | [genres/02-lp/AGENTS.md](genres/02-lp/AGENTS.md) | `lp-standard` | 8ゴール×6構成の型×10FV | `LP-` |
| Webサイト | [genres/03-website/AGENTS.md](genres/03-website/AGENTS.md) | `corporate`（4ページ） | 13サイト種別×7ヘッダー×9ヒーロー | `WEB-` |
| UI/UX | [genres/04-uiux/AGENTS.md](genres/04-uiux/AGENTS.md) | `app-prototype` `dashboard` | 16アプリ×7プラットフォーム×16UXパターン | `UI-` |

検索オプション: `--style ミニマル` `--level プロ` `--format 300x250|ig-story|yt-thumb` `--any` `--json` `--id LP-00381`

## 3. スタイル（20種）

ミニマル・洗練 ／ ラグジュアリー・高級感 ／ ナチュラル・オーガニック ／ ポップ・カラフル ／ クール・テック ／ 和モダン ／ レトロ・Y2K ／
エディトリアル・雑誌風 ／ かわいい・ガーリー ／ 信頼・誠実（コーポレート） ／ エネルギッシュ・スポーティ ／ ダーク・シネマティック ／
グラスモーフィズム ／ ニューブルータリズム ／ パステル・ドリーミー ／ ネオン・サイバー ／ ハンドメイド・手書き ／ 北欧・ライフスタイル ／
ジオメトリック・グラフィカル ／ 3D・クレイ
（各スタイルの配色4種・書体3組・相性の良い動き/音/グラフィック → `tools/taxonomy/common.mjs`）

## 4. デザイントークン（`tokens.css`）

| 変数 | 役割 | 面積 |
|---|---|---|
| `--c-bg` | 背景 | 70% |
| `--c-surface` | カード・セクション面 | — |
| `--c-text` | 文字（コントラスト4.5:1以上） | — |
| `--c-primary` | ブランドカラー | 25% |
| `--c-accent` | CTA・重要数字だけ | 5% |
| `--c-on-primary` | ボタン上の文字色 | — |
| `--font-head` / `--font-body` / `--font-en` | 見出し / 本文 / 英数字 | — |

余白 `--sp-1`〜`--sp-8`（8px基準）、セクション間 `--section`、文字サイズ `--fs-xs`〜`--fs-3xl`、角丸 `--radius` `--radius-l`、影 `--shadow-s|m|l`
イージング `--ease-out`（標準）`--ease-in-out`（マスク）`--ease-back`（弾む）

## 5. モーション（data属性で付ける）→ [knowledge/motion-guide.md](knowledge/motion-guide.md)

| やりたいこと | 書き方 |
|---|---|
| 下からフェード | `data-reveal="fade-up"`（fade-down/left/right, fade, zoom-in/out, pop, rotate-in, blur-in） |
| 幕が上がる・切り抜き | `data-reveal="clip-up"` / `clip-left` / `clip-circle` / `mask-wipe` |
| 順番に出す | 親に `data-stagger="80"` |
| 1文字ずつ（タグ維持） | `data-split="chars"`（`data-split-style="rotate|blur"`） |
| 遅らせる | `data-delay="300"` |
| 数字カウントアップ | `data-counter="1200" data-suffix="件" data-decimals="1"` |
| タイプライター＋打鍵音 | `data-typewriter data-sfx-type` |
| 視差 | `data-parallax="0.15"` |
| 無限テキスト帯 | `data-marquee="40"`（`data-reverse`） |
| 吸い付くボタン | `data-magnetic` |
| 3Dに傾くカード | `data-tilt="8"` |
| クリック波紋 | `data-ripple` |
| 読了バー | `<div data-scroll-progress></div>` |
| カスタムカーソル | `<body data-cursor>` |
| SVG線を描く | `data-line-draw` |
| スクロールで変化 | `<section data-pin>` → CSSで `var(--p)`（0〜1） |
| 横スクロール | `data-hscroll` ＋ 子に `data-hscroll-track` |
| ループ装飾クラス | `m-float` `m-pulse` `m-spin` `m-wiggle` `m-bounce` `m-shine` `m-gradient-shift` `m-blob` `m-kenburns` `m-glitch`(+`data-text`) `m-grain` |
| 紙吹雪 | `Motion.confetti({ colors: [...] })` |

## 6. 動く背景グラフィック → `shared/js/graphics.js`

`<canvas data-gfx="名前" data-colors="#色,#色">`
`mesh`（メッシュグラデ）／`particles`（粒子）／`constellation`（ネットワーク・AI）／`waves`（波）／`bokeh`（光の玉）／
`grid3d`（シンセウェーブ）／`sakura`（花びら）／`snow`（雪）／`rings`（波紋）
SVG: `GFX.svg.blob(seed)`（ランダムブロブ）、`GFX.svg.wave()`（波の区切り線）

## 7. 効果音（30種）→ [knowledge/sfx-guide.md](knowledge/sfx-guide.md)

`data-sfx="名前"`（クリック）／ `data-sfx-hover="名前"`（ホバー）／ `SFX.play('名前')` ／ `SFX.playTimeline([{t:0,sfx:'whoosh'}])`
**必須**: `<button class="sfx-toggle" data-sfx-toggle>🔊 SOUND ON</button>` と `SFX.bind()`

| 用途 | 音 |
|---|---|
| ボタン・ホバー | `click` `tick` `hover` |
| 追加・リアクション | `pop` `bubble` |
| スイッチ | `toggle` `toggle-off` |
| 画面遷移・メニュー | `whoosh` `swoosh` `swipe` `page-turn` |
| 完了・通知 | `success` `chime` `notify` `soft-bell` |
| エラー | `error` |
| ご褒美・演出 | `coin` `sparkle` `confetti` `unlock` `level-up` `jingle` |
| 迫力 | `impact` `riser` `heartbeat` `glitch` |
| その他 | `drop` `typing` `shutter` `koto`（和） |

スタイル別: 高級→soft-bell/chime ／ ポップ→pop/bubble/coin ／ テック→click/notify/unlock ／ 和→koto ／ スポーツ→impact/whoosh

## 8. レシピのフィールド（`node tools/search.mjs --id <ID>`）

| フィールド | 使い道 |
|---|---|
| `concept` | 提案書の「狙い」にそのまま使える |
| `palette` / `fonts` | `tokens.css` に自動反映 |
| `layout` `first_view` `sections` `sitemap` `screens` `ux_patterns` | 構成 |
| `copy` | キャッチ・CTA・マイクロコピーの例 |
| `motion` / `sfx` / `gfx_background` / `animation` | 動き・音・背景 |
| `graphics` | 入れるべきグラフィック要素 |
| `originality` | 他と差をつける一手 |
| `quality_check` | 納品前チェック観点 |
| `persona` `ux_laws` `design_tokens` `deliverables` | UI/UXの根拠と成果物 |

## 9. サイズ早見表（バナー・SNS）

| 媒体 | サイズ |
|---|---|
| GDN/YDA | 300×250, 336×280, 728×90, 320×50, 320×100, 300×600, 160×600, 970×250 |
| YouTubeサムネ | 1280×720 |
| Instagram | 1080×1080 / 1080×1350 / ストーリーズ・リール 1080×1920 |
| TikTok | 1080×1920 |
| X | 投稿 1600×900 / ヘッダー 1500×500 |
| OGP・Facebook・ブログ | 1200×630 |
| LINE | リッチメッセージ 1040×1040 / リッチメニュー 2500×1686 |
| note | 1280×670 |
| EC商品画像 | 1000×1000 |

## 10. 品質の最低ライン → [knowledge/quality-checklist.md](knowledge/quality-checklist.md)

コントラスト4.5:1 ／ タップ44px ／ alt必須 ／ 書体は和文2+欧文1 ／ 配色70:25:5 ／ 余白8の倍数 ／ ジャンプ率2.5倍以上 ／
同時に動くもの2つまで ／ 効果音ON/OFF ／ ダミー文言・`.ph` を残さない ／ PC1440・SP375で横スクロールなし

## 11. 参考作品（実在の高評価作品 43件）→ [knowledge/reference-works/README.md](knowledge/reference-works/README.md)

Awwwards Site of the Year 2025（Lando Norris）/ Developer SOTY 2025（Messenger）/ SOTY 2024（Igloo Inc）/ 2025年の Site of the Month 各月、
日本の受賞作（Garden Eight「The Shift」ほか）、SaaS LP（Linear・Stripe・Vercel）、国内LP事例、MrBeastのサムネイル、HTML5バナー事例、
Apple Design Awards 2025、Duolingo・Headspace・Airbnb・Stripe Dashboard など。画像やコードは収録せず「事実＋学べる設計パターン＋キットでの再現方法」を記録。

| やりたいこと | コマンド |
|---|---|
| 一覧・検索 | `node tools/works.mjs --genre lp` ／ `node tools/works.mjs ダーク` ／ `--style luxury` |
| 詳細 | `node tools/works.mjs --id REF-WEB-001` |
| 案件に組み込む | `node tools/new-project.mjs --genre website --name xxx --work REF-WEB-001,REF-WEB-018` |

各レシピにも `reference_works`（同ジャンル×同スタイルの作品）が紐付いていて、`new-project` が自動で BRIEF.md の「6.5 参考作品」に展開します。

## 12. ナレッジ一覧

[デザイン原則](knowledge/design-principles.md) ／ [配色](knowledge/color.md) ／ [日本語タイポ](knowledge/typography-jp.md) ／ [モーション](knowledge/motion-guide.md) ／
[効果音](knowledge/sfx-guide.md) ／ [コピー](knowledge/copywriting.md) ／ [品質チェック](knowledge/quality-checklist.md) ／
[副業の進め方・料金](knowledge/workflow-fukugyo.md) ／ [参考ギャラリー](knowledge/reference-sites.md) ／ [辞書JSON](knowledge/dictionary.json)
