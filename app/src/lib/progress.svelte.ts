// The player's earned levels, kept reactive so every screen follows a quiz answer
// without reloading. The repository is the durable copy; this is its mirror.

import { rate, type Grade } from '@langclick/srs';
import type { Cell, Unit } from '@langclick/pack-format';
import { knownCount } from './difficulty';
import {
	LocalStorageProgressRepository,
	todayLocalDate,
	type Card,
	type ProgressRepository,
	type Skill
} from './progressRepository';

const SKILL: Skill = 'recognise';

let repository: ProgressRepository = new LocalStorageProgressRepository();
let cardsByPack = $state<Record<string, Record<string, Card>>>({});

/** Reads a pack's saved cards. Screens await this in their route's load. */
export async function loadProgress(packId: string): Promise<void> {
	if (cardsByPack[packId]) return;
	const cards = await repository.getCards(packId);
	cardsByPack[packId] = Object.fromEntries(
		cards.filter((card) => card.skill === SKILL).map((card) => [card.itemId, card])
	);
}

/** The earned level of one item, 0 if it has never been answered. */
export function levelOf(packId: string, cell: Cell): number {
	return cardsByPack[packId]?.[cell.item]?.cleanStreak ?? 0;
}

export function unitLevels(packId: string, unit: Unit): number[] {
	return unit.cells.map((cell) => levelOf(packId, cell));
}

export function unitKnown(packId: string, unit: Unit): number {
	return knownCount(unitLevels(packId, unit));
}

/** Whether the player has answered anything in this unit yet. */
export function unitStarted(packId: string, unit: Unit): boolean {
	return unit.cells.some((cell) => cardsByPack[packId]?.[cell.item] !== undefined);
}

/** Records one answer, in memory at once and then on disk. */
export async function recordAnswer(packId: string, cell: Cell, grade: Grade): Promise<void> {
	const previous = cardsByPack[packId]?.[cell.item];
	const card: Card = {
		...rate(previous, grade, todayLocalDate()),
		itemId: cell.item,
		skill: SKILL
	};
	cardsByPack[packId] = { ...cardsByPack[packId], [cell.item]: card };
	await repository.saveCard(packId, card);
}

/** Tests only: forget the mirror, as a reload would. */
export function resetProgressMirror(next?: ProgressRepository): void {
	cardsByPack = {};
	if (next) repository = next;
}
