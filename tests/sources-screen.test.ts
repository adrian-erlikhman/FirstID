// "How we know" has to show every source the app relies on. A fee waiver
// cites its own sources (the free ID at 62, the fire-survivor records...), and
// the step's sources don't cover them.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { ruleSources } from "../src/screens/SourcesScreen";

const rules = rulesJson as unknown as RuleSet;

describe("How we know lists every source", () => {
  it("every source a rule or a fee waiver cites is listed under some rule", () => {
    const listed = new Set(rules.actions.flatMap((a) => ruleSources(a).flatMap((g) => g.ids)));
    const cited = rules.actions.flatMap((a) => [...a.sources, ...(a.waivers ?? []).flatMap((w) => w.sources)]);
    expect(cited.filter((id) => !listed.has(id))).toEqual([]);
  });

  it("each rule lists its own sources first, then each waiver under its own name", () => {
    for (const a of rules.actions) {
      const groups = ruleSources(a);
      expect(groups[0]).toEqual({ waiver: null, ids: a.sources });
      expect(groups.slice(1).map((g) => g.waiver)).toEqual(a.waivers ?? []);
    }
  });

  it("the rules do have waiver-only sources, so this matters", () => {
    const stepSources = new Set(rules.actions.flatMap((a) => a.sources));
    const waiverOnly = rules.actions.flatMap((a) => (a.waivers ?? []).flatMap((w) => w.sources)).filter((id) => !stepSources.has(id));
    expect(waiverOnly.length).toBeGreaterThan(0);
  });
});
