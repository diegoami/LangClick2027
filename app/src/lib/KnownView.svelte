<script lang="ts">
	// Only what the player has earned: an answer appears at its first clean quiz
	// answer and strengthens up to Known. Nothing here gives away what isn't earned.
	import { shownText, type Cell, type PackManifest, type Unit } from '@langclick/pack-format';
	import { resolve } from '$app/paths';
	import Board from './Board.svelte';
	import CellFace from './CellFace.svelte';
	import CellNote from './CellNote.svelte';
	import { KNOWN_CLEAN_STREAK } from './difficulty';
	import { levelOf, unitStarted } from './progress.svelte';

	interface Props {
		pack: PackManifest;
		unit: Unit;
	}

	let { pack, unit }: Props = $props();
	let chosen = $state<Cell>();

	const earned = (cell: Cell) => levelOf(pack.id, cell) > 0;
</script>

{#if !unitStarted(pack.id, unit)}
	<p>
		Nothing earned yet. Look through the
		<a href={resolve('/unit/[pack]/[unit]/overview', { pack: pack.id, unit: unit.id })}>Overview</a
		>, then take the
		<a href={resolve('/unit/[pack]/[unit]/quiz', { pack: pack.id, unit: unit.id })}>Quiz</a>.
	</p>
{:else}
	<p>Answers appear as you earn them, and grow stronger until you know them.</p>
{/if}

<Board
	{unit}
	spoken={(cell) => (earned(cell) ? shownText(cell) : 'not earned yet')}
	classOf={(cell) => {
		if (!earned(cell)) return 'empty';
		const known = levelOf(pack.id, cell) >= KNOWN_CLEAN_STREAK;
		return `pickable ${known ? 'correct' : ''} ${cell.id === chosen?.id ? 'selected' : ''}`;
	}}
	onpick={(cell) => {
		if (earned(cell)) chosen = cell;
	}}
>
	{#snippet face(cell)}
		<CellFace
			{cell}
			lang={pack.language}
			showAnswer={earned(cell)}
			level={levelOf(pack.id, cell)}
		/>
	{/snippet}
</Board>

{#if chosen}
	<CellNote cell={chosen} lang={pack.language} />
{/if}

<style>
	p {
		margin: 0 0 0.75rem;
	}
</style>
