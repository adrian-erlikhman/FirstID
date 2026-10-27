// "Whatever someone answers, they get a good path or a clear reason why not."
// The space is every answer the screens allow: birthplace, age band (or
// skipped), yes / no / not sure for the five yes-or-no questions, and any set
// of the intake papers, about 5 million people. These tests take a fixed random
// sample of it; scripts/check-every-person.ts runs the same checks on all of it.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { plan } from "../src/engine/planner";
import type { Mode, Person, RuleSet } from "../src/engine/types";
import { MODES, noPathNotes, samePlan, withoutSteps } from "../src/whatif";
import { ORDER, YES_NO, bruteBest, intakeOf, less, personAt, problems, spaceSize } from "./validate";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;
const intake = intakeOf(rules);
const N = spaceSize(intake);

// A small seeded generator, so a failure always comes back with the same people.
function* sample(count: number, seed = 20261026): Generator<{ i: number; person: Person }> {
  let s = seed >>> 0;
  const next = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let n = 0; n < count; n++) { const i = Math.floor(next() * N); yield { i, person: personAt(i, intake) }; }
}

const show = (p: Person) => JSON.stringify(p);

describe("every person: a good path, or a clear reason", () => {
  it("the checker itself catches broken plans", () => {
    const maria = personas.maria;
    const good = plan(rules, maria, "cheapest")!;
    expect(problems(rules, maria, "cheapest", good)).toEqual([]);
    const swapped = { ...good, steps: [good.steps[good.steps.length - 1], ...good.steps.slice(0, -1)] };
    expect(problems(rules, maria, "cheapest", swapped).length).toBeGreaterThan(0);
    const cheap = { ...good, steps: good.steps.map((st, i) => (i === 0 ? { ...st, dollars: 0 } : st)) };
    expect(problems(rules, maria, "cheapest", cheap).join()).toMatch(/costs \$0, the rules say \$15/);
    const short = { ...good, steps: good.steps.slice(0, -1) };
    expect(problems(rules, maria, "cheapest", short).join()).toMatch(/never reaches the ID card/);
    const extra = plan(rules, maria, "cheapest")!;
    const padded = { ...extra, steps: [...extra.steps.slice(0, 1), extra.steps[0], ...extra.steps.slice(1)] };
    expect(problems(rules, maria, "cheapest", padded).join()).toMatch(/appears twice|gains nothing/);
  });

  it("the space really is every answer the screens allow", () => {
    expect(intake.length).toBe(10);
    expect(N).toBe(4 * 5 * 243 * 1024);
  });

  it("each plan is valid step by step, adds up, and wastes nothing, in every sort", () => {
    for (const { person } of sample(4000)) {
      for (const mode of MODES) {
        const p = plan(rules, person, mode);
        if (p) expect(problems(rules, person, mode, p), `${mode} ${show(person)}`).toEqual([]);
      }
    }
  });

  it("each plan is the best one there is: the same cost as trying every order of steps", () => {
    for (const { person } of sample(1500, 7)) {
      for (const mode of MODES) {
        const p = plan(rules, person, mode);
        const best = bruteBest(rules, person, mode);
        expect(p ? ORDER[mode](p.total) : null, `${mode} ${show(person)}`).toEqual(best);
      }
    }
  });

  it("a path exists in one sort exactly when it exists in the others", () => {
    for (const { person } of sample(4000, 11)) {
      const found = MODES.map((m) => plan(rules, person, m) !== null);
      expect(new Set(found).size, show(person)).toBe(1);
    }
  });

  it("no path: the screen always has at least one note saying what is blocking", () => {
    let dead = 0;
    for (const { person } of sample(6000, 13)) {
      if (plan(rules, person, "cheapest")) continue;
      dead++;
      expect(noPathNotes(rules, person).length, show(person)).toBeGreaterThan(0);
    }
    expect(dead).toBeGreaterThan(0); // the sample does reach dead ends
  });

  it("'Not sure' is never counted on: the path is the same as answering No", () => {
    for (const { person } of sample(3000, 17)) {
      for (const f of YES_NO) {
        if (person.facts[f] !== undefined) continue;
        const asNo: Person = { ...person, facts: { ...person.facts, [f]: false } };
        for (const mode of ["cheapest"] as Mode[]) expect(samePlan(plan(rules, person, mode), plan(rules, asNo, mode)), `${f} ${show(person)}`).toBe(true);
      }
    }
  });

  it("'Can't do this step?': the path without any one step is valid too, or there is none", () => {
    for (const { person } of sample(1500, 19)) {
      const base = plan(rules, person, "cheapest");
      for (const st of base?.steps ?? []) {
        const live = withoutSteps(rules, [st.action.id]);
        const alt = plan(live, person, "cheapest");
        if (!alt) continue;
        expect(alt.steps.map((x) => x.action.id), show(person)).not.toContain(st.action.id);
        expect(problems(live, person, "cheapest", alt), show(person)).toEqual([]);
        // It can't beat the path that was allowed to use that step.
        expect(less(ORDER.cheapest(alt.total), ORDER.cheapest(base!.total)), show(person)).toBe(false);
      }
    }
  });
});
