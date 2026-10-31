<script lang="ts">
	import '../app.css';
	import { explanationLanguage } from '$lib/language.svelte';

	let { children } = $props();

	$effect(() => {
		document.documentElement.lang = explanationLanguage();
	});
</script>

{@render children()}
