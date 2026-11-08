import { beforeEach, expect, it, vi } from 'vitest';
import { load } from './+page';
import { load as loadHome } from '../../+page';
import { findPack, listPacks, loadCourse } from '$lib/packs';
import { loadProgress } from '$lib/progress.svelte';

vi.mock('$lib/packs', () => ({ findPack: vi.fn(), listPacks: vi.fn(), loadCourse: vi.fn() }));
vi.mock('$lib/progress.svelte', () => ({ loadProgress: vi.fn() }));
vi.mock('$lib/language.svelte', () => ({
	choice: () => ({ compareWith: undefined, explainIn: 'en' })
}));

const pack = { id: 'selected' } as NonNullable<ReturnType<typeof findPack>>;
const event = { params: { pack: pack.id } } as Parameters<typeof load>[0];

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(findPack).mockReturnValue(pack);
	vi.mocked(listPacks).mockReturnValue([pack]);
	vi.mocked(loadCourse).mockResolvedValue([]);
});

it('loads only manifests on the landing page', () => {
	expect(loadHome()).toEqual({ packs: [pack] });
	expect(loadCourse).not.toHaveBeenCalled();
	expect(loadProgress).not.toHaveBeenCalled();
});

it('loads progress and lessons only for the requested course', async () => {
	expect(await load(event)).toEqual({ pack, lessons: [] });
	expect(findPack).toHaveBeenCalledWith(pack.id);
	expect(loadProgress).toHaveBeenCalledExactlyOnceWith(pack.id);
	expect(loadCourse).toHaveBeenCalledExactlyOnceWith(pack, {
		compareWith: undefined,
		explainIn: 'en'
	});
});

it('returns 404 for an unavailable course without loading progress or content', async () => {
	vi.mocked(findPack).mockReturnValue(undefined);
	await expect(load(event)).rejects.toMatchObject({ status: 404 });
	expect(loadProgress).not.toHaveBeenCalled();
	expect(loadCourse).not.toHaveBeenCalled();
});
