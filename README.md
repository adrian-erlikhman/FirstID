# First ID

**The cheapest legal path to a California ID card in LA County, with the source for every step. In English and Spanish.**

**Live: https://first-id.vercel.app/** (mirror: https://adrian-erlikhman.github.io/FirstID/)

For people in LA County who need an ID and don't have the documents to get one: people without housing, people who lost their papers in the January 2025 fires, young people in or leaving foster care, people leaving jail (on the general rules, since none is specific to reentry yet), and the caseworkers who help them.

Tick the documents you still have and answer seven questions. First ID works out the cheapest legal order of steps: where to go, what to bring, what it costs after fee waivers, what to say at the counter, and the source that allows it. A step's "say this" line can be shown full screen to a clerk or read aloud, DMV steps list nearby offices, the whole path prints on one page, and you can tick steps off and add calendar reminders as you go.

Not legal advice. Rules change, and every rule our team hasn't yet checked against its source is marked "call ahead".

## The problem: the ID loop

To get a California ID, the DMV wants proof of identity, usually a birth certificate. To order a certified birth certificate from LA County by mail, you need a notarized Certificate of Identity. To get something notarized, the notary needs to see your ID. Someone who has lost every document is stuck inside that circle.

There are legal ways out, and several are free, but each one lives with a different office: a shelter or nonprofit that can sign the DMV's no-fee form (DL 933), a social worker who can sign a free birth certificate affidavit, two credible witnesses who can vouch for you in front of a notary (California Civil Code 1185), the Social Security office, the county recorder and the DMV. First ID puts those rules in one place and works out which ones apply to you, in what order.

## How it works

```
data/rules.json ──► npm run lint:rules ──► planner (in the browser) ──► path, steps, packet
 11 rules, fees,     fails the build if a     Dijkstra over the set of    every step links
 waivers, sources    rule has no source       documents you hold          to its source
```

1. **Rules are data.** [`data/rules.json`](data/rules.json) holds each rule's requirements, the documents it gives you, fees, fee waivers, time, place, what to bring and say, and its sources, in English and Spanish.
2. **A linter guards them.** [`src/engine/lint.ts`](src/engine/lint.ts) fails the build if a rule has no source, names an unknown document or place, or is missing its Spanish.
3. **The planner is exact.** [`src/engine/planner.ts`](src/engine/planner.ts) runs Dijkstra's algorithm over the documents you hold. No step costs less than zero, so it finds the exact best order: fewest dollars, then trips, then days, then steps. Rules only ever add documents, so having more can never make your plan worse, and the same answers always give the same path.
4. **Every step cites its source** and quotes the sentence that supports it; we check each quote against its source when we verify the rule. The "How we know" screen lists every rule with its sources; a fee waiver's sources show on the step where it applies.
5. **What-if and dead ends.** The app shows which answers would change your path, and when there's no path it says what's blocking it and who can help.

The tests ([`tests/`](tests/)) cover the planner, four invented people checked against hand-worked plans, the "more documents never hurts" guarantee, the what-if and no-path logic, the links between screens, the office list and the progress logic. `npm run check` runs all of it plus the build, and nothing deploys unless it passes.

## What's real and what's made up

- **The people are invented.** Maria (on the home page) and three others in [`tests/personas.ts`](tests/personas.ts) carry no real names, addresses or document numbers.
- **The rules are real but not yet verified.** Each cites a government page or statute, but they were drafted with AI help, so each stays "call ahead" until a teammate checks it ([how](#how-rules-get-verified)).
- **The documents and office list are real.** LA County's blank forms, the state's published samples ([sources](src/docs/README.md)), and 26 DMV field offices from the DMV's own data ([`data/offices.json`](data/offices.json)), each with its source and check date. The DMV's DL 933 is never shown, because the DMV says it must not be shared online.
- **The app uses no AI.** Plans come from the planner. How we used AI to build it is in [`AI-USE.md`](AI-USE.md).

## Privacy

First ID is a static site with no accounts, server or database. Your answers stay in the tab and are gone when you close it; the ZIP you type for offices is never saved. Ticked steps and your text-size choice stay on the phone until you clear them (Start over clears the ticks too), calendar reminders are made on the phone, and Read aloud uses only the phone's own voices, never an online one. There are no analytics or third-party requests, [`vercel.json`](vercel.json) enforces that with a Content-Security-Policy, and a service worker ([`public/sw.js`](public/sw.js)) keeps the site working offline without storing any answers.

## Spanish and accessibility

- The whole app, including the packet, works in English and Spanish, and the linter fails the build if a rule is missing its Spanish. The Spanish was drafted with AI help and hasn't had a full native-speaker review yet.
- Everything works by keyboard with a visible focus ring; there's a text-size control; motion switches off for reduced-motion users, with Data Saver on, and on phones with 2 GB of memory or less; `npm run contrast` checks colour contrast, and `scripts/a11y-audit.js` runs axe-core plus 16px-text and 44px-tap-target checks on every screen in both languages. We haven't yet done a full screen-reader pass.

## Run it locally

You need Node.js (CI uses version 22) and npm.

```bash
git clone https://github.com/adrian-erlikhman/FirstID.git
cd FirstID
npm install
npm run dev       # start the local site and open the URL it prints
npm run check     # rules lint + tests + type check + production build
```

To see a full path without typing anything, open `#/example/maria`.

Vercel builds the main site from `vercel.json`; GitHub Pages builds the mirror from [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Both run `npm run check`, so a broken rule or failing test never deploys.

## How rules get verified

A teammate opens every source a rule cites, checks that each quoted sentence appears in the source, re-checks statutes on leginfo.legislature.ca.gov, checks the rule's fees and plain-language lines, and only then sets `"verified": true` ([checklist](CONTRIBUTING.md#verifying-a-rule)). What each check changed goes in [`data/CHANGES.md`](data/CHANGES.md). The "How we know" screen shows how many rules are verified so far. Found a rule that's wrong? [Report it](https://github.com/adrian-erlikhman/FirstID/issues/new?template=wrong-rule.yml).

## Project structure

```
data/          rules, DMV offices and ZIP centres, each with sources
src/engine/    types, rule linter and the planner (Dijkstra)
src/screens/   every screen, from home to the printed packet
src/           app state, routes, what-if, progress, strings (EN/ES), styles
tests/         planner, persona, what-if, no-path, packet, translation, rules-data, office and progress tests (Vitest)
public/        icons, manifest and the offline service worker
scripts/       the rule linter's command line, the colour contrast check and a browser accessibility audit
docs/          background research and team notes
```

## License

Our code is under the [MIT License](LICENSE). That doesn't cover what we didn't make: the fonts in `src/fonts/` keep their SIL Open Font License ([`OFL.txt`](src/fonts/OFL.txt)), LA County's blank forms in `src/forms/` come from lavote.gov, and the state's samples in `src/docs/` are listed with their sources in [`src/docs/README.md`](src/docs/README.md).

## Contributing and AI use

How we work, verify rules and record AI help is in [`CONTRIBUTING.md`](CONTRIBUTING.md). The contest allows AI tools when all use is disclosed: we used Anthropic's Claude for research, drafting the rules and Spanish, much of the code and design, and review. Every AI contribution is logged in **[`AI-USE.md`](AI-USE.md)**, Claude's commits are labeled, and we never rewrite history. The app itself uses no AI.
