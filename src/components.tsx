import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { usePresence, useTween } from "./motion";
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

/** A number the planner computed. */
export function Br({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`bracketed ${className}`}><span className="num">{children}</span></span>;
}

// The fine-line security print behind the card, on an 856 x 540 grid (ID-1 at
// ten units a millimetre): a field of gentle waves, and a guilloche rosette
// of interlaced loops on the right. Built once, as two path strings.
/** Slides its contents open and shut instead of popping them in and out.
 *  While closing it keeps showing what it last held. */
export function Collapse({ show, children, className = "" }: { show: boolean; children: ReactNode; className?: string }) {
  const { mounted, open, settled } = usePresence(show);
  const last = useRef(children);
  if (show) last.current = children;
  if (!mounted) return null;
  return (
    <div className={`collapse${open ? " open" : ""}${settled ? " settled" : ""} ${className}`} aria-hidden={show ? undefined : true}>
      <div className="collapse-in">{show ? children : last.current}</div>
    </div>
  );
}

/** Text that fades in when it changes, instead of being swapped in place. */
export function Swap({ text, className = "" }: { text: string; className?: string }) {
  return <span key={text} className={`swap ${className}`}>{text}</span>;
}

/** Says `text` to screen readers when it changes, not when the screen opens
 *  (the heading already says it then). For totals that change in place: the
 *  numbers on screen count up and down, so they can't be live themselves. */
export function LiveNote({ text }: { text: string }) {
  const [said, setSaid] = useState("");
  const last = useRef(text);
  useEffect(() => {
    if (last.current === text) return;
    last.current = text;
    setSaid(text);
  }, [text]);
  return <p className="sr-only" role="status">{said}</p>;
}

/** A crossed-out price, read as "instead of $34" rather than a bare second number. */
export function WasPrice({ dollars, lang }: { dollars: number; lang: Lang }) {
  return <><s className="num" aria-hidden="true">{money(dollars)}</s><span className="sr-only"> {t[lang].insteadOf(dollars)}</span></>;
}

/** A number that counts to its new value. `format` turns it into text. */
export function Tween({ value, format = String }: { value: number; format?: (n: number) => string }) {
  return <>{format(Math.round(useTween(value)))}</>;
}

/** The path you get, as a plain summary: the total after fee waivers, what it
 *  would have cost without them, then steps, trips and time. */
