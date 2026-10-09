import {readFileSync} from 'node:fs';
import {parseReferenceArgs, selectReferences} from './lib/references.mjs';

try {
  const options = parseReferenceArgs(process.argv.slice(2));
  const entries = JSON.parse(readFileSync(new URL('../references/catalog.json', import.meta.url), 'utf8'));
  const matches = selectReferences(entries, options);
  for (const entry of matches) console.log(JSON.stringify(entry));
  if (!matches.length) console.log('No matching references. Verify external references and license before adding.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
