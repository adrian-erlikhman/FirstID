# Research notes

Background research from Oct 18, 2026, the week before we started building. Claude research agents compiled these notes (logged in [`AI-USE.md`](../../AI-USE.md)). They are leads, not facts: nothing here goes into `data/rules.json` until a teammate re-checks it against the primary source (leginfo.legislature.ca.gov for statutes, dmv.ca.gov, lavote.gov, cdph.ca.gov, ssa.gov). Several sources could not be loaded during research, and each file says which.

## First ID

| File | What it covers |
|---|---|
| [`first_id_rules.md`](first_id_rules.md) | 16 rule questions (ID and residency documents, LA County birth certificates, notary witnesses, DL 933 and DL 937, AB 1733, fees, foster youth, reentry, out-of-state births, Social Security, Safe at Home), each with sources, a confidence level and what is still unconfirmed. The starting point for `data/rules.json`. |
| [`first_id_landscape.md`](first_id_landscape.md) | Existing tools and guides, the size of the problem, local partners and testers, fit with Rep. Kamlager-Dove's priorities, and where location data could come from. |

## The contest

| File | What it covers |
|---|---|
| [`cac_implementations.md`](cac_implementations.md) | How past Congressional App Challenge winners were built (stack, size, tests, git history, video structure) and the 2026 rules that matter. |

## Ideas we considered and set aside

| File | What it covers |
|---|---|
| [`ca37_ideas.md`](ca37_ideas.md) | A profile of California's 37th district and eight other candidate app ideas (PlugWatch, ShadeStop, FreshReach and more), ranked. |
| [`relay.md`](relay.md) | An assessment of "Relay", a typed calling assistant for people with speech disabilities: prior art, cost, legal limits and why we did not build it. |

Lines marked `[judgment]`, `[UNCONFIRMED]`, `[unverified]`, `[CALC]` or `[GAP]` are the research agent's own analysis or unconfirmed leads, not sourced facts.
