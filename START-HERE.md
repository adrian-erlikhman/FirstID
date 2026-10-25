# Start here

The site is live at **https://first-id.vercel.app** (Vercel project `adrian-2443/first-id`), with a copy on GitHub Pages at https://adrian-erlikhman.github.io/FirstID/. Both build with `npm run check`, so nothing goes live unless the rules lint, the tests and the build all pass. Vercel's settings are in `vercel.json`, including a Content-Security-Policy header that stops the browser from contacting any server but ours.

The repo is `adrian-erlikhman/FirstID`. The scaffold is one commit authored by Claude, labeled as AI-generated. It's the honest record of what AI wrote; everything after it is yours.

## Adrian (repo owner, one time, about 10 minutes)

1. **Settings > Pages:** Source is **Deploy from a branch**, branch **gh-pages**, folder **/ (root)**. The `deploy` workflow builds the site and pushes it to `gh-pages`; don't edit that branch by hand.
2. **Settings > Collaborators:** invite Ryan and Michael.
3. In the Congressional App Challenge portal: confirm the district is **CA-37**, and that all three of you are on the team with completed profiles (personal emails, not LAUSD).

## Everyone

```bash
git clone https://github.com/adrian-erlikhman/FirstID.git
cd FirstID
npm install
npm run check      # should print: rules lint OK, 30 tests passed, build OK
npm run dev        # open the local URL and tap "See an example: Maria" on the home screen,
                   # or answer for her: Medi-Cal card + "I know my SSN", LA County,
                   # shelter yes, fire yes, witnesses yes
```

Then branch for your first task: `git checkout -b ryan/step-order`, `git checkout -b michael/verify-rules` or `git checkout -b adrian/fonts`.

## Every change after today

- Work on a branch, open a pull request, a teammate reviews it, then merge with **"Create a merge commit"** (not squash, so every commit keeps its real author). `npm run check` must pass (CI runs it).
- Commit under your own GitHub account. If AI helped, say so in the commit message and add a line to `AI-USE.md`.
- Never rewrite history.

What each of you builds, day by day: `TASKS.md`.
