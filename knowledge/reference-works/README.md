# 参考作品カタログ（実在の高評価作品の研究ノート）

> 収集: 2026年10月 Web検索。受賞・評価は各出典ページの記載に基づく。デザインの詳細は必ず実物で確認すること。
> 作品の画像・コード・文章は収録していません。URL・受賞歴などの事実と、そこから学べる設計の考え方だけを記録しています。
> **そのまま真似せず**、`apply`（案件への応用）に沿ってクライアント固有の要素に置き換えて使ってください。

使い方: `node tools/works.mjs --genre lp` で一覧、`node tools/works.mjs --id REF-LP-001` で詳細、`node tools/new-project.mjs ... --work REF-LP-001` で案件の指示書に組み込み。

| 記号 | 意味 |
|---|---|
| ✅ | 出典でデザインの特徴まで確認済み |
| 🔎 | 受賞・存在のみ確認。デザインの詳細は実物を開いて研究が必要 |

## Webサイト・ホームページ

### ✅ REF-WEB-001 Lando Norris 公式サイト

- **制作**: OFF+BRAND（グラスゴー）
- **URL**: https://landonorris.com/
- **評価**: Awwwards Site of the Year 2025 ／ Site of the Year – Users’ Choice（SOTD評価 8.18/10）／ DesignRush Best Website Design（2026年4月）
- **確認できた事実**:
  - F1ドライバー ランド・ノリスのパーソナルブランド拠点（レース結果・パートナー・グッズ・オフトラックのコンテンツ）
  - 配色は4色：#CBF902（ネオンイエローグリーン）/ #2D3126 / #F4F3F1 / #7F8177（DesignRush掲載）
  - ネオンのアクセントはヘルメットのデザインから引用
  - 「On Track（レース）」と「Off Track（カルチャー）」を分けたモジュール型レイアウト
  - ヒーロー画像上でカーソルに反応して動くブロブ状のオーバーレイ
- **学べる設計パターン**:
  - 本人・商品の「象徴物」（ここではヘルメット）から1色だけ抜き出し、ネオン級の彩度でアクセントに使う
  - ほぼ無彩色（墨緑・オフホワイト・グレー）＋ネオン1色の4色構成で、派手さと高級感を両立
  - コンテンツを2つの世界観（仕事/プライベート、On/Off）に分けてナビゲーションを明快にする
  - 静止画ヒーローでも、カーソル反応のオーバーレイで「触れる」体験にできる
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `cursor-follow` `magnetic` `split-text` `marquee` ／ 音 `impact` `whoosh` ／ 背景 `cursor-blobs`
- **案件への応用**: クライアントの象徴物（ロゴ・制服・商品パッケージ）から1色を抽出→彩度を上げてアクセントに。ベースは無彩色3色。ヒーローに <canvas data-gfx="cursor-blobs"> を敷く。アスリート・ジム・ブランド個人サイト向き。
- **出典**: <https://www.awwwards.com/sites/lando-norris> <https://designrush.com/best-designs/websites/lando-norris-website-design> <https://news.designrush.com/designrush-design-award-winners-april-2026>

### ✅ REF-WEB-002 Messenger

- **制作**: abeto
- **URL**: https://messenger.abeto.co/
- **評価**: Awwwards Developer Site of the Year 2025（SOTD評価 7.92/10）
- **確認できた事実**:
  - ブラウザ内でリアルタイムに回転する小さなWebGLの惑星を描く体験型サイト（第三者レビューの記述）
  - 開発（Developer）部門の年間最優秀賞
- **学べる設計パターン**:
  - 1つの「小さな世界」を主役にして、ユーザーが探索したくなる体験を作る
  - 情報量を絞り、インタラクションそのものをコンテンツにする
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `tilt-3d` `float` ／ 音 `chime` `sparkle` ／ 背景 `constellation`
- **案件への応用**: キャンペーンサイトや採用サイトで「会社の世界観を1つのミニチュア世界」として表現する発想に使う。本格的な3Dが無理なら、イラスト＋tilt-3d＋floatで「小さな世界」を作る。
- **出典**: <https://www.awwwards.com/sites/messenger> <https://www.awwwards.com/annual-awards/winners> <https://futurists.in/10-best-award-winning-websites-of-2026/>

### ✅ REF-WEB-003 Igloo Inc

- **制作**: Bureaux 他（Awwwardsケーススタディ）
- **URL**: https://www.igloo.inc/
- **評価**: Awwwards Site of the Year 2024 ／ Developer Award ／ Business & Services Honors（2024年7月）
- **確認できた事実**:
  - Pudgy Penguins の親会社 Igloo Inc. のランディングページ
  - 目的は、ブランドらしさを保ちながら、スクロールで移動できるナビゲーションでポートフォリオを見せること
  - テクニカルアーティストがコードと3Dアートをブラウザ上で一緒に制作
  - コミュニティでは「低スペック端末でも軽快」な点が最も評価された
- **学べる設計パターン**:
  - スクロールそのものをナビゲーションにする（ページ遷移なしで事業を順番に見せる）
  - 演出がリッチでも、低スペック端末での軽さを最優先にする
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `sticky-scrub` `horizontal-scroll` `scroll-progress` ／ 音 `whoosh` ／ 背景 `snow`
- **案件への応用**: 事業が3〜5個ある会社のトップで、section[data-pin] のスクロール連動で事業を1つずつ見せる。モバイルでは演出を間引く（reduced-motion・画面外停止は shared が対応済み）。
- **出典**: <https://awwwards.com/igloo-inc-case-study.html> <https://www.awwwards.com/du-haihang/collections/webgl-animations/>

### ✅ REF-WEB-004 Dropbox Brand（ブランドガイドラインサイト）

