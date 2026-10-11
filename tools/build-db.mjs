#!/usr/bin/env node
/**
 * build-db.mjs — 4ジャンル × 10,000件の「デザインレシピDB」を生成する
 *
 *   node tools/build-db.mjs            # 全ジャンル 10,000件ずつ
 *   node tools/build-db.mjs --count 500 --genre lp
 *
 * 1件 = 1つの高品質デザイン作品の設計図（レイアウト/配色/書体/コピー/モーション/効果音/グラフィック/品質チェック）。
 * 実在作品のコピーではなく、受賞サイト・人気バナー・定番UIで使われる「設計パターン」を
 * 相性ルールに従って組み合わせたオリジナルのレシピです。シード固定なので何度実行しても同じ結果になります。
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { STYLES, INDUSTRIES, MOTIONS, SFX, ACCESSIBILITY } from './taxonomy/common.mjs';
import * as BNR from './taxonomy/banner.mjs';
import * as LP from './taxonomy/lp.mjs';
import * as WEB from './taxonomy/website.mjs';
import * as UI from './taxonomy/uiux.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const COUNT = +arg('count', 10000);
const ONLY = arg('genre', null);
const SHARD = 1000;

// ---------- seeded random ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mk = (seed) => {
  const r = rng(seed);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const picks = (a, n) => { const c = [...a]; const o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(r() * c.length), 1)[0]); return o; };
  const int = (a, b) => a + Math.floor(r() * (b - a + 1));
  return { r, pick, picks, int };
};

const styleById = Object.fromEntries(STYLES.map((s) => [s.id, s]));
const pad = (n, w = 5) => String(n).padStart(w, '0');
const fill = (t, R, extra = {}) => t
  .replace(/\{pct\}/g, () => R.pick(['92', '95', '96', '97', '98']))
  .replace(/\{off\}/g, () => R.pick(['20', '30', '40', '50', '70']))
  .replace(/\{n\}/g, () => R.pick(['3', '5', '7', '10', '30', '50', '100']))
  .replace(/\{m\}/g, () => String(R.int(1, 12)))
  .replace(/\{d\}/g, () => String(R.int(1, 28)))
  .replace(/\{brand\}/g, extra.brand || 'ブランド');

// 色のコントラスト比（WCAG）
function lum(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); }
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.round(((x + 0.05) / (y + 0.05)) * 10) / 10; };
const onColor = (hex) => (contrast(hex, '#FFFFFF') >= contrast(hex, '#111111') ? '#FFFFFF' : '#111111');

// ---------- 共通パーツ ----------
const BRAND_WORDS = ['Lumi', 'Aoba', 'Kinari', 'Sora', 'Nagi', 'Hikari', 'Mori', 'Kaze', 'Yui', 'Toki', 'Rin', 'Haru', 'Sumi', 'Akari', 'Mugi', 'Tsumugi', 'Nova', 'Vivid', 'Orbit', 'Pulse', 'Bloom', 'Atlas', 'Mint', 'Ember', 'Coral', 'Quill', 'Fable', 'Prism', 'Halo', 'Kumo'];
const BRAND_SUFFIX = ['', ' Lab', ' Studio', ' & Co.', ' Works', ' Tokyo', ' Base', ' Clinic', ' House', ' Garden'];

const ORIGINALITY = [
  'クライアントのロゴ形状から1つのモチーフを抽出し、背景パターン・区切り線・アイコンに展開する',
  '写真をパレットのprimary色でデュオトーン化し、他社と同じ素材写真でも独自の世界観にする',
  '見出しの1単語だけ書体（手書き/セリフ）を変えて、ブランドの「声」を作る',
  '地域名・創業年・代表の口癖など、その会社にしかない言葉を英字キャプションに使う',
  'グリッドを1箇所だけ意図的に崩す（ブロークングリッド）ことで記憶に残るアクセントにする',
  'アクセントカラーは全体の5%以内に制限し、CTAと最重要数字だけに使う',
  '商品・サービスの「音」を想像して効果音を選ぶ（例：飲み物→drop、トレーニング→impact）',
  'モーションの速度とイージングを1種類に統一し「このブランドの動き」を定義する',
  '季節・時間帯で背景グラフィックを切り替える仕組みを入れる',
  '実際の顧客の声から印象的な一言を抜き出し、大きなタイポグラフィとして使う',
  '余白を通常の1.5倍とり、要素数を減らして「格」を上げる',
  'ブランドカラーを使った独自のイラスト/図形パーツを3種作り、全ページで再利用する',
  '数字（創業年・実績・価格）をデザインの主役にしてグラフィック化する',
  'クライアントの手書き文字やサインをスキャンしてアクセントに使う',
  'ホバー時の動きに「業種らしさ」を持たせる（伝統→墨の滲み、先端技術→グリッチ、艶→光沢）',
];

const QUALITY_BASE_FULL = [
  '視線誘導：最初に見る場所→次→CTA の3段階が明確か', '情報の優先順位：一番伝えたいことが一番大きいか',
  '揃え：全要素が左揃え/中央揃えのいずれかのラインに乗っているか', '余白：要素間の余白が8の倍数でリズムがあるか',
  '色数：ベース70%/メイン25%/アクセント5%になっているか', 'フォント：書体は2種類（＋英字1種）以内か',
  'ジャンプ率：見出しと本文のサイズ差が十分か（2倍以上）', '動き：動きが情報理解を助けているか（飾りすぎていないか）',
];

// 品質チェックの詳細は knowledge/quality-checklist.md。DBには観点名だけを持つ
const QUALITY_BASE = QUALITY_BASE_FULL.map((q) => q.split('：')[0]);

function baseStyle(R, industry) {
  // 業種と相性の良いスタイルを80%、意外性のあるスタイルを20%
  const sid = R.r() < 0.8 ? R.pick(industry.styles) : R.pick(STYLES).id;
  const style = styleById[sid];
  const palette = R.pick(style.palettes);
  const font = R.pick(style.fonts);
  return { style, palette, font };
}

function colors(p) {
  return { name: p.name, bg: p.bg, surface: p.surface, text: p.text, primary: p.primary, accent: p.accent,
    on_primary: onColor(p.primary), contrast: contrast(p.text, p.bg) };
}

function motionList(R, style, n, extra = []) {
  const names = [...new Set([...R.picks(style.motions, n), ...extra])].filter((m) => MOTIONS[m]);
  return names;
}
function sfxList(R, style, n) {
  return R.picks(style.sfx, n);
}
function brand(R) { return R.pick(BRAND_WORDS) + R.pick(BRAND_SUFFIX); }
const levelOf = (R, nMotion) => (nMotion >= 4 ? 'プロ（演出多め）' : nMotion >= 3 ? '上級' : R.pick(['中級', '上級']));
const fontsObj = (f) => ({ head: f.head, body: f.body, en: f.en });

// ---------- 業種との相性ルール（不自然な組み合わせを作らない） ----------
const SITE_FIT = {
  shop: ['beauty-salon', 'esthe', 'cafe', 'restaurant', 'sweets', 'gym', 'yoga', 'pet', 'sauna', 'clinic-beauty'],
  clinic: ['dental', 'clinic', 'clinic-beauty', 'pet'],
  hotel: ['ryokan', 'tourism', 'sauna'],
  ec: ['ec-fashion', 'ec-food', 'cosme', 'sweets', 'agri', 'crowdfunding'],
  school: ['school', 'programming', 'english', 'kids', 'yoga', 'gym'],
  event: ['music-event', 'game', 'npo', 'tourism', 'youtuber'],
  municipal: ['tourism', 'npo', 'agri'],
  portfolio: ['architect', 'webagency', 'consulting', 'youtuber', 'wedding', 'beauty-salon'],
  media: null, corporate: null, service: null, recruit: null, brand: null, // null = 全業種OK
};
const siteTypesFor = (ind) => WEB.SITE_TYPES.filter((t) => SITE_FIT[t.id] === null || SITE_FIT[t.id] === undefined || SITE_FIT[t.id].includes(ind.id));
const GOAL_FIT = {
  purchase: ['cosme', 'ec-fashion', 'ec-food', 'sweets', 'agri', 'pet', 'app', 'crowdfunding', 'esthe'],
  signup: ['saas', 'ai', 'app', 'school', 'programming', 'english', 'finance', 'game', 'dating', 'youtuber'],
  seminar: ['saas', 'ai', 'consulting', 'finance', 'legal', 'realestate', 'school', 'programming', 'webagency', 'housing'],
  crowdfunding: ['crowdfunding', 'agri', 'npo', 'music-event', 'game', 'sweets', 'ec-food', 'tourism'],
  lead: null, trial: ['beauty-salon', 'esthe', 'clinic-beauty', 'dental', 'clinic', 'gym', 'yoga', 'school', 'programming', 'english', 'kids', 'saas', 'ai', 'app', 'consulting', 'wedding', 'fortune', 'housing', 'realestate', 'car', 'pet', 'moving', 'finance', 'legal', 'sauna'],
  recruit: null, line: ['beauty-salon', 'esthe', 'cafe', 'restaurant', 'sweets', 'dental', 'clinic', 'clinic-beauty', 'gym', 'yoga', 'kids', 'housing', 'pet', 'fortune', 'sauna', 'ryokan', 'moving', 'wedding'],
};
const goalsFor = (ind) => LP.GOALS.filter((g) => !GOAL_FIT[g.id] || GOAL_FIT[g.id].includes(ind.id));
const THUMB_PURPOSES = ['youtube-hook', 'howto', 'compare', 'beforeafter', 'review', 'quiz', 'launch'];

// ---------- ジャンル別ジェネレーター ----------
const GENRES = {
  'banner-sns': {
    dir: '01-banner-sns', prefix: 'BNR',
    make(R, i) {
      const ind = R.pick(INDUSTRIES);
      const { style, palette, font } = baseStyle(R, ind);
      const fmt = R.pick(BNR.FORMATS);
      const purpose = R.pick(BNR.PURPOSES.filter((p) => (fmt.kind === 'thumbnail' ? THUMB_PURPOSES.includes(p.id) : p.id !== 'youtube-hook')));
      let layouts = BNR.LAYOUTS;
      if (fmt.kind !== 'thumbnail') layouts = layouts.filter((l) => l.id !== 'reaction-face');
      if (fmt.h <= 100) layouts = layouts.filter((l) => ['split-lr', 'band', 'typography-only', 'center-focus'].includes(l.id));
      const layout = fmt.kind === 'thumbnail' && R.r() < 0.5 ? BNR.LAYOUTS.find((l) => l.id === 'reaction-face') : R.pick(layouts);
      const b = brand(R);
      const animated = R.r() < 0.7;
      const seq = animated ? R.pick(BNR.ANIMATION_SEQUENCES) : null;
      const motions = animated ? motionList(R, style, R.int(2, 4), [R.pick(['shine-sweep', 'pulse', 'pop', 'split-text'])]) : [];
      const headline = fill(R.pick(purpose.copy), R, { brand: b });
      return {
        id: `BNR-${pad(i)}`, genre: 'banner-sns',
        title: `${ind.name}の${purpose.name}${fmt.kind === 'thumbnail' ? 'サムネイル' : fmt.kind === 'sns' ? 'SNS画像' : 'バナー'}（${style.name}）`,
        format: { id: fmt.id, name: fmt.name, width: fmt.w, height: fmt.h, kind: fmt.kind },
        industry: ind.name, target: ind.target, purpose: purpose.name, style: style.name, style_id: style.id,
        concept: `${ind.target}に向けて「${headline}」を「${style.keywords[0]}」を感じるトーンで一瞬で伝える。${layout.name}で視線を${purpose.cta ? 'CTA' : 'キャッチ'}へ導く。`,
        layout: layout.name,
        palette: colors(palette), fonts: fontsObj(font),
        copy: {
          brand: b, headline, sub: `${ind.name}の${R.pick(['新提案', 'プロが選ぶ', '本当に良いもの', '新しいスタンダード', 'はじめての方に'])}`,
          cta: purpose.cta, copy_hint: R.pick(BNR.COPY_TECHNIQUES), text_decoration: R.pick(BNR.TEXT_DECORATIONS),
          char_limit: fmt.w * fmt.h < 40000 ? 'キャッチ8文字以内' : fmt.kind === 'thumbnail' ? 'キャッチ3〜8文字' : 'キャッチ15文字以内',
        },
        graphics: R.picks(style.graphics, 3),
        animated, animation: seq ? { name: seq.name, steps: seq.steps, loop: seq.loop, export: fmt.kind === 'banner' ? 'GIF(150KB以下) / HTML5' : 'MP4(H.264) 6〜15秒' } : null,
        motion: motions, sfx: animated && fmt.kind !== 'banner' ? sfxList(R, style, 2) : [],
        gfx_background: animated ? R.pick(style.gfx) : null,
        level: levelOf(R, motions.length),
        originality: R.pick(ORIGINALITY),
        quality_check: [...R.picks(QUALITY_BASE, 3), '50%縮小で可読性'],
        tags: [ind.name, style.name, purpose.name, fmt.name, layout.name, ...style.keywords.slice(0, 3)],
      };
    },
  },

  lp: {
    dir: '02-lp', prefix: 'LP',
    make(R, i) {
      const ind = R.pick(INDUSTRIES);
      const { style, palette, font } = baseStyle(R, ind);
      const goal = R.pick(goalsFor(ind));
      const fw = R.pick(LP.FRAMEWORKS);
      const fv = R.pick(LP.FV_PATTERNS);
      const struct = R.pick(LP.STRUCTURES);
      const b = brand(R);
      const motions = motionList(R, style, R.int(3, 5), ['fade-up', 'counter-up'].filter(() => R.r() < 0.5));
      const short = ind.name.split(/[・（]/)[0];
      const headline = R.pick([
        `はじめての${short}に、確かな安心を。`, `${short}選びで、もう迷わない。`, `3ヶ月後の自分が、変わる。`, `その悩み、${short}のプロに任せてください。`,
        `${ind.target}に選ばれ続ける理由があります。`, `毎日に、ちょうどいい${short}を。`, `「もっと早く知りたかった」と言われる${short}。`, `満足度${R.pick(['94', '96', '98'])}%。${short}の新しいスタンダード。`,
        `忙しいあなたのための、${short}。`, `${R.pick(['地域No.1', '口コミ評価4.8', '累計1万人'])}の${short}。`,
      ]);
      const micro = { lead: ['＼30秒で完了／', 'しつこい営業は一切ありません', '導入事例集つき'], trial: ['＼初回限定・無料／', '当日予約OK', '強引な勧誘はしません'], purchase: ['初回限定・送料無料', '30日間返金保証', 'いつでも解約OK'], signup: ['クレジットカード登録不要', '1分で登録完了', 'いつでも退会OK'], seminar: ['参加無料・残席わずか', 'アーカイブ視聴OK', '顔出し不要'], recruit: ['履歴書不要', 'オンライン面談OK', '服装自由'], crowdfunding: ['先行価格は今だけ', '数量限定リターン', '支援は1口から'], line: ['友だち追加でクーポン', 'ブロックはいつでもOK', '予約もLINEで完結'] }[goal.id];
      return {
        id: `LP-${pad(i)}`, genre: 'lp',
        title: `${ind.name}｜${goal.name}LP（${style.name}・${fv.name}）`,
        industry: ind.name, target: ind.target, goal: goal.name, kpi: goal.kpi, style: style.name, style_id: style.id,
        concept: `${ind.target}の悩みを${fw.name}で解きほぐし、${goal.name}へ導く。FVは「${fv.name}」で、「${style.keywords.slice(0, 2).join('・')}」が伝わる第一印象を作る。`,
        framework: fw.name,
        first_view: { pattern: fv.name, motion: fv.motion, copy_formula: R.pick(['【ターゲット】のための【ベネフィット】', '【数字】で【変化】。【商品名】', '【悩み】、もう終わりにしませんか？', '【権威】が認めた【商品カテゴリ】', '【期間】で【成果】を。']) },
        sections: struct.map((k) => `${k}:${LP.SECTIONS[k].name}`),
        palette: colors(palette), fonts: fontsObj(font),
        copy: { brand: b, headline, cta: R.pick(goal.cta), microcopy: R.pick(micro), cta_pattern: R.pick(LP.CTA_PATTERNS) },
        interactions: R.picks(LP.INTERACTIONS, R.int(2, 3)),
        motion: motions, sfx: sfxList(R, style, R.int(2, 3)), gfx_background: R.pick(style.gfx),
        graphics: R.picks(style.graphics, 3),
        responsive: { breakpoints: '375 / 768 / 1280', sp_first: true, sticky_cta: struct.includes('sticky') },
        level: levelOf(R, motions.length),
        originality: R.pick(ORIGINALITY),
        quality_check: [...R.picks(QUALITY_BASE, 3), 'FV3秒テスト', 'CTA出現頻度', 'Lighthouse 85+'],
        tags: [ind.name, style.name, goal.name, fw.name, fv.name, ...style.keywords.slice(0, 3)],
      };
    },
  },

  website: {
    dir: '03-website', prefix: 'WEB',
    make(R, i) {
      const ind = R.pick(INDUSTRIES);
      const { style, palette, font } = baseStyle(R, ind);
      const st = R.pick(siteTypesFor(ind));
      const header = R.pick(WEB.HEADER_PATTERNS);
      const hero = R.pick(WEB.HERO_PATTERNS);
      const b = brand(R);
      const motions = motionList(R, style, R.int(3, 5));
      return {
        id: `WEB-${pad(i)}`, genre: 'website',
        title: `${ind.name}の${st.name}（${style.name}・${hero.name}）`,
        industry: ind.name, target: ind.target, site_type: st.name, style: style.name, style_id: style.id,
        concept: `${b}の「${style.keywords.slice(0, 2).join('・')}」を感じる世界観を、${hero.name}のトップで印象づけ、${st.pages.length}ページで信頼と行動につなげる。`,
        sitemap: st.pages,
        header: header.name,
        hero: `${hero.name}（${hero.motion}）`,
        grid: R.pick(WEB.GRID_SYSTEMS),
        page_transition: R.pick(WEB.PAGE_TRANSITIONS),
        signature_details: R.picks(WEB.SIGNATURE_DETAILS, R.int(2, 3)),
        palette: colors(palette), fonts: fontsObj(font),
        copy: { brand: b, tagline: R.pick([`${ind.name.split('・')[0]}を、もっと${R.pick(['自由に', '美しく', 'やさしく', '身近に', '確かなものに'])}。`, `${R.pick(['暮らし', '未来', '毎日', '地域', 'あなた'])}に、${R.pick(['確かな技術', 'ひとさじの驚き', 'ちょうどいい心地よさ', '新しい選択肢'])}を。`, 'Since 19' + R.int(50, 99) + ' — 変わらない想いと、変わり続ける技術。']) },
        motion: motions, sfx: sfxList(R, style, R.int(1, 3)), gfx_background: R.pick(style.gfx),
        graphics: R.picks(style.graphics, 3),
        responsive: { breakpoints: '375 / 768 / 1024 / 1440', nav_sp: R.pick(['全画面オーバーレイメニュー', 'ドロワー（右から）', 'ボトムナビ']) },
        level: levelOf(R, motions.length),
        originality: R.pick(ORIGINALITY),
        quality_check: [...R.picks(QUALITY_BASE, 3), 'ページ間の統一感', '問い合わせまで3クリック'],
        tags: [ind.name, style.name, st.name, header.name, hero.name, ...style.keywords.slice(0, 3)],
      };
    },
  },

  uiux: {
    dir: '04-uiux', prefix: 'UI',
    make(R, i) {
      const app = R.pick(UI.APP_TYPES);
      const plat = R.pick(UI.PLATFORMS);
      const sid = R.r() < 0.6 ? R.pick(['glass', 'clay3d', 'tech', 'minimal', 'pop', 'trust', 'pastel', 'brutal', 'neon']) : R.pick(STYLES).id;
      const style = styleById[sid];
      const palette = R.pick(style.palettes);
      const font = R.pick(style.fonts);
      const patterns = R.picks(UI.UX_PATTERNS, R.int(3, 5));
      const b = brand(R);
      return {
        id: `UI-${pad(i)}`, genre: 'uiux',
        title: `${app.name}の${plat.name}UI（${style.name}）`,
        app_type: app.name, platform: plat.name, frame: plat.frame, platform_guide: plat.guide,
        target: app.target, style: style.name, style_id: style.id,
        concept: `${app.target}が${app.name}を「迷わず・気持ちよく」使えるよう、${patterns[0].name}と${patterns[1].name}を軸に体験を設計。「${style.keywords[0]}」を感じるビジュアルで差別化する。`,
        persona: { name: R.pick(['佐藤 美咲', '田中 健太', '鈴木 葵', '高橋 翔', '伊藤 真由', '渡辺 大輔', '山本 さくら', '中村 蓮']), age: R.int(20, 55), goal: R.pick(app.goals), pain: R.pick(['操作が複雑で続かない', '入力項目が多すぎる', 'どこを押せばいいかわからない', '通知が多すぎてうるさい', '画面が文字だらけで疲れる']) },
        screens: app.screens,
        ux_patterns: patterns.map((p) => `${p.name} → 動き:${p.motion}${p.sfx ? ' / 音:' + p.sfx : ''}`),
        ux_laws: R.picks(UI.UX_LAWS, 3),
        components: R.picks(UI.COMPONENTS, 6).map((c) => c.split('（')[0]),
        palette: colors(palette), fonts: fontsObj(font),
        design_tokens: { radius: R.pick(['4px（シャープ）', '8px（標準）', '12px（やわらか）', '20px（ぷっくり）', '999px（ピル）']), spacing: '4pxベース（4/8/12/16/24/32/48）', elevation: R.pick(['影なし・境界線のみ', '柔らかい影2段階', 'ニューモーフィズム風', 'グラス（blur 20px）']), dark_mode: R.r() < 0.6 },
        motion: motionList(R, style, 2, ['ripple']), sfx: [...new Set(patterns.map((p) => p.sfx).filter(Boolean))],
        copy: { brand: b, empty_state: R.pick(['まだ記録がありません。最初の一歩を記録しましょう', '検索結果が見つかりませんでした。キーワードを変えてみてください', 'すべて完了！今日もおつかれさまでした']), error: R.pick(['メールアドレスの形式が正しくありません（例：name@example.com）', '通信できませんでした。電波の良い場所で再度お試しください']) },
        deliverables: R.picks(UI.DELIVERABLES, 5),
        level: levelOf(R, patterns.length),
        originality: R.pick(ORIGINALITY),
        quality_check: ['全状態（通常/押下/無効/読込/エラー/空）', 'タップ領域44px', '主要タスク3タップ以内', ...R.picks(QUALITY_BASE, 2)],
        tags: [app.name, plat.name, style.name, ...patterns.map((p) => p.name.split('（')[0]), ...style.keywords.slice(0, 2)],
      };
    },
  },
};

// ---------- 生成 ----------
function signature(rec) {
  const { id, ...rest } = rec;
  return JSON.stringify([rest.title, rest.palette?.name, rest.fonts?.head, rest.layout || rest.first_view?.pattern || rest.hero || rest.ux_patterns?.[0], rest.copy?.headline || rest.copy?.cta || rest.copy?.tagline || rest.persona?.goal, (rest.motion || []).join()]);
}

for (const [key, G] of Object.entries(GENRES)) {
  if (ONLY && ONLY !== key) continue;
  const outDir = path.join(ROOT, 'genres', G.dir, 'db');
  fs.rmSync(path.join(outDir, 'references'), { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'references'), { recursive: true });
  const seen = new Set();
  const recs = [];
  let attempt = 0;
  const seedBase = [...key].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  while (recs.length < COUNT && attempt < COUNT * 20) {
    const R = mk(seedBase + attempt++);
    const rec = G.make(R, recs.length + 1);
    const sig = signature(rec);
    if (seen.has(sig)) continue;
    seen.add(sig);
    recs.push(rec);
  }
  // シャード書き出し（1ファイル1,000件）
  for (let s = 0; s < recs.length; s += SHARD) {
    const part = recs.slice(s, s + SHARD).map((r) => JSON.stringify(r)).join('\n') + '\n';
    fs.writeFileSync(path.join(outDir, 'references', `part-${pad(s / SHARD + 1, 2)}.jsonl.gz`), zlib.gzipSync(part, { level: 9 }));
  }
  // 軽量インデックス（grep・表計算用）
  fs.writeFileSync(path.join(outDir, 'samples.jsonl'), recs.slice(0, 100).map((r) => JSON.stringify(r, null, 0)).join('\n') + '\n');
  const csv = ['id,title,level'].concat(recs.map((r) => [r.id, r.title, r.level].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')));
  fs.writeFileSync(path.join(outDir, 'index.csv'), csv.join('\n') + '\n');
  // 統計
  const count = (f) => recs.reduce((m, r) => { const k = f(r); m[k] = (m[k] || 0) + 1; return m; }, {});
  const stats = { genre: key, total: recs.length, generated_with: 'tools/build-db.mjs', by_style: count((r) => r.style), by_level: count((r) => r.level), with_motion: recs.filter((r) => (r.motion || []).length).length, with_sfx: recs.filter((r) => (r.sfx || []).length).length };
  fs.writeFileSync(path.join(outDir, 'stats.json'), JSON.stringify(stats, null, 2) + '\n');
  console.log(`✔ ${key}: ${recs.length}件 → genres/${G.dir}/db/references/ (${Math.ceil(recs.length / SHARD)} files)`);
}

// 辞書（モーション・効果音・スタイル）も書き出してCodexが参照できるように
const dict = { styles: STYLES.map(({ id, name, keywords, motions, sfx, graphics, gfx }) => ({ id, name, keywords, motions, sfx, graphics, gfx })), motions: MOTIONS, sfx: SFX, accessibility: ACCESSIBILITY };
fs.writeFileSync(path.join(ROOT, 'knowledge', 'dictionary.json'), JSON.stringify(dict, null, 2) + '\n');
console.log('✔ knowledge/dictionary.json');
