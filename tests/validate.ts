// Checks a plan from the outside, without trusting the planner: replays it
// step by step from the person's papers and recomputes every number. Used by
// tests/every-person.test.ts (a sample) and scripts/check-every-person.ts
// (every person the screens allow).
import { holds } from "../src/engine/expr";
import type { Action, Cost, Mode, Person, Plan, RuleSet, Waiver } from "../src/engine/types";
import { NOT_PAPERS } from "../src/person";
import { withImplied } from "../src/person";

export type Key = [number, number, number, number];
export const ORDER: Record<Mode, (c: Cost) => Key> = {
  cheapest: (c) => [c.dollars, c.trips, c.days, c.steps],
  fewestTrips: (c) => [c.trips, c.dollars, c.days, c.steps],
  fastest: (c) => [c.days, c.trips, c.dollars, c.steps],
};
export const less = (a: Key, b: Key) => { for (let i = 0; i < 4; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

/** The cheapest waiver that applies right now, the way the rules describe it. */
function price(a: Action, have: Set<string>, facts: Person["facts"]): { dollars: number; waiver?: Waiver } {
  let best: { dollars: number; waiver?: Waiver } = { dollars: a.dollars };
  for (const w of a.waivers ?? []) if (w.dollars < best.dollars && holds(w.if, have, facts)) best = { dollars: w.dollars, waiver: w };
  return best;
}

/** Replay a sequence of actions. Returns its cost, or why it can't be done. */
export function replay(rules: RuleSet, person: Person, actions: Action[]): { cost: Cost; ok: true } | { ok: false; why: string } {
  const have = new Set(person.have);
  let at: string | null = null;
  const cost: Cost = { dollars: 0, trips: 0, days: 0, steps: 0 };
  for (const a of actions) {
    if (a.eligible && !holds(a.eligible, have, person.facts)) return { ok: false, why: `${a.id}: not open to this person` };
    if (!holds(a.requires, have, person.facts)) return { ok: false, why: `${a.id}: needs something they don't have yet` };
    if (a.produces.every((d) => have.has(d))) return { ok: false, why: `${a.id}: gains nothing` };
    const inPerson = rules.places[a.place]?.inPerson ?? true;
    cost.dollars += price(a, have, person.facts).dollars;
    cost.trips += inPerson && at !== a.place ? 1 : 0;
    cost.days += a.days;
    cost.steps += 1;
    at = inPerson && a.days === 0 ? a.place : null;
    a.produces.forEach((d) => have.add(d));
  }
  return have.has(rules.goal) ? { ok: true, cost } : { ok: false, why: "never reaches the ID card" };
}

/** Everything wrong with this plan for this person (empty = a good plan). */
export function problems(rules: RuleSet, person: Person, mode: Mode, p: Plan): string[] {
  const errs: string[] = [];
  const have = new Set(person.have);
  let at: string | null = null;
  let days = 0;
  if (!p.steps.length) errs.push("a plan with no steps");
  p.steps.forEach((st, i) => {
    const a = st.action;
    const n = `step ${i + 1} (${a.id})`;
    if (p.steps.findIndex((x) => x.action.id === a.id) !== i) errs.push(`${n} appears twice`);
    if (a.eligible && !holds(a.eligible, have, person.facts)) errs.push(`${n} isn't open to this person`);
    if (!holds(a.requires, have, person.facts)) errs.push(`${n} comes before what it needs`);
    if (a.produces.every((d) => have.has(d))) errs.push(`${n} gains nothing`);
    const pr = price(a, have, person.facts);
    if (st.dollars !== pr.dollars) errs.push(`${n} costs $${st.dollars}, the rules say $${pr.dollars}`);
    if (st.waiver !== pr.waiver) errs.push(`${n} shows the wrong fee waiver`);
    if (st.dollars < 0 || st.dollars > a.dollars) errs.push(`${n} price out of range`);
    const inPerson = rules.places[a.place]?.inPerson ?? true;
    if (st.newTrip !== (inPerson && at !== a.place)) errs.push(`${n} trip count is wrong`);
    if (st.startDay !== days) errs.push(`${n} starts on the wrong day`);
    days += a.days;
    if (st.endDay !== days) errs.push(`${n} ends on the wrong day`);
    at = inPerson && a.days === 0 ? a.place : null;
    a.produces.forEach((d) => have.add(d));
  });
  if (!have.has(rules.goal)) errs.push("the plan never reaches the ID card");
  const r = replay(rules, person, p.steps.map((s) => s.action));
  if (!r.ok) errs.push(`replay failed: ${r.why}`);
  else if (JSON.stringify(r.cost) !== JSON.stringify(p.total)) errs.push(`totals ${JSON.stringify(p.total)} but the steps add up to ${JSON.stringify(r.cost)}`);
  if (p.mode !== mode) errs.push(`plan says mode ${p.mode}, asked for ${mode}`);
  // No wasted step: leaving any one out never gives a valid, better plan.
  for (let i = 0; i < p.steps.length; i++) {
    const rest = p.steps.filter((_, j) => j !== i).map((s) => s.action);
    const alt = replay(rules, person, rest);
    if (alt.ok && less(ORDER[mode](alt.cost), ORDER[mode](p.total))) errs.push(`step ${i + 1} (${p.steps[i].action.id}) is unnecessary`);
  }
  return errs;
}

/** The best possible cost by trying every order of steps (no planner). */
export function bruteBest(rules: RuleSet, person: Person, mode: Mode): Key | null {
  let best: Key | null = null;
  const order = ORDER[mode];
  const walk = (have: Set<string>, at: string | null, cost: Cost, used: Set<string>) => {
    const k = order(cost);
    if (best && !less(k, best)) return; // every component only grows, so this can't win
    if (have.has(rules.goal)) { best = k; return; }
    for (const a of rules.actions) {
      if (used.has(a.id) || a.produces.every((d) => have.has(d))) continue;
      if (a.eligible && !holds(a.eligible, have, person.facts)) continue;
      if (!holds(a.requires, have, person.facts)) continue;
      const inPerson = rules.places[a.place]?.inPerson ?? true;
      const next = new Set(have); a.produces.forEach((d) => next.add(d));
      walk(next, inPerson && a.days === 0 ? a.place : null, {
        dollars: cost.dollars + price(a, have, person.facts).dollars,
        trips: cost.trips + (inPerson && at !== a.place ? 1 : 0),
        days: cost.days + a.days,
        steps: cost.steps + 1,
      }, new Set([...used, a.id]));
    }
  };
  walk(new Set(person.have), null, { dollars: 0, trips: 0, days: 0, steps: 0 }, new Set());
  return best;
}

// ---- Every person the screens allow ----------------------------------------

export const BORN = ["la_county", "california", "us_state", "abroad"] as const;
export const AGES: (number | undefined)[] = [16, 19, 30, 62, undefined]; // one per band, or skipped
export const YES_NO = ["unhoused", "fireSurvivor", "hasWitnesses", "publicAssistance", "fosterYouth"];
const ANSWERS = [true, false, undefined]; // undefined = "Not sure" or skipped

/** How many people there are: birthplace x age x five yes/no/not sure x any set of intake papers. */
export function spaceSize(intake: string[]) { return BORN.length * AGES.length * 3 ** YES_NO.length * 2 ** intake.length; }

/** Person number i of the whole space, built the way the app builds one. */
export function personAt(i: number, intake: string[]): Person {
  let k = i;
  const papersMask = k % 2 ** intake.length; k = Math.floor(k / 2 ** intake.length);
  const answers = k % 3 ** YES_NO.length; k = Math.floor(k / 3 ** YES_NO.length);
  const age = AGES[k % AGES.length]; k = Math.floor(k / AGES.length);
  const born = BORN[k % BORN.length];
  const facts: Person["facts"] = { born };
  if (age !== undefined) facts.age = age;
  let a = answers;
  for (const f of YES_NO) { const v = ANSWERS[a % 3]; a = Math.floor(a / 3); if (v !== undefined) facts[f] = v; }
  const have = intake.filter((_, j) => papersMask & (1 << j));
  return { facts, have: withImplied(have) };
}

/** The papers on the Have screen, in the rules' order. */
export const intakeOf = (rules: RuleSet) => Object.keys(rules.docs).filter((d) => rules.docs[d].askAtIntake || NOT_PAPERS.includes(d));
