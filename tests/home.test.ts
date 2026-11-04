import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { t } from "../src/i18n";
import { waiverKinds } from "../src/screens/HomeParts";
import { sentences } from "../src/screens/HomeScreen";

const rules = rulesJson as unknown as RuleSet;

describe("home page counts", () => {
  it("counts a fee waiver once even when two rules offer it", () => {
    const listed = rules.actions.reduce((n, a) => n + (a.waivers?.length ?? 0), 0);
    expect(waiverKinds(rules)).toBe(7); // the 10 listed in data/rules.json, 0.1-draft-2026-10-18
    expect(listed).toBeGreaterThan(waiverKinds(rules));
  });
});

// Safari reads regex lookbehind only from 16.4, and the build turns one into
// new RegExp(), which throws where it runs. The headline's splitter used one,
// so iPhones on iOS 15 (and 16.0-16.3) got a blank home page.
describe("the headline works on older iPhones", () => {
  const old = (text: string) => text.split(/(?<=[.!?])\s+/); // Node has lookbehind

  it("splits every string in the app as the lookbehind did", () => {
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") strings.push(v);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(t);
    expect(strings.length).toBeGreaterThan(200);
    for (const s of strings) expect(sentences(s), s).toEqual(old(s));
    for (const s of ["No ID", "No ID.", "One.  Two!\nThree? Four", "¿Sin ID?  ¡Hay salida! Sí.", " Lead. ", "a.b. c"]) expect(sentences(s)).toEqual(old(s));
  });

  it("no source file uses a lookbehind", () => {
    const root = fileURLToPath(new URL("../src/", import.meta.url));
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
    const found = walk(root).flatMap((f) => readFileSync(f, "utf8").split("\n")
      .filter((line) => !/^\s*(\/\/|\*)/.test(line) && /\(\?<[=!]/.test(line)).map((line) => `${f}: ${line.trim()}`));
    expect(found).toEqual([]);
  });
});
