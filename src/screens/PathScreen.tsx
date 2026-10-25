import { Icon, Notice, Segmented, Summary, Unconfirmed, money, placeOf } from "../components";
import type { Facts, Mode, Plan, RuleSet, Step } from "../engine/types";
import { t, type Lang } from "../i18n";
import { href } from "../router";

// OWNER: Adrian. The hero screen: the total first, then the steps in order.
// Each step is one tappable row that opens its detail screen with the proof.

export function whenLine(rules: RuleSet, steps: Step[], i: number, lang: Lang): string {
  const s = t[lang];
  const st = steps[i];
  const place = placeOf(rules, st);
  const start = st.startDay === 0 ? s.startsToday : s.startsAround(st.startDay);
  if (!place.inPerson) return `${start} · ${s.byMail} · ${s.readyIn(st.action.days)}`;
  const visit = !st.newTrip && i > 0 ? s.sameVisit(i) : s.oneVisit;
  return st.action.days === 0 ? `${start} · ${visit}` : `${start} · ${visit} · ${s.readyIn(st.action.days)}`;
}

export function StepList({ rules, lang, plan }: { rules: RuleSet; lang: Lang; plan: Plan }) {
  const s = t[lang];
  return (
    <ol className="steps">
      {plan.steps.map((st, i) => {
        const a = st.action;
        const was = st.dollars < a.dollars ? a.dollars : null;
        return (
          <li key={a.id} className={a.verified ? "" : "unverified"}>
            <a className="step-row" href={href({ name: "step", n: i + 1 })}>
              <span className="step-num" aria-hidden="true">{i + 1}</span>
              <span className="step-main">
                <span className="step-place">{placeOf(rules, st).label[lang]}</span>
                <span className="step-title">{a.label[lang]}</span>
                <span className="step-meta">
                  <strong className="step-cost">{st.dollars === 0 ? s.free : money(st.dollars)}</strong>
                  {was !== null && <> <s>{money(was)}</s> · {st.waiver!.label[lang]}</>}
                </span>
                <span className="step-when">{whenLine(rules, plan.steps, i, lang)}</span>
                {!a.verified && <Unconfirmed lang={lang} />}
              </span>
              <Icon name="chevron" size={18} />
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function NoPath({ lang, facts, onBack }: { lang: Lang; facts: Facts; onBack: () => void }) {
  const s = t[lang];
  const elsewhere = facts.born === "us_state" || facts.born === "abroad";
  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.noPathTitle}</h1>
      <p className="lede">{s.noPathBody}</p>
      {elsewhere && <Notice>{s.noPathBornElsewhere}</Notice>}
      <p><a href={href({ name: "whatif" })}>{s.tryWhatIf}</a></p>
      <h2 className="section-title">{s.noPathWho}</h2>
      <ul className="link-list">
        <li><a className="link-row" href="tel:211"><span><strong>{s.help211}</strong><span className="muted">{s.help211Line}</span></span><Icon name="phone" size={18} /></a></li>
        <li><a className="link-row" href="tel:+12132413552"><span><strong>{s.helpLausd}</strong><span className="muted">{s.helpLausdLine}</span></span><Icon name="phone" size={18} /></a></li>
      </ul>
      <div className="actions">
        <button className="secondary" onClick={onBack}>{s.changeAnswers}</button>
      </div>
    </section>
  );
}

export function PathScreen(props: {
  rules: RuleSet; lang: Lang; result: Plan | null; mode: Mode; onMode: (m: Mode) => void;
  help: { doc: string; plan: Plan } | null; facts: Facts; onChangeAnswers: () => void; ms: number;
}) {
  const { rules, lang, result, mode, onMode, help, facts, ms } = props;
  const s = t[lang];
  if (!result) return <NoPath lang={lang} facts={facts} onBack={props.onChangeAnswers} />;

  const unverified = result.steps.filter((st) => !st.action.verified).length;
  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.pathTitle}</h1>
      <Summary plan={result} lang={lang} />

      <Segmented label={s.modesLabel} value={mode} onChange={onMode}
        options={[["cheapest", s.modeCheapest], ["fewestTrips", s.modeTrips], ["fastest", s.modeFastest]] as const} />
      <p className="mode-hint">{s.modeHint[mode]}</p>

      <StepList rules={rules} lang={lang} plan={result} />

      {unverified > 0
        ? <Notice tone="warn">{s.unverifiedNote(unverified, result.steps.length)}</Notice>
        : <Notice tone="accent">{s.allVerified}</Notice>}

      {help && (
        <Notice tone="accent" title={s.helpsTitle}>
          <p><strong>{rules.docs[help.doc].label[lang]}</strong></p>
          <p>{s.helpsResult(help.plan.total.steps, help.plan.total.dollars)}</p>
          <a href={href({ name: "whatif" })}>{s.seeThatPath}</a>
        </Notice>
      )}

      <div className="actions stack">
        <a className="primary" href={href({ name: "packet" })}><Icon name="print" size={20} /> {s.printPacket}</a>
        <a className="secondary" href={href({ name: "whatif" })}>{s.whatIfLink}</a>
        <a className="secondary" href={href({ name: "sources" })}>{s.howWeKnow}</a>
      </div>
      {result.explored !== undefined && <p className="fine">{s.foundBy(result.explored, ms)}</p>}
      <p className="fine">{s.pathFoot}</p>
    </section>
  );
}
