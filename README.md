# First ID

**The shortest legal path to a California ID in LA County, with the official rule behind every step. In English and Spanish.**

**Live site: https://first-id.vercel.app/** (mirror on GitHub Pages: https://adrian-erlikhman.github.io/FirstID/)

First ID is for people in LA County who need a California ID card and don't have the documents to get one, and for the caseworkers who help them:

- people without housing, including people staying in shelters
- people who lost their documents in the January 2025 LA fires
- young people in or leaving foster care
- people leaving jail (there is no reentry-specific rule yet, so their path uses the general rules)
- caseworkers, shelter staff and counselors working through the process with any of them

You tick the documents you still have and answer seven short questions. First ID works out the cheapest legal way to an ID from there: each step, where to go, what to bring, what it costs after fee waivers, what to say at the counter, and the official source that allows it. It prints the whole path as a one-page packet to carry to each office.

This is not legal advice. Rules change, and the app marks every rule our team has not yet checked against its source.

## The problem: the ID loop

To get a California ID, the DMV wants proof of identity, usually a birth certificate. To order a certified birth certificate from LA County by mail, you need a notarized Certificate of Identity. To get something notarized, the notary needs to see your ID. Someone who has lost every document is stuck inside that circle.

There are legal ways out, and several are free, but each one lives with a different office: a shelter or nonprofit that can sign the DMV's no-fee form (DL 933), a social worker who can sign a free birth certificate affidavit, two credible witnesses who can vouch for you in front of a notary (California Civil Code 1185), the Social Security office, the county recorder and the DMV. First ID puts those rules in one place and works out which ones apply to you, in what order.

## How it works

```
data/rules.json ──► npm run lint:rules ──► planner (in the browser) ──► path, steps, packet
 11 rules, fees,     fails the build if a     Dijkstra over the set of    every step links
 waivers, sources    rule has no source       documents you hold          to its source
```

1. **The rules are data, not code.** [`data/rules.json`](data/rules.json) holds every rule First ID knows: what it requires, which documents it gives you, the fee, the fee waivers, how long it takes, where it happens, what to bring and say, and the official sources behind it, in English and Spanish.
2. **A linter guards the rules.** [`src/engine/lint.ts`](src/engine/lint.ts) fails the build if a rule has no source, names an unknown document or place, has a waiver that costs more than the fee, is missing a Spanish line, or has a requirement of the form "you must not have document X" (which would break the guarantee below).
3. **The planner is a deterministic search.** [`src/engine/planner.ts`](src/engine/planner.ts) treats your situation as a state (the documents you hold) and each rule as a move that adds documents. Because moves only ever add documents, Dijkstra's algorithm finds the exact best sequence that ends with a California ID. "Cheapest" compares dollars, then trips, then days, then steps; the path screen can also sort by fewest trips or fastest. The same answers always give the same path.
4. **Every step cites its source.** Each step shows the rule's official pages (DMV, LA County Registrar-Recorder, California statutes, Social Security) with the exact sentence that supports it (or a note that we haven't copied it yet) and, once a person has verified the rule, the date they checked it. The "How we know" screen lists every rule and source.
5. **What-if.** The app re-plans once for each answer you could change and shows only the changes that would alter your path.
6. **When there is no path** with the rules we have, it says so and lists who can help today, instead of guessing.

The tests ([`tests/`](tests/)) check the planner on toy rules, check four invented people against plans worked out by hand from the sources, and check one guarantee on the real rules: having more documents never makes your plan worse. `npm run check` runs the rules lint, the tests, the type check and the build, and nothing deploys unless it passes.

## What's real and what's made up

- **The people in the examples are invented.** Maria, DeShawn, Jayden and Luis (in [`tests/personas.ts`](tests/personas.ts)) are made up to show different situations, and the same people drive both the app's examples and the persona tests. They carry no real person's address, birthdate or document numbers.
- **The rules are real but not yet verified.** Every rule points at a real official page or statute, but they were drafted with AI help from research notes, and a rule only counts as verified once a teammate has opened its sources and signed it off (see [How rules get verified](#how-rules-get-verified)). Until then the app labels it "call ahead".
- **The forms are real.** The home page and steps show LA County's blank Application for Birth Record and Certificate of Identity, with our highlights on the lines that matter.
- **The app uses no AI.** Plans come from the deterministic planner over `data/rules.json`. How we used AI to build it is in [`AI-USE.md`](AI-USE.md).

**New to the repo? Read `docs/team/START-HERE.md` first.**

## Run it

```bash
npm install
npm run dev     # local site
npm run check   # rules lint + tests + build (CI runs this on pull requests and on every push to main)
```

## Team

See `CONTRIBUTING.md` for who owns what and `docs/team/TASKS.md` for this week's work. Research leads are in `docs/research/`.
