// Each screen gives the browser tab its own title, in the app's language, so
// the back button's history and the tab read more than "First ID" every time.
import { describe, expect, it } from "vitest";
import rulesJson from "../data/rules.json";
import { plan } from "../src/engine/planner";
import type { RuleSet } from "../src/engine/types";
import { t, type Lang } from "../src/i18n";
import type { Route } from "../src/router";
import { pageTitle } from "../src/title";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;
const maria = plan(rules, personas.maria)!;
const LANGS: Lang[] = ["en", "es"];
const ROUTES: Route[] = [
  { name: "have" }, { name: "questions" }, { name: "path" }, { name: "packet" }, { name: "whatif" },
  { name: "sources" }, { name: "offices", kind: "dmv" }, { name: "step", n: 1 }, { name: "step", n: maria.steps.length },
];

describe("page titles", () => {
  it.each(LANGS)("%s: the home page is just the app's name", (lang) => {
    expect(pageTitle({ name: "home" }, lang, maria)).toBe(t[lang].appName);
  });

  it.each(LANGS)("%s: every other screen names itself first, then the app, with no stray full stop", (lang) => {
    const titles = ROUTES.map((r) => pageTitle(r, lang, maria));
    for (const title of titles) {
      expect(title).toMatch(new RegExp(` · ${t[lang].appName}$`));
      expect(title).not.toMatch(/\. · /);
    }
    // Different screens, different titles (the path and its printed packet share one).
    expect(new Set(titles).size).toBe(titles.length - 1);
  });

  it("a step says which step it is and what it is, in the app's language", () => {
    const last = maria.steps.length;
    for (const lang of LANGS)
      expect(pageTitle({ name: "step", n: last }, lang, maria))
        .toBe(`${t[lang].stepOf(last, last)}: ${maria.steps[last - 1].action.label[lang]} · ${t[lang].appName}`);
  });

  it("with no path, the path screen says so, and a step that doesn't exist falls back to the app's name", () => {
    expect(pageTitle({ name: "path" }, "en", null)).toBe(`${t.en.noPathTitle} · First ID`);
    expect(pageTitle({ name: "step", n: 1 }, "en", null)).toBe("First ID");
    expect(pageTitle({ name: "step", n: 99 }, "en", maria)).toBe("First ID");
  });
});
