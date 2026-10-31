// A rule about one language belongs in its pack, so engine code may not name a
// language or contain another script's text. Test files are exempt: their fixtures
// are allowed to be real words.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
// Every package is scanned without being listed, so a new one can't escape.
const ENGINE_DIRS = [
	'app/src',
	...readdirSync(path.join(ROOT, 'packages')).map((name) => `packages/${name}/src`)
];

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const file = path.join(dir, name);
		if (statSync(file).isDirectory()) return sourceFiles(file);
		return /\.(ts|svelte|css|html)$/.test(name) && !/\.test\.ts$/.test(name) ? [file] : [];
	});
}

// A quoted language code, ISO 639-1 or 639-3, alone or with a region or script.
const QUOTED_CODE = `['"](?:uk|ukr|ru|rus|pl|pol|sv|swe|ja|jpn|fi|fin|zh|zho|fr|fra|es|spa)(?:-[\\w-]+)?['"]`;
const NAMED = new RegExp(
	`ukrain|russian|swedish|japanese|polish|finnish|chinese|french|spanish|cyrillic|${QUOTED_CODE}`,
	'i'
);
const OTHER_SCRIPT = /\p{Script=Cyrillic}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Han}/u;

describe('the check itself', () => {
	it.each([
		'lang="uk"',
		'lang="ukr"',
		"'uk-UA'",
		'hreflang="uk-Latn"',
		'lang="ru"',
		"'pl-PL'",
		'Russian'
	])('catches %s', (source) => {
		expect(source.match(NAMED)).not.toBeNull();
	});

	it.each(['lang="en"', "'en-GB'", 'lang={pack.language}', "'pack'", 'overuk'])(
		'leaves %s alone',
		(source) => {
			expect(source.match(NAMED)).toBeNull();
		}
	);
});

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
