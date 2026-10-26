// Each expected plan below was worked out by hand from the sources before it
// was written here. If the planner disagrees, either the rules file or the
// planner is wrong, and CI stops the deploy until we know which.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { holds } from "../src/engine/expr";
import { lint } from "../src/engine/lint";
import { plan } from "../src/engine/planner";
import type { Mode, Person, RuleSet } from "../src/engine/types";
import { examples } from "../src/examples";
import { withImplied } from "../src/person";
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

  it("Luis, born in Texas with no witnesses: without his earlier California ID there is no path", () => {
    const { have, facts } = personas.luis;
    // He had a CA ID before, so the replacement path exists; without that, nothing does.
    expect(plan(rules, { facts, have: have.filter((d) => d !== "dmv_record") })).toBeNull();
  });
});

describe("Maria in detail: the homeless affidavit, not the fire waiver", () => {
  const MODES: Mode[] = ["cheapest", "fewestTrips", "fastest"];
  const FIRE_SOURCES = ["rrcc_fire", "lafires_docs"];

  it.each(MODES)("%s: the birth certificate is free through the homeless affidavit, not the fire waiver", (mode) => {
    const p = plan(rules, personas.maria, mode)!;
    const bc = p.steps.find((s) => s.action.id === "rrcc_mail")!;
    expect(bc.dollars).toBe(0);
    expect(bc.waiver?.if).toEqual({ doc: "bc_waiver_homeless" });
    for (const st of p.steps) for (const id of FIRE_SOURCES) expect(st.waiver?.sources ?? [], st.action.id).not.toContain(id);
  });

  it.each(MODES)("%s: the ID itself is free with the DL 933 her shelter signs", (mode) => {
    const p = plan(rules, personas.maria, mode)!;
    const dmv = p.steps.at(-1)!;
    expect(dmv.action.id).toBe("dmv_original");
    expect(dmv.dollars).toBe(0);
    expect(dmv.waiver?.if).toEqual({ doc: "dl933" });
  });

  it("the affidavit and the notary come before the mail order, and the DL 933 before the DMV", () => {
    const ids = steps("maria")!;
    expect(ids.indexOf("program_bc_affidavit")).toBeLessThan(ids.indexOf("rrcc_mail"));
    expect(ids.indexOf("notary_witnesses")).toBeLessThan(ids.indexOf("rrcc_mail"));
    expect(ids.indexOf("program_dl933")).toBeLessThan(ids.indexOf("dmv_original"));
  });

  it("answering 'No' to the fires question gives the same path as leaving it blank", () => {
    const no = plan(rules, { ...personas.maria, facts: { ...personas.maria.facts, fireSurvivor: false } })!;
    expect(no.steps.map((s) => s.action.id)).toEqual(steps("maria"));
    expect(no.total).toEqual(total("maria"));
  });

  it("the Maria on the home screen is exactly the persona checked here", () => {
    const ex = examples.find((e) => e.id === "maria")!;
    expect(ex.person.facts).toEqual(personas.maria.facts);
    expect(ex.person.have).toEqual(personas.maria.have);
    const home = plan(rules, { ...ex.person, have: withImplied(ex.person.have) }, "cheapest")!;
    expect(home.steps.map((s) => s.action.id)).toEqual(steps("maria"));
  });

  it("every step of her path has its text in English and Spanish", () => {
    for (const st of plan(rules, personas.maria)!.steps) {
      const a = st.action;
      for (const txt of [a.label, a.why, st.waiver?.say ?? a.say, st.waiver?.label].filter(Boolean)) {
        expect(txt!.en.trim(), a.id).not.toBe("");
        expect(txt!.es.trim(), a.id).not.toBe("");
      }
    }
  });
});

describe("every step is legal when it happens (real rules, every persona, every mode)", () => {
  const legal = (person: Person, mode: Mode) => {
    const p = plan(rules, person, mode);
    if (!p) return;
    const have = new Set(person.have);
    for (const st of p.steps) {
      expect(holds(st.action.requires, have, person.facts), `${mode}: ${st.action.id} requires`).toBe(true);
      if (st.action.eligible) expect(holds(st.action.eligible, have, person.facts), `${mode}: ${st.action.id} eligible`).toBe(true);
      if (st.waiver) expect(holds(st.waiver.if, have, person.facts), `${mode}: ${st.action.id} waiver`).toBe(true);
      st.action.produces.forEach((d) => have.add(d));
    }
    expect(have.has(rules.goal), mode).toBe(true);
  };
  it.each(Object.keys(personas))("%s", (name) => {
    for (const mode of ["cheapest", "fewestTrips", "fastest"] as Mode[]) legal(personas[name], mode);
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
