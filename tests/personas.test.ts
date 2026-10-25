// Each expected plan below was worked out BY HAND from the sources before it
// was written here. If the planner disagrees, either the rules file or the
// planner is wrong, and CI stops the deploy until we know which.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { lint } from "../src/engine/lint";
import { plan } from "../src/engine/planner";
import type { RuleSet } from "../src/engine/types";
import { personas } from "./personas";
import { checkMonotone } from "./planner.test";

const rules = rulesJson as unknown as RuleSet;
const steps = (name: keyof typeof personas) => plan(rules, personas[name])?.steps.map((s) => s.action.id);
const total = (name: keyof typeof personas) => plan(rules, personas[name])?.total;

describe("rules file", () => {
  it("passes the linter", () => expect(lint(rules)).toEqual([]));
});

describe("personas (hand-worked plans)", () => {
  it("Maria: DL 933 and the homeless affidavit at the shelter, notary with two witnesses, free birth certificate by mail, free ID", () => {
    expect(new Set(steps("maria"))).toEqual(new Set(["program_dl933", "program_bc_affidavit", "notary_witnesses", "rrcc_mail", "dmv_original"]));
    expect(total("maria")).toEqual({ dollars: 15, trips: 3, days: 49, steps: 5 });
  });

  it("Maria, if she had also lost papers in the fires: the fire waiver replaces the affidavit, still $15", () => {
    const p = plan(rules, { ...personas.maria, facts: { ...personas.maria.facts, fireSurvivor: true } })!;
    expect(p.steps.map((s) => s.action.id)).not.toContain("program_bc_affidavit");
    expect(p.total.dollars).toBe(15);
  });

  it("Maria, if she had a California ID before: a free replacement in two steps", () => {
    expect(steps("maria_had_id")).toEqual(["program_dl933", "dmv_replace"]);
    expect(total("maria_had_id")).toEqual({ dollars: 0, trips: 2, days: 21, steps: 2 });
  });

  it("DeShawn, leaving foster care: the county owes him his documents", () => {
    expect(steps("deshawn")).toEqual(["dcfs_documents", "dmv_original"]);
  });

  it("Jayden, 16, has his documents: straight to the DMV", () => {
    expect(steps("jayden")).toEqual(["dmv_original"]);
    expect(total("jayden")!.dollars).toBe(40);
  });

  it("Luis, born in Texas with no witnesses: no full path yet, so the app sends him to a caseworker", () => {
    const { have, facts } = personas.luis;
    // He had a CA ID before, so the replacement path exists; without that, nothing does.
    expect(plan(rules, { facts, have: have.filter((d) => d !== "dmv_record") })).toBeNull();
  });
});

describe("dead ends", () => {
  it("born in Texas with a certified Texas birth certificate: the DMV takes any U.S. one, so there is a path", () => {
    const p = plan(rules, { facts: { born: "us_state", age: 30 }, have: ["birth_cert_ca", "ssn_known", "residency_doc"] });
    expect(p?.steps.map((s) => s.action.id)).toEqual(["dmv_original"]);
  });
});

describe("more documents never hurts (real rules)", () => {
  it("holds for every persona", () => checkMonotone(rules, Object.values(personas)));
});
