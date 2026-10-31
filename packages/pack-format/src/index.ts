// The shape of a language pack, and the validator that keeps one honest. Pure:
// callers read the JSON and hand it in. packs/README.md is the author's guide.
//
// Nothing here knows any one language. What differs between languages is data in
// the pack's manifest: its scripts, the letters it must never contain, and the
// marks that are shown but never compared.

export interface PackManifest {
	id: string;
	name: string;
	/** BCP 47 tag, put on every piece of target-language text. */
	language: string;
	/** ISO 15924 script names; cell text may use only these. */
	scripts: string[];
	/** The language the clues and notes are written in. */
	glossLanguage: string;
	licence: string;
	/** Unit ids, in the order the pack teaches them. */
	units: string[];
	/** Letters of a neighbouring language that must never appear in this one. */
	forbiddenLetters?: string;
	/** Marks that `display` may add to `text`, such as a stress mark. */
	displayMarks?: string;
}

export interface Header {
	id: string;
	label: string;
}

export type BoardLayout =
	| { type: 'table'; rows: Header[]; columns: Header[] }
	/** Tiles in the order given. `size` is how many there must be. */
	| { type: 'grid'; size: number };

export interface Cell {
	id: string;
	/** What progress is kept against; a word in two units shares one item. */
	item: string;
	/** The answer, as compared. */
	text: string;
	/** The answer as shown once visible, when it differs from `text`. */
	display?: string;
	/** Always visible: what a grid cell asks for. */
	clue?: string;
	/** Only shown with the answer: an example, or a memory hook. */
	note?: string;
	row?: string;
	col?: string;
}

export interface Source {
	title: string;
	url: string;
}

export interface Unit {
	id: string;
	title: string;
	summary: string;
	layout: BoardLayout;
	cells: Cell[];
	sources: Source[];
}

/** One independent check's result, kept in packs/<id>/checks/. */
export interface ContentCheck {
	checker: string;
	date: string;
	items: {
		item: string;
		/** What the checker saw, so a later edit to any of it voids the check. */
		display: string;
		clue?: string;
		note?: string;
		verdict: 'ok' | 'problem';
		comment?: string;
	}[];
}

/** How many independent checks every item needs. */
export const REQUIRED_CHECKS = 2;

export interface PackIssue {
	where: string;
	problem: string;
}

const present = (value: unknown): value is string => typeof value === 'string' && value !== '';

function removeMarks(text: string, marks: string | undefined): string {
	return [...(marks ?? '')].reduce((out, mark) => out.replaceAll(mark, ''), text.normalize('NFC'));
}

/** The answer as shown: `display` if the cell has one, else `text`. */
export function shownText(cell: Cell): string {
	return cell.display ?? cell.text;
}

/** The pattern a cell's text must match, or undefined if the pack's script names
 * are not valid. Script names come from the pack, so a bad one must not throw. */
function textPattern(pack: PackManifest): RegExp | undefined {
	try {
		const allowed = pack.scripts.map((script) => `\\p{Script=${script}}`).join('');
		return new RegExp(`^[${allowed}\\p{M}\\s'ʼ-]+$`, 'u');
	} catch {
		return undefined;
	}
}

function validateCell(
	cell: Cell,
	unit: Unit,
	pack: PackManifest,
	pattern: RegExp | undefined,
	issues: PackIssue[]
): void {
	const where = `${pack.id}/${unit.id}/${cell.id}`;
	const report = (problem: string) => issues.push({ where, problem });

	if (!present(cell.id)) report('has no id');
	if (!present(cell.item)) report('has no item');
	if (!present(cell.text)) {
		report('has no text');
		return;
	}
	if (cell.text !== cell.text.normalize('NFC')) report('text is not in NFC form');

	if (pattern && !pattern.test(cell.text)) {
		report(`text "${cell.text}" has letters outside the pack's scripts`);
	}

	// Slips show `text`, so a mark here would give the answer away on the slip. Only
	// the pack's declared marks count: other scripts spell with combining marks.
	if ([...(pack.displayMarks ?? '')].some((mark) => cell.text.includes(mark))) {
		report(`text "${cell.text}" contains a display mark`);
	}

	if (cell.display !== undefined && removeMarks(cell.display, pack.displayMarks) !== cell.text) {
		report(`display "${cell.display}" differs from text "${cell.text}" by more than marks`);
	}

	const lower = `${shownText(cell)} ${cell.clue ?? ''} ${cell.note ?? ''}`.toLowerCase();
	for (const letter of pack.forbiddenLetters ?? '') {
		if (lower.includes(letter.toLowerCase())) report(`contains the forbidden letter ${letter}`);
	}
}

