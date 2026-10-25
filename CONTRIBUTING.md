# How we work on First ID

The Congressional App Challenge requires every teammate to make "significant individual contributions" and show "technical understanding", and judges can ask for the source code. So the git history has to show who built what, accurately.

## Who owns what

| Area | Owner | Folders |
|---|---|---|
| Planner engine: search, cost model, "what helps most", property tests | Ryan | `src/engine/`, `tests/planner*.test.ts` |
| Rules data: every rule, fee, waiver and source; personas and their hand-worked plans | Michael | `data/`, `tests/personas.test.ts` |
| Experience: intake, path view, step cards, print packet, Spanish, accessibility | Adrian | `src/screens/`, `src/styles.css`, `src/i18n.ts` |
| Shared contract. **Ask before changing.** | All | `src/engine/types.ts` |

Swap these if it suits you better. Whatever you choose, write it down here before anyone writes code.

## Rules

1. Commit under your own GitHub account. Never commit for someone else.
2. Branch per change (`ryan/planner-trips`, `michael/rules-dl933`). Open a PR, and a teammate reviews it before merging.
3. `npm run check` must pass before merging: rules lint, tests and build.
4. If an AI tool wrote or substantially rewrote code, say so in the commit message (`AI-assisted: Claude drafted, I reviewed and changed X`), and add a line to `AI-USE.md`.
5. Never rewrite history. The log should match what we tell the judges.
6. No personal data in the repo or the app: no names, addresses, birthdates or document numbers, not even in tests. Personas are invented.
