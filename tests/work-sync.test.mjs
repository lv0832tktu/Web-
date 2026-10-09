import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

test('Git receipt receives an immutable snapshot and detects source/file conflicts', () => {
  const temp = mkdtempSync(join(tmpdir(), 'work-sync-'));
  const script = resolve('scripts/work-sync.mjs');
  const git = (...args) => execFileSync('git', args, { cwd: temp, encoding: 'utf8' });
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: temp, encoding: 'utf8' });
  try {
    git('init', '--initial-branch=work/example');
    git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
    const handoff = join(temp, 'projects/example/handoff'); mkdirSync(handoff, { recursive: true });
    for (const name of ['brief.md', 'references.md', 'design-spec.md', 'acceptance.md']) writeFileSync(join(handoff, name), `# ${name}\n`);
    git('add', '.'); git('commit', '-m', 'Work handoff');
    assert.equal(run('receive', 'work/example', 'example', 'received').status, 0);
    assert.equal(run('check', 'received').status, 0);
    assert.equal(run('receive', 'work/example', 'example', 'received').status, 1);
    writeFileSync(join(temp, 'received/brief.md'), 'edited');
    assert.match(run('check', 'received').stderr, /input changed/);
    writeFileSync(join(temp, 'received/brief.md'), readFileSync(join(handoff, 'brief.md')));
    writeFileSync(join(handoff, 'brief.md'), 'Work revision'); git('add', '.'); git('commit', '-m', 'revision');
    assert.match(run('check', 'received').stderr, /Source ref changed/);
    assert.equal(run('receive', 'HEAD', '../escape', 'escape').status, 1);
    symlinkSync(temp, join(temp, 'linked'), 'dir');
    assert.match(run('receive', 'HEAD', 'example', 'linked/new-input').stderr, /Symlink forbidden/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
