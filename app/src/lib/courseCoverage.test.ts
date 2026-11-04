import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { PackManifest } from '@langclick/pack-format';

interface Coverage {
	section: string;
	themeCount: number;
	lessons: { lesson: string; theme: number; units: string[] }[];
	sourceOnly: string[];
}

const packs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../packs');
const read = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;
const ledgers = readdirSync(packs).flatMap((pack) => {
	const root = path.join(packs, pack);
	const dir = path.join(root, 'coverage');
	return existsSync(dir)
		? readdirSync(dir).flatMap((file) => {
				const ledger = read<Coverage>(path.join(dir, file));
				return ledger.section ? [{ name: `${pack}/${file}`, root, ledger }] : [];
			})
		: [];
});

it.each(ledgers)(
	'$name maps every theme and registered lesson to its own boards',
	({ root, ledger }) => {
		const manifest = read<PackManifest>(path.join(root, 'pack.json'));
		const offered = manifest.lessons.filter((lesson) => lesson.section === ledger.section);
		expect(offered.length).toBeGreaterThan(0);
		expect(ledger.lessons.map((entry) => entry.lesson).sort()).toEqual(
			offered.map((lesson) => lesson.id).sort()
		);
		expect([...new Set(ledger.lessons.map((entry) => entry.theme))].sort((a, b) => a - b)).toEqual(
			Array.from({ length: ledger.themeCount }, (_, i) => i + 1)
		);
		for (const entry of ledger.lessons) {
			const lesson = offered.find((lesson) => lesson.id === entry.lesson)!;
			expect(entry.units).toEqual(lesson.units);
			expect(entry.units.length).toBeGreaterThan(0);
			for (const unit of entry.units) {
				expect(existsSync(path.join(root, 'units', `${unit}.json`))).toBe(true);
			}
		}
		expect(ledger.sourceOnly.length).toBeGreaterThan(0);
	}
);
