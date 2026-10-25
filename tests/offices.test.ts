import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { DAYS, groupHours, officeData, sortOffices, zipCentroids } from "../src/offices";
import { parse, href } from "../src/router";

const places = Object.keys((rulesJson as unknown as { places: Record<string, unknown> }).places);

describe("office snapshot (data/offices.json)", () => {
  it("has offices", () => expect(officeData.offices.length).toBeGreaterThan(0));

  it.each(officeData.offices.map((o) => [o.id, o] as const))("%s has the required fields and an official source", (_, o) => {
    for (const k of ["id", "kind", "name", "address", "city", "zip", "source", "lastChecked"] as const) {
      expect(typeof o[k], k).toBe("string");
      expect((o[k] as string).trim(), k).not.toBe("");
    }
    expect(places).toContain(o.kind);
    expect(o.zip).toMatch(/^\d{5}$/);
    expect(o.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const url = new URL(o.source);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toMatch(/(^|\.)(dmv\.ca\.gov|ssa\.gov|lavote\.gov)$/);
    expect(officeData.sources[o.kind]?.page).toMatch(/^https:\/\//);
    if (o.lat !== undefined || o.lon !== undefined) {
      expect(o.lat!).toBeGreaterThan(33.2); expect(o.lat!).toBeLessThan(35);
      expect(o.lon!).toBeGreaterThan(-119); expect(o.lon!).toBeLessThan(-117.5);
    }
    if (o.hours) for (const d of DAYS) expect(o.hours[d], d).toMatch(/^(closed|\d{1,2}:\d{2} [ap]m–\d{1,2}:\d{2} [ap]m)$/);
    if (o.phone !== undefined) expect(o.phone).toMatch(/\d{3}.*\d{4}/);
  });

  it("ids are unique", () => {
    const ids = officeData.offices.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("office ZIPs are in the LA County ZIP table", () => {
    for (const o of officeData.offices) expect(zipCentroids[o.zip], o.id).toBeDefined();
  });
});

describe("office sorting", () => {
  it("sorts nearest first for a known ZIP", () => {
    const dmv = officeData.offices.filter((o) => o.kind === "dmv");
    expect(sortOffices(dmv, "93534")[0].office.city).toBe("Lancaster");
    expect(sortOffices(dmv, "90731")[0].office.city).toBe("San Pedro");
  });

  it("falls back to A to Z by city without a ZIP", () => {
    const rows = sortOffices(officeData.offices, "");
    const cities = rows.map((r) => r.office.city);
    expect(cities).toEqual([...cities].sort((a, b) => a.localeCompare(b)));
    expect(rows.every((r) => r.mi === undefined)).toBe(true);
  });

  it("groups days with the same hours", () => {
    const g = groupHours({ mon: "8–5", tue: "8–5", wed: "9–5", thu: "8–5", fri: "8–5", sat: "closed", sun: "closed" });
    expect(g.map((x) => `${x.from}-${x.to}`)).toEqual(["mon-tue", "wed-wed", "thu-fri", "sat-sun"]);
  });

  it("has a route that round-trips", () => {
    expect(parse(href({ name: "offices", kind: "dmv", n: 3 }))).toEqual({ name: "offices", kind: "dmv", n: 3 });
    expect(parse("#/offices/dmv")).toEqual({ name: "offices", kind: "dmv" });
  });
});
