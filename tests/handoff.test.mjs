import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateHandoff, writePlan, verifyPlan, packageDelivery } from '../scripts/lib/handoff.mjs';

const fixture = () => ({
  'brief.md': { schemaVersion: 1, project: { slug: 'sample-studio', title: 'Sample Studio', industry: 'creative' }, audience: 'Local clients', objectives: ['Inquiries'], deliverables: ['Landing page'], constraints: ['No invented claims'], assets: [], requirements: [{ id: 'R1', description: 'Inquiry CTA', acceptance: 'CTA links to contact', verification: 'Playwright click' }] },
  'references.md': { schemaVersion: 1, selection: { industry: 'creative', colors: ['blue'], layout: ['editorial'], animation: ['fade'] }, sources: [{ id: 'S1', url: null, license: 'Original mock study', verified: false, insights: ['Large headings'], fictional: true }] },
  'design-spec.md': { schemaVersion: 1, direction: 'Ocean studio', colors: { accent: '#005588' }, typography: 'System sans', layout: ['hero', 'contact'], components: ['CTA'], responsive: { mobile: 375, tablet: 768, desktop: 1440 }, motion: { description: 'Fade on entry', reducedMotion: 'Disable transitions' } },
  'acceptance.md': { schemaVersion: 1, criteria: [{ id: 'A1', requirementId: 'R1', description: 'Inquiry works', verification: 'Playwright click' }] },
});
async function setup(t, docs = fixture()) {
  const root = await mkdtemp(join(tmpdir(), 'handoff-test-')); t.after(() => rm(root, { recursive: true, force: true }));
  const handoff = join(root, 'handoff'); await mkdir(handoff);
  for (const [name, data] of Object.entries(docs)) await writeFile(join(handoff, name), `# Document\n\n\`\`\`json\n${JSON.stringify(data)}\n\`\`\`\n`);
  return { root, handoff };
}
test('valid handoff produces deterministic ten-role task plan', async t => {
  const { root, handoff } = await setup(t); const validation = await validateHandoff(handoff);
  assert.equal(validation.warnings.length, 1);
  const plan = await writePlan(handoff, join(root, 'plan')); assert.equal(plan.tasks.length, 10); assert.equal(plan.tasks[5].requirements[0].id, 'R1');
  assert.deepEqual(await verifyPlan(handoff, join(root, 'plan/plan.json')), plan);
});
test('malformed JSON and missing documents fail', async t => {
  const { handoff } = await setup(t); await writeFile(join(handoff, 'brief.md'), '```json\n{\n```\n');
  await assert.rejects(validateHandoff(handoff), /malformed JSON/); await rm(join(handoff, 'brief.md')); await assert.rejects(validateHandoff(handoff), /ENOENT/);
});
test('unlinked requirements, unknown crossrefs, placeholders and unsafe slugs fail', async t => {
  for (const mutate of [d => { d['acceptance.md'].criteria[0].requirementId = 'R404'; }, d => { d['brief.md'].requirements.push({ id: 'R2', description: 'Menu', acceptance: 'Opens', verification: 'Click' }); }, d => { d['brief.md'].audience = 'TODO'; }, d => { d['brief.md'].project.slug = '../outside'; }]) {
    const docs = fixture(); mutate(docs); const { handoff } = await setup(t, docs); await assert.rejects(validateHandoff(handoff));
  }
});
test('changed markdown or edited plan invalidates manifest', async t => {
  const { root, handoff } = await setup(t); await writePlan(handoff, join(root, 'plan')); const path = join(root, 'plan/plan.json');
  const plan = JSON.parse(await readFile(path)); plan.tasks[0].action = 'Changed'; await writeFile(path, JSON.stringify(plan)); await assert.rejects(verifyPlan(handoff, path), /Stale or modified/);
  await writePlan(handoff, join(root, 'second')); await writeFile(join(handoff, 'brief.md'), (await readFile(join(handoff, 'brief.md'), 'utf8')) + '\nChange\n'); await assert.rejects(verifyPlan(handoff, join(root, 'second/plan.json')), /Stale/);
});
test('no overwrite and no symlink traversal', async t => {
  const { root, handoff } = await setup(t); await writePlan(handoff, join(root, 'plan')); await assert.rejects(writePlan(handoff, join(root, 'plan')), /refusing overwrite/);
  await symlink(handoff, join(root, 'linked')); await assert.rejects(validateHandoff(join(root, 'linked')), /Symlink/);
});
test('package copies static output only and retains pending review', async t => {
  const { root, handoff } = await setup(t); await writePlan(handoff, join(root, 'plan')); const site = join(root, 'dist'); await mkdir(site);
  await writeFile(join(site, 'index.html'), '<h1>Sample</h1>'); await writeFile(join(site, '.env'), 'secret'); await writeFile(join(site, 'private.txt'), 'private');
  const out = join(root, 'delivery'); await packageDelivery(handoff, join(root, 'plan/plan.json'), site, out);
  const manifest = JSON.parse(await readFile(join(out, 'manifest.json'))); assert.equal(manifest.approvalStatus, 'pending-human-review'); assert.deepEqual(Object.keys(manifest.files), ['site/index.html']);
  await assert.rejects(packageDelivery(handoff, join(root, 'plan/plan.json'), site, out), /refusing overwrite/);
  await assert.rejects(packageDelivery(handoff, join(root, 'plan/plan.json'), site, join(site, 'nested')), /inside site/);
  await symlink(join(site, 'index.html'), join(site, 'link.html')); await assert.rejects(packageDelivery(handoff, join(root, 'plan/plan.json'), site, join(root, 'other')), /Symlink/);
});
