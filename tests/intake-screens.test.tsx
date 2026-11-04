// The two screens every person goes through first, rendered as HTML (no
// browser) in English and Spanish: the papers checklist and the seven
// questions. They are what a screen reader or a keyboard user meets first.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import rulesJson from "../data/rules.json";
import type { Facts, RuleSet } from "../src/engine/types";
import { t, type Lang } from "../src/i18n";
import { HaveScreen } from "../src/screens/HaveScreen";
import { QuestionsScreen } from "../src/screens/QuestionsScreen";

const rules = rulesJson as unknown as RuleSet;
const LANGS: Lang[] = ["en", "es"];
const decode = (html: string) =>
  html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const intake = Object.entries(rules.docs).filter(([, d]) => d.askAtIntake).map(([id]) => id);

describe("What do you have?", () => {
  const render = (lang: Lang, have: string[]) =>
    decode(renderToStaticMarkup(<HaveScreen rules={rules} lang={lang} have={have} onChange={() => {}} onNext={() => {}} />));

  it.each(LANGS)("%s: one checkbox per paper, ticked exactly when held", (lang) => {
    const have = ["medi_cal_card", "ssn_known"];
    const html = render(lang, have);
    const rows = [...html.matchAll(/<button class="check-row" role="checkbox" aria-checked="(true|false)">[\s\S]*?<span class="check-text">([^<]+)/g)];
    expect(rows).toHaveLength(intake.length);
    for (const id of intake) {
      const row = rows.find((r) => r[2] === rules.docs[id].label[lang]);
      expect(row, id).toBeDefined();
      expect(row![1], id).toBe(String(have.includes(id)));
    }
  });

  it.each(LANGS)("%s: the way on, and the way out for someone with none of these", (lang) => {
    const html = render(lang, []);
    expect(html).toContain(t[lang].toQuestions);
    expect(html).toContain(t[lang].noneOfThese);
    expect(html).toContain(`<h1 tabindex="-1" class="display">${t[lang].haveTitle}</h1>`);
  });
});

describe("the questions", () => {
  const render = (lang: Lang, facts: Facts, unsure: string[] = []) =>
    decode(renderToStaticMarkup(<QuestionsScreen lang={lang} facts={facts} unsure={unsure} onChange={() => {}} onNext={() => {}} />));
  const groups = (html: string) => [...html.matchAll(/<div class="pills[^"]*" role="group" aria-label="([^"]+)">([\s\S]*?)<\/div>/g)]
    .map((m) => ({ label: m[1], pressed: [...m[2].matchAll(/aria-pressed="true">([^<]+)</g)].map((x) => x[1]) }));

  it.each(LANGS)("%s: seven questions, each a labelled group of answers", (lang) => {
    const g = groups(render(lang, {}));
    const s = t[lang];
    expect(g.map((x) => x.label)).toEqual([s.bornWhere, s.unhoused, s.fire, s.witnesses, s.age, s.foster, s.benefits]);
    for (const x of g) expect(x.pressed, x.label).toEqual([]);
  });

  it.each(LANGS)("%s: the chosen answers are pressed, and 'Not sure' when the person said so", (lang) => {
    const s = t[lang];
    const g = groups(render(lang, { born: "la_county", unhoused: true, hasWitnesses: false, age: 30 }, ["fireSurvivor"]));
    const pressed = Object.fromEntries(g.map((x) => [x.label, x.pressed]));
    expect(pressed[s.bornWhere]).toEqual([s.bornLA]);
    expect(pressed[s.unhoused]).toEqual([s.yes]);
    expect(pressed[s.witnesses]).toEqual([s.no]);
    expect(pressed[s.fire]).toEqual([s.notSure]);
    expect(pressed[s.age]).toEqual([s.ageBands[2]]);
    expect(pressed[s.foster]).toEqual([]);
  });

  it.each(LANGS)("%s: 'Show my path' stays reachable but says it can't go yet until the birthplace is answered", (lang) => {
    const button = (html: string) => html.match(/<button class="btn primary q-next"[^>]*>/)![0];
    expect(button(render(lang, { unhoused: true, age: 30 }))).toContain('aria-disabled="true"');
    expect(button(render(lang, { born: "abroad" }))).not.toContain("aria-disabled");
    expect(button(render(lang, {}))).not.toContain(" disabled");
  });
});
