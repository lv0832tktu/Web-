#!/usr/bin/env node
/**
 * serve.mjs — ローカル確認用サーバー（依存なし）
 *   npm run serve            → http://localhost:5173/tools/gallery/  （デザインレシピ・ギャラリー）
 *   npm run serve -- 8080    → ポート指定
 * プロジェクトのプレビュー: http://localhost:5173/projects/<フォルダ>/index.html
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/db.mjs';

const port = +(process.argv[2] || process.env.PORT || 5173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.gz': 'application/octet-stream', '.md': 'text/plain; charset=utf-8', '.csv': 'text/csv; charset=utf-8' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/tools/gallery/';
  let f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found: ' + p); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log(`▶ http://localhost:${port}/  （ギャラリー） ／ Ctrl+C で終了`));
