import { error } from '@sveltejs/kit';
import { findPack, loadUnit } from '$lib/packs';
import { loadProgress } from '$lib/progress.svelte';

export async function load({ params }) {
	const pack = findPack(params.pack);
	const unit = pack && (await loadUnit(pack.id, params.unit));
	if (!pack || !unit) error(404, 'No such unit');
	await loadProgress(pack.id);
	return { pack, unit };
}
