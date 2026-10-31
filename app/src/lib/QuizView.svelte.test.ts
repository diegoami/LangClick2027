import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { localizeUnit, type PackManifest, type Unit, type UnitText } from '@langclick/pack-format';
import kimnata from '../../../packs/uk/units/kimnata.json';
import kimnataText from '../../../packs/uk/layers/en/units/kimnata.json';
import pack from '../../../packs/uk/pack.json';
import { resetLanguages } from './language.svelte';
import { forgetRound } from './quizRound';
import {
	dueCells,
	levelOf,
	loadProgress,
	recordAnswer,
	resetProgressMirror
} from './progress.svelte';
import { todayLocalDate } from './progressRepository';
import QuizView from './QuizView.svelte';
import ReviewView from './ReviewView.svelte';

const manifest = pack as unknown as PackManifest;
const unit = localizeUnit(kimnata as unknown as Unit, kimnataText as UnitText, undefined, {});

const cellEl = (id: string) => document.querySelector<HTMLElement>(`[data-cell-id="${id}"]`)!;
const slips = () => [...document.querySelectorAll<HTMLElement>('[data-slip-id]')];
const slipWith = (text: string) => slips().find((slip) => slip.textContent === text);

async function place(text: string, cellId: string) {
	const slip = slipWith(text);
	expect(slip, `a slip "${text}" in the tray`).toBeDefined();
	await userEvent.click(slip!);
	await userEvent.click(cellEl(cellId));
}

/** Plays until a slip with this text is in the hand, by answering others correctly. */
async function dealUntil(text: string) {
	while (!slipWith(text)) {
		const slip = slips()[0];
		const own = slip.dataset.slipId!;
		await userEvent.click(slip);
		await userEvent.click(cellEl(own));
	}
}

function start() {
	forgetRound(manifest.id, unit.id);
	return render(QuizView, { pack: manifest, unit });
}

beforeEach(async () => {
	localStorage.clear();
	resetLanguages({ compareWith: null, explainIn: 'en' });
	resetProgressMirror();
	await loadProgress(manifest.id);
});

describe('QuizView', () => {
	it('deals ten slips on a new unit, and shows no answers', async () => {
		start();
		expect(slips()).toHaveLength(10);
		expect(cellEl('dat.sg').textContent?.trim()).toBe('');
	});

	it.each([
		['dat.sg', 'loc.sg'],
		['loc.sg', 'dat.sg']
	])('accepts the shared form on %s and then on %s', async (first, second) => {
		start();
		await dealUntil('кімнаті');
		await place('кімнаті', first);
		expect(cellEl(first).classList.contains('correct')).toBe(true);
		expect(cellEl(first).textContent).toContain('кімна́ті');

		await dealUntil('кімнаті');
		await place('кімнаті', second);
		expect(cellEl(second).classList.contains('correct')).toBe(true);
	});

	it('takes the form shared by four cells in any order, and then has no slip left for it', async () => {
		start();
		for (const cellId of ['voc.pl', 'nom.pl', 'gen.sg', 'acc.pl']) {
			await dealUntil('кімнати');
			await place('кімнати', cellId);
			expect(cellEl(cellId).classList.contains('correct')).toBe(true);
		}
		expect(slipWith('кімнати')).toBeUndefined();
		expect(document.querySelector('.revealed')).toBeNull();
	});

	it('shows the IPA once an answer is visible', async () => {
		start();
		await dealUntil('кімнату');
		expect(cellEl('acc.sg').textContent).not.toContain('/kimˈnatu/');
		await place('кімнату', 'acc.sg');
		expect(cellEl('acc.sg').textContent).toContain('/kimˈnatu/');
	});

	it('reveals the right cell on a wrong drop, explains, and lowers the level', async () => {
		start();
		await dealUntil('кімнату');
		await place('кімнату', 'gen.pl');

		expect(cellEl('acc.sg').classList.contains('revealed')).toBe(true);
		expect(cellEl('acc.sg').textContent).toContain('кімна́ту');
		expect(cellEl('gen.pl').classList.contains('correct')).toBe(false);
		expect(document.querySelector('aside')?.textContent).toContain('Not there');
		expect(slipWith('кімнату')).toBeUndefined();
	});

	it('raises the earned level on a correct answer and saves it', async () => {
		start();
		await dealUntil('кімнату');
		await place('кімнату', 'acc.sg');
		const cell = unit.cells.find((c) => c.id === 'acc.sg')!;
		expect(levelOf(manifest.id, cell)).toBe(1);

		resetProgressMirror();
		await loadProgress(manifest.id);
		expect(levelOf(manifest.id, cell)).toBe(1);
	});

	it('cancels a selected slip with Escape, so the next cell press does nothing', async () => {
		start();
		const slip = slips()[0];
		const own = slip.dataset.slipId!;
		await userEvent.click(slip);
		expect(slip.getAttribute('aria-pressed')).toBe('true');
		await userEvent.keyboard('{Escape}');
		expect(slip.getAttribute('aria-pressed')).toBe('false');
		await userEvent.click(cellEl(own));
		expect(cellEl(own).classList.contains('correct')).toBe(false);
	});

	it('finishes a round and offers another', async () => {
		start();
		for (let i = 0; i < unit.cells.length; i++) {
			const slip = slips()[0];
			const own = slip.dataset.slipId!;
			await userEvent.click(slip);
			await userEvent.click(cellEl(own));
		}
		expect(document.querySelector('.score')?.textContent).toContain('14 of 14');
		expect(slips()).toHaveLength(0);
	});

	it('speaks the language chosen', async () => {
		resetLanguages({ compareWith: 'ru', explainIn: 'pl' });
		start();
		expect(document.querySelector('.hint')?.textContent).toContain('Przeciągnij');
	});
});

