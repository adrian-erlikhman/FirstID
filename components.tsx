import type { ReactNode } from "react";
import type { Plan, RuleSet, Source, Step } from "./engine/types";
import { t, type Lang } from "./i18n";

// Small shared pieces. Every screen is built from these, so a style change
// here changes it everywhere.

const paths: Record<string, string> = {
  back: "M15 5l-7 7 7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
  doc: "M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h4",
  card: "M3 6h18v12H3z M3 10h18 M7 15h4",
  id: "M3 5h18v14H3z M7 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M6 16c.6-1.6 1.8-2.4 3-2.4s2.4.8 3 2.4 M14 9h4 M14 13h4",
  book: "M6 3h12v18H6z M9 3v18 M12 8h3",
  cap: "M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5",
  home: "M3 11l9-7 9 7 M5 10v10h14V10 M10 20v-6h4v6",
  hash: "M9 4L7 20 M17 4l-2 16 M4 9h16 M3 15h16",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  print: "M7 8V3h10v5 M5 8h14a2 2 0 0 1 2 2v6h-4 M7 16H3v-6a2 2 0 0 1 2-2 M7 13h10v8H7z",
  phone: "M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2C10 20 4 14 4 5a2 2 0 0 1 2-2z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  sparkle: "M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5L18 18 M6 18l2.5-2.5 M15.5 8.5L18 6",
};

export function Icon({ name, size = 22, stroke = 1.9 }: { name: keyof typeof paths | string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {(paths[name] ?? paths.doc).split(" M").map((d, i) => <path key={i} d={i ? "M" + d : d} />)}
    </svg>
  );
}

/** Which picture goes on each document tile on the first screen. */
export const docIcon: Record<string, string> = {
  birth_cert_ca: "doc", us_passport: "book", immigration_doc: "doc", dmv_record: "id", old_ca_id_5yr: "id",
  ssn_card: "card", medi_cal_card: "card", school_record: "cap", residency_doc: "home", ssn_known: "hash",
};

export function TopBar(props: { lang: Lang; onLang: () => void; label?: string; onBack?: () => void; home?: () => void }) {
  const s = t[props.lang];
  return (
    <header className="topbar no-print">
      {props.onBack ? (
        <button className="icon-btn" onClick={props.onBack} aria-label={s.back}><Icon name="back" size={24} stroke={2} /></button>
      ) : (
        <button className="wordmark" onClick={props.home}>{s.appName}</button>
      )}
      {props.label && <div className="kicker" aria-hidden="true">{props.label}</div>}
      <button className="pill-btn" onClick={props.onLang} aria-label={s.langToggleLabel} lang={props.lang === "en" ? "es" : "en"}>
        {s.langToggle}
      </button>
    </header>
  );
}

export const money = (d: number) => `$${d}`;

/** What the same steps would cost with no fee waivers. */
export const fullPrice = (p: Plan) => p.steps.reduce((sum, st) => sum + st.action.dollars, 0);
export const waiverCount = (p: Plan) => p.steps.filter((st) => st.waiver && st.dollars < st.action.dollars).length;

/** What to say at the counter: the waiver's line if one applies, else the step's own. */
export const sayFor = (st: Step) => st.waiver?.say ?? st.action.say;

/** The big total at the top of the path: the bill, with the full price struck through. */
export function Receipt({ plan, lang, compact }: { plan: Plan; lang: Lang; compact?: boolean }) {
  const s = t[lang];
  const full = fullPrice(plan);
  const n = waiverCount(plan);
  const { total } = plan;
  return (
    <div className={`receipt ${compact ? "compact" : ""}`}>
      <div className="receipt-top">
        <div className="total" aria-label={`${money(total.dollars)}`}>{money(total.dollars)}</div>
        {full > total.dollars && (
          <div className="receipt-was mono">
            <s>{s.insteadOf(full)}</s><br />{s.withWaivers(n)}
          </div>
        )}
      </div>
      <dl className="receipt-grid">
        <div><dt>{s.unitSteps(total.steps)}</dt><dd>{total.steps}</dd></div>
        <div><dt>{s.unitTrips(total.trips)}</dt><dd>{total.trips}</dd></div>
        <div><dt>{s.untilCard}</dt><dd>{s.timeShort(total.days)}</dd></div>
      </dl>
    </div>
  );
}

export function CallAhead({ lang, long }: { lang: Lang; long?: boolean }) {
  const s = t[lang];
  return long
    ? <div className="callout amber" role="note"><strong>{s.callAhead}:</strong> {s.callAheadLong.replace(/^./, (c) => c.toLowerCase())}</div>
    : <span className="chip amber">{s.callAhead}</span>;
}

export function SourceCard({ src, lang }: { src: Source; lang: Lang }) {
  const s = t[lang];
  const missing = /^TODO/i.test(src.quote);
  return (
    <a className="source" href={src.url} target="_blank" rel="noreferrer">
      <span className="source-title">{src.title}</span>
      {missing
        ? <span className="source-quote missing">{s.quoteMissing}</span>
        : <span className="source-quote">“{src.quote}”</span>}
      <span className="source-meta mono">
        <span>{s.checkedOn(src.checked)}</span>
        <span className="source-open">{s.openSource} <Icon name="external" size={14} stroke={2} /></span>
      </span>
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
