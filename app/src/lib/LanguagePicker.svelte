<script lang="ts">
	// The two choices that decide what is explained and in which language. They are
	// separate because a learner may read one language while comparing with another.
	import type { PackManifest } from '@langclick/pack-format';
	import { invalidateAll } from '$app/navigation';
	import {
		availableLocales,
		chooseLanguages,
		comparison,
		explanationLanguage,
		languageName,
		t
	} from './language.svelte';

	interface Props {
		packs: PackManifest[];
		/** First run: ask for a confirmation instead of applying each change. */
		firstRun: boolean;
	}

	let { packs, firstRun }: Props = $props();

	const NONE = '';
	const comparisons = $derived([...new Set(packs.flatMap((pack) => pack.comparisons))].sort());

	async function apply(compareWith: string, explainIn: string) {
		chooseLanguages({ compareWith: compareWith === NONE ? null : compareWith, explainIn });
		await invalidateAll();
	}

	let compareChoice = $state(comparison() ?? NONE);
	let explainChoice = $state(explanationLanguage());
</script>

<form
	class="picker"
	onsubmit={(event) => {
		event.preventDefault();
		void apply(compareChoice, explainChoice);
	}}
>
	<h2>{t('settings.title')}</h2>
	{#if firstRun}<p>{t('settings.intro')}</p>{/if}
	<div class="fields">
		<label>
			{t('settings.compareWith')}
			<select
				name="compareWith"
				bind:value={compareChoice}
				onchange={() => {
					if (!firstRun) void apply(compareChoice, explainChoice);
				}}
			>
				<option value={NONE}>{t('settings.noComparison')}</option>
				{#each comparisons as code (code)}
					<option value={code}>{languageName(code)}</option>
				{/each}
			</select>
		</label>
		<label>
			{t('settings.explainIn')}
			<select
				name="explainIn"
				bind:value={explainChoice}
				onchange={() => {
					if (!firstRun) void apply(compareChoice, explainChoice);
				}}
			>
				{#each availableLocales as code (code)}
					<option value={code}>{languageName(code)}</option>
				{/each}
			</select>
		</label>
		{#if firstRun}
			<button type="submit" class="action">{t('settings.start')}</button>
		{/if}
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

	p {
		margin: 0.25rem 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.fields {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
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
