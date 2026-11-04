# Langclick

Language learning by memory: grammar and vocabulary. A board shows what you are
expected to learn, you quiz yourself by filling it in, and what you get right
shows as known. Content comes as pluggable language packs, starting with
Ukrainian. Created by Diego Amicabile.

The last released milestone is [v0.7.0](https://github.com/diegoami/LangClick2027/releases/tag/v0.7.0)
(2026-11-04). [CHANGELOG.md](CHANGELOG.md) records its exact commit and the merged
material since it under **Unreleased**, including pending content checks.
Run from source; there are no installers yet.

## Quick start

```bash
git clone git@github.com:diegoami/langclick2027.git
cd langclick2027
npm install
npm run setup-hooks              # once per clone: pre-push runs the quality gates
npx playwright install chromium  # once per machine: component tests run in it
npm run dev
```

Open <http://localhost:5193>. Progress is kept in your browser.

`npm run gates` runs the four quality gates (typecheck, tests, lint, build), and
the pre-push hook runs them too. There is no CI: skip the hook for a single push
with `git push --no-verify`.

## Licence

Code: [MIT](LICENSE). Language packs: [CC BY-SA 4.0](packs/LICENSE).

## More docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — how it is built
- [ROADMAP.md](ROADMAP.md) — what's built, what's next
- [DECISIONS.md](DECISIONS.md) — the *why*
- [packs/README.md](packs/README.md) — how to write a language pack
- [AGENTS.md](AGENTS.md) and [docs/RELEASES.md](docs/RELEASES.md) — how the
  project is run

## Web interface on GitHub Pages

[Open LangClick2027](https://diegoami.github.io/LangClick2027/). This is a work in progress.
The Pages build uses hash navigation, so lessons, boards, quizzes and reloads
work beneath `/LangClick2027/` without a server-side fallback. Progress stays in
this browser; no account backend is required.

Run `npm run build:pages` to build the static interface in `app/build/`.
The workflow builds and publishes it on pushes to `main`; select **GitHub
Actions** in Settings → Pages before the first deployment. The normal
`npm run build` keeps its existing pathname routing. No release tag is created.
