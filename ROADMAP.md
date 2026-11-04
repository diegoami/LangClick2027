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

**Swedish level 2 shipped in [v0.7.0](https://github.com/diegoami/LangClick2027/releases/tag/v0.7.0)** under [#58](https://github.com/diegoami/LangClick2027/issues/58), after milestone [#61](https://github.com/diegoami/LangClick2027/issues/61) received AGREE on `b93896c60ff747c645f7a4f56584abce58bd8d80`. Hej svenska 2's ten themes are lessons 13–24. They add object and reflexive pronouns, the past tense with the commonest strong verbs, the future with ska and kommer att, the genitive, definite adjectives, den/det, ja/jo/nej, and time words such as i somras and fem i halv fyra.

**Swedish level 3 is authored under the approved [#64](https://github.com/diegoami/LangClick2027/issues/64), with independent content checks still required before merge.** Lessons 25–36 follow Hej svenska 3's ten themes: countries, family and leisure, work, environment, housing, travel, personal finances, healthcare, relationships, and society. The first two themes each receive two lessons. The 24 new boards contain 174 cells and add the perfect, main- and subordinate-clause word order, modal verbs, comparisons and conjunctions. The Swedish pack now has 36 lessons, 91 boards and 830 cells in this branch. A coverage ledger maps the themes and identifies source-only activities; the boards supplement rather than reproduce listening, reading, charts and free writing.

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
| v0.8.0 (proposed) | Swedish level 3, following Hej svenska 3 ([#64](https://github.com/diegoami/LangClick2027/issues/64)); downloads remain deferred |
| v0.9.0    | Native audio as separate per-unit assets, guided lessons (Tour), first video through `ai-player`                                                                                                                                                            |
| v0.10.0   | Correspondence boards, false friends, multiple choice, Windows and Android builds                                                                                                                                                                           |
| v1.0.0    | The whole 27-lesson course covered, compared with Russian and with Polish                                                                                                                                                                                   |
| Later     | B1 Ukrainian and other languages                                                                                                                                                                                                                            |

The owner authorized implementing the remaining Ukrainian lessons together under #34, so
v0.5.0 carries lessons 9–27 at once rather than the three batches first planned. The slots
after v0.6.0 are older plans, not commitments; the v1.0.0 line is already met by v0.5.0's
content.
