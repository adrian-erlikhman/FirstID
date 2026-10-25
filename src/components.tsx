import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useTilt } from "./motion";
import type { Mode, Plan, RuleSet, Source, Step } from "./engine/types";
import { t, type Lang } from "./i18n";
import applicationImg from "./forms/birth-record-application.jpg";
import certificateImg from "./forms/certificate-of-identity.jpg";
import applicationStrip from "./forms/strip-application.jpg";
import certificateStrip from "./forms/strip-certificate.jpg";

// Small shared pieces. Every screen is built from these, so a style change
// here changes it everywhere. The look is First ID's own: black on white,
// Instrument Sans, and one recurring object, an ID card set down at a slight
// angle. The card is the logo, and the path you get is shown as one.

const paths: Record<string, string> = {
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  print: "M7 8V3h10v5 M5 8h14a2 2 0 0 1 2 2v6h-4 M7 16H3v-6a2 2 0 0 1 2-2 M7 13h10v8H7z",
  phone: "M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2C10 20 4 14 4 5a2 2 0 0 1 2-2z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  alert: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7.5v5.5 M12 16.5v.5",
  flip: "M4 12a8 8 0 0 1 14-5.3 M18.5 3v4h-4 M20 12a8 8 0 0 1-14 5.3 M5.5 21v-4h4",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
};

export function Icon({ name, size = 18, stroke = 1.8 }: { name: string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="icon">
      {(paths[name] ?? paths.alert).split(" M").map((d, i) => <path key={i} d={i ? "M" + d : d} />)}
    </svg>
  );
}

// The card, on a 64-unit grid: ID-1 proportions (46 x 29), a portrait with a
// head and shoulders, two name lines and a number line. Same geometry as the
// favicon and the app icon in public/.
const BUST = "M13.5 42 V 37.93 H 14 C 14 35.13 17.3 34.33 20.5 34.33 C 23.7 34.33 27 35.13 27 37.93 H 27.5 V 42 Z";

/** The mark: the card, set down at a slight angle. It is cut out of
 *  currentColor with a mask, so it sits on any background. */
export function Mark({ size = 22, tilt = -10, className = "" }: { size?: number; tilt?: number; className?: string }) {
  const id = "m" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="6 13 52 38" height={size} width={(size * 52) / 38} aria-hidden="true" focusable="false" className={`mark ${className}`}>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
        <g transform={`rotate(${tilt} 32 32)`}>
          <rect x="9" y="17.5" width="46" height="29" rx="2.5" fill="#fff" />
          <rect x="14" y="22.5" width="13" height="19" fill="#000" />
          <circle cx="20.5" cy="29.53" r="3.3" fill="#fff" />
          <path d={BUST} fill="#fff" />
          <rect x="31" y="23.1" width="19" height="2.8" fill="#000" />
          <rect x="31" y="28.3" width="12" height="2.8" fill="#000" />
          <rect x="31" y="38.7" width="14" height="2.8" fill="#000" />
        </g>
      </mask>
      <rect width="64" height="64" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}

/** The portrait window from the card, at any size: a head and shoulders in a
 *  photo frame. Colours come from --pw (frame) and --pb (person). */
export function Portrait({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="14 22.5 13 19" className={`portrait ${className}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect x="14" y="22.5" width="13" height="19" fill="var(--pw)" />
      <circle cx="20.5" cy="29.53" r="3.3" fill="var(--pb)" />
      <path d={BUST} fill="var(--pb)" />
    </svg>
  );
}

// A head and shoulders on an 80 x 100 photo, drawn as one outline: crown,
// jaw, neck, then the slope of the shoulders out to the edges of the frame.
const SILHOUETTE =
  "M40 21C48.5 21 54.5 28 54.5 38.5C54.5 46 51.5 51.5 47.5 54.5L47.5 60C47.5 62 49 63.2 51.5 64C64 67.5 73 74 75 86L76 100L4 100L5 86C7 74 16 67.5 28.5 64C31 63.2 32.5 62 32.5 60L32.5 54.5C28.5 51.5 25.5 46 25.5 38.5C25.5 28 31.5 21 40 21Z";

/** The photo on the ID card: a studio-lit backdrop in the card's yellow and a
 *  person's silhouette with a little light on the head and shoulders. Colours
 *  come from --pw (backdrop) and --pb (person). */
export function IdPortrait({ className = "" }: { className?: string }) {
  const id = "p" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 80 100" className={`portrait id-portrait ${className}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`${id}b`} cx="50%" cy="34%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity=".38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2=".35" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="80" height="100" fill="var(--pw)" />
      <rect width="80" height="100" fill={`url(#${id}b)`} />
      <path d={SILHOUETTE} fill="var(--pb)" />
      <path d={SILHOUETTE} fill={`url(#${id}s)`} />
    </svg>
  );
}

