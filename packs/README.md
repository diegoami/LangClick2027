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

A unit with `typing` offers the Type tab, where the learner produces each answer. Typing
ignores stress marks and capitals and forgives nothing else, so a cell lists in `alsoAccepted`
any other form that is equally right, or typing would mark it wrong. A unit whose answer is
its marks can't set `typing`. The manifest's `keyboard` gives rows of keys for an on-screen
keyboard, for a learner whose own can't type the language.

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

A word cell, a verb form and a table cell that names a word carry a
transcription. A sentence cell does not: the sentence carries the word, and a
transcription would repeat it.

The letters follow the `alphabet` board, which is the authority:

| Letter | Sound | Letter | Sound | Letter | Sound |
| ------ | ----- | ------ | ----- | ------ | ----- |
| а      | a     | й      | j     | ц      | t͡s    |
| б      | b     | к      | k     | ч      | t͡ʃ    |
| в      | ʋ     | л      | l     | ш      | ʃ     |
| г      | ɦ     | м      | m     | щ      | ʃt͡ʃ   |
| ґ      | ɡ     | н      | n     | ь      | ʲ     |
| д      | d     | о      | ɔ     | ю      | ju    |
| е      | ɛ     | п      | p     | я      | ja    |
| ж      | ʒ     | р      | r     | є      | jɛ    |
| з      | z     | с      | s     | ї      | ji    |
| и      | ɪ     | т      | t     | и      | ɪ     |
| і      | i     | у      | u     |        |       |

The rest of the rules, each with the board that states it:

