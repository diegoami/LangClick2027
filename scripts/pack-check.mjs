#!/usr/bin/env node
// Prepares one checker's record for a pack: every piece of content, with the exact
// text it has now, so a checker fills in verdicts and copies nothing by hand. A
// verdict survives only while the content it judged is unchanged.
//
//   node scripts/pack-check.mjs uk claude-sonnet-5-5           # write or update the record
//   node scripts/pack-check.mjs uk claude-sonnet-5-5 --pending # list what still needs a verdict

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkTargets } from '../packages/pack-format/src/index.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [packId, checker, flag] = process.argv.slice(2);
if (!packId || !checker) {
	console.error('Usage: node scripts/pack-check.mjs <pack> <checker> [--pending]');
	process.exit(1);
}

const packDir = path.join(ROOT, 'packs', packId);
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const jsonIn = (dir) =>
	existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];

const units = jsonIn(path.join(packDir, 'units')).map((f) =>
	readJson(path.join(packDir, 'units', f))
);
const layers = {};
for (const name of readdirSync(path.join(packDir, 'layers'))) {
	const dir = path.join(packDir, 'layers', name);
	layers[name] = {
		course: readJson(path.join(dir, 'course.json')),
		units: Object.fromEntries(
			jsonIn(path.join(dir, 'units')).map((f) => [
				f.replace(/\.json$/, ''),
				readJson(path.join(dir, 'units', f))
			])
		)
	};
}

const file = path.join(packDir, 'checks', `${checker}.json`);
const previous = existsSync(file) ? readJson(file) : { entries: [] };
const byKey = new Map(previous.entries.map((entry) => [entry.key, entry]));

const entries = checkTargets(units, layers).map(({ key, seen }) => {
	const old = byKey.get(key);
	if (old?.seen === seen) return old;
	return { key, seen, verdict: 'pending' };
});

mkdirSync(path.dirname(file), { recursive: true });
writeFileSync(file, `${JSON.stringify({ checker, entries }, null, '\t')}\n`);

const pending = entries.filter((entry) => entry.verdict === 'pending');
const problems = entries.filter((entry) => entry.verdict === 'problem');
console.log(
	`${checker}: ${entries.length} entries, ${pending.length} pending, ${problems.length} problems`
);
if (flag === '--pending') for (const entry of pending) console.log(entry.key);
