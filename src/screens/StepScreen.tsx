import { Icon, Notice, Section, SourceCard, money, placeOf, sayFor } from "../components";
import type { Plan, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { href } from "../router";

// OWNER: Adrian. One step, with the proof: where to go, what to bring, what to
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

  const time = a.days > 0 ? s.readyIn(a.days) : !st.newTrip && n > 1 ? s.sameVisit(n - 1) : (place.inPerson ? s.timeVisit : s.timeMail);

  return (
    <section className="screen">
      <h1 tabIndex={-1}>{a.label[lang]}</h1>
      {a.why && <p className="lede">{a.why[lang]}</p>}

      <dl className="facts">
        <div><dt>{s.where}</dt><dd>{place.label[lang]}</dd></div>
        <div>
          <dt>{s.cost}</dt>
          <dd>
            <strong>{st.dollars === 0 ? s.free : money(st.dollars)}</strong>
            {was !== null && <> <s className="muted">{money(was)}</s><span className="muted"> · {st.waiver!.label[lang]}</span></>}
          </dd>
        </div>
        <div><dt>{s.time}</dt><dd>{time.charAt(0).toUpperCase() + time.slice(1)}</dd></div>
      </dl>

      {!a.verified && <Notice tone="warn" title={s.callAhead}>{s.callAheadLong}</Notice>}

      {a.bring?.length ? (
        <Section title={s.bring}>
          <ul className="bring">{a.bring.map((b) => <li key={b.en}>{b[lang]}</li>)}</ul>
        </Section>
      ) : null}

      {say && (
        <Section title={s.sayThis}>
          <blockquote className="say">“{say[lang]}”</blockquote>
        </Section>
      )}

      <Section title={s.whyWorks}>
        <div className="sources">{a.sources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} verified={a.verified} />)}</div>
      </Section>

      {waiverSources.length > 0 && (
        <Section title={s.whyFree}>
          <div className="sources">{waiverSources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} verified={a.verified} />)}</div>
        </Section>
      )}

      <nav className="actions pair" aria-label={s.backToPath}>
        {n > 1
          ? <a className="secondary" href={href({ name: "step", n: n - 1 })}><Icon name="back" size={18} /> {s.prevStep}</a>
          : <a className="secondary" href={href({ name: "path" })}><Icon name="back" size={18} /> {s.yourPathShort}</a>}
        {n < total
          ? <a className="primary" href={href({ name: "step", n: n + 1 })}>{s.nextStep} <Icon name="arrow" size={18} /></a>
          : <a className="primary" href={href({ name: "packet" })}><Icon name="print" size={18} /> {s.printPacket}</a>}
      </nav>
    </section>
  );
}