/** The mark, then the name. */
export function Lockup() {
  return (
    <span className="lockup">
      <Mark />
      <span className="lockup-word">First ID</span>
    </span>
  );
}

/** A number the planner computed. While it re-plans, it shows three dots. */
export function Br({ children, busy = false, className = "" }: { children: ReactNode; busy?: boolean; className?: string }) {
  return (
    <span className={`bracketed ${className}`}>
      {busy
        ? <span className="sampler" role="status" aria-label="…"><i>·</i><i>·</i><i>·</i></span>
        : <span className="num">{children}</span>}
    </span>
  );
}

// The fine-line security print behind the card, on an 856 x 540 grid (ID-1 at
// ten units a millimetre): a field of gentle waves, and a guilloche rosette
// of interlaced loops on the right. Built once, as two path strings.
const GUILLOCHE = (() => {
  const f = (n: number) => n.toFixed(1);
  let waves = "";
  for (let i = 0; i < 20; i++) {
    const y = 14 + i * 27, a = 5 + (i % 3), half = 34;
    waves += `M${-half} ${f(y)}Q${f(-half / 2)} ${f(y - a * 2 * (i % 2 ? 1 : -1))} 0 ${f(y)}`;
    for (let x = half; x <= 856 + half; x += half) waves += `T${x} ${f(y)}`;
  }
  let rosette = "";
  const cx = 650, cy = 250, loops = 12, steps = 288;
  for (let j = 0; j < loops; j++) {
    const phase = (j / loops) * Math.PI * 2;
    for (let k = 0; k <= steps; k++) {
      const t = (k / steps) * Math.PI * 2;
      const r = 150 + 38 * Math.sin(9 * t + phase) + 12 * Math.sin(27 * t - phase);
      rosette += `${k ? "L" : "M"}${f(cx + r * Math.cos(t))} ${f(cy + r * Math.sin(t))}`;
    }
  }
  return { waves, rosette };
})();

/** Security print for a card face. Decoration only: hidden from screen readers. */
function Guilloche() {
  return (
    <svg className="idc-guilloche" viewBox="0 0 856 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <path d={GUILLOCHE.waves} />
      <path d={GUILLOCHE.rosette} />
    </svg>
  );
}

/** The path you get, shown as the thing it gets you: an ID card. Total up
 *  top, then steps, trips and time along the bottom, like the fields on a card. */
export function PathCard({ plan, lang, mode, name, busy = false, className = "" }: {
  plan: Plan; lang: Lang; mode: Mode; name?: string; busy?: boolean; className?: string;
}) {
  const s = t[lang];
  const { total } = plan;
  const modeLabel = { cheapest: s.modeCheapest, fewestTrips: s.modeTrips, fastest: s.modeFastest }[mode];
  const full = fullPrice(plan);
  return (
    <section className={`id-card ${className}`} aria-label={s.cardLabel}>
      <p className="sr-only">{s.cardSummary({ name, total: total.dollars, full, steps: total.steps, trips: total.trips, days: total.days })}</p>
      <Guilloche />
      <div className="idc-top" aria-hidden="true">
        <span className="idc-brand"><Mark size={14} tilt={0} />First ID</span>
        <span className="idc-doc">{s.cardLabel}</span>
      </div>
      <div className="idc-mid" aria-hidden="true">
        <div className="idc-holder">
          <IdPortrait className="idc-photo" />
          {name && <span className="idc-name">{name}</span>}
        </div>
        <div className="idc-total">
          <span className="idc-key"><span>{s.totalCost}</span><span className="idc-mode">{modeLabel}</span></span>
          <span className="idc-big"><Br busy={busy}>{money(total.dollars)}</Br></span>
          {full > total.dollars && (
            <span className="idc-was"><span>{s.insteadOf(full)}</span><span>{s.withWaivers(waiverCount(plan))}</span></span>
          )}
        </div>
      </div>
      <dl className="idc-fields" aria-hidden="true">
        <div><dt>{s.unitSteps(total.steps)}</dt><dd>{total.steps}</dd></div>
        <div><dt>{s.unitTrips(total.trips)}</dt><dd>{total.trips}</dd></div>
        <div><dt>{s.untilCard}</dt><dd>{s.timeShort(total.days)}</dd></div>
      </dl>
    </section>
  );
}

/** The law a step rests on, short enough for the back of a card: the first
 *  statute among its sources ("Civ. Code 1185"), else the office ("DMV"). */
