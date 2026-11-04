import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { DAYS, groupHours, laNow, officeData, openNow, parseHours, sortOffices, zipCentroids } from "../src/offices";
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

  it("the offices route round-trips, and parses without a step number", () => {
    expect(parse(href({ name: "offices", kind: "dmv", n: 3 }))).toEqual({ name: "offices", kind: "dmv", n: 3 });
    expect(parse("#/offices/dmv")).toEqual({ name: "offices", kind: "dmv" });
  });
});

describe("open now, in Los Angeles time", () => {
  // Arleta's listed hours: Wednesday opens an hour later.
  const hours = { mon: "8:00 am–5:00 pm", tue: "8:00 am–5:00 pm", wed: "9:00 am–5:00 pm", thu: "8:00 am–5:00 pm", fri: "8:00 am–5:00 pm", sat: "closed", sun: "closed" } as const;
  const at = (iso: string) => new Date(iso);

  it("reads the time in Los Angeles, whatever the phone's time zone (PST in November, PDT in July)", () => {
    expect(laNow(at("2026-11-03T18:00:00Z"))).toEqual({ day: "tue", minutes: 10 * 60 });
    expect(laNow(at("2026-07-14T15:30:00Z"))).toEqual({ day: "tue", minutes: 8 * 60 + 30 });
    expect(laNow(at("2026-11-04T07:59:00Z"))).toEqual({ day: "tue", minutes: 23 * 60 + 59 }); // Wednesday in UTC, still Tuesday in LA
  });

  it.each([
    ["2026-11-03T15:59:00Z", "Tue 7:59 am", false],
    ["2026-11-03T16:00:00Z", "Tue 8:00 am", true],
    ["2026-11-03T18:00:00Z", "Tue 10:00 am", true],
    ["2026-11-04T00:59:00Z", "Tue 4:59 pm", true],
    ["2026-11-04T01:00:00Z", "Tue 5:00 pm", false],
    ["2026-11-04T16:30:00Z", "Wed 8:30 am (opens at 9)", false],
    ["2026-11-04T17:00:00Z", "Wed 9:00 am", true],
    ["2026-11-07T19:00:00Z", "Sat 11:00 am", false],
    ["2026-07-14T15:30:00Z", "Tue 8:30 am, summer time", true],
  ] as const)("%s (%s): open %s", (iso, _, open) => {
    const r = openNow(hours, at(iso));
    expect(r?.open).toBe(open);
    if (r?.open) expect(r.until).toBe("5:00 pm");
  });

  it("reads the hours the snapshot uses, and says nothing when it can't read them", () => {
    expect(parseHours("8:00 am–5:00 pm")).toEqual({ open: 480, close: 1020 });
    expect(parseHours("12:00 pm–1:00 pm")).toEqual({ open: 720, close: 780 });
    expect(parseHours("10:30 AM - 4:15 PM")).toEqual({ open: 630, close: 975 });
    expect(parseHours("closed")).toBeNull();
    expect(parseHours("by appointment")).toBeNull();
    expect(openNow({ ...hours, tue: "by appointment" }, at("2026-11-03T18:00:00Z"))).toBeNull();
  });

  it("every office's hours in the snapshot can be read", () => {
    for (const o of officeData.offices) {
      for (const d of DAYS) {
        const v = o.hours?.[d];
        if (v !== undefined && v.trim().toLowerCase() !== "closed") expect(parseHours(v), `${o.id} ${d}: ${v}`).not.toBeNull();
      }
    }
  });
});
