import { readdir, readFile, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { validateHandoff, filenames } from './lib/handoff.mjs';

let count = 0;
for (const project of await readdir('projects', { withFileTypes: true })) {
  if (project.isSymbolicLink()) throw new Error(`Project symlink not supported: ${project.name}`);
  if (!project.isDirectory()) continue;
  const dir = join('projects', project.name, 'handoff');
  try { if (!(await lstat(dir)).isDirectory()) continue; }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  // Existing prose-only handoffs remain valid for the legacy handoff command.
  let structured = false;
  for (const name of filenames) {
    try { structured ||= /```json/.test(await readFile(join(dir, name), 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  if (!structured) { console.log(`LEGACY ${dir}: presence-only validation; not a production-v1 input`); continue; }
  const result = await validateHandoff(dir);
  count++;
  console.log(`PASS ${dir}`);
  for (const warning of result.warnings) console.warn(warning);
}
if (!count) { console.error('No structured production handoffs validated'); process.exitCode = 1; }
