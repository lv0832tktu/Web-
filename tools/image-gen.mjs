#!/usr/bin/env node
// 画像生成と記録のツール
//
//   save     … 他の手段（Higgsfield など）で生成した画像を保存し、台帳に記録する
//   generate … OpenAI の画像APIで生成して保存・記録する（有料。--confirm が必要）
//
// 台帳: assets/generated/ledger.jsonl（1行1件。AI生成画像の出どころを残す）
//
//   node tools/image-gen.mjs save --url <URL> --out projects/x/assets/hero.png --prompt "..." --model gpt_image_2_5 --via higgsfield
//   node tools/image-gen.mjs generate --prompt "..." --size 1536x1024 --out projects/x/assets/hero.png --confirm

import { mkdir, writeFile, appendFile, access } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = resolve(ROOT, 'assets/generated/ledger.jsonl');

const USAGE = `使い方:
  node tools/image-gen.mjs save --out <保存先> --prompt <プロンプト> --model <モデル> [--url <画像URL>] [--via higgsfield]
  node tools/image-gen.mjs generate --prompt <プロンプト> --out <保存先> [--size 1024x1024] [--quality low|medium|high|auto]
                                    [--model gpt-image-1] [--n 1] [--dry-run] [--confirm]`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { args._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function fail(msg) {
  console.error(`エラー: ${msg}\n\n${USAGE}`);
  process.exit(1);
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function record(entry) {
  await mkdir(dirname(LEDGER), { recursive: true });
  await appendFile(LEDGER, JSON.stringify({ at: new Date().toISOString(), ai_generated: true, ...entry }) + '\n');
  console.log(`記録しました: ${relative(ROOT, LEDGER)}`);
}

// 1枚目は --out、2枚目以降は hero-2.png のように番号を付ける
function outPath(out, i) {
  if (i === 0) return out;
  const m = out.match(/^(.*?)(\.[^./]+)?$/);
  return `${m[1]}-${i + 1}${m[2] ?? ''}`;
}

async function save(args) {
  if (!args.out) fail('--out を指定してください');
  if (!args.prompt) fail('--prompt を指定してください');
  if (!args.model) fail('--model を指定してください');
  const out = resolve(process.cwd(), args.out);

  if (args.url) {
    const res = await fetch(args.url);
    if (!res.ok) fail(`ダウンロードに失敗しました（HTTP ${res.status}）`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    console.log(`保存しました: ${relative(ROOT, out)}`);
  } else if (!(await exists(out))) {
    console.log(`注意: ${relative(ROOT, out)} はまだありません。記録だけ残します。`);
  }

  await record({
    file: relative(ROOT, out),
    prompt: args.prompt,
    model: args.model,
    via: args.via ?? 'unknown',
    source_url: args.url ?? null,
  });
}

async function generate(args) {
  if (!args.prompt) fail('--prompt を指定してください');
  if (!args.out) fail('--out を指定してください');
  const body = {
    model: args.model ?? process.env.IMAGE_MODEL ?? 'gpt-image-1',
    prompt: args.prompt,
    size: args.size ?? '1024x1024',
    quality: args.quality ?? 'medium',
    n: Number(args.n ?? 1),
  };

  if (args['dry-run']) {
    console.log('送信内容（APIは呼んでいません）:');
    console.log(JSON.stringify(body, null, 2));
    return;
  }
  if (!args.confirm) {
    fail('画像APIは有料です。人間の承認を得てから --confirm を付けて実行してください（内容の確認は --dry-run）');
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) fail('環境変数 OPENAI_API_KEY が設定されていません');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) fail(`APIエラー（HTTP ${res.status}）: ${json.error?.message ?? '不明なエラー'}`);

  const out = resolve(process.cwd(), args.out);
  await mkdir(dirname(out), { recursive: true });
  for (const [i, item] of (json.data ?? []).entries()) {
    const file = outPath(out, i);
    if (item.b64_json) await writeFile(file, Buffer.from(item.b64_json, 'base64'));
    else if (item.url) await writeFile(file, Buffer.from(await (await fetch(item.url)).arrayBuffer()));
    else continue;
    console.log(`保存しました: ${relative(ROOT, file)}`);
    await record({
      file: relative(ROOT, file),
      prompt: body.prompt,
      model: body.model,
      via: 'openai-api',
      size: body.size,
      quality: body.quality,
    });
  }
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0];
if (command === 'save') await save(args);
else if (command === 'generate') await generate(args);
else fail('save か generate を指定してください');
