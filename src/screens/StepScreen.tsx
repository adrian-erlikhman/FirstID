import { useMemo } from "react";
import { Block, FormPaper, Icon, Notice, SourceCard, WasPrice, formFor, money, placeOf, sayFor } from "../components";
import { plan as planFor } from "../engine/planner";
import type { Mode, Person, Plan, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { href } from "../router";
import { withoutSteps } from "../whatif";
import { OfficesLink } from "./OfficesScreen";
import { SayTools } from "./SayTools";

// One step, with the proof: where to go, what to bring, what to
// say, and the official sentence that makes it legal. This is the screen a
// person shows the clerk when the clerk says no.
export function StepScreen({ rules, lang, plan, n, person, mode, onSkip }: {
  rules: RuleSet; lang: Lang; plan: Plan; n: number; person: Person; mode: Mode; onSkip: (id: string) => void;
}) {
  const s = t[lang];
  const st = plan.steps[n - 1];
  // "Can't do this step?": the same search with this step taken out.
  const id = st?.action.id;
  const alt = useMemo(() => (id ? planFor(withoutSteps(rules, [id]), person, mode) : null), [rules, id, person, mode]);
  if (!st) return null;
  const a = st.action;
  const place = placeOf(rules, st);
  const say = sayFor(st);
  const was = st.dollars < a.dollars ? a.dollars : null;
  const waiverSources = was !== null ? st.waiver?.sources ?? [] : [];
  const total = plan.steps.length;
  const cost = st.dollars === 0 ? s.free : money(st.dollars);

  const time = a.days > 0 ? s.readyIn(a.days) : !st.newTrip && n > 1 ? s.sameVisit(n - 1) : (place.inPerson ? s.timeVisit : s.timeMail);
  const timeText = time.charAt(0).toUpperCase() + time.slice(1);

  return (
    <section className="screen">
      <div className="split">
        <div className="head">
          <span className="label head-place">{s.stepOf(n, total)}</span>
          <h1 tabIndex={-1} className="display">{a.label[lang]}</h1>
          {a.why && <p className="lede">{a.why[lang]}</p>}
        </div>

        <div className="body">
          <dl className="panel facts">
            <div><dt>{s.where}</dt><dd>{place.label[lang]}<OfficesLink place={a.place} n={n} lang={lang} /></dd></div>
            <div>
              <dt>{s.cost}</dt>
              <dd>
                <span className="num strong">{cost}</span>
                {was !== null && <> <WasPrice dollars={was} lang={lang} /><span className="row-sub"> {st.waiver!.label[lang]}</span></>}
              </dd>
            </div>
            <div><dt>{s.time}</dt><dd>{timeText}</dd></div>
          </dl>

          {!a.verified && (
            <Notice tone="draft" title={s.callAhead}>
              <p>{place.inPerson ? s.callAheadLong : s.callAheadLongMail}</p>
              {s.callAsk[a.id] && <p className="call-ask"><strong>{s.callAskLabel}</strong> “{s.callAsk[a.id]}”</p>}
            </Notice>
          )}

          {a.bring?.length ? (
            <Block label={place.inPerson ? s.bring : s.bringMail}>
              <ul className="panel bring">{a.bring.map((b) => <li key={b.en}><span className="box" aria-hidden="true" />{b[lang]}</li>)}</ul>
            </Block>
          ) : null}

          {say && (
            <Block label={s.sayThis} className="say-block">
              <blockquote className="say">“{say[lang]}”</blockquote>
              <SayTools lang={lang} name={a.label[lang]} where={place.label[lang]} bring={a.bring?.map((b) => b[lang]) ?? []} say={say[lang]} />
            </Block>
          )}

          {formFor(a.id) && (
            <Block label={s.stepForm}>
              <FormPaper form={formFor(a.id)!} lang={lang} className="step-paper" />
            </Block>
          )}

          <Block label={s.whyWorks}>
            <div className="sources">{a.sources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} verified={a.verified} />)}</div>
          </Block>

          {waiverSources.length > 0 && (
            <Block label={s.whyFree}>
              <div className="sources">{waiverSources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} verified={a.verified} />)}</div>
            </Block>
          )}

          <details className="panel cant-do">
            <summary>{s.cantDo}</summary>
            <div className="cant-body">
              {alt ? (
                <>
                  <p>{s.cantDoAlt}</p>
                  <p className="cant-sum num">
                    {[money(alt.total.dollars), `${alt.total.steps} ${s.unitSteps(alt.total.steps)}`, `${alt.total.trips} ${s.unitTrips(alt.total.trips)}`, s.timeShort(alt.total.days)].join(" · ")}
                  </p>
                  <ol className="mini-steps">
                    {alt.steps.map((x, i) => (
                      <li key={x.action.id}>
                        <div className="mini-in">
                          <span className="row-num" aria-hidden="true">{i + 1}</span>
                          <span className="mini-label">{x.action.label[lang]}</span>
                          <span className={`num${x.dollars === 0 ? " free" : ""}`}>{x.dollars === 0 ? s.free : money(x.dollars)}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <button type="button" className="btn ghost" onClick={() => onSkip(a.id)}>{s.cantDoUse}</button>
                </>
              ) : (
                <>
                  <p>{s.cantDoNone}</p>
                  <a className="link-row" href="tel:211"><span className="link-main"><strong>{s.help211}</strong><span className="row-sub">{s.help211Line}</span></span><Icon name="phone" size={18} /></a>
                </>
              )}
            </div>
          </details>

          <nav className="actions pair" aria-label={s.backToPath}>
            {n > 1
              ? <a className="btn ghost" href={href({ name: "step", n: n - 1 })}><Icon name="back" size={16} /> {s.prevStep}</a>
              : <a className="btn ghost" href={href({ name: "path" })}><Icon name="back" size={16} /> {s.yourPathShort}</a>}
            {n < total
              ? <a className="btn primary" href={href({ name: "step", n: n + 1 })}>{s.nextStep} <Icon name="arrow" size={16} /></a>
              : <a className="btn primary" href={href({ name: "packet" })}><Icon name="print" size={16} /> {s.printPacket}</a>}
          </nav>
        </div>
      </div>
    </section>
  );
}
