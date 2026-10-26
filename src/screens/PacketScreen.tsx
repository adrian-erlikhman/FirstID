import { Icon, money, placeOf, sayFor } from "../components";
import type { Plan, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";

// One printed Letter page a person can carry to every office, or a caseworker
// can hand over. No name is ever stored: there's a line to write it by hand.
export function PacketScreen({ rules, lang, result }: { rules: RuleSet; lang: Lang; result: Plan }) {
  const s = t[lang];
  const { total } = result;
  const checked = Object.values(rules.sources).map((x) => x.checked).sort().at(-1) ?? "";
  const sourcesUrl = location.href.split("#")[0] + "#/sources";
  const says = result.steps.map((st) => ({ st, say: sayFor(st) })).filter((x) => x.say);

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
                <span role="cell"><span className="box" aria-hidden="true" /></span>
                <span role="cell"><strong>{i + 1}. {a.label[lang]}</strong><br /><span className="sheet-where">{placeOf(rules, st).label[lang]}{!a.verified && ` · ${s.callAhead.toUpperCase()}`}</span></span>
                <span role="cell" className="sheet-small">{a.bring?.map((b) => <span key={b.en} className="bring-line">{b[lang]}</span>)}</span>
                <span role="cell"><strong>{st.dollars === 0 ? s.free : money(st.dollars)}</strong>{was !== null && <><br /><s aria-hidden="true">{money(was)}</s><span className="sr-only"> {s.insteadOf(was)}</span></>}</span>
                <span role="cell" className="sheet-small">{ruleIds.map((id, k) => <span key={id}>{k > 0 && "; "}<span lang="en">{rules.sources[id].title}</span>{s.inEnglish}</span>)}</span>
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
