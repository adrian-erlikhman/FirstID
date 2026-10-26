import { Br, Collapse, Icon, LiveNote, Notice, PathCard, Pills, Solver, Swap, Tween, Unconfirmed, WasPrice, fullPrice, money, placeOf } from "../components";
import { useListPresence } from "../motion";
import type { Facts, Mode, Person, Plan, RuleSet, Step } from "../engine/types";
import { t, type Lang } from "../i18n";
import { href } from "../router";
import { flipsThatMatter, helpOptions, noPathNotes, type NoPathNote } from "../whatif";
import { useEffect, useMemo, useState } from "react";
import { under18 } from "../person";
import { loadTicks, reminderFor, reminderIcs, saveTicks, ticksInPlan, toggleTick, type Ticks } from "../progress";

// The hero screen: the total first, in brackets because the
// planner computed it, then the steps in a solver panel. Each step is one
// tappable row that opens its detail screen with the proof.

export function whenLine(rules: RuleSet, steps: Step[], i: number, lang: Lang): string {
  const s = t[lang];
  const st = steps[i];
  const place = placeOf(rules, st);
  const start = st.startDay === 0 ? s.startsToday : s.startsAround(st.startDay);
  if (!place.inPerson) return `${start}, ${s.byMail}, ${s.readyIn(st.action.days)}`;
  const visit = !st.newTrip && i > 0 ? s.sameVisit(i) : s.oneVisit;
  return st.action.days === 0 ? `${start}, ${visit}` : `${start}, ${visit}, ${s.readyIn(st.action.days)}`;
}

/** A download link for a step's calendar reminder. The .ics file is a Blob made
 *  here in the browser; nothing is fetched or sent. */
function ReminderLink({ rules, lang, step, n }: { rules: RuleSet; lang: Lang; step: Step; n: number }) {
  const s = t[lang];
  // Made and revoked in one effect, so a remount never leaves a dead link.
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const r = reminderFor(rules, step, n, lang);
    let u: string | null = null;
    try { if (r) u = URL.createObjectURL(new Blob([reminderIcs(r)], { type: "text/calendar;charset=utf-8" })); } catch { u = null; }
    setUrl(u);
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [rules, step, n, lang]);
  if (!url) return null;
  return (
    <a className="remind-link" href={url} download={`first-id-step-${n}-reminder.ics`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="icon">
        <rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16 M9 3v4 M15 3v4" />
      </svg>
      {s.addReminder}<span className="sr-only">{s.forStep(n)}</span>
    </a>
  );
}

export function StepList({ rules, lang, plan, done, onDone }: {
  rules: RuleSet; lang: Lang; plan: Plan; done?: Set<string>; onDone?: (id: string, on: boolean) => void;
}) {
  const s = t[lang];
  // When the path changes (a new mode), steps that drop out slide shut where
  // they were and new ones slide open, keeping the wording they had.
  const rows = useListPresence(plan.steps.map((st, i) => ({ st, i, when: whenLine(rules, plan.steps, i, lang) })), (x) => x.st.action.id);
  return (
    <ol className="steps">
      {rows.map(({ item: { st, i, when }, key, phase }) => {
        const a = st.action;
        const was = st.dollars < a.dollars ? a.dollars : null;
        const isDone = done?.has(a.id) ?? false;
        return (
          <li key={key} className={`slide-row ${phase}${isDone ? " step-done" : ""}`} aria-hidden={phase === "leave" || undefined}>
            <div className="slide-clip"><div className="slide-body">
            <a className="step-row" href={href({ name: "step", n: i + 1 })} tabIndex={phase === "leave" ? -1 : undefined}>
              <Swap className="row-num" text={String(i + 1)} />
              <span className="step-main">
                <span className="label step-place">{placeOf(rules, st).label[lang]}</span>
                <span className="step-title">{a.label[lang]}</span>
                {was !== null && <span className="step-waiver">{st.waiver!.label[lang]}</span>}
                <span className="step-when">{when}</span>
                {!a.verified && <Unconfirmed lang={lang} />}
              </span>
              <span className="step-cost">
                <Swap className={`num${st.dollars === 0 ? " free" : ""}`} text={st.dollars === 0 ? s.free : money(st.dollars)} />
                {was !== null && <WasPrice dollars={was} lang={lang} />}
              </span>
              <Icon name="chevron" size={16} />
            </a>
            {onDone && (
              <div className="step-track">
                <label className="tick">
                  <input type="checkbox" checked={isDone} onChange={(e) => onDone(a.id, e.target.checked)} aria-label={s.markDone(i + 1)} />
                  <span className="tick-box" aria-hidden="true"><Icon name="check" size={16} stroke={2.4} /></span>
                  <span className="tick-text" aria-hidden="true">{s.doneShort}</span>
                </label>
                <ReminderLink rules={rules} lang={lang} step={st} n={i + 1} />
              </div>
            )}
            </div></div>
          </li>
        );
      })}
    </ol>
  );
}

