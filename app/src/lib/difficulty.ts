// How hard a unit plays, from how well it is known. Copied from Geoclick2027
// (9b449cc), with its map vocabulary changed.
//
// The tray holds a *hand*: a few slips at a time, refilled as they are placed.
// Laying out every slip would let the last few be worked out by elimination, and
// a unit you know well would play exactly like the first time. The better the
// unit is known, the smaller the hand, until each slip has to be placed on its
// own merits.
//
// Pure: no DOM, no storage, no Svelte. QuizView owns when to draw.

import { KNOWN_CLEAN_STREAK } from '@langclick/srs';

/** 0 = new unit, 3 = known unit. */
export type Level = 0 | 1 | 2 | 3;

/** The share of a unit's items that must be known to reach each level. */
export const LEVEL_SHARES = [0, 0.25, 0.6, 0.85] as const;

/** How many slips the tray offers at each level. Geoclick's curve, whose maps
 * average 34 targets; its fit to smaller units is what v0.1.0's play-through is
 * there to find out. */
export const HAND_SIZES = [10, 6, 3, 1] as const;

export { KNOWN_CLEAN_STREAK };

/** How many of these earned levels count as known. */
export function knownCount(levels: readonly number[]): number {
	return levels.filter((level) => level >= KNOWN_CLEAN_STREAK).length;
}

/** The unit's level, from one earned level per cell. An empty unit is level 0. */
export function unitLevel(levels: readonly number[]): Level {
	if (levels.length === 0) return 0;
	const share = knownCount(levels) / levels.length;
	let level: Level = 0;
	for (let i = 1; i < LEVEL_SHARES.length; i++) {
		if (share >= LEVEL_SHARES[i]) level = i as Level;
	}
	return level;
}

/** How many slips the tray offers at that level. */
export function handSize(level: Level): number {
	return HAND_SIZES[level];
}

/**
 * The hand after a slip was used, before it is refilled. Slips with equal text
 * are interchangeable, so the slip dropped may have filled another slip's cell.
 * If that other slip is in the hand, it is the one that leaves: its cell is gone,
 * and the two looked the same. Otherwise the slip that was dropped leaves.
 */
export function handAfterUse(hand: readonly string[], slipId: string, cellId: string): string[] {
	const leaving = hand.includes(cellId) ? cellId : slipId;
	return hand.filter((id) => id !== leaving);
}

/**
 * The slips on offer after a drop: whatever is still pending and was already on
 * offer, topped back up to `size` with a random pick of the rest. Keeping the
 * survivors means a slip the player has been staring at doesn't vanish
 * mid-thought.
 */
export function refillHand(
	pendingIds: readonly string[],
	hand: readonly string[],
	size: number,
	random: () => number = Math.random
): string[] {
	const pending = new Set(pendingIds);
	const kept = [...new Set(hand)].filter((id) => pending.has(id));
	if (kept.length >= size) return kept.slice(0, size);
	const pool = pendingIds.filter((id) => !kept.includes(id));
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return [...kept, ...pool.slice(0, size - kept.length)];
}
