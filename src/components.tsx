import type { ReactNode } from "react";
import type { Plan, RuleSet, Source, Step } from "./engine/types";
import { t, type Lang } from "./i18n";

// Small shared pieces. Every screen is built from these, so a style change
// here changes it everywhere.

const paths: Record<string, string> = {
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  print: "M7 8V3h10v5 M5 8h14a2 2 0 0 1 2 2v6h-4 M7 16H3v-6a2 2 0 0 1 2-2 M7 13h10v8H7z",
  phone: "M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2C10 20 4 14 4 5a2 2 0 0 1 2-2z",
  cap: "M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  alert: "M12 3l10 18H2z M12 10v5 M12 18v.5",
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
  info: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 11v6 M12 7.5v.5",
  route: "M6 21a2.5 2.5 0 1 0 0-5a2.5 2.5 0 1 0 0 5 M18 8a2.5 2.5 0 1 0 0-5a2.5 2.5 0 1 0 0 5 M8.5 18.5H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.5",
  tag: "M3 12.5V4h8.5L21 13.5 13.5 21z M7.5 8.5h.01",
  law: "M12 3v17 M6 21h12 M4 7h16 M7 7l-3 6.5a3 3 0 0 0 6 0z M17 7l-3 6.5a3 3 0 0 0 6 0z",
  lock: "M6 11h12v10H6z M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
};

export function Icon({ name, size = 20, stroke = 2 }: { name: string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="icon">
      {(paths[name] ?? paths.info).split(" M").map((d, i) => <path key={i} d={i ? "M" + d : d} />)}
    </svg>
  );
}

/** The First ID mark: an ID card with a photo and two lines. */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" className="mark">
      <rect x="1" y="5" width="30" height="22" rx="5" fill="var(--accent)" />
      <circle cx="10.5" cy="14" r="3.6" fill="var(--accent-ink)" />
      <path d="M5.8 22.5c.9-2.6 2.6-3.9 4.7-3.9s3.8 1.3 4.7 3.9" fill="var(--accent-ink)" />
      <rect x="18" y="11.5" width="9" height="2.6" rx="1.3" fill="var(--mark)" />
      <rect x="18" y="17" width="6.5" height="2.6" rx="1.3" fill="var(--accent-ink)" opacity=".7" />
    </svg>
  );
}

export function TopBar(props: {
  lang: Lang; onLang: () => void; onHome: () => void;
  onBack?: () => void; label?: string; progress?: [number, number];
}) {
  const s = t[props.lang];
  return (
    <header className="top no-print">
      <div className="brandbar">
        <button className="brand" onClick={props.onHome} aria-label={`${s.appName}, ${s.startOver.toLowerCase()}`}>
          <Mark /> <span>{s.appName}</span>
        </button>
        <button className="lang-btn" onClick={props.onLang} aria-label={s.langToggleLabel} lang={props.lang === "en" ? "es" : "en"}>
          <Icon name="globe" size={18} /> {s.langToggle}
        </button>
      </div>
      {(props.onBack || props.label) && (
        <div className="subbar">
          {props.onBack && (
            <button className="back-btn" onClick={props.onBack}><Icon name="back" size={18} stroke={2.4} /> {s.back}</button>
          )}
          {props.label && <span className="crumb">{props.label}</span>}
        </div>
      )}
      {props.progress && (
        <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={props.progress[1]} aria-valuenow={props.progress[0]} aria-label={props.label}>
          {Array.from({ length: props.progress[1] }, (_, i) => <span key={i} className={i < props.progress![0] ? "on" : ""} />)}
        </div>
      )}
    </header>
  );
}

export const money = (d: number) => `$${d}`;

/** What the same steps would cost with no fee waivers. */
export const fullPrice = (p: Plan) => p.steps.reduce((sum, st) => sum + st.action.dollars, 0);
export const waiverCount = (p: Plan) => p.steps.filter((st) => st.waiver && st.dollars < st.action.dollars).length;

/** What to say at the counter: the waiver's line if one applies, else the step's own. */
export const sayFor = (st: Step) => st.waiver?.say ?? st.action.say;

