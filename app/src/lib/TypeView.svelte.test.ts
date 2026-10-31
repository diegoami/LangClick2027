import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { localizeUnit, type LocalUnit, type PackManifest } from '@langclick/pack-format';
import pack from '../../../packs/uk/pack.json';
import { resetLanguages } from './language.svelte';
import {
	dueCells,
	levelOf,
	loadProgress,
	recordAnswer,
	resetProgressMirror
} from './progress.svelte';
import { todayLocalDate } from './progressRepository';
import { forgetRound } from './quizRound';
import ReviewView from './ReviewView.svelte';
import TypeView from './TypeView.svelte';

const manifest = pack as unknown as PackManifest;

const ANSWERS: Record<string, string> = { mama: 'мамо', brat: 'братові', olena: 'Олено' };

const unit: LocalUnit = localizeUnit(
	{
		id: 'typed',
		sources: [],
		typing: true,
		layout: { type: 'grid', size: 3 },
		cells: [
			{ id: 'mama', item: 't:mama', text: 'мамо', display: 'ма́мо', clue: 'ма́ма' },
			{
				id: 'brat',
				item: 't:brat',
				text: 'братові',
				display: 'бра́тові',
				clue: 'брат',
				alsoAccepted: ['брату']
			},
			{ id: 'olena', item: 't:olena', text: 'Олено', display: 'Оле́но', clue: 'Оле́на' }
		]
	},
	{ title: 'Typed', summary: '' },
	undefined,
	{}
);

const input = () => document.querySelector<HTMLInputElement>('[data-typed]')!;
const cellEl = (id: string) => document.querySelector<HTMLElement>(`[data-cell-id="${id}"]`)!;
const activeId = () => document.querySelector<HTMLElement>('.cell.target')?.dataset.cellId;
const note = () => document.querySelector('aside')?.textContent ?? '';

async function answer(text: string) {
	await userEvent.fill(input(), text);
	await userEvent.keyboard('{Enter}');
}

function start() {
	forgetRound(manifest.id, `${unit.id}#type`);
	return render(TypeView, { pack: manifest, unit });
}

/** Moves to one cell, whatever order the round came in. */
async function choose(id: string) {
	await userEvent.click(cellEl(id));
	expect(activeId()).toBe(id);
}

beforeEach(async () => {
	localStorage.clear();
	resetLanguages({ compareWith: null, explainIn: 'en' });
	resetProgressMirror();
	await loadProgress(manifest.id);
});

describe('TypeView', () => {
	it('asks one cell at a time, shows no answers, and has no tray', () => {
		start();
		expect(document.querySelectorAll('.cell.target')).toHaveLength(1);
		expect(document.querySelector('[data-slip-id]')).toBeNull();
		expect(cellEl('mama').textContent).not.toContain('ма́мо');
	});

	it('fills the cell on the right form, and moves on', async () => {
		start();
		await choose('mama');
		await answer('мамо');
		expect(cellEl('mama').classList.contains('correct')).toBe(true);
		expect(cellEl('mama').textContent).toContain('ма́мо');
		expect(activeId()).not.toBe('mama');
		expect(input().value).toBe('');
		expect(document.activeElement).toBe(input());
		expect(note()).toBe('');
	});

	it('reveals the right form on a wrong one, and says what was typed', async () => {
		start();
		await choose('mama');
		await answer('мама');
		expect(cellEl('mama').classList.contains('revealed')).toBe(true);
		expect(note()).toContain('You typed мама');
		expect(note()).toContain('ма́мо');
	});

	it('forgives stress marks and capitals', async () => {
		start();
		await choose('olena');
		await answer('оле́но');
		expect(cellEl('olena').classList.contains('correct')).toBe(true);
	});

	it('accepts another right form, and shows what this board has', async () => {
		start();
		await choose('brat');
		await answer('брату');
		expect(cellEl('brat').classList.contains('correct')).toBe(true);
		expect(note()).toContain('Also right');
		expect(note()).toContain('бра́тові');
	});

	it('ignores an empty answer', async () => {
		start();
		const before = activeId();
		await answer('   ');
		expect(activeId()).toBe(before);
		expect(document.querySelector('.cell.revealed')).toBeNull();
	});

	it('keeps typing apart from recognising', async () => {
		start();
		await choose('mama');
		await answer('мамо');
		expect(levelOf(manifest.id, { item: 't:mama' }, 'produce')).toBeGreaterThan(0);
		expect(levelOf(manifest.id, { item: 't:mama' })).toBe(0);
	});

	it('ends the round with a score', async () => {
		start();
		for (let i = 0; i < 3; i++) await answer(ANSWERS[activeId()!]);
		expect(document.querySelector('.score')?.textContent).toContain('3 of 3');
		expect(input()).toBeNull();
	});

	it('types at the caret from the on-screen keyboard', async () => {
		start();
		await userEvent.click(document.querySelector('.keyboard-toggle')!);
		const key = (name: string) =>
			[...document.querySelectorAll<HTMLButtonElement>('.keys button')].find(
				(button) => button.textContent === name
			)!;
		await userEvent.click(key('м'));
		await userEvent.click(key('а'));
		await userEvent.click(key('ї'));
		await userEvent.click(key('⌫'));
		expect(input().value).toBe('ма');
		expect(document.activeElement).toBe(input());
	});
});

describe('review', () => {
	it('asks a form you learned by typing by typing, and only that', async () => {
		await recordAnswer(manifest.id, { item: 't:mama' }, 'again', 'produce');
		expect(dueCells(manifest.id, unit, todayLocalDate(), 'produce')).toHaveLength(1);
		expect(dueCells(manifest.id, unit)).toHaveLength(0);

		render(ReviewView, { pack: manifest, units: [unit] });
		expect(document.querySelector('[data-typed]')).not.toBeNull();
		expect(document.querySelector('[data-slip-id]')).toBeNull();
		expect(activeId()).toBe('mama');
		expect(cellEl('brat').classList.contains('given')).toBe(true);
	});
});
