// The shape of a language pack, and the validator that keeps one honest. Pure:
// callers read the JSON and hand it in, so the app can run this on a download too.
// packs/README.md is the author's guide.
//
// Nothing here knows any one language. What differs between languages is data: the
// pack's scripts, the letters it must never contain, the marks that are shown but
// never compared, and the layers of explanation it offers.

export const FORMAT_VERSION = 2;

/** How many independent checks every piece of content needs. */
export const REQUIRED_CHECKS = 2;

export const STUDY_KINDS = ['video', 'reading', 'tasks', 'test', 'resources'] as const;
export const FALSE_FRIEND_KINDS = ['homograph', 'lookalike', 'partial'] as const;

export type StudyKind = (typeof STUDY_KINDS)[number];
export type FalseFriendKind = (typeof FALSE_FRIEND_KINDS)[number];

export interface Source {
	title: string;
	url: string;
}

/** Something to study before the exercises. It belongs to the source, not to us. */
export interface StudyLink extends Source {
	kind: StudyKind;
	/** Shown only for these comparisons; for everyone if absent. */
	compareWith?: string[];
}

export interface Lesson {
	id: string;
	/** Unit ids, in teaching order. */
	units: string[];
	study: StudyLink[];
}

export interface PackManifest {
	id: string;
	/** BCP 47 tag, put on every piece of target-language text. */
	language: string;
	/** ISO 15924 script names; cell text may use only these. */
	scripts: string[];
	licence: string;
	formatVersion: number;
	/** MAJOR.MINOR.PATCH, bumped on every content change. */
	version: string;
	/** Languages this pack can compare with. */
	comparisons: string[];
	/** Languages this pack is explained in: one base layer each. */
	explanations: string[];
	/** Overlays offered, each named <compare with>-<explain in>. */
	overlays: string[];
	/** In teaching order. */
	lessons: Lesson[];
	/** Letters of a neighbouring language that must never appear in this one. */
	forbiddenLetters?: string;
	/** Marks that `display` may add to `text`, such as a stress mark. */
	displayMarks?: string;
}

export type BoardLayout =
	/** `gaps` lists crossings with no cell, as "row/col": an IPA chart has them. */
	| { type: 'table'; rows: string[]; columns: string[]; gaps?: string[] }
	/** Tiles in the order given. `size` is how many there must be. */
	| { type: 'grid'; size: number };

export interface Cognate {
	form: string;
	ipa?: string;
}

/** A cell as authored: what is true in every language of explanation. */
export interface Cell {
	id: string;
	/** What progress is kept against; a word in two units shares one item. */
	item: string;
	/** The answer, as compared. */
	text: string;
	/** The answer as shown once visible, when it differs from `text`. */
	display?: string;
	/** Phonemic transcription, between slashes. */
	ipa?: string;
	/** A clue that needs no translation, such as a sound in IPA. */
	clue?: string;
	/** A word illustrating the answer, shown only with it. */
	example?: string;
	/** Related forms, by language. */
	cognates?: Record<string, Cognate>;
	/** Ids of the concepts this cell illustrates. */
	concepts?: string[];
	row?: string;
	col?: string;
}

export interface Unit {
	id: string;
	layout: BoardLayout;
	cells: Cell[];
	sources: Source[];
	/** Offered only for these comparisons; for everyone if absent. */
	compareWith?: string[];
}

export interface FalseFriend {
	kind: FalseFriendKind;
	/** The form in the compared language that misleads. */
	form: string;
	/** What it means there, in the language of explanation. */
	means: string;
}

export interface CellText {
	clue?: string;
	note?: string;
	/** The meaning of the cell's `example`. */
	exampleGloss?: string;
	/** What this comparison needs to say. Overlays only. */
	contrast?: string;
	falseFriend?: FalseFriend;
}

export interface UnitText {
	title?: string;
	summary?: string;
	/** Labels of a table's rows and columns, by id. */
	headers?: Record<string, string>;
	cells?: Record<string, CellText>;
}

export interface Concept {
	title: string;
	body: string;
	sources?: Source[];
}

/** A layer's texts for the course as a whole. */
export interface CourseText {
	lessons?: Record<string, { title: string }>;
	concepts?: Record<string, Concept>;
}

