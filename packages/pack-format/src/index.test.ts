import { describe, expect, it } from 'vitest';
import {
	validateChecks,
	validatePack,
	type Cell,
	type ContentCheck,
	type PackManifest,
	type Unit
} from './index.js';

const STRESS = '́';

const pack: PackManifest = {
	id: 'test',
	name: 'Test',
	language: 'uk',
	scripts: ['Cyrl'],
	glossLanguage: 'en',
	licence: 'CC-BY-SA-4.0',
	units: ['table', 'grid'],
	forbiddenLetters: 'ёъыэ',
	displayMarks: STRESS
};

const sources = [{ title: 'A source', url: 'https://example.org/' }];

const table: Unit = {
	id: 'table',
	title: 'A table',
	summary: '',
	sources,
	layout: {
		type: 'table',
		rows: [{ id: 'r1', label: 'One' }],
		columns: [
			{ id: 'c1', label: 'A' },
			{ id: 'c2', label: 'B' }
		]
	},
	cells: [
		{ id: 'a', item: 'i:a', text: 'кімнаті', display: `кімна${STRESS}ті`, row: 'r1', col: 'c1' },
		{ id: 'b', item: 'i:b', text: 'кімнату', row: 'r1', col: 'c2' }
	]
};

const grid: Unit = {
	id: 'grid',
	title: 'A grid',
	summary: '',
	sources,
	layout: { type: 'grid', size: 2 },
	cells: [
		{ id: 'x', item: 'i:x', text: 'брат', clue: 'brother' },
		{ id: 'y', item: 'i:y', text: 'син', clue: 'son' }
	]
};

const problems = (units: Unit[], manifest = pack) =>
	validatePack(manifest, units).map((issue) => issue.problem);

function withCell(unit: Unit, id: string, change: Partial<Cell>): Unit {
	return {
		...unit,
		cells: unit.cells.map((cell) => (cell.id === id ? { ...cell, ...change } : cell))
	};
}

