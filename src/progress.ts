import type { RuleSet, Step } from "./engine/types";
import { t, type Lang } from "./i18n";

// Progress ticks and calendar reminders for the path screen.
//
// Ticks live in this phone's localStorage, keyed by step (action) id. Nothing
// is sent anywhere. Every storage call is wrapped: with storage blocked the
// ticks still work for the visit, they just aren't remembered.
//
// Reminders are .ics files built here in the browser. The only date they use is
// today + the step's own `days` from data/rules.json; we add no other deadline.

export const PROGRESS_KEY = "firstid.progress.v1";

export type Ticks = Record<string, true>;

export function loadTicks(store: Pick<Storage, "getItem"> | null = safeLocal()): Ticks {
  try {
    const raw = store?.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Ticks = {};
    for (const [k, v] of Object.entries(parsed)) if (v === true) out[k] = true;
    return out;
  } catch {
    return {};
  }
}

export function saveTicks(ticks: Ticks, store: Pick<Storage, "setItem" | "removeItem"> | null = safeLocal()): void {
  try {
    if (Object.keys(ticks).length === 0) store?.removeItem(PROGRESS_KEY);
    else store?.setItem(PROGRESS_KEY, JSON.stringify(ticks));
  } catch { /* storage blocked or full: keep going without it */ }
}

export function toggleTick(ticks: Ticks, id: string, done: boolean): Ticks {
  const next = { ...ticks };
  if (done) next[id] = true;
  else delete next[id];
  return next;
}

/** Only the ticks for steps in the current plan. Ticks for steps that left the
 *  plan stay stored (they come back if the plan does) but are never shown. */
export function ticksInPlan(ticks: Ticks, stepIds: string[]): Set<string> {
  return new Set(stepIds.filter((id) => ticks[id] === true));
}

function safeLocal(): Storage | null {
  try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; }
}

// ---------- iCalendar ----------

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** A local calendar date as YYYYMMDD. */
export function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** A UTC timestamp as YYYYMMDDTHHMMSSZ. */
export function icsStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Local calendar day `days` after `from` (handles month ends and DST). */
export function addDays(from: Date, days: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
}

/** RFC 5545 TEXT escaping. */
export function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold a content line to at most 75 octets per line (RFC 5545 3.1). */
export function icsFold(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + b > limit) {
      parts.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

export interface Reminder {
  /** Step (action) id, for the UID. */
  id: string;
  /** The step's own wait, from data/rules.json. */
  days: number;
  summary: string;
  description: string;
}

/** One all-day VEVENT on today + days, as a complete VCALENDAR with CRLF line endings. */
export function reminderIcs(r: Reminder, now: Date = new Date(), uid: string = randomId()): string {
  const day = addDays(now, r.days);
  const next = addDays(day, 1);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//First ID//Reminders//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}-${r.id}@first-id`,
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART;VALUE=DATE:${icsDate(day)}`,
    `DTEND;VALUE=DATE:${icsDate(next)}`,
    `SUMMARY:${icsEscape(r.summary)}`,
    `DESCRIPTION:${icsEscape(r.description)}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(icsFold).join("\r\n") + "\r\n";
}

function randomId(): string {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch { /* fall through */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Minimal iCalendar reader used by the tests (and handy for checking a file):
 *  unfolds lines and returns each component's properties. */
export function parseIcs(text: string): { name: string; props: Record<string, { params: string; value: string }> }[] {
  if (/[^\r]\n/.test(text) || /\r(?!\n)/.test(text)) throw new Error("line endings must be CRLF");
  const lines = text.replace(/\r\n[ \t]/g, "").split("\r\n").filter((l) => l !== "");
  const stack: { name: string; props: Record<string, { params: string; value: string }> }[] = [];
  const out: typeof stack = [];
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon < 1) throw new Error(`bad line: ${line}`);
    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const [name, ...params] = head.split(";");
    if (name === "BEGIN") stack.push({ name: value, props: {} });
    else if (name === "END") {
      const c = stack.pop();
      if (!c || c.name !== value) throw new Error(`unbalanced END:${value}`);
      out.push(c);
    } else {
      const c = stack[stack.length - 1];
      if (!c) throw new Error(`property outside a component: ${name}`);
      c.props[name] = { params: params.join(";"), value };
    }
  }
  if (stack.length) throw new Error("unclosed component");
  return out;
}

/** Undo icsEscape. */
export function icsUnescape(s: string): string {
  return s.replace(/\\([\\;,nN])/g, (_, c: string) => (c === "n" || c === "N" ? "\n" : c));
}

// ---------- the reminder for a step ----------


/** The reminder for step `n` (1-based), or null when the step has no wait. */
export function reminderFor(rules: RuleSet, step: Step, n: number, lang: Lang): Reminder | null {
  const a = step.action;
  if (!(a.days > 0)) return null;
  const s = t[lang];
  const doc = a.produces.find((d) => d === rules.goal) ?? a.produces[0];
  const what = (doc && s.remindWhat[doc]) || (doc && rules.docs[doc]?.label[lang]) || a.label[lang];
  return { id: a.id, days: a.days, summary: s.remindSummary(what), description: s.remindDescription(n, a.label[lang], a.days) };
}
