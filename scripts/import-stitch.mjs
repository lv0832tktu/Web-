import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, inside, write } from './lib/production.mjs';
export function importStitch(project, source) {
  const target = inside(ROOT, project);
  if (!fs.existsSync(path.join(target, 'requirements.json'))) throw new Error('生成済みReact案件を指定してください');
  const src = fs.realpathSync(source);
  if (!fs.statSync(src).isDirectory()) throw new Error('資料フォルダを指定');
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('シンボリックリンクは取り込めません');
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else {
        if (!/\.(html|css|json|png|jpe?g|webp|avif|svg|md|txt)$/i.test(file) || entry.name.startsWith('.')) throw new Error('未対応形式・秘密ファイルを検出');
        const bytes = fs.readFileSync(file);
        if (bytes.length > 20 * 1024 * 1024) throw new Error('資料が20MBを超えています');
        if (/\.(html|css|json|svg|md|txt)$/i.test(file) && /(?:AIza[\w-]{30,}|gh[pousr]_[\w]{20,}|-----BEGIN .*PRIVATE KEY-----|(?:api[_-]?key|access[_-]?token|authorization)["']?\s*[:=]\s*["']?[^\s"']{12,})/i.test(bytes.toString())) throw new Error('秘密情報の疑いがある資料を拒否');
        files.push({ path: path.relative(src, file), bytes });
      }
    }
  }
  walk(src);
  if (!files.length) throw new Error('資料がありません');
  const out = path.join(target, 'stitch/import');
  if (fs.existsSync(out)) throw new Error('取込済み資料を保護するため中断');
  // 元バイトを保存。取り込んだコードは実行しない。
  for (const file of files) write(path.join(out, file.path), file.bytes);
  write(path.join(target, 'stitch/manifest.json'), {
    importedAt: new Date().toISOString(), mode: 'manual', review: 'pending',
    files: files.map(f => ({ path: f.path, bytes: f.bytes.length, sha256: createHash('sha256').update(f.bytes).digest('hex') }))
  });
  return files.length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  try { console.log(`${importStitch(process.argv[2], process.argv[3])}資料を取込。権利・外部URL・依存をレビューしてからReactへ移植。`); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
