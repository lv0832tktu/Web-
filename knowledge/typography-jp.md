# 日本語タイポグラフィ ガイド

DBのレシピはスタイル別に厳選した Google Fonts の組み合わせ（72書体・すべて商用利用可・OFL）を使います。

## 基本設定（shared/css/base.css 実装済み）
```css
body { font-size: 16px; line-height: 1.85; letter-spacing: .04em; font-feature-settings: "palt"; }
h1, h2 { line-height: 1.35; letter-spacing: .02em; text-wrap: balance; }
p { text-wrap: pretty; } /* 行末の1文字残り（孤立）を防ぐ */
```
- `palt`：約物（、。「」）の余白を詰めて、見出しを締まって見せる
- 見出しは行間を詰め（1.2〜1.4）、本文は広げる（1.8〜2.0）
- 1行の文字数：PCは35〜40文字、スマホは18〜22文字が読みやすい（`max-width: 40em`）

## 書体の選び方（スタイル別の定番）
| スタイル | 見出し | 本文 | 欧文 |
|---|---|---|---|
| ミニマル | Zen Kaku Gothic New | Noto Sans JP | Inter |
| 高級・上品 | Shippori Mincho / Zen Old Mincho | Noto Serif JP | Cormorant Garamond / Playfair Display |
| ナチュラル | Zen Maru Gothic / Klee One | Noto Sans JP | Quicksand / Lora |
| ポップ | M PLUS Rounded 1c / Dela Gothic One | M PLUS Rounded 1c | Poppins / Rubik |
| テック | IBM Plex Sans JP / Noto Sans JP | 同左 | Space Grotesk / IBM Plex Mono |
| 和モダン | Shippori Mincho B1 / Zen Antique | Noto Serif JP | EB Garamond |
| レトロ | Rampart One / DotGothic16 | M PLUS 1p | Bungee / Righteous |
| 信頼 | BIZ UDPGothic / Noto Sans JP | 同左 | Montserrat / Source Sans 3 |
| スポーティ | Dela Gothic One | Noto Sans JP | Anton / Bebas Neue / Oswald |

## プロっぽく見せるテクニック
- **英字を大きく、和文を小さく**：`ABOUT` を巨大に、「私たちについて」を小さく添える
- **数字だけ欧文書体**：`<span class="en">12,000</span>人` — 和文フォントの数字は間延びする
- **強調は太さより色・サイズ**：太字の多用は画面が重くなる
- **縦書き**：和モダン・高級系のアクセントに `writing-mode: vertical-rl`
- **袋文字**（バナー/サムネ）：`-webkit-text-stroke: 8px #000; paint-order: stroke fill;`
- **マーカー**：`background: linear-gradient(transparent 60%, var(--c-accent) 60%);`
- **改行位置を制御**：意味の切れ目で `<br>` または `<wbr>`、スマホだけ改行は `<br class="sp">`
- **流体タイポ**：`font-size: clamp(2rem, 1rem + 4vw, 5rem)` で画面幅に追従

## 読み込み（表示速度）
- 使うウェイトだけを読み込む（`tools/lib/db.mjs` の `googleFontsUrl()` が自動生成）
- `display=swap`、`<link rel="preconnect">` を付ける
- 装飾フォント（ロゴ・見出しだけ）は `&text=使う文字` でサブセット化すると数KBになる
