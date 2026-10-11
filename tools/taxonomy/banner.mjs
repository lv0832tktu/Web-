// バナー・サムネイル・SNS画像 の専用知識
export const FORMATS = [
  { id: 'gdn-300x250', name: 'ディスプレイ広告 レクタングル', w: 300, h: 250, kind: 'banner', note: '最も出稿量が多い。情報は3要素まで' },
  { id: 'gdn-336x280', name: 'ディスプレイ広告 ラージレクタングル', w: 336, h: 280, kind: 'banner', note: '300x250の拡張。余白を活かせる' },
  { id: 'gdn-728x90', name: 'ビッグバナー', w: 728, h: 90, kind: 'banner', note: '横長。左ロゴ→中央コピー→右CTAの3分割' },
  { id: 'gdn-320x50', name: 'モバイルバナー', w: 320, h: 50, kind: 'banner', note: '極小。コピー1行＋CTAのみ' },
  { id: 'gdn-320x100', name: 'モバイル ラージバナー', w: 320, h: 100, kind: 'banner', note: '2行コピーまで' },
  { id: 'gdn-300x600', name: 'ハーフページ', w: 300, h: 600, kind: 'banner', note: '縦長。上から順に読ませるストーリー構成' },
  { id: 'gdn-160x600', name: 'ワイドスカイスクレイパー', w: 160, h: 600, kind: 'banner', note: '細長。縦積みで大きな数字が効く' },
  { id: 'gdn-970x250', name: 'ビルボード', w: 970, h: 250, kind: 'banner', note: 'ブランディング向け。写真を大きく' },
  { id: 'yt-thumb', name: 'YouTubeサムネイル', w: 1280, h: 720, kind: 'thumbnail', note: '右下に再生時間が被るので重要要素を置かない。スマホで縮小されても読める3〜8文字' },
  { id: 'ig-square', name: 'Instagram フィード（正方形）', w: 1080, h: 1080, kind: 'sns', note: 'プロフィールグリッドの統一感も意識' },
  { id: 'ig-portrait', name: 'Instagram フィード（縦4:5）', w: 1080, h: 1350, kind: 'sns', note: '画面占有率が最大。保存されるカルーセル1枚目に' },
  { id: 'ig-story', name: 'Instagram ストーリーズ / リール', w: 1080, h: 1920, kind: 'sns', note: '上下250pxはUIと被るセーフゾーン外' },
  { id: 'tiktok', name: 'TikTok カバー / 縦動画', w: 1080, h: 1920, kind: 'sns', note: '右側にいいね等のUI。左寄せ配置' },
  { id: 'x-post', name: 'X（Twitter）投稿画像', w: 1600, h: 900, kind: 'sns', note: 'タイムラインで16:9表示' },
  { id: 'x-header', name: 'X ヘッダー', w: 1500, h: 500, kind: 'sns', note: '左下にアイコンが被る' },
  { id: 'fb-ogp', name: 'Facebook / OGP画像', w: 1200, h: 630, kind: 'sns', note: 'シェア時の第一印象。中央に要素を集める' },
  { id: 'line-rich', name: 'LINE リッチメッセージ', w: 1040, h: 1040, kind: 'sns', note: 'タップ領域の分割を意識' },
  { id: 'line-richmenu', name: 'LINE リッチメニュー', w: 2500, h: 1686, kind: 'sns', note: '6分割が定番。アイコン＋短い単語' },
  { id: 'note-header', name: 'note 見出し画像', w: 1280, h: 670, kind: 'sns', note: '一覧で上下が切られる。中央帯に文字' },
  { id: 'blog-eyecatch', name: 'ブログ アイキャッチ', w: 1200, h: 630, kind: 'sns', note: 'タイトルを大きく、背景はシンプルに' },
  { id: 'ec-main', name: 'EC商品メイン画像（楽天/Amazon）', w: 1000, h: 1000, kind: 'banner', note: '楽天はテキスト占有率20%以下ルールに注意' },
  { id: 'podcast', name: 'ポッドキャスト / 音声カバー', w: 3000, h: 3000, kind: 'sns', note: '極小表示でも識別できるシンプルさ' },
];