export interface Layer {
	course: CourseText;
	units: Record<string, UnitText>;
}

/** Every layer of a pack, by name: <language> is a base, <compare>-<language> an
 * overlay on it. */
export type Layers = Record<string, Layer>;

// ---------------------------------------------------------------- what a learner sees

export interface Header {
	id: string;
	label: string;
}

export type LocalLayout =
	{ type: 'table'; rows: Header[]; columns: Header[] } | { type: 'grid'; size: number };

export interface LocalCell extends Cell, CellText {
	conceptDetails: (Concept & { id: string })[];
}

export interface LocalUnit {
	id: string;
	title: string;
	summary: string;
	layout: LocalLayout;
	cells: LocalCell[];
	sources: Source[];
}

/** The two layers a choice of comparison and language resolves to. */
export function layerNames(
	pack: PackManifest,
	compareWith: string | undefined,
	explainIn: string
): { base: string; overlay: string | undefined } {
	const base = pack.explanations.includes(explainIn) ? explainIn : pack.explanations[0];
	const wanted = `${compareWith}-${base}`;
	return { base, overlay: pack.overlays.includes(wanted) ? wanted : undefined };
}

/** Whether a unit, or a study link, is offered for this comparison. */
export function offeredFor(
	limited: { compareWith?: string[] },
	compareWith: string | undefined
): boolean {
	return !limited.compareWith || limited.compareWith.includes(compareWith ?? '');
}

export function mergeCourse(base: CourseText, overlay: CourseText | undefined): CourseText {
	return {
		lessons: { ...base.lessons, ...overlay?.lessons },
		concepts: { ...base.concepts, ...overlay?.concepts }
	};
}

/** A unit as one learner sees it: the core with a base layer and an overlay on top. */
export function localizeUnit(
	unit: Unit,
	base: UnitText | undefined,
	overlay: UnitText | undefined,
	course: CourseText
): LocalUnit {
	const headers = { ...base?.headers, ...overlay?.headers };
	const header = (id: string): Header => ({ id, label: headers[id] ?? id });
	const layout: LocalLayout =
		unit.layout.type === 'table'
			? {
					type: 'table',
					rows: unit.layout.rows.map(header),
					columns: unit.layout.columns.map(header)
				}
			: unit.layout;
	return {
		id: unit.id,
		title: overlay?.title ?? base?.title ?? unit.id,
		summary: overlay?.summary ?? base?.summary ?? '',
		layout,
		sources: unit.sources,
		cells: unit.cells.map((cell) => ({
			...cell,
			...base?.cells?.[cell.id],
			...overlay?.cells?.[cell.id],
			conceptDetails: (cell.concepts ?? []).flatMap((id) => {
				const concept = course.concepts?.[id];
				return concept ? [{ id, ...concept }] : [];
			})
		}))
	};
}

/** The answer as shown: `display` if the cell has one, else `text`. */
export function shownText(cell: Pick<Cell, 'text' | 'display'>): string {
	return cell.display ?? cell.text;
}

// ------------------------------------------------------------------------ validation

export interface PackIssue {
	where: string;
	problem: string;
}

const present = (value: unknown): value is string => typeof value === 'string' && value !== '';
const webAddress = (value: unknown) => typeof value === 'string' && /^https?:\/\//.test(value);

const SEMVER = /^\d+\.\d+\.\d+$/;
// Latin holds most IPA letters, Greek holds β and θ, and the rest are modifiers.
const IPA = /^[/[][\p{Script=Latin}\p{Script=Greek}\p{M}\p{Lm}\p{Sk}ːˈˌ.‿ -]+[/\]]$/u;

