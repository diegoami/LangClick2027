// The gate on pack content: every pack on disk must pass the validator and its
// recorded checks. Data-driven, so a new pack is covered by being there.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	checkTargets,
	localizeUnit,
	mergeCourse,
	validateChecks,
	validatePack,
	type ContentCheck,
	type CourseText,
	type Layers,
	type PackManifest,
	type Unit,
	type UnitText
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

function readLayers(packDir: string): Layers {
	const dir = path.join(packDir, 'layers');
	const layers: Layers = {};
	for (const name of existsSync(dir) ? readdirSync(dir) : []) {
		const unitsDir = path.join(dir, name, 'units');
		const courseFile = path.join(dir, name, 'course.json');
		layers[name] = {
			course: existsSync(courseFile) ? readJson<CourseText>(courseFile) : {},
			units: Object.fromEntries(
				(existsSync(unitsDir) ? readdirSync(unitsDir) : []).map((file) => [
					file.replace(/\.json$/, ''),
					readJson<UnitText>(path.join(unitsDir, file))
				])
			)
		};
	}
	return layers;
}

const packIds = readdirSync(PACKS).filter((name) => statSync(path.join(PACKS, name)).isDirectory());

describe('the packs folder', () => {
	it('has at least one pack', () => {
		expect(packIds.length).toBeGreaterThan(0);
	});
});

describe.each(packIds)('pack %s', (packId) => {
	const packDir = path.join(PACKS, packId);
	const manifest = readJson<PackManifest>(path.join(packDir, 'pack.json'));
	const units = readDir<Unit>(path.join(packDir, 'units'));
	const layers = readLayers(packDir);
	const checks = readDir<ContentCheck>(path.join(packDir, 'checks'));

	it('is named for its folder', () => {
		expect(manifest.id).toBe(packId);
	});

	it('passes the validator', () => {
		expect(validatePack(manifest, units, layers)).toEqual([]);
	});

	it('has all its content passed by the required independent checks', () => {
		expect(validateChecks(checkTargets(units, layers), checks)).toEqual([]);
	});

	it('fails the validator when a unit file goes missing', () => {
		expect(validatePack(manifest, units.slice(1), layers)).not.toEqual([]);
	});

	it.each(units.map((unit) => [unit.id, unit] as const))(
		'unit %s fails the validator when a cell is removed',
		(_id, unit) => {
			const holed = { ...unit, cells: unit.cells.slice(1) };
			expect(
				validatePack(manifest, [holed, ...units.filter((u) => u !== unit)], layers)
			).not.toEqual([]);
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

	// Every combination the learner can pick must give every cell something to ask.
	const combinations = [
		...manifest.explanations.map((base) => [base, undefined] as const),
		...manifest.overlays.map((overlay) => [overlay.split('-')[1], overlay] as const)
	];
	it.each(combinations)(
		'explained in %s with overlay %s, no grid cell lacks a clue',
		(base, overlay) => {
			const course = mergeCourse(layers[base].course, overlay ? layers[overlay].course : undefined);
			for (const unit of units) {
				const local = localizeUnit(
					unit,
					layers[base].units[unit.id],
					overlay ? layers[overlay].units[unit.id] : undefined,
					course
				);
				if (local.layout.type !== 'grid') continue;
				expect(local.cells.filter((cell) => !cell.clue).map((cell) => cell.id)).toEqual([]);
			}
		}
	);
});