function citeOf(action: Plan["steps"][number]["action"], rules: RuleSet) {
  const titles = action.sources.map((id) => rules.sources[id]?.title).filter(Boolean) as string[];
  const title = titles.find((x) => /Code \d|^AB \d/.test(x)) ?? titles[0] ?? "";
  return title.split(/[:(]/)[0].trim()
    .replace("Health & Safety Code", "H&S Code").replace("Welfare & Institutions Code", "W&I Code")
    .replace("Government Code", "Gov. Code").replace("Vehicle Code", "Veh. Code").replace("Civil Code", "Civ. Code")
    .replace(/^(DMV|SSA)\b.*/, "$1");
}

/** The back of the path card: a stripe, then each step (in the person's
 *  language) and the law behind it, the way a real card carries fine print. */
export function CardBack({ plan, rules, lang }: { plan: Plan; rules: RuleSet; lang: Lang }) {
  const s = t[lang];
  return (
    <section className="id-card idc-back" aria-label={s.cardBackTitle}>
      <Guilloche />
      <span className="idc-stripe" aria-hidden="true" />
      <strong className="idc-back-title">{s.cardBackTitle}</strong>
      <ol className="idc-back-list">
        {plan.steps.map((st, i) => (
          <li key={st.action.id}>
            <span className="num">{i + 1}</span>
            <span className="idc-step">{s.stepShort[st.action.id] ?? st.action.label[lang]}</span>
            <span className="idc-cite">{citeOf(st.action, rules)}</span>
          </li>
        ))}
      </ol>
      <span className="idc-back-note">{s.cardBackNote}</span>
    </section>
  );
}

/** Any card, in 3D: it leans toward the mouse, catches the light, has a
 *  little thickness, and flips over to show its back. */
export function Card3D({ front, back, lang, className = "" }: { front: ReactNode; back?: ReactNode; lang: Lang; className?: string }) {
  const s = t[lang];
  const stage = useTilt<HTMLDivElement>(9);
  const [flipped, setFlipped] = useState(false);
  // The face turned away is out of reach: not read, not focusable. React 18
  // has no `inert` prop, so it is set on the element directly.
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (frontRef.current) frontRef.current.inert = flipped;
    if (backRef.current) backRef.current.inert = !flipped;
  }, [flipped, back]);
  return (
    <div ref={stage} className={`c3d${flipped ? " flipped" : ""} ${className}`}>
      <div className="c3d-card">
        <div className="c3d-edge" aria-hidden="true" />
        <div ref={frontRef} className="c3d-face c3d-front" aria-hidden={flipped || undefined}>{front}<span className="c3d-holo" aria-hidden="true" /><span className="c3d-glare" aria-hidden="true" /></div>
        {back && <div ref={backRef} className="c3d-face c3d-back" aria-hidden={!flipped || undefined}>{back}</div>}
      </div>
      {back && (
        // A native button, so Enter and Space work and focus stays put. The
        // label says what pressing it does next, so there is no aria-pressed.
        <button type="button" className="c3d-flip" onClick={() => setFlipped((f) => !f)}>
          <Icon name="flip" size={16} /> {flipped ? s.flipBack : s.flip}
        </button>
      )}
    </div>
  );
}

