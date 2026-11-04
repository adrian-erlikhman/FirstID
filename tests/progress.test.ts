import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import type { RuleSet } from "../src/engine/types";
import { plan } from "../src/engine/planner";
import {
  PROGRESS_KEY, addDays, clearTicks, daysLeft, icsDate, icsFold, icsUnescape, lastWaitBefore, loadTicks, parseIcs, reminderFor, reminderIcs, remindersFor, remindersIcs, saveTicks, ticksInPlan, toggleTick,
} from "../src/progress";
import { personas } from "./personas";
import { t } from "../src/i18n";
import { whenLine } from "../src/screens/PathScreen";

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

  it("Start over forgets every tick, including steps outside the current plan", () => {
    const st = memStore();
    saveTicks({ program_bc_affidavit: true, dcfs_documents: true }, st);
    clearTicks(st);
    expect(st.m.has(PROGRESS_KEY)).toBe(false);
    expect(loadTicks(st)).toEqual({});
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

  it("offers no reminder for a step already ticked done", () => {
    const p = plan(rules, personas.maria)!;
    const i = p.steps.findIndex((st) => st.action.days > 0);
    expect(reminderFor(rules, p.steps[i], i + 1, "en")).not.toBeNull();
    expect(reminderFor(rules, p.steps[i], i + 1, "en", true)).toBeNull();
    expect(reminderFor(rules, p.steps[i], i + 1, "es", true)).toBeNull();
  });

  it("with nothing ticked, the days left to each step are the planner's endDay", () => {
    for (const person of Object.values(personas)) {
      const p = plan(rules, person);
      if (!p) continue;
      for (const [i, st] of p.steps.entries()) expect(daysLeft(p.steps, i), st.action.id).toBe(st.endDay);
    }
  });

  it("a wait ticked done no longer pushes back the reminders after it", () => {
    const p = plan(rules, personas.maria)!;
    const waits = p.steps.flatMap((st, i) => (st.action.days > 0 ? [i] : []));
    expect(waits.length, "Maria's path has two steps that wait").toBeGreaterThanOrEqual(2);
    const [first, later] = waits;
    const st = p.steps[later];
    // Nothing ticked: the later reminder counts both waits.
    expect(reminderFor(rules, st, later + 1, "en", false, daysLeft(p.steps, later))!.days).toBe(st.endDay);
    // The first wait is over: only the later step's own wait (and any other
    // unticked wait before it) is left.
    const done = new Set([p.steps[first].action.id]);
    const left = daysLeft(p.steps, later, done);
    expect(left).toBe(st.endDay - p.steps[first].action.days);
    expect(reminderFor(rules, st, later + 1, "en", false, left)!.days).toBe(left);
    // Ticking a step after it changes nothing for it.
    expect(daysLeft(p.steps, first, new Set([st.action.id]))).toBe(p.steps[first].endDay);
  });

  it("the path screen's start line also drops a wait ticked done, so it agrees with the reminder", () => {
    const p = plan(rules, personas.maria)!;
    const waits = p.steps.flatMap((st, i) => (st.action.days > 0 ? [i] : []));
    const [first, later] = waits;
    for (const lang of ["en", "es"] as const) {
      const s = t[lang];
      // Nothing ticked: the planner's own startDay.
      expect(whenLine(rules, p.steps, later, lang)).toContain(s.startsAround(p.steps[later].startDay));
      // The wait before it is over: it can start today.
      const done = new Set([p.steps[first].action.id]);
      expect(daysLeft(p.steps, later - 1, done)).toBe(0);
      expect(whenLine(rules, p.steps, later, lang, done).startsWith(s.startsToday)).toBe(true);
    }
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

describe("a step's own screen can tick it off", () => {
  it("shows the same Done tick as the path list, named for its step, in both languages", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { StepScreen } = await import("../src/screens/StepScreen");
    const p = plan(rules, personas.maria)!;
    for (const lang of ["en", "es"] as const)
      for (const n of [1, p.steps.length]) {
        const html = renderToStaticMarkup(createElement(StepScreen, { rules, lang, plan: p, n, person: personas.maria, mode: "cheapest", onSkip: () => {} }));
        expect(html).toMatch(new RegExp(`<input type="checkbox" aria-label="${t[lang].markDone(n)}"`));
      }
  });
});

describe("every reminder in one calendar file", () => {
  const now = new Date(2026, 9, 25, 10, 30, 0);
  const p = plan(rules, personas.maria)!;

  it("lists each step that waits, in order, with the same dates as their own links", () => {
    const rs = remindersFor(rules, p.steps, "en");
    const waits = p.steps.filter((st) => st.action.days > 0);
    expect(rs.map((r) => r.id)).toEqual(waits.map((st) => st.action.id));
    for (const r of rs) expect(r.days).toBe(p.steps.find((st) => st.action.id === r.id)!.endDay);
  });

  it("leaves out a step ticked done and moves the ones after it up", () => {
    const [first, later] = p.steps.flatMap((st, i) => (st.action.days > 0 ? [i] : []));
    const done = new Set([p.steps[first].action.id]);
    const rs = remindersFor(rules, p.steps, "en", done);
    expect(rs.map((r) => r.id)).not.toContain(p.steps[first].action.id);
    expect(rs.find((r) => r.id === p.steps[later].action.id)!.days).toBe(daysLeft(p.steps, later, done));
  });

  it("is one valid calendar with one event per reminder, each with its own UID and date", () => {
    for (const lang of ["en", "es"] as const) {
      const rs = remindersFor(rules, p.steps, lang);
      const comps = parseIcs(remindersIcs(rs, now, "fixed"));
      const events = comps.filter((c) => c.name === "VEVENT");
      expect(comps.filter((c) => c.name === "VCALENDAR")).toHaveLength(1);
      expect(events).toHaveLength(rs.length);
      expect(new Set(events.map((e) => e.props.UID.value)).size).toBe(rs.length);
      events.forEach((e, i) => {
        expect(e.props.DTSTART.value).toBe(icsDate(addDays(now, rs[i].days)));
        expect(icsUnescape(e.props.SUMMARY.value)).toBe(rs[i].summary);
      });
    }
  });

  it("a single reminder's file is the same as before: one event", () => {
    const r = remindersFor(rules, p.steps, "en")[0];
    expect(reminderIcs(r, now, "fixed")).toBe(remindersIcs([r], now, "fixed"));
    expect(parseIcs(reminderIcs(r, now, "fixed")).filter((c) => c.name === "VEVENT")).toHaveLength(1);
  });
});

describe("the progress line says how long is left", () => {
  it("with some steps ticked, adds the waits still ahead, in both languages; nothing when none or all are ticked", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { PathScreen } = await import("../src/screens/PathScreen");
    const { vi } = await import("vitest");
    const p = plan(rules, personas.maria)!;
    const mail = p.steps.find((st) => st.action.id === "rrcc_mail")!;
    const render = (ticked: string[], lang: "en" | "es") => {
      const stored = JSON.stringify(Object.fromEntries(ticked.map((id) => [id, true])));
      vi.stubGlobal("localStorage", { getItem: () => (ticked.length ? stored : null), setItem: () => {}, removeItem: () => {} });
      try {
        return renderToStaticMarkup(createElement(PathScreen, {
          rules, lang, result: p, mode: "cheapest", onMode: () => {}, person: personas.maria, help: null,
          facts: personas.maria.facts, onChangeAnswers: () => {}, ms: 0, skipped: [], onUnskip: () => {},
        }));
      } finally { vi.unstubAllGlobals(); }
    };
    const left = daysLeft(p.steps, p.steps.length - 1, new Set([mail.action.id]));
    for (const lang of ["en", "es"] as const) {
      expect(render([mail.action.id], lang)).toContain(`, ${t[lang].progressLeft(left)}</span>`);
      expect(render([], lang)).not.toContain('class="progress-left"');
      expect(render(p.steps.map((st) => st.action.id), lang)).not.toContain('class="progress-left"');
    }
    expect(t.en.progressLeft(21)).toBe("about 3 weeks until the card");
    expect(t.es.progressLeft(28)).toBe("unas 4 semanas hasta la tarjeta");
  });
});

describe("a step's own screen says when it can start", () => {
  it("names the wait it is queued behind, and drops it once that wait is ticked done", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { StepScreen } = await import("../src/screens/StepScreen");
    const { vi } = await import("vitest");
    const p = plan(rules, personas.maria)!;
    const last = p.steps.length; // the DMV, after the mailed birth certificate
    const wait = lastWaitBefore(p.steps, last - 1);
    expect(wait).toBeGreaterThanOrEqual(0);
    expect(lastWaitBefore(p.steps, last - 1, new Set([p.steps[wait].action.id]))).toBe(-1);
    const render = (lang: "en" | "es", ticked: string[]) => {
      vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(Object.fromEntries(ticked.map((id) => [id, true]))), setItem: () => {}, removeItem: () => {} });
      try {
        return renderToStaticMarkup(createElement(StepScreen, { rules, lang, plan: p, n: last, person: personas.maria, mode: "cheapest", onSkip: () => {} }));
      } finally { vi.unstubAllGlobals(); }
    };
    for (const lang of ["en", "es"] as const) {
      const s = t[lang];
      expect(render(lang, [])).toContain(`<dt>${s.when}</dt><dd>${s.startsAround(p.steps[last - 1].startDay)}, ${s.afterStep(wait + 1)}</dd>`);
      expect(render(lang, [p.steps[wait].action.id])).toContain(`<dt>${s.when}</dt><dd>${s.startsToday}</dd>`);
    }
  });
});
