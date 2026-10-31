# Changelog

Each release's entry is its release notes (`docs/RELEASES.md`).

## Unreleased

Also: a cell's recorded checks now cover its `item` and `concepts`, and the check that keeps engine code language-neutral covers more languages and every non-Latin script.

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
