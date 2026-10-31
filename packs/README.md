# Language packs

A pack is a folder here. Nothing else registers it: the app finds every
`packs/*/pack.json`.

    packs/<id>/pack.json           id, language tag, scripts, licence, unit order
    packs/<id>/units/<unit>.json   a board: its layout, cells and sources
    packs/<id>/checks/<name>.json  independent content checks

The types are in `packages/pack-format/src/index.ts`. Rules about one language go
in that pack's manifest (`forbiddenLetters`, `displayMarks`, `scripts`), never in
the engine.

## Boards

- A `table` has rows and columns, and exactly one cell at each crossing.
- A `grid` is tiles in order. `size` says how many there must be, and every cell
  needs a `clue` that fits only its own answer.

`text` is the answer as compared, and slips show it. `display` is the answer as
shown once visible, and may add only the marks the manifest declares. A cell
accepts a slip when their `text` is equal, so a form that fills two cells needs
nothing special.

`item` is what progress is kept against. Use the same `item` for the same thing in
another unit, and it shares its progress there.

## Checks before an item ships

`app/src/lib/packs.test.ts` runs these in the gates, for every pack:

1. **The validator** (`validatePack`): board complete, no forbidden letters, no
   lookalike letters from another script, `display` matches `text`, sources
   present.
2. **Two independent checks** (`validateChecks`): each item must be passed by two
   different checkers, each recorded in `checks/` with the exact answer, clue and
   note it saw. Editing any of those voids its checks, so it has to be checked
   again.

A checker works from the unit files and outside sources, without being told the
author's reasoning. A paid native review is optional and is not required for a
milestone.

## Licence

Each pack names its licence in its manifest. Packs are
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), so data from
sources under that licence, such as Wiktionary and JMdict, can be used in them.
Each unit lists its sources, and the app shows them on the unit's Overview.
