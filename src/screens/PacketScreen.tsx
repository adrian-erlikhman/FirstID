import { Icon, money, placeOf, sayFor } from "../components";
import { encodeQr, qrPath } from "../qr";
import { loadTicks } from "../progress";
import type { Plan, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";

// One printed Letter page a person can carry to every office, or a caseworker
// can hand over. No name is ever stored: there's a line to write it by hand.
export function PacketScreen({ rules, lang, result }: { rules: RuleSet; lang: Lang; result: Plan }) {
  const s = t[lang];
  const { total } = result;
  // The newest date: [length - 1], not .at(-1), which Safari before 15.4 lacks.
  const dates = Object.values(rules.sources).map((x) => x.checked).sort();
  const checked = dates[dates.length - 1] ?? "";
  // Printed, the page points to How we know, as text and as a QR code. A copy
  // opened from a file (the one-file build we email) points to the live site:
  // a file path on someone's computer is no use to the clerk.
  const here = location.href.split("#")[0];
  const sourcesUrl = (/^https?:/.test(here) ? here : LIVE) + "#/sources";
  const says = result.steps.map((st) => ({ st, say: sayFor(st) })).filter((x) => x.say);
  // Steps ticked done in the app print with their box checked, for a packet printed part way through.
  const ticks = loadTicks();

  return (
    <section className="screen packet-screen">
      <div className="no-print">
        <div className="packet-bar">
          {/* The shareable preview build runs in a frame that can't open the print dialog. */}
          {import.meta.env.VITE_PREVIEW
            ? <p className="fine">{s.printPreview}</p>
            : <><p className="fine">{s.printHint}</p>
              <button className="btn primary" onClick={() => window.print()}><Icon name="print" size={18} /> {s.print}</button></>}
        </div>
      </div>

      <article className="sheet" lang={lang}>
        <header className="sheet-head">
          <div>
            <h1 tabIndex={-1}>{s.pathTitle}</h1>
            <p>{s.packetSub}</p>
          </div>
          <div className="mono sheet-meta">{s.rulesVersion(rules.version.split("-")[0])}<br />{result.allVerified ? s.checkedOn(checked) : s.draftRules}</div>
          <QrCode text={sourcesUrl} label={s.packetQr(sourcesUrl)} />
        </header>

        <div className="sheet-sum">
          <div className="name-line"><span>{s.nameLine}</span><i /></div>
          <div className="mono sheet-totals">
            <span><strong>{money(total.dollars)}</strong></span>
            <span>{total.steps} {s.unitSteps(total.steps)}</span>
            <span>{total.trips} {s.unitTrips(total.trips)}</span>
            <span>{s.timeShort(total.days)}</span>
          </div>
        </div>

        <div className="sheet-table" role="table">
          <div className="sheet-row head mono" role="row">
            <span role="columnheader"><span className="sr-only">{s.doneShort}</span></span><span role="columnheader">{s.colStep}</span><span role="columnheader">{s.colBring}</span>
            <span role="columnheader">{s.colCost}</span><span role="columnheader">{s.colRule}</span>
          </div>
          {result.steps.map((st, i) => {
            const a = st.action;
            const was = st.dollars < a.dollars ? a.dollars : null;
            const ruleIds = [...a.sources.slice(0, 2), ...(was !== null ? st.waiver?.sources.slice(0, 1) ?? [] : [])];
            return (
              <div className="sheet-row" role="row" key={a.id}>
                <span role="cell">{ticks[a.id]
                  ? <><span className="box done" aria-hidden="true"><Icon name="check" size={12} stroke={3} /></span><span className="sr-only">{s.doneShort}</span></>
                  : <span className="box" aria-hidden="true" />}</span>
                <span role="cell"><strong>{i + 1}. {a.label[lang]}</strong><span className="sheet-where">{placeOf(rules, st).label[lang]}{!a.verified && <span className="sheet-flag"> · {s.callAhead.toUpperCase()}</span>}</span></span>
                <span role="cell" className="sheet-small" data-label={s.colBring}>{a.bring?.length
                  ? a.bring.map((b) => <span key={b.en} className="bring-line">{b[lang]}</span>)
                  : <span className="bring-line sheet-none">{s.noBring}</span>}</span>
                <span role="cell"><strong>{st.dollars === 0 ? s.free : money(st.dollars)}</strong>{was !== null && <><br /><s aria-hidden="true">{money(was)}</s><span className="sr-only"> {s.insteadOf(was)}</span></>}</span>
                <span role="cell" className="sheet-small" data-label={s.colRule}>{ruleIds.map((id, k) => <span key={id}>{k > 0 && "; "}<span lang="en">{rules.sources[id].title}</span>{s.inEnglish}</span>)}</span>
              </div>
            );
          })}
        </div>

        {says.length > 0 && (
          <div className="sheet-says">
            {says.map(({ st, say }) => (
              <div key={st.action.id} className="say-box">
                <span className="mono">{s.sayThis} · {placeOf(rules, st).label[lang]}</span>
                <span>“{say![lang]}”</span>
              </div>
            ))}
          </div>
        )}

        <footer className="sheet-foot">
          <span>{s.packetFoot(sourcesUrl)}</span>
          <span className="mono">FIRST ID</span>
        </footer>
      </article>
    </section>
  );
}

const LIVE = "https://first-id.vercel.app/";

/** The QR code for the How-we-know link, drawn as one SVG path (see src/qr.ts). */
function QrCode({ text, label }: { text: string; label: string }) {
  const qr = encodeQr(text);
  const quiet = 2; // plus the white paper around it
  const side = qr.size + 2 * quiet;
  return (
    <svg className="sheet-qr" viewBox={`0 0 ${side} ${side}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={side} height={side} fill="#fff" />
      <path d={qrPath(qr, quiet)} fill="#000" />
    </svg>
  );
}
