import { afterEach, beforeEach, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { localizeUnit, type PackManifest, type Unit, type UnitText } from '@langclick/pack-format';
import '../app.css';
import manifest from '../../../packs/uk/pack.json';
import present from '../../../packs/uk/units/l27-present.json';
import teach from '../../../packs/uk/units/l27-present-teach.json';
import imperative from '../../../packs/uk/units/l27-imperative.json';
import comparative from '../../../packs/uk/units/l21-comparison.json';
import superlative from '../../../packs/uk/units/l21-superlative.json';
import OverviewView from './OverviewView.svelte';
import { resetLanguages } from './language.svelte';

const layers = import.meta.glob<UnitText>('../../../packs/uk/layers/*/units/l*.json', {
	eager: true,
	import: 'default'
});
const tables = [present, teach, imperative, comparative, superlative] as unknown as Unit[];
const cases = tables.flatMap((unit) =>
	['en', 'ru', 'pl', 'uk'].map((base) => ({ unit, base, name: `${unit.id}/${base}` }))
);

beforeEach(async () => {
	await page.viewport(375, 667);
	// The real page's main element leaves one rem on each side.
	document.body.style.padding = '1rem';
});

afterEach(() => {
	document.body.style.removeProperty('padding');
});

it.each(cases)(
	'$name keeps each visible answer inside its own cell on a phone',
	async ({ unit, base }) => {
		resetLanguages({ compareWith: null, explainIn: base });
		const text = layers[`../../../packs/uk/layers/${base}/units/${unit.id}.json`];
		render(OverviewView, {
			pack: manifest as unknown as PackManifest,
			unit: localizeUnit(unit, text, undefined, {})
		});
		await tick();
		const cells = [...document.querySelectorAll<HTMLElement>('[data-cell-id]')];
		expect(cells).toHaveLength(unit.cells.length);
		const overhanging = cells.flatMap((cell) => {
			const answer = cell.querySelector('.answer')!;
			const range = document.createRange();
			range.selectNodeContents(answer);
			const box = cell.getBoundingClientRect();
			// Checking the document width alone misses text painted over the next cell.
			return [...range.getClientRects()].some(
				(rect) => rect.left < box.left - 1 || rect.right > box.right + 1
			)
				? [cell.dataset.cellId]
				: [];
		});
		expect(overhanging).toEqual([]);
	}
);
