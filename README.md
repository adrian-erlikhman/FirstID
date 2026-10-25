# First ID

**The cheapest legal path to a California ID card in LA County, with the source for every step. In English and Spanish.**

**Live: https://first-id.vercel.app/** (mirror: https://adrian-erlikhman.github.io/FirstID/)

For people in LA County who need an ID and don't have the documents to get one: people without housing, people who lost their papers in the January 2025 fires, young people in or leaving foster care, people leaving jail, and the caseworkers who help them.

Tick the documents you still have and answer seven questions. First ID works out the cheapest legal order of steps: where to go, what to bring, what it costs after fee waivers, what to say at the counter, and the source that allows it. Any step can be shown full screen to a clerk or read aloud, DMV steps list nearby offices, the whole path prints on one page, and you can tick steps off and add calendar reminders as you go.

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
3. **The planner is exact.** [`src/engine/planner.ts`](src/engine/planner.ts) runs Dijkstra's algorithm over the set of documents you hold, so it finds the best order of steps by cost, then trips, then days. Rules only ever add documents, so having more can never make your plan worse, and the same answers always give the same path.
4. **Every step cites its source**, with the exact supporting sentence once we've copied it. The "How we know" screen lists them all.
5. **What-if and dead ends.** The app shows which answers would change your path, and when there's no path it says what's blocking it and who can help.

The tests ([`tests/`](tests/)) cover the planner, four invented people checked against hand-worked plans, the "more documents never hurts" guarantee, the office list and the progress logic. `npm run check` runs all of it plus the build, and nothing deploys unless it passes.

## What's real and what's made up

- **The people are invented.** Maria (on the home page) and three others in [`tests/personas.ts`](tests/personas.ts) carry no real names, addresses or document numbers.
- **The rules are real but not yet verified.** Each cites a government page or statute, but they were drafted with AI help, so each stays "call ahead" until a teammate checks it ([how](#how-rules-get-verified)).
- **The documents and office list are real.** LA County's blank forms, the state's published samples ([sources](src/docs/README.md)), and 26 DMV field offices from the DMV's own data ([`data/offices.json`](data/offices.json)), each with its source and check date. The DMV's DL 933 is never shown, because the DMV says it must not be shared online.
- **The app uses no AI.** Plans come from the planner. How we used AI to build it is in [`AI-USE.md`](AI-USE.md).

## Privacy

First ID is a static site with no accounts, server or database. Your answers stay in the tab and are gone when you close it; the ZIP you type for offices is never saved. Ticked steps and your text-size choice stay on the phone until you clear them, and calendar reminders are made on the phone. There are no analytics or third-party requests, [`vercel.json`](vercel.json) enforces that with a Content-Security-Policy, and a service worker ([`public/sw.js`](public/sw.js)) keeps the site working offline without storing any answers.

## Spanish and accessibility

- The whole app, including the packet, works in English and Spanish, and the linter fails the build if a rule is missing its Spanish. The Spanish was drafted with AI help and hasn't had a full native-speaker review yet.
- Everything works by keyboard with a visible focus ring; there's a text-size control; motion switches off for reduced-motion users; `npm run contrast` checks colour contrast. We haven't yet done a full screen-reader pass.

## Run it locally

You need Node.js (CI uses version 22) and npm.

```bash
git clone https://github.com/adrian-erlikhman/FirstID.git
cd FirstID
npm install
npm run dev       # start the local site and open the URL it prints
npm run check     # rules lint + tests + type check + production build
```

Other scripts: `npm test` runs only the tests, `npm run lint:rules` only the rules linter, `npm run build` only the type check and build, and `npm run contrast` checks the colour contrast ratios used in `src/styles.css`.

To see a full path without typing anything, tap "See Maria's path" on the home page, or open `#/example/maria`.

## Deployment

- **Vercel** (https://first-id.vercel.app/) hosts the main site. It installs with `npm ci` and builds with `npm run check`, using the settings and security headers in [`vercel.json`](vercel.json).
- **GitHub Pages** (https://adrian-erlikhman.github.io/FirstID/) is a mirror: [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs `npm run check` on every push to `main` and publishes `dist/` to the `gh-pages` branch.
- **Pull requests** run the same `npm run check` in [`.github/workflows/check.yml`](.github/workflows/check.yml).

A broken rule, a failing test or a type error stops a deploy on either host.

## How rules get verified

The rules were drafted with AI help from the research in [`docs/research/`](docs/research/), so none of them counts as true until a person checks it. Every rule starts as `"verified": false`, and the app shows it as "call ahead" on the path, the step and the packet. To sign one off, a teammate opens every source the rule cites, copies the exact supporting sentence in place of any `TODO` quote, re-checks statutes on leginfo.legislature.ca.gov, checks the rule's requirements, fees and plain-language lines against the source, and only then sets `"verified": true`. The full checklist is in [`CONTRIBUTING.md`](CONTRIBUTING.md#verifying-a-rule).

**Status today, counted from `data/rules.json`: 0 of 11 rules are verified, and 11 of the 23 sources still have a `TODO` in place of their exact quote.** The "How we know" screen shows the same count live.

Found a rule that's wrong or out of date? [Report it with the rule form](https://github.com/adrian-erlikhman/FirstID/issues/new?template=wrong-rule.yml), with the source and the date you checked it.

## Project structure

```
data/
  rules.json             every rule, document, place and source, in English and Spanish
  offices.json           LA County DMV field offices, each with its source and check date
  zip-centroids.json     ZIP code centres for sorting offices by distance
src/
  engine/
    types.ts             the shared types: rules, documents, plans
    expr.ts              evaluates a rule's requirements
    planner.ts           Dijkstra search for the best path
    lint.ts              checks the rules file (run by scripts/lint-rules.ts)
  screens/               home, what you have, questions, path, step, what-if, offices, packet, how we know
  App.tsx                app state, kept in sessionStorage for the tab
  router.ts              hash routes (#/path, #/step/2, #/example/maria); no personal data in URLs
  whatif.ts              re-plans for each answer that could change
  examples.ts            the invented people, built from tests/personas.ts
  offices.ts             loads the office list and sorts it by ZIP
  progress.ts            step ticks and calendar reminders (.ics), built on the device
  components.tsx         shared UI pieces, including the source cards and the text-size control
  i18n.ts                every screen string in English and Spanish
  styles.css, motion.ts  look and motion (motion switches off for reduced-motion users)
  fonts/                 self-hosted fonts, with their licence
  forms/, docs/          LA County's forms and the state's sample documents, with their sources
tests/                   planner, persona, office, progress and UI-logic tests (Vitest)
scripts/                 rules linter and colour-contrast check
public/                  icons, link-preview image, web app manifest, offline service worker
docs/research/           background research from before the build (AI-compiled leads)
docs/team/               build-week notes: repo setup and the task list
.github/workflows/       check.yml (pull requests) and pages.yml (deploy to GitHub Pages)
.github/ISSUE_TEMPLATE/  the "report a wrong or outdated rule" form
vercel.json              Vercel build and security headers
AI-USE.md                the AI disclosure
```

## Contributing

How we review changes, verify rules and record AI help is in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## AI use

The Congressional App Challenge allows AI tools when all AI use is disclosed. We used Anthropic's Claude to research the rules, draft the rules file and the Spanish, write much of the code and the site's design, and review our work. Commits Claude wrote say so in the subject ("AI-generated by Claude") or end with a `Co-Authored-By: Claude` line, and our rule is never to rewrite main's history. The app itself uses no AI. Every AI contribution is logged in **[`AI-USE.md`](AI-USE.md)**, with a column for who reviewed it and what they changed.
