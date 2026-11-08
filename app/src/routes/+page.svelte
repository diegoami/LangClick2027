<script lang="ts">
	import LanguagePicker from '$lib/LanguagePicker.svelte';
	import { t } from '$lib/language.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Langclick</title>
</svelte:head>

<main>
	<h1>Langclick</h1>
	<p class="tagline">{t('app.tagline')}</p>
	<LanguagePicker packs={data.packs} />
</main>

<style>
	main {
		max-width: 34rem;
	}

	.tagline {
		margin: 0.25rem 0 1rem;
		color: var(--muted);
	}
</style>
