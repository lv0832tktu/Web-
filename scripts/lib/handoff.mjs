import { readFile, lstat, realpath, mkdir, writeFile, readdir, copyFile } from 'node:fs/promises';
import { resolve, join, relative, extname, isAbsolute, sep } from 'node:path';
import { createHash } from 'node:crypto';

export const filenames = ['brief.md', 'references.md', 'design-spec.md', 'acceptance.md'];
export const roles = ['director', 'researcher', 'ux', 'art-director', 'copy-seo', 'frontend', 'motion', 'responsive', 'qa', 'delivery'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const string = (value, label) => assert(typeof value === 'string' && value.trim() && !/^(?:todo|tbd|placeholder|未定|要記入)$/i.test(value.trim()), `${label}: nonempty concrete string required`);
const strings = (value, label, empty = false) => { assert(Array.isArray(value) && (empty || value.length), `${label}: array required`); value.forEach(v => string(v, label)); };
const object = (value, label) => assert(value && typeof value === 'object' && !Array.isArray(value), `${label}: object required`);

// Reject every symlink component, including ancestors, rather than trusting realpath alone.
export async function safePath(path) {
  const absolute = resolve(path);
  let current = absolute;
  while (true) {
    try { assert(!(await lstat(current)).isSymbolicLink(), `Symlink forbidden: ${current}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return absolute;
}

export async function validateHandoff(directory) {
  const root = await safePath(directory);
  const documents = {}, inputManifest = {};
  for (const name of filenames) {
    const path = await safePath(join(root, name));
    assert((await lstat(path)).isFile(), `Regular file required: ${name}`);
    const bytes = await readFile(path);
    const blocks = [...bytes.toString('utf8').matchAll(/^```json\s*\n([\s\S]*?)^```\s*$/gm)];
    assert(blocks.length === 1, `${name}: exactly one fenced json block required`);
    try { documents[name] = JSON.parse(blocks[0][1]); }
    catch { throw new Error(`${name}: malformed JSON`); }
    object(documents[name], name);
    assert(documents[name].schemaVersion === 1, `${name}: schemaVersion must be 1`);
    inputManifest[name] = hash(bytes);
  }
  const brief = documents['brief.md'], references = documents['references.md'], design = documents['design-spec.md'], acceptance = documents['acceptance.md'];
  object(brief.project, 'project');
  ['slug', 'title', 'industry'].forEach(k => string(brief.project[k], `project.${k}`));
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(brief.project.slug), 'Unsafe project slug');
  string(brief.audience, 'audience');
  ['objectives', 'deliverables', 'constraints'].forEach(k => strings(brief[k], k));
  strings(brief.assets, 'assets', true);
  const ids = new Set();
  assert(Array.isArray(brief.requirements) && brief.requirements.length, 'requirements required');
  brief.requirements.forEach(r => {
    object(r, 'requirement');
    ['id', 'description', 'acceptance', 'verification'].forEach(k => string(r[k], `requirement.${k}`));
    assert(/^[A-Za-z0-9_-]+$/.test(r.id) && !ids.has(r.id), 'Invalid or duplicate requirement id'); ids.add(r.id);
  });
  object(references.selection, 'selection'); string(references.selection.industry, 'selection.industry');
  ['colors', 'layout', 'animation'].forEach(k => strings(references.selection[k], `selection.${k}`));
  assert(Array.isArray(references.sources) && references.sources.length, 'sources required');
  const sourceIds = new Set();
  references.sources.forEach(s => {
    object(s, 'source'); string(s.id, 'source.id'); string(s.license, 'source.license'); strings(s.insights, 'source.insights');
    assert(!sourceIds.has(s.id), 'Duplicate source id'); sourceIds.add(s.id);
    assert(typeof s.verified === 'boolean' && typeof s.fictional === 'boolean', 'Source verified/fictional booleans required');
    if (s.url === null) assert(s.fictional, 'Real reference requires source URL');
    else { string(s.url, 'source.url'); let url; try { url = new URL(s.url); } catch { throw new Error('Invalid source URL'); } assert(url.protocol === 'https:' && !url.username && !url.password, 'HTTPS source URL without credentials required'); }
  });
  string(design.direction, 'direction'); object(design.colors, 'colors'); assert(Object.keys(design.colors).length, 'colors required'); Object.values(design.colors).forEach(v => string(v, 'color'));
  string(design.typography, 'typography'); strings(design.layout, 'layout'); strings(design.components, 'components');
  object(design.responsive, 'responsive'); ['mobile', 'tablet', 'desktop'].forEach(k => assert(Number.isInteger(design.responsive[k]) && design.responsive[k] >= 320 && design.responsive[k] <= 3840, `Invalid responsive.${k}`));
  assert(design.responsive.mobile < design.responsive.tablet && design.responsive.tablet < design.responsive.desktop, 'Responsive widths must increase');
  object(design.motion, 'motion'); string(design.motion.description, 'motion.description'); string(design.motion.reducedMotion, 'motion.reducedMotion');
  assert(Array.isArray(acceptance.criteria) && acceptance.criteria.length, 'criteria required');
  const criteriaIds = new Set(), linked = new Set();
  acceptance.criteria.forEach(c => {
    object(c, 'criterion'); ['id', 'requirementId', 'description', 'verification'].forEach(k => string(c[k], `criterion.${k}`));
    assert(/^[A-Za-z0-9_-]+$/.test(c.id) && !criteriaIds.has(c.id), 'Invalid or duplicate criterion id'); criteriaIds.add(c.id);
    assert(ids.has(c.requirementId), `Unknown requirement: ${c.requirementId}`); linked.add(c.requirementId);
  });
  assert([...ids].every(id => linked.has(id)), 'Every requirement needs acceptance linkage');
  return { documents, inputManifest, warnings: references.sources.filter(s => !s.verified).map(s => `Reference ${s.id} needs human URL/license verification`) };
}

export function createPlan(validated) {
  const b = validated.documents['brief.md'], d = validated.documents['design-spec.md'], a = validated.documents['acceptance.md'];
  const actions = {
    director: `Confirm scope: ${b.deliverables.join('; ')}`,
    researcher: 'Verify reference URLs/licenses and record evidence; do not copy protected assets',
    ux: `Define navigation and CTA journey for ${b.audience}; sections: ${d.layout.join('; ')}`,
    'art-director': `Apply unique direction: ${d.direction}; typography: ${d.typography}`,
    'copy-seo': `Write factual headings, metadata, alt text for objectives: ${b.objectives.join('; ')}`,
    frontend: `Implement semantic components: ${d.components.join('; ')}`,
    motion: `Implement ${d.motion.description}; reduced motion: ${d.motion.reducedMotion}`,
    responsive: `Capture and inspect widths ${Object.values(d.responsive).join(', ')}; check overflow and touch targets`,
    qa: 'Run typecheck, ESLint, unit tests, build, Playwright and accessibility; retain logs and failure reasons',
    delivery: 'Review asset licenses and links; package verified static output; request human PR review',
  };
  return { schemaVersion: 1, project: b.project, approvalStatus: 'pending-human-review', inputManifest: validated.inputManifest, warnings: validated.warnings,
    tasks: roles.map((role, index) => ({ id: `task-${index + 1}`, role, action: actions[role], dependsOn: index ? [`task-${index}`] : [], requirements: b.requirements.map(r => ({ ...r })), acceptance: a.criteria.map(c => ({ ...c })), status: 'pending' })) };
}

export async function writePlan(directory, outputDirectory) {
  const plan = createPlan(await validateHandoff(directory));
  const out = await createOutput(outputDirectory);
  await writeFile(join(out, 'plan.json'), JSON.stringify(plan, null, 2) + '\n', { flag: 'wx' });
  await writeFile(join(out, 'tasks.md'), `# ${plan.project.title}\n\n${plan.tasks.map(t => `## ${t.id}: ${t.role}\n${t.action}\n\n${t.requirements.map(r => `- ${r.id}: ${r.description} — ${r.acceptance}; verify: ${r.verification}`).join('\n')}`).join('\n\n')}\n`, { flag: 'wx' });
  return plan;
}
async function createOutput(directory) {
  const out = await safePath(directory);
  try { await lstat(out); throw new Error(`Output exists; refusing overwrite: ${out}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(out, { recursive: true }); return out;
}
export async function verifyPlan(directory, planPath) {
  const validated = await validateHandoff(directory);
  const plan = JSON.parse(await readFile(await safePath(planPath), 'utf8'));
  const expected = createPlan(validated);
  assert(JSON.stringify(plan) === JSON.stringify(expected), 'Stale or modified plan; regenerate from current handoff');
  return plan;
}
export async function packageDelivery(directory, planPath, siteDirectory, outputDirectory) {
  const plan = await verifyPlan(directory, planPath);
  const site = await realpath(await safePath(siteDirectory));
  assert((await lstat(site)).isDirectory(), 'Site directory required');
  const outPath = await safePath(outputDirectory), rel = relative(site, outPath);
  assert(rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel), 'Output cannot be inside site');
  const files = [];
  async function scan(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      assert(!entry.isSymbolicLink(), `Symlink forbidden: ${entry.name}`);
      if (entry.name.startsWith('.') || ['node_modules', 'secrets'].includes(entry.name) || /(?:^|[-_.])(?:secret|secrets|credentials|tokens?|private[-_]keys?)(?:[-_.]|$)/i.test(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await scan(path);
      else if (entry.isFile() && (['.html', '.css', '.js', '.svg', '.woff', '.woff2', '.ttf', '.json', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico'].includes(extname(entry.name).toLowerCase()) || entry.name === 'LICENSE')) files.push(path);
    }
  }
  await scan(site);
  assert(files.some(p => relative(site, p) === 'index.html'), 'Built site index.html required');
  const out = await createOutput(outPath), manifest = {};
  for (const path of files.sort()) {
    const name = relative(site, path), target = join(out, 'site', name);
    await mkdir(resolve(target, '..'), { recursive: true }); await copyFile(path, target); manifest[`site/${name}`] = hash(await readFile(target));
  }
  await writeFile(join(out, 'manifest.json'), JSON.stringify({ project: plan.project, inputManifest: plan.inputManifest, files: manifest, approvalStatus: 'pending-human-review' }, null, 2) + '\n', { flag: 'wx' });
  await writeFile(join(out, 'README.md'), `# ${plan.project.title} delivery\n\nStatic output is in site/. Review licenses, validation evidence, functionality and hosting configuration before publication. Packaging does not certify tests passed or approve deployment. Handoff checksums are recorded in manifest.json.\n`, { flag: 'wx' });
  return { files: files.length, output: out };
}
