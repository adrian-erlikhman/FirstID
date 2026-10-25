import { useMemo } from "react";
import { Br, FORM_PDF, FormPaper, HandNote, Icon, Loop, PathCard, Photo, Portrait, Printout, Solver, fullPrice, money, photoUrl } from "../components";
import { plan } from "../engine/planner";
import type { RuleSet } from "../engine/types";
import { examples } from "../examples";
import { withImplied } from "../person";
import { t, type Lang } from "../i18n";

// OWNER: Adrian. The first thing anyone sees: the problem, the way out, and
// what the app does, before it asks for anything. The hero is Maria's real
// computed path, shown as an ID card lying on top of her checklist.
export function HomeScreen({ rules, lang, onStart, onExample }: {
  rules: RuleSet; lang: Lang; onStart: () => void; onExample: (id: string) => void;
}) {
  const s = t[lang];
  const nSources = Object.keys(rules.sources).length;
  const nWaivers = rules.actions.reduce((n, a) => n + (a.waivers?.length ?? 0), 0);
  // The example cards show each person's real computed path, not typed numbers.
  const exPlans = useMemo(() => examples.map((e) => plan(rules, { ...e.person, have: withImplied(e.person.have) }, "cheapest")), [rules]);
  const maria = exPlans[examples.findIndex((e) => e.id === "maria")];
  const band = (["office", "papers", "counter"] as const).filter((n) => photoUrl(n));

  return (
    <section className="screen home">
      <div className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">{s.heroEyebrow}</p>
          <h1 tabIndex={-1} className="display hero-title">
            <span className="hero-a">{s.heroA}</span>{" "}
            <span className="hero-b"><span className="hl">{s.heroB}.</span></span>
          </h1>
          <p className="hero-lede">{s.heroLede}</p>
          <div className="actions row">
            <button className="btn primary" onClick={onStart}>{s.start} <Icon name="arrow" size={18} /></button>
            <button className="btn ghost" onClick={() => onExample("maria")}>{s.seeMaria}</button>
          </div>
          <p className="hero-note">{s.heroNote}</p>
        </div>

        {maria && (
          <div className="hero-art" aria-hidden="true">
            <span className="hero-sheet">
              <span className="hs-head">{s.cardLabel} · Maria</span>
              <span className="hs-rows">
                {maria.steps.map((st, i) => (
                  <span className="hs-row" key={st.action.id}>
                    <span className="hs-n">{i + 1}</span>
                    <span className="hs-label">{st.action.label[lang]}</span>
                    <span className={`num${st.dollars === 0 ? " free" : ""}`}>{st.dollars === 0 ? s.free : money(st.dollars)}</span>
                  </span>
                ))}
              </span>
            </span>
            <span className="hero-card"><PathCard plan={maria} lang={lang} mode="cheapest" name="Maria" /></span>
          </div>
        )}
      </div>

      <dl className="stats">
        {maria && <div><dd className="num">{money(maria.total.dollars)}</dd><dt>{s.statsMaria(fullPrice(maria))}</dt></div>}
        <div><dd className="num">{nWaivers}</dd><dt>{s.statsWaivers}</dt></div>
        <div><dd className="num">{rules.actions.length}</dd><dt>{s.statsRules}</dt></div>
        <div><dd className="num">0</dd><dt>{s.statsPrivate}</dt></div>
      </dl>

      {band.length > 0 && (
        <div className={`photo-band n${band.length}`}>
          {band.map((n) => <Photo key={n} name={n} alt={s.photos[n][0]} caption={s.photos[n][1]} />)}
        </div>
      )}

      <section className="home-sec">
        <Printout index="01" kicker={s.secLoop} readout={`2 ${lang === "es" ? "documentos" : "documents"} · 1 ${lang === "es" ? "círculo" : "loop"}`} />
        <div className="split">
          <div className="head">
            <h2 className="display h2">{s.loopTitleA} <span className="second">{s.loopTitleB}</span></h2>
            <p className="lede">{s.homeLede}</p>
            <p className="body-text">{s.homeWayOut}</p>
          </div>
          <div className="body">
            <Solver title={s.secLoop} readout={`${nWaivers} ${lang === "es" ? "exenciones" : "fee waivers"}`}>
              <div className="loop-wrap"><Loop lang={lang} /></div>
            </Solver>
            <HandNote className="loop-note">{s.loopNote}</HandNote>
          </div>
        </div>
      </section>

      <section className="home-sec">
        <Printout index="02" kicker={s.secForms} readout={s.formsReadout} />
        <div className="split">
          <div className="head">
            <h2 className="display h2">{s.formsTitleA} <span className="second">{s.formsTitleB}</span></h2>
            <p className="lede">{s.formsBody}</p>
            <p className="fine">{s.formsNote} <a href={FORM_PDF} target="_blank" rel="noreferrer">{s.openForm} <Icon name="external" size={13} /></a></p>
          </div>
          <div className="body papers">
            <FormPaper form="application" lang={lang} className="p-a" />
            <FormPaper form="certificate" lang={lang} className="p-b" />
          </div>
        </div>
      </section>

      <section className="home-sec">
        <Printout index="03" kicker={s.secHow} readout={s.howReadout} />
        <div className="split">
          <div className="head">
            <h2 className="display h2">{s.howTitleA} <span className="second">{s.howTitleB}</span></h2>
            <p className="lede">{s.homeFor}</p>
            <Photo name="phone" alt={s.photos.phone[0]} caption={s.photos.phone[1]} className="side" />
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
        <Printout index="04" kicker={s.secGet} readout={`${rules.actions.length} ${s.statRules} · ${nSources} ${s.statSources} · EN/ES`} />
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
        <Printout index="05" kicker={s.secTry} readout={s.people(examples.length)} />
        <h2 className="display h2 wide">{s.tryTitleA} <span className="second">{s.tryTitleB}</span></h2>
        <ul className="people">
          {examples.map((e, i) => {
            const p = exPlans[i];
            return (
              <li key={e.id}>
                <button className="person-card" onClick={() => onExample(e.id)}>
                  <Portrait className="pc-photo" />
                  <span className="pc-body">
                    <strong>{e.name}</strong>
                    <span className="row-sub">{e.line[lang]}</span>
                  </span>
                  <span className="pc-foot">
                    {p
                      ? <><Br>{money(p.total.dollars)}</Br><span>{p.total.steps} {s.unitSteps(p.total.steps)} · {s.timeShort(p.total.days)}</span></>
                      : <span>{s.noPathShort}</span>}
                    <Icon name="arrow" size={16} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="body-text people-note">{s.examplesNote}</p>
      </section>

      <p className="fine">{s.homeFine}</p>
    </section>
  );
}
