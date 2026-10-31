<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PackManifest, Unit } from '@langclick/pack-format';
	import { unitKnown, unitStarted } from '$lib/progress.svelte';

	let { data } = $props();

	// A unit opens on the Overview until there is something earned to show.
	function opening(pack: PackManifest, unit: Unit) {
		const params = { pack: pack.id, unit: unit.id };
		return unitStarted(pack.id, unit)
			? resolve('/unit/[pack]/[unit]', params)
			: resolve('/unit/[pack]/[unit]/overview', params);
	}
</script>

<svelte:head>
	<title>Langclick</title>
</svelte:head>

<main>
	<h1>Langclick</h1>
	<p class="tagline">Fill in the board. What you get right stays known.</p>

	{#each data.packs as { pack, units } (pack.id)}
		<section>
			<h2>{pack.name}</h2>
			<ul>
				{#each units as unit (unit.id)}
					{@const known = unitKnown(pack.id, unit)}
					<li>
						<a href={opening(pack, unit)}>
							<span class="title">{unit.title}</span>
							<span class="count">{known} of {unit.cells.length} known</span>
							<span class="bar" aria-hidden="true">
								<span style:width="{(100 * known) / unit.cells.length}%"></span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</main>

<style>
	.tagline {
		margin: 0.25rem 0 1.5rem;
		color: var(--muted);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: 0.6rem;
		margin: 0.6rem 0 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: block;
		height: 100%;
		padding: 0.75rem;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		background: var(--card);
		color: inherit;
		text-decoration: none;
	}

	a:hover {
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
