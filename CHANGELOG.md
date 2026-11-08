# Changelog

Each release's entry is its release notes (`docs/RELEASES.md`).

## Unreleased

Last released milestone: [v0.7.0](https://github.com/diegoami/LangClick2027/releases/tag/v0.7.0),
2026-11-04, commit `b93896c60ff747c645f7a4f56584abce58bd8d80`.
New material below is not a tagged or independently checked release.

- Swedish level 3: lessons 25–36 following Hej svenska 3, with 30 boards and
  222 cells. Includes additional practice of clause order, comparisons, definite
  plurals, journey conjunctions, borrowing/lending and sentence adverbs.
- The owner authorized merging authored content while independent checks remain
  pending for their reviewers. Pending checks remain visible; no passing
  verdicts are fabricated.
- Japanese starter: six lessons, eleven boards and 158 cells covering the 46 basic
  hiragana and katakana, mora length, loanwords, greetings, clarification,
  introductions, residence, numbers and age. English explanations link Irodori
  Starter for study and audio; this is an initial batch, not its full course.
- Pending independent content checks for both additions are tracked in
  [#67](https://github.com/diegoami/LangClick2027/issues/67).
- Fixed long Ukrainian verb answers overlapping neighbouring cells on phones.
  Table sizing accounts for the longest answer in each equal-width column;
  regression tests cover narrow phones, standard phones and desktops.

## v0.7.0 — 2026-11-04 — Swedish, level 2

**Swedish continues with the ten themes of Hej svenska level 2: the past and the future, pronouns as objects, and the everyday grammar of talking about your life.**

For players:

- Twelve new lessons (13–24) under Level 2: presenting yourself, living in a flat, your day, what you did, the wider family, free time, health care, shopping, working life, travel, holidays, and time and dates.
- The past tense: regular verbs in -ade, -de, -te and -dde, and the ten commonest strong verbs (åt, drack, skrev, gick, kom, såg, tog, gav, sov, gjorde).
- The future with ska and kommer att, and på lördag against på lördagar.
- Pronouns as objects (mig, honom, henne, oss, dem), reflexive verbs (tvättar mig, klär på sig), the genitive -s, and den or det for "it".
- Adjectives after den, det and de (den röda tröjan), ja, jo and nej, för … sedan, i sommar and i somras, and fem i halv fyra.
- Distinctions English and German blur: gå, åka and köra; moster and faster, morbror and farbror; semester as holiday from work.

Each lesson links its Hej svenska 2 theme and is authored for Langclick, copying nothing. Two independent content checks passed all 1,369 Swedish targets on their exact current text; across the level they caught about 45 faults, mostly word accents, particle-verb stress and vowel length, all fixed before the verdicts.

Not included: Hej svenska levels 3 and 4, Swedish explained in other languages, audio, downloads or speech. No native speaker has reviewed the content; the checks are AI checks against Lexin, Wiktionary and Help:IPA/Swedish.

Not tried during release preparation: manual play of every lesson, a real phone, touch drag, or browsers other than those the automated gates exercise. The reviewed and tagged commit is named in the GitHub release.

## v0.6.0 — 2026-11-04 — Swedish, level 1

**Langclick gains a second language: Swedish, following the ten themes of Hej svenska level 1, in the tray or typed, explained in English and compared with English or German.**

For players:

- Swedish appears on the home page beside Ukrainian, and German and English join the comparison choices.
- Sounds and basics, lessons 1–3: the 29 letters, the nine long vowels, pairs that only length tells apart (tak, tack), the sj- and tj-sounds, numbers from noll to tusen, greetings, introductions and the weather.
- Themes, lessons 4–12: housing, clothes and colours, food and drink, the family, the body and health, time, work, emergencies, and finding your way in town.
- Grammar where the themes need it: en- and ett-words and "the" as an ending, adjectives that agree, the five plural groups and plurals that change the vowel, possessives, the present tense, the imperative, and telling the time (halv tre is half past two).
- Every word, form and table cell has a transcription that marks vowel and consonant length, the retroflex sounds and the two word accents. The convention, after Engstrand (1990), is written down in `packs/README.md`.
- Comparisons with English and German name cognates and false friends: ost is not cheese, ben is a leg, halv tre is German halb drei.
- Ukrainian: та́к собі now shows its stress, which matches its transcription (#49).

Each lesson links its Hej svenska theme and is authored for Langclick, copying nothing. Two independent content checks passed all 818 Swedish targets on their exact current text. Where Lexin and Wiktionary disagree (ursäkta, god in the greetings), the cells follow Lexin.

Not included: Hej svenska levels 2–4, Swedish explained in languages other than English, audio, downloads or speech. The comparison language is still one setting for every pack. No native speaker has reviewed the Swedish content; the checks are AI checks against Lexin, Wiktionary and published phonetic descriptions, and a few accents (händer, fötter, tänder, föräldrar) rest on general rules where no dictionary marks the form.

Not tried during release preparation: manual play of every lesson, a real phone, touch drag, or browsers other than those the automated gates exercise. The reviewed and tagged commit is named in the GitHub release.

## v0.5.0 — 2026-11-04 — The whole Ukrainian course

**All 27 lessons of Є-мова's "Українська за 27 уроків" now have practice here, in the tray or typed, explained in English, Russian, Polish or Ukrainian and compared with Russian or Polish.**

For players:

- Lesson 9: kinship, marriage and generations, with possessives, family genitives and sentences. The great-grandfather board follows the academic dictionary's пра́дідусь and explains where the course notes differ.
- Lesson 10: professions and their word families, feminine forms and workplaces. лі́кар is the answer shown, and colloquial до́ктор is accepted when typed.
- Lessons 11–27: the body and appearance, clothing and sizes, the home, food and recipes, restaurants and money, transport and directions, the city, travel, character, hobbies, services, health, holidays, nature and studying.
- Grammar in context throughout: locatives, adjective agreement and comparison, motion verbs and the perfective future, verb government, and imperatives.
- Every word, verb form and table cell has a phonemic transcription, and the whole course follows one convention, written down in `packs/README.md`. It covers which consonants soften before і, length, кв as /kʋ/, дц as /dʲt͡sʲ/, and where the stress mark falls.
- Every sentence and table cell has a grammar note giving the reason for its form, in all four explanation languages.
- Russian and Polish comparisons for the new lessons: false friends such as за́мок, пам'ятка and катедра/katedra, and words with no shared root, such as заправка and stacja benzynowa.
- Dictionary-supported alternatives are accepted when typed, and updated civil holiday dates are explained rather than repeating outdated course rules.

Each lesson links to its source and is authored for Langclick, with nothing copied from eMova. The coverage ledger records, for all 27 lessons, what the source teaches, how that was checked and what stays in the source (listening, literary reading, recipes, forum writing). Two independent content checks passed every one of the pack's 9,506 content targets on its exact current text.

Not included: Swedish (agreed in #43, lesson 1 waits in #45 for this tag), separate downloads, native audio, guided lessons or speech. No native speaker has reviewed the content; the content checks are AI checks against dictionaries and published phonetic descriptions.

Not tried during release preparation: manual play of every new lesson, a real phone, touch drag, or browsers other than those the automated gates exercise. The reviewed and tagged commit is named in the GitHub release.

## v0.4.0 — 2026-11-02 — eMova lessons 4–8

**Practise eMova lessons 4–8 after studying the source: introductions, greetings, time, everyday routines and weather, compared with Russian or Polish.**

For players:

- Lessons 4 and 5 of Є-мова: getting to know someone, countries, greetings and addressing people by name, each with words, phrases and sentences, in the tray or typed. False friends such as прі́звище appear for your comparison
- Lesson 6 of Є-мова: the units of time, days, months, seasons, the clock with о and пів на, numbers for minutes and durations, and counting forms such as п'ять годи́н. False friends include неді́ля and час from Russian, and хвили́на from Polish
- Lesson 7 of Є-мова: бу́ти in every tense, everyday verbs, on a day and from a day, and last week or next year. ди́вно and диви́тися are marked as false friends from Russian
- Lesson 8 of Є-мова: weather words, how the day is and how it feels outside, the colours of the rainbow in every gender, and sentences with no subject. кра́сний is a false friend from Russian, and гроза́ and си́ній from Polish
- Study links for lessons 4 to 9 and 14 open the lesson itself, not the course outline.

The coverage ledger maps each lesson to its boards; the exercises are authored for Langclick and link to eMova rather than copying its text. Lessons come before separate downloads, now planned for v0.8.0 (#27). The pre-push hook is executable on Linux and WSL as well as Windows (#31).

Not included: lessons 9–27 as a whole, separate downloads, native audio, guided lessons or speech. No native speaker has reviewed the content. Recorded content checks and the pack validator are verified by the local gates; the version-bump PR added no language content; the milestone adds lessons 4–8.

Not tried during release preparation: manual play, a real phone, touch drag or browsers other than those exercised by the automated gates. Signed-in eMova study links were not manually followed. Reviewed and tagged commit: `e73638f945c48c829aafea37ffdef3c26eaec0c1`.

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