function removeMarks(text: string, marks: string | undefined): string {
	return [...(marks ?? '')].reduce((out, mark) => out.replaceAll(mark, ''), text.normalize('NFC'));
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

function forbiddenIn(texts: (string | undefined)[], pack: PackManifest): string[] {
	const lower = texts.join(' ').toLowerCase();
	return [...(pack.forbiddenLetters ?? '')].filter((letter) =>
		lower.includes(letter.toLowerCase())
	);
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

	if (cell.ipa !== undefined) {
		if (!IPA.test(cell.ipa)) report(`ipa "${cell.ipa}" is not a transcription`);
		const stressed = [...(pack.displayMarks ?? '')].some((m) => cell.display?.includes(m));
		if (stressed && !cell.ipa.includes('ˈ')) {
			report(`display "${cell.display}" marks stress, but ipa "${cell.ipa}" doesn't`);
		}
	}

	for (const letter of forbiddenIn([shownText(cell), cell.example], pack)) {
		report(`contains the forbidden letter ${letter}`);
	}
	for (const [language, cognate] of Object.entries(cell.cognates ?? {})) {
		if (!present(cognate.form)) report(`cognate in ${language} has no form`);
		if (cognate.ipa !== undefined && !IPA.test(cognate.ipa)) {
			report(`cognate ipa "${cognate.ipa}" is not a transcription`);
		}
	}
}

function validateLayout(unit: Unit, pack: PackManifest, issues: PackIssue[]): void {
	const where = `${pack.id}/${unit.id}`;
	const layout = unit.layout;
	if (layout?.type === 'table') {
		const taken = new Map<string, number>();
		const rows = new Set(layout.rows);
		const columns = new Set(layout.columns);
		const gaps = new Set(layout.gaps ?? []);
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
				const key = `${row}/${column}`;
				const expected = gaps.has(key) ? 0 : 1;
				const count = taken.get(key) ?? 0;
				if (count !== expected) {
					issues.push({ where, problem: `${key} has ${count} cells, expected ${expected}` });
				}
			}
		}
	} else if (layout?.type === 'grid') {
		if (unit.cells.length !== layout.size) {
			issues.push({ where, problem: `${unit.cells.length} cells, expected ${layout.size}` });
		}
	} else {
		issues.push({ where, problem: 'has no known layout' });
	}
}

function validateSources(sources: Source[] | undefined, where: string, issues: PackIssue[]): void {
	for (const source of sources ?? []) {
		if (!present(source.title) || !webAddress(source.url)) {
			issues.push({ where, problem: `source "${source.title}" has no title or web address` });
		}
	}
}

function validateManifest(pack: PackManifest, issues: PackIssue[]): void {
	const report = (problem: string) => issues.push({ where: pack.id, problem });
	for (const field of ['id', 'language', 'licence'] as const) {
		if (!present(pack[field])) report(`manifest has no ${field}`);
	}
	if (!pack.scripts?.length) report('manifest has no scripts');
	if (pack.formatVersion !== FORMAT_VERSION) {
		report(`format version ${pack.formatVersion}, expected ${FORMAT_VERSION}`);
	}
	if (!SEMVER.test(pack.version ?? '')) report(`version "${pack.version}" is not X.Y.Z`);
	if (!pack.explanations?.length) report('manifest has no explanations');
	for (const overlay of pack.overlays ?? []) {
		const [compare, explain] = overlay.split('-');
		if (!pack.comparisons?.includes(compare) || !pack.explanations?.includes(explain)) {
			report(`overlay ${overlay} is not <a comparison>-<an explanation>`);
		}
	}
	for (const lesson of pack.lessons ?? []) {
		for (const link of lesson.study ?? []) {
			if (!present(link.title) || !webAddress(link.url)) {
				report(`lesson ${lesson.id}: study link "${link.title}" has no title or web address`);
			}
			if (!STUDY_KINDS.includes(link.kind)) {
				report(`lesson ${lesson.id}: unknown study kind ${link.kind}`);
			}
		}
	}
}

function validateCellText(
	text: CellText,
	cell: Cell,
	layerName: string,
	where: string,
	pack: PackManifest,
	issues: PackIssue[]
): void {
	const report = (problem: string) => issues.push({ where, problem });
	if (text.exampleGloss !== undefined && cell.example === undefined) {
		report('has an example gloss but the cell has no example');
	}
	// A translation may equal the answer, as with a cognate. Only a clue in the pack's
	// own language gives anything away by containing it.
	const clue = text.clue;
	const ownLanguage = layerName === pack.language;
	if (
		ownLanguage &&
		clue &&
		removeMarks(clue, pack.displayMarks).toLowerCase().includes(cell.text.toLowerCase())
	) {
		report(`clue "${clue}" gives away the answer`);
	}
	if (text.falseFriend) {
		const { kind, form, means } = text.falseFriend;
		if (!FALSE_FRIEND_KINDS.includes(kind)) report(`unknown false-friend kind ${kind}`);
		if (!present(form) || !present(means)) report('false friend needs a form and a meaning');
	}
	// An overlay quotes the compared language, so only the pack's own language's
	// base layer can be held to the letter rule.
	if (layerName === pack.language) {
		for (const letter of forbiddenIn([text.clue, text.note, text.exampleGloss], pack)) {
			report(`contains the forbidden letter ${letter}`);
		}
	}
}

