UMINARI COFFEE（海鳴り珈琲）サンセットテラス席 予約LP — 納品物
※架空のクライアントを想定したデザイン提案サンプルです。

■ フォルダ構成
  site/         … そのままサーバーにアップロードできるHTML一式（index.html を開く）
    tokens.css  … 色・書体の設定（色を変えるときはここだけ編集）
    style.css   … レイアウト・装飾
    main.js     … 日の入り計算／予約フォーム／追従ボタン
    shared/     … 共通ライブラリ（モーション・背景グラフィック・効果音）
    images/ogp.png … SNSシェア用画像（1200×630）
  preview/      … 確認用のフルページ画像（PC 1440px／スマホ 390px）

■ 公開前に必ず設定すること
  1. 予約フォームの送信先：main.js の「ここで予約管理サービスへ送信する」の位置に、
     予約システム（例：Formspree・Googleフォーム・予約SaaSのAPI）への送信処理を追加してください。
     現状は送信せずに完了画面を表示するデモ動作です。
  2. 店名・営業時間・席数・駐車場・価格は想定値です。実際の情報に差し替えてください（index.html）。
  3. og:image は相対パスです。公開URLが決まったら絶対URL（https://〜/images/ogp.png）に変更してください。
  4. フッターの「プライバシーポリシー」のリンク先を設定してください。

■ 日の入り時刻について
  main.js の LAT / LNG（緯度・経度）を店舗の実際の位置にすると精度が上がります。
  NOAAの簡易式による計算で、誤差は数分程度（ページ上も「目安」と表記）。
  予約枠は「日の入り60分前から90分間」。変更は main.js の renderSunset() の from / to。
  予約を受け付けるのは今日から90日先まで（main.js の maxDate で変更）。

■ 画像の差し替え
  現在のビジュアルはすべてオリジナルのSVGイラスト（index.html に直接記述）で、著作権上の制約はありません。
  撮影写真に差し替える場合は、<figure class="art"> 内の <svg> を
  <img src="images/xxx.webp" width="640" height="480" alt="（内容の説明）" loading="lazy"> に置き換えてください。
  FVの写真は fetchpriority="high" を付けてください。

■ フォント（Google Fonts／SIL Open Font License・商用利用可）
  見出し：Shippori Mincho B1 ／ 本文：Zen Kaku Gothic New ／ 英字：Cormorant Garamond

■ 効果音
  shared/js/sfx.js がブラウザ上で合成するオリジナル音（外部音源なし・著作権フリー）。
  右下の「SOUND ON/OFF」ボタンで切り替え（選択はブラウザに保存）。最初のクリック以降に鳴ります。

■ アクセシビリティ
  本文コントラスト 11.0:1、ボタン文字 4.6:1 以上、タップ領域 44px 以上、キーボード操作・フォーカス表示対応、
  OSの「視差効果を減らす」設定時はアニメーションを停止します。
