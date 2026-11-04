import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

// The offline copy of the app is whatever the worker last stored as ./index.html.
// Opening a mistyped link or a file such as og.png must not replace it.
function navigate(status: number, type: string) {
  const handlers: Record<string, (e: unknown) => void> = {};
  const puts: string[] = [];
  const cache = { put: async (key: string) => { puts.push(key); } };
  const self = { location: { origin: "https://first-id.vercel.app" }, addEventListener: (name: string, fn: (e: unknown) => void) => { handlers[name] = fn; } };
  const res = { ok: status >= 200 && status < 300, status, headers: { get: () => type }, clone() { return this; } };
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    self, caches: { open: async () => cache, match: async () => undefined, keys: async () => [] },
    fetch: async () => res, URL, setTimeout,
  });
  let done: Promise<unknown> = Promise.resolve();
  handlers.fetch({ request: { method: "GET", mode: "navigate", url: "https://first-id.vercel.app/x" }, respondWith: (p: Promise<unknown>) => { done = p; }, waitUntil: () => {} });
  return done.then(() => new Promise((r) => setTimeout(r, 0))).then(() => puts);
}

describe("service worker", () => {
  it("stores the app's own page as the offline copy", async () => {
    expect(await navigate(200, "text/html; charset=utf-8")).toEqual(["./index.html"]);
  });
  it("never stores a 404 page or an image as the offline copy", async () => {
    expect(await navigate(404, "text/html")).toEqual([]);
    expect(await navigate(200, "image/png")).toEqual([]);
  });
});

// Pictures and the font load only near the screen, so the worker stores them
// at install: a page seen online once shows them offline too.
function install({ saveData = false, already = [] as string[] } = {}) {
  const handlers: Record<string, (e: unknown) => void> = {};
  const stored = new Set<string>(already);
  const added: string[] = [];
  const files: Record<string, string> = {
    "./index.html": '<script type="module" src="./assets/index-abc.js"></script><link rel="stylesheet" href="./assets/index-def.css">',
    "./assets/index-abc.js": 'const a=new URL("certificate-of-identity-X1.jpg",import.meta.url),b="ca-id-sample-small-Y2.jpg";',
    "./assets/index-def.css": "@font-face{src:url(./instrument-sans-Z3.woff2)}",
  };
  const res = (body: string) => ({ text: async () => body });
  const cache = {
    addAll: async (urls: string[]) => { urls.forEach((u) => stored.add(u)); },
    add: async (u: string) => { added.push(u); stored.add(u); },
    match: async (u: string) => (stored.has(u) && files[u] !== undefined ? res(files[u]) : stored.has(u) ? res("") : undefined),
  };
  const self = { location: { origin: "https://first-id.vercel.app" }, navigator: { connection: { saveData } }, skipWaiting: async () => {}, addEventListener: (n: string, fn: (e: unknown) => void) => { handlers[n] = fn; } };
  runInNewContext(readFileSync("public/sw.js", "utf8"), { self, caches: { open: async () => cache, match: async () => undefined, keys: async () => [] }, fetch: async () => ({}), URL });
  let done: Promise<unknown> = Promise.resolve();
  handlers.install({ waitUntil: (p: Promise<unknown>) => { done = p; } });
  return done.then(() => ({ added: added.sort(), stored }));
}

describe("service worker: install", () => {
  it("stores the pictures and the font that the script and stylesheet name", async () => {
    const { added } = await install();
    expect(added).toEqual(["./assets/ca-id-sample-small-Y2.jpg", "./assets/certificate-of-identity-X1.jpg", "./assets/instrument-sans-Z3.woff2"]);
  });
  it("doesn't fetch again what is already stored", async () => {
    const { added } = await install({ already: ["./assets/ca-id-sample-small-Y2.jpg"] });
    expect(added).not.toContain("./assets/ca-id-sample-small-Y2.jpg");
  });
  it("stores nothing extra when the phone asks to save data", async () => {
    const { added, stored } = await install({ saveData: true });
    expect(added).toEqual([]);
    expect(stored.has("./assets/index-abc.js")).toBe(true);
  });
});

// On a weak signal a page shouldn't wait on the network for ever: after a few
// seconds the stored copy opens. Timers run instantly here.
function open(fetchImpl: () => Promise<unknown>) {
  const handlers: Record<string, (e: unknown) => void> = {};
  const stored = { kind: "stored copy" };
  const self = { location: { origin: "https://first-id.vercel.app" }, addEventListener: (n: string, fn: (e: unknown) => void) => { handlers[n] = fn; } };
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    self, URL, fetch: fetchImpl,
    caches: { open: async () => ({ put: async () => {} }), match: async (u: string) => (u === "./index.html" ? stored : undefined), keys: async () => [] },
    setTimeout: (fn: (...a: unknown[]) => void, _ms: number, ...args: unknown[]) => setTimeout(fn, 0, ...args),
  });
  let answer: Promise<unknown> = Promise.resolve();
  handlers.fetch({ request: { method: "GET", mode: "navigate", url: "https://first-id.vercel.app/" }, respondWith: (p: Promise<unknown>) => { answer = p; }, waitUntil: () => {} });
  return answer;
}

describe("service worker: weak signal", () => {
  const page = { ok: true, status: 200, headers: { get: () => "text/html" }, clone() { return this; }, kind: "network" };
  it("opens the stored copy when the network hasn't answered", async () => {
    expect(await open(() => new Promise(() => {}))).toEqual({ kind: "stored copy" });
  });
  it("opens the stored copy when the network fails", async () => {
    expect(await open(() => Promise.reject(new Error("offline")))).toEqual({ kind: "stored copy" });
  });
  it("uses the network's page when it answers in time", async () => {
    expect(((await open(async () => page)) as { kind: string }).kind).toBe("network");
  });
});
