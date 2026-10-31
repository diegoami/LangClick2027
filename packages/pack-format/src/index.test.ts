import { describe, expect, it } from 'vitest';
import {
	checkTargets,
	layerNames,
	localizeUnit,
	offeredFor,
	validateChecks,
	validatePack,
	type Cell,
	type ContentCheck,
	type Layer,
	type Layers,
	type PackManifest,
	type Unit
} from './index.js';

const STRESS = '́';
const sources = [{ title: 'A source', url: 'https://example.org/' }];

const pack: PackManifest = {
	id: 'test',
	language: 'uk',
	scripts: ['Cyrl'],
	licence: 'CC-BY-SA-4.0',
	formatVersion: 2,
	version: '1.0.0',
	comparisons: ['ru', 'pl'],
	explanations: ['en'],
	overlays: ['ru-en'],
	lessons: [{ id: 'l1', units: ['table', 'grid'], study: [] }],
	forbiddenLetters: 'ёъыэ',
	displayMarks: STRESS
};

const table: Unit = {
	id: 'table',
	sources,
	layout: { type: 'table', rows: ['r1'], columns: ['c1', 'c2'] },
	cells: [
		{
			id: 'a',
			item: 'i:a',
			text: 'кімнаті',
			display: `кімна${STRESS}ті`,
			ipa: '/kimˈnati/',
			row: 'r1',
			col: 'c1'
		},
		{ id: 'b', item: 'i:b', text: 'кімнату', row: 'r1', col: 'c2' }
	]
};

const grid: Unit = {
	id: 'grid',
	sources,
	layout: { type: 'grid', size: 2 },
	cells: [
		{ id: 'x', item: 'i:x', text: 'брат', concepts: ['c1'] },
		{ id: 'y', item: 'i:y', text: 'син', clue: '/sɪn/' }
	]
};

const baseLayer = (): Layer => ({
	course: {
		lessons: { l1: { title: 'Lesson one' } },
		concepts: { c1: { title: 'A concept', body: 'What it means.' } }
	},
	units: {
		table: { title: 'A table', summary: 'Sum', headers: { r1: 'One', c1: 'A', c2: 'B' } },
		grid: { title: 'A grid', summary: 'Sum', cells: { x: { clue: 'brother', note: 'A note.' } } }
	}
});

const overlayLayer = (): Layer => ({
	course: { concepts: { c1: { title: 'A concept', body: 'As a Russian speaker sees it.' } } },
	units: {
		grid: {
			cells: {
				x: { contrast: 'The same in Russian.' },
				y: { falseFriend: { kind: 'homograph', form: 'син', means: 'blue' } }
			}
		}
	}
});

const layers = (): Layers => ({ en: baseLayer(), 'ru-en': overlayLayer() });

const problems = (units: Unit[], manifest = pack, set = layers()) =>
	validatePack(manifest, units, set).map((issue) => issue.problem);

function withCell(unit: Unit, id: string, change: Partial<Cell>): Unit {
	return {
		...unit,
		cells: unit.cells.map((cell) => (cell.id === id ? { ...cell, ...change } : cell))
	};
}

