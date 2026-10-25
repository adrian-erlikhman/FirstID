import { useMemo, useState } from "react";
import { Summary, money } from "../components";
import { plan } from "../engine/planner";
import type { Mode, Person, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { applyFlips, flipKey, flipsThatMatter, samePlan, type Flip } from "../whatif";

// OWNER: Adrian (screen) + Ryan (re-planning). Flip an answer, the planner
// runs again, and the steps that drop out disappear. The only animation in the
// app is here, because the change in the path is the point.
export function WhatIfScreen(props: {
  rules: RuleSet; lang: Lang; person: Person; mode: Mode; onApply: (p: Person) => void;
}) {
  const { rules, lang, person, mode, onApply } = props;
  const s = t[lang];
  const options = useMemo(() => flipsThatMatter(rules, person, mode), [rules, person, mode]);
  const [on, setOn] = useState<string[]>([]);

  const flips: Flip[] = options.map((o) => o.flip).filter((f) => on.includes(flipKey(f)));
  const next = applyFlips(person, flips);
  const base = useMemo(() => plan(rules, person, mode), [rules, person, mode]);
  const result = plan(rules, next, mode);
  const toggle = (k: string) => setOn(on.includes(k) ? on.filter((x) => x !== k) : [...on, k]);

  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.whatIfTitle}</h1>
      <p className="lede">{options.length > 0 ? s.whatIfHint : base ? s.whatIfNone : s.whatIfNoneNoPath}</p>

      <ul className="toggle-list">
        {options.map((o) => {
          const k = flipKey(o.flip);
          const yes = o.flip.kind === "doc" ? next.have.includes(o.flip.doc) : next.facts[o.flip.fact] === true;
          const label = o.flip.kind === "doc" ? rules.docs[o.flip.doc].label[lang] : s.factLabels[o.flip.fact];
          return (
            <li key={k}>
              <button className="toggle-row" role="switch" aria-checked={yes} onClick={() => toggle(k)}>
                <span>{label}</span>
                <span className="switch" aria-hidden="true"><span /></span>
                <span className="switch-text">{yes ? s.yes : s.no}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="whatif-result" aria-live="polite">
        {result ? (
          <>
            <Summary plan={result} lang={lang} label={on.length ? s.withChange : s.nowLabel} />
            <ol className="mini-steps">
              {result.steps.map((st, i) => (
                <li key={st.action.id} style={{ ["--i" as string]: i }}>
                  <span>{st.action.label[lang]}</span>
                  <span className="muted">{st.dollars === 0 ? s.free : money(st.dollars)}</span>
                </li>
              ))}
            </ol>
          </>
        ) : <p className="lede">{s.noPathShort}</p>}
        {on.length > 0 && base && (
          <p className="compare">
            {samePlan(result, base) ? s.sameAsNow : `${s.nowLabel}: ${money(base.total.dollars)} · ${base.total.steps} ${s.unitSteps(base.total.steps)} · ${base.total.trips} ${s.unitTrips(base.total.trips)} · ${s.timeShort(base.total.days)}`}
          </p>
        )}
      </div>

      {on.length > 0 && (
        <div className="actions pair">
          <button className="secondary" onClick={() => setOn([])}>{s.reset}</button>
          <button className="primary" onClick={() => onApply(next)}>{s.useThese}</button>
        </div>
      )}
    </section>
  );
}
