import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { examples } from "../src/examples";
import { parse, href } from "../src/router";
import { applyFlips, flipsThatMatter, helpOptions, noPathNotes } from "../src/whatif";
import { NOT_PAPERS, clearPapers, readyForPath, under18, withImplied } from "../src/person";
import { plan, suggestable, whatHelps } from "../src/engine/planner";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;

describe("what-if toggles", () => {
  it("for Maria, 'had an ID before' is among the biggest savings", () => {
    // A passport saves just as much, so either can sort first.
    const opts = flipsThatMatter(rules, personas.maria, "cheapest");
    expect(opts[0].better).toBe(true);
    expect(opts[0].plan!.total.dollars).toBe(0);
    const hadId = opts.find((o) => o.flip.kind === "doc" && o.flip.doc === "dmv_record");
    expect(hadId?.plan!.total.dollars).toBe(0);
  });

  it("never suggests a document the path already gets you", () => {
    // Maria's path orders her birth certificate, so it isn't a thing to go find.
    const docs = flipsThatMatter(rules, personas.maria, "cheapest", 99).flatMap((o) => (o.flip.kind === "doc" ? [o.flip.doc] : []));
    expect(docs).not.toContain("birth_cert_ca");
    expect(whatHelps(rules, personas.maria).map((h) => h.doc)).not.toContain("birth_cert_ca");
  });

  it("'What would help most' never suggests getting a photo ID", () => {
    // A passport would save Maria money, but a photo ID is what she's trying to get.
    for (const p of Object.values(personas)) {
      const docs = whatHelps(rules, p).map((h) => h.doc);
      for (const id of ["us_passport", "old_ca_id_5yr", "immigration_doc"]) expect(docs).not.toContain(id);
    }
  });

  it("never suggests a U.S. birth certificate to someone born abroad", () => {
    const person = { facts: { born: "abroad", age: 30, unhoused: true }, have: ["ssn_known"] };
    const docs = flipsThatMatter(rules, person, "cheapest", 99).flatMap((o) => (o.flip.kind === "doc" ? [o.flip.doc] : []));
    expect(docs).not.toContain("birth_cert_ca");
    expect(docs).toContain("us_passport");
  });

  it("never suggests a green card or naturalization certificate to someone born in the U.S.", () => {
    // suggestable() is the candidate list both what-if and "what would help" draw from.
    for (const born of ["la_county", "california", "us_state"]) {
      const person = { facts: { born, age: 30, unhoused: true, hasWitnesses: true }, have: ["ssn_known"] };
      expect(suggestable(rules, person, plan(rules, person)), born).not.toContain("immigration_doc");
    }
    // Someone born abroad can still be offered one.
    const abroad = { facts: { born: "abroad", age: 30, unhoused: true }, have: ["ssn_known"] };
    expect(suggestable(rules, abroad, plan(rules, abroad))).toContain("immigration_doc");
  });

  it("for every example person, what-if and 'what would help' never offer a document their path already produces", () => {
    for (const [name, p] of Object.entries(personas)) {
      const produced = plan(rules, p)?.steps.flatMap((s) => s.action.produces) ?? [];
      const offered = [
        ...flipsThatMatter(rules, p, "cheapest", 99).flatMap((o) => (o.flip.kind === "doc" ? [o.flip.doc] : [])),
        ...whatHelps(rules, p).map((h) => h.doc),
      ];
      for (const d of produced) expect(offered, `${name}: ${d}`).not.toContain(d);
    }
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

describe("no-path notes", () => {
  it("born elsewhere in California: no path, and the note says why", () => {
    const person = { facts: { born: "california", age: 30, unhoused: true, hasWitnesses: true }, have: ["ssn_known"] };
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toContain("bornCA");
  });

  it("no notes when there is a path", () => expect(noPathNotes(rules, personas.maria)).toEqual([]));

  it("every yes/no answer 'Not sure': no path, and the note says so", () => {
    const person = { facts: { born: "la_county", age: 30 }, have: ["ssn_known"] };
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toEqual(["allUnsure"]);
  });

  it("no paper with an address is what's blocking", () => {
    const person = { facts: { born: "la_county", age: 30, unhoused: false, hasWitnesses: true }, have: ["ssn_known"] };
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toEqual(["needAddress"]);
  });

  it("no two people with ID is what's blocking", () => {
    const person = { facts: { born: "la_county", age: 30, unhoused: true, hasWitnesses: false }, have: ["ssn_known"] };
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toEqual(["needWitnesses"]);
  });

  it("no Social Security number is what's blocking", () => {
    const person = { facts: { born: "la_county", age: 30, unhoused: true, hasWitnesses: true }, have: ["birth_cert_ca"] };
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toEqual(["needSsn"]);
  });

  it("when two things are missing, the notes name both instead of saying nothing", () => {
    // Housed, no paper with an address, no Social Security number: neither alone opens a path.
    const person = { facts: { born: "la_county", age: 30, unhoused: false, hasWitnesses: true }, have: [] };
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toEqual(["needAddress", "needSsn"]);
  });

  it("only names a missing piece the path really needs", () => {
    // No witnesses and no address paper, but housed: the witnesses alone don't help,
    // and with both the plan still needs both.
    const person = { facts: { born: "la_county", age: 30, unhoused: false, hasWitnesses: false }, have: ["ssn_known"] };
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toEqual(["needAddress", "needWitnesses"]);
  });

  it("'Who can help today' shows LAUSD (students and families) only to people young enough to be in school", () => {
    expect(helpOptions({ facts: { age: 16 }, have: [] })).toEqual(["211", "lausd"]);
    expect(helpOptions({ facts: { age: 19 }, have: [] })).toEqual(["211", "lausd"]);
    expect(helpOptions({ facts: {}, have: [] })).toEqual(["211", "lausd"]);
    expect(helpOptions({ facts: { age: 30 }, have: [] })).toEqual(["211"]);
    expect(helpOptions({ facts: { age: 62 }, have: [] })).toEqual(["211"]);
  });

  it("some dead ends have no single change that opens a path (the what-if button is hidden)", () => {
    // Housed, with no paper showing an address: no one answer fixes that.
    const person = { facts: { born: "la_county", age: 30, unhoused: false, hasWitnesses: true }, have: [] };
    expect(plan(rules, person)).toBeNull();
    expect(flipsThatMatter(rules, person, "cheapest")).toEqual([]);
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

  it("the first-ID DMV step names one card type, the standard 'Federal Limits Apply' card, wherever it says what to ask for", () => {
    const a = rules.actions.find((x) => x.id === "dmv_original")!;
    expect(a.why!.en).toContain("Federal Limits Apply");
    expect(a.why!.es).toContain("Federal Limits Apply");
    for (const say of [a.say!, ...(a.waivers ?? []).flatMap((w) => (w.say ? [w.say] : []))]) {
      expect(say.en).toMatch(/standard/);
      expect(say.es).toMatch(/estándar/);
    }
  });

  it("mail steps list only what goes in the envelope, what to write on the form, and where to send it", () => {
    // The step screen heads these lines "Put in the envelope" when the place isn't in person.
    const mail = rules.actions.filter((a) => !rules.places[a.place].inPerson);
    expect(mail.map((a) => a.id)).toContain("rrcc_mail");
    for (const a of mail) for (const b of a.bring ?? []) expect(b.en, a.id).toMatch(/^(The |On the form|Mail it to)/);
  });

  it("the school paper is a school ID card, not a transcript (SSA takes transcripts for children; unconfirmed for adults)", () => {
    const texts = [rules.docs.school_record.label, ...rules.actions.filter((a) => a.id === "ssa_card").flatMap((a) => [a.why!, ...(a.bring ?? [])])];
    for (const x of texts) {
      expect(x.en).not.toMatch(/transcript|school record/i);
      expect(x.es).not.toMatch(/certificado de estudios|registro escolar/i);
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

describe("Have and Questions screens", () => {
  it("'None of these' clears only the papers: a known SSN and an earlier California card stay", () => {
    expect(clearPapers(["birth_cert_ca", "ssn_known", "medi_cal_card", "dmv_record", "residency_doc"])).toEqual(["ssn_known", "dmv_record"]);
    expect(clearPapers(["us_passport"])).toEqual([]);
    // The rows it keeps are ones the Have screen asks about.
    for (const id of NOT_PAPERS) expect(rules.docs[id]?.askAtIntake, id).toBe(true);
  });

  it("'Show my path' waits for the birthplace, and nothing else", () => {
    expect(readyForPath({})).toBe(false);
    expect(readyForPath({ unhoused: true, hasWitnesses: true, age: 30 })).toBe(false);
    expect(readyForPath({ born: "abroad" })).toBe(true);
  });
});

describe("not covered yet", () => {
  it("the path screen flags under-18s (a parent or guardian may make the path shorter), including Jayden", () => {
    expect(under18(personas.jayden.facts)).toBe(true);
    expect(under18({ age: 16 })).toBe(true);
    expect(under18({ age: 19 })).toBe(false);
    expect(under18(personas.maria.facts)).toBe(false);
    expect(under18({})).toBe(false); // no age given: say nothing
  });
});
