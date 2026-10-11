UMINARI COFFEE（海鳴り珈琲）サンセットテラス席 予約LP — 納品物
※架空のクライアントを想定したデザイン提案サンプルです。

■ フォルダ構成
  site/            … そのままサーバーにアップロードできるHTML一式
    index.html     … LP本体
    privacy.html   … プライバシーポリシー（予約フォームからリンク）
    .htaccess      … Apache用の圧縮・キャッシュ設定（レンタルサーバーで表示を速くする）
    tokens.css     … 色・書体の設定（色を変えるときはここだけ編集）
    style.css      … レイアウト・装飾
    main.js        … 日の入り計算／予約フォーム送信／追従ボタン
    shared/        … 共通ライブラリ（モーション・背景グラフィック・効果音）
    images/        … 画像（WebP）・favicon・SNSシェア画像 ogp.jpg（1200×630）
  preview/         … 確認用のフルページ画像（PC 1440px／スマホ 390px）

■ 品質（2026-10-11 計測）
  Lighthouse モバイル：Performance 87〜98／Accessibility 100／Best Practices 100／SEO 100
  Lighthouse PC     ：すべて 100
  ※Performance は .htaccess を有効にしたサーバーでさらに上がります（テキスト圧縮・キャッシュ）。
  キーボード操作（スキップリンク・FAQ・フォーム）、効果音ON/OFF（設定はブラウザに保存）、
  「視差効果を減らす」設定時のアニメーション停止を確認済み。

■ 公開前に必ず設定すること
  1. 予約フォームの送信先
     index.html の <form class="form" ... data-endpoint=""> に送信先URLを入れるだけで動きます。
     例：Formspree（https://formspree.io）でフォームを作成 → data-endpoint="https://formspree.io/f/xxxxxxx"
     送信内容：date（来店日）／people（人数）／name／email／slot（予約枠と日の入り時刻）
     迷惑送信対策の隠し項目 _gotcha（Formspree標準）付き。送信中・送信失敗の表示も実装済み。
     空欄のままだと送信せずに完了画面だけを表示するデモ動作になります。
  2. 店名・営業時間・席数・駐車場・価格は想定値です。実際の情報に差し替えてください（index.html）。
     index.html の <script type="application/ld+json">（Google向けの店舗情報）の価格も合わせて修正。
  3. og:image は相対パスです。公開URLが決まったら絶対URL（https://〜/images/ogp.jpg）に変更してください。
  4. privacy.html の内容（保存期間・委託先など）を、実際の運用に合わせて確認してください。

■ 文言を変更したとき（重要）
  表示を速くするため、Google Fonts は「このページで使っている文字だけ」を読み込んでいます。
  新しい漢字などを追加すると、その文字だけ別の書体で表示されます。文言を変えたら、制作フォルダで
    node projects/20261011-uminari-coffee/render/font-subset.mjs
  を実行して index.html / privacy.html のフォントURLを更新してください。

■ 日の入り時刻について
  main.js の LAT / LNG（緯度・経度）を店舗の実際の位置にすると精度が上がります。
  NOAAの簡易式による計算で、誤差は数分程度（ページ上も「目安」と表記）。
  予約枠は「日の入り60分前から90分間」。変更は main.js の renderSunset() の from / to。
  予約を受け付けるのは今日から90日先まで（main.js の maxDate で変更）。

■ 画像について
  写真風の画像（images/*.webp）は、外部の画像生成AIや素材サイトを使わず、
  プログラム（WebGL2 のレイマーチングによる3DCG）で描画したオリジナルです。著作権上の制約はありません。
  ・hero.webp / hero-sp.webp … ファーストビュー（PC用16:9／スマホ用縦長。<picture> で自動切替）
  ・eaves / seats / ingredients / reserved … コンセプトと「3つのこと」（-640 は小さい画面用）
  ・menu-*.webp … メニュー4品（-440 は小さい画面用）
  描画の元データは制作フォルダ projects/20261011-uminari-coffee/render/（scene.frag・render.mjs）。
  実店舗の撮影写真に差し替える場合は、同じファイル名・同じ縦横比の WebP で上書きすればOKです
  （-640 / -440 の小さい版も同様に用意）。
  アクセスの地図は位置を正確に示すため簡易イラストのままです。Googleマップへのリンク追加を推奨。

■ フォント（Google Fonts／SIL Open Font License・商用利用可）
  見出し：Shippori Mincho B1 ／ 本文：Zen Kaku Gothic New ／ 英字：Cormorant Garamond

■ 効果音
  shared/js/sfx.js がブラウザ上で合成するオリジナル音（外部音源なし・著作権フリー）。
  右下の「SOUND ON/OFF」ボタンで切り替え（選択はブラウザに保存）。最初のクリック以降に鳴ります。

■ アクセシビリティ
  本文コントラスト 11.0:1、小さい文字も 4.5:1 以上、タップ領域 44px 以上、スキップリンク、
  キーボード操作・フォーカス表示対応、送信エラーの読み上げ対応、
  OSの「視差効果を減らす」設定時はアニメーションを停止します。