describe('validatePack: the pack', () => {
	it('passes a good pack', () => {
		expect(validatePack(pack, [table, grid], layers())).toEqual([]);
	});

	it('fails a unit that is listed but missing', () => {
		expect(problems([table])).toContain('unit grid is listed but missing');
	});

	it('fails a unit in no lesson', () => {
		const stray = { ...grid, id: 'stray' };
		expect(problems([table, grid, stray])).toContain('unit stray is not in any lesson');
	});

	it('fails a unit in two lessons', () => {
		const twice = {
			...pack,
			lessons: [...pack.lessons, { id: 'l2', units: ['grid'], study: [] }]
		};
		expect(problems([table, grid], twice)).toContain('a unit is listed in more than one lesson');
	});

	it('fails a wrong format version or version', () => {
		expect(problems([table, grid], { ...pack, formatVersion: 1 })).toContain(
			'format version 1, expected 2'
		);
		expect(problems([table, grid], { ...pack, version: 'one' })).toContain(
			'version "one" is not X.Y.Z'
		);
	});

	it('fails a manifest with no licence or scripts', () => {
		expect(problems([table, grid], { ...pack, licence: '' })).toContain('manifest has no licence');
		expect(problems([table, grid], { ...pack, scripts: [] })).toContain('manifest has no scripts');
	});

	it('reports a bad script name once, instead of throwing or repeating it per cell', () => {
		const found = problems([table, grid], { ...pack, scripts: ['NotAScript'] });
		expect(found.filter((problem) => problem.includes('not valid script names'))).toHaveLength(1);
	});

	it.each([
		['javascript:alert(1)', 'no title or web address'],
		['somewhere', 'no title or web address']
	])('fails a study link to %s', (url, problem) => {
		const bad = {
			...pack,
			lessons: [
				{
					id: 'l1',
					units: ['table', 'grid'],
					study: [{ kind: 'video' as const, title: 'A video', url }]
				}
			]
		};
		expect(problems([table, grid], bad).join()).toContain(problem);
	});

	it('fails an unknown study kind', () => {
		const bad = {
			...pack,
			lessons: [
				{
					id: 'l1',
					units: ['table', 'grid'],
					study: [{ kind: 'podcast' as 'video', title: 'A', url: 'https://example.org/' }]
				}
			]
		};
		expect(problems([table, grid], bad).join()).toContain('unknown study kind podcast');
	});

	it('fails an overlay that is not a known comparison and explanation', () => {
		const bad = { ...pack, overlays: ['de-en'] };
		const set = { ...layers(), 'de-en': overlayLayer() };
		expect(problems([table, grid], bad, set).join()).toContain('overlay de-en is not');
	});

	it('fails a layer the manifest does not list', () => {
		const set = { ...layers(), fr: baseLayer() };
		expect(problems([table, grid], pack, set)).toContain('layer fr is not in the manifest');
	});

	it('fails a listed layer that is missing', () => {
		const set = layers();
		delete set['ru-en'];
		expect(problems([table, grid], pack, set)).toContain('is listed but missing');
	});
});

