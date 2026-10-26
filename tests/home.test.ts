import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { waiverKinds } from "../src/screens/HomeParts";

const rules = rulesJson as unknown as RuleSet;

describe("home page counts", () => {
  it("counts a fee waiver once even when two rules offer it", () => {
    const listed = rules.actions.reduce((n, a) => n + (a.waivers?.length ?? 0), 0);
    expect(waiverKinds(rules)).toBe(7); // the 10 listed in data/rules.json, 0.1-draft-2026-10-18
    expect(listed).toBeGreaterThan(waiverKinds(rules));
  });
});