- **制作**: Daybreak Studio × Dropbox Brand Studio
- **URL**: https://brand.dropbox.com/
- **評価**: Awwwards Site of the Month 2025年2月
- **確認できた事実**:
  - Webflow（構造）＋ Rive（インタラクティブアニメーション）で制作
  - Variable Type Explorer：独自書体のバリエーションをボタンで試せる
  - Icon Slot Machine：アイコンのスタイルをスロット感覚で組み合わせられる
  - 「堅くて静的なガイドライン」から「わかりやすいストーリー」への転換が目的
  - 印象的な機能の多くは当初の要件になく、開発中に生まれた
- **学べる設計パターン**:
  - ルールや仕様（＝退屈になりがちな情報）を「触って遊べるおもちゃ」にすると記憶に残る
  - ブランドの要素（書体・アイコン・色）を見せるのではなく、ユーザーに操作させる
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `tilt-3d` `pop` `split-text` ／ 音 `coin` `toggle` `click` ／ 背景 —
- **案件への応用**: デザイン納品時に「ブランドガイド（ミニサイト）」をオプション提案する。tokens.css の色・書体をスライダーやボタンで切り替えて見せる小さなプレイグラウンドを付けると単価が上がる。
- **出典**: <https://www.awwwards.com/case-study-dropbox-brand-guidelines.html> <https://creativebloq.com/design/dropboxs-new-brand-identity-website-puts-boring-style-guides-to-shame> <https://rive.app/blog/dropbox-launches-interactive-brand-guidelines-site-using-rive> <https://designcompass.org/en/2025/01/21/dropbox-brand-website-renewal/>

### 🔎 REF-WEB-005 Immersive Garden 公式サイト

- **制作**: Immersive Garden
- **URL**: https://immersive-g.com/
- **評価**: Awwwards Site of the Month 2025年1月（同社は2025年6月 Montfort、8月 Cartier でもSOTM）
- **確認できた事実**:
  - 2025年に3度Site of the Monthを受賞した制作会社（自社サイト・Montfort・Cartier Watches & Wonders 2025）
- **学べる設計パターン**:
  - 同じ制作会社が高級ブランド案件と自社サイトの両方で評価されている＝「高級感の演出」の研究対象として最適
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `blur-in` `mask-wipe` `ken-burns` `cursor-follow` ／ 音 `soft-bell` ／ 背景 `bokeh`
- **案件への応用**: 高級・ラグジュアリー系案件の前に、同社の3作品で「動きの速さ・余白・写真の扱い」を観察してから着手する。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-006 Cartier Watches & Wonders 2025

- **制作**: Immersive Garden
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年8月
- **確認できた事実**:
  - 高級時計ブランドの展示会向けサイトとして月間最優秀に選出
- **学べる設計パターン**:
  - ハイブランドの「商品1点を主役にする」見せ方の研究対象
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `blur-in` `sticky-scrub` `shine-sweep` ／ 音 `soft-bell` `chime` ／ 背景 `particles`
- **案件への応用**: 高級商材LPで、商品写真1点をスクロールに合わせて拡大・回転させる（sticky-scrub）。文字は最小限、余白は通常の1.5倍。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-007 Montfort

- **制作**: Immersive Garden
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年6月
- **確認できた事実**:
  - 2025年6月の月間最優秀サイト
- **学べる設計パターン**:
  - 実物を開いて、写真の切り替え・ページ遷移の演出を研究する
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `mask-wipe` `parallax` ／ 音 `page-turn` ／ 背景 —
- **案件への応用**: 研究メモをとってから taxonomy に追加する（詳細未確認）。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-008 Siena Film Foundation

- **制作**: Niccolò Miranda
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年3月
- **確認できた事実**:
  - 映画財団のサイト。個人デザイナーによる制作で月間最優秀を受賞
- **学べる設計パターン**:
  - 個人制作でも世界最高評価が取れる例。映画・文化系のエディトリアル表現の研究対象
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `letterbox-open` `split-text` `grain` ／ 音 `riser` ／ 背景 —
- **案件への応用**: 映画・映像・イベント系案件で、黒帯（letterbox）と字幕風テキスト、フィルムグレインで「映画らしさ」を作る。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-009 Navigate

- **制作**: Resn
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年4月（Resnは7月 Tracing Art でも受賞）
- **確認できた事実**:
  - 2025年に2度Site of the Monthを受賞した制作会社 Resn の作品
- **学べる設計パターン**:
  - 体験型・ストーリーテリング型サイトの研究対象
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `sticky-scrub` `parallax` ／ 音 `whoosh` `riser` ／ 背景 `waves`
- **案件への応用**: 実物で「スクロールに合わせて物語が進む構成」を観察し、LPのストーリー（PASTOR/StoryBrand）構成に応用する。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-010 Tracing Art

- **制作**: Resn
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年7月
- **確認できた事実**:
  - 2025年7月の月間最優秀サイト
- **学べる設計パターン**:
  - アート・文化系の体験設計の研究対象
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `line-draw` `parallax` ／ 音 `page-turn` ／ 背景 —
- **案件への応用**: 美術館・ギャラリー・作家サイトで、SVGの線が描かれる（line-draw）演出を「なぞる」体験として使う。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-011 Anime.js 公式サイト

- **制作**: Julian Garnier
- **URL**: https://animejs.com/
- **評価**: Awwwards Site of the Month 2025年5月
- **確認できた事実**:
  - JavaScriptアニメーションライブラリの公式サイト。作者本人の制作で月間最優秀
