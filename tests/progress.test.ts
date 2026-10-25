import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { plan } from "../src/engine/planner";
import {
  PROGRESS_KEY, addDays, icsDate, icsFold, icsUnescape, loadTicks, parseIcs, reminderFor, reminderIcs, saveTicks, ticksInPlan, toggleTick,
} from "../src/progress";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;

function memStore() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    m,
  };
}

const broken = {
  getItem: () => { throw new Error("blocked"); },
  setItem: () => { throw new Error("blocked"); },
  removeItem: () => { throw new Error("blocked"); },
};

describe("progress ticks", () => {
  it("round-trips through storage, keyed by step id", () => {
    const st = memStore();
    let ticks = toggleTick({}, "rrcc_mail", true);
    ticks = toggleTick(ticks, "dmv_original", true);
    ticks = toggleTick(ticks, "dmv_original", false);
    saveTicks(ticks, st);
    expect(JSON.parse(st.m.get(PROGRESS_KEY)!)).toEqual({ rrcc_mail: true });
    expect(loadTicks(st)).toEqual({ rrcc_mail: true });
  });

  it("clearing removes the key", () => {
    const st = memStore();
    saveTicks({ a: true }, st);
    saveTicks({}, st);
    expect(st.m.has(PROGRESS_KEY)).toBe(false);
  });

  it("survives blocked storage and junk", () => {
    expect(loadTicks(broken)).toEqual({});
    expect(() => saveTicks({ a: true }, broken)).not.toThrow();
    expect(loadTicks(null)).toEqual({});
    const st = memStore();
    st.setItem(PROGRESS_KEY, "{not json");
    expect(loadTicks(st)).toEqual({});
    st.setItem(PROGRESS_KEY, JSON.stringify(["x"]));
    expect(loadTicks(st)).toEqual({});
    st.setItem(PROGRESS_KEY, JSON.stringify({ a: true, b: "yes", c: 1 }));
    expect(loadTicks(st)).toEqual({ a: true });
  });

  it("shows only ticks for steps still in the plan", () => {
    const shown = ticksInPlan({ rrcc_mail: true, gone_step: true }, ["program_dl933", "rrcc_mail", "dmv_original"]);
    expect([...shown]).toEqual(["rrcc_mail"]);
  });
});

describe("calendar reminders", () => {
  const now = new Date(2026, 9, 25, 10, 30, 0); // Oct 25 2026, local

  it("adds days on the calendar, across month ends", () => {
    const d = addDays(now, 28);
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 22]);
  });

  it("offers reminders only for steps that wait, on the day the step should finish", () => {
    const p = plan(rules, personas.maria)!;
    for (const [i, st] of p.steps.entries()) {
      const r = reminderFor(rules, st, i + 1, "en");
      if (st.action.days > 0) expect(r?.days).toBe(st.endDay);
      else expect(r).toBeNull();
    }
    expect(p.steps.some((st) => st.action.days > 0)).toBe(true);
  });

  it("names the birth certificate in English and Spanish", () => {
    const p = plan(rules, personas.maria)!;
    const i = p.steps.findIndex((st) => st.action.id === "rrcc_mail");
    expect(i).toBeGreaterThanOrEqual(0);
    expect(reminderFor(rules, p.steps[i], i + 1, "en")!.summary).toBe("Check your mail for your birth certificate");
    expect(reminderFor(rules, p.steps[i], i + 1, "es")!.summary).toMatch(/acta de nacimiento/);
  });

  it("writes a valid iCalendar file that parses back", () => {
    const p = plan(rules, personas.maria)!;
    const i = p.steps.findIndex((st) => st.action.id === "rrcc_mail");
    for (const lang of ["en", "es"] as const) {
      const r = reminderFor(rules, p.steps[i], i + 1, lang)!;
      const text = reminderIcs(r, now, "test-uid");
      expect(text.endsWith("\r\n")).toBe(true);
      expect(text.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
      for (const line of text.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);

      const comps = parseIcs(text);
      const cal = comps.find((c) => c.name === "VCALENDAR")!;
      const ev = comps.find((c) => c.name === "VEVENT")!;
      expect(cal.props.VERSION.value).toBe("2.0");
      expect(cal.props.PRODID.value).toBeTruthy();
      expect(ev.props.UID.value).toBe("test-uid-rrcc_mail@first-id");
      expect(ev.props.DTSTAMP.value).toMatch(/^\d{8}T\d{6}Z$/);
      expect(ev.props.DTSTART.params).toBe("VALUE=DATE");
      // The step's end day in the plan, not today + its own wait.
      const end = p.steps[i].endDay;
      expect(ev.props.DTSTART.value).toBe(icsDate(addDays(now, end)));
      expect(ev.props.DTEND.value).toBe(icsDate(addDays(now, end + 1)));
      expect(icsUnescape(ev.props.SUMMARY.value)).toBe(r.summary);
      expect(icsUnescape(ev.props.DESCRIPTION.value)).toBe(r.description);
      expect(icsUnescape(ev.props.DESCRIPTION.value)).toContain(p.steps[i].action.label[lang]);
      // Only one event, and no deadline beyond the step's own wait.
      expect(comps.filter((c) => c.name === "VEVENT")).toHaveLength(1);
      expect(text).not.toMatch(/90/);
    }
  });

  it("escapes and folds long text", () => {
    const text = reminderIcs({ id: "x", days: 1, summary: "a, b; c\\d", description: "ñ".repeat(100) }, now, "u");
    const ev = parseIcs(text).find((c) => c.name === "VEVENT")!;
    expect(ev.props.SUMMARY.value).toBe("a\\, b\\; c\\\\d");
    expect(icsUnescape(ev.props.DESCRIPTION.value)).toBe("ñ".repeat(100));
    expect(icsFold("x".repeat(200)).split("\r\n ").map((l) => l.length)).toEqual([75, 74, 51]);
  });
});
