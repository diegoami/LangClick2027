# Langclick — Decisions

The *why* behind product and design choices. When a later decision supersedes an
earlier one, amend the entry.

## A board plays the part of the map (2026-10-31, #1)

Geoclick works because one screen shows everything to learn and fills in as you
earn it. A list of exercises would lose that. A grammar table already has the shape
of a map, so a unit is a table or grid of cells, and Geoclick's Overview, Known and
Quiz carry over. Whether this works is what v0.1.0's play-through is there to find
out.

## A cell accepts a slip by text, not by id (2026-10-31, #1)

Geoclick marks a drop correct when the slip's id equals the target's. On a grammar
table that would score a correct answer as a mistake, because one form can fill
several cells. Slips with equal text are therefore interchangeable.

## A slip dropped off the board, or on a filled cell, is not an answer (2026-10-31)

Geoclick counts a drop outside any region as a miss. A board has gaps, and a filled
cell already shows its answer, so here those drops are slips of the hand: the slip
goes back to the tray and nothing is lost.

## Copy from Geoclick; don't fork it or share a package (2026-10-31, #1)

About half of Geoclick's app code is bound to the map, so a fork would mostly mean
deleting. A shared package would be premature for one owner with two apps. Copied
files name their origin commit (9b449cc). A fix in one doesn't reach the other by
itself.

## Language rules live in the pack (2026-10-31, #1)

The stress mark and the letters Ukrainian must not contain are fields in its
manifest, not code, and a test keeps engine code free of any language. That is what
lets the Swedish pack in v0.5.0 test whether packs are really pluggable.

## `display` is shown, `text` is compared (2026-10-31, #1)

Ukrainian stress moves and isn't normally written. A learner needs to see it, but a
slip or a typed answer shouldn't be wrong over it. Slips show `text`, so a stress
mark on a slip can't give anything away, and an answer shows `display` once it is
visible.

## Two recorded checks per item, tied to its text (2026-10-31, #1)

The owner is learning these languages and can't be the correctness check, and a
code reviewer won't catch a wrong form. Every item needs two independent AI checks,
kept in `packs/<id>/checks/`. A check stores the answer, clue and note it saw, so
editing any of them voids it, and a gate fails until it is checked again. For Ukrainian the
checks look specifically for Russian forms, a known risk with AI tools and some
sources, and the manifest's `forbiddenLetters` catches the crudest case. A paid
native review is optional. These checks are less than a native speaker's: two
Claude models, working separately from outside dictionaries, can share a blind spot.

## Comparing with and explaining in are separate settings (2026-10-31, #3)

What you compare with decides what is explained; what you explain in decides the
language it is written in. A learner may read English while comparing with Polish. In
a pack this is a base layer per language and an overlay per combination, so a learner
downloads only their own (#6), and the overlay only has to say what the comparison adds.

## False friends have kinds (2026-10-31, #3)

With Russian they are mostly same-script homographs; with Polish they cross the script
and only appear once transliterated. A learner should be told which it is, so the kind
is data, and the explanation of it comes from the interface.

## A clue may equal the answer in another language (2026-10-31, #3)

"брат" is the right Russian gloss for брат, and rejecting it would mean inventing a
worse one. Such a tile is easy for that reader, which is true of the language: cognates
are easy. Only a clue in the pack's own language gives the answer away by containing it.

## Review shows the board, not a list (2026-10-31, #3)

Repetition could have been a stream of single questions. It stays on the board, with the
due cells open and the rest visible, because a form is remembered by its place in the
table. The queue is fixed when a review starts, so an answer missed today waits for the
next review rather than keeping the board open.

## Checkers fill in verdicts and copy nothing (2026-10-31, #3)

Four languages and six overlays are too much to copy by hand without error, so
`scripts/pack-check.mjs` writes each checker's record with the exact content, and a
verdict is void as soon as that content changes.

## Code is MIT, packs are CC BY-SA 4.0 (2026-10-31, #1, #6)

Natural Earth was public domain, but language data mostly isn't. Share-alike
sources such as Wiktionary and JMdict can't be used in a more restrictive pack, so
packs take that licence from the start. Audio licences vary by contributor and have
to be checked separately when audio arrives. The code is MIT, the simplest licence
that lets anyone build on it.

## Letters are asked for by sound, with the example word held back (2026-10-31, #3)

There is no audio yet, so an alphabet tile gives the sound in IPA with the nearest
English comparison. The first version used comparisons alone, and "г: h, as in hat"
was wrong: Vakulenko (2025) finds English h closer to х. Both content checks passed
it, so checkers are now given phonetic sources to test against. The example word is
a `note`, shown only with the answer, because a word written in the alphabet being
learned would give the letter away.

## Langclick supplements its source material (2026-10-31, #3)

eMova teaches, and has graded tests, but offers no item-by-item tracking or scheduled
repetition. Langclick adds those: study the source first, then exercises, then
repetition. It links to eMova and doesn't copy its text, which has no open licence.

## One path, with different explanations (2026-10-31, #3)

A Russian and a Polish speaker need different explanations, including different
kinds of false friends, but they are learning the same language. So there is one
course and one record of progress, and the comparison changes what is explained.
Comparing with and explaining in are separate settings, since a learner may read
English while comparing with Polish.
