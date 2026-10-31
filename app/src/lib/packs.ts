// Finds the language packs. A pack is a folder under packs/: nothing here names
// one, so adding a pack needs no code. Manifests come with the app; a pack's units
// load when it is opened.

import type { PackManifest, Unit } from '@langclick/pack-format';

const manifests = import.meta.glob<PackManifest>('../../../packs/*/pack.json', {
	eager: true,
	import: 'default'
});
const unitLoaders = import.meta.glob<Unit>('../../../packs/*/units/*.json', {
	import: 'default'
});

export function listPacks(): PackManifest[] {
	return Object.values(manifests).sort((a, b) => a.name.localeCompare(b.name));
}

export function findPack(packId: string): PackManifest | undefined {
	return listPacks().find((pack) => pack.id === packId);
}

export async function loadUnit(packId: string, unitId: string): Promise<Unit | undefined> {
	return unitLoaders[`../../../packs/${packId}/units/${unitId}.json`]?.();
}

/** A pack's units, in the order its manifest teaches them. */
export async function loadUnits(pack: PackManifest): Promise<Unit[]> {
	const units = await Promise.all(pack.units.map((id) => loadUnit(pack.id, id)));
	return units.filter((unit) => unit !== undefined);
}