- **学べる設計パターン**:
  - プロダクト（ここではアニメーションライブラリ）の能力を、サイト自体の動きで証明する＝「説明せずに見せる」
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `stagger` `split-text` `shape-morph` `typewriter` ／ 音 `tick` `click` ／ 背景 —
- **案件への応用**: SaaS・開発者向けツールのLPでは、機能を文章で説明する前にFVで実際に動かして見せる。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-012 Terminal Industries

- **制作**: REJOUICE
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年9月
- **確認できた事実**:
  - 2025年9月の月間最優秀サイト（BtoB・産業系企業）
- **学べる設計パターン**:
  - 堅い産業系BtoBでも最高評価のデザインが成立する例
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `counter-up` `sticky-scrub` `line-draw` ／ 音 `click` `unlock` ／ 背景 `constellation`
- **案件への応用**: 物流・製造・インフラ系の案件で「地味な業界こそダーク＋精密な動き」で先進性を見せる提案に使う。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-013 Ponpon Mania

- **制作**: Patrick Heng
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年10月
- **確認できた事実**:
  - 2025年10月の月間最優秀サイト
- **学べる設計パターン**:
  - ポップ・遊び心系の表現の研究対象
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `pop` `bounce` `wiggle` `confetti` ／ 音 `pop` `bubble` `coin` ／ 背景 `particles`
- **案件への応用**: キッズ・ゲーム・キャラクター系案件で、弾む動きと効果音をセットで使う。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### 🔎 REF-WEB-014 MindMarket

- **制作**: Louis Paquet
- **URL**: https://www.awwwards.com/websites/sites_of_the_month/
- **評価**: Awwwards Site of the Month 2025年12月
- **確認できた事実**:
  - 2025年12月の月間最優秀サイト
- **学べる設計パターン**:
  - 実物で研究が必要
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `split-text` `parallax` ／ 音 `tick` ／ 背景 `mesh`
- **案件への応用**: 研究メモをとってから taxonomy に追加する（詳細未確認）。
- **出典**: <https://www.awwwards.com/websites/sites_of_the_month/>

### ✅ REF-WEB-015 The Shift

- **制作**: Garden Eight（東京）
- **URL**: https://garden-eight.com/cases/the-shift/
- **評価**: Awwwards Site of the Month（2021年10月）／ SOTD ／ FWA FOTD ／ CSS Design Awards WOTD
- **確認できた事実**:
  - 東京のデザインプラットフォーム The Shift のリニューアル
  - 関連会社 aircord のサイトと「対照的でありながらつながりを保つ」デザインが求められた
  - 制作会社 Garden Eight の作風は「ミニマルでクリーン、イラストを生かした語り口」（第三者評）
  - Garden Eight は Awwwards で SOTD 18回（日本拠点の制作会社で最多クラス）
- **学べる設計パターン**:
  - 関連会社・姉妹ブランドがある案件では「対比しつつ共通項を持たせる」設計（色は反転、書体やグリッドは共通 など）
  - 日本の制作会社が世界で評価される型＝ミニマル＋イラスト＋丁寧な動き
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `clip-up` `line-draw` `fade-up` `image-hover-zoom` ／ 音 `tick` `soft-bell` ／ 背景 —
- **案件への応用**: グループ会社・姉妹店のサイトでは、tokens.css の primary と bg を入れ替えた「対の配色」を作り、グリッドと書体は共通化する。
- **出典**: <https://www.awwwards.com/sites/the-shift> <https://garden-eight.com/cases/the-shift/> <https://www.utsubo.com/blog/best-japanese-web-design-studios-2026>

### 🔎 REF-WEB-016 SOIL

- **制作**: （日本・Awwwards掲載）
- **URL**: https://www.awwwards.com/websites/Japan/?page=3
- **評価**: Awwwards Site of the Day 2025年11月7日 ／ Developer Award
- **確認できた事実**:
  - 2025年に日本から SOTD と Developer Award を受賞
- **学べる設計パターン**:
  - 最新の日本の受賞作として、実装（動き）のレベル感を確認する対象
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `parallax` `clip-up` ／ 音 `drop` ／ 背景 `waves`
- **案件への応用**: 実物で研究してからメモを追記する。
- **出典**: <https://www.awwwards.com/websites/Japan/?page=3>

### 🔎 REF-WEB-017 Layrid

- **制作**: （日本・Awwwards掲載）
- **URL**: https://www.awwwards.com/websites/Japan/?page=3
- **評価**: Awwwards Site of the Day 2025年10月10日 ／ Developer Award
- **確認できた事実**:
  - 2025年に日本から SOTD と Developer Award を受賞
- **学べる設計パターン**:
  - 同上
- **キットで再現する部品**: テンプレート `corporate` ／ 動き `sticky-scrub` ／ 音 `click` ／ 背景 —
- **案件への応用**: 実物で研究してからメモを追記する。
- **出典**: <https://www.awwwards.com/websites/Japan/?page=3>

### ✅ REF-WEB-018 Apple 製品ページ（AirPods Pro / iPhone）

- **制作**: Apple
- **URL**: https://www.apple.com/jp/airpods-pro/
- **評価**: 「スクロールテリング」の代表例として多数の技術解説記事で分析されている
- **確認できた事実**:
  - スクロール位置がアニメーションの状態を直接決める（下スクロールで文字が上へフェード、映像が縮小。上スクロールで逆再生）
  - transform（translateY / scale）をスクロール量に比例させ、requestAnimationFrame で滑らかに
  - AirPods Pro では、決められた区間で製品が回転・分解する。文字は少なく、主役は製品1つ
  - 固定レイアウト＋スクロール進捗＋重なったビジュアル＋タイミングの良い変形の組み合わせ
  - reduced-motion の代替、GPUに優しいアニメーション、画像読み込み戦略、モバイルの簡略化が重要
