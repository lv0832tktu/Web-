// Webサイト・ホームページ の専用知識
export const SITE_TYPES = [
  { id: 'corporate', name: 'コーポレートサイト', pages: ['トップ', '会社概要', '事業内容', 'ニュース', '採用情報', 'お問い合わせ', 'プライバシーポリシー'] },
  { id: 'service', name: 'サービスサイト', pages: ['トップ', 'サービス詳細', '料金', '導入事例', 'よくある質問', '資料請求', 'お問い合わせ'] },
  { id: 'shop', name: '店舗サイト（飲食・美容・サロン）', pages: ['トップ', 'コンセプト', 'メニュー/料金', 'スタッフ', 'ギャラリー', 'アクセス', 'ご予約'] },
  { id: 'clinic', name: 'クリニック・医院サイト', pages: ['トップ', '診療案内', '医師紹介', '院内紹介', '初診の方へ', 'アクセス・診療時間', 'Web予約'] },
  { id: 'recruit', name: '採用サイト', pages: ['トップ', '私たちについて', '仕事を知る', '社員インタビュー', '働く環境・制度', '数字で見る', '募集要項', 'エントリー'] },
  { id: 'brand', name: 'ブランドサイト', pages: ['トップ', 'ブランドストーリー', 'プロダクト', 'こだわり', 'ジャーナル', 'ストアリスト'] },
  { id: 'portfolio', name: 'ポートフォリオ（個人/事務所）', pages: ['トップ', 'Works一覧', 'Works詳細', 'About', 'Service', 'Contact'] },
  { id: 'media', name: 'オウンドメディア・ブログ', pages: ['トップ', '記事一覧', '記事詳細', 'カテゴリ', '著者紹介', '検索結果'] },
  { id: 'ec', name: 'ECサイト', pages: ['トップ', '商品一覧', '商品詳細', 'カート', '特集', 'ブランドについて', 'マイページ'] },
  { id: 'hotel', name: 'ホテル・旅館サイト', pages: ['トップ', '客室', '料理', '温泉・施設', '観光・周辺', 'プラン・予約', 'アクセス'] },
  { id: 'school', name: 'スクール・教室サイト', pages: ['トップ', 'コース・料金', '講師紹介', '受講生の声', '体験レッスン', 'よくある質問', 'アクセス'] },
  { id: 'event', name: 'イベント・フェスサイト', pages: ['トップ', 'ラインナップ', 'タイムテーブル', 'チケット', 'アクセス', 'FAQ'] },
  { id: 'municipal', name: '自治体・観光協会サイト', pages: ['トップ', '観る', '食べる', '泊まる', '体験', 'モデルコース', 'アクセス'] },
];

export const HEADER_PATTERNS = [
  { id: 'h-classic', name: '左ロゴ＋右グローバルナビ＋CTAボタン', note: 'BtoB/コーポレートの王道' },
  { id: 'h-center', name: '中央ロゴ＋左右振り分けナビ', note: 'ブランド・ホテル・サロン' },
  { id: 'h-hamburger', name: 'ハンバーガーのみ（全画面メニュー）', note: 'デザイン重視。メニュー展開を演出の見せ場に' },
  { id: 'h-vertical', name: '縦書きサイドナビ', note: '和モダン・エディトリアル' },
  { id: 'h-floating', name: '浮遊するピル型ヘッダー（グラス）', note: 'SaaS・モダン' },
  { id: 'h-hide-on-scroll', name: '下スクロールで隠れ、上で再表示', note: '記事・メディア' },
  { id: 'h-mega', name: 'メガメニュー', note: 'ページ数の多い企業/EC' },
];

export const HERO_PATTERNS = [
  { id: 'hero-slideshow', name: 'フェード/ズームのスライドショー', motion: 'ken-burns' },
  { id: 'hero-video', name: '全画面ループ動画', motion: 'letterbox-open' },
  { id: 'hero-typo', name: '巨大コピー＋小さな写真', motion: 'split-text' },
  { id: 'hero-split', name: '画面2分割（写真｜コピー）', motion: 'clip-left' },
  { id: 'hero-vertical', name: '縦書きコピー＋余白', motion: 'vertical-text-reveal' },
  { id: 'hero-3d', name: '3Dオブジェクト/ジェネラティブ背景', motion: 'mesh / constellation' },
  { id: 'hero-collage', name: '散らばった写真コラージュ', motion: 'parallax（速度差）' },
  { id: 'hero-scroll-story', name: 'スクロール連動のストーリー', motion: 'sticky-scrub' },
  { id: 'hero-loading', name: 'ローディング演出→ロゴ→メインビジュアル', motion: 'mask-wipe + jingle' },
];

export const GRID_SYSTEMS = [
  '12カラム（最大幅1200px／ガター24px）', 'ブロークングリッド（要素をわざとグリッドからはみ出させる）', '非対称2カラム（5:7）',
  'ベントーグリッド（大小のタイル）', 'ジグザグ（写真とテキストを交互）', 'マガジン段組み（3段＋大見出し）', 'フルブリード＋中央狭幅本文（680px）',
];

export const PAGE_TRANSITIONS = [
  'ページ遷移時に色面がワイプ（View Transitions API）', 'フェード＋少し上へ', 'ロゴが中央に出てから次ページ', '画像が拡大して詳細ページへ（共有要素遷移）', '遷移なし（速度重視）',
];

export const SIGNATURE_DETAILS = [
  'カスタムカーソル＋ホバーで拡大', 'スクロールに合わせて背景色が変わる', 'フッターに巨大なロゴタイプ', '画像ホバーでRGBずれ', 'ナビのホバーで下線が伸びる',
  'セクション見出しの英字を大きく薄く背景に', 'ページ上部の読了プログレスバー', 'ローディング画面のロゴアニメーション＋ジングル', '円形の回転テキストバッジ（SCROLL・CONTACT）',
  'ニュース一覧のホバーで写真がカーソル追従', 'フッターの「Back to top」で効果音', 'ダークモード切替（アニメーション付き）',
];

export const SEO_CHECKS = [
  'title 30〜35字・description 80〜120字を全ページ固有に', 'h1は1ページ1つ', 'OGP画像（1200×630）を設定', '画像はWebP/AVIF＋width/height属性でCLS防止',
  '構造化データ（LocalBusiness / Organization / FAQ）', 'Lighthouse Performance 90以上を目標', 'パンくずリスト', 'sitemap.xml と robots.txt',
];
