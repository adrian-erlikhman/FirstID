import { Br, Card3D, CardBack, Formula, Icon, Notice, PathCard, Pills, Printout, Solver, Unconfirmed, money, placeOf } from "../components";
import type { Facts, Mode, Person, Plan, RuleSet, Step } from "../engine/types";
import { t, type Lang } from "../i18n";
import { href } from "../router";

// OWNER: Adrian. The hero screen: the total first, in brackets because the
// planner computed it, then the steps in a solver panel. Each step is one
// tappable row that opens its detail screen with the proof.

export function whenLine(rules: RuleSet, steps: Step[], i: number, lang: Lang): string {
  const s = t[lang];
  const st = steps[i];
  const place = placeOf(rules, st);
  const start = st.startDay === 0 ? s.startsToday : s.startsAround(st.startDay);
  if (!place.inPerson) return `${start} · ${s.byMail} · ${s.readyIn(st.action.days)}`;
  const visit = !st.newTrip && i > 0 ? s.sameVisit(i) : s.oneVisit;
  return st.action.days === 0 ? `${start} · ${visit}` : `${start} · ${visit} · ${s.readyIn(st.action.days)}`;
}

const FLAG: Record<Mode, string> = { cheapest: "--cheapest", fewestTrips: "--fewest-trips", fastest: "--fastest" };

/** The planner's inputs, written as the command that would run it. */
export function commandFor(person: Person, mode: Mode, extra = "") {
  const have = person.have.length ? ` --have ${person.have.join(",")}` : "";
  const born = typeof person.facts.born === "string" ? ` --born ${person.facts.born}` : "";
  const yes = Object.entries(person.facts).filter(([, v]) => v === true).map(([k]) => ` --${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}`).join("");
  return `first-id plan ${FLAG[mode]}${extra}${born}${have}${yes}`;
}

export function StepList({ rules, lang, plan }: { rules: RuleSet; lang: Lang; plan: Plan }) {
  const s = t[lang];
  return (
    <ol className="steps">
      {plan.steps.map((st, i) => {
        const a = st.action;
        const was = st.dollars < a.dollars ? a.dollars : null;
        return (
          <li key={a.id}>
            <a className="step-row" href={href({ name: "step", n: i + 1 })}>
              <span className="row-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="step-main">
                <span className="label step-place">{placeOf(rules, st).label[lang]}</span>
                <span className="step-title">{a.label[lang]}</span>
                {was !== null && <span className="step-waiver">{st.waiver!.label[lang]}</span>}
                <span className="step-when">{whenLine(rules, plan.steps, i, lang)}</span>
                {!a.verified && <Unconfirmed lang={lang} />}
              </span>
              <span className="step-cost">
                <span className={`num${st.dollars === 0 ? " free" : ""}`}>{st.dollars === 0 ? s.free : money(st.dollars)}</span>
                {was !== null && <s className="num">{money(was)}</s>}
              </span>
              <Icon name="chevron" size={16} />
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
      <Printout index="03" kicker={s.secPath} readout="3 / 3" />
      <div className="split">
        <div className="head">
          <h1 tabIndex={-1} className="display">{s.noPathTitleA} <span className="second">{s.noPathTitleB}</span></h1>
          <p className="lede">{s.noPathBody}</p>
        </div>
        <div className="body">
          {elsewhere && <Notice>{s.noPathBornElsewhere}</Notice>}
          <div className="actions row">
            <a className="btn primary" href={href({ name: "whatif" })}>{s.tryWhatIf} <Icon name="arrow" size={18} /></a>
          </div>
          <h2 className="label block-label">{s.noPathWho}</h2>
          <ul className="panel link-list">
            <li><a className="link-row" href="tel:211"><span className="link-main"><strong>{s.help211}</strong><span className="row-sub">{s.help211Line}</span></span><Icon name="phone" size={18} /></a></li>
            <li><a className="link-row" href="tel:+12132413552"><span className="link-main"><strong>{s.helpLausd}</strong><span className="row-sub">{s.helpLausdLine}</span></span><Icon name="phone" size={18} /></a></li>
          </ul>
          <div className="actions row">
            <button className="btn ghost" onClick={onBack}>{s.changeAnswers}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PathScreen(props: {
  rules: RuleSet; lang: Lang; result: Plan | null; mode: Mode; onMode: (m: Mode) => void; person: Person;
  help: { doc: string; plan: Plan } | null; facts: Facts; onChangeAnswers: () => void; ms: number;
}) {
  const { rules, lang, result, mode, onMode, help, facts, ms } = props;
  const s = t[lang];
  if (!result) return <NoPath lang={lang} facts={facts} onBack={props.onChangeAnswers} />;

  const unverified = result.steps.filter((st) => !st.action.verified).length;
  return (
    <section className="screen">
      <Printout index="03" kicker={s.secPath} readout={`3 / 3 · ${result.total.steps} ${s.unitSteps(result.total.steps)}`} />
      <div className="split path-split">
        <div className="head">
          <h1 tabIndex={-1} className="display">
            {s.pathHeadPre} <Br>{money(result.total.dollars)}</Br>{s.pathHeadPost}{" "}
            <span className="second">{s.pathSecond[mode]}</span>
          </h1>
          <div className="actions stack head-actions">
            <a className="btn primary" href={href({ name: "packet" })}><Icon name="print" size={18} /> {s.printPacket}</a>
            <a className="btn ghost" href={href({ name: "whatif" })}>{s.whatIfLink}</a>
            <a className="btn ghost" href={href({ name: "sources" })}>{s.howWeKnow}</a>
          </div>
        </div>

        <div className="body">
          <Card3D lang={lang} className="path-card" front={<PathCard plan={result} lang={lang} mode={mode} />} back={<CardBack plan={result} rules={rules} lang={lang} />} />
          <Solver title={s.cardLabel} readout={result.explored !== undefined ? s.solvedIn(result.explored, ms) : undefined}>
            <div className="solver-tabs">
              <Pills numbered label={s.modesLabel} value={mode} onChange={onMode}
                options={[["cheapest", s.modeCheapest], ["fewestTrips", s.modeTrips], ["fastest", s.modeFastest]] as const} />
              <p className="mode-hint">{s.modeHint[mode]}</p>
            </div>
            <StepList rules={rules} lang={lang} plan={result} />
          </Solver>
          <Formula plan={result} />

          {unverified > 0
            ? <Notice tone="draft" title={s.callAhead}>{s.unverifiedNote(unverified, result.steps.length)}</Notice>
            : <Notice tone="accent">{s.allVerified}</Notice>}

          {help && (
            <div className="panel help">
              <span className="label">{s.helpsTitle}</span>
              <strong className="help-doc">{rules.docs[help.doc].label[lang]}</strong>
              <p>{s.helpsResult(help.plan.total.steps, help.plan.total.dollars)}</p>
              <a className="btn ghost small" href={href({ name: "whatif" })}>{s.seeThatPath} <Icon name="arrow" size={16} /></a>
            </div>
          )}

          <div className="actions stack body-actions">
            <a className="btn primary" href={href({ name: "packet" })}><Icon name="print" size={18} /> {s.printPacket}</a>
            <a className="btn ghost" href={href({ name: "whatif" })}>{s.whatIfLink}</a>
            <a className="btn ghost" href={href({ name: "sources" })}>{s.howWeKnow}</a>
          </div>
          {result.explored !== undefined && <p className="fine">{s.foundBy(result.explored, ms)}</p>}
          <p className="fine">{s.pathFoot}</p>
        </div>
      </div>
    </section>
  );
}
