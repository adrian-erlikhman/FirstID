import { useMemo } from "react";
import { Br, HandNote, Icon, Lockup, Loop, Printout, Solver, money } from "../components";
import { plan } from "../engine/planner";
import type { RuleSet } from "../engine/types";
import { examples } from "../examples";
import { withImplied } from "../person";
import { t, type Lang } from "../i18n";

// OWNER: Adrian. The first thing anyone sees: the problem, the way out, and
// what the app does, before it asks for anything. Laid out like Monte: a big
// two-voice headline, then numbered sections that open like a printout.
export function HomeScreen({ rules, lang, onStart, onExample }: {
  rules: RuleSet; lang: Lang; onStart: () => void; onExample: (id: string) => void;
}) {
  const s = t[lang];
  const nSources = Object.keys(rules.sources).length;
  const nWaivers = rules.actions.reduce((n, a) => n + (a.waivers?.length ?? 0), 0);
  // The example rows show each person's real computed path, not typed numbers.
  const exPlans = useMemo(() => examples.map((e) => plan(rules, { ...e.person, have: withImplied(e.person.have) }, "cheapest")), [rules]);

  return (
    <section className="screen home">
      <div className="hero">
        <div className="hero-lockup"><Lockup resolved /></div>
        <h1 tabIndex={-1} className="display hero-title">
          <span className="hero-a">{s.heroA}</span>{" "}
          <span className="hero-b">{s.heroB}<span className="hero-dot">.</span></span>
        </h1>
        <p className="hero-lede">{s.heroLede}</p>
        <div className="actions row">
          <button className="btn primary" onClick={onStart}>{s.start} <Icon name="arrow" size={18} /></button>
          <button className="btn ghost" onClick={() => onExample("maria")}>{s.seeMaria}</button>
        </div>
        <p className="hero-note">{s.heroNote}</p>
      </div>

      <section className="home-sec">
        <Printout index="01" kicker={s.secLoop} readout={`2 ${lang === "es" ? "documentos" : "documents"} · 1 ${lang === "es" ? "círculo" : "loop"}`} />
        <div className="split">
          <div className="head">
            <h2 className="display h2">{s.loopTitleA} <span className="second">{s.loopTitleB}</span></h2>
            <p className="lede">{s.homeLede}</p>
            <p className="body-text">{s.homeWayOut}</p>
          </div>
          <div className="body">
            <Solver command="first-id why --no-id --no-birth-certificate" readout={`${nWaivers} ${lang === "es" ? "exenciones" : "fee waivers"}`}>
              <div className="loop-wrap"><Loop lang={lang} /></div>
            </Solver>
            <HandNote dir="up" className="loop-note">{s.loopNote}</HandNote>
          </div>
        </div>
      </section>

      <section className="home-sec">
        <Printout index="02" kicker={s.secHow} readout={s.howReadout} />
        <div className="split">
          <div className="head">
            <h2 className="display h2">{s.howTitleA} <span className="second">{s.howTitleB}</span></h2>
            <p className="lede">{s.homeFor}</p>
          </div>
          <div className="body">
            <ol className="panel how">
              {s.how.map(([title, text], i) => (
                <li key={title}>
                  <span className="row-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span><strong>{title}</strong><span className="row-sub">{text}</span></span>
                </li>
              ))}
            </ol>
            <div className="actions row">
              <button className="btn primary" onClick={onStart}>{s.start} <Icon name="arrow" size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-sec">
        <Printout index="03" kicker={s.secGet} readout={`${rules.actions.length} ${s.statRules} · ${nSources} ${s.statSources} · EN/ES`} />
        <h2 className="display h2 wide">{s.getTitleA} <span className="second">{s.getTitleB}</span></h2>
        <ul className="features">
          {s.features.map(([title, text], i) => (
            <li key={title} className="panel">
              <span className="label">{String(i + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <span className="row-sub">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-sec">
        <Printout index="04" kicker={s.secTry} readout={s.people(examples.length)} />
        <div className="split">
          <div className="head">
            <h2 className="display h2">{s.tryTitleA} <span className="second">{s.tryTitleB}</span></h2>
            <p className="lede">{s.examplesNote}</p>
          </div>
          <div className="body">
            <ul className="panel link-list">
              {examples.map((e, i) => {
                const p = exPlans[i];
                return (
                  <li key={e.id}>
                    <button className="link-row" onClick={() => onExample(e.id)}>
                      <span className="link-main"><strong>{e.name}</strong><span className="row-sub">{e.line[lang]}</span></span>
                      {p && (
                        <span className="link-readout">
                          <Br>{money(p.total.dollars)}</Br>
                          <span>{p.total.steps} {s.unitSteps(p.total.steps)}</span>
                        </span>
                      )}
                      <Icon name="chevron" size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <p className="fine">{s.homeFine}</p>
    </section>
  );
}
