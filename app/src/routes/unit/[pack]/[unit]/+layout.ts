import { error } from '@sveltejs/kit';
import { choice } from '$lib/language.svelte';
import { findPack, loadUnit } from '$lib/packs';
import { loadProgress } from '$lib/progress.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	const pack = findPack(params.pack);
	const unit = pack && (await loadUnit(pack, params.unit, choice()));
	if (!pack || !unit) error(404, 'No such unit');
	await loadProgress(pack.id);
	const lessonId = pack.lessons.find((lesson) => lesson.units.includes(unit.id))?.id ?? '';
	return { pack, unit, lessonId };
};
