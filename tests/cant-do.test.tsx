// "Can't do this step?", the other sorts that give the same path, and the
// example that must not overwrite a person's own answers. The screens are
// rendered as HTML (no browser), in English and Spanish.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import rulesJson from "../data/rules.json";
import { BLANK, restoreOwn, setAside, type Answers } from "../src/answers";
import { plan } from "../src/engine/planner";
import type { Mode, RuleSet } from "../src/engine/types";
import { t, type Lang } from "../src/i18n";
import { PathScreen } from "../src/screens/PathScreen";
import { StepScreen } from "../src/screens/StepScreen";
import { MODES, samePlan, sameUnder, withoutSteps } from "../src/whatif";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;
const LANGS: Lang[] = ["en", "es"];
const decode = (html: string) =>
  html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

describe("can't do this step", () => {
  it("taking steps out removes only those steps", () => {
    expect(withoutSteps(rules, [])).toBe(rules);
    const out = withoutSteps(rules, ["notary_witnesses", "program_dl933"]);
    expect(out.actions.map((a) => a.id)).toEqual(rules.actions.map((a) => a.id).filter((id) => id !== "notary_witnesses" && id !== "program_dl933"));
    expect(out.sources).toBe(rules.sources);
  });

  it("the path without a step never uses that step, for every person, step and sort", () => {
    for (const p of Object.values(personas)) {
      for (const mode of MODES) {
        const base = plan(rules, p, mode);
        for (const st of base?.steps ?? []) {
          const alt = plan(withoutSteps(rules, [st.action.id]), p, mode);
          expect(alt?.steps.map((x) => x.action.id) ?? []).not.toContain(st.action.id);
        }
      }
    }
  });

  it("the step screen offers the next-best path, or says there isn't one, in both languages", () => {
    const maria = personas.maria;
    const base = plan(rules, maria, "cheapest")!;
    for (const lang of LANGS) {
      const s = t[lang];
      base.steps.forEach((st, i) => {
        const html = decode(renderToStaticMarkup(
          <StepScreen rules={rules} lang={lang} plan={base} n={i + 1} person={maria} mode="cheapest" onSkip={() => {}} />,
        ));
        expect(html).toContain(s.cantDo);
        const alt = plan(withoutSteps(rules, [st.action.id]), maria, "cheapest");
        expect(html).toContain(alt ? s.cantDoUse : s.cantDoNone);
        // Every step is still "call ahead", so each one says what to ask on that call.
        if (!st.action.verified) expect(html).toContain(s.callAsk[st.action.id]);
      });
    }
  });

  it("the path screen lists the steps you said you can't do, with a way to put them back", () => {
    const skipped = [rules.actions.find((a) => a.id === "notary_witnesses")!];
    const live = withoutSteps(rules, skipped.map((a) => a.id));
    const maria = personas.maria;
    for (const lang of LANGS) {
      const s = t[lang];
      const html = decode(renderToStaticMarkup(
        <PathScreen rules={live} lang={lang} result={plan(live, maria, "cheapest")} mode="cheapest" onMode={() => {}} person={maria}
          help={null} facts={maria.facts} onChangeAnswers={() => {}} ms={0} skipped={skipped} onUnskip={() => {}} />,
      ));
      expect(html).toContain(s.skippedTitle(1));
      expect(html).toContain(skipped[0].label[lang]);
      expect(html).toContain(s.skippedUndo(1));
    }
  });
});

describe("the other sorts that give the same path", () => {
  it("names only sorts whose path really is the same", () => {
    for (const p of Object.values(personas)) {
      for (const mode of MODES) {
        const current = plan(rules, p, mode);
        if (!current) continue;
        const same = sameUnder(rules, p, mode, current);
        expect(same).not.toContain(mode);
        for (const m of MODES) {
          if (m === mode) continue;
          expect(same.includes(m), `${mode} vs ${m}`).toBe(samePlan(plan(rules, p, m), current));
        }
      }
    }
  });

  it("every sort has its 'this is also your ... path' line in both languages", () => {
    for (const m of MODES as Mode[]) for (const lang of LANGS) expect(t[lang].modeAlso[m], `${lang}.${m}`).toBeTruthy();
  });
});

describe("an example doesn't overwrite your own answers", () => {
  const mine: Answers = { have: ["ssn_card"], facts: { born: "us_state", age: 40 }, unsure: [], answered: true, skip: [] };
  const maria: Answers = { have: ["medi_cal_card", "ssn_known"], facts: { born: "la_county" }, unsure: [], answered: true, skip: [] };

  it("opening the example sets your answers aside, and Find my path brings them back", () => {
    const own = setAside(false, null, mine);
    expect(own).toEqual(mine);
    expect(restoreOwn(own)).toEqual(mine);
  });

  it("opening the example again, while it's on screen, never sets Maria's answers aside as yours", () => {
    const own = setAside(false, null, mine);
    expect(setAside(true, own, maria)).toEqual(mine);
  });

  it("with nothing answered yet, Find my path after the example starts blank", () => {
    expect(setAside(false, null, BLANK)).toBeNull();
    expect(restoreOwn(null)).toEqual(BLANK);
    expect(restoreOwn(null).have).toEqual([]);
  });
});
