import { choice } from '$lib/language.svelte';
import { listPacks, loadCourse } from '$lib/packs';
import { loadProgress } from '$lib/progress.svelte';

export async function load() {
	const packs = await Promise.all(
		listPacks().map(async (pack) => {
			await loadProgress(pack.id);
			return { pack, lessons: await loadCourse(pack, choice()) };
		})
	);
	return { packs };
}