function validateLayout(unit: Unit, pack: PackManifest, issues: PackIssue[]): void {
	const where = `${pack.id}/${unit.id}`;
	const layout = unit.layout;
	if (layout?.type === 'table') {
		const taken = new Map<string, number>();
		const rows = new Set(layout.rows.map((row) => row.id));
		const columns = new Set(layout.columns.map((column) => column.id));
		for (const cell of unit.cells) {
			if (!rows.has(cell.row ?? '') || !columns.has(cell.col ?? '')) {
				issues.push({ where, problem: `cell ${cell.id} is outside the board` });
				continue;
			}
			const key = `${cell.row}/${cell.col}`;
			taken.set(key, (taken.get(key) ?? 0) + 1);
		}
		for (const row of rows) {
			for (const column of columns) {
				const count = taken.get(`${row}/${column}`) ?? 0;
				if (count !== 1) {
					issues.push({ where, problem: `${row}/${column} has ${count} cells, expected 1` });
				}
			}
		}
	} else if (layout?.type === 'grid') {
		if (unit.cells.length !== layout.size) {
			issues.push({ where, problem: `${unit.cells.length} cells, expected ${layout.size}` });
		}
		const clues = new Map<string, string>();
		for (const cell of unit.cells) {
			if (!present(cell.clue)) {
				issues.push({ where, problem: `grid cell ${cell.id} has no clue` });
				continue;
			}
			// Two equal clues with different answers could not be answered fairly.
			const earlier = clues.get(cell.clue);
			if (earlier !== undefined && earlier !== cell.text) {
				issues.push({
					where,
					problem: `clue "${cell.clue}" fits both ${earlier} and ${cell.text}`
				});
			}
			clues.set(cell.clue, cell.text);
		}
	} else {
		issues.push({ where, problem: 'has no known layout' });
	}
}

/** Everything wrong with a pack; empty means it is fit to load. */
export function validatePack(pack: PackManifest, units: readonly Unit[]): PackIssue[] {
	const issues: PackIssue[] = [];
	for (const field of ['id', 'name', 'language', 'glossLanguage', 'licence'] as const) {
		if (!present(pack[field])) issues.push({ where: pack.id, problem: `manifest has no ${field}` });
	}
	if (!pack.scripts?.length) issues.push({ where: pack.id, problem: 'manifest has no scripts' });
	const pattern = textPattern(pack);
	if (!pattern) {
		issues.push({ where: pack.id, problem: `scripts ${pack.scripts} are not valid script names` });
	}

	const found = new Set(units.map((unit) => unit.id));
	for (const id of pack.units ?? []) {
		if (!found.has(id))
			issues.push({ where: pack.id, problem: `unit ${id} is listed but missing` });
	}
	for (const id of found) {
		if (!pack.units?.includes(id)) {
			issues.push({ where: pack.id, problem: `unit ${id} is not listed in the manifest` });
		}
	}

	const textOfItem = new Map<string, string>();
	for (const unit of units) {
		const where = `${pack.id}/${unit.id}`;
		if (!present(unit.title)) issues.push({ where, problem: 'has no title' });
		if (!unit.sources?.length) issues.push({ where, problem: 'has no source' });
		for (const source of unit.sources ?? []) {
			if (!present(source.title) || !/^https?:\/\//.test(source.url ?? '')) {
				issues.push({ where, problem: `source "${source.title}" has no title or web address` });
			}
		}
		validateLayout(unit, pack, issues);

		const ids = new Set<string>();
		const items = new Set<string>();
		for (const cell of unit.cells ?? []) {
			validateCell(cell, unit, pack, pattern, issues);
			if (ids.has(cell.id)) issues.push({ where, problem: `duplicate cell id ${cell.id}` });
			if (items.has(cell.item)) issues.push({ where, problem: `duplicate item ${cell.item}` });
			ids.add(cell.id);
			items.add(cell.item);

			const earlier = textOfItem.get(cell.item);
			if (earlier !== undefined && earlier !== cell.text) {
				issues.push({
					where,
					problem: `item ${cell.item} is "${cell.text}" here and "${earlier}" elsewhere`
				});
			}
			textOfItem.set(cell.item, cell.text);
		}
	}
	return issues;
}

/**
 * Every item needs REQUIRED_CHECKS independent checks that passed it as it now
 * stands: a check records the answer, clue and note it saw, so editing any of them
 * voids it.
 */
export function validateChecks(
	pack: PackManifest,
	units: readonly Unit[],
	checks: readonly ContentCheck[]
): PackIssue[] {
	const issues: PackIssue[] = [];
	for (const unit of units) {
		for (const cell of unit.cells) {
			const passedBy = new Set<string>();
			for (const check of checks) {
				const entry = check.items.find((item) => item.item === cell.item);
				if (
					entry?.verdict === 'ok' &&
					entry.display === shownText(cell) &&
					entry.clue === cell.clue &&
					entry.note === cell.note
				) {
					passedBy.add(check.checker);
				}
			}
			if (passedBy.size < REQUIRED_CHECKS) {
				issues.push({
					where: `${pack.id}/${unit.id}/${cell.id}`,
					problem: `passed by ${passedBy.size} of ${REQUIRED_CHECKS} required checks`
				});
			}
		}
	}
	return issues;
}