describe('review', () => {
	const cell = (id: string) => unit.cells.find((c) => c.id === id)!;

	it('finds what is due: an answer missed today, but not a new item or a correct one', async () => {
		await recordAnswer(manifest.id, cell('acc.sg'), 'again');
		await recordAnswer(manifest.id, cell('nom.sg'), 'good');
		expect(dueCells(manifest.id, unit).map((c) => c.id)).toEqual(['acc.sg']);
	});

	it('finds a correct answer once its day comes', async () => {
		await recordAnswer(manifest.id, cell('nom.sg'), 'good');
		const [y, m, d] = todayLocalDate().split('-').map(Number);
		const tomorrow = new Date(y, m - 1, d + 1);
		const pad = (n: number) => String(n).padStart(2, '0');
		const later = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
		expect(dueCells(manifest.id, unit, later).map((c) => c.id)).toEqual(['nom.sg']);
	});

	it('asks only what is due, shows the rest, and ignores a drop on what is shown', async () => {
		await recordAnswer(manifest.id, cell('acc.sg'), 'again');
		render(QuizView, { pack: manifest, unit, only: new Set([cell('acc.sg').item]) });
		expect(slips().map((slip) => slip.textContent)).toEqual(['кімнату']);
		expect(cellEl('nom.sg').classList.contains('given')).toBe(true);
		expect(cellEl('nom.sg').textContent).toContain('кімна́та');
		expect(cellEl('acc.sg').textContent?.trim()).toBe('');

		await place('кімнату', 'nom.sg');
		expect(slipWith('кімнату')).toBeDefined();
		expect(cellEl('acc.sg').classList.contains('revealed')).toBe(false);

		// The drop was ignored, so the slip is still selected.
		await userEvent.click(cellEl('acc.sg'));
		expect(cellEl('acc.sg').classList.contains('correct')).toBe(true);
		expect(levelOf(manifest.id, cell('acc.sg'))).toBe(1);
	});

	it('walks the boards that have something due, then says it is done', async () => {
		const other = { ...unit, id: 'other', title: 'Second board' };
		await recordAnswer(manifest.id, cell('acc.sg'), 'again');
		render(ReviewView, { pack: manifest, units: [unit, other] });

		// Both boards contain the item, since a word can recur across units.
		expect(document.querySelector('h2')?.textContent).toBe(unit.title);
		await place('кімнату', 'acc.sg');
		await userEvent.click(document.querySelector<HTMLElement>('.score .action')!);
		expect(document.querySelector('h2')?.textContent).toBe('Second board');
		await place('кімнату', 'acc.sg');
		await userEvent.click(document.querySelector<HTMLElement>('.score .action')!);
		expect(document.querySelector('.done')?.textContent).toContain('All done');
	});

	it('says so when nothing is due', async () => {
		render(ReviewView, { pack: manifest, units: [unit] });
		expect(document.querySelector('main, p')?.textContent).toContain('Nothing is due');
		expect(document.querySelector('[data-cell-id]')).toBeNull();
	});
});
