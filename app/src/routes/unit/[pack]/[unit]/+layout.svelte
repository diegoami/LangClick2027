<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { unitKnown } from '$lib/progress.svelte';

	let { data, children } = $props();

	const params = $derived({ pack: data.pack.id, unit: data.unit.id });
	const tabs = $derived([
		{ label: 'Known', href: resolve('/unit/[pack]/[unit]', params) },
		{ label: 'Overview', href: resolve('/unit/[pack]/[unit]/overview', params) },
		{ label: 'Quiz', href: resolve('/unit/[pack]/[unit]/quiz', params) }
	]);
</script>

<svelte:head>
	<title>{data.unit.title} · {data.pack.name} · Langclick</title>
</svelte:head>

<main>
	<header>
		<a class="back" href={resolve('/')}>← {data.pack.name}</a>
		<h1>{data.unit.title}</h1>
		<nav>
			{#each tabs as tab (tab.label)}
				<a
					href={tab.href}
					class:current={page.url.pathname === tab.href}
					aria-current={page.url.pathname === tab.href ? 'page' : undefined}>{tab.label}</a
				>
			{/each}
			<span class="count">
				{unitKnown(data.pack.id, data.unit)} of {data.unit.cells.length} known
			</span>
		</nav>
	</header>

	{@render children()}
</main>

<style>
	header {
		margin-bottom: 0.75rem;
	}

	.back {
		font-size: 0.9rem;
		text-decoration: none;
	}

	h1 {
		margin: 0.15rem 0 0.5rem;
		font-size: 1.4rem;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		border-bottom: 1px solid var(--line);
	}

	nav a {
		padding: 0.35rem 0.8rem;
		border-bottom: 3px solid transparent;
		color: var(--muted);
		text-decoration: none;
	}

	nav a.current {
		border-bottom-color: var(--accent);
		color: var(--ink);
		font-weight: 600;
	}

	.count {
		margin-left: auto;
		font-size: 0.85rem;
		color: var(--muted);
	}
</style>
