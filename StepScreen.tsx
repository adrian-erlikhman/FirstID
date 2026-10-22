import { CallAhead, Icon, Section, SourceCard, money, placeOf, sayFor } from "../components";
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

  const timeMain = place.inPerson ? s.timeVisit : s.timeMail;
  const timeSub = a.days > 0 ? s.readyIn(a.days) : !st.newTrip && n > 1 ? s.sameVisit(n - 1) : place.label[lang];

  return (
    <section className="screen step-screen">
      <h1 tabIndex={-1} className="h-step">{a.label[lang]}</h1>
      {a.why && <p className="lede ink">{a.why[lang]}</p>}

      <div className="facts-row">
        <div className="fact-tile">
          <div className="fact-k">{s.cost}</div>
          <div className="fact-v">{st.dollars === 0 ? s.free : money(st.dollars)} {was !== null && <s className="was mono">{money(was)}</s>}</div>
          {st.waiver && was !== null && <div className="fact-sub">{st.waiver.label[lang]}</div>}
        </div>
        <div className="fact-tile">
          <div className="fact-k">{s.time}</div>
          <div className="fact-v">{timeMain}</div>
          <div className="fact-sub">{timeSub}</div>
        </div>
      </div>

      {!a.verified && <CallAhead lang={lang} long />}

      {a.bring?.length ? (
        <Section title={s.bring}>
          <ul className="bring">{a.bring.map((b) => <li key={b.en}>{b[lang]}</li>)}</ul>
        </Section>
      ) : null}

      {say && (
        <Section title={s.sayThis}>
          <p className="say">“{say[lang]}”</p>
        </Section>
      )}

      <Section title={s.whyWorks} className="proof">
        <div className="sources-stack">
          {a.sources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} />)}
        </div>
      </Section>

      {waiverSources.length > 0 && (
        <Section title={s.whyFree} className="proof">
          <p className="muted">{st.waiver!.label[lang]}</p>
          <div className="sources-stack">
            {waiverSources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} />)}
          </div>
        </Section>
      )}

      <nav className="actions two step-nav" aria-label={s.backToPath}>
        {n > 1
          ? <a className="secondary" href={href({ name: "step", n: n - 1 })}><Icon name="back" size={18} stroke={2.2} /> {s.prevStep}</a>
          : <a className="secondary" href={href({ name: "path" })}><Icon name="back" size={18} stroke={2.2} /> {s.yourPathShort}</a>}
        {n < total
          ? <a className="primary" href={href({ name: "step", n: n + 1 })}>{s.nextStep} <Icon name="arrow" size={18} stroke={2.2} /></a>
          : <a className="primary" href={href({ name: "packet" })}><Icon name="print" size={18} /> {s.printPacket}</a>}
      </nav>
    </section>
  );
}
