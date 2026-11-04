// Many people this app is for carry an old phone: an iPhone that stopped at
// iOS 14 or 15 is common. Vite builds for Safari 14 but adds no polyfills, so
// a newer built-in used anywhere in src/ crashes that screen there. This keeps
// out the ones that slip in most easily (each has a plain equivalent).
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const NEWER: [RegExp, string][] = [
  [/\.at\(\s*-?\d/, "Array/String .at() (Safari 15.4): use [length - 1]"],
  [/\bObject\.hasOwn\(/, "Object.hasOwn (Safari 15.4): use Object.prototype.hasOwnProperty.call"],
  [/\.findLast(Index)?\(/, "findLast (Safari 15.4)"],
  [/\bstructuredClone\(/, "structuredClone (Safari 15.4)"],
  [/\.(toSorted|toReversed|toSpliced)\(|\.with\(\s*\d/, "change-array-by-copy (Safari 16)"],
  [/\b(Object|Map)\.groupBy\(/, "groupBy (Safari 17.4)"],
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
