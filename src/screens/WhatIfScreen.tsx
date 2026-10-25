import { useMemo, useState } from "react";
import { PathCard, Printout, Solver, money, useRecompute } from "../components";
import { plan } from "../engine/planner";
import type { Mode, Person, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { applyFlips, flipKey, flipsThatMatter, samePlan, type Flip } from "../whatif";

// OWNER: Adrian (screen) + Ryan (re-planning). Flip an answer, the planner
// runs again, and the steps that drop out disappear. The only motion in the
// app is here and on the brackets, because the change in the path is the point.
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
  const busy = useRecompute(on.join("|"));

  return (
    <section className="screen">
      <Printout index="04" kicker={s.secWhatIf} readout={s.mattersCount(options.length)} />
      <div className="split">
        <div className="head">
          <h1 tabIndex={-1} className="display">{s.whatIfTitleA} <span className="second">{s.whatIfTitleB}</span></h1>
          <p className="lede">{options.length > 0 ? s.whatIfHint : base ? s.whatIfNone : s.whatIfNoneNoPath}</p>
        </div>

        <div className="body">
          {options.length > 0 && (
            <ul className="panel toggle-list">
              {options.map((o) => {
                const k = flipKey(o.flip);
                const yes = o.flip.kind === "doc" ? next.have.includes(o.flip.doc) : next.facts[o.flip.fact] === true;
                const label = o.flip.kind === "doc" ? rules.docs[o.flip.doc].label[lang] : s.factLabels[o.flip.fact];
                return (
                  <li key={k}>
                    <button className="toggle-row" role="switch" aria-checked={yes} onClick={() => toggle(k)}>
                      <span>{label}</span>
                      <span className="switch-text">{yes ? s.yes : s.no}</span>
                      <span className="switch" aria-hidden="true"><span /></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="whatif-result" aria-live="polite">
            {result && <PathCard plan={result} lang={lang} mode={mode} busy={busy} className="path-card" />}
            <Solver title={s.secWhatIf} readout={on.length ? s.withChange : s.nowLabel}>
              {result ? (
                <>
                  <ol className="mini-steps">
                    {result.steps.map((st, i) => (
                      <li key={st.action.id} style={{ ["--i" as string]: i }}>
                        <span className="row-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                        <span>{st.action.label[lang]}</span>
                        <span className="num">{st.dollars === 0 ? s.free : money(st.dollars)}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : <p className="whatif-none">{s.noPathShort}</p>}
            </Solver>
            {on.length > 0 && base && (
              <p className="compare">
                {samePlan(result, base) ? s.sameAsNow : `${s.nowLabel}: ${money(base.total.dollars)} · ${base.total.steps} ${s.unitSteps(base.total.steps)} · ${base.total.trips} ${s.unitTrips(base.total.trips)} · ${s.timeShort(base.total.days)}`}
              </p>
            )}
          </div>

          {on.length > 0 && (
            <div className="actions pair">
              <button className="btn ghost" onClick={() => setOn([])}>{s.reset}</button>
              <button className="btn primary" onClick={() => onApply(next)}>{s.useThese}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
