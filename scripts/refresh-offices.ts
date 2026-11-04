// npm run refresh:offices: re-reads the DMV's own office data (the source
// named in data/offices.json) and compares it with our snapshot.
//
//   npm run refresh:offices            report what changed, write nothing
//   npm run refresh:offices -- --write update data/offices.json
//
// It only refreshes the offices already in the snapshot (address, city, ZIP,
// map point, hours, page) and sets their lastChecked to today; the office
// list's "checked" note follows that date. It never adds or drops an office on
// its own: offices that vanished, and Los Angeles County offices the snapshot
// doesn't have, are listed for a person to decide. Needs the network.
import { readFileSync, writeFileSync } from "node:fs";

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Office = { id: string; kind: string; name: string; address: string; city: string; zip: string; lat?: number; lon?: number; hours?: Record<Day, string>; source: string; lastChecked: string };
type ApiOffice = {
  slug: string; link: string; title: { rendered: string };
  meta: { dmv_field_office_street?: string; dmv_field_office_city?: string; dmv_field_office_zipcode?: string; dmv_field_office_latitude?: string; dmv_field_office_longitude?: string; dmv_field_office_hours?: Record<string, { start: string; end: string }>[] };
};

const file = new URL("../data/offices.json", import.meta.url);
const data: { note: string; sources: Record<string, { name: string; url: string; page: string }>; offices: Office[] } = JSON.parse(readFileSync(file, "utf8"));
const zips = new Set(Object.keys(JSON.parse(readFileSync(new URL("../data/zip-centroids.json", import.meta.url), "utf8"))));
const write = process.argv.includes("--write");
// Today in Los Angeles, where the offices are (toISOString would give the UTC date, a day ahead every evening).
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const DAYS: [Day, string][] = [["mon", "monday"], ["tue", "tuesday"], ["wed", "wednesday"], ["thu", "thursday"], ["fri", "friday"], ["sat", "saturday"], ["sun", "sunday"]];
const decode = (s: string) => s.replace(/&#0?38;|&amp;/g, "&").replace(/&#8217;|&#039;/g, "'").replace(/&#8211;/g, "–").replace(/&nbsp;/g, " ").trim();

/** The API's hours ("8:00 am" to "5:00 pm", or "Closed") as the snapshot writes them. */
function hoursOf(api: ApiOffice): Record<Day, string> | undefined {
  const h = api.meta.dmv_field_office_hours?.[0];
  if (!h) return undefined;
  const out = {} as Record<Day, string>;
  for (const [d, long] of DAYS) {
    const v = h[long];
    out[d] = !v || /closed/i.test(v.start) || /closed/i.test(v.end) ? "closed" : `${v.start.trim()}–${v.end.trim()}`;
  }
  return out;
}

async function fetchAll(url: string): Promise<ApiOffice[]> {
  const all: ApiOffice[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}page=${page}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60_000) });
    if (res.status === 400 && page > 1) break; // past the last page
    if (!res.ok) throw new Error(`${url} page ${page}: HTTP ${res.status}`);
    const batch = (await res.json()) as ApiOffice[];
    all.push(...batch);
    const pages = Number(res.headers.get("x-wp-totalpages") ?? "1");
    if (page >= pages || batch.length === 0) break;
  }
  return all;
}

async function main() {
  const src = data.sources.dmv;
  const api = await fetchAll(src.url);
  const bySlug = new Map(api.map((o) => [o.slug, o]));
  const changes: string[] = [], gone: string[] = [];
  const next = data.offices.map((o) => {
    const a = bySlug.get(o.id.replace(/^dmv-/, ""));
    if (!a) { gone.push(`${o.name} (${o.id})`); return o; }
    const m = a.meta;
    const fresh: Office = {
      ...o,
      name: decode(a.title.rendered) || o.name,
      address: m.dmv_field_office_street?.trim() || o.address,
      city: m.dmv_field_office_city?.trim() || o.city,
      zip: m.dmv_field_office_zipcode?.trim() || o.zip,
      lat: m.dmv_field_office_latitude ? Number(m.dmv_field_office_latitude) : o.lat,
      lon: m.dmv_field_office_longitude ? Number(m.dmv_field_office_longitude) : o.lon,
      hours: hoursOf(a) ?? o.hours,
      source: a.link || o.source,
      lastChecked: today,
    };
    for (const k of ["name", "address", "city", "zip", "lat", "lon", "hours", "source"] as const) {
      const was = JSON.stringify(o[k]), now = JSON.stringify(fresh[k]);
      if (was !== now) changes.push(`${o.name}: ${k} ${was} → ${now}`);
    }
    return fresh;
  });
  const have = new Set(data.offices.map((o) => o.id.replace(/^dmv-/, "")));
  const missing = api.filter((a) => !have.has(a.slug) && zips.has(a.meta.dmv_field_office_zipcode?.trim() ?? ""))
    .map((a) => `${decode(a.title.rendered)}, ${a.meta.dmv_field_office_city} ${a.meta.dmv_field_office_zipcode} (${a.link})`);

  console.log(`${api.length} offices from ${src.name}; ${data.offices.length} in our snapshot.`);
  console.log(changes.length ? `\nChanged (${changes.length}):\n  ${changes.join("\n  ")}` : "\nNo office's details changed.");
  if (gone.length) console.log(`\nIn our snapshot but not in the DMV's data any more (check by hand, then remove):\n  ${gone.join("\n  ")}`);
  if (missing.length) console.log(`\nIn Los Angeles County ZIPs but not in our snapshot (decide by hand; express offices and business or test centers were left out on purpose):\n  ${missing.join("\n  ")}`);
  if (write) {
    // One-space indent, as the snapshot is written, so a refresh only changes the lines that changed.
    writeFileSync(file, JSON.stringify({ ...data, offices: next }, null, 1) + "\n");
    console.log(`\nWrote data/offices.json: ${next.length} offices, checked ${today}.`);
  } else {
    console.log("\nNothing written. Run with --write to update data/offices.json.");
  }
}

void main();
