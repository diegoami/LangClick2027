<script lang="ts">
	// Everything the unit expects you to learn, with every answer showing.
	import {
		shownText,
		type LocalCell,
		type LocalUnit,
		type PackManifest
	} from '@langclick/pack-format';
	import Board from './Board.svelte';
	import CellFace from './CellFace.svelte';
	import CellNote from './CellNote.svelte';
	import { t } from './language.svelte';

	interface Props {
		pack: PackManifest;
		unit: LocalUnit;
	}

	let { pack, unit }: Props = $props();
	let chosen = $state<LocalCell>();
	// A change of language rebuilds the cells, so follow the choice by id.
	const current = $derived(unit.cells.find((cell) => cell.id === chosen?.id));
</script>

<p>{unit.summary}</p>

<Board
	{unit}
	spoken={shownText}
	classOf={(cell) => `pickable ${cell.id === chosen?.id ? 'selected' : ''}`}
	onpick={(cell) => (chosen = cell)}
>
	{#snippet face(cell)}
		<CellFace {cell} lang={pack.language} showAnswer={true} />
	{/snippet}
</Board>

{#if current}
	<CellNote cell={current} lang={pack.language} />
{/if}

<footer>
	{t('overview.sources')}
	{#each unit.sources as source, i (i)}
		{#if i > 0},{/if}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- an outside address -->
		<a href={source.url} rel="external noreferrer" target="_blank">{source.title}</a>
	{/each}. {t('overview.licence', { licence: pack.licence })}
</footer>

<style>
	p {
		margin: 0 0 0.75rem;
	}

	footer {
		margin-top: 1rem;
		font-size: 0.8rem;
		color: var(--muted);
	}
</style>
