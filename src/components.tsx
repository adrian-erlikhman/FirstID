import { useEffect, useState, type ReactNode } from "react";
import type { Plan, RuleSet, Source, Step } from "./engine/types";
import { t, type Lang } from "./i18n";

// Small shared pieces. Every screen is built from these, so a style change
// here changes it everywhere. The look follows Monte's brand (our TrojanHacks
// app): ink on white, one blue accent for a computed answer, brackets around
// numbers the planner worked out, mono labels, and the odd hand-written note.

const paths: Record<string, string> = {
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  print: "M7 8V3h10v5 M5 8h14a2 2 0 0 1 2 2v6h-4 M7 16H3v-6a2 2 0 0 1 2-2 M7 13h10v8H7z",
  phone: "M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2C10 20 4 14 4 5a2 2 0 0 1 2-2z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  alert: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7.5v5.5 M12 16.5v.5",
};

export function Icon({ name, size = 18, stroke = 1.8 }: { name: string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="icon">
      {(paths[name] ?? paths.alert).split(" M").map((d, i) => <path key={i} d={i ? "M" + d : d} />)}
    </svg>
  );
}

/** The mark: an ID card drawn the way Monte draws its 𝔼. The card is a hollow
 *  outline in the accent; the photo and the two lines on it are solid ink. */
export function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 70" height={size} width={size * 100 / 70} aria-hidden="true" focusable="false" className="mark">
      <rect x="4" y="4" width="92" height="62" rx="10" fill="none" stroke="var(--accent)" strokeWidth="8" />
      <rect x="18" y="19" width="24" height="32" fill="var(--ink)" />
      <rect x="52" y="22" width="32" height="9" fill="var(--ink)" />
      <rect x="52" y="40" width="22" height="9" fill="var(--ink)" />
    </svg>
  );
}

/** [first id]. The lockup is always the mark, then the name in brackets. */
export function Lockup({ resolved = false }: { resolved?: boolean }) {
  return (
    <span className="lockup">
      <Mark />
      <span className="lockup-word" aria-hidden="true">
        <span className="br">[</span>first id<span className={`br${resolved ? " on" : ""}`}>]</span>
      </span>
    </span>
  );
}

/** A number the planner computed, in brackets. The closing bracket turns blue
 *  once it is final; while the planner runs, the brackets show [···]. */
export function Br({ children, busy = false, className = "" }: { children: ReactNode; busy?: boolean; className?: string }) {
  return (
    <span className={`bracketed ${className}`}>
      <span className="br on" aria-hidden="true">[</span>
      {busy
        ? <span className="sampler" role="status" aria-label="…"><i>·</i><i>·</i><i>·</i></span>
        : <span className="num">{children}</span>}
      <span className="br on" aria-hidden="true">]</span>
    </span>
  );
}

/** Shows [···] for a moment whenever `key` changes, so a person sees the
 *  planner run again. The answer itself is instant. */
export function useRecompute(key: string, ms = 320) {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setBusy(true);
    const id = setTimeout(() => setBusy(false), ms);
    return () => clearTimeout(id);
  }, [key, ms]);
  return busy;
}

/** A margin note in Shantell Sans with a pencil arrow, like Monte's. It only
 *  repeats something the page already says, so screen readers skip it. */
export function HandNote({ children, dir = "left", className = "" }: { children: ReactNode; dir?: "left" | "up" | "down"; className?: string }) {
  const arrow = dir === "up"
    ? <path d="M30 34C22 30 14 22 12 6 M6 13l6-8 6 7" />
    : dir === "down"
      ? <path d="M30 2C22 6 14 14 12 30 M6 23l6 8 6-7" />
      : <path d="M46 17c-9-7-22 8-40 2 M12 13L5 19l8 4" />;
  return (
    <span className={`hand-note dir-${dir} ${className}`} aria-hidden="true">
      <svg viewBox={dir === "left" ? "0 0 48 36" : "0 0 36 36"} className="hand-arrow">{arrow}</svg>
      <span className="hand-text">{children}</span>
    </span>
  );
}

