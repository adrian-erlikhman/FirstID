// Invariants on data/rules.json that the team relies on, stated as tests so a
// broken edit fails CI with a plain message. These never check a fee or a day
// count against anything: numbers are checked by people against the sources.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { Action, RuleSet, SourceId } from "../src/engine/types";

const rules = rulesJson as unknown as RuleSet;

/** Every source a rule leans on: its own and its waivers'. */
const sourcesOf = (a: Action): SourceId[] => [...a.sources, ...(a.waivers ?? []).flatMap((w) => w.sources)];

/** A quote still waiting for someone to copy the real sentence. */
const isTodo = (quote: string) => !quote.trim() || /\bTODO\b/i.test(quote);

/**
 * Rules marked verified whose sources still have a TODO quote. A teammate
 * marks a rule verified only after reading every source (CONTRIBUTING.md); a
 * TODO quote means that hasn't happened yet, so the two can't both be true.
 */
function verifiedWithoutQuotes(r: RuleSet): string[] {
  const bad: string[] = [];
  for (const a of r.actions) {
    if (!a.verified) continue;
    for (const id of sourcesOf(a)) if (!r.sources[id] || isTodo(r.sources[id].quote)) bad.push(`${a.id} → ${id}`);
  }
  return bad;
}

/** Every user-facing text field on a rule, as [where, {en, es}]. */
function texts(a: Action): [string, { en: string; es: string } | undefined][] {
  return [
    ["label", a.label],
    ["why", a.why],
    ["say", a.say],
    ...(a.bring ?? []).map((b, i) => [`bring[${i}]`, b] as [string, { en: string; es: string }]),
    ...(a.waivers ?? []).flatMap((w, i) => [
      [`waivers[${i}].label`, w.label],
      [`waivers[${i}].say`, w.say],
    ] as [string, { en: string; es: string } | undefined][]),
  ];
}

describe("rules.json: every rule cites its sources", () => {
  it.each(rules.actions.map((a) => [a.id, a] as const))("%s cites at least one source", (_, a) => {
    expect(a.sources.length).toBeGreaterThan(0);
  });

  it.each(rules.actions.filter((a) => a.waivers?.length).map((a) => [a.id, a] as const))("%s: every fee waiver cites at least one source", (_, a) => {
    for (const [i, w] of (a.waivers ?? []).entries()) expect(w.sources.length, `waiver ${i} (${w.label.en})`).toBeGreaterThan(0);
  });

  it("every source id a rule or waiver cites exists in the sources list", () => {
    const missing = rules.actions.flatMap((a) => sourcesOf(a).filter((id) => !rules.sources[id]).map((id) => `${a.id} → ${id}`));
    expect(missing).toEqual([]);
  });

  it("each source's id matches its key, and it has a title and https link", () => {
    for (const [key, s] of Object.entries(rules.sources)) {
      expect(s.id, key).toBe(key);
      expect(s.title.trim(), key).not.toBe("");
      expect(new URL(s.url).protocol, key).toBe("https:");
    }
  });

  it("no rule cites the same source twice", () => {
    for (const a of rules.actions) expect(new Set(a.sources).size, a.id).toBe(a.sources.length);
  });
});

describe("rules.json: English and Spanish for every user-facing field", () => {
  it.each(rules.actions.map((a) => [a.id, a] as const))("%s", (_, a) => {
    for (const [field, text] of texts(a)) {
      if (field === "label" || field.endsWith(".label")) expect(text, field).toBeDefined();
      if (!text) continue;
      expect(typeof text.en, `${field}.en`).toBe("string");
      expect(typeof text.es, `${field}.es`).toBe("string");
      expect(text.en.trim(), `${field}.en`).not.toBe("");
      expect(text.es.trim(), `${field}.es`).not.toBe("");
    }
  });
});

describe("rules.json: verified only with real quotes", () => {
  it("no rule is verified while one of its sources still has a TODO quote", () => {
    expect(verifiedWithoutQuotes(rules)).toEqual([]);
  });

  it("the check above catches a verified rule with a TODO quote (on a copy, never the real file)", () => {
    const copy: RuleSet = structuredClone(rules);
    const a = copy.actions[0];
    a.verified = true;
    for (const id of sourcesOf(a)) copy.sources[id] = { ...copy.sources[id], quote: "Real sentence from the page." };
    expect(verifiedWithoutQuotes(copy)).toEqual([]);
    copy.sources[a.sources[0]].quote = "TODO: copy the line";
    expect(verifiedWithoutQuotes(copy)).toEqual([`${a.id} → ${a.sources[0]}`]);
  });

  it("the check treats a quote as missing when it is blank or says TODO", () => {
    expect(isTodo("TODO: copy the line")).toBe(true);
    expect(isTodo("  ")).toBe(true);
    expect(isTodo("Card not required.")).toBe(false);
  });
});
