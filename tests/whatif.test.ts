// Feedback item 10: "What if" and "What would help most" must never suggest
// a document the path already gets you, a form only an agency can issue, a
// photo ID (the thing the person is trying to get), or a U.S. birth
// certificate to someone born abroad. Checked for every answer set the
// questions screen allows (tests/grid.ts), not just the personas.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { plan, whatHelps } from "../src/engine/planner";
import type { Mode, Person, Plan, RuleSet } from "../src/engine/types";
import { applyFlips, flipsThatMatter, samePlan } from "../src/whatif";
import { BORN, people } from "./grid";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;
const MODES: Mode[] = ["cheapest", "fewestTrips", "fastest"];
const PHOTO_IDS = ["us_passport", "old_ca_id_5yr", "immigration_doc"];

const score = (p: Plan | null) => (p ? [p.total.dollars, p.total.trips, p.total.days, p.total.steps] : [Infinity, Infinity, Infinity, Infinity]);
// The planner's own order for each sort mode (src/engine/planner.ts).
const keyFor = (mode: Mode, p: Plan | null) => {
  const [d, tr, dy, st] = score(p);
  return mode === "cheapest" ? [d, tr, dy, st] : mode === "fewestTrips" ? [tr, d, dy, st] : [dy, tr, d, st];
};
const lessThan = (a: number[], b: number[]) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

/** Every rule of item 10 for one person; returns what broke, as text. */
function problems(person: Person, mode: Mode): string[] {
  const out: string[] = [];
  const base = plan(rules, person, mode);
  const produced = new Set(base?.steps.flatMap((s) => s.action.produces) ?? []);
  const who = `${mode} ${JSON.stringify(person)}`;

  for (const o of flipsThatMatter(rules, person, mode, 99)) {
    if (samePlan(o.plan, base)) out.push(`what-if shows a change that changes nothing: ${JSON.stringify(o.flip)} for ${who}`);
    // flipsThatMatter ranks by cost first in every mode, so 'better' means cheaper overall.
    if (o.better !== lessThan(score(o.plan), score(base))) out.push(`what-if 'better' is wrong for ${JSON.stringify(o.flip)}, ${who}`);
    if (o.flip.kind !== "doc") continue;
    const d = o.flip.doc;
    if (produced.has(d)) out.push(`what-if suggests ${d}, which the path already gets: ${who}`);
    if (person.have.includes(d)) out.push(`what-if suggests ${d}, which they already have: ${who}`);
    if (!rules.docs[d].askAtIntake) out.push(`what-if suggests ${d}, a form only an agency issues: ${who}`);
    if (d === "birth_cert_ca" && person.facts.born === "abroad") out.push(`what-if suggests a U.S. birth certificate to someone born abroad: ${who}`);
  }

  for (const h of whatHelps(rules, person, mode)) {
    if (produced.has(h.doc)) out.push(`'what would help' suggests ${h.doc}, which the path already gets: ${who}`);
    if (PHOTO_IDS.includes(h.doc)) out.push(`'what would help' suggests a photo ID (${h.doc}): ${who}`);
    if (!rules.docs[h.doc].askAtIntake) out.push(`'what would help' suggests ${h.doc}, a form only an agency issues: ${who}`);
    if (h.doc === "birth_cert_ca" && person.facts.born === "abroad") out.push(`'what would help' suggests a U.S. birth certificate to someone born abroad: ${who}`);
    const withIt = plan(rules, { ...person, have: [...person.have, h.doc] }, mode);
    if (!withIt || !lessThan(keyFor(mode, withIt), keyFor(mode, base))) out.push(`'what would help' suggests ${h.doc} but it doesn't help: ${who}`);
  }
  return out;
}

describe("what-if and 'what would help most' (feedback item 10)", () => {
  it.each(BORN)("born %s: no bad suggestion for any answer set (cheapest)", (born) => {
    const found: string[] = [];
    for (const person of people(born)) found.push(...problems(person, "cheapest"));
    expect(found.slice(0, 5)).toEqual([]);
  }, 30_000);

  it.each(Object.keys(personas))("%s: no bad suggestion in any sort mode", (name) => {
    for (const mode of MODES) expect(problems(personas[name], mode)).toEqual([]);
  });

  it("a birth certificate suggested to someone born in another state is labelled 'any state', in both languages", () => {
    const label = rules.docs.birth_cert_ca.label;
    expect(label.en).toMatch(/any state/i);
    expect(label.es).toMatch(/cualquier estado/i);
  });

  it("Luis without his old ID is offered a U.S. birth certificate, never a California one only", () => {
    const luis = { facts: personas.luis.facts, have: personas.luis.have.filter((d) => d !== "dmv_record") };
    const docs = flipsThatMatter(rules, luis, "cheapest", 99).flatMap((o) => (o.flip.kind === "doc" ? [o.flip.doc] : []));
    expect(docs).toContain("birth_cert_ca");
    expect(rules.docs.birth_cert_ca.label.en).not.toMatch(/^California|California birth/i);
  });

  it("applying a what-if only adds papers or turns answers, never removes a paper", () => {
    for (const p of Object.values(personas)) {
      for (const o of flipsThatMatter(rules, p, "cheapest", 99)) {
        const next = applyFlips(p, [o.flip]);
        for (const d of p.have) expect(next.have, JSON.stringify(o.flip)).toContain(d);
        expect(next.facts.born).toBe(p.facts.born);
        expect(next.facts.age).toBe(p.facts.age);
      }
    }
  });
});
