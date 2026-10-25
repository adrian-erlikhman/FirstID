# First ID

**The shortest legal path to a California ID, with a source for every step.**

To get a California ID you need a birth certificate. To get a birth certificate you usually need an ID. People who have lost everything get stuck in that loop: people without a home, fire survivors, people leaving jail or foster care. There are legal ways out, and most are free, but they're spread across the DMV, the county, the state health department and Social Security.

First ID asks what you have and seven questions, then compares every legal path it knows and shows the best one: each step, where to go, what to bring, the cost after fee waivers, and the official rule behind it. Then it prints a one-page packet.

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

See `CONTRIBUTING.md` for who owns what and `TASKS.md` for this week's work. Research leads are in `docs/research/`.

This is not legal advice. Rules change, and every rule shows whether our team has verified it yet.

**Live site:** https://first-id.vercel.app (Vercel; a copy also runs on GitHub Pages at https://adrian-erlikhman.github.io/FirstID/)
