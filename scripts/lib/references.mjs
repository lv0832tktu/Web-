const FACETS = ['industry', 'colors', 'layout', 'animation'];
const SEARCH_FIELDS = ['id', 'title', 'industry', 'genre', 'colors', 'layout', 'typography', 'animation', 'notes'];
const normalize = (value) => String(value).trim().toLowerCase();

export function parseReferenceArgs(args) {
  const options = {keywords: [], limit: undefined};
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      options.keywords.push(arg);
      continue;
    }
    const [flag, inline] = arg.slice(2).split(/=(.*)/s);
    if (![...FACETS, 'limit'].includes(flag)) throw new Error(`Unknown reference flag: --${flag}`);
    if (Object.hasOwn(options, flag) && options[flag] !== undefined) throw new Error(`Duplicate reference flag: --${flag}`);
    const value = inline === undefined ? args[++index] : inline;
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${flag}`);
    if (flag === 'limit') {
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
        throw new Error('--limit must be a positive safe integer');
      }
      options.limit = Number(value);
    } else {
      const values = value.split(',').map(normalize);
      if (values.some((item) => !item)) throw new Error(`Empty value for --${flag}`);
      options[flag] = [...new Set(values)];
    }
  }
  return options;
}

/** Facets use AND across dimensions and OR within a dimension. Each matched
 * facet contributes 10 points; each keyword/field match contributes 1 point.
 * Ties are resolved by ID, independent of catalog insertion order. */
export function selectReferences(entries, options = {}) {
  const keywords = [...new Set((options.keywords ?? []).map(normalize).filter(Boolean))];
  const matches = [];
  for (const entry of entries) {
    const matchedFields = {};
    let score = 0;
    let eligible = true;
    for (const field of FACETS) {
      const requested = options[field];
      if (!requested?.length) continue;
      const actual = (Array.isArray(entry[field]) ? entry[field] : [entry[field]]).map(normalize);
      const matched = requested.map(normalize).filter((value) => actual.includes(value));
      if (!matched.length) { eligible = false; break; }
      matchedFields[field] = {values: matched, score: 10};
      score += 10;
    }
    if (!eligible) continue;
    let keywordScore = 0;
    for (const field of SEARCH_FIELDS) {
      const content = normalize(Array.isArray(entry[field]) ? entry[field].join(' ') : entry[field] ?? '');
      const matched = keywords.filter((word) => content.includes(word));
      if (!matched.length) continue;
      keywordScore += matched.length;
      const facet = matchedFields[field];
      matchedFields[field] = {...facet, keywords: matched, score: (facet?.score ?? 0) + matched.length};
    }
    if (keywords.length && !keywordScore) continue;
    score += keywordScore;
    matches.push({...entry, score, matchedFields, provenance: {
      referenceUrl: entry.referenceUrl ?? null,
      fictional: entry.fictional,
      sourceVerification: entry.sourceVerification ?? 'unverified',
      license: entry.license ?? {status: 'unverified', usage: entry.usage ?? null},
    }});
  }
  matches.sort((left, right) => right.score - left.score || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  return matches.slice(0, options.limit);
}
