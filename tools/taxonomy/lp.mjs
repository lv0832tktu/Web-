// LP（ランディングページ）の専用知識
export const GOALS = [
  { id: 'lead', name: 'リード獲得（資料請求・問い合わせ）', kpi: 'CVR 2〜5%', cta: ['無料で資料をもらう', '30秒で問い合わせ'] },
  { id: 'trial', name: '無料体験・カウンセリング予約', kpi: '予約率', cta: ['無料体験を予約する', 'カウンセリングを予約'] },
  { id: 'purchase', name: '商品購入（単品通販）', kpi: '購入率・LTV', cta: ['初回限定価格で試す', 'カートに入れる'] },
  { id: 'signup', name: '会員登録・アプリDL', kpi: '登録率', cta: ['無料ではじめる', 'App Storeでダウンロード'] },
  { id: 'seminar', name: 'セミナー・ウェビナー集客', kpi: '申込数', cta: ['今すぐ席を確保する', '無料で参加する'] },
  { id: 'recruit', name: '採用エントリー', kpi: '応募数', cta: ['カジュアル面談に申し込む', 'エントリーする'] },
  { id: 'crowdfunding', name: 'クラウドファンディング支援', kpi: '支援額', cta: ['プロジェクトを支援する'] },
  { id: 'line', name: 'LINE友だち追加', kpi: '友だち追加数', cta: ['LINEで友だち追加', 'LINEでクーポンを受け取る'] },
];

export const FRAMEWORKS = [
  { id: 'pasona', name: 'PASONAの法則', flow: ['Problem 問題提起', 'Affinity 共感', 'Solution 解決策', 'Offer 提案', 'Narrowing 絞り込み', 'Action 行動'] },
  { id: 'aidma', name: 'AIDMA', flow: ['Attention 注意', 'Interest 関心', 'Desire 欲求', 'Memory 記憶', 'Action 行動'] },
  { id: 'quest', name: 'QUESTフォーミュラ', flow: ['Qualify 絞り込み', 'Understand 理解', 'Educate 教育', 'Stimulate 興奮', 'Transition 行動'] },
  { id: 'beaf', name: 'BEAFの法則（EC向け）', flow: ['Benefit 利益', 'Evidence 証拠', 'Advantage 優位性', 'Feature 特徴'] },
  { id: 'pastor', name: 'PASTORフォーミュラ', flow: ['Problem 問題', 'Amplify 増幅', 'Story/Solution 物語', 'Transformation/Testimony 変化と証言', 'Offer 提案', 'Response 反応'] },
  { id: 'storybrand', name: 'StoryBrand（顧客が主人公）', flow: ['主人公（顧客）', '問題', 'ガイド（自社）', '計画', '行動喚起', '失敗回避', '成功'] },
];

/** LPで使うセクション（ブロック）の部品辞書 */
export const SECTIONS = {
  fv: { name: 'ファーストビュー', tips: '3秒で「誰の・何の・どんな未来」が伝わるか。CTAをFV内に必ず置く' },
  problem: { name: 'お悩み提起', tips: 'チェックリスト形式で「自分ごと化」させる。イラスト人物で共感' },
  empathy: { name: '共感・原因', tips: '悩みの原因を明かし「あなたのせいではない」と寄り添う' },
  solution: { name: '解決策の提示', tips: '商品/サービスを「答え」として登場させる。ここで商品画像を大きく' },
  benefit: { name: 'ベネフィット', tips: '機能ではなく得られる未来を3つ。アイコン＋短文' },
  feature: { name: '特徴・選ばれる理由', tips: '「理由01/02/03」とナンバリング。写真と交互レイアウト（ジグザグ）' },
  numbers: { name: '実績・数字', tips: '大きな数字をカウントアップで。出典・期間を小さく明記' },
  voice: { name: 'お客様の声', tips: '顔写真・年代・職業で信憑性。横スクロールのカルーセル' },
  beforeafter: { name: 'ビフォーアフター', tips: 'スライダーで比較できるインタラクション' },
  compare: { name: '比較表', tips: '自社列をハイライト＋影で浮かせる。◎○△で直感的に' },
  price: { name: '料金プラン', tips: 'おすすめプランを中央・大きく。「一番人気」バッジ' },
  offer: { name: '特典・オファー', tips: '期限付きの特典。カウントダウンタイマーで緊急性' },
  flow: { name: 'ご利用の流れ', tips: 'STEP1〜4。線で繋いで「簡単さ」を視覚化' },
  faq: { name: 'よくある質問', tips: 'アコーディオン。購入前の不安（解約・返金・副作用）を潰す' },
  guarantee: { name: '保証・安心', tips: '返金保証・実績企業ロゴ・メディア掲載' },
  story: { name: '開発ストーリー / 代表メッセージ', tips: '想いを語りファン化。写真はモノクロやセピアで情緒的に' },
  media: { name: 'メディア掲載・導入企業ロゴ', tips: 'ロゴをグレースケールで横に流す（マーキー）' },
  cta: { name: 'クロージングCTA', tips: 'FVのコピーを再提示＋オファー＋大きなボタン。背景色を変えて区切る' },
  sticky: { name: '追従CTA（スマホ下部固定）', tips: 'スクロール後に下から出現。閉じるボタン不要' },
  form: { name: '埋め込みフォーム', tips: '項目は最大5つ。入力完了で紙吹雪＋成功音' },
};

