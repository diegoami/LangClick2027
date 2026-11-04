# Langclick — Roadmap

Ukrainian comes first, as a companion to the source material: study eMova's course,
then practise and repeat here, which eMova doesn't offer. Finish its 27-lesson course,
then add Swedish before optional downloads, audio or other extras. Audience size is not a goal.

## Status

**[v0.5.0](https://github.com/diegoami/LangClick2027/releases/tag/v0.5.0) is released: the
whole Ukrainian course.** All 27 eMova lessons have practice, in the tray or typed, explained
in English, Russian, Polish or Ukrainian and compared with Russian or Polish. The pack has 119
boards and 2,019 cells, under one transcription convention written down in `packs/README.md`.
The coverage ledger records the source scope of every lesson.
[Milestone #48](https://github.com/diegoami/LangClick2027/issues/48) received AGREE on the
exact tagged commit, `726d3d913b8100ba4e6f5e58ee9a57d7bbc15f11`. Its one finding, the stress of
та́к собі ([#49](https://github.com/diegoami/LangClick2027/issues/49)), is fixed for the next
release.

Exercises are original, and private source text is absent from the pack. Listening, literary
reading, recipes and open-ended writing stay in the linked source. No native speaker has
reviewed the content; two independent AI content checks pass every target.

**[v0.6.0](https://github.com/diegoami/LangClick2027/releases/tag/v0.6.0) is released: Swedish, level 1.** [Milestone #56](https://github.com/diegoami/LangClick2027/issues/56) received AGREE on the exact tagged commit, `082907ac75cf1651f9df3be8c896a0f11315bb3c`. The design is agreed in
[#43](https://github.com/diegoami/LangClick2027/issues/43): the course follows Hej svenska level

1. Its ten themes are twelve lessons, with 38 boards and 396 cells:

- lessons 1–3 cover Tema 3 (letters and sounds, numbers, phrases);
- lessons 4–12 cover Bostad, Kläder, Mat, Familj, Kroppen, Tid, Jobb, SOS and Min stad.

The grammar sits where the themes need it: en/ett and the definite ending, adjective
agreement, plurals, possessives, the present tense and the imperative. Explanations are in
English, with comparisons with English and German.

**[v0.7.0](https://github.com/diegoami/LangClick2027/releases/tag/v0.7.0) is released: Swedish, level 2.** [Milestone #61](https://github.com/diegoami/LangClick2027/issues/61) received AGREE in round 2 on the exact tagged commit, `b93896c60ff747c645f7a4f56584abce58bd8d80`. Round 1's finding ([#62](https://github.com/diegoami/LangClick2027/issues/62), sov/sover) was rebutted with Lexin, SAOL and Wiktionary evidence and withdrawn. Agreed in [#58](https://github.com/diegoami/LangClick2027/issues/58), level 2 covers Hej svenska 2's ten themes as lessons 13–24. It adds object and reflexive pronouns, the past tense with the commonest strong verbs, the future with ska and kommer att, the genitive, definite adjectives, den/det, ja/jo/nej, and time words such as i somras and fem i halv fyra. The Swedish pack now has 24 lessons, 67 boards and 656 cells.

### Open

- **The next milestone is not chosen.** The candidates are Hej svenska level 3, separate downloads ([#6](https://github.com/diegoami/LangClick2027/issues/6)), and audio. The owner picks; a release plan needs a proposal issue first.
- **Points left for a native speaker.** No dictionary we can reach marks these forms, so their accents follow general rules:
  - Swedish: the accent 1 of the weekday and month names (and augusti), förrgår, i vinter, svåger, händer, fötter, tänder and föräldrar, and the transcription of mormor.
  - Where Lexin and Wiktionary disagree, the cells follow Lexin: ursäkta, god in greetings, and mig/dig written with a long /j/.
  - Ukrainian: та́к собі, which follows Словники України against Wiktionary.
- **The comparison language is one setting for every pack.** A learner who compares Ukrainian with Russian sees no Swedish comparison until they switch to English or German.
- **A reviewer nit from #61:** the vowel-chart note names sova as the exception where o is /oː/. It could name the whole family (sova, sover, sov). It is a content edit, so it needs two checks.
- **Finished proposals are still open on GitHub:** #3, #27, #34, #43 and #58. Closing them is the owner's call.
  On 2026-11-02 the owner directed: finish Ukrainian, then Swedish, before voices and other
  extras. Downloads ([#6](https://github.com/diegoami/LangClick2027/issues/6)), audio, guided
  lessons, speech ([#21](https://github.com/diegoami/LangClick2027/issues/21)) and native builds
  are deferred; their old version slots below are historical plans, not prerequisites to Swedish.

## Milestones

| Milestone | Delivers                                                                                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1.0    | Ukrainian, 3 units (alphabet, one noun case table, one vocabulary set), with Overview, Known, drag quiz and saved progress                                                                                                                                  |
| v0.2.0    | Study links and tracking, a Review screen; comparison with Russian or Polish, concepts, IPA, cognates; a phonetics module covering eMova lessons 1–3; the pack file layout that downloads will use                                                          |
| v0.3.0    | Grammar sections: pronouns, the vocative, noun cases, present, past and future, each as a table and as sentences with a gap. A steady tray, since a unit needn't get harder. Typing the answer ([#21](https://github.com/diegoami/LangClick2027/issues/21)) |
| v0.4.0    | eMova lessons 4–8: getting to know someone, greetings, time and months, weekdays, weather                                                                                                                                                                   |
| v0.5.0    | eMova lessons 9–27, completing the Ukrainian course; one transcription convention for the whole pack; the source scope of all 27 lessons in the coverage ledger                                                                                             |
| v0.6.0    | Swedish, following Hej svenska level 1 ([#43](https://github.com/diegoami/LangClick2027/issues/43)): letters and sounds first, then its themes                                                                                                              |
| v0.7.0    | Swedish level 2, following Hej svenska 2 ([#58](https://github.com/diegoami/LangClick2027/issues/58))                                                                                                                                                       |
| v0.8.0    | Separate downloads: a `langclick-packs` repo, a catalog, a Library screen. The app stops bundling content                                                                                                                                                   |
| v0.9.0    | Native audio as separate per-unit assets, guided lessons (Tour), first video through `ai-player`                                                                                                                                                            |
| v0.10.0   | Correspondence boards, false friends, multiple choice, Windows and Android builds                                                                                                                                                                           |
| v1.0.0    | The whole 27-lesson course covered, compared with Russian and with Polish                                                                                                                                                                                   |
| Later     | B1 Ukrainian and other languages                                                                                                                                                                                                                            |

The owner authorized implementing the remaining Ukrainian lessons together under #34, so
v0.5.0 carries lessons 9–27 at once rather than the three batches first planned. The slots
after v0.6.0 are older plans, not commitments; the v1.0.0 line is already met by v0.5.0's
content.