// Photos live in src/photos/. Drop a file named office, papers, counter or
// phone (.jpg, .png or .webp) in there and it shows up; until then the page
// simply has no photo in that spot. They are shown in black and white.
const photoFiles = import.meta.glob("./photos/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" }) as Record<string, string>;
export const photoUrl = (name: string) =>
  Object.entries(photoFiles).find(([p]) => p.replace(/^.*\//, "").replace(/\.\w+$/, "") === name)?.[1];

// The real LA County forms on Maria's path, rendered from lavote.gov's PDF
// with our highlighter marks on the lines that matter.
export const FORM_PDF = "https://www.lavote.gov/docs/rrcc/documents/birth-record-app-cerificate-of-identity.pdf?v=3";
const formImages: Record<string, string> = { application: applicationImg, certificate: certificateImg };
// A close-up of the highlighted line, laid over the page where that line is.
const formZoom: Record<string, { src: string; top: string; left: string; width: string }> = {
  application: { src: applicationStrip, top: "19%", left: "24%", width: "88%" },
  certificate: { src: certificateStrip, top: "70.5%", left: "26%", width: "86%" },
};
/** Which form a step uses, if we have it. */
export const formFor = (actionId: string) =>
  actionId === "rrcc_mail" ? "application" : actionId === "notary_witnesses" || actionId === "notary_own_id" ? "certificate" : null;

export function FormPaper({ form, lang, className = "" }: { form: string; lang: Lang; className?: string }) {
  const s = t[lang];
  const [title, line, alt] = s.forms[form];
  return (
    <figure className={`paper ${className}`}>
      <div className="paper-desk">
        <a href={FORM_PDF} target="_blank" rel="noreferrer" className="paper-sheet">
          <img src={formImages[form]} alt={alt} loading="lazy" decoding="async" width={1105} height={1430} />
        </a>
        <span className="paper-zoom" aria-hidden="true" style={{ top: formZoom[form].top, width: formZoom[form].width, ["--zl" as string]: formZoom[form].left }}>
          <img src={formZoom[form].src} alt="" loading="lazy" decoding="async" />
        </span>
      </div>
      <figcaption><strong>{title}</strong><span>{line}</span></figcaption>
    </figure>
  );
}

export function Photo({ name, alt, caption, className = "" }: { name: string; alt: string; caption?: string; className?: string }) {
  const url = photoUrl(name);
  if (!url) return null;
  return (
    <figure className={`photo ${className}`}>
      <img src={url} alt={alt} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
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

/** An aside in small type after a short rule. It only repeats something the
 *  page already says, so screen readers skip it. */
export function HandNote({ children, className = "" }: { children: ReactNode; dir?: "left" | "up" | "down"; className?: string }) {
  return (
    <span className={`hand-note ${className}`} aria-hidden="true">
      <span className="hand-text">{children}</span>
    </span>
  );
}

/** A screen opens with a quiet line: its number and name on the left, a live
 *  readout on the right. */
export function Printout({ index, kicker, readout }: { index: string; kicker: string; readout?: ReactNode }) {
  return (
    <div className="printout">
      <span><b>{index}</b>{kicker}</span>
      {readout !== undefined && <span className="readout">{readout}</span>}
    </div>
  );
}

/** A white panel with a small header: what it is, and what the planner found. */
export function Solver({ title, readout, children, className = "" }: { title?: string; readout?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`panel solver ${className}`}>
      {(title || readout !== undefined) && (
        <div className="solver-head">
          <span className="solver-cmd">{title}</span>
          {readout !== undefined && <span className="solver-readout">{readout}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function TopBar(props: { lang: Lang; onLang: (l: Lang) => void; onHome: () => void; onBack?: () => void; onStart?: () => void }) {
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
        {props.onStart && <button className="btn primary small nav-cta" onClick={props.onStart}>{s.start}</button>}
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

/** "instead of $41, with 2 fee waivers", or nothing when nothing was waived. */
export function Waived({ plan, lang }: { plan: Plan; lang: Lang }) {
  const s = t[lang];
  const full = fullPrice(plan);
  if (full <= plan.total.dollars) return null;
  return <p className="waived">{s.waivedLine(full, waiverCount(plan))}</p>;
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

/** The problem in one picture: an ID needs a birth certificate, which needs
 *  an ID. Two documents, two arrows going round, and one way out underneath. */
export function Loop({ lang }: { lang: Lang }) {
  const s = t[lang];
  return (
    <svg className="loop" viewBox="0 0 360 240" role="img" aria-label={`${s.loopId} ${s.loopNeeds} ${s.loopBc}; ${s.loopBc} ${s.loopNeeds} ${s.loopId}. ${s.loopOut}.`}>
      <defs>
        <marker id="loop-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="miter" /></marker>
      </defs>
      {/* The ID: a small card on its side. The certificate: a sheet with lines. */}
      <g transform="rotate(-6 74 72)">
        <rect x="12" y="38" width="124" height="70" rx="6" className="loop-node" />
        <rect x="24" y="52" width="26" height="34" className="loop-pic" />
        <rect x="60" y="56" width="58" height="5" className="loop-pic" />
        <rect x="60" y="68" width="38" height="5" className="loop-pic" />
        <text x="74" y="101" textAnchor="middle" className="loop-text">{s.loopId}</text>
      </g>
      <g transform="rotate(4 284 74)">
        <rect x="220" y="22" width="128" height="106" rx="4" className="loop-node" />
        <rect x="236" y="38" width="80" height="5" className="loop-pic" />
        <rect x="236" y="50" width="62" height="4" className="loop-pic" />
        <rect x="236" y="60" width="72" height="4" className="loop-pic" />
        <rect x="236" y="70" width="50" height="4" className="loop-pic" />
        <text x="284" y="114" textAnchor="middle" className="loop-text">{s.loopBc}</text>
      </g>
      <g fill="none" strokeWidth="1.6">
        <path className="loop-arc" d="M146 52 H 208" stroke="var(--ink)" markerEnd="url(#loop-ink)" />
        <path className="loop-arc" d="M208 98 H 146" stroke="var(--ink)" markerEnd="url(#loop-ink)" />
        <path d="M180 134 V 166" stroke="var(--ink)" strokeWidth="1.6" markerEnd="url(#loop-ink)" />
      </g>
      <text x="177" y="42" textAnchor="middle" className="loop-label">{s.loopNeeds}</text>
      <text x="177" y="116" textAnchor="middle" className="loop-label">{s.loopNeeds}</text>
      <rect x="30" y="178" width="300" height="54" rx="8" className="loop-out" />
      <text x="180" y="210" textAnchor="middle" className="loop-out-text">{s.loopOut}</text>
    </svg>
  );
}
