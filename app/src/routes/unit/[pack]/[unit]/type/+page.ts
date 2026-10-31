import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { unit } = await parent();
	if (!unit.typing) error(404, 'This unit has no typing');
};
