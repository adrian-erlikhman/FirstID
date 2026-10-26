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
    fetch: async () => res, URL,
  });
  let done: Promise<unknown> = Promise.resolve();
  handlers.fetch({ request: { method: "GET", mode: "navigate", url: "https://first-id.vercel.app/x" }, respondWith: (p: Promise<unknown>) => { done = p; } });
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
