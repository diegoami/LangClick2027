<script lang="ts">
	import { t } from '$lib/language.svelte';
	import ReviewView from '$lib/ReviewView.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{t('review.title')} · Langclick</title>
</svelte:head>

<main>
	<h1>{t('review.title')}</h1>
	<ReviewView pack={data.pack} units={data.units} />
</main>

<style>
	h1 {
		margin-bottom: 0.5rem;
		font-size: 1.4rem;
	}
</style>
