// The no-path screen should say what is blocking, and offer help an adult can
// use. These tests render the real screen (as HTML, no browser) for the dead
// ends we know about, in English and Spanish.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import rulesJson from "../data/rules.json";
import { plan } from "../src/engine/planner";
import type { Person, RuleSet } from "../src/engine/types";
import { t, type Lang } from "../src/i18n";
import { NoPath } from "../src/screens/PathScreen";
import { flipsThatMatter, noPathNotes, type NoPathNote } from "../src/whatif";
import { BORN, people } from "./grid";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;
const LANGS: Lang[] = ["en", "es"];

const decode = (html: string) =>
  html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const render = (person: Person, lang: Lang) =>
  decode(renderToStaticMarkup(<NoPath rules={rules} lang={lang} person={person} onBack={() => {}} />));

const NOTE_TEXT: Record<NoPathNote, (l: Lang) => string> = {
  bornCA: (l) => t[l].noPathBornCA,
  bornElsewhere: (l) => t[l].noPathBornElsewhere,
  bornAbroad: (l) => t[l].noPathBornAbroad,
  allUnsure: (l) => t[l].noPathAllUnsure,
  needAddress: (l) => t[l].noPathNeedAddress,
  needWitnesses: (l) => t[l].noPathNeedWitnesses,
  needSsn: (l) => t[l].noPathNeedSsn,
};

// Known dead ends, with the notes the screen should show for each.
const luisNoOldId: Person = { facts: personas.luis.facts, have: personas.luis.have.filter((d) => d !== "dmv_record") };
const DEAD_ENDS: [string, Person, NoPathNote[]][] = [
  ["Luis without his old ID (born in Texas, no witnesses)", luisNoOldId, ["bornElsewhere"]],
  ["born abroad, no papers but a Social Security number", { facts: { born: "abroad", age: 30, unhoused: true, hasWitnesses: true }, have: ["ssn_known"] }, ["bornAbroad"]],
  ["born elsewhere in California", { facts: { born: "california", age: 30, unhoused: true, hasWitnesses: true }, have: ["ssn_known"] }, ["bornCA"]],
  ["every yes/no answer 'Not sure'", { facts: { born: "la_county", age: 30 }, have: ["ssn_known"] }, ["allUnsure"]],
  ["housed, no paper with an address", { facts: { born: "la_county", age: 30, unhoused: false, hasWitnesses: true }, have: ["ssn_known"] }, ["needAddress"]],
  ["no two people with ID", { facts: { born: "la_county", age: 30, unhoused: true, hasWitnesses: false }, have: ["ssn_known"] }, ["needWitnesses"]],
  ["no Social Security number", { facts: { born: "la_county", age: 30, unhoused: true, hasWitnesses: true }, have: ["birth_cert_ca"] }, ["needSsn"]],
];

describe("no-path screen: says what is blocking", () => {
  it.each(DEAD_ENDS)("%s", (_, person, notes) => {
    expect(plan(rules, person)).toBeNull();
    expect(noPathNotes(rules, person)).toEqual(notes);
    for (const lang of LANGS) {
      const html = render(person, lang);
      expect(html).toContain(t[lang].noPathTitle);
      for (const n of notes) expect(html, `${lang} ${n}`).toContain(NOTE_TEXT[n](lang));
    }
  });

  it("Luis without his old ID: the what-if button is offered, and a U.S. birth certificate would open a path", () => {
    const flips = flipsThatMatter(rules, luisNoOldId, "cheapest").flatMap((o) => (o.flip.kind === "doc" ? [o.flip.doc] : []));
    expect(flips).toContain("birth_cert_ca");
    for (const lang of LANGS) expect(render(luisNoOldId, lang)).toContain(t[lang].tryWhatIf);
  });

  it("when no single answer opens a path, the what-if button is not shown", () => {
    const person = { facts: { born: "la_county", age: 30, unhoused: false, hasWitnesses: true }, have: [] };
    expect(flipsThatMatter(rules, person, "cheapest")).toEqual([]);
    for (const lang of LANGS) expect(render(person, lang)).not.toContain(t[lang].tryWhatIf);
  });

  // Anyone born outside LA County gets the birthplace note at least.
  it.each(BORN.filter((b) => b !== "la_county"))("born %s: every dead end has at least one note", (born) => {
    for (const person of people(born)) if (!plan(rules, person)) expect(noPathNotes(rules, person), JSON.stringify(person)).not.toEqual([]);
  });

  // Someone born in LA County with two things missing gets each one named
  // (see ui-logic.test.ts).
  it("born in LA County: every dead end has at least one note", () => {
    for (const person of people("la_county")) if (!plan(rules, person)) expect(noPathNotes(rules, person), JSON.stringify(person)).not.toEqual([]);
  });
});

describe("no-path screen: who can help today", () => {
  const helpRows = (html: string) => [...html.matchAll(/<li><a class="link-row" href="tel:([^"]+)">(.*?)<\/a><\/li>/g)].map((m) => ({ tel: m[1], text: m[2].replace(/<[^>]+>/g, " ") }));

  it.each(LANGS)("%s: 211 is listed with a tel: link", (lang) => {
    const rows = helpRows(render(luisNoOldId, lang));
    expect(rows.map((r) => r.tel)).toContain("211");
  });

  // Open item: an adult like Luis is shown 211 and nothing else, since the
  // LAUSD Homeless Education Office serves students and is shown only to
  // people under 22. Unskip once an adult option whose own site says it
  // helps with ID or documents is added.
  it.skip.each(LANGS)("%s: at least one option for adults besides 211", (lang) => {
    const rows = helpRows(render(luisNoOldId, lang)).filter((r) => r.tel !== "211" && !/LAUSD|student|estudiant/i.test(r.text));
    expect(rows.length).toBeGreaterThan(0);
  });
});
