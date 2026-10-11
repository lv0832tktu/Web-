// デザインレシピDBの読み込み・検索（search.mjs / new-project.mjs / gallery 共通）
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const GENRES = {
  'banner-sns': { dir: '01-banner-sns', label: 'バナー・サムネイル・SNS画像', templates: ['display-banner', 'sns-post', 'youtube-thumbnail'] },
  lp: { dir: '02-lp', label: 'LP（ランディングページ）', templates: ['lp-standard'] },
  website: { dir: '03-website', label: 'Webサイト・ホームページ', templates: ['corporate'] },
  uiux: { dir: '04-uiux', label: 'UI/UXデザイン', templates: ['app-prototype', 'dashboard'] },
};
export const ALIASES = { banner: 'banner-sns', sns: 'banner-sns', thumbnail: 'banner-sns', 'banner-sns': 'banner-sns', lp: 'lp', web: 'website', website: 'website', hp: 'website', ui: 'uiux', ux: 'uiux', uiux: 'uiux', app: 'uiux' };

// よくある言い換え（検索ヒット率を上げる）
const SYNONYMS = {
  歯医者: '歯科', デンタル: '歯科', 美容院: '美容室', ヘアサロン: '美容室', サロン: 'サロン', 整体: 'クリニック', 病院: 'クリニック', 医院: 'クリニック',
  パーソナルトレーニング: 'パーソナルジム', フィットネスジム: 'フィットネス', 塾: 'スクール', 教室: 'スクール', 学校: 'スクール', 工務店: '工務店', 住宅: '住宅',
  不動産会社: '不動産', ホテル: 'ホテル', 旅館: '旅館', 飲食店: 'レストラン', 居酒屋: '居酒屋', カフェ: 'カフェ', パン屋: 'ベーカリー', 化粧品: 'コスメ',
  採用サイト: '採用', 求人: '採用', リクルート: '採用', 高級感: '高級', おしゃれ: 'おしゃれ', シンプル: 'シンプル', かわいい: 'かわいい', 可愛い: 'かわいい',
  インスタ: 'Instagram', インスタグラム: 'Instagram', ツイッター: 'X', youtube: 'YouTube', サムネ: 'サムネイル', ストーリー: 'ストーリーズ', リール: 'リール',
  ダーク: 'ダーク', 黒: '黒', 和風: '和', 青: 'ブルー', アプリ: 'アプリ', 管理画面: 'ダッシュボード', ec: 'EC', ネットショップ: 'EC', 通販: 'EC',
};

export function resolveGenre(g) {
  if (!g || g === 'all') return Object.keys(GENRES);
  const k = ALIASES[g.toLowerCase()];
  if (!k) throw new Error(`不明なジャンル: ${g}（banner-sns / lp / website / uiux）`);
  return [k];
}

const cache = new Map();
export function load(genre) {
  if (cache.has(genre)) return cache.get(genre);
  const dir = path.join(ROOT, 'genres', GENRES[genre].dir, 'db', 'references');
  if (!fs.existsSync(dir)) throw new Error(`DBがありません。先に npm run build:db を実行してください（${dir}）`);
  const recs = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jsonl.gz')).sort()) {
    zlib.gunzipSync(fs.readFileSync(path.join(dir, f))).toString('utf8').split('\n').forEach((l) => { if (l.trim()) recs.push(JSON.parse(l)); });
  }
  cache.set(genre, recs);
  return recs;
}

export function normalize(words) {
  return words.flatMap((w) => w.split(/[\s,、　]+/)).filter(Boolean).map((w) => SYNONYMS[w] || SYNONYMS[w.toLowerCase()] || w);
}

/**
 * 検索：全キーワードを含むレシピをスコア順に返す（--any で OR 検索）
 * 業種/目的/種別の一致 +6、タイトル/タグ一致 +3、それ以外のフィールド一致 +1、上級・プロは +0.5（高品質を優先）
 */
