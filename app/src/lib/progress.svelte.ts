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

type ItemRef = Pick<Cell, 'item'>;

const cardKey = (itemId: string, skill: Skill) => `${skill}:${itemId}`;

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
		cards.map((card) => [cardKey(card.itemId, card.skill), card])
	);
	studiedByPack[packId] = studied;
}

/** The earned level of one item, 0 if it has never been answered. */
export function levelOf(packId: string, cell: ItemRef, skill: Skill = 'recognise'): number {
	return cardsByPack[packId]?.[cardKey(cell.item, skill)]?.cleanStreak ?? 0;
}

export function unitLevels(packId: string, unit: LocalUnit, skill: Skill = 'recognise'): number[] {
	return unit.cells.map((cell) => levelOf(packId, cell, skill));
}

export function unitKnown(packId: string, unit: LocalUnit, skill: Skill = 'recognise'): number {
	return knownCount(unitLevels(packId, unit, skill));
}

/** Whether the player has answered anything in this unit yet. */
export function unitStarted(packId: string, unit: LocalUnit): boolean {
	return unit.cells.some((cell) => cardsByPack[packId]?.[cardKey(cell.item, 'recognise')]);
}

/** What is due for review in this unit. An item never answered isn't due: it's new,
 * and belongs to the quiz. */
export function dueCells(
	packId: string,
	unit: LocalUnit,
	today = todayLocalDate(),
	skill: Skill = 'recognise'
) {
	return unit.cells.filter((cell) => {
		const card = cardsByPack[packId]?.[cardKey(cell.item, skill)];
		return card !== undefined && isDue(card, today);
	});
}

/** How much is due in this unit, in every skill. */
export function dueCount(packId: string, unit: LocalUnit, today = todayLocalDate()): number {
	return (
		dueCells(packId, unit, today, 'recognise').length +
		dueCells(packId, unit, today, 'produce').length
	);
}

/** Records one answer, in memory at once and then on disk. */
export async function recordAnswer(
	packId: string,
	cell: ItemRef,
	grade: Grade,
	skill: Skill = 'recognise'
): Promise<void> {
	const key = cardKey(cell.item, skill);
	const previous = cardsByPack[packId]?.[key];
	const card: Card = {
		...rate(previous, grade, todayLocalDate()),
		itemId: cell.item,
		skill
	};
	cardsByPack[packId] = { ...cardsByPack[packId], [key]: card };
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
