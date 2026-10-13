import fs from 'node:fs';
import path from 'node:path';
import { ROOT, inside } from './lib/production.mjs';
export function checkAssets(project) {
  const dir = inside(ROOT, project);
  const { assets } = JSON.parse(fs.readFileSync(path.join(dir, 'assets.json')));
  if (!Array.isArray(assets)) throw new Error('assetsは配列にしてください');
  const errors = [], warnings = [], registered = new Set();
  for (const a of assets) {
    if (!a.path || registered.has(a.path)) { errors.push('素材パスの欠落・重複'); continue; }
    registered.add(a.path);
    for (const key of ['type','source','creator','rights','modification','review']) if (!a[key]) errors.push(`${a.path}: ${key}未記録`);
    if (a.review !== 'approved') errors.push(`${a.path}: 権利・品質の確認未完了`);
    if (!Object.hasOwn(a, 'alt')) errors.push(`${a.path}: alt未記録`);
    if (!(a.width > 0 && a.height > 0)) errors.push(`${a.path}: 寸法未記録`);
    try { const file = inside(dir, a.path); if (fs.statSync(file).size > 400 * 1024) warnings.push(`${a.path}: 400KB超`); }
    catch { errors.push(`${a.path}: ファイル不存在・範囲外`); }
  }
  const assetDir = path.join(dir, 'public/assets');
  function walk(folder) { if (!fs.existsSync(folder)) return; for (const e of fs.readdirSync(folder, {withFileTypes:true})) { const f = path.join(folder,e.name); if (e.isDirectory()) walk(f); else if (!registered.has(path.relative(dir,f).replaceAll(path.sep,'/'))) errors.push(`${path.relative(dir,f)}: 台帳未登録`); } }
  walk(assetDir);
  return { errors, warnings };
}
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  try { const result = checkAssets(process.argv[2]); console.log(JSON.stringify(result,null,2)); if (result.errors.length) process.exitCode = 1; }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