- **学べる設計パターン**:
  - 「1区間＝1メッセージ＝1つの動き」で、言葉を減らして製品に語らせる
  - スクロールを「再生バー」として使う（戻れば巻き戻る）
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `sticky-scrub` `scroll-progress` `blur-in` ／ 音 — ／ 背景 —
- **案件への応用**: LPのFV直後に section[data-pin] を1つ置き、var(--p) で商品画像の scale/rotate と見出しのopacityを制御。スマホでは高さを短くする。
- **出典**: <https://css-tricks.com/?p=308477> <https://dev.to/easyoon_ec43e8d635f9a3fbb/translations-analyzing-apple-website-animation-1scrolling-synchronization-3m65> <https://theplusaddons.com/blog/scrollytelling.md>

## LP（ランディングページ）

### ✅ REF-LP-001 Linear（ランディングページ）

- **制作**: Linear
- **URL**: https://linear.app/
- **評価**: SaaS LPの手本として多数のデザイン分析記事で紹介
- **確認できた事実**:
  - ダークテーマ
  - 製品を「説明」せず、実際のUIスクリーンショットで「見せる」
  - サインアップは業務用メールアドレスのみ（入力項目が最小）
- **学べる設計パターン**:
  - FVの主役は「本物の製品画面」。イラストや抽象画像より信頼される
  - フォームの項目を極限まで減らす（1項目）
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `blur-in` `tilt-3d` `gradient-shift` ／ 音 `click` `notify` ／ 背景 `mesh`
- **案件への応用**: SaaS・アプリ案件では、FVのスマホモック（.phone）に実際の画面キャプチャを入れる。フォームはメール1項目＋送信にできないか必ず検討する。
- **出典**: <https://adminlte.io/blog/saas-landing-page-design-examples/> <https://www.overpass.studio/blog/best-saas-landing-pages> <https://framiq.app/blog/best-saas-landing-pages-2026>

### ✅ REF-LP-002 Stripe（トップページ）

- **制作**: Stripe
- **URL**: https://stripe.com/
- **評価**: SaaS LPの手本として多数のデザイン分析記事で紹介
- **確認できた事実**:
  - ヒーローは短いフレーズではなく、説明的な1文
  - 開発者と財務責任者という異なる読み手に同時に語りかける
  - 各読み手が独立して流し読みできる「コンテンツゾーン」にページを分割
- **学べる設計パターン**:
  - 読み手が複数いる商材（例：現場担当と決裁者）は、セクションを「誰向けか」で分ける
  - キャッチは抽象的な一言より、何ができるかが分かる1文の方が強い場合がある
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `fade-up` `stagger` `counter-up` `gradient-shift` ／ 音 `tick` ／ 背景 `mesh`
- **案件への応用**: BtoB案件では「担当者の方へ」「経営者の方へ」のようにセクション見出しで読み手を明示し、それぞれにCTAを置く。
- **出典**: <https://adminlte.io/blog/saas-landing-page-design-examples/> <https://toimi.pro/blog/best-saas-website-designs/>

### ✅ REF-LP-003 Vercel（トップページ）

- **制作**: Vercel
- **URL**: https://vercel.com/
- **評価**: SaaS LPの手本として多数のデザイン分析記事で紹介
- **確認できた事実**:
  - 徹底したミニマリズム：非常に短い見出し＋認知されたブランド
  - ダークでターミナル風のビジュアルが開発者という読み手に合っている
  - ヒーローにアニメーショングラデーションとコード断片、デプロイのプレビュー（1記事の記述）
- **学べる設計パターン**:
  - 読み手の「仕事道具」の見た目（開発者ならターミナル）をビジュアル言語に使う
  - 見出しは短く、ビジュアルで補う
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `typewriter` `gradient-shift` `glow-border` ／ 音 `typing` `success` ／ 背景 `constellation`
- **案件への応用**: ターゲットが毎日見ている画面（レジ・カルテ・エクセル・LINE）を模したUIをFVに置くと「自分ごと」になる。data-typewriter data-sfx-type で入力されていく様子を見せる。
- **出典**: <https://adminlte.io/blog/saas-landing-page-design-examples/> <https://gridrebels.studio/post/20-best-saas-website-designs-in-2026-examples-that-actually-convert>

### ✅ REF-LP-004 美容・健康食品・サプリの「悩み解決型」LP群

- **制作**: 国内各社（LPアーカイブ掲載：美容2,823件・サプリ1,518件）
- **URL**: https://rdlp.jp/lp-archive/search?sa=%E3%82%B5%E3%83%97%E3%83%AA
- **評価**: 国内最大級のLPギャラリーに多数掲載されている定番ジャンル
- **確認できた事実**:
  - 2025年の傾向：悩み解決型の商材には「広告に見えない（ノン広告風）」デザインが合う
  - PCでは縦長1カラムから3カラム配置への移行も見られる
  - サプリLPの例（キリン）：FVに数値や「世界初」などの文言を置いて訴求
- **学べる設計パターン**:
  - 広告っぽい派手さを抑え、記事・雑誌のような見た目で信頼を得る（エディトリアル風LP）
  - FVの数字は最大の武器。ただし根拠（調査・期間）を必ず注記
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `fade-up` `counter-up` `clip-up` ／ 音 `soft-bell` `success` ／ 背景 —
- **案件への応用**: スタイル「エディトリアル」のレシピを選び、FVを記事風（日付・著者・見出し）にする。数値は data-counter で強調し、近くに※注記。薬機法表現に注意（knowledge/copywriting.md）。
- **出典**: <https://note.com/ynp0419/n/n174c2988e6bd> <https://x-buzz.co.jp/lp/blog-lp/5273/> <https://rdlp.jp/lp-archive/search?sa=%E7%BE%8E%E5%AE%B9>

