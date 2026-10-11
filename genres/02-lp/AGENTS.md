# LP（ランディングページ） — 制作指示書

DB: `db/references/`（10,000件 / ID `LP-xxxxx`）。業種 × ゴール（予約/資料請求/購入/登録…）× 構成の型 × FVパターン × スタイル。

```bash
node tools/search.mjs --genre lp パーソナルジム 無料体験
node tools/search.mjs --genre lp SaaS 資料請求 --style テック --level プロ
```

## テンプレート `templates/lp-standard`

全セクション実装済み。レシピの `sections` の順番に合わせて `<section>` を **並べ替え・削除** して使う。

| key | セクション | テンプレート内の実装 |
|---|---|---|
| fv | ファーストビュー | split-text見出し / メッシュ背景 / 浮遊モック / 回転テキスト / マグネティックCTA |
| media | メディア掲載 | ロゴのマーキー |
| problem / empathy | お悩み・共感 | チェックリスト（stagger）＋波線の回答 |
| solution | 解決策 | 写真clip-up＋マーカー |
| feature | 選ばれる理由 | ジグザグ＋白抜き番号 |
| numbers | 実績数字 | カウントアップ |
| beforeafter | ビフォーアフター | ドラッグで比較できるスライダー（tick音） |
| voice | お客様の声 | 横スクロールカード |
| price | 料金 | 3プラン（人気プランを3Dチルト＋シャイン） |
| offer | 特典 | グラデーション＋カウントダウン |
| flow | 流れ | 点線のline-draw＋STEPカード |
| faq | FAQ | アコーディオン（開閉音・1つだけ開く） |
| form / cta | フォーム | 進捗バー・インライン検証（error音）・送信で紙吹雪＋success音 |
| sticky | 追従CTA | FVを過ぎたら下から出現、フォーム表示中は隠れる |

レシピに無いセクション（story / compare / guarantee）は、既存セクションのCSSを流用して追加する。

## プロの基準

1. **FV（ファーストビュー）で8割決まる**：「誰の」「何の悩みを」「どう解決し」「どんな未来」が3秒で伝わる。CTAをFV内に必ず置く。
2. **1LP＝1ゴール**：CTAの行き先は1つ。ボタン文言は「行動＋得られるもの」（×送信 → ○無料で資料をもらう）。
3. **CTAはスクロール2画面ごと**に出す＋スマホは追従CTA。
4. **構成の型**（PASONA/AIDMA/QUEST/BEAF/PASTOR/StoryBrand）に沿って、不安を1つずつ潰す流れにする。
5. **証拠を見せる**：数字（出典・期間を明記）、お客様の声（顔・年代・職業）、メディア掲載、保証。
6. **スマホファースト**：アクセスの7〜8割はスマホ。375pxで先にデザインを確認する。
7. **フォームは5項目以内**。マイクロコピー（「30秒で完了」「営業電話なし」）で心理的ハードルを下げる。
8. **表示速度**：画像はWebP・遅延読込（`loading="lazy"`、FVの画像だけ `fetchpriority="high"`）。Lighthouse 85以上。
9. **景品表示法・薬機法**：「必ず痩せる」「No.1（根拠なし）」「治る」などの表現はNG。効果には「※個人差があります」。

## 高度に見せる演出（すべてテンプレートで実装済み → data属性で付け外し）

`data-split` 見出し / `data-reveal="mask-wipe"` 写真 / `data-parallax` / `data-counter` / `data-tilt` / `data-magnetic` /
`data-marquee` / `<canvas data-gfx>` / `Motion.confetti()` / `data-scroll-progress` / `data-sfx` / カスタムカーソル `<body data-cursor>`

**やりすぎ注意**：動きは「注目させたい所」だけ。1画面に同時に動くものは2つまで。

## 納品物

- `index.html` 一式（`shared/` 同梱・そのままサーバーにアップ可能）
- PC/SPのフルページ画像（`render.mjs --fullpage`）→ 確認用
- `README.txt`：フォーム送信先の設定方法、画像の差し替え方法、効果音のON/OFF
