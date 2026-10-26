import { holds } from "./expr";
import type { Action, Cost, DocId, Mode, Person, Plan, RuleSet, Step, Waiver } from "./types";

/**
 * First ID's planner.
 *
 * A person's situation is a STATE: the set of documents they hold, plus where
 * they are standing if the last step was a same-day visit. Each rule is an
 * ACTION that can fire when its requirements hold, and adds documents to the
 * state. We want the cheapest sequence of actions that reaches the goal
 * document (a California ID card).
 *
 * That is a classical planning problem (the STRIPS model, 1971). No step costs
 * less than zero, so Dijkstra's algorithm over states finds the exact optimum.
 * Costs are compared lexicographically, so "cheapest" means fewest dollars,
 * then fewest trips, then fewest days, then fewest steps.
 *
 * Because every action only ever ADDS documents, holding more documents can
 * never make the plan worse. The "more documents never hurts" tests check that
 * on toy rules (tests/planner.test.ts) and on the real rules
 * (tests/personas.test.ts).
 *
 * No AI is involved. The same inputs always give the same plan, and every step
 * carries the sources that justify it.
 */

// Last tie-break is the number of steps: without it, a free same-visit step
// that achieves nothing costs "zero" and can sneak into a plan. (The DeShawn
// persona test caught exactly that.)
type Key = [number, number, number, number];
const ORDER: Record<Mode, (c: Cost) => Key> = {
  cheapest: (c) => [c.dollars, c.trips, c.days, c.steps],
  fewestTrips: (c) => [c.trips, c.dollars, c.days, c.steps],
  fastest: (c) => [c.days, c.trips, c.dollars, c.steps],
};

function less(a: Key, b: Key): boolean {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}

/** The fee for an action after the cheapest waiver this person qualifies for. */
export function priceOf(a: Action, have: ReadonlySet<DocId>, facts: Person["facts"]): { dollars: number; waiver?: Waiver } {
  let best: { dollars: number; waiver?: Waiver } = { dollars: a.dollars };
  for (const w of a.waivers ?? []) {
    if (w.dollars < best.dollars && holds(w.if, have, facts)) best = { dollars: w.dollars, waiver: w };
  }
  return best;
}

interface Node {
  have: Set<DocId>;
  at: string | null; // place, if the last step finished on the spot
  cost: Cost;
  key: string;
  prev: Node | null;
  step: Step | null;
}

const keyOf = (have: Set<DocId>, at: string | null) => [...have].sort().join(",") + "@" + (at ?? "");

/** A small binary heap; the state space here is a few hundred nodes at most. */
class Heap<T> {
  private xs: T[] = [];
  constructor(private lt: (a: T, b: T) => boolean) {}
  get size() { return this.xs.length; }
  push(x: T) {
    const xs = this.xs; xs.push(x);
    let i = xs.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (!this.lt(xs[i], xs[p])) break; [xs[i], xs[p]] = [xs[p], xs[i]]; i = p; }
  }
  pop(): T | undefined {
    const xs = this.xs; if (!xs.length) return undefined;
    const top = xs[0]; const last = xs.pop()!;
    if (xs.length) {
      xs[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < xs.length && this.lt(xs[l], xs[m])) m = l;
        if (r < xs.length && this.lt(xs[r], xs[m])) m = r;
        if (m === i) break; [xs[i], xs[m]] = [xs[m], xs[i]]; i = m;
      }
    }
    return top;
  }
}

