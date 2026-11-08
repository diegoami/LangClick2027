import { listPacks } from '$lib/packs';

export function load() {
	return { packs: listPacks() };
}