export const PURPOSES = [
  { id: 'sale', name: 'セール・割引告知', copy: ['最大{off}%OFF', '全品{off}%OFF', '本日23:59まで', '期間限定セール開催中'], cta: '今すぐチェック' },
  { id: 'launch', name: '新商品・新サービス発売', copy: ['NEW ARRIVAL', 'ついに発売', '新登場'], cta: '詳しく見る' },
  { id: 'trial', name: '無料体験・無料相談', copy: ['初回0円', '無料体験受付中', 'まずは無料で試す'], cta: '無料で体験する' },
  { id: 'download', name: '資料請求・ホワイトペーパー', copy: ['導入事例集プレゼント', '3分でわかる資料', '【無料】完全ガイド'], cta: '資料をダウンロード' },
  { id: 'recruit', name: '採用・求人', copy: ['未経験歓迎', '一緒に働く仲間募集', '年間休日{n}日'], cta: 'エントリーする' },
  { id: 'event', name: 'イベント・セミナー告知', copy: ['参加無料', '{m}月{d}日開催', '先着{n}名限定'], cta: '申し込む' },
  { id: 'campaign', name: 'キャンペーン・プレゼント', copy: ['フォロー&RTで当たる', '抽選で{n}名様に', 'プレゼントキャンペーン'], cta: '応募する' },
  { id: 'beforeafter', name: 'ビフォーアフター・実績', copy: ['{n}ヶ月で-{m}kg', 'たった{n}日で', '変化を実感'], cta: '体験談を見る' },
  { id: 'howto', name: 'ハウツー・ノウハウ投稿', copy: ['保存必須', '知らないと損する{n}選', '初心者向け完全ガイド'], cta: '保存して見返す' },
  { id: 'compare', name: '比較・ランキング', copy: ['徹底比較', 'おすすめTOP{n}', '選び方のポイント'], cta: '比較を見る' },
  { id: 'announce', name: 'お知らせ・営業案内', copy: ['リニューアルオープン', '年末年始の営業について', '{m}月の休業日'], cta: '詳細はこちら' },
  { id: 'brand', name: 'ブランディング・認知', copy: ['{brand}のある暮らし', 'あなたらしく', '想いを、かたちに'], cta: 'ブランドを知る' },
  { id: 'youtube-hook', name: 'YouTube動画の興味喚起', copy: ['【衝撃】', 'やってみた結果…', '9割が知らない'], cta: '' },
  { id: 'quiz', name: '診断・クイズ', copy: ['あなたはどのタイプ？', '30秒で診断', '{n}問でわかる'], cta: '診断スタート' },
  { id: 'review', name: 'お客様の声・口コミ', copy: ['満足度{pct}%', '★4.8の高評価', 'リピート率{pct}%', '口コミ{n}0件突破'], cta: '口コミを見る' },
];

