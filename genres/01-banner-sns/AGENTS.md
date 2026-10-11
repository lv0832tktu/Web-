# バナー・サムネイル・SNS画像 — 制作指示書

DB: `db/references/`（10,000件 / ID `BNR-xxxxx`）。サイズ別・目的別・業種別に検索できます。

```bash
node tools/search.mjs --genre banner-sns セール コスメ --format 300x250
node tools/search.mjs --genre banner-sns YouTube 副業 --format yt-thumb
node tools/search.mjs --genre banner-sns Instagram カフェ --format ig-portrait
```

## テンプレート

| テンプレート | 用途 | サイズ指定 |
|---|---|---|
| `display-banner` | Google/Yahoo!ディスプレイ広告、EC商品画像 | `?size=300x250`（1ファイルで全サイズに自動レイアウト） |
| `sns-post` | Instagram/X/OGP/ストーリーズ、カルーセル | `?size=1080x1350` / `?slide=2` |
| `youtube-thumbnail` | YouTubeサムネイル | 1280×720固定 / `?v=2`で反転レイアウト |

**文言・画像は各HTML内の `<script type="application/json" id="content">` を書き換えるだけ。**
`sfxTimeline`（効果音のタイミング）と `loopSeconds`/`duration`（尺）もここで設定します。

## 書き出し

```bash
node tools/render.mjs projects/xxx/index.html --sizes 300x250,336x280,728x90,320x100,300x600 --png --gif
node tools/render.mjs projects/xxx/index.html --sizes 1080x1350 --png
node tools/render.mjs projects/xxx/index.html --sizes 1080x1920 --mp4     # リール/ストーリーズ動画（効果音入り）
```

- GIFは自動で150KB以下を目指して色数・fpsを落とします。超える場合は尺を短く／背景を単色に。
- MP4は `sfxTimeline` の効果音をWAVに合成して音付きで書き出します（SNSでの音付き再生用）。

## プロの基準（このジャンルの勝ちパターン）

1. **3秒ルール**：0.5秒で「何の広告か」、3秒で「自分に得か」が伝わる。要素は「キャッチ・ビジュアル・CTA」の3つに絞る。
2. **文字は大きく少なく**：300×250ならキャッチ8〜12文字。スマホで50%縮小して読めるか確認。
3. **視線誘導**：Z型（左上→右上→左下→右下）。人物の視線はキャッチへ向ける。
4. **コントラスト**：背景とキャッチは明度差を最大に。写真上の文字は袋文字（`-webkit-text-stroke` + `paint-order: stroke fill`）かグラデオーバーレイ。
5. **数字は主役**：「50%OFF」「3日間」など数字は他の文字の2〜3倍の大きさ。単位は数字の1/3。
6. **CTAはボタンの形**：角丸＋影＋矢印。アクセント色はCTAだけ。
7. **アニメーション（GDN）**：30秒以内・最大3ループ、最後のフレームで全情報が読める状態に。
8. **YouTubeサムネ**：顔（感情）を1/3以上、3〜8文字、右下に重要要素を置かない、チャンネル内で型を統一。
9. **Instagram**：1枚目は「保存したくなる」タイトル。2枚目以降はリスト/図解。プロフィールグリッド全体の統一感。
10. **ストーリーズ/リール**：上下250pxはUIと被るので文字を置かない。

## 高度に見せるテクニック（動き・グラフィック）

- 背景に `<canvas data-gfx="mesh">`（メッシュグラデ）や `particles` を薄く敷くと一気に「今っぽく」なる
- 見出しは1文字ずつ出る **キネティックタイポ**（テンプレート実装済み）
- 割引バッジは **回転する円形テキスト** ＋ **スタンプ着地**（scale 2.4→1）
- CTAは **シャイン（光の反射）** と **パルス（波紋）**
- 効果音: 出現 `whoosh` → 文字 `pop` → バッジ `impact` → CTA `sparkle`（SNS動画のみ。ディスプレイ広告は無音）

## よくあるサイズ一覧

DBの `format` を参照（GDN 8サイズ / YouTube / Instagram 3種 / TikTok / X 2種 / OGP / LINE 2種 / note / ブログ / EC / Podcast）。
