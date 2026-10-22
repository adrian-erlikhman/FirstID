import { Icon } from "../components";
import type { Facts } from "../engine/types";
import { t, type Lang } from "../i18n";

// OWNER: Adrian (UI) with Michael (which facts the rules need).
// Each answer becomes a fact the rules can test. "Not sure" leaves the fact
// unset, so the planner won't use a path that depends on it.

// The rules only care about two ages: under 22 (documents owed to youth
// leaving foster care) and 62+ (the senior no-fee ID). Bands are faster to tap
// than typing a number, and each band stores an age inside it.
const AGE_BANDS = [16, 19, 30, 62];
const bandOf = (age: unknown) =>
  typeof age !== "number" ? -1 : age < 18 ? 0 : age < 22 ? 1 : age < 62 ? 2 : 3;

export function QuestionsScreen(props: { lang: Lang; facts: Facts; onChange: (f: Facts) => void; onNext: () => void }) {
  const { lang, facts, onChange, onNext } = props;
  const s = t[lang];
  const set = (k: string, v: Facts[string] | undefined) => {
    const next = { ...facts };
    if (v === undefined) delete next[k]; else next[k] = v;
    onChange(next);
  };

  // A plain function, not a component: a component defined inside render
  // would remount on every tap and drop keyboard focus.
  const pills = (k: string, q: string, opts: readonly (readonly [Facts[string] | undefined, string])[]) => (
    <fieldset className="q">
      <legend>{q}</legend>
      <div className="pills">
        {opts.map(([v, label]) => (
          <button key={label} className="pill" aria-pressed={facts[k] === v} onClick={() => set(k, v)}>{label}</button>
        ))}
      </div>
    </fieldset>
  );
  const yesNo = [[true, s.yes], [false, s.no], [undefined, s.notSure]] as const;

  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.questionsTitle}</h1>
      <p className="lede">{s.questionsHint}</p>

      {pills("born", s.bornWhere, [["la_county", s.bornLA], ["california", s.bornCA], ["us_state", s.bornUS], ["abroad", s.bornAbroad]] as const)}
      {pills("unhoused", s.unhoused, yesNo)}
      {pills("fireSurvivor", s.fire, yesNo)}
      {pills("hasWitnesses", s.witnesses, yesNo)}

      <fieldset className="q">
        <legend>{s.age}</legend>
        <div className="pills">
          {s.ageBands.map((label, i) => (
            <button key={label} className="pill" aria-pressed={bandOf(facts.age) === i} onClick={() => set("age", AGE_BANDS[i])}>{label}</button>
          ))}
        </div>
      </fieldset>

      {pills("fosterYouth", s.foster, yesNo)}
      {pills("publicAssistance", s.benefits, yesNo)}

      <div className="actions sticky">
        <button className="primary grow" onClick={onNext}>{s.seePath} <Icon name="arrow" size={20} stroke={2.2} /></button>
      </div>
    </section>
  );
}
