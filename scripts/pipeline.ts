// Reads the work pipeline (docs/pipeline/) and prints it; fails on any invalid file.
// Run: npm run pipeline [status|next|empty]   (Node 22 runs .ts directly — keep syntax erasable)
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  formatPipeline,
  needsResearch,
  nextItem,
  parseExchange,
  parseQueue,
  type Pipeline,
} from '@foundry/core';

const dir = path.resolve(import.meta.dirname, '..', 'docs', 'pipeline');
const errors: string[] = [];
const queues = readdirSync(path.join(dir, 'queues'))
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => {
    try {
      const q = parseQueue(readFileSync(path.join(dir, 'queues', f), 'utf8'), f);
      if (`${q.venture}.json` !== f)
        errors.push(`${f}: venture "${q.venture}" does not match the file name`);
      return [q];
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
      return [];
    }
  });
let pipeline: Pipeline = { exchange: { ideas: [] }, queues };
try {
  pipeline = {
    ...pipeline,
    exchange: parseExchange(readFileSync(path.join(dir, 'exchange.json'), 'utf8')),
  };
} catch (err) {
  errors.push(err instanceof Error ? err.message : String(err));
}
if (errors.length > 0) {
  console.error(`invalid pipeline:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

const command = process.argv[2] ?? 'status';
if (command === 'next') {
  const next = nextItem(pipeline.queues);
  console.log(JSON.stringify(next ?? null, null, 2));
} else if (command === 'empty') {
  console.log(JSON.stringify(needsResearch(pipeline.queues).map((q) => q.venture)));
} else {
  console.log(formatPipeline(pipeline));
}
