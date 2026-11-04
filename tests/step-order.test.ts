// Step order (docs/team/TASKS.md: "Add a pass that puts free, same-day steps
// first"). Days add up, so a same-day step placed after a mailed request reads
// "around week 4" when it could happen today. For every path the screens can
// give, in every sort: no same-day step starts after a wait if moving it to
// just before that wait would still work, at the same cost, with no more trips.
// The moves are checked with tests/validate.ts's replay, not the planner's own.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { plan } from "../src/engine/planner";
import type { Mode, Person, RuleSet } from "../src/engine/types";
import { withImplied } from "../src/person";
import { BORN, people } from "./grid";
import { personas } from "./personas";
import { replay } from "./validate";

const rules = rulesJson as unknown as RuleSet;
const MODES: Mode[] = ["cheapest", "fewestTrips", "fastest"];

function stuckSteps(person: Person, mode: Mode): string[] {
  const p = plan(rules, person, mode);
  if (!p) return [];
  const out: string[] = [];
  const actions = p.steps.map((s) => s.action);
  p.steps.forEach((st, j) => {
    if (st.action.days !== 0 || st.startDay === 0) return;
    const wait = p.steps.findIndex((s) => s.action.days > 0);
    if (wait < 0 || wait >= j) return;
    const moved = [...actions.slice(0, wait), st.action, ...actions.slice(wait, j), ...actions.slice(j + 1)];
    const r = replay(rules, person, moved);
    if (r.ok && r.cost.dollars === p.total.dollars && r.cost.trips <= p.total.trips)
      out.push(`${mode}: ${st.action.id} starts on day ${st.startDay} but could start today (${actions.map((a) => a.id).join(" > ")})`);
  });
  return out;
}

describe("step order: same-day steps don't wait behind the mail", () => {
  it.each(BORN)("born %s: every answer set, every sort", (born) => {
    const found: string[] = [];
    for (const person of people(born)) for (const mode of MODES) found.push(...stuckSteps(person, mode));
    expect(found.slice(0, 5)).toEqual([]);
  }, 60_000);

  it("Maria's path starts today, with the shelter's DL 933 on the first visit", () => {
    const p = plan(rules, personas.maria)!;
    const dl933 = p.steps.find((s) => s.action.id === "program_dl933")!;
    expect(dl933.startDay).toBe(0);
  });

  it("the pass never changes a path's totals: the someone-at-a-shelter path that used to wait", () => {
    const person: Person = { facts: { born: "la_county", age: 30, unhoused: true, hasWitnesses: true }, have: withImplied(["ssn_known"]) };
    const p = plan(rules, person)!;
    expect(p.total).toEqual({ dollars: 15, trips: 3, days: 49, steps: 5 });
    expect(p.steps.find((s) => s.action.id === "program_dl933")!.startDay).toBe(0);
    // Still a valid sequence from the outside, with the same totals.
    const r = replay(rules, person, p.steps.map((s) => s.action));
    expect(r.ok && { dollars: r.cost.dollars, trips: r.cost.trips, days: r.cost.days }).toEqual({ dollars: 15, trips: 3, days: 49 });
  });
});
