// The screens that had no test of their own, rendered as HTML (no browser) in
// English and Spanish: the home page, Maria's walk-through, What if, and the
// office list. Plus the project rule that the DL 933 (and DL 937) is never
// shown: the DMV asks that those forms not be shared online.
import { afterEach, describe, expect, it, vi } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import rulesJson from "../data/rules.json";
import { plan } from "../src/engine/planner";
import type { Person, RuleSet } from "../src/engine/types";
import { t, type Lang } from "../src/i18n";
import { officesFor } from "../src/offices";
import { HomeScreen } from "../src/screens/HomeScreen";
import { MariaTrail } from "../src/screens/MariaTrail";
import { OfficesScreen } from "../src/screens/OfficesScreen";
import { WhatIfScreen } from "../src/screens/WhatIfScreen";
import { flipsThatMatter } from "../src/whatif";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;
const LANGS: Lang[] = ["en", "es"];
const decode = (html: string) =>
  html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const maria = plan(rules, personas.maria)!;

describe("the DL 933 and DL 937 are never shown", () => {
  it("no image in the app is either form", () => {
    const root = fileURLToPath(new URL("..", import.meta.url));
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
    const images = [...walk(join(root, "src")), ...walk(join(root, "public"))].filter((f) => /\.(png|jpe?g|webp|gif|svg|pdf)$/i.test(f));
    expect(images.length).toBeGreaterThan(0);
    expect(images.filter((f) => /dl[-_ ]?93[37]|93[37]/i.test(f.replace(/^.*[\\/]/, "")))).toEqual([]);
  });

  it.each(LANGS)("%s: Maria's walk-through shows her other papers, and says why the DL 933 isn't shown", (lang) => {
    const html = decode(renderToStaticMarkup(<MariaTrail plan={maria} rules={rules} lang={lang} onOpen={() => {}} />));
    const steps = [...html.matchAll(/<li class="trail-step[^"]*"[\s\S]*?<\/li>/g)].map((m) => m[0]);
    expect(steps).toHaveLength(maria.steps.length);
    maria.steps.forEach((st, i) => {
      if (st.action.id === "program_dl933") {
        expect(steps[i]).not.toContain("<img");
        expect(steps[i]).toContain(t[lang].trailHidden);
      } else {
        expect(steps[i], st.action.id).toContain("<img");
      }
    });
  });
});

describe("home page", () => {
  it.each(LANGS)("%s: renders the hero and the way in, with Maria's real total", (lang) => {
    const html = decode(renderToStaticMarkup(<HomeScreen rules={rules} lang={lang} onStart={() => {}} onExample={() => {}} />));
    expect(html).toContain(t[lang].heroLede);
    expect(html).toContain(`$${maria.total.dollars}`);
    expect(html).not.toMatch(/<img[^>]*(dl-?93[37])/i);
  });
});

describe("What if", () => {
  const render = (lang: Lang, person: Person) =>
    decode(renderToStaticMarkup(<WhatIfScreen rules={rules} lang={lang} person={person} mode="cheapest" onApply={() => {}} />));

  it.each(LANGS)("%s: one switch per answer that would change the path, each showing its current state", (lang) => {
    const options = flipsThatMatter(rules, personas.maria, "cheapest");
    const html = render(lang, personas.maria);
    const switches = [...html.matchAll(/role="switch" aria-checked="(true|false)"><span class="toggle-label">([^<]+)/g)];
    expect(switches).toHaveLength(options.length);
    options.forEach((o, i) => {
      const label = o.flip.kind === "doc" ? rules.docs[o.flip.doc].label[lang] : t[lang].factLabels[o.flip.fact];
      expect(switches[i][2]).toBe(label);
      const on = o.flip.kind === "doc" ? personas.maria.have.includes(o.flip.doc) : personas.maria.facts[o.flip.fact] === true;
      expect(switches[i][1]).toBe(String(on));
    });
  });

  it("with no answer that would open a path, it says so instead of showing switches", () => {
    const stuck: Person = { facts: { born: "la_county", age: 30, unhoused: false, hasWitnesses: true }, have: [] };
    expect(flipsThatMatter(rules, stuck, "cheapest")).toEqual([]);
    for (const lang of LANGS) {
      const html = render(lang, stuck);
      expect(html).toContain(t[lang].whatIfNoneNoPath);
      expect(html).not.toContain('role="switch"');
    }
  });
});

describe("DMV office list", () => {
  afterEach(() => { vi.useRealTimers(); });

  it.each(LANGS)("%s: every office, with directions and its own page named for screen readers, and whether it's usually open", (lang) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T18:00:00Z")); // a Tuesday, 10 am in Los Angeles
    const html = decode(renderToStaticMarkup(<OfficesScreen lang={lang} kind="dmv" />));
    const list = officesFor("dmv");
    const cards = [...html.matchAll(/<li class="panel office">[\s\S]*?<\/li>/g)].map((m) => m[0]);
    expect(cards).toHaveLength(list.length);
    for (const card of cards) {
      expect(card).toMatch(/class="sr-only"> [^<]+<\/span>/); // "Directions to Arleta"
      expect(card).toMatch(/class="office-now( is-open)?">/);
    }
    expect(html).toContain(t[lang].officesZipNote);
    // Tuesday 10 am: every office open on Tuesdays says so.
    const openTuesday = list.filter((o) => o.hours && o.hours.tue !== "closed").length;
    expect((html.match(/class="office-now is-open"/g) ?? []).length).toBe(openTuesday);
  });

  it("an unknown kind of office renders nothing", () => {
    expect(renderToStaticMarkup(<OfficesScreen lang="en" kind="nowhere" />)).toBe("");
  });
});
