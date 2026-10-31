<script lang="ts">
	// Everything the unit expects you to learn, with every answer showing.
	import { shownText, type Cell, type PackManifest, type Unit } from '@langclick/pack-format';
	import Board from './Board.svelte';
	import CellFace from './CellFace.svelte';
	import CellNote from './CellNote.svelte';

	interface Props {
		pack: PackManifest;
		unit: Unit;
	}

	let { pack, unit }: Props = $props();
	let chosen = $state<Cell>();
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

{#if chosen}
	<CellNote cell={chosen} lang={pack.language} />
{/if}

<footer>
	Sources:
	{#each unit.sources as source, i (source.url)}
		{#if i > 0},{/if}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- an outside address -->
		<a href={source.url} rel="external noreferrer" target="_blank">{source.title}</a>
	{/each}. Content licence: {pack.licence}.
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
