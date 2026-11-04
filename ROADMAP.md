# Langclick — Roadmap

Ukrainian comes first, as a companion to the source material: study eMova's course,
then practise and repeat here, which eMova doesn't offer. Finish its 27-lesson course,
then add Swedish before optional downloads, audio or other extras. Audience size is not a goal.

## Status

**[v0.4.0](https://github.com/diegoami/LangClick2027/releases/tag/v0.4.0) is released.**
It adds eMova lessons 4–8 to the phonetics and grammar already available, in the tray or typed,
compared with Russian or Polish. [Milestone #33](https://github.com/diegoami/LangClick2027/issues/33)
received AGREE on the exact tagged commit, `e73638f945c48c829aafea37ffdef3c26eaec0c1`.

**Lessons 9–10 are merged** under approved [proposal #34](https://github.com/diegoami/LangClick2027/issues/34): family and in-law vocabulary, possessives and genitives; professions, word families and workplace language.

**Lessons 11–27 are merged** ([#39](https://github.com/diegoami/LangClick2027/pull/39)). The owner extended the same
source-first design through lesson 27 under [#34](https://github.com/diegoami/LangClick2027/issues/34).
There are 56 new boards and 995 new cells, with four explanation languages and Russian/Polish
comparisons. Every one of eMova's 27 lessons now maps to core practice; the pack has 119 boards
and 2,019 cells in total. Existing general grammar stays in its original lesson and is referenced
by the coverage ledger.

The full source notes and tasks were inspected with explicit permission. Listening, literary
reading, recipes and open-ended writing remain in the linked source. Exercises are original;
private source text is absent from the pack. Two independent content checks record the exact
new content. The follow-up [#41](https://github.com/diegoami/LangClick2027/pull/41), merged,
brought the new lessons up to the older content's convention — a phonemic transcription on
every word, verb form and table cell, a grammar note on every sentence and table cell in all four explanation languages, and the
Russian and Polish comparisons the older boards carry. The transcription rules are written
down in `packs/README.md`. Ukrainian is still not complete. Three things remain:

- the completion audit over all 27 lessons (the coverage ledger has no source scope for
  lessons 1–8);
- the transcription conventions settled in
  [#42](https://github.com/diegoami/LangClick2027/issues/42), awaiting owner testing in
  [#44](https://github.com/diegoami/LangClick2027/pull/44);
- the release.

Swedish is the next content task after Ukrainian, before optional extras. Its design is agreed
in [#43](https://github.com/diegoami/LangClick2027/issues/43): it follows Hej svenska level 1
and merges after the v0.5.0 release.

On 2026-11-02 the owner directed: finish Ukrainian, then Swedish, before voices and other
extras. Downloads ([#6](https://github.com/diegoami/LangClick2027/issues/6)), audio, guided
lessons, speech ([#21](https://github.com/diegoami/LangClick2027/issues/21)) and native builds
are deferred; their old version slots below are historical plans, not prerequisites to Swedish.

## Milestones

| Milestone  | Delivers                                                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1.0     | Ukrainian, 3 units (alphabet, one noun case table, one vocabulary set), with Overview, Known, drag quiz and saved progress                                                                                                                                  |
| v0.2.0     | Study links and tracking, a Review screen; comparison with Russian or Polish, concepts, IPA, cognates; a phonetics module covering eMova lessons 1–3; the pack file layout that downloads will use                                                          |
| v0.3.0     | Grammar sections: pronouns, the vocative, noun cases, present, past and future, each as a table and as sentences with a gap. A steady tray, since a unit needn't get harder. Typing the answer ([#21](https://github.com/diegoami/LangClick2027/issues/21)) |
| v0.4.0     | eMova lessons 4–8: getting to know someone, greetings, time and months, weekdays, weather                                                                                                                                                                   |
| v0.5.0     | Lessons 9–14: family, profession, the body, appearance, clothes, home                                                                                                                                                                                       |
| v0.6.0     | Lessons 15–20: food, dishes, restaurant and money, transport, the city, travel                                                                                                                                                                              |
| v0.7.0     | Lessons 21–27: character, hobbies, services, how you feel, holidays, nature, studying                                                                                                                                                                       |
| v0.8.0     | Separate downloads: a `langclick-packs` repo, a catalog, a Library screen. The app stops bundling content                                                                                                                                                   |
| v0.9.0     | Native audio as separate per-unit assets, guided lessons (Tour), first video through `ai-player`                                                                                                                                                            |
| v0.10.0    | Correspondence boards, false friends, multiple choice, Windows and Android builds                                                                                                                                                                           |
| v1.0.0     | The whole 27-lesson course covered, compared with Russian and with Polish                                                                                                                                                                                   |
| After Ukrainian | Swedish, scoped from sources in [#34](https://github.com/diegoami/LangClick2027/issues/34); B1 Ukrainian and other languages later                                                                                                                                                                                         |

The original content version slots above are historical batch boundaries. The owner has
authorized implementing the remaining Ukrainian lessons together under #34; the release
version and milestone review follow the ordinary release process. Swedish follows the
completed Ukrainian course and gets its own agreed design before implementation.