export function PathCard({ plan, lang, mode, name, className = "" }: {
  plan: Plan; lang: Lang; mode: Mode; name?: string; className?: string;
}) {
  const s = t[lang];
  const { total } = plan;
  const modeLabel = { cheapest: s.modeCheapest, fewestTrips: s.modeTrips, fastest: s.modeFastest }[mode];
  const full = fullPrice(plan);
  const was = full > total.dollars;
  return (
    <section className={`cost-card ${className}`} aria-label={s.cardLabel}>
      <p className="sr-only">{s.cardSummary({ name, total: total.dollars, full, steps: total.steps, trips: total.trips, days: total.days })}</p>
      <div className="cc-top" aria-hidden="true">
        <span className="cc-label">{name ?? s.totalCost}</span>
        <span className="cc-mode">{modeLabel}</span>
      </div>
      <div className="cc-total" aria-hidden="true">
        <span className="cc-big"><Br><Tween value={total.dollars} format={money} /></Br></span>
        {was && <span className="cc-was"><span>{s.insteadOf(full)}</span><span>{s.withWaivers(waiverCount(plan))}</span></span>}
      </div>
      <dl className="cc-fields" aria-hidden="true">
        <div><dt>{s.unitSteps(total.steps)}</dt><dd><Tween value={total.steps} /></dd></div>
        <div><dt>{s.unitTrips(total.trips)}</dt><dd><Tween value={total.trips} /></dd></div>
        <div><dt>{s.untilCard}</dt><dd><Tween value={total.days} format={s.timeShort} /></dd></div>
      </dl>
    </section>
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
              tabIndex={props.lang === l ? 0 : -1} onKeyDown={langKeys(props.onLang)}
              onClick={() => props.onLang(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
        <TextSizeMenu lang={props.lang} />
      </div>
    </header>
  );
}

/** A radio group is one Tab stop: the arrow keys move between EN and ES,
 *  picking as they go, the way screen readers say radios work. */
const langKeys = (onLang: (l: Lang) => void) => (e: ReactKeyboardEvent<HTMLButtonElement>) => {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
  e.preventDefault();
  const other = e.currentTarget.getAttribute("lang") === "en" ? "es" : "en";
  onLang(other);
  e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[lang="${other}"]`)?.focus();
};

/* ---------- text size ----------
 * Three sizes, set as data-text-size on <html>, which scales the root font
 * size (styles.css, "Text size" block). Remembered on this device only, in
 * localStorage; nothing is sent anywhere. */
type TextSize = "default" | "larger" | "largest";
const TEXT_SIZES: TextSize[] = ["default", "larger", "largest"];
const TEXT_SIZE_KEY = "firstid-text-size";

function applyTextSize(size: TextSize) {
  if (size === "default") delete document.documentElement.dataset.textSize;
  else document.documentElement.dataset.textSize = size;
}
function savedTextSize(): TextSize {
  try {
    const v = localStorage.getItem(TEXT_SIZE_KEY) as TextSize | null;
    return v && TEXT_SIZES.includes(v) ? v : "default";
  } catch { return "default"; }
}
// Before the first paint, so a saved size doesn't flash at the default.
if (typeof document !== "undefined") applyTextSize(savedTextSize());

/** "Aa" in the top bar; opens a small menu with the three sizes. */
function TextSizeMenu({ lang }: { lang: Lang }) {
  const s = t[lang];
  const [size, setSize] = useState<TextSize>(savedTextSize);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();

  const pick = (v: TextSize) => {
    setSize(v);
    applyTextSize(v);
    try { localStorage.setItem(TEXT_SIZE_KEY, v); } catch { /* private mode: just this visit */ }
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const names: Record<TextSize, string> = { default: s.textSizeDefault, larger: s.textSizeLarger, largest: s.textSizeLargest };
  return (
    <div className="ts" ref={wrap}>
      <button ref={toggle} className="ts-toggle" aria-expanded={open} aria-controls={`${id}-menu`} aria-label={s.textSizeLabel}
        onClick={() => setOpen((o) => !o)}><span aria-hidden="true">A<span className="ts-big">A</span></span></button>
      <div id={`${id}-menu`} className="ts-menu" hidden={!open}>
        <p className="ts-title" aria-hidden="true">{s.textSizeLabel}</p>
        <div className="ts-options" role="group" aria-label={s.textSizeLabel}>
          {TEXT_SIZES.map((v, i) => (
            <button key={v} className="ts-option" aria-pressed={size === v} onClick={() => pick(v)}>
              <span className={`ts-a ts-a${i}`} aria-hidden="true">A</span>
              <span className="ts-name">{names[v]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const money = (d: number) => `$${d}`;

/** What the same steps would cost with no fee waivers. */
export const fullPrice = (p: Plan) => p.steps.reduce((sum, st) => sum + st.action.dollars, 0);
export const waiverCount = (p: Plan) => p.steps.filter((st) => st.waiver && st.dollars < st.action.dollars).length;

/** What to say at the counter: the waiver's line if one applies, else the step's own. */
export const sayFor = (st: Step) => st.waiver?.say ?? st.action.say;

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

/** Pick one answer. Pills with aria-pressed, so screen readers announce the
 *  choice. `numbered` adds 01, 02… in mono. */
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

/** One official source. Until a person verifies the rule, it never claims a "checked" date.
 *  Source pages are in English, so the Spanish title says "(en inglés)". */
export function SourceCard({ src, lang, verified }: { src: Source; lang: Lang; verified: boolean }) {
  const s = t[lang];
  const missing = /^TODO/i.test(src.quote);
  // Titles and quotes are the source's own English words, so screen readers
  // say them in English on the Spanish screens too; " (en inglés)" stays Spanish.
  let host = "";
  try { host = new URL(src.url).hostname.replace(/^www\./, ""); } catch { /* not a URL */ }
  return (
    <a className="source" href={src.url} target="_blank" rel="noreferrer">
      <span className="source-host">{host} <Icon name="external" size={13} /></span>
      <span className="source-title"><span lang="en">{src.title}</span>{s.inEnglish}</span>
      {missing
        ? <span className="source-quote missing">{s.quoteMissing}</span>
        : <span className="source-quote" lang="en">“{src.quote}”</span>}
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