export function plan(rules: RuleSet, person: Person, mode: Mode = "cheapest"): Plan | null {
  const order = ORDER[mode];
  const facts = person.facts;
  const start: Node = { have: new Set(person.have), at: null, cost: { dollars: 0, trips: 0, days: 0, steps: 0 }, key: "", prev: null, step: null };
  start.key = keyOf(start.have, null);

  const best = new Map<string, Key>([[start.key, order(start.cost)]]);
  const done = new Set<string>();
  const heap = new Heap<Node>((a, b) => less(order(a.cost), order(b.cost)));
  heap.push(start);

  while (heap.size) {
    const n = heap.pop()!;
    if (done.has(n.key)) continue;
    done.add(n.key);
    if (n.have.has(rules.goal)) return unwind(n, mode, done.size);

    for (const a of rules.actions) {
      if (a.produces.every((d) => n.have.has(d))) continue;          // nothing new to gain
      if (a.eligible && !holds(a.eligible, n.have, facts)) continue;  // not open to this person
      if (!holds(a.requires, n.have, facts)) continue;                // not ready yet

      const { dollars, waiver } = priceOf(a, n.have, facts);
      const inPerson = rules.places[a.place]?.inPerson ?? true;
      const newTrip = inPerson && n.at !== a.place;
      const cost: Cost = {
        dollars: n.cost.dollars + dollars,
        trips: n.cost.trips + (newTrip ? 1 : 0),
        days: n.cost.days + a.days,
        steps: n.cost.steps + 1,
      };
      const have = new Set(n.have); a.produces.forEach((d) => have.add(d));
      const at = inPerson && a.days === 0 ? a.place : null;
      const key = keyOf(have, at);
      const prior = best.get(key);
      if (done.has(key) || (prior && !less(order(cost), prior))) continue;
      best.set(key, order(cost));
      heap.push({
        have, at, cost, key, prev: n,
        step: { action: a, dollars, waiver, newTrip, startDay: n.cost.days, endDay: cost.days },
      });
    }
  }
  return null; // no legal path from here with the rules we know
}

function unwind(n: Node, mode: Mode, explored: number): Plan {
  const steps: Step[] = [];
  for (let x: Node | null = n; x && x.step; x = x.prev) steps.unshift(x.step);
  return { steps, total: n.cost, mode, allVerified: steps.every((s) => s.action.verified), explored };
}

/**
 * "What would help most?" For each document the person doesn't hold, how much
 * would having it shorten the plan? This is what a caseworker asks first:
 * is it worth digging for the old ID number, or calling the hospital?
 */
/**
 * Documents worth suggesting to this person: ones they could go looking for
 * (an old ID, a birth certificate), not forms only an agency can issue; that
 * they don't hold; that their path doesn't already get them; and that can
 * exist for them (no U.S. birth certificate for someone born abroad, and no
 * green card or naturalization certificate for someone born in the U.S.).
 */
const BORN_IN_US = new Set(["la_county", "california", "us_state"]);

export function suggestable(rules: RuleSet, person: Person, base: Plan | null): DocId[] {
  const produced = new Set(base?.steps.flatMap((s) => s.action.produces) ?? []);
  const born = person.facts.born;
  return Object.keys(rules.docs).filter((d) =>
    rules.docs[d].askAtIntake && !person.have.includes(d) && !produced.has(d) &&
    !(d === "birth_cert_ca" && born === "abroad") &&
    !(d === "immigration_doc" && typeof born === "string" && BORN_IN_US.has(born)));
}

// A photo ID is what the person is trying to get, so "get a passport first"
// isn't useful advice. These stay on the checklist and in "what if".
const PHOTO_IDS = new Set<DocId>(["us_passport", "old_ca_id_5yr", "immigration_doc"]);

export function whatHelps(rules: RuleSet, person: Person, mode: Mode = "cheapest") {
  const base = plan(rules, person, mode);
  if (!base) return [];
  const candidates = suggestable(rules, person, base).filter((d) => !PHOTO_IDS.has(d));
  return candidates
    .map((doc) => ({ doc, plan: plan(rules, { ...person, have: [...person.have, doc] }, mode)! }))
    .filter((x) => x.plan && less(ORDER[mode](x.plan.total), ORDER[mode](base.total)))
    .map((x) => ({
      doc: x.doc,
      saves: {
        dollars: base.total.dollars - x.plan.total.dollars,
        trips: base.total.trips - x.plan.total.trips,
        days: base.total.days - x.plan.total.days,
        steps: base.total.steps - x.plan.total.steps,
      },
    }))
    .sort((a, b) => b.saves.dollars - a.saves.dollars || b.saves.trips - a.saves.trips || b.saves.days - a.saves.days);
}
