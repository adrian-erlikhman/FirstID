// Every person the screens allow (about 5 million: birthplace x age band or
// skipped x yes / no / not sure on five questions x any set of the intake
// papers), in all three sorts. For each one: the plan is valid step by step,
// adds up and wastes nothing, or there is no plan and the screen has a note
// saying what is blocking; a path exists in one sort exactly when it does in
// the others; "Not sure" gives the same path as "No". Every 97th person is also
// checked against a brute-force search of every order of steps, and every 11th
// person's "Can't do this step?" paths are checked too.
//
//   npx tsx scripts/check-every-person.ts          # all of it (a few minutes per part)
//   npx tsx scripts/check-every-person.ts 2/4      # one quarter, to run four at once
import rulesJson from "../data/rules.json";
import { plan } from "../src/engine/planner";
import type { Person, RuleSet } from "../src/engine/types";
import { MODES, noPathNotes, samePlan, withoutSteps } from "../src/whatif";
import { ORDER, YES_NO, bruteBest, intakeOf, less, personAt, problems, spaceSize } from "../tests/validate";

const rules = rulesJson as unknown as RuleSet;
const intake = intakeOf(rules);
const N = spaceSize(intake);
const [part, parts] = (process.argv[2] ?? "1/1").split("/").map(Number);
const from = Math.floor(((part - 1) * N) / parts), to = Math.floor((part * N) / parts);

const failures: string[] = [];
const fail = (msg: string, p: Person) => { if (failures.length < 50) failures.push(`${msg} :: ${JSON.stringify(p)}`); else failures.length++; };
let people = 0, plans = 0, dead = 0, brute = 0, cantDo = 0;
const t0 = Date.now();

for (let i = from; i < to; i++) {
  const person = personAt(i, intake);
  people++;
  const found = MODES.map((mode) => {
    const p = plan(rules, person, mode);
    if (p) { plans++; for (const e of problems(rules, person, mode, p)) fail(`${mode}: ${e}`, person); }
    if (i % 97 === 0) {
      brute++;
      const best = bruteBest(rules, person, mode);
      if (JSON.stringify(p ? ORDER[mode](p.total) : null) !== JSON.stringify(best)) fail(`${mode}: not the best path (brute force found ${JSON.stringify(best)})`, person);
    }
    return p;
  });
  if (new Set(found.map((p) => p !== null)).size !== 1) fail("a path in one sort but not another", person);
  const cheapest = found[0];
  if (!cheapest) {
    dead++;
    if (!noPathNotes(rules, person).length) fail("no path and no note saying why", person);
  }
  // "Not sure" counts as No: compare with the same person answering No.
  for (const f of YES_NO) {
    if (person.facts[f] !== undefined) continue;
    if (!samePlan(cheapest, plan(rules, { ...person, facts: { ...person.facts, [f]: false } }, "cheapest"))) fail(`"Not sure" on ${f} differs from No`, person);
  }
  if (cheapest && i % 11 === 0) {
    for (const st of cheapest.steps) {
      cantDo++;
      const live = withoutSteps(rules, [st.action.id]);
      const alt = plan(live, person, "cheapest");
      if (!alt) continue;
      if (alt.steps.some((x) => x.action.id === st.action.id)) fail(`can't do ${st.action.id}: the other path still uses it`, person);
      for (const e of problems(live, person, "cheapest", alt)) fail(`can't do ${st.action.id}: ${e}`, person);
      if (less(ORDER.cheapest(alt.total), ORDER.cheapest(cheapest.total))) fail(`can't do ${st.action.id}: the other path is cheaper than the best`, person);
    }
  }
  if (people % 250000 === 0) console.error(`part ${part}/${parts}: ${people} people, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

console.log(JSON.stringify({ part: `${part}/${parts}`, people, plans, deadEnds: dead, bruteForceChecks: brute * 3, cantDoChecks: cantDo, failures: failures.length, seconds: Math.round((Date.now() - t0) / 1000) }));
for (const f of failures.slice(0, 50)) console.log("FAIL", f);
process.exit(failures.length ? 1 : 0);