### ✅ REF-LP-005 医療脱毛LP（FVで「医療×実績」）

- **制作**: 国内事例（分析記事経由）
- **URL**: https://break-marketing-program.jp/blog/2025/06/06/landing-page-example/
- **評価**: LPデザイン事例25選（2025年版・分析付き）で紹介
- **確認できた事実**:
  - FVで「医療」と「実績」を前面に出して信頼感を作る
- **学べる設計パターン**:
  - 美容系でも「医療・専門家・実績数」を組み合わせると価格以外で選ばれる
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `counter-up` `fade-up` ／ 音 `success` ／ 背景 —
- **案件への応用**: クリニック・サロン案件のFVに「資格・実績数・院数」を3つのバッジで並べる（.float-badge を流用）。医療広告ガイドラインに注意。
- **出典**: <https://break-marketing-program.jp/blog/2025/06/06/landing-page-example/>

### ✅ REF-LP-006 営業DX支援のBtoB LP（動画FV）

- **制作**: 国内事例（分析記事経由）
- **URL**: https://conversion-labo.jp/report/lp_design/12973/
- **評価**: LPファーストビューのデザイン事例として分析
- **確認できた事実**:
  - FVで「組織が動く様子」を動画で見せる
  - 言葉はサービス内容を端的に伝える役割に絞る（動画と文言の役割分担）
- **学べる設計パターン**:
  - FVは「映像＝感情・変化」「言葉＝何のサービスか」と役割を分ける
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `letterbox-open` `split-text` ／ 音 — ／ 背景 —
- **案件への応用**: 背景に muted playsinline loop の短い動画（5〜10秒）を置き、キャッチは20字以内で「何の会社か」だけを言う。
- **出典**: <https://conversion-labo.jp/report/lp_design/12973/>

### ✅ REF-LP-007 冷蔵車レンタルLP（強み×対象者を明示）

- **制作**: 国内事例（分析記事経由）
- **URL**: https://mk-design.jp.net/2025/07/08/lp-firstview-design/
- **評価**: 成果を出すLPデザイン実例（2025年7月）で紹介
- **確認できた事実**:
  - キャッチコピーで「強み」と「対象者」を明示
  - CTAは視線が流れる位置に配置
- **学べる設計パターン**:
  - ニッチなBtoBほど「誰のための何か」を1行目で言い切る
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `fade-up` `pulse` ／ 音 `click` ／ 背景 —
- **案件への応用**: キャッチの型「【対象者】のための【強み】」（DBの first_view.copy_formula）をそのまま使い、CTAはZ型視線の終点（右下）に。
- **出典**: <https://mk-design.jp.net/2025/07/08/lp-firstview-design/>

### ✅ REF-LP-008 教育ローンLP（利用シーンのFVで申込116%）

- **制作**: Kaizen Platform 事例
- **URL**: https://kaizenplatform.com/contents/first-view
- **評価**: ABテストでの改善事例
- **確認できた事実**:
  - FVに「利用シーンが分かるビジュアル」を置いたところ、LPからの申込数が116%に増加
- **学べる設計パターン**:
  - 金融・手続き系は商品説明より「使っている自分」を想像させるビジュアルが効く
- **キットで再現する部品**: テンプレート `lp-standard` ／ 動き `clip-up` `fade-up` ／ 音 — ／ 背景 —
- **案件への応用**: 保険・ローン・士業など形のない商品は、FV写真を「サービスを受けた後の生活シーン」にする。
- **出典**: <https://kaizenplatform.com/contents/first-view>

## バナー・サムネイル・SNS画像

### ✅ REF-BNR-001 MrBeast のYouTubeサムネイル

- **制作**: MrBeast チャンネル
- **URL**: https://www.youtube.com/@MrBeast
- **評価**: 世界最大級のYouTubeチャンネル。サムネイル手法が多数分析されている
- **確認できた事実**:
  - 大げさな表情の顔（驚き・口を開ける）、カメラ目線
  - 高コントラスト・高彩度（ライト/ダーク両方のフィードで目立つ）
  - 文字は最小限で太く、黄色か赤
  - 何の動画か一瞬で分かる明確な被写体と「賭け金」（大金・危険・巨大な物）
  - 1本につき10〜20案を作ってテストする（二次情報）
- **学べる設計パターン**:
  - 顔・文字・被写体の3要素だけ。背景はシンプルに
  - 「この後どうなる？」という好奇心のすき間を作る
  - 1案で決めず、必ず複数案を作って比較する
- **キットで再現する部品**: テンプレート `youtube-thumbnail` ／ 動き — ／ 音 — ／ 背景 —
- **案件への応用**: youtube-thumbnail テンプレートで v=1 と v=2 の2案＋配色違いを必ず作って提案。CTR数値は公式データではないので提案書に断定的に書かない。
- **出典**: <https://mainframe.pixelhaze.academy/understanding-mrbeasts-effective-thumbnail-design-strategies/> <https://www.youthumb.ai/en/blog/mrbeast-thumbnail-secrets-100m-views> <https://blog.bananathumbnail.com/steal-this-how-mrbeast-mkbhd-and-top-creators-desi/>

### ✅ REF-BNR-002 Bluestep Bank のHTML5バナー（ドラッグ操作）

- **制作**: Bluestep Bank（Bannerflow事例）
- **URL**: https://www.bannerflow.com/blog/display-advertising-best-banner-ads
- **評価**: ディスプレイ広告の優良事例として紹介
- **確認できた事実**:
  - ドラッグ&ドロップできるHTML5ウィジェットをバナー内に組み込んだ
- **学べる設計パターン**:
  - バナーを「見る」から「触る」に変えると、金融のような地味な商材でも反応が上がる
