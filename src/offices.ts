import officesJson from "../data/offices.json";
import zipJson from "../data/zip-centroids.json";

// Offices near you, with no network and no location: the office list and a
// ZIP-centroid table are snapshots in the repo (data/offices.json,
// data/zip-centroids.json). A ZIP the person types stays in memory.
export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export interface Office {
  id: string;
  kind: string;          // a place id from data/rules.json, e.g. "dmv"
  name: string;
  address: string;
  city: string;
  zip: string;
  lat?: number;
  lon?: number;
  phone?: string;
  hours?: Record<Day, string>;  // "8:00 am–5:00 pm" or "closed"
  source: string;
  lastChecked: string;
}
export interface OfficeSource { name: string; url: string; page: string }

export const officeData = officesJson as unknown as { sources: Record<string, OfficeSource>; offices: Office[] };
export const zipCentroids = (zipJson as unknown as { zips: Record<string, [number, number]> }).zips;

export const officesFor = (kind: string) => officeData.offices.filter((o) => o.kind === kind);
export const hasOffices = (kind: string) => officeData.offices.some((o) => o.kind === kind);

/** Straight-line miles between two points. */
function miles(a: [number, number], b: [number, number]): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b[0] - a[0]), dLon = r(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

/** Nearest first when the ZIP is in the table; otherwise A to Z by city. */
export function sortOffices(list: Office[], zip: string): { office: Office; mi?: number }[] {
  const from = /^\d{5}$/.test(zip) ? zipCentroids[zip] : undefined;
  const rows = list.map((office) => ({
    office,
    mi: from && office.lat !== undefined && office.lon !== undefined ? miles(from, [office.lat, office.lon]) : undefined,
  }));
  return rows.sort((a, b) =>
    (a.mi ?? Infinity) - (b.mi ?? Infinity) || a.office.city.localeCompare(b.office.city) || a.office.name.localeCompare(b.office.name));
}

/** Runs of days with the same hours: Mon–Tue 8–5, Wed 9–5, ... */
export function groupHours(hours: Record<Day, string>): { from: Day; to: Day; value: string }[] {
  const out: { from: Day; to: Day; value: string }[] = [];
  for (const d of DAYS) {
    const last = out[out.length - 1];
    if (last && last.value === hours[d]) last.to = d;
    else out.push({ from: d, to: d, value: hours[d] });
  }
  return out;
}

/** The day and minute of the day in Los Angeles, where the offices are,
 *  whatever time zone the phone is set to. */
export function laNow(now: Date = new Date()): { day: Day; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const day = get("weekday").slice(0, 3).toLowerCase() as Day;
    if (DAYS.includes(day)) return { day, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
  } catch { /* a browser without time zones: use the phone's own clock below */ }
  return { day: DAYS[(now.getDay() + 6) % 7], minutes: now.getHours() * 60 + now.getMinutes() };
}

/** "8:00 am–5:00 pm" as minutes after midnight, or null for "closed" or anything else. */
export function parseHours(value: string): { open: number; close: number } | null {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m) return null;
  const at = (h: string, min: string, ap: string) => ((Number(h) % 12) + (ap.toLowerCase() === "pm" ? 12 : 0)) * 60 + Number(min);
  const open = at(m[1], m[2], m[3]), close = at(m[4], m[5], m[6]);
  return close > open ? { open, close } : null;
}

/** Whether an office is usually open at this moment, going by its listed hours
 *  (holidays aren't in them), and until when. Null when today's hours can't be read. */
export function openNow(hours: Record<Day, string>, now: Date = new Date()): { open: true; until: string } | { open: false } | null {
  const { day, minutes } = laNow(now);
  const today = hours[day];
  if (today === undefined) return null;
  if (today.trim().toLowerCase() === "closed") return { open: false };
  const h = parseHours(today);
  if (!h) return null;
  return minutes >= h.open && minutes < h.close ? { open: true, until: today.split(/[–-]/)[1].trim() } : { open: false };
}

/** A plain outbound maps search for the office's own address. */
export const directionsUrl = (o: Office) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.address}, ${o.city}, CA ${o.zip}`)}`;
