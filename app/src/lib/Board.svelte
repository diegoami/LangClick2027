<script lang="ts">
	// A unit's board: the table or grid that plays the part of Geoclick's map. It
	// knows the layout; each screen decides what a cell shows and what a press does.
	// Every cell carries `data-cell-id` for hit-testing, and so tools such as
	// ai-player can drive the board without changing the app.
	import type { Header, LocalCell, LocalUnit } from '@langclick/pack-format';
	import type { Snippet } from 'svelte';

	interface Props {
		unit: LocalUnit;
		face: Snippet<[LocalCell]>;
		/** What the cell currently holds, for screen readers. */
		spoken: (cell: LocalCell) => string;
		classOf?: (cell: LocalCell) => string;
		onpick?: (cell: LocalCell) => void;
	}

	let { unit, face, spoken, classOf = () => '', onpick }: Props = $props();

	function labelOf(headers: Header[], id: string | undefined) {
		return headers.find((entry) => entry.id === id)?.label ?? '';
	}

	function ariaLabel(cell: LocalCell): string {
		if (unit.layout.type !== 'table') return `${cell.sentence ?? cell.clue}: ${spoken(cell)}`;
		const { rows, columns } = unit.layout;
		return `${labelOf(rows, cell.row)}, ${labelOf(columns, cell.col)}: ${spoken(cell)}`;
	}
</script>

{#snippet cellButton(cell: LocalCell)}
	<button
		type="button"
		class="cell {classOf(cell)}"
		data-cell-id={cell.id}
		aria-label={ariaLabel(cell)}
		onclick={() => onpick?.(cell)}
	>
		{@render face(cell)}
	</button>
{/snippet}

{#if unit.layout.type === 'table'}
	{@const { rows, columns } = unit.layout}
	{@const longestRow = Math.max(
		...rows.map((row) =>
			unit.cells
				.filter((cell) => cell.row === row.id)
				.reduce((length, cell) => length + cell.text.length, 0)
		)
	)}
	{@const longestAnswer = Math.max(...unit.cells.map((cell) => cell.text.length))}
	<!-- Many columns or long answers have to fit a phone. Short row labels, such as pronouns, leave them more room. -->
	<table
		class="board-table"
		class:dense={columns.length >= 5 || longestRow >= 24}
		class:tight={columns.length * longestAnswer >= 36}
		class:short-rows={rows.every((row) => row.label.length <= 6)}
	>
		<thead>
			<tr>
				<td></td>
				{#each columns as column (column.id)}
					<th scope="col">{column.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.id)}
				<tr>
					<th scope="row">{row.label}</th>
					{#each columns as column (column.id)}
						{@const cell = unit.cells.find((c) => c.row === row.id && c.col === column.id)}
						<td>
							{#if cell}{@render cellButton(cell)}{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<ul class="board-grid" class:sentences={unit.layout.type === 'sentences'}>
		{#each unit.cells as cell (cell.id)}
			<li>{@render cellButton(cell)}</li>
		{/each}
	</ul>
{/if}

<style>
	.board-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0.35rem;
		table-layout: fixed;
	}

	.board-table thead td {
		width: 28%;
	}

	.board-table.short-rows thead td {
		width: 11%;
	}

	.board-table.dense {
		--answer-size: clamp(0.8rem, 3.7vw, 1.15rem);
		--ipa-size: clamp(0.56rem, 2.45vw, 0.75rem);
		--cell-padding: clamp(0.1rem, 0.6vw, 0.35rem);
		border-spacing: clamp(0.12rem, 0.6vw, 0.35rem);
	}

	.board-table.tight {
		--answer-size: clamp(0.68rem, 2.9vw, 1.15rem);
		--ipa-size: clamp(0.5rem, 2.1vw, 0.75rem);
	}

	.board-table.tight thead td {
		width: 18%;
	}

	th {
		font-weight: 600;
		/* A chart has many columns: on a phone its labels have to shrink to fit. */
		font-size: clamp(0.6rem, 2.6vw, 0.9rem);
		color: var(--muted);
		text-align: left;
		overflow-wrap: break-word;
		hyphens: auto;
	}

	thead th {
		text-align: center;
	}

	td {
		padding: 0;
	}

	.board-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.board-grid.sentences {
		grid-template-columns: 1fr;
	}

	.board-grid li {
		display: flex;
	}

	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
		width: 100%;
		min-height: 3.25rem;
		padding: var(--cell-padding, 0.35rem);
		border: 1px solid var(--line);
		border-radius: 0.4rem;
		background: var(--card);
		text-align: center;
		transition:
			background-color 0.15s,
			border-color 0.15s;
	}

	.cell:global(.empty) {
		border-style: dashed;
		background: transparent;
	}

	.cell:global(.pickable) {
		cursor: pointer;
	}

	.cell:global(.target) {
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.cell:global(.correct) {
		border-color: var(--known);
		background: var(--known-soft);
	}

	.cell:global(.revealed) {
		border-color: var(--revealed);
		background: var(--revealed-soft);
	}

	.cell:global(.wrong) {
		border-color: var(--wrong);
		background: var(--wrong-soft);
	}

	.cell:global(.given) {
		opacity: 0.55;
	}

	.cell:global(.selected) {
		box-shadow: 0 0 0 2px var(--accent);
	}
</style>
