# Tasks: Thu Oct 22 to Sun Oct 25

We submit **Sunday by noon**. The portal closes Monday Oct 26 at 9:00 am PT, and nothing can change after that.

- **Checkpoint, Thu 10 pm:** Maria's path, built from verified rules, is live on the site.
- **Feature freeze, Fri 10 pm.** After this, bug fixes only.

Open one GitHub issue per line and assign it.

## Ryan: planner (`src/engine/`, `tests/planner*`)

**Thursday**
- [ ] Read `planner.ts` until you can explain every line. Keep it and extend it, or rewrite `plan()` yourself against the tests. Either way, log the choice in `AI-USE.md`.
- [ ] **Step order (do this first, it shows on screen).** Dijkstra returns *a* valid order: Maria's path currently shows the shelter's DL 933 as step 3, "around week 4", when it could happen today. Add a pass that puts free, same-day steps first and groups steps at the same place, without breaking any requirement. Add a test.

**Friday**
- [ ] **Waiting in parallel.** Today, days just add up. A mailed birth certificate request shouldn't block steps that don't need it. Model the overlap and test it.
- [ ] **What-if.** `src/whatif.ts` already re-plans once per possible answer change and keeps only the ones that change the path. Review it, move it into `src/engine/` if you'd rather own it there, and add a property test (for example: every toggle it shows really changes the plan).
- [ ] Draft the technical-difficulty answer, in your own words.

**Saturday**
- [ ] Record your 25 seconds: states and moves, why Dijkstra is exact here, and the "more documents never hurts" test.

## Michael: rules (`data/`, `tests/personas*`)

**Thursday** (Maria's path first)
- [ ] For each of these 4 rules:
  - open every source
  - replace each `TODO` quote with the exact sentence
  - re-check statute text on leginfo.legislature.ca.gov (not the mirror sites)
  - check the rule's plain-language `why` and `say` lines (AI-drafted) against the source
  - set `"verified": true`
  - log what changed in `data/CHANGES.md`

  The rules: `program_dl933`, `notary_witnesses`, `rrcc_mail`, `dmv_original`.
- [ ] Email HOPICS, First Place for Youth South LA, and the LAUSD homeless liaison (ask a LACES counselor who it is). Ask for 15 minutes to check five plans.

**Friday**
- [ ] Verify the other 7 rules the same way.
- [ ] Call or check the open questions, and write down who you asked and when:
  - Can LA County issue a birth certificate in person to someone with no photo ID?
  - Does the DMV replace an old ID with no documents?
- [ ] Work Maria, DeShawn, Jayden and Luis **by hand from the sources** before looking at the planner. Update `tests/personas.test.ts`.
- [ ] Run the caseworker review if someone answered.

**Saturday**
- [ ] Record your 20 seconds: how a rule gets verified, plus the review or test results.

## Adrian: experience (`src/screens/`, `src/styles.css`, `src/i18n.ts`) + submission

All seven screens now exist as an AI-drafted first build (logged in `AI-USE.md`), matching the design canvas. Your job is to own them: understand every line, test them on real people, and make the changes that come out of that.

**Thursday**
- [ ] Read every file in `src/screens/` plus `App.tsx`, `router.ts` and `components.tsx` until you can explain them. Change anything you'd do differently.
- [x] **Fonts:** self-hosted in `src/fonts/` (Google Sans Flex, Geist Mono, Shantell Sans; licence in `src/fonts/OFL.txt`). The app makes no third-party requests.
- [ ] **Packet QR code:** add a QR code on the printed page that opens the live site's How-we-know screen, so a clerk can check a rule on the spot.

**Friday**
- [ ] **User test at lunch:** 5–8 LACES students run Maria on their own phones without help. Write down how many finish and what confuses them, then fix the top three. Those fixes are yours, in your own commits.
- [ ] **Spanish:** a native speaker reviews every string in `src/i18n.ts` and every `es` line in `data/rules.json`.
- [ ] **Screen reader pass:** VoiceOver (iPhone) or TalkBack (Android) through Maria's whole path. The automated check (axe) is clean on every screen in light and dark, but a real screen reader test is what counts.
- [ ] Stretch: make it work offline after the first visit (web app manifest + service worker), for people on library or shelter Wi-Fi.

**Saturday**
- [ ] Record the demo on a phone. Edit everyone's segments to about 2:45, add captions, upload to YouTube as **public**.
  Shortcut for recording: open `…/first-id/#/example/maria` to jump straight to Maria's path.

**Sunday by noon**
- [ ] Test the video link while logged out.
- [ ] Fill in every portal answer. All three of you write your own.
- [ ] Add the repo link and the AI disclosure.
- [ ] Submit, then screenshot the confirmation.
- [ ] Tag release `cac-2026`.

## Everyone

- [ ] **Sat:** written answers in your own words. Use only things that actually happened.
- [ ] **Sat:** add a contributors section to the README (who built what), and finish `AI-USE.md`.
- [ ] **Sun:** no rule on Maria's path may still say `verified: false`.
- [ ] **Mon:** each of you completes the CAC exit questionnaire.

## If you fall behind, cut in this order

1. What-if screen (hide its link on the path screen)
2. Spanish
3. QR code and offline mode
4. Fewest-trips and fastest tabs
5. Other-county birth certificate rule

**Never cut:** verified rules on Maria's path, the path screen, step detail with sources, the packet, the video.