- **キットで再現する部品**: テンプレート `display-banner` ／ 動き `ripple` ／ 音 `tick` `coin` ／ 背景 —
- **案件への応用**: ローン・保険のバナーで「スライダーを動かすと月々の支払いが変わる」ミニシミュレーターをHTML5バナーとして提案（LPテンプレートのBAスライダーの仕組みを流用）。
- **出典**: <https://www.bannerflow.com/blog/display-advertising-best-banner-ads>

### ✅ REF-BNR-003 Storytel のオーディオブック広告（音波アニメーション）

- **制作**: Storytel（Bannerflow事例）
- **URL**: https://www.bannerflow.com/blog/display-advertising-best-banner-ads
- **評価**: ディスプレイ広告の優良事例として紹介
- **確認できた事実**:
  - 控えめな音波（サウンドウェーブ）のアニメーションで「音のサービス」を表現
- **学べる設計パターン**:
  - 商品の「感覚」（音・香り・味）を、さりげないループアニメーションで視覚化する
- **キットで再現する部品**: テンプレート `display-banner` ／ 動き `wave` `float` ／ 音 `soft-bell` ／ 背景 `waves`
- **案件への応用**: 音楽教室・ポッドキャスト・カフェ（湯気）などで、背景に <canvas data-gfx="waves"> を薄く敷く。
- **出典**: <https://www.bannerflow.com/blog/display-advertising-best-banner-ads>

### ✅ REF-BNR-004 Netflix のリッチメディアバナー

- **制作**: Netflix（BannerBoo事例）
- **URL**: https://bannerboo.com/blog/html5-banner-examples/
- **評価**: HTML5バナーの優良事例として紹介
- **確認できた事実**:
  - ユーザーの操作に反応するリッチメディアバナー
- **学べる設計パターン**:
  - ホバー・クリックで中身が変わるバナーは、静止バナーより情報量を増やせる
- **キットで再現する部品**: テンプレート `display-banner` ／ 動き `tilt-3d` `shine-sweep` ／ 音 `click` ／ 背景 —
- **案件への応用**: 作品・メニューが複数ある案件で、ホバーで切り替わるHTML5バナーを提案する。
- **出典**: <https://bannerboo.com/blog/html5-banner-examples/>

### ✅ REF-BNR-005 Lingoda のHTML5バナー（SVG線描＋CSS）

- **制作**: Lingoda（AGCS Works制作事例）
- **URL**: https://www.agcs.works/html5-banners/banner-examples/
- **評価**: HTML5バナー制作事例
- **確認できた事実**:
  - SVGの線を描くアニメーションとCSSアニメーションの組み合わせ
- **学べる設計パターン**:
  - 軽量（SVG＋CSS）で150KB制限内でもリッチに見せられる
- **キットで再現する部品**: テンプレート `display-banner` ／ 動き `line-draw` `fade-up` ／ 音 — ／ 背景 —
- **案件への応用**: GIFが150KBを超える案件は、HTML5バナー（SVG＋CSS）で納品し、data-line-draw で線画を描かせる。
- **出典**: <https://www.agcs.works/html5-banners/banner-examples/> <https://www.agcs.works/blog/create-amazing-html5-banners-ads/>

### ✅ REF-BNR-006 バナー広告の一貫した勝ちパターン（10キャンペーン分析）

- **制作**: Bannersnack 分析記事
- **URL**: https://www.bannersnack.com/blog/banner-ad-examples-that-actually-work
- **評価**: 実キャンペーン10件の分析
- **確認できた事実**:
  - 最も一貫したテクニックは「1色をCTA専用にする」こと
  - HTML5バナーの平均CTR 0.44% に対し静止バナー 0.12%（Predis.ai 2025 引用の記事）
  - Google広告はファイル150KB以下・アニメーション30秒以内
- **学べる設計パターン**:
  - アクセント色はCTAボタンにしか使わない（本キットの70:25:5ルールと一致）
  - 可能ならHTML5（アニメーション）で作る
- **キットで再現する部品**: テンプレート `display-banner` ／ 動き `pulse` `shine-sweep` ／ 音 — ／ 背景 —
- **案件への応用**: tokens.css の --c-accent をCTA以外で使っていないか確認してから納品。
- **出典**: <https://www.bannersnack.com/blog/banner-ad-examples-that-actually-work> <https://www.abyssale.com/blog/best-display-ads>

### ✅ REF-BNR-007 Instagramカルーセルの定番フォーマット

- **制作**: Sked Social 分析記事
- **URL**: https://skedsocial.com/blog/creative-ways-to-use-instagram-carousels-in-2025
- **評価**: 2025年のカルーセル活用法
- **確認できた事実**:
  - 「誤解vs事実」型：教育・ウェルネス・金融・マーケティング向き
  - 「間違い探し」型：ファッション・インテリア・デザインなどビジュアルが強いブランド向き
  - ビフォーアフター型：サロン・清掃・リノベーション向き
  - ステップ解説型：DIY・フィットネス・美容・テック向き
- **学べる設計パターン**:
  - 業種ごとに「保存されやすい型」が決まっている。1枚目で型を宣言する
- **キットで再現する部品**: テンプレート `sns-post` ／ 動き `split-text` `pop` ／ 音 `pop` `whoosh` ／ 背景 `mesh`
- **案件への応用**: sns-post テンプレートの slide=2（リスト）を「誤解→事実」「STEP1〜5」に書き換えて使う。
- **出典**: <https://skedsocial.com/blog/creative-ways-to-use-instagram-carousels-in-2025>

### ✅ REF-BNR-008 国内バナーデザインの2025年トレンド

