import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export function inside(base, value) {
  const real = fs.realpathSync(path.resolve(base, value));
  if (real !== base && !real.startsWith(base + path.sep)) throw new Error('リポジトリ外のパスです');
  return real;
}
export function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
}
export function requirements(text) {
  const field = (names, fallback) => {
    for (const name of names) {
      const match = text.match(new RegExp('(?:^|\\n)\\s*(?:-\\s*)?' + name + '[：:]\\s*([^\\n]+)'));
      if (match) return { value: match[1].trim(), status: 'provided' };
    }
    return { value: fallback, status: 'assumption' };
  };
  return {
    brand: field(['ブランド名', '案件名'], '仮ブランド'),
    goal: field(['目的', 'ゴール'], 'サービス理解から問い合わせにつなげる'),
    target: field(['ターゲット', '対象'], 'サービスに関心のある初訪問者'),
    delivery: field(['納品形式', '納品物'], 'Reactソース、ビルド成果物、操作説明'),
    strengths: field(['独自性', '強み'], '固有の価値は要確認'),
    constraints: field(['制約', '注意事項'], '追加の有料APIなし'),
    extraction: '明示ラベルのみ抽出。自由文の解釈はrequirements担当が原文と照合する。'
  };
}
