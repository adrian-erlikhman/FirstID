import { useMemo, useState } from "react";
import { Collapse, LiveNote, PathCard, Solver, Swap, fullPrice, money } from "../components";
import { plan } from "../engine/planner";
import type { Mode, Person, RuleSet } from "../engine/types";
import { useListPresence } from "../motion";
import { t, type Lang } from "../i18n";
import { applyFlips, flipKey, flipsThatMatter, samePlan, type Flip } from "../whatif";

// "5 steps", "~7 wks": a number and its unit wrap as one piece, never "~7" / "sem.".
const keep = (x: string) => x.replace(/ /g, "\u00a0");

// Flip an answer, the planner runs again, and the steps that drop out
// slide away while the card counts to the new total. The only motion in the app is here and on the brackets, because
// the change in the path is the point.
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
  const rows = useListPresence(result?.steps ?? [], (st) => st.action.id);
  const toggle = (k: string) => setOn(on.includes(k) ? on.filter((x) => x !== k) : [...on, k]);

  return (
    <section className="screen">
      <div className="split">
        <div className="head">
          <h1 tabIndex={-1} className="display">{s.whatIfTitle}</h1>
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
                      <span aria-hidden="true"><Swap className="switch-text" text={yes ? s.yes : s.no} /></span>
                      <span className="switch" aria-hidden="true"><span /></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="whatif-result">
            <LiveNote text={result ? s.cardSummary({ total: result.total.dollars, full: fullPrice(result), steps: result.total.steps, trips: result.total.trips, days: result.total.days }) : s.noPathShort} />
            <Collapse show={!!result}>
              {result && <PathCard plan={result} lang={lang} mode={mode} className="path-card" />}
            </Collapse>
            <Solver title={s.secWhatIf} readout={<Swap text={on.length ? s.withChange : s.nowLabel} />}>
              <ol className="mini-steps">
                {rows.map(({ item: st, key, phase, num }) => (
                  <li key={key} className={phase} style={{ ["--i" as string]: num - 1 }}>
                    <div className="mini-clip">
                      <div className="mini-in">
                        <span className="row-num" aria-hidden="true">{num}</span>
                        <span>{st.action.label[lang]}</span>
                        <Swap className={`num${st.dollars === 0 ? " free" : ""}`} text={st.dollars === 0 ? s.free : money(st.dollars)} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <Collapse show={!result}><p className="whatif-none">{s.noPathShort}</p></Collapse>
            </Solver>
            <Collapse show={on.length > 0 && !!base}>
              {base && (
                <p className="compare">
                  <Swap text={samePlan(result, base) ? s.sameAsNow : s.nowWas(money(base.total.dollars), keep(`${base.total.steps} ${s.unitSteps(base.total.steps)}`), keep(`${base.total.trips} ${s.unitTrips(base.total.trips)}`), keep(s.timeShort(base.total.days)))} />
                </p>
              )}
            </Collapse>
          </div>

          <Collapse show={on.length > 0}>
            <div className="actions pair">
              <button className="btn ghost" onClick={() => {
                setOn([]);
                // These buttons slide away with the changes, so keep focus on the first switch.
                document.querySelector<HTMLElement>("main .toggle-row")?.focus();
              }}>{s.reset}</button>
              <button className="btn primary" onClick={() => onApply(next)}>{s.useThese}</button>
            </div>
          </Collapse>
        </div>
      </div>
    </section>
  );
}
