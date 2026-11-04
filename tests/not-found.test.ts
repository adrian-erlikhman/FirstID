// Vercel shows public/404.html for any address the site doesn't have (say
// first-id.vercel.app/es). Before it existed, that was a plain-text
// "NOT_FOUND" in English with no way back.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { t } from "../src/i18n";

const html = readFileSync(fileURLToPath(new URL("../public/404.html", import.meta.url)), "utf8");

describe("the page for an address that doesn't exist", () => {
  it("leads back to First ID in both languages, with absolute links (it can be served at any depth)", () => {
    const links = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);
    expect(links.filter((h) => h === "/")).toHaveLength(2);
    expect(links.every((h) => h === "/" || h === "tel:211")).toBe(true);
    expect(html).toMatch(/<html lang="en">/);
    expect(html).toMatch(/<div class="es" lang="es">/);
  });

  it("gives the app's own 211 line, in English and Spanish", () => {
    expect(html).toContain(t.en.help211);
    expect(html).toContain(t.es.help211);
    // The line after "For adults and families:" (the 404 page runs it on from the label).
    for (const lang of ["en", "es"] as const) {
      const rest = t[lang].help211Line.replace(/^[^:]+:\s*/, "");
      expect(html, lang).toContain(rest);
    }
    expect(html).toContain('href="tel:211"');
  });

  it("is plain HTML: no script, nothing loaded from elsewhere, and kept out of search", () => {
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/(src|href)="https?:/);
    expect(html).toContain('<meta name="robots" content="noindex" />');
  });
});
