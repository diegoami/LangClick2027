import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import type { PackManifest, Unit } from '@langclick/pack-format';
import kimnata from '../../../packs/uk/units/kimnata.json';
import pack from '../../../packs/uk/pack.json';
import { forgetRound } from './quizRound';
import { levelOf, loadProgress, resetProgressMirror } from './progress.svelte';
import QuizView from './QuizView.svelte';

const manifest = pack as PackManifest;
const unit = kimnata as Unit;

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

describe('QuizView', () => {
	beforeEach(async () => {
		localStorage.clear();
		resetProgressMirror();
		await loadProgress(manifest.id);
	});

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
});
