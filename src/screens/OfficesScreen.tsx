import { useState } from "react";
import { Icon } from "../components";
import { t, type Lang } from "../i18n";
import { directionsUrl, groupHours, hasOffices, officeData, officesFor, sortOffices, zipCentroids } from "../offices";
import { href } from "../router";

// Offices for one kind of place (DMV for now), from the snapshot in
// data/offices.json. The ZIP box only sorts the list: it is never saved,
// sent, or put in the address bar.
export function OfficesScreen({ lang, kind }: { lang: Lang; kind: string }) {
  const s = t[lang];
  const [zip, setZip] = useState("");
  const list = officesFor(kind);
  const src = officeData.sources[kind];
  if (!list.length || !src) return null;
  const full = /^\d{5}$/.test(zip);
  const known = full && !!zipCentroids[zip];
  const rows = sortOffices(list, known ? zip : "");

  return (
    <section className="screen offices">
      <div className="head">
        <span className="label head-place">{s.officesKicker}</span>
        <h1 tabIndex={-1} className="display">{s.officesTitle(kind)}</h1>
        <p className="lede">{s.officesLede}</p>
      </div>

      <div className="offices-zip">
        <label htmlFor="office-zip">{s.officesZip}</label>
        <input id="office-zip" type="text" inputMode="numeric" autoComplete="off" maxLength={5} pattern="[0-9]*"
          value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} aria-describedby="office-zip-note"
          aria-invalid={(full && !known) || undefined} />
        <p id="office-zip-note" className="row-sub" aria-live="polite">
          {known ? s.officesSortedNear(zip) : full ? s.officesZipUnknown : s.officesZipNote}
        </p>
      </div>

      <ul className="office-list">
        {rows.map(({ office: o, mi }) => (
          <li key={o.id} className="panel office">
            <h2 className="office-name">{o.name}{mi !== undefined && <span className="office-mi num"> · {s.officesMiles(mi)}</span>}</h2>
            <p className="office-addr">{o.address}<br />{o.city}, CA {o.zip}</p>
            {o.hours && (
              <dl className="office-hours" aria-label={s.officesHours}>
                {groupHours(o.hours).map((g) => (
                  <div key={g.from}>
                    <dt>{g.from === g.to ? s.officesDay[g.from] : `${s.officesDay[g.from]}–${s.officesDay[g.to]}`}</dt>
                    <dd>{g.value === "closed" ? s.officesClosed : g.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="office-actions">
              {o.phone && <a className="btn ghost small" href={`tel:${o.phone.replace(/[^\d+]/g, "")}`}><Icon name="phone" size={16} /> {s.officesCall(o.phone)}</a>}
              <a className="btn ghost small" href={directionsUrl(o)} target="_blank" rel="noopener noreferrer">
                {s.officesDirections}<span className="sr-only"> {s.officesTo(o.name)}</span> <Icon name="external" size={16} />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="office-note">{s.officesFrom[0]}<a href={src.page} target="_blank" rel="noopener noreferrer">{src.name}</a>{s.officesFrom[1]}</p>
    </section>
  );
}

/** The small "See offices" link in a step's Where row. Nothing if we have no list. */
export function OfficesLink({ place, n, lang }: { place: string; n: number; lang: Lang }) {
  if (!hasOffices(place)) return null;
  return <a className="office-link" href={href({ name: "offices", kind: place, n })}>{t[lang].officesLink(place)} <Icon name="arrow" size={14} /></a>;
}
