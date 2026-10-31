// The player's earned levels and studied lessons, kept reactive so every screen
// follows an answer without reloading. The repository is the durable copy; this is
// its mirror.

import { isDue, rate, type Grade } from '@langclick/srs';
import type { Cell, LocalUnit } from '@langclick/pack-format';
import { knownCount } from './difficulty';
import {
	LocalStorageProgressRepository,
	todayLocalDate,
	type Card,
	type ProgressRepository,
	type Skill
} from './progressRepository';

const SKILL: Skill = 'recognise';

type ItemRef = Pick<Cell, 'item'>;

let repository: ProgressRepository = new LocalStorageProgressRepository();
let cardsByPack = $state<Record<string, Record<string, Card>>>({});
let studiedByPack = $state<Record<string, string[]>>({});

/** Reads a pack's saved progress. Screens await this in their route's load. */
export async function loadProgress(packId: string): Promise<void> {
	if (cardsByPack[packId]) return;
	const [cards, studied] = await Promise.all([
		repository.getCards(packId),
		repository.getStudied(packId)
	]);
	cardsByPack[packId] = Object.fromEntries(
		cards.filter((card) => card.skill === SKILL).map((card) => [card.itemId, card])
	);
	studiedByPack[packId] = studied;
}

/** The earned level of one item, 0 if it has never been answered. */
export function levelOf(packId: string, cell: ItemRef): number {
	return cardsByPack[packId]?.[cell.item]?.cleanStreak ?? 0;
}

export function unitLevels(packId: string, unit: LocalUnit): number[] {
	return unit.cells.map((cell) => levelOf(packId, cell));
}

export function unitKnown(packId: string, unit: LocalUnit): number {
	return knownCount(unitLevels(packId, unit));
}

/** Whether the player has answered anything in this unit yet. */
export function unitStarted(packId: string, unit: LocalUnit): boolean {
	return unit.cells.some((cell) => cardsByPack[packId]?.[cell.item] !== undefined);
}

/** What is due for review in this unit. An item never answered isn't due: it's new,
 * and belongs to the quiz. */
export function dueCells(packId: string, unit: LocalUnit, today = todayLocalDate()) {
	return unit.cells.filter((cell) => {
		const card = cardsByPack[packId]?.[cell.item];
		return card !== undefined && isDue(card, today);
	});
}

/** Records one answer, in memory at once and then on disk. */
export async function recordAnswer(packId: string, cell: ItemRef, grade: Grade): Promise<void> {
	const previous = cardsByPack[packId]?.[cell.item];
	const card: Card = {
		...rate(previous, grade, todayLocalDate()),
		itemId: cell.item,
		skill: SKILL
	};
	cardsByPack[packId] = { ...cardsByPack[packId], [cell.item]: card };
	await repository.saveCard(packId, card);
}

export function isStudied(packId: string, lessonId: string): boolean {
	return studiedByPack[packId]?.includes(lessonId) ?? false;
}

export async function setStudied(
	packId: string,
	lessonId: string,
	studied: boolean
): Promise<void> {
	const others = (studiedByPack[packId] ?? []).filter((id) => id !== lessonId);
	const next = studied ? [...others, lessonId] : others;
	studiedByPack[packId] = next;
	await repository.saveStudied(packId, next);
}

/** Tests only: forget the mirror, as a reload would. */
export function resetProgressMirror(next?: ProgressRepository): void {
	cardsByPack = {};
	studiedByPack = {};
	if (next) repository = next;
}
