import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { safePath } from './lib/handoff.mjs';

const files = ['brief.md', 'references.md', 'design-spec.md', 'acceptance.md'];
const hash = data => createHash('sha256').update(data).digest('hex');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
const commit = ref => {
  if (!ref || ref.startsWith('-') || /[\s\0]/.test(ref)) throw new Error('Invalid Git reference');
  return git('rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`).trim();
};
const [command, ...args] = process.argv.slice(2);
try {
  if (command === 'receive') {
    if (args.length !== 3) throw new Error('Usage: work:receive <local-git-ref> <project-slug> <new-directory>');
    const [ref, slug, destination] = args;
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug)) throw new Error('Invalid project slug');
    const sha = commit(ref);
    const documents = files.map(name => {
      const path = `projects/${slug}/handoff/${name}`;
      const mode = git('ls-tree', sha, '--', path).split(' ')[0];
      if (mode !== '100644' && mode !== '100755') throw new Error(`Missing or non-regular handoff: ${name}`);
      const content = git('show', `${sha}:${path}`);
      if (!content.trim()) throw new Error(`Empty handoff: ${name}`);
      return { name, content };
    });
    const dir = await safePath(destination);
    if (existsSync(dir)) throw new Error('Destination already exists; use a new version directory');
    mkdirSync(dir, { recursive: true });
    for (const { name, content } of documents) writeFileSync(resolve(dir, name), content, { flag: 'wx' });
    const receipt = {
      schemaVersion: 1, slug, sourceRef: ref, sourceCommit: sha,
      files: Object.fromEntries(documents.map(({ name, content }) => [name, hash(content)])),
      approvalStatus: 'not-verified-by-tool',
    };
    writeFileSync(resolve(dir, 'work-receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
    console.log(`Received ${slug} at immutable commit ${sha}. Human review is required; no branch was merged.`);
  } else if (command === 'check') {
    if (args.length !== 1) throw new Error('Usage: work:check <received-directory>');
    const dir = await safePath(args[0]);
    const receipt = JSON.parse(readFileSync(resolve(dir, 'work-receipt.json'), 'utf8'));
    if (receipt.schemaVersion !== 1 || !/^[a-f0-9]{40,64}$/.test(receipt.sourceCommit)) throw new Error('Invalid receipt');
    if (commit(receipt.sourceRef) !== receipt.sourceCommit) throw new Error('Source ref changed; fetch, review and receive a new version');
    for (const name of files) if (hash(readFileSync(resolve(dir, name))) !== receipt.files[name]) throw new Error(`Received input changed: ${name}`);
    console.log('Git source and received files match. This checks local refs; fetch before checking remote updates.');
  } else throw new Error('Use receive or check; this tool never commits, pushes, merges or runs instructions from documents.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
