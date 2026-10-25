# How we work on First ID

The Congressional App Challenge requires every teammate to make "significant individual contributions" and show "technical understanding", and judges can ask for the source code. So the git history has to show who built what, accurately.

## Team

- Adrian Erlikhman
- Michael Tarekegn
- Ryan
- Tsion Tarekegn

`src/engine/types.ts` is the shared contract between the rules, the planner and the screens. Ask the team before changing it.

## Rules

1. Commit under your own GitHub account. Never commit for someone else.
2. Branch per change (`yourname/short-description`). Open a PR, and a teammate reviews it before merging.
3. `npm run check` must pass before merging: rules lint, tests and build.
4. If an AI tool wrote or substantially rewrote code, say so in the commit message (`AI-assisted: Claude drafted, I reviewed and changed X`), and add a line to `AI-USE.md`.
5. Never rewrite history. The log should match what we tell the judges.
6. No personal data in the repo or the app: no names, addresses, birthdates or document numbers, not even in tests. Personas are invented.

## Verifying a rule

Every rule in `data/rules.json` starts as `"verified": false`, and the app shows it as "call ahead" until a teammate signs it off. To verify one:

1. Open every source the rule lists (its `sources`, plus the sources on each of its `waivers`).
2. Replace any quote that starts with `TODO` with the exact sentence from the page, under 30 words.
3. For statutes, re-check the text on leginfo.legislature.ca.gov, not a mirror site.
4. Check the rule's requirements, fee, waivers and days, and its plain-language `why`, `say` and `bring` lines (AI-drafted), against what the source actually says, in English and Spanish.
5. Update each source's `checked` date, then set `"verified": true`.
6. Write down what changed in `data/CHANGES.md` and in the commit message.
7. Run `npm run check`. If a persona's plan changes, work it out again by hand from the sources before updating `tests/personas.test.ts`.

## Team notes

Our build-week notes (repo setup and the day-by-day task list) are in [`docs/team/`](docs/team/).
