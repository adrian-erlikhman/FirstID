import { describe, expect, it } from "vitest";
import { holds } from "../src/engine/expr";
import { lint } from "../src/engine/lint";
import { plan, whatHelps } from "../src/engine/planner";
import type { Person, RuleSet } from "../src/engine/types";
import { toy } from "./toy-rules";

const ids = (p: ReturnType<typeof plan>) => p?.steps.map((s) => s.action.id);

describe("planner mechanics (toy rules)", () => {
  it("lints clean", () => expect(lint(toy)).toEqual([]));

  it("someone who had an ID before takes the replacement path", () => {
    const p = plan(toy, { facts: {}, have: ["old_id"] });
    expect(ids(p)).toEqual(["replace"]);
    expect(p!.total).toEqual({ dollars: 40, trips: 1, days: 14, steps: 1 });
  });

  it("an unhoused person born here gets the free path through the shelter", () => {
    const p = plan(toy, { facts: { unhoused: true, bornHere: true, hasWitnesses: true }, have: [] });
    expect(new Set(ids(p))).toEqual(new Set(["notarize", "cert_mail", "waiver", "apply"]));
    expect(ids(p)!.at(-1)).toBe("apply");
    expect(p!.total.dollars).toBe(15);
    expect(p!.allVerified).toBe(false); // the waiver rule is flagged "call ahead"
  });

  it("returns null when no legal path exists", () => {
    expect(plan(toy, { facts: { bornHere: false }, have: [] })).toBeNull();
  });

  it("every step in a plan is legal at the moment it happens", () => {
    const person: Person = { facts: { unhoused: true, bornHere: true, hasWitnesses: true }, have: [] };
    const p = plan(toy, person)!;
    const have = new Set(person.have);
    for (const s of p.steps) {
      expect(holds(s.action.requires, have, person.facts)).toBe(true);
      s.action.produces.forEach((d) => have.add(d));
    }
    expect(have.has(toy.goal)).toBe(true);
  });

  it("what helps most: an old ID on file or a birth certificate each save $45", () => {
    const helps = whatHelps(toy, { facts: { bornHere: true, hasWitnesses: true }, have: [] });
    expect(helps.map((h) => h.doc).slice(0, 2).sort()).toEqual(["cert", "old_id"]);
    expect(helps[0].saves.dollars).toBe(45);
  });
});

/**
 * The guarantee we put in the video: having MORE documents can never make your
 * plan worse. We check it for every persona and every single document they
 * could add. If a rule ever breaks it, this test fails before a person sees it.
 */
export function checkMonotone(rules: RuleSet, personas: Person[]) {
  for (const person of personas) {
    const base = plan(rules, person);
    if (!base) continue;
    for (const d of Object.keys(rules.docs)) {
      if (person.have.includes(d)) continue;
      const more = plan(rules, { ...person, have: [...person.have, d] })!;
      expect(more, `adding ${d}`).not.toBeNull();
      expect(more.total.dollars, `adding ${d}`).toBeLessThanOrEqual(base.total.dollars);
    }
  }
}

describe("more documents never hurts (toy rules)", () => {
  it("holds for every toy persona", () =>
    checkMonotone(toy, [
      { facts: { unhoused: true, bornHere: true, hasWitnesses: true }, have: [] },
      { facts: { bornHere: true, hasWitnesses: true }, have: [] },
      { facts: {}, have: ["old_id"] },
    ]));
});
