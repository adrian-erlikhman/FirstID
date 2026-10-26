// The printed packet must fit one Letter page, in English and in Spanish.
// A test can't print, so this is a proxy: it renders the real packet (as
// HTML, no browser) for every distinct path the planner can give, and checks
// the amount of text, the number of table rows and the number of "Say this"
// boxes stay within what the longest path had on Oct 25 2026. The print
// styles (src/styles.css, @media print) say that path fits one page.
//
// If this fails, the packet grew. Print the longest path (LONGEST below) in
// Spanish from the app and check it still fits one page. If it does, raise
// the budget to the new size; if not, shorten the text or tighten the print
// styles. Don't raise the budget without printing.
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import rulesJson from "../data/rules.json";
import { plan } from "../src/engine/planner";
import type { Mode, Person, Plan, RuleSet } from "../src/engine/types";
import type { Lang } from "../src/i18n";
import { PacketScreen } from "../src/screens/PacketScreen";
import { BORN, PAPER_SETS, people } from "./grid";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;

/** Characters of text on the printed sheet (spaces collapsed). Spanish was
 *  raised from 4300 on Oct 25 2026 for the "Nothing listed" line in empty
 *  Bring cells, after a Chrome print of LONGEST in Spanish measured 958px of
 *  the 979px page. */
const BUDGET: Record<Lang, number> = { en: 3600, es: 4330 };
/** Rows in the steps table. */
const MAX_ROWS = 6;
/** "Say this" boxes: three to a row when printed, so six is two rows. */
const MAX_SAYS = 6;

/** The longest path today: Maria without her Social Security number. */
const LONGEST: Person = { facts: { born: "la_county", age: 34, unhoused: true, hasWitnesses: true }, have: ["medi_cal_card"] };

beforeAll(() => { vi.stubGlobal("location", { href: "https://first-id.vercel.app/#/packet" }); });
afterAll(() => { vi.unstubAllGlobals(); });

function sheet(p: Plan, lang: Lang) {
  const html = renderToStaticMarkup(<PacketScreen rules={rules} lang={lang} result={p} />);
  const article = html.slice(html.indexOf("<article"));
  const text = article.replace(/<[^>]+>/g, " ").replace(/&[#\w]+;/g, "x").replace(/\s+/g, " ").trim();
  return {
    chars: text.length,
    rows: (article.match(/class="sheet-row"/g) ?? []).length,
    says: (article.match(/class="say-box"/g) ?? []).length,
  };
}

// One plan per distinct set of steps and waivers: step order doesn't change the text.
function distinctPlans(mode: Mode): Plan[] {
  const intake = Object.keys(rules.docs).filter((d) => rules.docs[d].askAtIntake);
  const papers = [...PAPER_SETS, ...intake.map((d) => [d])];
  const seen = new Map<string, Plan>();
  const add = (p: Plan | null) => { if (p) seen.set(p.steps.map((s) => `${s.action.id}+${s.waiver?.label.en ?? ""}`).sort().join(">"), p); };
  for (const born of BORN) for (const person of people(born, papers)) add(plan(rules, person, mode));
  for (const person of Object.values(personas)) add(plan(rules, person, mode));
  add(plan(rules, LONGEST, mode));
  return [...seen.values()];
}

describe("packet: one Letter page (proxy)", () => {
  it("the path named LONGEST has as many rows as the budget allows", () => {
    const p = plan(rules, LONGEST)!;
    expect(p.steps).toHaveLength(MAX_ROWS);
  });

  it.each(["cheapest", "fewestTrips", "fastest"] as Mode[])("%s: every path stays within the text, row and 'Say this' budget in English and Spanish", (mode) => {
    const over: string[] = [];
    for (const p of distinctPlans(mode)) {
      for (const lang of ["en", "es"] as Lang[]) {
        const m = sheet(p, lang);
        const ids = p.steps.map((s) => s.action.id).join(", ");
        if (m.chars > BUDGET[lang]) over.push(`${lang}: ${m.chars} characters > ${BUDGET[lang]} (${ids})`);
        if (m.rows > MAX_ROWS) over.push(`${lang}: ${m.rows} rows > ${MAX_ROWS} (${ids})`);
        if (m.says > MAX_SAYS) over.push(`${lang}: ${m.says} 'Say this' boxes > ${MAX_SAYS} (${ids})`);
      }
    }
    expect(over).toEqual([]);
  }, 30_000);

  it("the packet table has one row per step (so the row count above measures steps)", () => {
    const p = plan(rules, personas.maria)!;
    for (const lang of ["en", "es"] as Lang[]) expect(sheet(p, lang).rows, lang).toBe(p.steps.length);
  });

  it("the packet never prints a name or anything the person typed", () => {
    const p = plan(rules, personas.maria)!;
    for (const lang of ["en", "es"] as Lang[]) {
      const html = renderToStaticMarkup(<PacketScreen rules={rules} lang={lang} result={p} />);
      expect(html).not.toMatch(/Maria|María/);
    }
  });
});