export const STRUCTURES = [
  ['fv', 'problem', 'empathy', 'solution', 'benefit', 'feature', 'voice', 'price', 'flow', 'faq', 'cta'],
  ['fv', 'media', 'problem', 'solution', 'feature', 'numbers', 'voice', 'compare', 'offer', 'faq', 'cta', 'sticky'],
  ['fv', 'numbers', 'benefit', 'feature', 'beforeafter', 'voice', 'price', 'guarantee', 'faq', 'cta', 'sticky'],
  ['fv', 'story', 'problem', 'solution', 'feature', 'voice', 'offer', 'flow', 'faq', 'form'],
  ['fv', 'problem', 'solution', 'benefit', 'compare', 'price', 'voice', 'faq', 'cta', 'sticky'],
  ['fv', 'media', 'benefit', 'feature', 'numbers', 'flow', 'voice', 'faq', 'form'],
  ['fv', 'story', 'feature', 'beforeafter', 'voice', 'offer', 'guarantee', 'cta', 'sticky'],
  ['fv', 'problem', 'empathy', 'story', 'solution', 'benefit', 'voice', 'price', 'offer', 'faq', 'cta', 'sticky'],
];

export const FV_PATTERNS = [
  { id: 'fv-split', name: '左テキスト×右商品/人物', motion: '見出しsplit-text＋画像clip-up' },
  { id: 'fv-fullphoto', name: '全面写真＋中央キャッチ', motion: 'ken-burns＋blur-in' },
  { id: 'fv-video', name: '背景動画ループ＋オーバーレイ', motion: 'letterbox-open＋split-text' },
  { id: 'fv-typo', name: '超大型タイポグラフィ', motion: 'split-text（rotate）＋marquee' },
  { id: 'fv-mockup', name: 'デバイスモックアップ浮遊', motion: 'float＋tilt-3d＋mesh背景' },
  { id: 'fv-collage', name: '写真コラージュ', motion: 'stagger＋parallax（写真ごとに速度差）' },
  { id: 'fv-illust', name: 'イラスト主体', motion: 'line-draw＋float' },
  { id: 'fv-number', name: '実績数字ドーン', motion: 'counter-up＋pop' },
  { id: 'fv-sticky-scrub', name: 'スクロールで商品が回転/分解', motion: 'sticky-scrub（--p で transform）' },
  { id: 'fv-generative', name: 'ジェネラティブ背景＋コピー', motion: 'constellation/mesh/particles canvas' },
];

export const CTA_PATTERNS = [
  'マイクロコピー付き（「30秒で完了」「しつこい営業なし」）', 'ボタン内に矢印アイコン＋ホバーで右移動', 'パルスする波紋で注目', 'シャインが定期的に走る',
  '押すと沈むハードシャドウ', '上部に吹き出し「＼今なら初月無料／」', '2択CTA（資料DL / 無料相談）', 'LINEグリーンの専用ボタン',
];

export const INTERACTIONS = [
  'ビフォーアフタースライダー', 'カウントダウンタイマー', '料金シミュレーター（スライダーで月額計算）', '診断チャート（3問で最適プラン）',
  'FAQアコーディオン＋開閉音', '声のカルーセル（自動スクロール）', 'スクロール追従の目次', 'フォーム入力の進捗バー', '送信完了で紙吹雪＋成功音',
];
