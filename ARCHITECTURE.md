# Langclick — Architecture

A client-only web app, in the shape of
[Geoclick2027](https://github.com/diegoami/Geoclick2027): one web core, with
Tauri and Capacitor shells to come in v0.6.0. No backend and no accounts; progress
stays on the device.

## Layout

| Path                   | What it is                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `packs/<id>/`          | Authored content: a manifest, units, layers and content checks. See `packs/README.md`                            |
| `locales/`             | Interface text, one file per language, outside the engine                                                        |
| `packages/pack-format` | The pack types, the validator, the merging of layers into what a learner sees, and the content-check rules. Pure |
| `packages/quiz-engine` | What a drop means: a round's cells, their status, the score. Pure                                                |
| `packages/srs`         | The scheduler, copied unchanged from Geoclick: an earned level and a due date per card. Pure                     |
| `app/src/lib`          | The screens and their state                                                                                      |
| `app/src/routes`       | Home, `/lesson/[pack]/[lesson]`, `/review/[pack]`, and `/unit/[pack]/[unit]` with `overview` and `quiz`          |

## How a learner moves through it

Study, then exercises, then repetition. A lesson page (`routes/lesson`) links to what
to study and lets you mark it studied, which locks nothing. The boards come next.
`ReviewView` then deals what is due across every started unit, one board at a time,
using `QuizView`'s `only`: the due cells are asked and the rest stay visible.

## Languages

Two independent choices, in `language.svelte.ts`: what to compare with, and what to
explain in. Interface text comes from `locales/`. Pack text comes in layers:

- A **unit** holds what is true in every language: answers, IPA, cognates.
- A **base layer** (`layers/<language>/`) holds titles, labels, clues and notes.
- An **overlay** (`layers/<compare>-<language>/`) holds what that comparison adds.

`localizeUnit` merges the three into the `LocalUnit` every screen draws, so no screen
knows about layers. Everything is read through `PackSource` in `packs.ts`. Today that
is the local `packs/` folder; v0.4.0 puts downloads behind the same interface (#6).

## How a unit plays

`Board.svelte` draws a unit's `layout` as a table, a grid or a list of sentences, and each cell carries
`data-cell-id`. It knows nothing about what a cell shows; three screens fill that
in through a snippet:

- `OverviewView` shows every answer, and the unit's sources.
- `KnownView` shows only what `progress.svelte.ts` says has been earned, more
  strongly at each level.
- `QuizView` shows answers as they resolve, and owns the tray and the pointer. The
  tray groups identical slips with a count. A unit with `compareDisplay` compares the
  marked form, and one with `dealAll` always offers every slip.

**A round.** `createQuizSession` makes one item per cell, and the hand holds slips
named by the id of the cell they were dealt for. Every drop goes through
`attemptMatch`, which compares **text, not ids**, because one form can fill several
cells. `handAfterUse` keeps the tray honest when a slip fills another slip's cell.
Dropping off the board or on a filled cell is ignored. A wrong drop reveals the
slip's own cell and lowers its level; there is one attempt per slip per round. A
round in progress lives in `quizRound.ts`, in memory only, so a trip to the
Overview keeps it and a reload starts fresh.

**Progress.** Each answer goes through `rate` from `packages/srs` and is saved at
once by `progressRepository.ts`, keyed by pack, item and skill. Only `recognise` is
written so far. A round covers the whole unit, and Review reads the saved due dates.

**The hand.** `difficulty.ts` holds its size: ten slips, however well the unit is known,
because new material is what moves a learner forward. A `dealAll` unit offers them all.

## What keeps it honest

- `packs.test.ts` runs the validator and the recorded content checks over every
  pack in `packs/`, so a new pack is covered by being there. It also checks that every
  choice of languages leaves no tile without a clue.
- `locales.test.ts` keeps the interface languages in step: same keys, same placeholders.
- `engineNeutral.test.ts` fails if engine code names a language or contains another
  script's text.
- `QuizView.svelte.test.ts` plays rounds in real Chromium against real pack data.
