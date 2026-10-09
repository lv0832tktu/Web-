import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {parseReferenceArgs, selectReferences} from '../scripts/lib/references.mjs';

const catalog = JSON.parse(readFileSync(new URL('../references/catalog.json', import.meta.url), 'utf8'));
test('facet filtering combines dimensions with AND and values with OR', () => {
  const results = selectReferences(catalog, parseReferenceArgs(['--industry', 'cafe,dental', '--colors', 'cream,white', '--layout', 'menu-grid', '--animation', 'reveal']));
  assert.deepEqual(results.map((entry) => entry.id), ['demo-cafe-05']);
  assert.equal(results[0].score, 40);
  assert.deepEqual(results[0].matchedFields.colors, {values: ['cream'], score: 10});
  assert.equal(selectReferences(catalog, {industry: ['dental'], colors: ['charcoal']}).length, 0);
});
test('ranking explains keyword field contributions and resolves ties deterministically', () => {
  const entries = [{id: 'z', title: 'cafe', industry: 'cafe'}, {id: 'a', title: 'cafe', industry: 'cafe'}, {id: 'b', title: 'cafe', industry: 'other'}];
  const results = selectReferences(entries, {keywords: ['CAFE']});
  assert.deepEqual(results.map((entry) => [entry.id, entry.score]), [['a', 2], ['z', 2], ['b', 1]]);
  assert.deepEqual(results[0].matchedFields.title, {keywords: ['cafe'], score: 1});
  assert.deepEqual(selectReferences(entries.reverse(), {keywords: ['cafe'], limit: 1}).map((entry) => entry.id), ['a']);
});
test('parser keeps positional keywords and supports inline flags', () => {
  assert.deepEqual(parseReferenceArgs(['green', '--colors=cream,forest-green', '--limit', '2']), {keywords: ['green'], colors: ['cream', 'forest-green'], limit: 2});
});
test('invalid and ambiguous CLI options fail explicitly', () => {
  for (const args of [['--unknown', 'a'], ['--limit', '0'], ['--limit', '-1'], ['--limit', '1.5'], ['--limit', 'Infinity'], ['--limit', '9007199254740993'], ['--colors', 'cream,'], ['--layout'], ['--industry', '--colors'], ['--limit', '1', '--limit', '2']]) {
    assert.throws(() => parseReferenceArgs(args));
  }
  const result = spawnSync(process.execPath, ['scripts/find-references.mjs', '--limit', '0'], {encoding: 'utf8'});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /positive safe integer/);
});
test('CLI emits compatible JSON fields and explicit fictional provenance', () => {
  const result = spawnSync(process.execPath, ['scripts/find-references.mjs', '--industry', 'dental', '--limit', '1'], {encoding: 'utf8'});
  assert.equal(result.status, 0);
  const entry = JSON.parse(result.stdout);
  for (const field of ['score', 'id', 'title', 'fictional', 'notes', 'matchedFields', 'provenance']) assert.ok(Object.hasOwn(entry, field));
  assert.equal(entry.provenance.referenceUrl, null);
  assert.equal(entry.provenance.sourceVerification, 'fictional-internal-no-external-source');
  assert.equal(entry.provenance.license.status, 'internal-concept-only');
});
