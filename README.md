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

To get a California ID, the DMV wants proof of identity, usually a birth certificate. To order a certified birth certificate from LA County by mail, you need a notarized Certificate of Identity. To get something notarized, the notary needs to see your ID. Someone who has lost everything can go around that circle for weeks.

There are legal ways out, and several are free, but each one lives with a different office: a shelter or nonprofit that can sign the DMV's no-fee form (DL 933), a social worker who can sign a free birth certificate affidavit, two credible witnesses who can vouch for you in front of a notary (California Civil Code 1185), the Social Security office, the county recorder and the DMV. First ID puts those rules in one place and works out which ones apply to you, in what order.

## How it works

```
data/rules.json ──► lint (CI) ──► planner (in your browser) ──► your path + packet
   rules, fees,       every rule       Dijkstra over "what you      every step links
   waivers, sources   has a source     hold" states                 to its source
```

- **Rules are data, not code.** Each rule says what it requires, what it gives you, what it costs, which waivers apply and which official page says so. Every rule starts as `verified: false` and shows "call ahead" until a teammate checks it against the source and signs it off. The rules were drafted with AI help; none counts as verified until a person checks it.
- **The planner is a search, not a guess.** Your situation is a state (the documents you hold). Each rule is a move. Dijkstra's algorithm finds the cheapest sequence of moves that ends with an ID, counting dollars, then trips, then days. Same answers every time.
- **Guarantee, tested in CI:** having more documents can never make your plan worse. The test tries adding every document to every persona.
- **Private by design.** It's a static site. Nothing you enter leaves your phone, and there's no account and no database.
- **No AI in the app.** See `AI-USE.md` for how we used AI to build it.

**New to the repo? Read `docs/team/START-HERE.md` first.**

## Run it

```bash
npm install
npm run dev     # local site
npm run check   # rules lint + tests + build (CI runs this on pull requests and on every push to main)
```

## Team

See `CONTRIBUTING.md` for who owns what and `docs/team/TASKS.md` for this week's work. Research leads are in `docs/research/`.
