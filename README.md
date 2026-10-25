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

## Privacy

- **No accounts, no server, no database.** First ID is a static site. The plan is computed in your browser, and nothing you tick or answer is sent anywhere.
- **Nothing is kept after you close the tab.** Your answers sit in the tab's `sessionStorage` so a phone that reloads the page doesn't lose them, and they disappear when the tab closes.
- **Works offline after the first visit.** A service worker ([`public/sw.js`](public/sw.js)) caches the site's own files so it still opens with no signal. It stores no answers.
- **No third-party requests.** Fonts and images are served from the site itself; there are no analytics, trackers or CDNs. The only outside pages are the official sources, which open when you tap them.
- **Enforced on the main site.** [`vercel.json`](vercel.json) sends a Content-Security-Policy that only lets the page load its own files, plus `Referrer-Policy: no-referrer`. (GitHub Pages can't send custom headers, so the mirror relies on the code alone.)

## English and Spanish

The whole app, including the printed packet, works in English and Spanish. It starts in Spanish when the browser's language is Spanish, and the button in the top bar switches at any time. Screen text lives in [`src/i18n.ts`](src/i18n.ts); every rule in `data/rules.json` carries both languages, and the linter fails the build if a rule is missing its Spanish. The Spanish was drafted with AI help and has not yet had a full review by a native speaker.

## Accessibility

- **Keyboard:** every control is a native button or link, so the whole flow works with Tab, Enter and Space, with a visible focus outline. When a new screen opens, focus moves to its heading.
- **Reduced motion:** if your device asks for reduced motion, the animations, the scroll-pinned story, the card tilt and its sheen all switch off. The tilt never runs on touch screens.
- **Text size:** body text is 17px and the smallest text on the home page is 13px. Pinch-zoom and browser zoom are not blocked. Sizes are set in pixels, so the browser's default font-size setting doesn't change them.
- **Contrast:** `npm run contrast` checks the palette against WCAG ratios (4.5:1 for text, 3:1 for control outlines).
- **Spanish:** switching language also switches the page's `lang` attribute, so screen readers read Spanish with a Spanish voice.

We have not yet done a full pass with a screen reader (VoiceOver or TalkBack).

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

On the home page, tap one of the example people (for example Maria) to see a full path without typing anything.

## Deployment

- **Vercel** (https://first-id.vercel.app/) hosts the main site. It installs with `npm ci` and builds with `npm run check`, using the settings and security headers in [`vercel.json`](vercel.json).
- **GitHub Pages** (https://adrian-erlikhman.github.io/FirstID/) is a mirror: [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs `npm run check` on every push to `main` and publishes `dist/` to the `gh-pages` branch.
- **Pull requests** run the same `npm run check` in [`.github/workflows/check.yml`](.github/workflows/check.yml).

A broken rule, a failing test or a type error stops a deploy on either host.

## How rules get verified

The rules were drafted with AI help from the research in [`docs/research/`](docs/research/), so none of them counts as true until a person checks it. Every rule starts as `"verified": false`, and the app shows it as "call ahead" on the path, the step and the packet. To sign one off, a teammate opens every source the rule cites, copies the exact supporting sentence in place of any `TODO` quote, re-checks statutes on leginfo.legislature.ca.gov, checks the rule's requirements, fees and plain-language lines against the source, and only then sets `"verified": true`. The full checklist is in [`CONTRIBUTING.md`](CONTRIBUTING.md#verifying-a-rule).

**Status today, counted from `data/rules.json`: 0 of 11 rules are verified, and 11 of the 23 sources still have a `TODO` in place of their exact quote.** The "How we know" screen shows the same count live.

## Project structure

```
data/rules.json          every rule, document, place and source, in English and Spanish
src/
  engine/
    types.ts             the shared types: rules, documents, plans
    expr.ts              evaluates a rule's requirements
    planner.ts           Dijkstra search for the best path
    lint.ts              checks the rules file (run by scripts/lint-rules.ts)
  screens/               home, what you have, questions, path, step, what-if, packet, how we know
  App.tsx                app state, kept in sessionStorage for the tab
  router.ts              hash routes (#/path, #/step/2, #/example/maria); no personal data in URLs
  whatif.ts              re-plans for each answer that could change
  components.tsx         shared UI pieces, including the source cards
  i18n.ts                every screen string in English and Spanish
  styles.css, motion.ts  look and motion (motion switches off for reduced-motion users)
  fonts/, forms/         self-hosted fonts (with their licence) and the LA County form images
tests/                   planner, persona and UI-logic tests (Vitest)
scripts/                 rules linter and colour-contrast check
public/                  icons and the link-preview image
docs/research/           background research from before the build (AI-compiled leads)
docs/team/               build-week team notes
.github/workflows/       check.yml (pull requests) and pages.yml (deploy to GitHub Pages)
vercel.json              Vercel build and security headers
AI-USE.md                the AI disclosure
```

## Team

Built for the 2026 Congressional App Challenge (California's 37th district) by:

- **Adrian Erlikhman**: the experience: screens, design, Spanish and accessibility
- **Michael Tarekegn**: the rules data, its sources and the hand-worked example plans

How we split the work, review changes and record AI help is in [`CONTRIBUTING.md`](CONTRIBUTING.md). Our build-week notes are in [`docs/team/`](docs/team/).

## AI use

The contest allows AI tools when all AI use is disclosed. We used Anthropic's Claude to research the rules, draft the rules file and the Spanish, write much of the code and the site's design, and review our work. Commits Claude wrote say so in the subject ("AI-generated by Claude") or end with a `Co-Authored-By: Claude` line, and our rule is never to rewrite main's history. The app itself uses no AI. Every AI contribution is logged in **[`AI-USE.md`](AI-USE.md)**, with a column for who reviewed it and what they changed.
