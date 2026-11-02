# Changelog

Each release's entry is its release notes (`docs/RELEASES.md`).

## Unreleased

For players:

- Lessons 4 and 5 of Є-мова: getting to know someone, countries, greetings and addressing people by name, each with words, phrases and sentences, in the tray or typed. False friends such as прі́звище appear for your comparison
- Lesson 6 of Є-мова: the units of time, days, months, seasons, the clock with о and пів на, numbers for minutes and durations, and counting forms such as п'ять годи́н. False friends include неді́ля and час from Russian, and хвили́на from Polish
- Lesson 7 of Є-мова: бу́ти in every tense, everyday verbs, on a day and from a day, and last week or next year. ди́вно and диви́тися are marked as false friends from Russian
- Lesson 8 of Є-мова: weather words, how the day is and how it feels outside, the colours of the rainbow in every gender, and sentences with no subject. кра́сний is a false friend from Russian, and гроза́ and си́ній from Polish
- Study links for lessons 4 to 9 and 14 open the lesson itself, not the course outline.

## v0.3.0 — 2026-10-31 — Grammar you have to produce

**Langclick gains a grammar section, and a way to show you can produce a form and not only recognise it: pronouns, the vocative, noun cases and three tenses, each as a table and in sentences, in the tray or typed.**

For players:

- Lessons are grouped under Sounds, Grammar and Themes.
- Grammar covers personal pronouns, including their forms after a preposition, the vocative, the nouns кімната, брат and вікно through all cases, and the present, past and future tenses.
- A new kind of exercise: complete a sentence by choosing the form that fits its gap.
- A new Type tab: produce each answer instead of choosing it, with an on-screen keyboard if yours can't type Ukrainian. Stress marks and capitals don't count, and forms that are equally right are accepted. What you can type is tracked apart from what you recognise, and Review asks each the way you learned it.
- The tray stays at ten slips however well you know a unit, since new material is what moves you forward. A declension, a stress pair or a choice between two letters always shows every option.
- Explanations differ by comparison. From Russian, тебе́ is marked as a false friend, and notes point out чита́є without -т, ро́блять with its л, and a vocative Russian has lost. From Polish, notes point out the past without person endings, and vocative endings that differ.

Also: a cell's recorded checks now cover its `item` and `concepts`; the check that keeps engine code language-neutral covers more languages and every non-Latin script; tables with many columns fit a phone; the pack format is at version 3.

Not done, on purpose: speech. It needs a test of its own, and whether voice may leave the device is the owner's decision, so nothing here records or sends it (#21). Separate downloads, audio and guided lessons have their own milestones. eMova's themed lessons 4–27 are still not covered as a whole, though Grammar serves the forms they rely on.

Not tried: a real phone or touch drag, only an emulated phone; any browser other than Chromium; typing in Review by hand, which is covered by a test. No native speaker has read the content. Two model checkers passed all of it against sources, most of it from Goroh's raw pages, but naturalness and the glosses rest on their judgement, and Правопис references to verbs and declension are to the 2015 edition, because the 2019 site has no text for those sections. Sources disagree in places, and the pack says so: бра́ті as a locative, вікну́ as a locative, and буде́мо in the 2015 Правопис against бу́демо in the dictionaries. A synonym the checkers didn't think of will be marked wrong when typed. The stress mark on є́ and і́ sits slightly to the side, probably because of the system font on Windows. The owner played the grammar lessons and typing locally, and the vocative is what led to typing.

## v0.2.0 — 2026-10-31 — Study first, then practise, compared with Russian or Polish

**Langclick becomes a companion to Є-мова: study a lesson there, then practise and track it here, with explanations that fit the language you come from.**

For players:

- Choose what to compare Ukrainian with, Russian or Polish, and which language explanations are in: English, Russian, Polish or Ukrainian. Your progress stays when you switch.
- A declension, a stress pair or a choice between two letters now always shows every option in the tray, since those answers only mean something against each other.
- Three lessons follow Є-мова's first three: the alphabet and letter names, the vowels, and the consonants. They include the IPA charts as boards, і or и, г or ґ, where the stress falls, final voiced consonants, and exercises only for your comparison: reading from Russian letters, or from Polish spelling.
- Each lesson links to what to study first, starting with Є-мова's course, and you can mark it as studied.
- A new Review screen brings back what is due today, one board at a time.
- Words now show their IPA and related words in Russian and Polish, and false friends are marked for your comparison.
- Sounds on the alphabet are given in IPA, and a concept explains where phoneticians disagree.
- The Vakulenko source on the alphabet's Overview now opens the right paper.

Also: code is now MIT and packs are CC BY-SA 4.0; the pack validator rejects a stress mark in a cell's `text`; the check that keeps engine code language-neutral is stricter.

Not done, on purpose: separate downloads, audio, guided lessons and typed answers, which have their own milestones. Only Є-мова's lessons 1–3 are covered as a whole. Lessons 9 and 14 hold the one unit each that v0.1.0 had, and grammar sections come next (#13).

Not tried: a real phone, only an emulated one. No native speaker has read the content: two independent model checkers passed all of it against sources, and a native review is still to come. The Є-мова links for lessons 1–3 need a signed-in course account, so they were not followed by the checkers. The links for lessons 9 and 14 open the course outline, not the lesson. The owner played the release locally, and that is where the change to the tray in Lesson 14 came from.

## v0.1.0 — 2026-10-31 — A Ukrainian pack on a board you fill in

**The first release: three Ukrainian units on a board you fill in, to find out whether a table of cells can do the job of Geoclick's map.**

For players:

- A first Ukrainian pack with three units: the alphabet, the noun кімната (room)
  through all 7 cases, and 24 words for people and family.
- Each unit has an Overview of everything to learn, a Quiz where you fill in the
  board by dragging slips or by pressing a slip and then a cell, and a Known view of
  what you have earned.
- The better you know a unit, the fewer slips the tray offers at a time.
- Progress is saved in your browser.

Not in this release: audio, typed answers, installers and any web deployment. Comparison with Russian and Polish, and links to eMova, come in v0.2.0.

Content has been checked by two AI models against outside sources, not by a native speaker.
