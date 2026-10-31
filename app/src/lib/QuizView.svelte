<script lang="ts">
	// Fill the board: drag a slip onto its cell, or press the slip and then the cell.
	// One attempt per slip per round. A wrong answer loses a level and shows the
	// right one. packages/quiz-engine decides what a drop means; this owns the
	// pointer, the tray and when to draw.
	import { shownText, type Cell, type PackManifest, type Unit } from '@langclick/pack-format';
	import {
		attemptMatch,
		createQuizSession,
		isSessionComplete,
		pendingIds,
		scoreSession,
		type QuizSession
	} from '@langclick/quiz-engine';
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import Board from './Board.svelte';
	import CellFace from './CellFace.svelte';
	import CellNote from './CellNote.svelte';
	import { handAfterUse, handSize, refillHand, unitLevel } from './difficulty';
	import { recordAnswer, unitKnown, unitLevels } from './progress.svelte';
	import { forgetRound, rememberRound, roundInProgress, type RoundInProgress } from './quizRound';
	import { aimPoint, movedPastSlop } from './touchDrag';

	interface Props {
		pack: PackManifest;
		unit: Unit;
	}

	let { pack, unit }: Props = $props();

	const WRONG_FLASH_MS = 900;

	function newRound(): RoundInProgress {
		const session = createQuizSession(unit.cells);
		const size = handSize(unitLevel(unitLevels(pack.id, unit)));
		return { session, size, hand: refillHand(pendingIds(session), [], size) };
	}

	const start = untrack(() => roundInProgress(pack.id, unit.id) ?? newRound());

	let session = $state.raw<QuizSession>(start.session);
	let hand = $state.raw<string[]>(start.hand);
	let size = $state(start.size);
	let selected = $state<string>();
	let lastMiss = $state<{ cell: Cell; lead: string }>();
	let wrongCell = $state<string>();
	let wrongTimer: ReturnType<typeof setTimeout> | undefined;

	interface Press {
		slipId: string;
		x0: number;
		y0: number;
		touch: boolean;
		dragging: boolean;
		x: number;
		y: number;
	}
	let press = $state<Press>();
	let hoverCell = $state<string>();

	const complete = $derived(isSessionComplete(session));
	const score = $derived(scoreSession(session));
	const cellById = $derived(new Map(unit.cells.map((cell) => [cell.id, cell])));
	const statusById = $derived(new Map(session.items.map((item) => [item.cell.id, item.status])));

	function textOf(id: string): string {
		return cellById.get(id)?.text ?? '';
	}

	/** One drop. Everything a slip does, by pointer or keyboard, comes through here. */
	function drop(slipId: string, cellId: string | undefined) {
		const result = attemptMatch(session, slipId, cellId);
		if (result.outcome.kind === 'ignored') return;

		session = result.session;
		hand = refillHand(pendingIds(session), handAfterUse(hand, slipId, result.outcome.cellId), size);
		selected = undefined;

		const answered = cellById.get(result.outcome.cellId);
		if (result.outcome.kind === 'correct') {
			lastMiss = undefined;
			if (answered) void recordAnswer(pack.id, answered, 'good');
		} else {
			if (answered) {
				void recordAnswer(pack.id, answered, 'again');
				lastMiss = { cell: answered, lead: 'Not there. It goes here:' };
			}
			flashWrong(result.outcome.droppedOnId);
		}

		if (isSessionComplete(session)) forgetRound(pack.id, unit.id);
		else rememberRound(pack.id, unit.id, { session, hand, size });
	}

	function flashWrong(cellId: string) {
		wrongCell = cellId;
		clearTimeout(wrongTimer);
		wrongTimer = setTimeout(() => (wrongCell = undefined), WRONG_FLASH_MS);
	}

	function playAgain() {
		const round = newRound();
		session = round.session;
		hand = round.hand;
		size = round.size;
		selected = undefined;
		lastMiss = undefined;
		wrongCell = undefined;
	}

	function cellAt(x: number, y: number): string | undefined {
		const element = document.elementFromPoint(x, y);
		return element?.closest<HTMLElement>('[data-cell-id]')?.dataset.cellId;
	}

	function onSlipPointerDown(event: PointerEvent, slipId: string) {
		if (event.button !== 0) return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		press = {
			slipId,
			x0: event.clientX,
			y0: event.clientY,
			touch: event.pointerType !== 'mouse',
			dragging: false,
			x: event.clientX,
			y: event.clientY
		};
	}

	function onSlipPointerMove(event: PointerEvent) {
		if (!press) return;
		press.x = event.clientX;
		press.y = event.clientY;
		if (!press.dragging && movedPastSlop(press.x0, press.y0, press.x, press.y)) {
			press.dragging = true;
			selected = undefined;
		}
		if (press.dragging) {
			const aim = aimPoint(press.x, press.y, press.touch);
			hoverCell = cellAt(aim.x, aim.y);
		}
	}

	function onSlipPointerUp() {
		if (!press) return;
		if (press.dragging) {
			const aim = aimPoint(press.x, press.y, press.touch);
			drop(press.slipId, cellAt(aim.x, aim.y));
		} else {
			toggleSelected(press.slipId);
		}
		press = undefined;
		hoverCell = undefined;
	}

	function onSlipPointerCancel() {
		press = undefined;
		hoverCell = undefined;
	}

	function toggleSelected(slipId: string) {
		selected = selected === slipId ? undefined : slipId;
	}

	/** A press with a pointer is handled on pointerup; `detail` is 0 only for a
	 * click from the keyboard, which has no pointer events. */
	function onSlipClick(event: MouseEvent, slipId: string) {
		if (event.detail === 0) toggleSelected(slipId);
	}

	function cellClass(cell: Cell): string {
		const status = statusById.get(cell.id);
		if (cell.id === wrongCell) return 'wrong empty';
		if (status === 'correct') return 'correct';
		if (status === 'revealed') return 'revealed';
		if (cell.id === hoverCell) return 'target';
		return selected || press?.dragging ? 'empty pickable' : 'empty';
	}

	function isShown(cell: Cell): boolean {
		return statusById.get(cell.id) !== 'pending';
	}

	const ghost = $derived.by(() => {
		if (!press?.dragging) return undefined;
		return { text: textOf(press.slipId), ...aimPoint(press.x, press.y, press.touch) };
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') selected = undefined;
	}}
