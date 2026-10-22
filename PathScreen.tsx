import { CallAhead, Icon, Receipt, money, placeOf } from "../components";
import type { Facts, Mode, Plan, RuleSet, Step } from "../engine/types";
import { t, type Lang } from "../i18n";
import { href } from "../router";

// OWNER: Adrian. The hero screen: the bill at the top (the total, with the
// full price struck through), then the steps as a timeline. Each step title
// opens its detail screen with the proof.

export function whenLine(rules: RuleSet, steps: Step[], i: number, lang: Lang): string {
  const s = t[lang];
  const st = steps[i];
  const place = placeOf(rules, st);
  const start = st.startDay === 0 ? s.startsToday : s.startsAround(st.startDay);
  if (!place.inPerson) return `${start} · ${s.byMail} · ${s.readyIn(st.action.days)}`;
  const visit = !st.newTrip && i > 0 ? s.sameVisit(i) : s.oneVisit;
  return st.action.days === 0 ? `${start} · ${visit}` : `${start} · ${visit} · ${s.readyIn(st.action.days)}`;
}

export function StepList({ rules, lang, plan, linked = true }: { rules: RuleSet; lang: Lang; plan: Plan; linked?: boolean }) {
  const s = t[lang];
  return (
    <ol className="timeline">
      {plan.steps.map((st, i) => {
        const a = st.action;
        const was = st.dollars < a.dollars ? a.dollars : null;
        return (
          <li key={a.id} className={`tl-step ${a.verified ? "ok" : "unverified"}`} style={{ ["--i" as string]: i }}>
            <div className="tl-rail" aria-hidden="true">
              <span className="tl-num">{i + 1}</span>
              {i < plan.steps.length - 1 && <span className="tl-line" />}
            </div>
            <div className="tl-body">
              <div className="kicker">{placeOf(rules, st).label[lang]}</div>
              {linked
                ? <a className="tl-title" href={href({ name: "step", n: i + 1 })}>{a.label[lang]}</a>
                : <div className="tl-title">{a.label[lang]}</div>}
              <div className="tl-cost">
                <span className="cost">{st.dollars === 0 ? s.free : money(st.dollars)}</span>
                {was !== null && <s className="was mono">{money(was)}</s>}
                {st.waiver && was !== null && <span className="chip go">{st.waiver.label[lang]}</span>}
                {!a.verified && <CallAhead lang={lang} />}
              </div>
              <div className="tl-when">{whenLine(rules, plan.steps, i, lang)}</div>
            </div>
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
      {elsewhere && <p className="callout">{s.noPathBornElsewhere}</p>}
      <h2>{s.noPathWho}</h2>
      <ul className="helpers">
        <li><a href="tel:211" className="helper"><Icon name="phone" /><div><strong>{s.help211}</strong><br />{s.help211Line}</div></a></li>
        <li><a href="tel:+12132413552" className="helper"><Icon name="cap" /><div><strong>{s.helpLausd}</strong><br />{s.helpLausdLine}</div></a></li>
      </ul>
      <div className="actions">
        <button className="secondary grow" onClick={onBack}>{s.changeAnswers}</button>
      </div>
    </section>
  );
}

export function PathScreen(props: {
  rules: RuleSet; lang: Lang; result: Plan | null; mode: Mode; onMode: (m: Mode) => void;
  help: { doc: string; plan: Plan } | null; facts: Facts; onChangeAnswers: () => void;
}) {
  const { rules, lang, result, mode, onMode, help, facts } = props;
  const s = t[lang];
  if (!result) return <NoPath lang={lang} facts={facts} onBack={props.onChangeAnswers} />;

  const unverified = result.steps.filter((st) => !st.action.verified).length;
  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.pathTitle}</h1>
      <Receipt plan={result} lang={lang} />

      <div className="seg" role="group" aria-label={s.modesLabel}>
        {(["cheapest", "fewestTrips", "fastest"] as const).map((m) => (
          <button key={m} className="pill small" aria-pressed={mode === m} onClick={() => onMode(m)}>
            {m === "cheapest" ? s.modeCheapest : m === "fewestTrips" ? s.modeTrips : s.modeFastest}
          </button>
        ))}
      </div>

      <StepList rules={rules} lang={lang} plan={result} />

      <p className={`status ${unverified ? "amber" : "go"}`}>
        {unverified ? s.unverifiedNote(unverified, result.steps.length) : s.allVerified}
      </p>

      {help && (
        <aside className="callout go">
          <strong>{s.helpsTitle}</strong>
          <p className="helps-doc">{rules.docs[help.doc].label[lang]}</p>
          <p>{s.helpsResult(help.plan.total.steps, help.plan.total.dollars)}</p>
          <a className="inline-link" href={href({ name: "whatif" })}>{s.seeThatPath} <Icon name="arrow" size={16} stroke={2.2} /></a>
        </aside>
      )}

      <div className="actions two">
        <a className="secondary" href={href({ name: "sources" })}>{s.howWeKnow}</a>
        <a className="primary" href={href({ name: "packet" })}><Icon name="print" size={20} /> {s.printPacket}</a>
      </div>
      <p className="fine center">{s.pathFoot}</p>
    </section>
  );
}
