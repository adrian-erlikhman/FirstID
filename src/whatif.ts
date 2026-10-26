import { plan, suggestable } from "./engine/planner";
import type { Mode, Person, Plan, RuleSet } from "./engine/types";

// "What if" = change one answer and re-plan. The toggles shown are only the
// answers that would actually change this person's path, worked out by
// re-running the planner once per candidate. (A few dozen plans; each takes
// well under a millisecond.)

export type Flip = { kind: "doc"; doc: string } | { kind: "fact"; fact: string };

/** Yes/no facts a person could reasonably answer differently. */
export const FLIPPABLE_FACTS = ["unhoused", "fireSurvivor", "hasWitnesses", "publicAssistance", "fosterYouth"];

export const flipKey = (f: Flip) => (f.kind === "doc" ? `doc:${f.doc}` : `fact:${f.fact}`);

/** Adding a document, or turning a yes/no fact the other way. */
export function applyFlips(person: Person, flips: Flip[]): Person {
  const have = new Set(person.have);
  const facts = { ...person.facts };
  for (const f of flips) {
    if (f.kind === "doc") have.add(f.doc);
    else if (facts[f.fact] === true) facts[f.fact] = false;
    else facts[f.fact] = true;
  }
  return { facts, have: [...have] };
}

/** Same steps, same totals? Then the flip changed nothing worth showing. */
export function samePlan(a: Plan | null, b: Plan | null): boolean {
  if (!a || !b) return a === b;
  const ids = (p: Plan) => p.steps.map((s) => s.action.id).sort().join(",");
  const t = (p: Plan) => [p.total.dollars, p.total.trips, p.total.days, p.total.steps].join(",");
  return ids(a) === ids(b) && t(a) === t(b);
}

export interface FlipOption {
  flip: Flip;
  plan: Plan | null;
  better: boolean;
}

export function flipsThatMatter(rules: RuleSet, person: Person, mode: Mode, max = 4): FlipOption[] {
  const base = plan(rules, person, mode);
  const docFlips: Flip[] = suggestable(rules, person, base).map((doc) => ({ kind: "doc", doc }));
  const factFlips: Flip[] = FLIPPABLE_FACTS.map((fact) => ({ kind: "fact", fact }));

  const score = (p: Plan | null) => (p ? [p.total.dollars, p.total.trips, p.total.days, p.total.steps] : [Infinity, Infinity, Infinity, Infinity]);
  const cmp = (a: number[], b: number[]) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

  const options = [...docFlips, ...factFlips]
    .map((flip) => ({ flip, plan: plan(rules, applyFlips(person, [flip]), mode) }))
    .filter((o) => !samePlan(o.plan, base))
    .map((o) => ({ ...o, better: cmp(score(o.plan), score(base)) < 0 }));

  // Improvements first (biggest saving first), then the answers that would make it worse.
  options.sort((a, b) => Number(b.better) - Number(a.better) || cmp(score(a.plan), score(b.plan)));

  // Several documents often help in exactly the same way (a birth certificate
  // or a passport). Show one of each kind of change so the list stays short.
  const seen = new Set<string>();
  const out: FlipOption[] = [];
  for (const o of options) {
    const sig = o.plan ? o.plan.steps.map((s) => s.action.id).join(">") : "none";
    if (o.flip.kind === "doc" && seen.has(sig)) continue;
    seen.add(sig);
    out.push(o);
    if (out.length === max) break;
  }
  return out;
}

/** Plain reasons shown on the no-path screen, for the common dead ends. */
export type NoPathNote = "bornCA" | "bornElsewhere" | "allUnsure" | "needAddress" | "needWitnesses" | "needSsn";

export function noPathNotes(rules: RuleSet, person: Person, mode: Mode = "cheapest"): NoPathNote[] {
  if (plan(rules, person, mode)) return [];
  const notes: NoPathNote[] = [];
  const { facts, have } = person;
  if (facts.born === "california") notes.push("bornCA");
  if (facts.born === "us_state" || facts.born === "abroad") notes.push("bornElsewhere");
  // What's blocking: ask the planner whether one missing piece would open a path.
  if (FLIPPABLE_FACTS.every((f) => facts[f] === undefined)) { notes.push("allUnsure"); return notes; }
  type Fix = [NoPathNote, boolean, (p: Person) => Person];
  const missing = ([
    ["needAddress", !have.includes("residency_doc"), (p) => ({ ...p, have: [...p.have, "residency_doc"] })],
    ["needWitnesses", facts.hasWitnesses !== true, (p) => ({ ...p, facts: { ...p.facts, hasWitnesses: true } })],
    ["needSsn", !have.includes("ssn_known"), (p) => ({ ...p, have: [...p.have, "ssn_known"] })],
  ] as Fix[]).filter(([, isMissing]) => isMissing);
  const opens = (fixes: Fix[]) => !!plan(rules, fixes.reduce((p, [, , add]) => add(p), person), mode);
  // One missing piece that opens a path on its own: name that one.
  const single = missing.find((fx) => opens([fx]));
  if (single) { notes.push(single[0]); return notes; }
  // Otherwise, if getting all of them would open a path, name each one it can't do without.
  if (missing.length > 1 && opens(missing))
    for (const fx of missing) if (!opens(missing.filter((x) => x !== fx))) notes.push(fx[0]);
  return notes;
}

/** "Who can help today" on the no-path screen. LAUSD's homeless education
 *  office serves students and their families, so it is shown only to people
 *  young enough to be in school, or who didn't give an age. */
export type HelpOption = "211" | "lausd";

export function helpOptions(person: Person): HelpOption[] {
  const age = person.facts.age;
  return typeof age === "number" && age >= 22 ? ["211"] : ["211", "lausd"];
}