/** A screen opens like a solver printout: a ruled line with the section's
 *  number and name on the left and a live readout on the right. */
export function Printout({ index, kicker, readout }: { index: string; kicker: string; readout?: ReactNode }) {
  return (
    <div className="printout">
      <span><b>§{index}</b> · {kicker}</span>
      {readout !== undefined && <span className="readout">{readout}</span>}
    </div>
  );
}

/** A white panel with a terminal-style header: what ran, and what it found. */
export function Solver({ command, readout, children, className = "" }: { command: string; readout?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`panel solver ${className}`}>
      <div className="solver-head">
        <span className="solver-cmd" aria-hidden="true"><span className="prompt">$</span> {command}</span>
        {readout !== undefined && <span className="solver-readout">{readout}</span>}
      </div>
      {children}
    </div>
  );
}

export function TopBar(props: { lang: Lang; onLang: (l: Lang) => void; onHome: () => void; onBack?: () => void }) {
  const s = t[props.lang];
  return (
    <header className="top no-print">
      <div className="top-inner">
        {props.onBack && (
          <button className="back-btn" onClick={props.onBack} aria-label={s.back}><Icon name="back" size={18} stroke={2} /></button>
        )}
        <button className="brand" onClick={props.onHome} aria-label={`${s.appName}, ${s.homeLabel}`}>
          <Lockup />
        </button>
        <div className="lang" role="radiogroup" aria-label={s.langLabel}>
          {(["en", "es"] as const).map((l) => (
            <button key={l} role="radio" aria-checked={props.lang === l} lang={l} aria-label={l === "en" ? "English" : "Español"}
              onClick={() => props.onLang(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>
    </header>
  );
}

export const money = (d: number) => `$${d}`;

/** What the same steps would cost with no fee waivers. */
export const fullPrice = (p: Plan) => p.steps.reduce((sum, st) => sum + st.action.dollars, 0);
export const waiverCount = (p: Plan) => p.steps.filter((st) => st.waiver && st.dollars < st.action.dollars).length;

/** What to say at the counter: the waiver's line if one applies, else the step's own. */
export const sayFor = (st: Step) => st.waiver?.say ?? st.action.say;

/** The four numbers of a path in a ruled grid, the way Monte shows a solve. */
export function StatGrid({ plan, lang, busy = false }: { plan: Plan; lang: Lang; busy?: boolean }) {
  const s = t[lang];
  const { total } = plan;
  return (
    <dl className="stat-grid">
      <div><dt>{s.totalCost}</dt><dd><Br busy={busy}>{money(total.dollars)}</Br></dd></div>
      <div><dt>{s.unitSteps(total.steps)}</dt><dd>{total.steps}</dd></div>
      <div><dt>{s.unitTrips(total.trips)}</dt><dd>{total.trips}</dd></div>
      <div><dt>{s.untilCard}</dt><dd>{s.timeShort(total.days)}</dd></div>
    </dl>
  );
}

/** "instead of $41 · with 2 fee waivers", or nothing when nothing was waived. */
export function Waived({ plan, lang }: { plan: Plan; lang: Lang }) {
  const s = t[lang];
  const full = fullPrice(plan);
  if (full <= plan.total.dollars) return null;
  return <p className="waived">{s.insteadOf(full)} · {s.withWaivers(waiverCount(plan))}</p>;
}

/** The planner's sum, written out: $0 + $15 + $0 = [$15]. */
export function Formula({ plan }: { plan: Plan }) {
  if (plan.steps.length < 2) return null;
  return (
    <p className="formula" aria-hidden="true">
      {plan.steps.map((st) => money(st.dollars)).join(" + ")} = <Br>{money(plan.total.dollars)}</Br>
    </p>
  );
}

/** One "not confirmed" tag. Dashed, because the rule is still a draft. */
export function Unconfirmed({ lang }: { lang: Lang }) {
  const s = t[lang];
  return <span className="tag draft" title={s.notConfirmed}>{s.callAhead}</span>;
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "draft" | "accent"; title?: string; children: ReactNode }) {
  return (
    <div className={`notice ${tone}`} role="note">
      {title && <span className="label notice-title">{title}</span>}
      <div className="notice-body">{children}</div>
    </div>
  );
}

/** Pick one answer. Pills, like Monte's tabs, with aria-pressed so screen
 *  readers announce the choice. `numbered` adds 01, 02… in mono. */
export function Pills<V>(props: { label: string; options: readonly (readonly [V, string])[]; value: V | null; onChange: (v: V) => void; numbered?: boolean; className?: string }) {
  return (
    <div className={`pills ${props.className ?? ""}`} role="group" aria-label={props.label}>
      {props.options.map(([v, text], i) => (
        <button key={text} className="pill" aria-pressed={props.value === v} onClick={() => props.onChange(v)}>
          {props.numbered && <span className="pill-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>}
          {text}
        </button>
      ))}
    </div>
  );
}

/** One official source. Until a person verifies the rule, it never claims a "checked" date. */
export function SourceCard({ src, lang, verified }: { src: Source; lang: Lang; verified: boolean }) {
  const s = t[lang];
  const missing = /^TODO/i.test(src.quote);
  let host = "";
  try { host = new URL(src.url).hostname.replace(/^www\./, ""); } catch { /* not a URL */ }
  return (
    <a className="source" href={src.url} target="_blank" rel="noreferrer">
      <span className="source-host">{host} <Icon name="external" size={13} /></span>
      <span className="source-title">{src.title}</span>
      {missing
        ? <span className="source-quote missing">{s.quoteMissing}</span>
        : <span className="source-quote">“{src.quote}”</span>}
      <span className={`source-meta ${verified ? "" : "draft"}`}>{verified ? s.checkedOn(src.checked) : s.notCheckedYet}</span>
    </a>
  );
}

export function Block({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <section className={`block ${className ?? ""}`}>
      <h2 className="label block-label">{label}</h2>
      {children}
    </section>
  );
}

export const placeOf = (rules: RuleSet, st: Step) => rules.places[st.action.place];

/** The problem in one picture: an ID needs a birth certificate, which needs an ID. */
export function Loop({ lang }: { lang: Lang }) {
  const s = t[lang];
  return (
    <svg className="loop" viewBox="0 0 360 236" role="img" aria-label={`${s.loopId} ${s.loopNeeds} ${s.loopBc}; ${s.loopBc} ${s.loopNeeds} ${s.loopId}. ${s.loopOut}.`}>
      <defs>
        <marker id="loop-ink" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></marker>
        <marker id="loop-go" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></marker>
      </defs>
      <g fill="none" strokeWidth="1.6" strokeLinecap="round">
        <path className="loop-arc" d="M128 46 C 160 14, 200 14, 232 46" stroke="var(--ink)" markerEnd="url(#loop-ink)" />
        <path className="loop-arc" d="M232 90 C 200 122, 160 122, 128 90" stroke="var(--ink)" markerEnd="url(#loop-ink)" />
        <path d="M180 124 V 162" stroke="var(--accent)" strokeWidth="1.8" markerEnd="url(#loop-go)" />
      </g>
      <text x="180" y="16" textAnchor="middle" className="loop-label">{s.loopNeeds}</text>
      <text x="166" y="140" textAnchor="end" className="loop-label">{s.loopNeeds}</text>
      <rect x="4" y="46" width="140" height="44" rx="22" className="loop-node" />
      <text x="74" y="73" textAnchor="middle" className="loop-text">{s.loopId}</text>
      <rect x="216" y="46" width="140" height="44" rx="22" className="loop-node" />
      <text x="286" y="73" textAnchor="middle" className="loop-text">{s.loopBc}</text>
      <rect x="40" y="172" width="280" height="56" rx="28" className="loop-out" />
      <text x="180" y="205" textAnchor="middle" className="loop-out-text">{s.loopOut}</text>
    </svg>
  );
}