export function search({ genres, words = [], style, level, format, any = false, limit = 10 }) {
  const kw = normalize(words);
  const out = [];
  for (const g of genres) {
    for (const r of load(g)) {
      if (style && !r.style.includes(style) && r.style_id !== style) continue;
      if (level && !r.level.includes(level)) continue;
      if (format && !(r.format && (r.format.id.includes(format) || r.format.name.includes(format) || `${r.format.width}x${r.format.height}` === format))) continue;
      const core = [r.industry, r.app_type, r.purpose, r.goal, r.site_type, r.format?.name].filter(Boolean).join(' ').toLowerCase();
      const head = (r.title + ' ' + r.tags.join(' ')).toLowerCase();
      const body = JSON.stringify(r).toLowerCase();
      let score = 0, hit = 0;
      for (const w of kw) {
        const lw = w.toLowerCase();
        if (core.includes(lw)) { score += 6; hit++; } else if (head.includes(lw)) { score += 3; hit++; } else if (body.includes(lw)) { score += 1; hit++; }
      }
      if (kw.length && (any ? hit === 0 : hit < kw.length)) continue;
      if (/上級|プロ/.test(r.level)) score += 0.5;
      out.push({ score, r });
    }
  }
  out.sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id));
  return out.slice(0, limit).map((x) => x.r);
}

export function byId(id) {
  const prefix = id.split('-')[0].toUpperCase();
  const g = { BNR: 'banner-sns', LP: 'lp', WEB: 'website', UI: 'uiux' }[prefix];
  if (!g) return null;
  return load(g).find((r) => r.id.toUpperCase() === id.toUpperCase()) || null;
}

// ---------- Google Fonts ----------
// 1ウェイトしかない書体（存在しないウェイトを指定するとGoogle Fontsがエラーを返すため）
const FONT_WEIGHTS = {
  'Dela Gothic One': '400', 'RocknRoll One': '400', 'Rampart One': '400', 'DotGothic16': '400', 'Mochiy Pop One': '400', 'Hachi Maru Pop': '400',
  'Kosugi Maru': '400', 'Yuji Syuku': '400', 'Zen Antique': '400', 'Reggae One': '400', 'Yomogi': '400', 'Bungee': '400', 'Press Start 2P': '400',
  'Righteous': '400', 'Anton': '400', 'Bebas Neue': '400', 'Archivo Black': '400', 'Pacifico': '400', 'Audiowide': '400', 'Patrick Hand': '400',
  'Gochi Hand': '400', 'DM Serif Display': '400', 'Kiwi Maru': '400;500', 'Klee One': '400;600', 'Space Mono': '400;700', 'Kaisei Opti': '400;700', 'Kaisei Decol': '400;700',
};
export function googleFontsUrl(fonts) {
  const fam = [...new Set([fonts.head, fonts.body, fonts.en].filter(Boolean))];
  const q = fam.map((f) => `family=${f.replace(/ /g, '+')}:wght@${FONT_WEIGHTS[f] || '400;700'}`).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
export const fontStack = (f, kind) => `"${f}", ${/Mincho|Serif|Garamond|Cormorant|Playfair|Bodoni|Cinzel|Lora|Antique|Syuku|Kaisei|Old/.test(f) ? '"Hiragino Mincho ProN", serif' : kind === 'en' ? 'sans-serif' : '"Hiragino Sans", sans-serif'}`;

export function tokensCss(rec) {
  const p = rec.palette, f = rec.fonts;
  return `/* デザイントークン — ${rec.id}「${rec.title}」から自動生成
 * パレット: ${p.name}（本文コントラスト ${p.contrast}:1）
 * 書体: 見出し ${f.head} / 本文 ${f.body} / 英字 ${f.en}
 * 色を変えるときはここだけを編集。HTML/CSSに直接HEXを書かないこと。
 */
:root {
  --c-bg: ${p.bg};
  --c-surface: ${p.surface};
  --c-text: ${p.text};
  --c-primary: ${p.primary};
  --c-accent: ${p.accent};
  --c-on-primary: ${p.on_primary};
  --font-head: ${fontStack(f.head)};
  --font-body: ${fontStack(f.body)};
  --font-en: ${fontStack(f.en, 'en')};
}
`;
}