- **И is /ɪ/** in every position, stressed or not: брати́, штани́, були́ are all
  /ɪ/. Only the masculine plural endings -ів and -ові keep a full /i/, and a
  feminine genitive plural in -нів does not. **І is /i/**, and a dental or р
  before it is soft and carries the ʲ mark: дім /dʲim/, ліс /lʲis/. A labial,
  velar or hushing consonant before it stays unmarked: кіт /kit/, бік /bik/
  (`i-or-y`).
- **Unstressed о stays /ɔ/**; it does not reduce towards a (`unstressed-o`).
- **Г is /ɦ/**, and **x before к or т**: легки́й, ні́гті (`h-or-g`).
- **A final consonant keeps its voice**: віз ends in [z], ваз differs from вас
  (`final-voiced`).
- **Soft sign and glide vowels soften what precedes them**: дім, ліс, хліб,
  ніж; the sign ʲ marks the softened consonant. A hushing consonant before я
  is marked too: обличчя /ɔˈblɪt͡ʃʲːa/.
- **щ is one letter, /ʃt͡ʃ/**, and is never split by a syllable break: борщі
  /bɔrˈʃt͡ʃi/.
- **дж and дз are single affricates**, /d͡ʒ/ and /d͡z/, written with two
  letters (`one-sound-two-letters`).
- **A doubled consonant is a long one**: нн is nː.
- **К before a voiced obstruent** (б, г, ґ, д, ж, з) is /ɡ/: вокзал /ʋɔɡˈzal/,
  Великдень. В is a sonorant and voices nothing: квартира /kʋarˈtɪra/.
- **Softening that standard pronunciation requires is marked** (owner decision,
  [#42](https://github.com/diegoami/LangClick2027/issues/42)):
  - с or з before a soft dental: тесть /tɛsʲtʲ/, якість /ˈjakisʲtʲ/;
  - д or т before a soft н or с: будні /ˈbudʲnʲi/, рідня /rʲidʲˈnʲa/,
    підсніжник /pidʲsʲˈnʲiʒnɪk/;
  - дц is /dʲt͡sʲ/: двадцять /ˈdʋadʲt͡sʲatʲ/ (pronunciation guides write
    [d͡zʲt͡sʲ]).

  Optional softening is not marked: н stays hard before a soft dental
  (українська /ukraˈjinsʲka/, танці /ˈtant͡sʲi/).

- **A doubled consonant across a prefix is one long consonant too**: відділення
  /ʋiˈdʲːilɛnʲːa/.
- **ˈ goes before the stressed syllable**, and the stress is the one the
  `display` marks. An obstruent plus р or л, and с, з or ш before a stop,
  begin the syllable: сестра /sɛˈstra/, роблю /rɔˈblʲu/, кілограм
  /kilɔˈɦram/; a consonant before an apostrophe's j does too: ім'я /iˈmja/.
  Any other cluster splits before its last consonant: дочка /dɔt͡ʃˈka/, вікно
  /ʋikˈnɔ/, підсніжник /pidʲsʲˈnʲiʒnɪk/. A prefix ending in a consonant (під-,
  від-, роз-) keeps it: відвідувати /ʋidˈʋiduʋatɪ/, розлючений.

## Coverage

`packs/uk/coverage/emova-27.json` tracks eMova's 27 lessons against our units, so it
shows what is still uncovered. It holds titles and the mapping, with none of the course's
text. A test keeps it in step with the units.

`packs/sv/coverage/hejsvenska-3.json` maps all ten Hej svenska 3 themes to lessons
25–36 and their boards. The source labels its employment theme `Bas` and its money
theme `Tid`; the ledger retains those labels while lesson titles describe the
practice. Source-only listening, reading, diagrams and free writing are listed
explicitly. `courseCoverage.test.ts` checks theme coverage and exact manifest mappings.

## IPA in the Swedish pack

The rules above are the Ukrainian pack's. `sv` transcribes Central Standard Swedish
between slashes, following Engstrand (1990), the published IPA illustration, with the
symbols of Wikipedia's Help:IPA/Swedish:

- **Every stressed syllable is long**: a long vowel (tak /tɑːk/), or a short vowel
  followed by a single long consonant (tack /takː/), and ː marks either. Length
  changes the vowel's quality too: long a /ɑː/ and short a /a/, long u /ʉː/ and short u
  /ɵ/ (ful, full). Before a cluster a short vowel's syllable needs no mark: x
  /ɛks/, anden /ˈǎndɛn/ (Help:IPA writes [nː] there). The `vowel-chart` board
  shows the nine long vowels.
- **o is usually /uː/ and å is /oː/.** ä before r is /æː/, and ö before r is /œː/.
- **The sj-sound is /ɧ/ and the tj-sound /ɕ/** (`sj-tj`).
- **r with a following t, d, n, s or l is one retroflex**, ʈ ɖ ɳ ʂ ɭ, and no r is
  written: fjorton /ˈfjûːʈɔn/, fyrtio /ˈfœ̂ʈːɪʊ/.
- **Numbers are transcribed in their careful forms** (nio /ˈnîːʊ/, trettio
  /ˈtrɛ̂tːɪʊ/), and a note or the `everyday-numbers` concept gives the everyday ones (/ˈnîːɛ/, /ˈtrɛ̂tːɪ/).
- **Word accent is marked on the stressed vowel** when another syllable follows it:
  accent 1 with ̌ and accent 2 with ̂, as in anden /ˈǎndɛn/ "the duck" and
  /ˈândɛn/ "the spirit". A stress on a word's last syllable takes no tone mark
  (station /staˈɧuːn/), and a compound marks its secondary stress with ˌ (dubbel-ve
  /ˈdɵ̂bːɛlˌveː/).

## Japanese writing and transcription

`ja` begins with writing foundations and original practice supporting Irodori
Starter's first four lessons. `packs/ja/coverage/irodori-*.json` records that first
batch; it does not stand in for the whole eighteen-lesson course. Explanations and
comparison are initially English. Type Japanese; listed kana/kanji spellings are
alternatives, while romanisation is only a reading aid.

Broad standard-Tokyo segmental IPA marks vowel and consonant length. Kana such as
し, ち and ふ use /ɕi/, /tɕi/ and /ɸɯ/. Isolated ん is written /ɴ/; its realisation
varies with context. Long vowels have ː; a small っ occupies a mora and lengthens
the following consonant. Transcriptions omit pitch accent and fine detail such as
vowel devoicing. They do not replace native audio or describe every speaker.
Written は in the topic particle and greetings is /wa/; particle を is /o/.

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

A checker reads stress from the raw page, letter by letter. A page summarised by a tool can't
be trusted with a stress mark: one checker passed three wrong marks that way. In a sentence,
it also checks that no other slip in the tray is right too, because that slip would be marked
wrong.

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
