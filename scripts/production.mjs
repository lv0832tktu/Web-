import { validateHandoff, writePlan, verifyPlan, packageDelivery } from './lib/handoff.mjs';

const [command, ...args] = process.argv.slice(2);
try {
  if (command === 'validate' && args.length === 1) {
    const result = await validateHandoff(args[0]); console.log(JSON.stringify({ valid: true, inputManifest: result.inputManifest, warnings: result.warnings }, null, 2));
  } else if (command === 'plan' && args.length === 2) console.log(JSON.stringify(await writePlan(...args), null, 2));
  else if (command === 'verify' && args.length === 2) { await verifyPlan(...args); console.log('Current handoff and plan match'); }
  else if (command === 'package' && args.length === 4) console.log(JSON.stringify(await packageDelivery(...args), null, 2));
  else throw new Error('Usage: production validate <handoff-dir> | plan <handoff-dir> <new-output-dir> | verify <handoff-dir> <plan.json> | package <handoff-dir> <plan.json> <built-site-dir> <new-output-dir>');
} catch (error) { console.error(error.message); process.exitCode = 1; }