/>

<Board
	{unit}
	spoken={(cell) => (isShown(cell) ? shownText(cell) : 'open')}
	classOf={cellClass}
	onpick={(cell) => {
		if (selected) drop(selected, cell.id);
	}}
>
	{#snippet face(cell)}
		<CellFace {cell} lang={pack.language} showAnswer={isShown(cell)} />
	{/snippet}
</Board>

{#if lastMiss}
	<CellNote cell={lastMiss.cell} lang={pack.language} lead={lastMiss.lead} />
{/if}

{#if complete}
	<section class="score" aria-live="polite">
		<h2>Round complete</h2>
		<p>
			Right first time: <strong>{score.perfect} of {score.total}</strong>. Known now:
			<strong>{unitKnown(pack.id, unit)} of {unit.cells.length}</strong>.
		</p>
		<div class="actions">
			<button type="button" class="action" onclick={playAgain}>Play again</button>
			<a
				class="action quiet"
				href={resolve('/unit/[pack]/[unit]', { pack: pack.id, unit: unit.id })}>See what you know</a
			>
		</div>
	</section>
{:else}
	<div class="tray" role="group" aria-label="Slips to place">
		{#each hand as slipId (slipId)}
			<button
				type="button"
				class="slip"
				class:selected={selected === slipId}
				class:lifted={press?.slipId === slipId && press.dragging}
				data-slip-id={slipId}
				lang={pack.language}
				aria-pressed={selected === slipId}
				onpointerdown={(event) => onSlipPointerDown(event, slipId)}
				onpointermove={onSlipPointerMove}
				onpointerup={onSlipPointerUp}
				onpointercancel={onSlipPointerCancel}
				onclick={(event) => onSlipClick(event, slipId)}>{textOf(slipId)}</button
			>
		{/each}
	</div>
	<p class="hint">
		Drag a slip onto its cell, or press the slip and then the cell.
		{pendingIds(session).length} left.
	</p>
{/if}

{#if ghost}
	<div class="ghost" lang={pack.language} style:left="{ghost.x}px" style:top="{ghost.y}px">
		{ghost.text}
	</div>
{/if}

<style>
	.tray {
		position: sticky;
		bottom: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		margin-top: 0.75rem;
		padding: 0.6rem;
		border-top: 1px solid var(--line);
		background: var(--paper);
	}

	.slip {
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--accent);
		border-radius: 0.4rem;
		background: var(--card);
		font-size: 1.05rem;
		font-weight: 600;
		cursor: grab;
		/* The drag is ours: the browser must not take it for a scroll. */
		touch-action: none;
		user-select: none;
	}

	.slip.selected {
		background: var(--accent);
		color: #fff;
	}

	.slip.lifted {
		opacity: 0.35;
	}

	.hint {
		margin: 0.25rem 0 0;
		font-size: 0.85rem;
		color: var(--muted);
		text-align: center;
	}

	.ghost {
		position: fixed;
		z-index: 10;
		padding: 0.4rem 0.8rem;
		border-radius: 0.4rem;
		background: var(--accent);
		color: #fff;
		font-size: 1.05rem;
		font-weight: 600;
		/* Hit-testing must see the cell under the slip, not the slip. */
		pointer-events: none;
		transform: translate(-50%, -50%);
	}

	.score {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 0.4rem;
		background: var(--card);
	}

	.score p {
		margin: 0.5rem 0 0.75rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
