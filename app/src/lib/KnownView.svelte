<script lang="ts">
	// Only what the player has earned: an answer appears at its first clean quiz
	// answer and strengthens up to Known. Nothing here gives away what isn't earned.
	import {
		shownText,
		type LocalCell,
		type LocalUnit,
		type PackManifest
	} from '@langclick/pack-format';
	import Board from './Board.svelte';
	import CellFace from './CellFace.svelte';
	import CellNote from './CellNote.svelte';
	import { KNOWN_CLEAN_STREAK } from './difficulty';
	import { t } from './language.svelte';
	import { levelOf, unitStarted } from './progress.svelte';

	interface Props {
		pack: PackManifest;
		unit: LocalUnit;
	}

	let { pack, unit }: Props = $props();
	let chosen = $state<LocalCell>();
	const current = $derived(unit.cells.find((cell) => cell.id === chosen?.id));

	const earned = (cell: LocalCell) => levelOf(pack.id, cell) > 0;
</script>

<p>{unitStarted(pack.id, unit) ? t('known.hint') : t('known.empty')}</p>

<Board
	{unit}
	spoken={(cell) => (earned(cell) ? shownText(cell) : t('cell.notEarned'))}
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

{#if current}
	<CellNote cell={current} lang={pack.language} />
{/if}

<style>
	p {
		margin: 0 0 0.75rem;
	}
</style>
