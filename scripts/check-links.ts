// npm run check:links: opens every link the app shows people (each rule's
// sources in data/rules.json, the office pages in data/offices.json, and the
// https:// links written in src/) and reports the ones that are gone.
//
// A source that 404s takes away the proof a person shows a clerk, so run this
// before verifying rules and now and then after. It needs the network, so it is
// not part of `npm run check`.
//
//   broken   404 or 410: the page is gone. Find where it moved and fix the link.
//   moved    it opens, but after a redirect to a different page. Worth updating.
//   blocked  the site refuses scripts (a "Just a moment..." check, or 403/429).
//            Open it in a browser by hand.
//   error    no answer (timeout, DNS). Try again later.
//
// Exits 1 only when something is broken.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuleSet } from "../src/engine/types";

const root = new URL("..", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const rules: RuleSet = JSON.parse(read("data/rules.json"));
const offices = JSON.parse(read("data/offices.json"));

type Link = { url: string; where: string };
const links = new Map<string, string>();
const add = (url: unknown, where: string) => { if (typeof url === "string" && /^https?:\/\//.test(url) && !links.has(url)) links.set(url, where); };

for (const [id, s] of Object.entries(rules.sources)) add(s.url, `rules.json source ${id}`);
for (const [kind, s] of Object.entries<{ page?: string }>(offices.sources ?? {})) add(s.page, `offices.json ${kind} list`);
for (const o of Object.values<unknown>(offices.offices ?? {}).flat() as { id?: string; source?: string }[]) add(o?.source, `offices.json office ${o?.id}`);

// Links written into the code, such as the LA County form PDF.
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
});
for (const file of walk(fileURLToPath(new URL("src/", root)))) {
  for (const m of readFileSync(file, "utf8").matchAll(/["'](https:\/\/[^"'\s`$]+)["']/g)) add(m[1], file.replace(/^.*?[\\/]src[\\/]/, "src/").replace(/\\/g, "/"));
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
type Result = Link & { status: "ok" | "moved" | "broken" | "blocked" | "error"; detail: string };

async function check({ url, where }: Link): Promise<Result> {
  let last = "";
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, redirect: "follow", headers: { "User-Agent": UA, Accept: "text/html,application/pdf,*/*" }, signal: AbortSignal.timeout(25_000) });
      const body = method === "GET" ? (await res.text()).slice(0, 4000) : "";
      if (res.ok) {
        const same = (a: string) => a.replace(/#.*$/, "").replace(/\/$/, "").replace(/^http:/, "https:").toLowerCase();
        if (same(res.url) === same(url)) return { url, where, status: "ok", detail: String(res.status) };
        // A page that needs an account (GitHub's "new issue") sends scripts to sign in; that's working as meant.
        if (/\/(login|signin|sign-in)\b/i.test(new URL(res.url).pathname)) return { url, where, status: "ok", detail: "asks to sign in" };
        return { url, where, status: "moved", detail: `→ ${res.url}` };
      }
      if (res.status === 404 || res.status === 410) {
        if (method === "HEAD") continue; // some servers answer HEAD wrongly; ask again with GET
        return { url, where, status: "broken", detail: String(res.status) };
      }
      last = String(res.status);
      if (method === "GET" && (res.status === 403 || res.status === 429 || res.status === 503 || /just a moment|security verification|cloudflare/i.test(body)))
        return { url, where, status: "blocked", detail: `${res.status}, refuses scripts` };
    } catch (e) {
      last = e instanceof Error ? e.name : String(e);
    }
  }
  return { url, where, status: "error", detail: last || "no answer" };
}

async function main() {
  const all = [...links].map(([url, where]) => ({ url, where }));
  const results: Result[] = [];
  for (let i = 0; i < all.length; i += 8) results.push(...await Promise.all(all.slice(i, i + 8).map(check)));
  const order: Result["status"][] = ["broken", "moved", "blocked", "error", "ok"];
  for (const status of order) {
    const rows = results.filter((r) => r.status === status);
    if (!rows.length || status === "ok") continue;
    console.log(`\n${status} (${rows.length})`);
    for (const r of rows) console.log(`  ${r.where}\n    ${r.url}\n    ${r.detail}`);
  }
  const count = (s: Result["status"]) => results.filter((r) => r.status === s).length;
  console.log(`\n${results.length} links: ${count("ok")} ok, ${count("moved")} moved, ${count("broken")} broken, ${count("blocked")} blocked (open by hand), ${count("error")} no answer`);
  if (count("broken")) process.exit(1);
}

void main();
