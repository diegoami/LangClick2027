<script lang="ts">
	import { shownText, type LocalCell } from '@langclick/pack-format';

	interface Props {
		cell: LocalCell;
		/** The pack's language tag, so the answer is read and drawn correctly. */
		lang: string;
		/** Whether the answer is visible yet. */
		showAnswer: boolean;
		/** 0 to 3: how strongly an earned answer is drawn. */
		level?: number;
	}

	let { cell, lang, showAnswer, level = 3 }: Props = $props();
</script>

<span class="answer" data-level={level} {lang}>
	{#if showAnswer}{shownText(cell)}{:else}&nbsp;{/if}
</span>
{#if showAnswer && cell.ipa}
	<span class="ipa">{cell.ipa}</span>
{/if}
{#if cell.clue}
	<span class="clue">{cell.clue}</span>
{/if}

<style>
	.answer {
		font-size: 1.15rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.answer[data-level='1'] {
		opacity: 0.45;
	}

	.answer[data-level='2'] {
		opacity: 0.7;
	}

	.ipa {
		font-size: 0.75rem;
		color: var(--accent);
	}

	.clue {
		font-size: 0.75rem;
		line-height: 1.2;
		color: var(--muted);
	}
</style>
