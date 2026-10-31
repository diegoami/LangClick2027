# Language packs

A pack is a folder here. Nothing else registers it: the app finds every
`packs/*/pack.json`. Everything is plain JSON, with no code and no HTML.

    packs/<id>/pack.json                       the manifest: versions, lessons, what's offered
    packs/<id>/units/<unit>.json               a board: what is true in every language
    packs/<id>/layers/<language>/              a base layer: text in that language
    packs/<id>/layers/<compare>-<language>/    an overlay: what that comparison adds
    packs/<id>/checks/<checker>.json           independent content checks

Each layer holds `course.json` (lesson titles, concepts) and `units/<unit>.json`
(a unit's title, labels, and per-cell text). A learner receives one base and one
overlay, and an overlay holds only what the comparison adds. The types are in
`packages/pack-format/src/index.ts`.

Rules about one language go in that pack's manifest (`forbiddenLetters`,
`displayMarks`, `scripts`), never in the engine.

## Lessons

`pack.json` lists the course in teaching order. A lesson has units, and `study`:
links to what to watch and read first. Langclick supplements these and doesn't copy
them, so link to the source and write exercises from facts. A study link or a unit
with `compareWith` is offered only for those comparisons.

## Boards

- A `table` has rows and columns and one cell at each crossing, except the crossings
  listed in `gaps`, as an IPA chart needs.
- A `grid` is tiles in order. `size` says how many there must be, and every cell
  needs a clue that fits only its own answer.

`text` is the answer as compared, and slips show it. `display` is the answer as
shown once visible, and may add only the marks the manifest declares. A cell accepts
a slip when their `text` is equal, so a form that fills two cells needs nothing
special.

A unit with `compareDisplay` is the exception, for when the marks are the point, as
with stress: за́мок and замо́к are different answers there, so slips show `display` and
it is what's compared.

A unit with `dealAll` always offers every slip. Use it when the answers only mean something
against each other: the forms of a declension, the two sides of a stress pair, a choice
between two letters. Other units deal ten slips at a time, so that a long unit doesn't crowd
the tray.

A unit with layout `sentences` tests use as well as recall: one wide row per cell, each a
`sentence` with one gap, written `___`. The words around the gap must fix the answer, so
no two sentences can be the same with different answers, and a sentence can't contain its
own answer. Every language of explanation except the pack's own gives a `sentenceGloss`.
Sentences are written for the pack, never copied from a course.

Lessons sit under the manifest's `sections`, and each section has a title in `course.json`.

Long column headers can carry soft hyphens (U+00AD) at syllable boundaries, and a
zero-width space after a slash, so that a chart wraps sensibly on a phone. Browsers don't
all hyphenate every language on their own.

`item` is what progress is kept against. Use the same `item` for the same thing in
another unit, and it shares its progress there. **Item ids are permanent.** Never
reuse one for something else, or learners' progress would attach to the wrong thing.

## What goes where

| Where       | What                                                                                     | Example                                |
| ----------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| Unit        | Facts in every language: answer, IPA, example word, cognates, concept ids                | `"ipa": "/ɔˈnuk/"`                     |
| Unit `clue` | A clue that needs no translation                                                         | `"clue": "/ɦ/"`                        |
| Base layer  | Titles, labels, translated clues, general notes, concepts                                | `"clue": "grandson"`                   |
| Overlay     | What this comparison adds: `contrast`, `falseFriend`, a concept reworded for this reader | `"contrast": "Like Russian э, not е."` |

**Explanations are written for their reader, not translated from one master text.**
A Russian speaker is told what to unlearn. A Polish speaker is told about the script
and free stress first.

`falseFriend.kind` says what sort it is, because they differ by comparison:
`homograph` (written the same, as Russian often is), `lookalike` (looks or sounds
alike, as across the Polish script boundary), or `partial` (only partly the same).

## IPA

`ipa` is a phonemic transcription between slashes, following Pompino-Marschall,
Steriopolo & Żygis (2017), the published IPA illustration. Where another source
disagrees, a concept says so and names it, rather than choosing silently.

## Coverage

`packs/uk/coverage/emova-27.json` tracks eMova's 27 lessons against our units, so it
shows what is still uncovered. It holds titles and the mapping, with none of the course's
text. A test keeps it in step with the units.

## Checks before anything ships

`app/src/lib/packs.test.ts` runs these in the gates, for every pack:

1. **The validator** (`validatePack`): board complete, no forbidden letters, no
   lookalike letters from another script, `display` matches `text`, IPA is a
   transcription with stress where the word has it, every layer complete, links only
   to `http` and `https`.
2. **Two independent checks** (`validateChecks`): each piece of content must be passed
   by two different checkers. `node scripts/pack-check.mjs <pack> <checker>` writes a
   checker's record with the exact content in `seen`, so a checker fills in verdicts
   and copies nothing. Editing anything voids its checks: the entry returns to
   `pending` the next time the script runs.

A checker works from the content and outside sources, without being told the author's
reasoning, and must test sound descriptions against phonetic sources: "h, as in hat"
once passed two checkers and was wrong. A native review is recommended for the
phonetics module.

Open every source link before it ships. A DOI can resolve to the wrong paper even
when the paper prints it, as Vakulenko 2025's does, so link to where a reader actually
lands.

## Licence

Each pack names its licence in its manifest. Packs here are
[CC BY-SA 4.0](LICENSE), so data from sources under that licence, such as Wiktionary
and JMdict, can be used in them. Each unit lists its sources, and the app shows them
on the unit's Overview.
