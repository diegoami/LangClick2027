<script lang="ts">
	// What a cell has to say once its answer is visible. The one card every screen
	// uses, like Geoclick's FactCard: each screen decides when, this decides how.
	import { shownText, type LocalCell } from '@langclick/pack-format';
	import ConceptList from './ConceptList.svelte';
	import { comparison, explanationLanguage, languageName, t } from './language.svelte';

	interface Props {
		cell: LocalCell;
		lang: string;
		lead?: string;
	}

	let { cell, lang, lead }: Props = $props();

	// The language being compared with comes first: it's the one that was chosen.
	const cognates = $derived(
		Object.entries(cell.cognates ?? {}).sort(([a], [b]) =>
			a === comparison() ? -1 : b === comparison() ? 1 : a.localeCompare(b)
		)
	);
</script>

<aside class="note" aria-live="polite">
	{#if lead}<p class="lead">{lead}</p>{/if}
	<p>
		<strong {lang}>{shownText(cell)}</strong>
		{#if cell.ipa}<span class="ipa">{cell.ipa}</span>{/if}
		{#if cell.clue}&ensp;{cell.clue}{/if}
	</p>
	{#if cell.example}
		<p>
			<span {lang}>{cell.example}</span>{#if cell.exampleGloss}: {cell.exampleGloss}{/if}
		</p>
	{/if}
	{#if cell.note}<p>{cell.note}</p>{/if}
	{#if cell.contrast}<p class="contrast">{cell.contrast}</p>{/if}
	{#if cell.falseFriend}
		<p class="false-friend">
			<strong>{t('note.falseFriend')}</strong>
			({t(`note.kind.${cell.falseFriend.kind}`)}):
			<span lang={comparison() ?? undefined}>{cell.falseFriend.form}</span>, {cell.falseFriend
				.means}
		</p>
	{/if}
	{#if cognates.length}
		<p class="cognates">
			{t('note.cognates')}:
			{#each cognates as [language, cognate], i (language)}
				{#if i > 0};
				{/if}
				{languageName(language, explanationLanguage())}
				<span lang={language}>{cognate.form}</span>
				{#if cognate.ipa}<span class="ipa">{cognate.ipa}</span>{/if}
			{/each}
		</p>
	{/if}
	<ConceptList concepts={cell.conceptDetails} />
</aside>

<style>
	.note {
		margin-top: 0.75rem;
		padding: 0.6rem 0.8rem;
		border-left: 4px solid var(--accent);
		border-radius: 0.25rem;
		background: var(--card);
	}

	p {
		margin: 0.15rem 0;
	}

	.lead {
		color: var(--revealed);
		font-weight: 600;
	}

	strong {
		font-size: 1.1rem;
	}

	.ipa {
		color: var(--accent);
	}

	.contrast {
		padding-left: 0.5rem;
		border-left: 2px solid var(--line);
	}

	.false-friend strong {
		font-size: inherit;
		color: var(--wrong);
	}

	.cognates {
		font-size: 0.9rem;
		color: var(--muted);
	}
</style>
