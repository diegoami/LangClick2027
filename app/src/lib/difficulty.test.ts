import { describe, expect, it } from 'vitest';
import { handAfterUse, handSize, knownCount, refillHand, unitLevel } from './difficulty';

describe('unitLevel', () => {
	it('is 0 for an empty or a new unit', () => {
		expect(unitLevel([])).toBe(0);
		expect(unitLevel([0, 1, 2, 0])).toBe(0);
	});

	it('follows the share of items known', () => {
		expect(unitLevel([3, 0, 0, 0])).toBe(1);
		expect(unitLevel([3, 3, 3, 0, 0])).toBe(2);
		expect(unitLevel([3, 3, 3, 3, 3, 3, 0])).toBe(3);
	});
});

describe('handSize', () => {
	it('shrinks as the unit is known', () => {
		expect([0, 1, 2, 3].map((level) => handSize(level as 0 | 1 | 2 | 3))).toEqual([10, 6, 3, 1]);
	});
});

describe('knownCount', () => {
	it('counts level 3 and above', () => {
		expect(knownCount([0, 2, 3, 4])).toBe(2);
	});
});

describe('handAfterUse', () => {
	it('removes the slip that filled its own cell', () => {
		expect(handAfterUse(['a', 'b'], 'a', 'a')).toEqual(['b']);
	});

	it('removes the slip for the filled cell when both are in the hand', () => {
		expect(handAfterUse(['a', 'b', 'c'], 'a', 'b')).toEqual(['a', 'c']);
	});

	it('removes the dropped slip when the filled cell has no slip in the hand', () => {
		expect(handAfterUse(['a', 'c'], 'a', 'b')).toEqual(['c']);
	});
});

describe('refillHand', () => {
	it('keeps pending slips and tops up from the rest', () => {
		const hand = refillHand(['a', 'b', 'c', 'd'], ['b'], 3, () => 0);
		expect(hand[0]).toBe('b');
		expect(hand).toHaveLength(3);
		expect(new Set(hand).size).toBe(3);
	});

	it('drops slips that are no longer pending', () => {
		expect(refillHand(['a'], ['a', 'b'], 2)).toEqual(['a']);
	});

	it('never exceeds the size', () => {
		expect(refillHand(['a', 'b', 'c'], ['a', 'b', 'c'], 2)).toEqual(['a', 'b']);
	});
});
