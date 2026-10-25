import { Icon, Pills, Printout } from "../components";
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

// "Not sure" is remembered separately, so a question nobody has answered yet
// shows no choice at all, while "Not sure" still leaves the fact unset.
export const NOT_SURE = "__not_sure__";
const KEYS = ["born", "unhoused", "fireSurvivor", "hasWitnesses", "age", "fosterYouth", "publicAssistance"];

export function QuestionsScreen(props: {
  lang: Lang; facts: Facts; unsure: string[];
  onChange: (f: Facts, unsure: string[]) => void; onNext: () => void;
}) {
  const { lang, facts, unsure, onChange, onNext } = props;
  const s = t[lang];
  const set = (k: string, v: Facts[string] | typeof NOT_SURE) => {
    const next = { ...facts };
    if (v === NOT_SURE) delete next[k]; else next[k] = v;
    onChange(next, v === NOT_SURE ? [...new Set([...unsure, k])] : unsure.filter((x) => x !== k));
  };
  const valueOf = (k: string) => (facts[k] !== undefined ? facts[k] : unsure.includes(k) ? NOT_SURE : null);
  const answered = KEYS.filter((k) => valueOf(k) !== null).length;
  const yesNo = [[true, s.yes], [false, s.no], [NOT_SURE, s.notSure]] as const;
  let num = 0;

  // A plain function, not a component: a component defined inside render
  // would remount on every tap and drop keyboard focus.
  const question = (k: string, q: string, opts: readonly (readonly [Facts[string] | typeof NOT_SURE, string])[]) => (
    <fieldset className="q" key={k}>
      <legend><span className="row-num" aria-hidden="true">{String(++num).padStart(2, "0")}</span><span>{q}</span></legend>
      <Pills label={q} options={opts} value={valueOf(k)} onChange={(v) => set(k, v)} />
    </fieldset>
  );

  return (
    <section className="screen">
      <Printout index="02" kicker={s.secQuestions} readout={`2 / 3 · ${s.answeredCount(answered, KEYS.length)}`} />
      <div className="split">
        <div className="head">
          <h1 tabIndex={-1} className="display">{s.questionsTitle} <span className="second">{s.questionsSecond}</span></h1>
          <p className="lede">{s.questionsHint}</p>
        </div>
        <div className="body">
          <div className="panel questions">
            {question("born", s.bornWhere, [["la_county", s.bornLA], ["california", s.bornCA], ["us_state", s.bornUS], ["abroad", s.bornAbroad]] as const)}
            {question("unhoused", s.unhoused, yesNo)}
            {question("fireSurvivor", s.fire, yesNo)}
            {question("hasWitnesses", s.witnesses, yesNo)}
            <fieldset className="q">
              <legend><span className="row-num" aria-hidden="true">{String(++num).padStart(2, "0")}</span><span>{s.age}</span></legend>
              <Pills label={s.age} options={s.ageBands.map((label, i) => [i, label] as const)} value={bandOf(facts.age)}
                onChange={(i) => set("age", AGE_BANDS[i])} />
            </fieldset>
            {question("fosterYouth", s.foster, yesNo)}
            {question("publicAssistance", s.benefits, yesNo)}
          </div>

          <div className="actions sticky">
            <button className="btn primary" onClick={onNext}>{s.seePath} <Icon name="arrow" size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
