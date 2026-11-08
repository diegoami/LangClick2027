<script lang="ts">
	import type { PackManifest } from '@langclick/pack-format';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		availableLocales,
		chooseLanguages,
		comparison,
		explanationLanguage,
		languageName,
		targetPackId,
		t
	} from './language.svelte';

	interface Props {
		packs: PackManifest[];
	}

	let { packs }: Props = $props();
	const NONE = '';
	let targetChoice = $state(
		untrack(() => packs.find((pack) => pack.id === targetPackId())?.id ?? packs[0]?.id ?? NONE)
	);
	const selectedPack = $derived(packs.find((pack) => pack.id === targetChoice));
	const comparisons = $derived(selectedPack?.comparisons ?? []);
	let compareChoice = $state(
		untrack(() => (comparisons.includes(comparison() ?? NONE) ? comparison()! : NONE))
	);
	let explainChoice = $state(explanationLanguage());

	function selectTarget(event: Event) {
		targetChoice = (event.currentTarget as HTMLSelectElement).value;
		if (!comparisons.includes(compareChoice)) compareChoice = NONE;
	}

	async function apply() {
		if (!selectedPack) return;
		chooseLanguages({
			targetPack: selectedPack.id,
			compareWith: compareChoice === NONE ? null : compareChoice,
			explainIn: explainChoice
		});
		await goto(resolve('/learn/[pack]', { pack: selectedPack.id }), { invalidateAll: true });
	}
</script>

<form
	class="picker"
	onsubmit={(event) => {
		event.preventDefault();
		void apply();
	}}
>
	<h2>{t('settings.title')}</h2>
	<div class="fields">
		<label>
			{t('settings.target')}
			<select name="targetPack" value={targetChoice} onchange={selectTarget}>
				{#each packs as pack (pack.id)}
					<option value={pack.id}>{languageName(pack.language, explanationLanguage())}</option>
				{/each}
			</select>
		</label>
		<label>
			{t('settings.explainIn')}
			<select name="explainIn" bind:value={explainChoice}>
				{#each availableLocales as code (code)}
					<option value={code}>{languageName(code)}</option>
				{/each}
			</select>
		</label>
		<label>
			{t('settings.compareWith')}
			<select name="compareWith" bind:value={compareChoice}>
				<option value={NONE}>{t('settings.noComparison')}</option>
				{#each comparisons as code (code)}
					<option value={code}>{languageName(code)}</option>
				{/each}
			</select>
		</label>
		<button type="submit" class="action" disabled={!selectedPack}>{t('settings.continue')}</button>
	</div>
</form>

<style>
	.picker {
		margin-bottom: 1rem;
		padding: 0.75rem;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		background: var(--card);
	}

	h2 {
		font-size: 1rem;
	}

	.fields {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	select {
		padding: 0.35rem;
		font: inherit;
		color: var(--ink);
	}
</style>