describe('validatePack', () => {
	it('passes a good pack', () => {
		expect(validatePack(pack, [table, grid])).toEqual([]);
	});

	it('fails a unit that is listed but missing', () => {
		expect(problems([table])).toContain('unit grid is listed but missing');
	});

	it('fails a unit that is not listed', () => {
		const stray = { ...grid, id: 'stray' };
		expect(problems([table, grid, stray])).toContain('unit stray is not listed in the manifest');
	});

	it('fails a table with a missing cell', () => {
		const holed = { ...table, cells: [table.cells[0]] };
		expect(problems([holed, grid])).toContain('r1/c2 has 0 cells, expected 1');
	});

	it('fails a cell outside the board', () => {
		expect(problems([withCell(table, 'b', { row: 'nowhere' }), grid])).toContain(
			'cell b is outside the board'
		);
	});

	it('fails a grid of the wrong size', () => {
		expect(problems([table, { ...grid, cells: [grid.cells[0]] }])).toContain('1 cells, expected 2');
	});

	it('fails two equal clues with different answers', () => {
		expect(problems([table, withCell(grid, 'y', { clue: 'brother' })])).toContain(
			'clue "brother" fits both брат and син'
		);
	});

	it('fails a letter from the forbidden set, in the answer or the note', () => {
		expect(problems([table, withCell(grid, 'x', { text: 'брыт' })])).toContain(
			'contains the forbidden letter ы'
		);
		expect(problems([table, withCell(grid, 'x', { note: 'РЫБА' })])).toContain(
			'contains the forbidden letter ы'
		);
	});

	it('fails a Latin lookalike hidden in Cyrillic text', () => {
		const homoglyph = withCell(grid, 'x', { text: 'брaт' }); // Latin a
		expect(problems([table, homoglyph]).join()).toContain("outside the pack's scripts");
	});

	it('accepts an apostrophe inside a word', () => {
		expect(problems([table, withCell(grid, 'x', { text: 'імʼя' })])).toEqual([]);
	});

	it('fails display differing from text by more than the stress mark', () => {
		const wrong = withCell(table, 'a', { display: `кімна${STRESS}ту` });
		expect(problems([wrong, grid]).join()).toContain('by more than marks');
	});

	it('fails a stress mark in a pack that declares no marks', () => {
		const manifest = { ...pack, displayMarks: undefined };
		expect(problems([table, grid], manifest).join()).toContain('by more than marks');
	});

	it('fails a display mark inside text, where a slip would show it', () => {
		const marked = withCell(table, 'b', { text: `кімна${STRESS}ту` });
		expect(problems([marked, grid]).join()).toContain('contains a display mark');
	});

	it('accepts combining marks in text when the pack does not declare them as display marks', () => {
		const devanagari: PackManifest = { ...pack, scripts: ['Deva'], forbiddenLetters: undefined };
		const word: Unit = {
			...grid,
			id: 'grid',
			layout: { type: 'grid', size: 1 },
			cells: [{ id: 'x', item: 'i:x', text: 'हिन्दी', clue: 'Hindi' }]
		};
		expect(
			problems([{ ...table, cells: [], layout: { type: 'grid', size: 0 } }, word], devanagari)
		).toEqual([]);
	});

	it('fails duplicate cell ids and items', () => {
		const twice = withCell(grid, 'y', { id: 'x', item: 'i:x', text: 'брат' });
		const found = problems([table, twice]);
		expect(found).toContain('duplicate cell id x');
		expect(found).toContain('duplicate item i:x');
	});

	it('fails one item with two different answers across units', () => {
		const clash = withCell(grid, 'x', { item: 'i:b' });
		expect(problems([table, clash]).join()).toContain('item i:b is');
	});

	it('fails a unit with no source, or a source with no web address', () => {
		expect(problems([{ ...table, sources: [] }, grid])).toContain('has no source');
		const bad = { ...table, sources: [{ title: 'Book', url: 'somewhere' }] };
		expect(problems([bad, grid]).join()).toContain('no title or web address');
	});

	it('fails a cell with no text', () => {
		expect(problems([table, withCell(grid, 'x', { text: '' })])).toContain('has no text');
	});

	it('fails a manifest with no licence or scripts', () => {
		expect(problems([table, grid], { ...pack, licence: '' })).toContain('manifest has no licence');
		expect(problems([table, grid], { ...pack, scripts: [] })).toContain('manifest has no scripts');
	});

	it('reports a bad script name once, instead of throwing or repeating it per cell', () => {
		const found = problems([table, grid], { ...pack, scripts: ['NotAScript'] });
		expect(found.filter((problem) => problem.includes('not valid script names'))).toHaveLength(1);
	});
});

describe('validateChecks', () => {
	const passing = (checker: string, unit: Unit): ContentCheck => ({
		checker,
		date: '2026-10-31',
		items: unit.cells.map((cell) => ({
			item: cell.item,
			display: cell.display ?? cell.text,
			clue: cell.clue,
			note: cell.note,
			verdict: 'ok'
		}))
	});

	it('passes when two different checkers passed every item', () => {
		expect(validateChecks(pack, [grid], [passing('one', grid), passing('two', grid)])).toEqual([]);
	});

	it('fails with one check, or the same checker twice', () => {
		expect(validateChecks(pack, [grid], [passing('one', grid)])).toHaveLength(2);
		expect(validateChecks(pack, [grid], [passing('one', grid), passing('one', grid)])).toHaveLength(
			2
		);
	});

	it('fails an item a checker flagged', () => {
		const flagged = passing('two', grid);
		flagged.items[0].verdict = 'problem';
		const issues = validateChecks(pack, [grid], [passing('one', grid), flagged]);
		expect(issues.map((issue) => issue.where)).toEqual(['test/grid/x']);
	});

	it.each([
		['clue', { clue: 'sibling' }],
		['note', { note: 'A new claim.' }]
	])('voids the checks when the %s is edited', (_field, change) => {
		const checks = [passing('one', grid), passing('two', grid)];
		const edited = withCell(grid, 'x', change);
		expect(validateChecks(pack, [edited], checks).map((issue) => issue.where)).toEqual([
			'test/grid/x'
		]);
	});

	it('voids the checks when an item is edited', () => {
		const checks = [passing('one', grid), passing('two', grid)];
		const edited = withCell(grid, 'x', { text: 'сестра' });
		expect(validateChecks(pack, [edited], checks).map((issue) => issue.where)).toEqual([
			'test/grid/x'
		]);
	});
});
