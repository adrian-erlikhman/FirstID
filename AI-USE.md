# How we used AI

The 2026 Congressional App Challenge allows AI tools if "all AI usage is fully disclosed in the submission materials". This file is that disclosure. Keep it current: add a line whenever an AI tool writes or substantially changes something.

## Summary (update before submitting)

- **Tools:** Anthropic Claude, for research, the starter scaffold and code review. [Add any others you use.]
- **The app itself uses no AI.** Plans come from a deterministic planner over a hand-checked rules file. The same inputs always give the same plan.
- **What AI did not do:** decide any rule. Every rule in `data/rules.json` was checked by a teammate against the primary source linked next to it. (Make sure this is true before you submit: no rule in a persona plan may still be `verified: false`.)

## Log

| Date | What | Tool | Who reviewed it, and what they changed |
|---|---|---|---|
| 2026-10-18 | Research brief on California ID rules (first draft of sources list) | Claude | [Michael: rechecked every source; corrections listed in data/CHANGES.md] |
| 2026-10-18 | Starter scaffold: contract types, reference planner, rules linter, test harness, app shell | Claude | [Committed as one labeled commit, "scaffold (AI-generated)"] |
| 2026-10-18 | Draft rules file (11 rules, all `verified: false`) and draft persona tests | Claude | [Michael: verify each rule; note what changed in data/CHANGES.md] |
| 2026-10-18 | Spanish strings, first draft | Claude | [Native speaker review: who, and what changed] |
| 2026-10-18 | Research notes in docs/research/ | Claude | [Leads only; not used without re-checking the primary source] |
| 2026-10-21 | All seven screens (intake, questions, path, step detail, what-if, packet, sources), the stylesheet, hash router, what-if logic (`src/whatif.ts`), example people, the strings for those screens in English and Spanish, and the plain-language `why`/`say` lines in `data/rules.json` | Claude | [Adrian: what you reviewed, rewrote or fixed after the user test] |
| 2026-10-22 | Visual redesign: one typeface (Atkinson Hyperlegible Next), checklist rows, segmented answers, new path and step layouts, three candidate palettes with measured contrast; Adrian chose "Passport" (navy) (`styles.css`, `components.tsx`, the screens, `scripts/contrast.mjs`) | Claude | [Adrian: what you changed] |
| 2026-10-24 | Home screen (the ID loop, how it works, features), clearer path screen (sort explanations, search stats, what-if link), fixes for review findings B4, B5, B6, B8, B10, B11, B12, B13, B14, S2, S4, S6, S7, S15, S16, S20, and the GitHub Pages deploy | Claude | [Adrian: what you reviewed and changed] |
| | | | |