export const LAYOUTS = [
  { id: 'split-lr', name: '左右分割（写真｜テキスト）', guide: '写真側に視線の向きを内側へ。テキスト側は左揃え' },
  { id: 'center-focus', name: '中央集中', guide: '主役を中央、周囲に余白。シンメトリーで安定感' },
  { id: 'z-pattern', name: 'Z型配置', guide: '左上ロゴ→右上キャッチ→左下情報→右下CTA' },
  { id: 'diagonal', name: '対角線・斜め分割', guide: '15〜20度の斜めで動きとスピード感' },
  { id: 'big-number', name: '大きな数字訴求', guide: '数字を全体の40%サイズに。単位は数字の1/3' },
  { id: 'person-cutout', name: '人物切り抜き＋大見出し', guide: '人物の視線を見出しへ向ける。人物は画面の1/2〜2/3' },
  { id: 'band', name: '帯デザイン', guide: '上下または斜めの帯に情報を集約。帯色＝アクセント' },
  { id: 'frame', name: 'フレーム囲み', guide: '内側に余白を持った枠で上質さ・まとまりを出す' },
  { id: 'grid', name: 'グリッド（複数商品）', guide: '2×2/3×3で商品を並べ、価格ラベルを統一' },
  { id: 'fullbleed-overlay', name: '全面写真＋グラデオーバーレイ', guide: '下部に黒→透明のグラデを敷いて文字の可読性を確保' },
  { id: 'typography-only', name: 'タイポグラフィのみ', guide: '写真なし。文字の大小・太細・色のコントラストで魅せる' },
  { id: 'card-stack', name: 'カード重ね（カルーセル1枚目風）', guide: 'カードを少し傾けて重ねて「続きがある」感' },
  { id: 'circle-badge', name: '円形バッジ強調', guide: '割引率やNEWを円バッジで。回転させると動きが出る' },
  { id: 'reaction-face', name: 'リアクション顔＋3語コピー（サムネ）', guide: '顔は画面の1/3以上、表情は大げさに、文字は3〜8文字' },
  { id: 'before-after-split', name: 'ビフォーアフター左右比較', guide: '左に暗め/右に明るめ。中央に矢印' },
];

export const COPY_TECHNIQUES = [
  '数字で具体化（「たくさん」→「1,200件」）', '問いかけ（「〜で悩んでいませんか？」）', '限定性（期間・数量・対象）',
  '権威性（No.1・受賞・専門家監修）', 'ベネフィット先出し（機能ではなく得られる未来）', '損失回避（「知らないと損」）',
  '意外性・ギャップ（「実は〜」）', 'ターゲット呼びかけ（「30代で肌に悩む方へ」）', '擬音・話し言葉（「ぎゅっと」「ふわっと」）', '対比（BEFORE/AFTER, ○○ではなく△△）',
];

export const TEXT_DECORATIONS = [
  '袋文字（2重縁取り）', 'グラデーション文字', 'ドロップシャドウ（ハード）', '文字の一部だけ色替え', '傍点・下線マーカー',
  '斜体＋スピード線', '立体文字（押し出し）', '手書き風フォントの一言添え', '英字の大きなウォーターマーク', 'ネオン発光文字',
];

export const ANIMATION_SEQUENCES = [
  { id: 'seq-3beat', name: '3ビート構成', steps: ['0.0s 背景がズームイン', '0.6s キャッチが1文字ずつ出現', '1.6s CTAがポップ＋パルス'], loop: '6秒でループ（GDNは30秒以内・最大3ループ）' },
  { id: 'seq-reveal-price', name: '価格リビール', steps: ['0.0s 商品がスライドイン', '1.0s 旧価格に打ち消し線', '1.6s 新価格が拡大＋シャイン', '2.4s 期限テキストが点滅'], loop: '5秒' },
  { id: 'seq-ba', name: 'ビフォーアフター切替', steps: ['0.0s BEFORE表示', '1.2s ワイプでAFTERへ', '2.0s 数値がカウントアップ', '3.0s CTA'], loop: '6秒' },
  { id: 'seq-kinetic', name: 'キネティックタイポ', steps: ['単語ごとに画面いっぱいに表示→切替（0.4s間隔）', '最後にロゴ＋CTAで静止'], loop: '7秒' },
  { id: 'seq-story', name: 'ストーリーズ3枚構成', steps: ['1枚目: 問いかけ', '2枚目: 解決策＋商品', '3枚目: 特典＋スワイプアップ誘導'], loop: '各5秒' },
  { id: 'seq-loop-ambient', name: 'アンビエントループ', steps: ['背景のグラデ/粒子が常にゆっくり動く', '文字は静止で可読性を確保'], loop: '無限（シームレス）' },
  { id: 'seq-stamp', name: 'スタンプ着地', steps: ['0.0s 背景', '0.5s 見出しが上から落ちてきて着地（揺れ）', '1.2s 「限定」スタンプがドン', '2.0s CTA'], loop: '5秒' },
];
