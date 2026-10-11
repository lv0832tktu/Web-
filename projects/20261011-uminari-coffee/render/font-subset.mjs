#!/usr/bin/env node
// ページ内で使う文字だけを含む Google Fonts の URL を作り、index.html / privacy.html に書き込む。
// 文言を変えたら再実行: node projects/20261011-uminari-coffee/render/font-subset.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.html', 'privacy.html', 'main.js'];
const strip = (s) => s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
let text = files.map((f) => strip(fs.readFileSync(path.join(dir, f), 'utf8'))).join('');
// 数字・記号・英字は動的表示（時刻・日付・価格）でも使うので必ず含める
text += '0123456789:–-—・、。「」（）／〜¥,.!?％%ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz送信中…未入力または形式が正しくない項目があります赤枠を確認してください通信環境もう一度お試し';
const chars = [...new Set([...text].filter((c) => !/\s/.test(c)))].sort().join('');
const url = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@700;800&family=Zen+Kaku+Gothic+New:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap&text=' + encodeURIComponent(chars);
const attr = url.replace(/&/g, '&amp;');
for (const f of ['index.html', 'privacy.html']) {
  const p = path.join(dir, f);
  const s = fs.readFileSync(p, 'utf8').replace(/https:\/\/fonts\.googleapis\.com\/css2\?[^"]+/g, attr);
  fs.writeFileSync(p, s);
}
console.log(`✔ ${[...chars].length} 文字でサブセット化（URL ${url.length} 文字）`);