export function NoPath({ rules, lang, person, onBack }: { rules: RuleSet; lang: Lang; person: Person; onBack: () => void }) {
  const s = t[lang];
  const text: Record<NoPathNote, string> = {
    bornCA: s.noPathBornCA, bornElsewhere: s.noPathBornElsewhere,
    allUnsure: s.noPathAllUnsure, needAddress: s.noPathNeedAddress, needWitnesses: s.noPathNeedWitnesses, needSsn: s.noPathNeedSsn,
  };
  const notes = noPathNotes(rules, person);
  // Only offer "what if" when changing one answer would open a path; otherwise it leads to a dead end too.
  const canOpen = flipsThatMatter(rules, person, "cheapest").length > 0;
  return (
    <section className="screen">
      <div className="split">
        <div className="head">
          <h1 tabIndex={-1} className="display">{s.noPathTitle}</h1>
          <p className="lede">{s.noPathBody}</p>
        </div>
        <div className="body">
          {notes.map((n) => <Notice key={n}>{text[n]}</Notice>)}
          {under18(person.facts) && <Notice title={s.notYetTitle}>{s.notYetUnder18}</Notice>}
          {canOpen && (
            <div className="actions row">
              <a className="btn primary" href={href({ name: "whatif" })}>{s.tryWhatIf} <Icon name="arrow" size={18} /></a>
            </div>
          )}
          <h2 className="label block-label">{s.noPathWho}</h2>
          <ul className="panel link-list">
            <li><a className="link-row" href="tel:211"><span className="link-main"><strong>{s.help211}</strong><span className="row-sub">{s.help211Line}</span></span><Icon name="phone" size={18} /></a></li>
            {helpOptions(person).includes("lausd") && <li><a className="link-row" href="tel:+12132413552"><span className="link-main"><strong>{s.helpLausd}</strong><span className="row-sub">{s.helpLausdLine}</span></span><Icon name="phone" size={18} /></a></li>}
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
  const { rules, lang, result, mode, onMode, help, ms } = props;
  const s = t[lang];
  // Ticks are kept by step id on this phone only; steps no longer in the plan
  // keep their stored tick but are not shown or counted.
  const [ticks, setTicks] = useState<Ticks>(() => loadTicks());
  const setTick = (id: string, on: boolean) => setTicks((prev) => { const next = toggleTick(prev, id, on); saveTicks(next); return next; });
  // The link goes away once there is nothing to clear, so hand focus to the heading.
  const clearTicks = () => { setTicks({}); saveTicks({}); document.querySelector<HTMLElement>("main h1")?.focus(); };
  const done = useMemo(() => ticksInPlan(ticks, result ? result.steps.map((st) => st.action.id) : []), [ticks, result]);
  if (!result) return <NoPath rules={rules} lang={lang} person={props.person} onBack={props.onChangeAnswers} />;

  const unverified = result.steps.filter((st) => !st.action.verified).length;
  return (
    <section className="screen">
      <div className="split path-split">
        <div className="head">
          <h1 tabIndex={-1} className="display">
            {s.pathHeadPre} <Br><Tween value={result.total.dollars} format={money} /></Br>{s.pathHeadPost}
          </h1>
          <p className="progress-line">
            <span className="progress-count" aria-live="polite">{s.progressDone(done.size, result.steps.length)}</span>
            <span className="progress-note">{s.progressNote}</span>
            {done.size > 0 && <button type="button" className="progress-clear" onClick={clearTicks}>{s.clearProgress}</button>}
          </p>
          <div className="actions stack head-actions">
            <a className="btn primary" href={href({ name: "packet" })}><Icon name="print" size={18} /> {s.printPacket}</a>
            <a className="btn ghost" href={href({ name: "whatif" })}>{s.whatIfLink}</a>
            <a className="btn ghost" href={href({ name: "sources" })}>{s.howWeKnow}</a>
          </div>
        </div>

        <div className="body">
          <PathCard plan={result} lang={lang} mode={mode} className="path-card" />
          <Solver title={s.cardLabel} readout={result.explored !== undefined ? s.solvedIn(result.explored, ms) : undefined}>
            <div className="solver-tabs">
              <Pills label={s.modesLabel} value={mode} onChange={onMode}
                options={[["cheapest", s.modeCheapest], ["fewestTrips", s.modeTrips], ["fastest", s.modeFastest]] as const} />
              <p className="mode-hint"><Swap text={s.modeHint[mode]} /></p>
              <LiveNote text={`${{ cheapest: s.modeCheapest, fewestTrips: s.modeTrips, fastest: s.modeFastest }[mode]}. ${s.cardSummary({ total: result.total.dollars, full: fullPrice(result), steps: result.total.steps, trips: result.total.trips, days: result.total.days })}`} />
            </div>
            <StepList rules={rules} lang={lang} plan={result} done={done} onDone={setTick} />
          </Solver>

          {unverified > 0
            ? <Notice tone="draft" title={s.callAhead}>{s.unverifiedNote(unverified, result.steps.length)}</Notice>
            : <Notice tone="accent">{s.allVerified}</Notice>}
          {under18(props.person.facts) && <Notice title={s.notYetTitle}>{s.notYetUnder18}</Notice>}

          <Collapse show={!!help}>{help && (
            <div className="panel help">
              <span className="label">{s.helpsTitle}</span>
              <strong className="help-doc">{rules.docs[help.doc].label[lang]}</strong>
              <p>{s.helpsResult(help.plan.total.steps, help.plan.total.dollars)}</p>
              <a className="btn ghost" href={href({ name: "whatif" })}>{s.seeThatPath} <Icon name="arrow" size={16} /></a>
            </div>
          )}</Collapse>

          <div className="actions stack body-actions">
            <a className="btn primary" href={href({ name: "packet" })}><Icon name="print" size={18} /> {s.printPacket}</a>
            <a className="btn ghost" href={href({ name: "whatif" })}>{s.whatIfLink}</a>
            <a className="btn ghost" href={href({ name: "sources" })}>{s.howWeKnow}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