function validateLayer(
	name: string,
	isBase: boolean,
	pack: PackManifest,
	units: readonly Unit[],
	layer: Layer | undefined,
	issues: PackIssue[]
): void {
	const prefix = `${pack.id}/layers/${name}`;
	if (!layer) {
		issues.push({ where: prefix, problem: 'is listed but missing' });
		return;
	}
	const byId = new Map(units.map((unit) => [unit.id, unit]));

	for (const id of Object.keys(layer.units)) {
		if (!byId.has(id)) issues.push({ where: prefix, problem: `text for unknown unit ${id}` });
	}
	for (const [id, concept] of Object.entries(layer.course.concepts ?? {})) {
		if (!present(concept.title) || !present(concept.body)) {
			issues.push({ where: `${prefix}/concepts/${id}`, problem: 'needs a title and a body' });
		}
		validateSources(concept.sources, `${prefix}/concepts/${id}`, issues);
	}

	if (isBase) {
		for (const lesson of pack.lessons ?? []) {
			if (!present(layer.course.lessons?.[lesson.id]?.title)) {
				issues.push({ where: prefix, problem: `lesson ${lesson.id} has no title` });
			}
		}
	}

	for (const unit of units) {
		const where = `${prefix}/${unit.id}`;
		const text = layer.units[unit.id];
		if (isBase) {
			if (!present(text?.title)) issues.push({ where, problem: 'has no title' });
			if (!present(text?.summary)) issues.push({ where, problem: 'has no summary' });
			if (unit.layout?.type === 'table') {
				for (const id of [...unit.layout.rows, ...unit.layout.columns]) {
					if (!present(text?.headers?.[id])) {
						issues.push({ where, problem: `header ${id} has no label` });
					}
				}
			}
			for (const cell of unit.cells ?? []) {
				for (const id of cell.concepts ?? []) {
					if (!present(layer.course.concepts?.[id]?.title)) {
						issues.push({ where: `${where}/${cell.id}`, problem: `concept ${id} has no text` });
					}
				}
			}
		}
		const cells = new Map((unit.cells ?? []).map((cell) => [cell.id, cell]));
		for (const id of Object.keys(text?.cells ?? {})) {
			if (!cells.has(id)) issues.push({ where, problem: `text for unknown cell ${id}` });
		}
		const clues = new Map<string, string>();
		for (const cell of unit.cells ?? []) {
			const cellText = text?.cells?.[cell.id] ?? {};
			validateCellText(cellText, cell, name, `${where}/${cell.id}`, pack, issues);
			if (!isBase || unit.layout?.type !== 'grid') continue;
			const clue = cellText.clue ?? cell.clue;
			if (!present(clue)) {
				issues.push({ where, problem: `grid cell ${cell.id} has no clue` });
				continue;
			}
			// Two equal clues with different answers could not be answered fairly.
			const earlier = clues.get(clue);
			if (earlier !== undefined && earlier !== cell.text) {
				issues.push({ where, problem: `clue "${clue}" fits both ${earlier} and ${cell.text}` });
			}
			clues.set(clue, cell.text);
		}
	}
}

