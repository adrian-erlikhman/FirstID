// English and Spanish, always. TypeScript already makes the Spanish object
// have every top-level key the English one has; these tests check what the
// compiler can't: the keys inside the lookup tables (step names, fact labels,
// form captions...), list lengths, empty strings, and that every string
// function gives readable text in both languages.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { t, type Lang } from "../src/i18n";
import { FLIPPABLE_FACTS } from "../src/whatif";

const rules = rulesJson as unknown as RuleSet;
const { en, es } = t;

/** Every path to a plain value: "stepShort.rrcc_mail", "how.0.1", "free"... */
function leaves(x: unknown, path = ""): Map<string, unknown> {
  const out = new Map<string, unknown>();
  if (x !== null && typeof x === "object") {
    for (const [k, v] of Object.entries(x)) for (const [p, leaf] of leaves(v, path ? `${path}.${k}` : k)) out.set(p, leaf);
  } else out.set(path, x);
  return out;
}

const enLeaves = leaves(en);
const esLeaves = leaves(es);

// Sample arguments for string functions that can't take the default (1, 2, 3, 4).
const ARGS: Record<string, unknown[]> = {
  cardSummary: [{ name: "Maria", total: 15, full: 89, steps: 5, trips: 3, days: 49 }],
  checkedOn: ["2026-10-25"],
  rulesVersion: ["0.1"],
  packetFoot: ["https://first-id.vercel.app/#/sources"],
  trailGets: ["X"],
  officesLink: ["dmv"],
  officesTitle: ["dmv"],
  officesSortedNear: ["90012"],
  officesCall: ["(213) 555-0100"],
  officesTo: ["X"],
  remindSummary: ["X"],
  remindDescription: [2, "X", 28],
  nowWas: ["$15", "5 steps", "3 trips", "~7 wks"],
};

// Strings that are blank on purpose in one language.
const BLANK_OK = new Set(["en.inEnglish"]);

describe("i18n: English and Spanish have the same keys", () => {
  it("every English key, nested ones included, exists in Spanish", () => {
    const missing = [...enLeaves.keys()].filter((k) => !esLeaves.has(k));
    expect(missing).toEqual([]);
  });

  it("every Spanish key, nested ones included, exists in English", () => {
    const extra = [...esLeaves.keys()].filter((k) => !enLeaves.has(k));
    expect(extra).toEqual([]);
  });

  it("each key is the same kind of thing in both (text, list, function)", () => {
    const differ = [...enLeaves.keys()].filter((k) => esLeaves.has(k) && typeof enLeaves.get(k) !== typeof esLeaves.get(k));
    expect(differ).toEqual([]);
  });

  it("lists have the same length in both languages", () => {
    for (const [k, v] of Object.entries(en)) {
      if (Array.isArray(v)) expect((es as Record<string, unknown>)[k], k).toHaveLength(v.length);
    }
  });
});

describe("i18n: no blank or broken text", () => {
  it("no string is empty", () => {
    const blank: string[] = [];
    for (const [lang, map] of [["en", enLeaves], ["es", esLeaves]] as const)
      for (const [k, v] of map) if (typeof v === "string" && !v.trim() && !BLANK_OK.has(`${lang}.${k}`)) blank.push(`${lang}.${k}`);
    expect(blank).toEqual([]);
  });

  it("nothing of three words or more was left in English on the Spanish side", () => {
    const same = [...enLeaves].filter(([k, v]) => typeof v === "string" && v.split(/\s+/).length >= 3 && esLeaves.get(k) === v).map(([k]) => k);
    expect(same).toEqual([]);
  });

  it.each(["en", "es"] as Lang[])("every string function gives readable text (%s)", (lang) => {
    for (const [k, v] of Object.entries(t[lang])) {
      if (typeof v !== "function") continue;
      const out = (v as (...a: unknown[]) => unknown)(...(ARGS[k] ?? [1, 2, 3, 4]));
      expect(typeof out, k).toBe("string");
      expect((out as string).trim(), k).not.toBe("");
      expect(out as string, k).not.toMatch(/undefined|NaN|\[object Object\]/);
    }
  });

  it("number-taking functions give no undefined or NaN for 0, 1 and many, in both languages", () => {
    for (const lang of ["en", "es"] as Lang[]) {
      const s = t[lang];
      for (const n of [0, 1, 2, 6, 7, 30, 49]) {
        for (const out of [s.timeShort(n), s.readyIn(n), s.startsAround(n), s.unitSteps(n), s.unitTrips(n), s.withWaivers(n)])
          expect(out, `${lang} ${n}`).not.toMatch(/undefined|NaN/);
      }
    }
  });
});

describe("i18n: lookup tables cover what the app looks up", () => {
  it("every rule has a short name for the step list, in both languages", () => {
    for (const a of rules.actions) {
      expect(en.stepShort[a.id], a.id).toBeTruthy();
      expect(es.stepShort[a.id], a.id).toBeTruthy();
    }
  });

  it("every yes/no answer the what-if screen can flip has a label in both languages", () => {
    for (const f of FLIPPABLE_FACTS) {
      expect(en.factLabels[f], f).toBeTruthy();
      expect(es.factLabels[f], f).toBeTruthy();
    }
  });

  it("every sort mode has a hint in both languages", () => {
    for (const m of ["cheapest", "fewestTrips", "fastest"]) {
      expect(en.modeHint[m], m).toBeTruthy();
      expect(es.modeHint[m], m).toBeTruthy();
    }
  });

  it("age bands, document labels and place labels exist in both languages", () => {
    expect(es.ageBands).toHaveLength(en.ageBands.length);
    for (const [id, d] of Object.entries(rules.docs)) {
      expect(d.label.en.trim(), id).not.toBe("");
      expect(d.label.es.trim(), id).not.toBe("");
    }
    for (const [id, p] of Object.entries(rules.places)) {
      expect(p.label.en.trim(), id).not.toBe("");
      expect(p.label.es.trim(), id).not.toBe("");
    }
  });
});
