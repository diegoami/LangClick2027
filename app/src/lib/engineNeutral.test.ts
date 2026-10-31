// A rule about one language belongs in its pack, so engine code may not name a
// language or contain another script's text. Test files are exempt: their fixtures
// are allowed to be real words.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ENGINE_DIRS = [
	'app/src',
	'packages/srs/src',
	'packages/quiz-engine/src',
	'packages/pack-format/src'
];

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const file = path.join(dir, name);
		if (statSync(file).isDirectory()) return sourceFiles(file);
		return /\.(ts|svelte|css|html)$/.test(name) && !/\.test\.ts$/.test(name) ? [file] : [];
	});
}

const NAMED = /ukrain|swedish|japanese|polish|finnish|chinese|french|spanish|cyrillic|['"]uk['"]/i;
const OTHER_SCRIPT = /\p{Script=Cyrillic}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Han}/u;

describe('the engine', () => {
	const files = ENGINE_DIRS.flatMap((dir) => sourceFiles(path.join(ROOT, dir)));

	it('has source files to scan', () => {
		expect(files.length).toBeGreaterThan(10);
	});

	it.each(files.map((file) => [path.relative(ROOT, file), file]))(
		'%s names no language',
		(_name, file) => {
			const source = readFileSync(file, 'utf8');
			expect(source.match(NAMED)?.[0]).toBeUndefined();
			expect(source.match(OTHER_SCRIPT)?.[0]).toBeUndefined();
		}
	);
});