- **制作**: 国内デザイン会社のコラム群
- **URL**: https://imitsu.jp/matome/hp-design/banner-design-fashion
- **評価**: トレンド解説記事
- **確認できた事実**:
  - レトロ要素（ビンテージ配色・大胆なタイポ・昔のコンピュータの美学）の再評価
  - ポストミニマリズム：シンプルな構成に曲線やグラデーションで温かみ
  - マーカー風の文字装飾
  - 動くタイポグラフィ
  - TikTok・リールの普及で縦型バナーが重要に
  - Bannnner.com は掲載数を絞り品質の高いバナーを厳選
- **学べる設計パターン**:
  - 「シンプル＋1つの温かみ（曲線・グラデ・マーカー）」が今の日本のバナーの基本形
- **キットで再現する部品**: テンプレート `display-banner` ／ 動き `split-text` `gradient-shift` `blob-morph` ／ 音 — ／ 背景 `mesh`
- **案件への応用**: 縦型（1080×1920）を必ずセットで提案。文字装飾は .marker（マーカー）を使う。
- **出典**: <https://imitsu.jp/matome/hp-design/banner-design-fashion> <https://planning-a.jp/column/1586537/> <https://rotusdesign.com/2024/12/19/2025%E5%B9%B4%E6%9C%80%E6%96%B0%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%88%E3%83%AC%E3%83%B3%E3%83%89%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3%E3%83%83%E3%82%AF%E3%83%87%E3%82%B6%E3%82%A4/> <https://marketingone.co.jp/vertical-ad-design-latest-trends-2025/>

## UI/UXデザイン

### ✅ REF-UI-001 Apple Design Awards 2025 受賞アプリ

- **制作**: CapWords / Play / Taobao / Speechify / Watch Duty / Feather 他
- **URL**: https://developer.apple.com/design/awards/
- **評価**: Apple Design Awards 2025（6部門×アプリ・ゲーム 計12作品）
- **確認できた事実**:
  - Delight and Fun：CapWords（アプリ）/ Balatro（ゲーム）
  - Innovation：Play / PBJ – The Musical
  - Interaction：Taobao / DREDGE
  - Inclusivity：Speechify / Art of Fauna
  - Social Impact：Watch Duty / Neva
  - Visuals and Graphics：Feather: Draw in 3D / Infinity Nikki
  - 受賞作は個人・スタートアップのアプリが中心で、生成AIアプリはほぼ無かった
- **学べる設計パターン**:
  - 評価軸は「楽しさ・革新・操作感・包摂性・社会的意義・ビジュアル」の6つ。UI提案書の評価観点としてそのまま使える
  - 大企業でなくても、1つの体験を磨けば世界最高評価が取れる
- **キットで再現する部品**: テンプレート `app-prototype` ／ 動き `squash-bounce` `pop` `confetti` ／ 音 `pop` `success` `level-up` ／ 背景 —
- **案件への応用**: UI案件の提案書で、6つの観点（Delight/Innovation/Interaction/Inclusivity/Impact/Visuals）ごとに自分の設計の狙いを1行ずつ書く。
- **出典**: <https://techcrunch.com/2025/06/04/apple-names-2025-design-awards-winners> <https://9to5mac.com/2025/06/03/apple-announces-2025-apple-design-award-winners/> <https://www.tomsguide.com/phones/iphones/apple-design-award-2025-winners-announced-apps-and-games-recognized-for-innovation-and-ingenuity>

### ✅ REF-UI-002 Duolingo

- **制作**: Duolingo
- **URL**: https://www.duolingo.com/
- **評価**: ゲーミフィケーションUIの代表例として多数分析。Riveのキャラクターアニメーション事例
- **確認できた事実**:
  - 1問ずつ回答→ポイント・連続記録（streak）・レベル解放・即時フィードバック
  - 最初のレッスン前に、目標・現在のレベル・1日に使える時間を聞く短い質問
  - キャラクターアニメーションに Rive のステートマシンを使用（社内ブログ）
  - アプリ内キャラクターのアニメーションシステム「Maker」で再利用可能なリグを運用
- **学べる設計パターン**:
  - オンボーディングは「質問に答える＝自分専用になる」体験にする
  - 小さな成功ごとに即時フィードバック（音・動き・数字）を返す
  - キャラクターは状態（待機・正解・不正解）ごとに動きを設計する
- **キットで再現する部品**: テンプレート `app-prototype` ／ 動き `pop` `confetti` `squash-bounce` ／ 音 `success` `error` `level-up` `coin` ／ 背景 —
- **案件への応用**: app-prototype のオンボーディング3枚を「質問3つ」に置き換え、回答に応じてホームの内容を変える。正解/不正解で success/error 音と動きをセットに。
- **出典**: <https://riseuplabs.com/ux-design-examples/> <https://www.designstudiouiux.com/blog/mobile-app-design-examples/> <https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life> <https://blog.duolingo.com/world-character-visemes>

### ✅ REF-UI-003 Headspace

- **制作**: Headspace
- **URL**: https://www.headspace.com/
- **評価**: ウェルネスアプリUIの代表例として分析
- **確認できた事実**:
  - 柔らかい青・緑・パステルの背景による落ち着いたビジュアル
  - すぐに瞑想を始められるシンプルなオンボーディング
- **学べる設計パターン**:
  - アプリの「目的の感情」（落ち着き）を配色とスピードで表現する。動きはゆっくり
- **キットで再現する部品**: テンプレート `app-prototype` ／ 動き `float` `blob-morph` `blur-in` ／ 音 `soft-bell` `chime` ／ 背景 `waves`
- **案件への応用**: 医療・ヨガ・睡眠系UIは、モーション時間を通常の1.5倍、効果音は soft-bell のみに絞る。
- **出典**: <https://riseuplabs.com/ux-design-examples/> <https://www.wearetenet.com/blog/ui-ux-design-for-mobile-applications>

