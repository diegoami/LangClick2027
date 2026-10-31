<script lang="ts">
	// Repetition: what is due across every started unit, one board at a time. The
	// queue is fixed when the review starts, so an answer that comes straight back as
	// due doesn't keep a board open forever: it waits for the next review.
	import type { LocalUnit, PackManifest } from '@langclick/pack-format';
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { t } from './language.svelte';
	import { dueCells } from './progress.svelte';
	import { todayLocalDate } from './progressRepository';
	import QuizView from './QuizView.svelte';
	import type { Skill } from './progressRepository';
	import TypeView from './TypeView.svelte';

	interface Props {
		pack: PackManifest;
		units: LocalUnit[];
	}

	let { pack, units }: Props = $props();

	// A form you learned to type is asked by typing, and one you learned on the tray by the
	// tray: they are different knowledge, and each has its own due date.
	const SKILLS: Skill[] = ['recognise', 'produce'];
	const queue = untrack(() =>
		units
			.flatMap((unit) =>
				SKILLS.map((skill) => ({
					unit,
					skill,
					due: new Set(dueCells(pack.id, unit, todayLocalDate(), skill).map((cell) => cell.item))
				}))
			)
			.filter(({ due }) => due.size > 0)
	);

	let index = $state(0);
	const current = $derived(queue[index]);
	const remaining = $derived(queue.length - index);
</script>

<p>{queue.length ? t('review.intro') : t('review.none')}</p>

{#if current}
	<h2>{current.unit.title}</h2>
	<p class="remaining">{t('review.remaining', { count: remaining })}</p>
	{#key index}
		{@const next = {
			label: remaining > 1 ? t('review.next') : t('review.finish'),
			action: () => (index += 1)
		}}
		{#if current.skill === 'produce'}
			<TypeView {pack} unit={current.unit} only={current.due} {next} />
		{:else}
			<QuizView {pack} unit={current.unit} only={current.due} {next} />
		{/if}
	{/key}
{:else if queue.length}
	<p class="done">{t('review.done')}</p>
{/if}

<p><a href={resolve('/')}>← {t('lesson.back')}</a></p>

<style>
	p {
		margin: 0 0 0.75rem;
	}

	h2 {
		font-size: 1.1rem;
		margin-bottom: 0.25rem;
	}

	.remaining {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.done {
		font-weight: 600;
		color: var(--known);
	}
</style>
