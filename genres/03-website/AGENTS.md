# Webサイト・ホームページ — 制作指示書

DB: `db/references/`（10,000件 / ID `WEB-xxxxx`）。業種 × サイト種別（コーポレート/店舗/採用/ブランド/クリニック/EC…）× ヘッダー × ヒーロー × グリッド × スタイル。

```bash
node tools/search.mjs --genre website 工務店 コーポレート
node tools/search.mjs --genre website 美容室 店舗 --style 北欧
```

## テンプレート `templates/corporate`

| ファイル | 内容 |
|---|---|
| `index.html` | ローディング演出 → ヒーロー（ken-burns＋粒子＋巨大英字）→ 理念 → サービス（ホバーで画像追従）→ 実績（縦スクロールで横に流れる）→ 数字 → ニュース → 巨大CTA |
| `about.html` | 代表メッセージ・メンバー（ホバーでカラー化）・会社概要テーブル |
| `service.html` | ジグザグのサービス紹介・背景色が暗転するプロセス |
| `contact.html` | ラジオのピル型選択・下線フォーム・送信で chime＋紙吹雪 |
| `main.js` | ローディング（初回のみ）/ ページ遷移カーテン（whoosh）/ 全画面メニュー（円形展開）/ スクロールでヘッダー隠す / 背景色変化 / 画像追従 / 横スクロール |

ページを増やすときは `about.html` を複製し、`<header>`〜`<footer>` を維持して `<main>` だけ差し替える。
レシピの `sitemap` に合わせてナビ（`.hd__nav` と `.overlay`）も更新する。

## プロの基準

1. **情報設計が先**：サイトマップ → 各ページのワイヤー（見出しだけの構成）→ デザイン。クライアントに構成で合意を取ってから装飾する。
2. **トップは「目次」ではなく「名刺」**：最初の1画面でブランドの空気感を伝え、主要ページへの入口を3〜5個に絞る。
3. **一貫性**：見出しの型（英字ラベル＋和文）、ボタン、余白、写真のトーンを全ページで統一。
4. **お問い合わせまで3クリック以内**。電話番号はスマホでタップ発信（`tel:`）。
5. **SEO基礎**：ページ固有の title/description、h1は1つ、OGP、構造化データ（LocalBusiness/Organization）、パンくず、sitemap.xml。
6. **更新しやすさ**：ニュース・実績はクライアントが更新する前提。必要なら WordPress / microCMS / STUDIO / Wix への移植を提案。
7. **表示速度とCLS**：画像に width/height、WebP、フォントは `display=swap`。
8. **アクセシビリティ**：キーボードでメニュー操作可能、`aria-current`、フォーカス表示。

## 高度に見せる演出（Awwwards系サイトの定番）

- ローディング → ロゴ → メインビジュアル（`.loader` + `jingle` 音も可）
- 巨大英字タイポ＋1文字ずつ回転して出現（`data-split data-split-style="rotate"`）
- `mix-blend-mode: difference` のヘッダー（背景が写真でも白でも読める）
- カスタムカーソル（`<body data-cursor>`）、マグネティックボタン
- 横スクロールの実績ギャラリー、ホバーで画像がカーソル追従
- スクロールでページ背景が暗転（`data-bg="dark"`）
- ページ遷移カーテン（`.curtain`）＋ whoosh 音
- フッターの巨大ロゴタイプ、「Let’s talk →」の巨大CTA

## 納品物

- サイト一式（`shared/` 同梱）／ PC・SPのフルページ画像 ／ `README.txt`（更新方法・フォーム設定・サーバーへのアップ方法）
- 必要に応じて `sitemap.xml`・`robots.txt`・`ogp.png`（`templates/../01-banner-sns/sns-post` で `?size=1200x630` から作れる）
