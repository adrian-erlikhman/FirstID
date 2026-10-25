import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { examples } from "../src/examples";
import { parse, href } from "../src/router";
import { applyFlips, flipsThatMatter } from "../src/whatif";
import { withImplied } from "../src/person";
import { plan } from "../src/engine/planner";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;

describe("what-if toggles", () => {
  it("for Maria, 'had an ID before' is among the biggest savings", () => {
    const opts = flipsThatMatter(rules, personas.maria, "cheapest");
    expect(opts[0].better).toBe(true);
    expect(opts[0].plan!.total.dollars).toBe(0);
    const hadId = opts.find((o) => o.flip.kind === "doc" && o.flip.doc === "dmv_record");
    expect(hadId?.better).toBe(true);
    expect(hadId?.plan!.total.dollars).toBe(0);
  });

  it("only shows answers that change the plan", () => {
    // Jayden already has everything for the direct path. Only a fee waiver
    // (benefits, age) could change it, and he answered neither.
    for (const o of flipsThatMatter(rules, personas.jayden, "cheapest")) expect(o.plan).not.toBeNull();
  });

  it("flipping a fact turns yes into no and unset into yes", () => {
    const p = applyFlips({ facts: { unhoused: true }, have: [] }, [{ kind: "fact", fact: "unhoused" }, { kind: "fact", fact: "fireSurvivor" }]);
    expect(p.facts).toEqual({ unhoused: false, fireSurvivor: true });
  });
});

describe("router", () => {
  it("round-trips every screen", () => {
    for (const r of [{ name: "home" }, { name: "have" }, { name: "path" }, { name: "step", n: 3 }, { name: "example", id: "maria" }] as const)
      expect(parse(href(r))).toEqual(r);
  });
  it("falls back safely on junk", () => {
    expect(parse("#/step/abc")).toEqual({ name: "path" });
    expect(parse("#/nope")).toEqual({ name: "home" });
  });
});

describe("examples", () => {
  it("use the same people the persona tests check", () => {
    expect(examples.map((e) => e.id)).toEqual(["maria", "deshawn", "luis", "jayden"]);
    expect(examples[0].person.have).toEqual(personas.maria.have);
  });
});

describe("rule copy", () => {
  it("every rule explains itself in both languages", () => {
    for (const a of rules.actions) {
      expect(a.why?.en, a.id).toBeTruthy();
      expect(a.why?.es, a.id).toBeTruthy();
    }
  });
});

describe("documents you hold without ticking them", () => {
  it("a California ID from the last 5 years counts as a DMV record, so it never leads to 'no path'", () => {
    const person = { facts: { born: "la_county", age: 30 }, have: ["old_ca_id_5yr", "ssn_known"] };
    expect(plan(rules, person)).toBeNull();                      // the raw rules alone miss it
    const p = plan(rules, { ...person, have: withImplied(person.have) });
    expect(p?.steps.map((s) => s.action.id)).toEqual(["dmv_replace"]);
  });
});
