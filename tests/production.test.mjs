import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ROOT, requirements } from '../scripts/lib/production.mjs';
import { createProject } from '../scripts/new-project.mjs';
import { importStitch } from '../scripts/import-stitch.mjs';
import { checkAssets } from '../scripts/check-assets.mjs';
test('明示情報を抽出し、不明項目を仮設定とする', () => {
  const r = requirements('ブランド名：余白\nターゲット: 28〜45歳\n納品形式：ソース');
  assert.equal(r.brand.value,'余白'); assert.equal(r.target.status,'provided'); assert.equal(r.goal.status,'assumption');
});
test('案件生成・上書き防止・手動取込・素材検査', () => {
  const name = `test-${process.pid}`;
  const dir = path.join(ROOT,'projects/client-projects',name);
  const input = fs.mkdtempSync(path.join(os.tmpdir(),'stitch-'));
  try {
    createProject({ name });
    assert.ok(fs.existsSync(path.join(dir,'package-lock.json')));
    assert.ok(!fs.existsSync(path.join(dir,'node_modules')));
    assert.throws(() => createProject({ name }), /既存/);
    assert.throws(() => createProject({ name: '../bad' }), /案件名/);
    assert.deepEqual(checkAssets(dir).errors, []);
    fs.mkdirSync(path.join(dir,'public/assets'),{recursive:true});
    fs.writeFileSync(path.join(dir,'public/assets/test.svg'),'<svg/>');
    assert.equal(checkAssets(dir).errors.length,1);
    fs.writeFileSync(path.join(input,'screen.html'),'<h1>design</h1>');
    fs.writeFileSync(path.join(input,'image.png'),Buffer.from([137,80,78,71]));
    assert.equal(importStitch(dir,input),2);
    assert.deepEqual(fs.readFileSync(path.join(dir,'stitch/import/image.png')),Buffer.from([137,80,78,71]));
    assert.throws(() => importStitch(dir,input),/保護/);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); fs.rmSync(input,{recursive:true,force:true}); }
});
test('秘密情報を含むStitch資料は書込前に拒否', () => {
  const name = `secret-test-${process.pid}`;
  const dir = path.join(ROOT,'projects/client-projects',name);
  const input = fs.mkdtempSync(path.join(os.tmpdir(),'stitch-'));
  try {
    createProject({ name });
    fs.writeFileSync(path.join(input,'config.json'),JSON.stringify({ api_key: 'example-secret-value-not-real' }));
    assert.throws(() => importStitch(dir,input),/秘密情報/);
    assert.ok(!fs.existsSync(path.join(dir,'stitch/import')));
  } finally { fs.rmSync(dir,{recursive:true,force:true}); fs.rmSync(input,{recursive:true,force:true}); }
});
test('3Dテンプレートも初期依存にThreeを含めない', () => {
  const name = `three-test-${process.pid}`;
  const dir = path.join(ROOT,'projects/client-projects',name);
  try {
    createProject({ name, template:'creative-3d' });
    const p = JSON.parse(fs.readFileSync(path.join(dir,'package.json')));
    assert.ok(!p.dependencies.three); assert.ok(fs.existsSync(path.join(dir,'src/Scene.jsx')));
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
