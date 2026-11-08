<script lang="ts">
	import { resolve } from '$app/paths';
	import { explanationLanguage, languageName, t } from '$lib/language.svelte';
	import type { LocalLesson } from '$lib/packs';
	import { dueCount, isStudied, unitKnown } from '$lib/progress.svelte';

	let { data } = $props();

	const pack = $derived(data.pack);
	const lessons = $derived(data.lessons);
	const dueTotal = $derived(lessons.reduce((sum, lesson) => sum + due(pack.id, lesson), 0));

	function known(packId: string, lesson: LocalLesson) {
		return lesson.units.reduce((sum, unit) => sum + unitKnown(packId, unit), 0);
	}

	function total(lesson: LocalLesson) {
		return lesson.units.reduce((sum, unit) => sum + unit.cells.length, 0);
	}

	function due(packId: string, lesson: LocalLesson) {
		return lesson.units.reduce((sum, unit) => sum + dueCount(packId, unit), 0);
	}
</script>

<svelte:head>
	<title>{languageName(pack.language, explanationLanguage())} · Langclick</title>
</svelte:head>

<main>
	<a class="back" href={resolve('/')}>← {t('settings.change')}</a>
	<h1>{languageName(pack.language, explanationLanguage())}</h1>
	<section>
		{#if dueTotal > 0}
			<a class="action review" href={resolve('/review/[pack]', { pack: pack.id })}
				>{t('home.review', { count: dueTotal })}</a
			>
		{:else}
			<p class="quiet">{t('home.nothingDue')}</p>
		{/if}
		{#each pack.sections as sectionId (sectionId)}
			{@const inSection = lessons.filter((lesson) => lesson.section.id === sectionId)}
			{#if inSection.length > 0}
				<h2>{inSection[0].section.title}</h2>
				<ol>
					{#each inSection as lesson (lesson.id)}
						{@const dueNow = due(pack.id, lesson)}
						{@const knownNow = known(pack.id, lesson)}
						{@const size = total(lesson)}
						<li>
							<a
								href={resolve('/lesson/[pack]/[lesson]', {
									pack: pack.id,
									lesson: lesson.id
								})}
							>
								<span class="title">{lesson.title}</span>
								<span class="count">
									{#if isStudied(pack.id, lesson.id)}<span class="studied"
											>✓ {t('lesson.studied')}</span
										>{/if}
									{t('count.known', { known: knownNow, total: size })}
									{#if dueNow > 0}<span class="due">{t('count.due', { count: dueNow })}</span>{/if}
								</span>
								<span class="bar" aria-hidden="true">
									<span style:width="{size ? (100 * knownNow) / size : 0}%"></span>
								</span>
							</a>
						</li>
					{/each}
				</ol>
			{/if}
		{/each}
	</section>
</main>

<style>
	.back {
		font-size: 0.9rem;
		text-decoration: none;
	}

	h1 {
		margin: 0.25rem 0 0.75rem;
	}

	.review {
		margin-top: 0.5rem;
	}

	.quiet {
		margin: 0.25rem 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	h2 {
		margin: 1.25rem 0 0;
		font-size: 1rem;
		color: var(--muted);
	}

	ol {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
		gap: 0.6rem;
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	li a {
		display: block;
		height: 100%;
		padding: 0.75rem;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		background: var(--card);
		color: inherit;
		text-decoration: none;
	}

	li a:hover {
		border-color: var(--accent);
	}

	.title {
		display: block;
		font-weight: 600;
	}

	.count {
		display: block;
		margin: 0.2rem 0 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.studied {
		color: var(--known);
	}

	.due {
		color: var(--revealed);
		font-weight: 600;
	}

	.bar {
		display: block;
		height: 0.35rem;
		border-radius: 0.2rem;
		background: var(--line);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--known);
	}
</style>