### ✅ REF-UI-004 Airbnb

- **制作**: Airbnb
- **URL**: https://www.airbnb.com/
- **評価**: 検索・予約フローの代表例として分析
- **確認できた事実**:
  - 余白・大きな写真・明確なCTAボタン
  - 広い検索→フィルターで絞り込み→地図で探索→詳細を確認→安心して予約、という流れ
- **学べる設計パターン**:
  - 予約系は「広く→絞る→比べる→決める」の4段階を画面の順番に対応させる
- **キットで再現する部品**: テンプレート `app-prototype` ／ 動き `image-hover-zoom` `fade-up` ／ 音 `tick` `success` ／ 背景 —
- **案件への応用**: 予約アプリ（サロン・ホテル・クリニック）の画面遷移図を、この4段階で設計する。
- **出典**: <https://riseuplabs.com/ux-design-examples/> <https://bigredjelly.com/blog/10-inspiring-examples-of-ux-ui-design-done-right/>

### 🔎 REF-UI-005 Revolut

- **制作**: Revolut
- **URL**: https://www.revolut.com/
- **評価**: フィンテックUIの例として分析（言及は少数）
- **確認できた事実**:
  - 強い情報階層で、最重要の情報を最初に見せ、深い操作は必要なときに辿れる
- **学べる設計パターン**:
  - 金融UIは「最重要の1つ」を最初に、残りは段階的開示
- **キットで再現する部品**: テンプレート `app-prototype` ／ 動き `counter-up` `fade-up` ／ 音 `coin` `notify` ／ 背景 —
- **案件への応用**: 家計簿・資産系UIで、ホーム最上部は残高1つだけを大きく。
- **出典**: <https://riseuplabs.com/ux-design-examples/>

### ✅ REF-UI-006 Linear（アプリUI）

- **制作**: Linear
- **URL**: https://linear.app/
- **評価**: ダーク・低装飾なSaaS UIの基準として多数紹介
- **確認できた事実**:
  - ダークファースト・装飾の少ない（low-chrome）デザイン
  - 操作の速さそのものがデザインの一部
  - 行の高さ36px・キーボード中心のナビゲーション
- **学べる設計パターン**:
  - 業務ツールは「速さ」が最大のUX。キーボードショートカットとコマンドパレットを最初から設計する
- **キットで再現する部品**: テンプレート `dashboard` ／ 動き `fade-up` ／ 音 `tick` `click` ／ 背景 —
- **案件への応用**: dashboard テンプレートの ⌘K コマンドパレットを主要操作の入口にし、テーブル行の高さを36pxに。
- **出典**: <https://adminlte.io/blog/saas-dashboard-design-examples/> <https://www.925studios.co/blog/saas-dashboard-design-examples-2026> <https://www.saasui.design/blog/7-saas-ui-design-trends-2026>

### ✅ REF-UI-007 Stripe Dashboard

- **制作**: Stripe
- **URL**: https://dashboard.stripe.com/
- **評価**: KPI・データ表示設計の基準として多数紹介
- **確認できた事実**:
  - 増減（デルタ）付きのKPIカード
  - 意味を持つステータスピル（色付きの状態ラベル）と厳密なカラーシステム
  - トップ画面に売上・取引量・不正請求率
- **学べる設計パターン**:
  - 色は「状態」を表すときだけ使う。装飾には使わない
- **キットで再現する部品**: テンプレート `dashboard` ／ 動き `counter-up` `line-draw` ／ 音 `tick` `notify` ／ 背景 —
- **案件への応用**: dashboard テンプレートの .stage（ステータスピル）と .delta を案件の指標に合わせて定義し、凡例の色を状態専用にする。
- **出典**: <https://adminlte.io/blog/saas-dashboard-design-examples/> <https://www.orbix.studio/blogs/b2b-saas-dashboard-design-examples>

### ✅ REF-UI-008 Vercel Dashboard

- **制作**: Vercel
- **URL**: https://vercel.com/dashboard
- **評価**: 抑制の効いたダッシュボードとして紹介
- **確認できた事実**:
  - メイン画面はデプロイ状況のステータスボード
  - 「必要なデータだけを、ノイズゼロで」
- **学べる設計パターン**:
  - ダッシュボードは「今、対応が必要なこと」を最上位に置く
- **キットで再現する部品**: テンプレート `dashboard` ／ 動き `fade-up` ／ 音 `success` `error` ／ 背景 —
- **案件への応用**: 管理画面のトップに「要対応」リストを置き、KPIはその下に。
- **出典**: <https://adminlte.io/blog/saas-dashboard-design-examples/> <https://www.shaheermalik.com/examples/best-dashboard-designs>

### ✅ REF-UI-009 Mercury

- **制作**: Mercury
- **URL**: https://mercury.com/
- **評価**: フィンテックの信頼感あるダッシュボードとして紹介
- **確認できた事実**:
  - 残高やランウェイなど「1つの数字」を先頭に置いて信頼を得る
  - 編集的（エディトリアル）な洗練が信頼につながる
- **学べる設計パターン**:
  - 金融・BtoBは装飾より「タイポグラフィの美しさ」で信頼を作る
- **キットで再現する部品**: テンプレート `dashboard` ／ 動き `counter-up` `blur-in` ／ 音 `chime` ／ 背景 —
- **案件への応用**: dashboard の KPI を1つだけ巨大にし、書体をセリフ系（エディトリアル）にした別案を作る。
- **出典**: <https://adminlte.io/blog/saas-dashboard-design-examples/> <https://www.925studios.co/blog/saas-dashboard-design-examples-2026>