/** Everything wrong with a pack; empty means it is fit to load. */
export function validatePack(
	pack: PackManifest,
	units: readonly Unit[],
	layers: Layers
): PackIssue[] {
	const issues: PackIssue[] = [];
	validateManifest(pack, issues);

	const pattern = textPattern(pack);
	if (!pattern) {
		issues.push({ where: pack.id, problem: `scripts ${pack.scripts} are not valid script names` });
	}

	const listed = (pack.lessons ?? []).flatMap((lesson) => lesson.units ?? []);
	const found = new Set(units.map((unit) => unit.id));
	for (const id of listed) {
		if (!found.has(id))
			issues.push({ where: pack.id, problem: `unit ${id} is listed but missing` });
	}
	if (new Set(listed).size !== listed.length) {
		issues.push({ where: pack.id, problem: 'a unit is listed in more than one lesson' });
	}
	for (const id of found) {
		if (!listed.includes(id)) {
			issues.push({ where: pack.id, problem: `unit ${id} is not in any lesson` });
		}
	}

	const textOfItem = new Map<string, string>();
	for (const unit of units) {
		const where = `${pack.id}/${unit.id}`;
		if (!unit.sources?.length) issues.push({ where, problem: 'has no source' });
		validateSources(unit.sources, where, issues);
		validateLayout(unit, pack, issues);
		for (const compare of unit.compareWith ?? []) {
			if (!pack.comparisons?.includes(compare)) {
				issues.push({ where, problem: `offered for unknown comparison ${compare}` });
			}
		}

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

	for (const name of pack.explanations ?? []) {
		validateLayer(name, true, pack, units, layers[name], issues);
	}
	for (const name of pack.overlays ?? []) {
		validateLayer(name, false, pack, units, layers[name], issues);
	}
	for (const name of Object.keys(layers)) {
		if (!pack.explanations?.includes(name) && !pack.overlays?.includes(name)) {
			issues.push({ where: pack.id, problem: `layer ${name} is not in the manifest` });
		}
	}
	return issues;
}

// ---------------------------------------------------------------------- content checks

/** One thing a checker has to pass. `seen` is the exact content, so an edit voids it. */
export interface CheckTarget {
	key: string;
	seen: string;
}

/** One independent check's results, kept in packs/<id>/checks/ and written by
 * scripts/pack-check.mjs, so that a checker fills in verdicts and copies no text. */
export interface ContentCheck {
	checker: string;
	entries: {
		key: string;
		seen: string;
		verdict: 'ok' | 'problem' | 'pending';
		comment?: string;
	}[];
}

const seenOf = (value: unknown) => JSON.stringify(value);

/** Everything in a pack that a checker must pass: core facts and every layer's text. */
export function checkTargets(units: readonly Unit[], layers: Layers): CheckTarget[] {
	const targets: CheckTarget[] = [];
	for (const unit of units) {
		for (const cell of unit.cells) {
			const { text, display, ipa, clue, example, cognates, row, col } = cell;
			targets.push({
				key: `core/${unit.id}/${cell.id}`,
				seen: seenOf({ text, display, ipa, clue, example, cognates, row, col })
			});
		}
	}
	for (const [name, layer] of Object.entries(layers)) {
		for (const [id, lesson] of Object.entries(layer.course.lessons ?? {})) {
			targets.push({ key: `${name}/lesson/${id}`, seen: seenOf(lesson.title) });
		}
		for (const [id, concept] of Object.entries(layer.course.concepts ?? {})) {
			targets.push({ key: `${name}/concept/${id}`, seen: seenOf(concept) });
		}
		for (const [unitId, text] of Object.entries(layer.units)) {
			const { title, summary, headers } = text;
			if (title || summary || headers) {
				targets.push({ key: `${name}/${unitId}`, seen: seenOf({ title, summary, headers }) });
			}
			for (const [cellId, cellText] of Object.entries(text.cells ?? {})) {
				targets.push({ key: `${name}/${unitId}/${cellId}`, seen: seenOf(cellText) });
			}
		}
	}
	return targets;
}

/**
 * Every target needs REQUIRED_CHECKS different checkers who passed it as it now
 * stands: a check records what it saw, so an edit voids it.
 */
export function validateChecks(
	targets: readonly CheckTarget[],
	checks: readonly ContentCheck[]
): PackIssue[] {
	const issues: PackIssue[] = [];
	for (const target of targets) {
		const passedBy = new Set<string>();
		for (const check of checks) {
			const entry = check.entries.find((candidate) => candidate.key === target.key);
			if (entry?.verdict === 'ok' && entry.seen === target.seen) passedBy.add(check.checker);
		}
		if (passedBy.size < REQUIRED_CHECKS) {
			issues.push({
				where: target.key,
				problem: `passed by ${passedBy.size} of ${REQUIRED_CHECKS} required checks`
			});
		}
	}
	return issues;
}
