// The answers saved in the tab are read back with care: whatever is stored,
// the app starts. A save of the wrong shape (an older version of the app, a
// paper or step the rules no longer have) loses only the answers that don't fit.
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { clearSaved, readSaved, SAVE_KEY, type Saved } from "../src/saved";

const rules = rulesJson as unknown as RuleSet;
const doc = Object.keys(rules.docs)[0];
const step = rules.actions[0].id;

describe("reading the saved answers", () => {
  it("a save the app wrote comes back whole", () => {
    const save: Saved = {
      have: [doc], facts: { born: "la_county", age: 30, unhoused: true }, unsure: ["fireSurvivor"], answered: true,
      skip: [step], mode: "fewestTrips", lang: "es", example: true,
      own: { have: [], facts: { born: "abroad" }, unsure: [], answered: true, skip: [] },
    };
    expect(readSaved(JSON.stringify(save), rules)).toEqual(save);
    expect(readSaved(JSON.stringify({ ...save, own: null }), rules).own).toBeNull();
  });

  it("nothing saved, or not JSON, or not an object: a blank start", () => {
    for (const raw of [null, "", "{", "null", "[]", '"text"', "42", "true"]) expect(readSaved(raw, rules), String(raw)).toEqual({});
  });

  it("drops each answer of the wrong shape and keeps the rest", () => {
    const raw = JSON.stringify({
      lang: "fr", mode: "quickest", have: "birth_certificate", facts: [1, 2], unsure: [3, "age"],
      skip: { a: 1 }, answered: "yes", example: 1, own: "Maria",
    });
    expect(readSaved(raw, rules)).toEqual({ unsure: ["age"] });
  });

  it("keeps only facts with plain values", () => {
    const raw = JSON.stringify({ facts: { born: "la_county", age: 30, unhoused: false, odd: { x: 1 }, list: [1], gone: null } });
    expect(readSaved(raw, rules).facts).toEqual({ born: "la_county", age: 30, unhoused: false });
  });

  it("forgets papers and steps the rules no longer have", () => {
    const raw = JSON.stringify({ have: [doc, "a_paper_since_removed"], skip: ["a_step_since_removed", step], own: { have: ["gone"], skip: ["gone"], answered: true } });
    const out = readSaved(raw, rules);
    expect(out.have).toEqual([doc]);
    expect(out.skip).toEqual([step]);
    expect(out.own).toEqual({ have: [], facts: {}, unsure: [], answered: true, skip: [] });
  });

  it("App reads its save only through readSaved", () => {
    const app = readFileSync(fileURLToPath(new URL("../src/App.tsx", import.meta.url)), "utf8");
    expect(app).toContain("readSaved(sessionStorage.getItem(SAVE_KEY), rules)");
    expect(app).not.toMatch(/JSON\.parse\(sessionStorage/);
  });
});

describe("Start over on the crash page", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("forgets the saved answers, so a bad save can't fail the same way again", () => {
    const store = new Map([[SAVE_KEY, "{}"], ["firstid.ticks.v1", "{}"]]);
    vi.stubGlobal("sessionStorage", { removeItem: (k: string) => store.delete(k) });
    clearSaved();
    expect([...store.keys()]).toEqual(["firstid.ticks.v1"]);
  });

  it("with storage blocked, it still goes on", () => {
    vi.stubGlobal("sessionStorage", { removeItem: () => { throw new Error("blocked"); } });
    expect(() => clearSaved()).not.toThrow();
  });

  it("the crash page's Start over calls it", () => {
    const src = readFileSync(fileURLToPath(new URL("../src/ErrorBoundary.tsx", import.meta.url)), "utf8");
    expect(src).toMatch(/onClick=\{\(\) => \{ clearSaved\(\);/);
  });
});
