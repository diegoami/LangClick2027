<script lang="ts">
	// What a cell has to say once its answer is visible. The one card every screen
	// uses, like Geoclick's FactCard: each screen decides when, this decides how.
	import { shownText, type Cell } from '@langclick/pack-format';

	interface Props {
		cell: Cell;
		lang: string;
		lead?: string;
	}

	let { cell, lang, lead }: Props = $props();
</script>

<aside class="note" aria-live="polite">
	{#if lead}<p class="lead">{lead}</p>{/if}
	<p>
		<strong {lang}>{shownText(cell)}</strong>{#if cell.clue}&ensp;{cell.clue}{/if}
	</p>
	{#if cell.note}<p>{cell.note}</p>{/if}
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
		margin: 0.1rem 0;
	}

	.lead {
		color: var(--revealed);
		font-weight: 600;
	}

	strong {
		font-size: 1.1rem;
	}
</style>