describe('validatePack: units and cells', () => {
	it('fails a table with a missing cell', () => {
		const holed = { ...table, cells: [table.cells[0]] };
		expect(problems([holed, grid])).toContain('r1/c2 has 0 cells, expected 1');
	});

	it('accepts a gap a table declares, and fails a cell in it', () => {
		const layout = { ...table.layout, gaps: ['r1/c2'] } as Unit['layout'];
		const holed = { ...table, layout, cells: [table.cells[0]] };
		expect(problems([holed, grid])).toEqual([]);
		expect(problems([{ ...table, layout }, grid])).toContain('r1/c2 has 1 cells, expected 0');
	});

	it('fails a cell outside the board', () => {
		expect(problems([withCell(table, 'b', { row: 'nowhere' }), grid])).toContain(
			'cell b is outside the board'
		);
	});

	it('fails a grid of the wrong size', () => {
		expect(problems([table, { ...grid, cells: [grid.cells[0]] }])).toContain('1 cells, expected 2');
	});

	it('fails a forbidden letter in the answer or the example', () => {
		expect(problems([table, withCell(grid, 'x', { text: 'брыт' })])).toContain(
			'contains the forbidden letter ы'
		);
		expect(problems([table, withCell(grid, 'x', { example: 'РЫБА' })])).toContain(
			'contains the forbidden letter ы'
		);
	});

	it('allows those letters in a cognate, which is another language', () => {
		const cognates = { ru: { form: 'сын', ipa: '/sɨn/' } };
		expect(problems([table, withCell(grid, 'x', { cognates })])).toEqual([]);
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

	it('accepts combining marks in text when they are not declared as display marks', () => {
		const devanagari: PackManifest = { ...pack, scripts: ['Deva'], forbiddenLetters: undefined };
		const word = withCell(grid, 'x', { text: 'हिन्दी' });
		const other = withCell(word, 'y', { text: 'हिन्द' });
		const plain = {
			...table,
			cells: table.cells.map((cell, i) => ({
				...cell,
				text: i ? 'कमरा' : 'कमरे',
				display: undefined,
				ipa: undefined
			}))
		};
		expect(problems([plain, other], devanagari)).toEqual([]);
	});

	it.each(['кот', '/kit', '[кот]', 'kit'])('fails %s as a transcription', (ipa) => {
		expect(problems([withCell(table, 'b', { ipa }), grid]).join()).toContain('not a transcription');
	});

	it.each(['/ɦ/', '/t͡ʃ/', '[β̞]', '/kimˈnata/', '[lʲ]'])('accepts %s as a transcription', (ipa) => {
		expect(problems([withCell(table, 'b', { ipa }), grid])).toEqual([]);
	});

	it('fails marked stress that the transcription leaves out', () => {
		expect(problems([withCell(table, 'a', { ipa: '/kimnati/' }), grid]).join()).toContain(
			'marks stress'
		);
	});

	it('fails duplicate cell ids and items', () => {
		const twice = withCell(grid, 'y', { id: 'x', item: 'i:x', text: 'брат', clue: undefined });
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
		const bad = { ...table, sources: [{ title: 'Book', url: 'javascript:alert(1)' }] };
		expect(problems([bad, grid]).join()).toContain('no title or web address');
	});

	it('fails a cell with no text', () => {
		expect(problems([table, withCell(grid, 'y', { text: '' })])).toContain('has no text');
	});

	it('fails a unit offered for an unknown comparison', () => {
		expect(problems([{ ...table, compareWith: ['de'] }, grid])).toContain(
			'offered for unknown comparison de'
		);
	});
});

describe('validatePack: layers', () => {
	function changeBase(change: (layer: Layer) => void): Layers {
		const set = layers();
		change(set.en);
		return set;
	}

	it('fails a base with no lesson title, unit title or summary', () => {
		expect(
			problems(
				[table, grid],
				pack,
				changeBase((l) => delete l.course.lessons?.l1)
			).join()
		).toContain('lesson l1 has no title');
		expect(
			problems(
				[table, grid],
				pack,
				changeBase((l) => delete l.units.table.title)
			)
		).toContain('has no title');
		expect(
			problems(
				[table, grid],
				pack,
				changeBase((l) => delete l.units.table.summary)
			)
		).toContain('has no summary');
	});

	it('fails a table header with no label', () => {
		const set = changeBase((l) => delete l.units.table.headers?.c1);
		expect(problems([table, grid], pack, set)).toContain('header c1 has no label');
	});

	it('fails a grid cell with no clue in either the core or the base', () => {
		const set = changeBase((l) => delete l.units.grid.cells?.x.clue);
		expect(problems([table, grid], pack, set)).toContain('grid cell x has no clue');
	});

	it('takes a clue from the core, which needs no translation', () => {
		expect(problems([table, grid])).toEqual([]);
	});

	it('fails two equal clues with different answers', () => {
		const set = changeBase((l) => {
			l.units.grid.cells = { x: { clue: 'same' }, y: { clue: 'same' } };
		});
		expect(problems([table, grid], pack, set)).toContain('clue "same" fits both брат and син');
	});

	it("fails a clue in the pack's own language that gives the answer away", () => {
		const own: PackManifest = { ...pack, explanations: ['uk'], overlays: [] };
		const uk = baseLayer();
		uk.units.grid.cells = { x: { clue: 'це Брат' } };
		expect(problems([table, grid], own, { uk }).join()).toContain('gives away the answer');
	});

	it('allows a translation that equals the answer, as a cognate does', () => {
		const set = changeBase((l) => {
			l.units.grid.cells = { x: { clue: 'брат' } };
		});
		expect(problems([table, grid], pack, set)).toEqual([]);
	});

	it('fails text for an unknown unit or cell', () => {
		expect(
			problems(
				[table, grid],
				pack,
				changeBase((l) => (l.units.nope = { title: 'x' }))
			).join()
		).toContain('text for unknown unit nope');
		const set = changeBase((l) => {
			l.units.grid.cells = { x: { clue: 'a' }, nope: { note: 'n' } };
		});
		expect(problems([table, grid], pack, set)).toContain('text for unknown cell nope');
	});

	it('fails a concept a cell uses but the base does not explain', () => {
		const set = changeBase((l) => delete l.course.concepts?.c1);
		expect(problems([table, grid], pack, set)).toContain('concept c1 has no text');
	});

	it('fails a concept with no body, or a bad source', () => {
		const empty = changeBase((l) => {
			l.course.concepts = { c1: { title: 'T', body: '' } };
		});
		expect(problems([table, grid], pack, empty)).toContain('needs a title and a body');
		const bad = changeBase((l) => {
			l.course.concepts = {
				c1: { title: 'T', body: 'B', sources: [{ title: 'S', url: 'nope' }] }
			};
		});
		expect(problems([table, grid], pack, bad).join()).toContain('no title or web address');
	});

	it('fails a bad false friend', () => {
		const set = layers();
		set['ru-en'].units.grid.cells = {
			y: { falseFriend: { kind: 'odd' as 'partial', form: '', means: '' } }
		};
		const found = problems([table, grid], pack, set);
		expect(found).toContain('unknown false-friend kind odd');
		expect(found).toContain('false friend needs a form and a meaning');
	});

	it('fails an example gloss on a cell with no example', () => {
		const set = changeBase((l) => {
			l.units.grid.cells = { x: { clue: 'a', exampleGloss: 'meaning' } };
		});
		expect(problems([table, grid], pack, set).join()).toContain('no example');
	});

	it("holds the pack's own language's base layer to the letter rule, but not overlays", () => {
		const own: PackManifest = { ...pack, explanations: ['uk'], overlays: ['ru-uk'] };
		const set: Layers = {
			uk: baseLayer(),
			'ru-uk': {
				course: { lessons: {} },
				units: { grid: { cells: { x: { contrast: 'Російське ы' } } } }
			}
		};
		expect(problems([table, grid], own, set)).toEqual([]);
		set.uk.units.grid.cells = { x: { clue: 'a', note: 'ы' } };
		expect(problems([table, grid], own, set)).toContain('contains the forbidden letter ы');
	});
});

describe('layerNames', () => {
	it('finds the base and the overlay', () => {
		expect(layerNames(pack, 'ru', 'en')).toEqual({ base: 'en', overlay: 'ru-en' });
	});

	it('has no overlay for a comparison it does not offer in that language', () => {
		expect(layerNames(pack, 'pl', 'en')).toEqual({ base: 'en', overlay: undefined });
	});

	it('falls back to the first base for a language the pack is not explained in', () => {
		expect(layerNames(pack, 'ru', 'sv')).toEqual({ base: 'en', overlay: 'ru-en' });
	});

	it('works with no comparison chosen', () => {
		expect(layerNames(pack, undefined, 'en')).toEqual({ base: 'en', overlay: undefined });
	});
});

describe('offeredFor', () => {
	it('offers to everyone what names no comparison', () => {
		expect(offeredFor({}, 'ru')).toBe(true);
		expect(offeredFor({}, undefined)).toBe(true);
	});

	it('offers a limited thing only for its comparison', () => {
		expect(offeredFor({ compareWith: ['pl'] }, 'pl')).toBe(true);
		expect(offeredFor({ compareWith: ['pl'] }, 'ru')).toBe(false);
		expect(offeredFor({ compareWith: ['pl'] }, undefined)).toBe(false);
	});
});

describe('localizeUnit', () => {
	const set = layers();
	const course = { ...set.en.course, concepts: set['ru-en'].course.concepts };

	it('labels a table from the base', () => {
		const unit = localizeUnit(table, set.en.units.table, undefined, set.en.course);
		expect(unit.title).toBe('A table');
		expect(unit.layout).toEqual({
			type: 'table',
			rows: [{ id: 'r1', label: 'One' }],
			columns: [
				{ id: 'c1', label: 'A' },
				{ id: 'c2', label: 'B' }
			]
		});
	});

	it('merges core, base and overlay into a cell', () => {
		const unit = localizeUnit(grid, set.en.units.grid, set['ru-en'].units.grid, course);
		const x = unit.cells.find((cell) => cell.id === 'x');
		expect(x).toMatchObject({
			text: 'брат',
			clue: 'brother',
			note: 'A note.',
			contrast: 'The same in Russian.'
		});
		expect(unit.cells.find((cell) => cell.id === 'y')?.clue).toBe('/sɪn/');
	});

	it("gives a cell its concepts, with the overlay's explanation winning", () => {
		const unit = localizeUnit(grid, set.en.units.grid, set['ru-en'].units.grid, course);
		expect(unit.cells[0].conceptDetails).toEqual([
			{ id: 'c1', title: 'A concept', body: 'As a Russian speaker sees it.' }
		]);
	});
});

describe('content checks', () => {
	const units = [table, grid];
	const passing = (checker: string, set = layers()): ContentCheck => ({
		checker,
		entries: checkTargets(units, set).map((target) => ({ ...target, verdict: 'ok' }))
	});

	it('covers core facts and every layer', () => {
		const keys = checkTargets(units, layers()).map((target) => target.key);
		expect(keys).toContain('core/grid/x');
		expect(keys).toContain('en/lesson/l1');
		expect(keys).toContain('en/concept/c1');
		expect(keys).toContain('en/table');
		expect(keys).toContain('en/grid/x');
		expect(keys).toContain('ru-en/grid/y');
	});

	it('passes when two different checkers passed everything', () => {
		const targets = checkTargets(units, layers());
		expect(validateChecks(targets, [passing('one'), passing('two')])).toEqual([]);
	});

	it('fails with one check, or the same checker twice', () => {
		const targets = checkTargets(units, layers());
		expect(validateChecks(targets, [passing('one')])).toHaveLength(targets.length);
		expect(validateChecks(targets, [passing('one'), passing('one')])).toHaveLength(targets.length);
	});

	it.each(['problem', 'pending'] as const)('fails an item marked %s', (verdict) => {
		const targets = checkTargets(units, layers());
		const flagged = passing('two');
		const entry = flagged.entries.find((e) => e.key === 'core/grid/x');
		if (entry) entry.verdict = verdict;
		expect(validateChecks(targets, [passing('one'), flagged]).map((i) => i.where)).toEqual([
			'core/grid/x'
		]);
	});

	it.each([
		['an answer', 'core/grid/x', () => [table, withCell(grid, 'x', { text: 'сестра' })], layers()],
		['an IPA', 'core/grid/x', () => [table, withCell(grid, 'x', { ipa: '/brat/' })], layers()],
		['a cognate', 'core/grid/x', () => [table, withCell(grid, 'x', { cognates: {} })], layers()]
	])('voids the check when %s is edited', (_what, key, edited, set) => {
		const checks = [passing('one'), passing('two')];
		const targets = checkTargets(edited(), set);
		expect(validateChecks(targets, checks).map((issue) => issue.where)).toEqual([key]);
	});

	it('voids the check when a layer text is edited', () => {
		const checks = [passing('one'), passing('two')];
		const set = layers();
		set['ru-en'].units.grid.cells = { x: { contrast: 'Different now.' } };
		const where = validateChecks(checkTargets(units, set), checks).map((issue) => issue.where);
		expect(where).toContain('ru-en/grid/x');
		expect(where).not.toContain('en/grid/x');
	});
});
