// Many people this app is for carry an old phone: an iPhone that stopped at
// iOS 14 or 15 is common. Vite builds for Safari 14 but adds no polyfills, so
// a newer built-in used anywhere in src/ crashes that screen there. This keeps
// out the ones that slip in most easily (each has a plain equivalent).
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { t } from "../src/i18n";
import { sentences } from "../src/screens/HomeScreen";

const NEWER: [RegExp, string][] = [
  [/\.at\(\s*-?\d/, "Array/String .at() (Safari 15.4): use [length - 1]"],
  [/\bObject\.hasOwn\(/, "Object.hasOwn (Safari 15.4): use Object.prototype.hasOwnProperty.call"],
  [/\.findLast(Index)?\(/, "findLast (Safari 15.4)"],
  [/\bstructuredClone\(/, "structuredClone (Safari 15.4)"],
  [/\.(toSorted|toReversed|toSpliced)\(|\.with\(\s*\d/, "change-array-by-copy (Safari 16)"],
  [/\b(Object|Map)\.groupBy\(/, "groupBy (Safari 17.4)"],
  // The build turns a lookbehind into new RegExp("..."), which throws where it
  // runs: on the home page's headline that was a blank page on iOS 15.
  [/\(\?<[=!]/, "regex lookbehind (?<= (?<! (Safari 16.4)"],
];

describe("nothing newer than the build target", () => {
  it("src/ uses none of the built-ins older iPhones lack", () => {
    const root = fileURLToPath(new URL("../src/", import.meta.url));
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
    const found: string[] = [];
    for (const f of walk(root)) {
      readFileSync(f, "utf8").split("\n").forEach((line, i) => {
        if (/^\s*(\/\/|\*)/.test(line)) return; // comments may name them
        for (const [re, why] of NEWER) if (re.test(line)) found.push(`${f.replace(/^.*[\/]src[\/]/, "src/")}:${i + 1}: ${why}`);
      });
    }
    expect(found).toEqual([]);
  });
});

// Old Safari skips a CSS declaration it can't read, and the rule falls back to
// whatever came before. With no plain value first, that can be nothing at all:
// "Show my path" went blue on blue. So each newer value needs a plain one of
// the same property just before it, in the same rule.
const NEWER_CSS: [RegExp, string][] = [
  [/color-mix\(/, "color-mix() (Safari 16.2)"],
  [/\d(dvh|svh|lvh)\b/, "dvh/svh/lvh (Safari 15.4)"],
];

describe("the stylesheet works on older iPhones", () => {
  it("every newer CSS value has a plain fallback before it", () => {
    const css = readFileSync(fileURLToPath(new URL("../src/styles.css", import.meta.url)), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const missing: string[] = [];
    for (const block of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      const decls = block[2].split(";").map((d) => d.trim()).filter(Boolean).map((d) => {
        const i = d.indexOf(":");
        return { prop: d.slice(0, i).trim(), value: d.slice(i + 1).trim() };
      });
      decls.forEach((d, i) => {
        const why = NEWER_CSS.find(([re]) => re.test(d.value));
        if (!why) return;
        const plain = decls.slice(0, i).some((e) => e.prop === d.prop && !NEWER_CSS.some(([re]) => re.test(e.value)));
        if (!plain) missing.push(`${block[1].trim()} { ${d.prop} }: ${why[1]}`);
      });
    }
    expect(missing).toEqual([]);
  });
});

describe("the headline's sentence splitter", () => {
  // Node has lookbehind, so the old one-liner is the reference here.
  const old = (text: string) => text.split(/(?<=[.!?])\s+/);

  it("splits every string in the app exactly as the lookbehind did", () => {
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") strings.push(v);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(t);
    expect(strings.length).toBeGreaterThan(200);
    for (const s of strings) expect(sentences(s), s).toEqual(old(s));
    expect(sentences(t.en.heroA)).toEqual(old(t.en.heroA));
    expect(sentences(t.es.heroA).length).toBeGreaterThan(1);
  });

  it("and the awkward cases: no stop, a stop at the end, runs of spaces, ¿ and ¡", () => {
    for (const s of ["No ID", "No ID.", "One.  Two!\nThree? Four", "¿Sin ID?  ¡Hay salida! Sí.", " Lead. ", "a.b. c"]) {
      expect(sentences(s), JSON.stringify(s)).toEqual(old(s));
    }
  });
});
