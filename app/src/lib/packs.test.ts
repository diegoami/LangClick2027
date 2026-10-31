// The gate on pack content: every pack on disk must pass the validator and its
// recorded checks. Data-driven, so a new pack is covered by being there.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	validateChecks,
	validatePack,
	type ContentCheck,
	type PackManifest,
	type Unit
} from '@langclick/pack-format';
import { attemptMatch, createQuizSession } from '@langclick/quiz-engine';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PACKS = path.join(ROOT, 'packs');

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;

function readDir<T>(dir: string): T[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((name) => name.endsWith('.json'))
		.map((name) => readJson<T>(path.join(dir, name)));
}

const packIds = readdirSync(PACKS).filter((name) => statSync(path.join(PACKS, name)).isDirectory());

describe('the packs folder', () => {
	it('has at least one pack', () => {
		expect(packIds.length).toBeGreaterThan(0);
	});
});

describe.each(packIds)('pack %s', (packId) => {
	const manifest = readJson<PackManifest>(path.join(PACKS, packId, 'pack.json'));
	const units = readDir<Unit>(path.join(PACKS, packId, 'units'));
	const checks = readDir<ContentCheck>(path.join(PACKS, packId, 'checks'));

	it('is named for its folder', () => {
		expect(manifest.id).toBe(packId);
	});

	it('passes the validator', () => {
		expect(validatePack(manifest, units)).toEqual([]);
	});

	it('has every item passed by the required independent checks', () => {
		expect(validateChecks(manifest, units, checks)).toEqual([]);
	});

	it('fails the validator when a unit file goes missing', () => {
		expect(validatePack(manifest, units.slice(1))).not.toEqual([]);
	});

	it.each(units.map((unit) => [unit.id, unit] as const))(
		'unit %s fails the validator when a cell is removed',
		(_id, unit) => {
			const holed = { ...unit, cells: unit.cells.slice(1) };
			expect(validatePack(manifest, [holed, ...units.filter((u) => u !== unit)])).not.toEqual([]);
		}
	);

	it.each(units.map((unit) => [unit.id, unit] as const))(
		'unit %s accepts either slip of a form shared by two cells',
		(_id, unit) => {
			for (const a of unit.cells) {
				for (const b of unit.cells) {
					if (a === b || a.text !== b.text) continue;
					const session = createQuizSession(unit.cells);
					expect(attemptMatch(session, a.id, b.id).outcome).toEqual({
						kind: 'correct',
						cellId: b.id
					});
				}
			}
			expect(unit.cells.length).toBeGreaterThan(0);
		}
	);
});
