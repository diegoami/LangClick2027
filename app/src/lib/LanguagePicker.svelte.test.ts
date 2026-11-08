import { beforeEach, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { tick } from 'svelte';
import { goto } from '$app/navigation';
import type { PackManifest } from '@langclick/pack-format';
import Home from '../routes/+page.svelte';
import { choice, resetLanguages, targetPackId } from './language.svelte';
import uk from '../../../packs/uk/pack.json';
import sv from '../../../packs/sv/pack.json';
import ja from '../../../packs/ja/pack.json';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
const packs = [uk, sv, ja] as unknown as PackManifest[];

function field(name: string) {
	return document.querySelector<HTMLSelectElement>(`select[name="${name}"]`)!;
}

async function select(name: string, value: string) {
	field(name).value = value;
	field(name).dispatchEvent(new Event('change', { bubbles: true }));
	await tick();
}

beforeEach(() => {
	localStorage.clear();
	resetLanguages();
	vi.clearAllMocks();
});

it('starts with a short language form and no course or progress lists', () => {
	render(Home, { data: { packs } });
	expect(field('targetPack').options).toHaveLength(packs.length);
	expect(document.querySelectorAll('ol, [href*="/lesson/"], [href*="/review/"]')).toHaveLength(0);
	expect(document.querySelector('button[type="submit"]')?.textContent).toBe('Continue');
});

it('saves all choices and opens only the selected course', async () => {
	render(Home, { data: { packs } });
	await select('targetPack', 'sv');
	await select('compareWith', 'de');
	await select('explainIn', 'pl');
	await userEvent.click(document.querySelector('button')!);
	expect(goto).toHaveBeenCalledWith('/learn/sv', { invalidateAll: true });
	expect(choice()).toEqual({ compareWith: 'de', explainIn: 'pl' });
	expect(targetPackId()).toBe('sv');
	expect(JSON.parse(localStorage.getItem('langclick:settings:v1')!)).toEqual({
		targetPack: 'sv',
		compareWith: 'de',
		explainIn: 'pl'
	});
});

it('restores the last target without automatically leaving the chooser', () => {
	resetLanguages({ targetPack: 'sv', compareWith: 'de', explainIn: 'pl' });
	render(Home, { data: { packs } });
	expect(field('targetPack').value).toBe('sv');
	expect(field('compareWith').value).toBe('de');
	expect(field('explainIn').value).toBe('pl');
	expect(goto).not.toHaveBeenCalled();
});

it('clears an unsupported comparison visibly when the target changes', async () => {
	resetLanguages({ targetPack: 'uk', compareWith: 'ru', explainIn: 'en' });
	render(Home, { data: { packs } });
	await select('targetPack', 'ja');
	expect(field('compareWith').value).toBe('');
	expect([...field('compareWith').options].map((option) => option.value)).toEqual([
		'',
		...ja.comparisons
	]);
	await userEvent.click(document.querySelector('button')!);
	expect(choice().compareWith).toBeUndefined();
	expect(goto).toHaveBeenCalledWith('/learn/ja', { invalidateAll: true });
});

it('keeps old preferences usable when they have no target pack', () => {
	resetLanguages({ compareWith: 'ru', explainIn: 'pl' });
	render(Home, { data: { packs } });
	expect(field('targetPack').value).toBe('uk');
	expect(field('compareWith').value).toBe('ru');
	expect(field('explainIn').value).toBe('pl');
});

it('falls back to an available target when a saved pack is unavailable', () => {
	resetLanguages({ targetPack: 'removed', compareWith: 'de', explainIn: 'en' });
	render(Home, { data: { packs } });
	expect(field('targetPack').value).toBe('uk');
	expect(field('compareWith').value).toBe('');
});