/** The summary at the top of a path: total cost first, then steps, trips and time. */
export function Summary({ plan, lang, label }: { plan: Plan; lang: Lang; label?: string }) {
  const s = t[lang];
  const full = fullPrice(plan);
  const n = waiverCount(plan);
  const { total } = plan;
  return (
    <div className="summary">
      <div className="summary-head">
        <span className="summary-label">{label ?? s.totalCost}</span>
        <span className="total">{money(total.dollars)}</span>
        {full > total.dollars && <span className="saved">{s.insteadOf(full)} · {s.withWaivers(n)}</span>}
      </div>
      <dl className="stats3">
        <div><dt>{s.unitSteps(total.steps)}</dt><dd>{total.steps}</dd></div>
        <div><dt>{s.unitTrips(total.trips)}</dt><dd>{total.trips}</dd></div>
        <div><dt>{s.untilCard}</dt><dd>{s.timeShort(total.days)}</dd></div>
      </dl>
    </div>
  );
}

/** One "not confirmed" line, used on steps and in lists. */
export function Unconfirmed({ lang }: { lang: Lang }) {
  const s = t[lang];
  return <span className="unconfirmed" title={s.notConfirmed}><Icon name="alert" size={15} stroke={2.2} /> {s.callAhead}</span>;
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "warn" | "accent"; title?: string; children: ReactNode }) {
  return (
    <div className={`notice ${tone}`} role="note">
      {title && <strong className="notice-title">{title}</strong>}
      <div>{children}</div>
    </div>
  );
}

/** Joined buttons for picking one answer. Uses aria-pressed so screen readers announce the choice. */
export function Segmented<V>(props: { label: string; options: readonly (readonly [V, string])[]; value: V | null; onChange: (v: V) => void; wrap?: boolean }) {
  return (
    <div className={`segmented ${props.wrap ? "wrap" : ""}`} role="group" aria-label={props.label}>
      {props.options.map(([v, text]) => (
        <button key={text} aria-pressed={props.value === v} onClick={() => props.onChange(v)}>{text}</button>
      ))}
    </div>
  );
}

/** One official source. Until a person verifies the rule, it never claims a "checked" date. */
export function SourceCard({ src, lang, verified }: { src: Source; lang: Lang; verified: boolean }) {
  const s = t[lang];
  const missing = /^TODO/i.test(src.quote);
  return (
    <a className="source" href={src.url} target="_blank" rel="noreferrer">
      <span className="source-title">{src.title} <Icon name="external" size={14} /></span>
      {missing
        ? <span className="source-quote missing">{s.quoteMissing}</span>
        : <span className="source-quote">“{src.quote}”</span>}
      <span className="source-meta">{verified ? s.checkedOn(src.checked) : s.notCheckedYet}</span>
    </a>
  );
}

export function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`block ${className ?? ""}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export const placeOf = (rules: RuleSet, st: Step) => rules.places[st.action.place];

/** The problem in one picture: an ID needs a birth certificate, which needs an ID. */
export function Loop({ lang }: { lang: Lang }) {
  const s = t[lang];
  return (
    <svg className="loop" viewBox="0 0 360 222" role="img" aria-label={`${s.loopId} ${s.loopNeeds} ${s.loopBc}; ${s.loopBc} ${s.loopNeeds} ${s.loopId}. ${s.loopOut}.`}>
      <defs>
        <marker id="loop-warn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--warn-line)" /></marker>
        <marker id="loop-go" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)" /></marker>
      </defs>
      <g fill="none" strokeWidth="2.5" strokeLinecap="round">
        <path d="M134 44 C 164 18, 196 18, 226 44" stroke="var(--warn-line)" markerEnd="url(#loop-warn)" />
        <path d="M226 82 C 196 108, 164 108, 134 82" stroke="var(--warn-line)" markerEnd="url(#loop-warn)" />
        <path d="M180 108 V 152" stroke="var(--accent)" markerEnd="url(#loop-go)" />
      </g>
      <text x="180" y="15" textAnchor="middle" className="loop-label">{s.loopNeeds}</text>
      <text x="166" y="126" textAnchor="end" className="loop-label">{s.loopNeeds}</text>
      <rect x="4" y="40" width="140" height="46" rx="23" className="loop-node" />
      <text x="74" y="68" textAnchor="middle" className="loop-text">{s.loopId}</text>
      <rect x="216" y="40" width="140" height="46" rx="23" className="loop-node" />
      <text x="286" y="68" textAnchor="middle" className="loop-text">{s.loopBc}</text>
      <rect x="30" y="162" width="300" height="50" rx="12" className="loop-out" />
      <text x="180" y="192" textAnchor="middle" className="loop-out-text">{s.loopOut}</text>
    </svg>
  );
}
