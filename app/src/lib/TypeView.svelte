<script lang="ts">
	// Produce each answer instead of choosing it. The board stays on screen and one cell
	// is active at a time. One attempt per cell, as in the tray: a wrong answer shows the
	// right one. packages/quiz-engine decides what an answer means.
	import {
		sentenceParts,
		shownText,
		type Header,
		type LocalCell,
		type LocalUnit,
		type PackManifest
	} from '@langclick/pack-format';
	import {
		attemptTyped,
		createQuizSession,
		isSessionComplete,
		pendingIds,
		scoreSession,
		type QuizSession
	} from '@langclick/quiz-engine';
	import { onMount, tick, untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import Board from './Board.svelte';
	import CellFace from './CellFace.svelte';
	import CellNote from './CellNote.svelte';
	import { refillHand } from './difficulty';
	import { t } from './language.svelte';
	import { recordAnswer, unitKnown } from './progress.svelte';
	import { forgetRound, rememberRound, roundInProgress, type RoundInProgress } from './quizRound';

	interface Props {
		pack: PackManifest;
		unit: LocalUnit;
		/** Review: ask only these items, and keep the rest of the board visible. */
		only?: ReadonlySet<string>;
		/** Review: what follows this board, in place of playing it again. */
		next?: { label: string; action: () => void };
	}

	let { pack, unit, only, next }: Props = $props();

	const roundId = untrack(() => `${unit.id}#type`);

	function newRound(): RoundInProgress {
		const asked = only ? unit.cells.filter((cell) => only.has(cell.item)) : unit.cells;
		const session = createQuizSession(asked.map((cell) => ({ id: cell.id, text: cell.text })));
		// The hand is the order of asking: shuffled, so a table isn't just read off.
		return { session, size: asked.length, hand: refillHand(pendingIds(session), [], asked.length) };
	}

	// A review is one sitting, and isn't a round to come back to.
	const start = untrack(() => {
		const saved = only ? undefined : roundInProgress(pack.id, roundId);
		return saved ?? newRound();
	});

	let session = $state.raw<QuizSession>(start.session);
	let order = $state.raw<string[]>(start.hand);
	let typed = $state('');
	let chosen = $state<string>();
	let lastNote = $state<{ cell: LocalCell; lead?: string }>();
	let keyboardOpen = $state(false);
	let input = $state<HTMLInputElement>();

	const complete = $derived(isSessionComplete(session));
	const score = $derived(scoreSession(session));
	const cellById = $derived(new Map(unit.cells.map((cell) => [cell.id, cell])));
	const statusById = $derived(new Map(session.items.map((item) => [item.cell.id, item.status])));
	const pending = $derived(new Set(pendingIds(session)));
	const activeId = $derived(
		chosen && pending.has(chosen) ? chosen : order.find((id) => pending.has(id))
	);
	const active = $derived(activeId ? cellById.get(activeId) : undefined);
	const parts = $derived(active?.sentence ? sentenceParts(active.sentence) : undefined);

	function labelOf(headers: Header[], id: string | undefined): string {
		return headers.find((header) => header.id === id)?.label.replaceAll('\u00AD', '') ?? '';
	}

	/** What a table's cell asks for: its row and its column. */
	const place = $derived.by(() => {
		if (unit.layout.type !== 'table' || !active) return '';
		const { rows, columns } = unit.layout;
		return `${labelOf(rows, active.row)}, ${labelOf(columns, active.col)}`;
	});

	function isShown(cell: LocalCell): boolean {
		const status = statusById.get(cell.id);
		return status === undefined || status !== 'pending';
	}

	function cellClass(cell: LocalCell): string {
		const status = statusById.get(cell.id);
		if (status === undefined) return 'given';
		if (status === 'correct') return 'correct';
		if (status === 'revealed') return 'revealed';
		return cell.id === activeId ? 'empty target pickable' : 'empty pickable';
	}

	async function focusActive() {
		await tick();
		input?.focus();
		document
			.querySelector(`[data-cell-id="${CSS.escape(activeId ?? '')}"]`)
			?.scrollIntoView({ block: 'nearest' });
	}

	onMount(focusActive);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		// `active` moves on as soon as the session changes, so hold on to this cell.
		const cell = active;
		if (!cell) return;
		const answer = typed.trim();
		const result = attemptTyped(session, cell.id, answer, {
			also: cell.alsoAccepted,
			marks: pack.displayMarks
		});
		if (result.outcome.kind === 'ignored') return;

		session = result.session;
		chosen = undefined;
		if (result.outcome.kind === 'correct') {
			void recordAnswer(pack.id, cell, 'good', 'produce');
			lastNote = result.outcome.other ? { cell, lead: t('type.alsoRight') } : undefined;
		} else {
			void recordAnswer(pack.id, cell, 'again', 'produce');
			lastNote = { cell, lead: t('type.wrong', { typed: answer }) };
		}
		typed = '';

		if (!only) {
			if (isSessionComplete(session)) forgetRound(pack.id, roundId);
			else rememberRound(pack.id, roundId, { session, hand: order, size: order.length });
		}
		void focusActive();
	}

	function playAgain() {
		const round = newRound();
		session = round.session;
		order = round.hand;
		chosen = undefined;
		lastNote = undefined;
		typed = '';
		void focusActive();
	}

	/** Types at the caret, and leaves the focus in the input. */
	function press(key: string) {
		const el = input;
		if (!el) return;
		const from = el.selectionStart ?? typed.length;
		const to = el.selectionEnd ?? typed.length;
		typed =
			key === 'backspace'
				? typed.slice(0, from === to ? Math.max(0, from - 1) : from) + typed.slice(to)
				: typed.slice(0, from) + key + typed.slice(to);
		const caret =
			key === 'backspace' ? (from === to ? Math.max(0, from - 1) : from) : from + key.length;
		void tick().then(() => {
			el.focus();
			el.setSelectionRange(caret, caret);
		});
	}
