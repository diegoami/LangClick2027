import { listPacks, loadUnits } from '$lib/packs';
import { loadProgress } from '$lib/progress.svelte';

export async function load() {
	const packs = await Promise.all(
		listPacks().map(async (pack) => {
			await loadProgress(pack.id);
			return { pack, units: await loadUnits(pack) };
		})
	);
	return { packs };
}
