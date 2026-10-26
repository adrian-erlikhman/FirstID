import { Block, FormPaper, Icon, Notice, SourceCard, WasPrice, formFor, money, placeOf, sayFor } from "../components";
import type { Plan, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { href } from "../router";
import { OfficesLink } from "./OfficesScreen";
import { SayTools } from "./SayTools";

// One step, with the proof: where to go, what to bring, what to
// say, and the official sentence that makes it legal. This is the screen a
// person shows the clerk when the clerk says no.
export function StepScreen({ rules, lang, plan, n }: { rules: RuleSet; lang: Lang; plan: Plan; n: number }) {
  const s = t[lang];
  const st = plan.steps[n - 1];
  if (!st) return null;
  const a = st.action;
  const place = placeOf(rules, st);
  const say = sayFor(st);
  const was = st.dollars < a.dollars ? a.dollars : null;
  const waiverSources = was !== null ? st.waiver?.sources ?? [] : [];
  const total = plan.steps.length;
  const cost = st.dollars === 0 ? s.free : money(st.dollars);

  const time = a.days > 0 ? s.readyIn(a.days) : !st.newTrip && n > 1 ? s.sameVisit(n - 1) : (place.inPerson ? s.timeVisit : s.timeMail);
  const Time = time.charAt(0).toUpperCase() + time.slice(1);

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
            <div><dt>{s.time}</dt><dd>{Time}</dd></div>
          </dl>

          {!a.verified && <Notice tone="draft" title={s.callAhead}>{place.inPerson ? s.callAheadLong : s.callAheadLongMail}</Notice>}

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