</script>

<p>{unit.summary}</p>

<Board
	{unit}
	spoken={(cell) => (isShown(cell) ? shownText(cell) : t('cell.open'))}
	classOf={cellClass}
	onpick={(cell) => {
		if (pending.has(cell.id)) {
			chosen = cell.id;
			void focusActive();
		}
	}}
>
	{#snippet face(cell)}
		<CellFace {cell} lang={pack.language} showAnswer={isShown(cell)} />
	{/snippet}
</Board>

{#if lastNote}
	<CellNote cell={lastNote.cell} lang={pack.language} lead={lastNote.lead} />
{/if}

{#if complete}
	<section class="score" aria-live="polite">
		<h2>{t('quiz.complete')}</h2>
		<p>
			{t('quiz.rightFirst', { right: score.perfect, total: score.total })}
			{t('type.typedNow', { known: unitKnown(pack.id, unit, 'produce'), total: unit.cells.length })}
		</p>
		<div class="actions">
			{#if next}
				<button type="button" class="action" onclick={next.action}>{next.label}</button>
			{:else}
				<button type="button" class="action" onclick={playAgain}>{t('quiz.again')}</button>
				<a
					class="action quiet"
					href={resolve('/unit/[pack]/[unit]', { pack: pack.id, unit: unit.id })}
					>{t('quiz.seeKnown')}</a
				>
			{/if}
		</div>
	</section>
{:else if active}
	<form class="answer-bar" onsubmit={submit}>
		<p class="prompt">
			{#if parts}
				<span lang={pack.language}>{parts[0]}<span class="gap"></span>{parts[1]}</span>
				{#if active.sentenceGloss}<small>{active.sentenceGloss}</small>{/if}
			{:else if place}
				{place}
			{:else}
				<span lang={pack.language}>{active.clue}</span>
			{/if}
		</p>
		<div class="row">
			<input
				bind:this={input}
				bind:value={typed}
				aria-label={t('type.answer')}
				lang={pack.language}
				autocomplete="off"
				autocapitalize="off"
				spellcheck="false"
				data-typed
			/>
			<button type="submit" class="action">{t('type.check')}</button>
			{#if pack.keyboard}
				<button
					type="button"
					class="keyboard-toggle"
					aria-pressed={keyboardOpen}
					onclick={() => (keyboardOpen = !keyboardOpen)}>{t('type.keyboard')}</button
				>
			{/if}
		</div>
		{#if keyboardOpen && pack.keyboard}
			<div class="keyboard" role="group" aria-label={t('type.keyboard')} lang={pack.language}>
				{#each pack.keyboard as keys (keys)}
					<div class="keys">
						{#each [...keys] as key (key)}
							<button
								type="button"
								onpointerdown={(event) => event.preventDefault()}
								onclick={() => press(key)}>{key}</button
							>
						{/each}
					</div>
				{/each}
				<div class="keys">
					<button
						type="button"
						aria-label={t('type.backspace')}
						onpointerdown={(event) => event.preventDefault()}
						onclick={() => press('backspace')}>⌫</button
					>
				</div>
			</div>
		{/if}
	</form>
	<p class="hint">{t('type.hint', { count: pending.size })}</p>
{/if}

<style>
	p {
		margin: 0 0 0.75rem;
	}

	.answer-bar {
		position: sticky;
		bottom: 0;
		margin-top: 0.75rem;
		padding: 0.6rem;
		border-top: 1px solid var(--line);
		background: var(--paper);
	}

	.prompt {
		margin: 0 0 0.4rem;
		text-align: center;
		font-weight: 600;
	}

	.prompt small {
		display: block;
		font-weight: 400;
		color: var(--muted);
	}

	.gap {
		display: inline-block;
		width: 4.5em;
		border-bottom: 2px solid var(--muted);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
	}

	input {
		flex: 1 1 10rem;
		max-width: 22rem;
		min-width: 0;
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--accent);
		border-radius: 0.4rem;
		background: var(--card);
		color: inherit;
		font: inherit;
		font-size: 1.1rem;
	}

	.keyboard-toggle {
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--line);
		border-radius: 0.4rem;
		background: var(--card);
		color: var(--muted);
		cursor: pointer;
	}

	/* A phone has its own keyboard. */
	@media (pointer: coarse) {
		.keyboard-toggle {
			display: none;
		}
	}

	.keyboard {
		margin-top: 0.5rem;
	}

	.keys {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.2rem;
		margin-bottom: 0.2rem;
	}

	.keys button {
		min-width: 2.1rem;
		padding: 0.35rem 0.3rem;
		border: 1px solid var(--line);
		border-radius: 0.3rem;
		background: var(--card);
		color: inherit;
		font-size: 1rem;
		cursor: pointer;
	}

	.hint {
		margin: 0.25rem 0 0;
		text-align: center;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.score h2 {
		margin: 1rem 0 0.25rem;
		font-size: 1.1rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
