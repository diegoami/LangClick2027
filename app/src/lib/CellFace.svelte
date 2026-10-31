<script lang="ts">
	import { sentenceParts, shownText, type LocalCell } from '@langclick/pack-format';

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

	const parts = $derived(cell.sentence ? sentenceParts(cell.sentence) : undefined);
</script>

{#if parts}
	<span class="sentence" {lang}>
		{parts[0]}{#if showAnswer}<span class="answer" data-level={level}>{shownText(cell)}</span
			>{:else}<span class="gap"></span>{/if}{parts[1]}
	</span>
	{#if cell.sentenceGloss}
		<span class="clue">{cell.sentenceGloss}</span>
	{/if}
{:else}
	<span class="answer" data-level={level} {lang}>
		{#if showAnswer}{shownText(cell)}{:else}&nbsp;{/if}
	</span>
	{#if showAnswer && cell.ipa}
		<span class="ipa">{cell.ipa}</span>
	{/if}
	{#if cell.clue}
		<span class="clue">{cell.clue}</span>
	{/if}
{/if}

<style>
	.sentence {
		font-size: 1.05rem;
		line-height: 1.4;
	}

	.gap {
		display: inline-block;
		width: 4.5em;
		border-bottom: 2px solid var(--muted);
	}

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
