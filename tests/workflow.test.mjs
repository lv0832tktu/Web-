import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (script, ...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
test('handoff validates the supplied demo', () => {
  const result = run('scripts/validate-handoff.mjs', 'projects/demo-sui/handoff');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.match(/^OK /gm)?.length, 4);
});
test('handoff rejects missing and whitespace-only artifacts', () => {
  const dir = mkdtempSync(join(tmpdir(), 'handoff-'));
  try {
    let result = run('scripts/validate-handoff.mjs', dir);
    assert.equal(result.status, 1);
    for (const name of ['brief.md', 'references.md', 'design-spec.md', 'acceptance.md']) writeFileSync(join(dir, name), '\n ');
    result = run('scripts/validate-handoff.mjs', dir);
    assert.equal(result.status, 1);
    assert.equal(result.stderr.match(/Missing or empty:/g)?.length, 4);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('reference search handles matching and unmatched queries', () => {
  const match = run('scripts/find-references.mjs', 'green');
  assert.equal(match.status, 0);
  const results = match.stdout.trim().split('\n').map(line => JSON.parse(line));
  assert.ok(results.length > 0);
  assert.ok(results.every(result => result.score > 0 && result.fictional === true));
  const missing = run('scripts/find-references.mjs', 'no-such-reference-1234');
  assert.equal(missing.status, 0);
  assert.match(missing.stdout, /No matching references/);
});
