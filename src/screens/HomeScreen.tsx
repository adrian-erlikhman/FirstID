import { Fragment, useMemo } from "react";
import { FORM_PDF, Icon, PathCard, Photo, photoUrl } from "../components";
import { plan } from "../engine/planner";
import type { RuleSet } from "../engine/types";
import { examples } from "../examples";
import { withImplied } from "../person";
import { t, type Lang } from "../i18n";
import { Bento, LoopStory, PaperStage } from "./HomeParts";
import { MariaTrail } from "./MariaTrail";

// The home page: the headline and the summary of Maria's path, then the
// problem as a scroll story, photos if there are any, the numbers, the real
// forms, how it works, and Maria's path step by step.
export function HomeScreen({ rules, lang, onStart, onExample }: {
  rules: RuleSet; lang: Lang; onStart: () => void; onExample: (id: string) => void;
}) {
  const s = t[lang];
  // Maria's numbers come from the planner, not typed in.
  const maria = useMemo(() => {
    const e = examples.find((x) => x.id === "maria");
    return e ? plan(rules, { ...e.person, have: withImplied(e.person.have) }, "cheapest") : null;
  }, [rules]);
  const band = (["office", "papers", "counter"] as const).filter((n) => photoUrl(n));

  return (
    <section className="screen home">
      <div className="hero">
        <p className="hero-eyebrow">{s.heroEyebrow}</p>
        <h1 tabIndex={-1} className="display hero-title">
          <span className="hero-a">{sentences(s.heroA).map((x, i) => (
            <Fragment key={i}>{i > 0 && " "}<span className="hero-s">{x}</span></Fragment>
          ))}</span>{" "}
          <span className="hero-b"><span className="hl">{s.heroB}.</span></span>
        </h1>
        <p className="hero-lede">{s.heroLede}</p>
        <div className="actions row">
          <button className="btn primary" onClick={onStart}>{s.start}</button>
          <button className="btn link" onClick={() => onExample("maria")}>{s.seeMaria} <Icon name="right" size={16} stroke={2} /></button>
        </div>
        {maria && (
          <div className="hero-stage">
            <PathCard plan={maria} lang={lang} mode="cheapest" name={s.mariaName} />
          </div>
        )}
        <p className="hero-note">{s.heroNote}</p>
      </div>

      <LoopStory lang={lang} />

      {band.length > 0 && (
        <div className={`photo-band n${band.length}`}>
          {band.map((n) => <Photo key={n} name={n} alt={s.photos[n][0]} caption={s.photos[n][1]} />)}
        </div>
      )}

      <section className="home-sec">
        <h2 className="display h2 center">{s.getTitleA} <span className="second">{s.getTitleB}</span></h2>
        <Bento rules={rules} lang={lang} maria={maria} />
      </section>

      <section className="home-sec forms-band">
        <PaperStage lang={lang}>
          <div className="paper-head">
            <h2 className="display h2 center">{s.formsTitle}</h2>
            <p className="lede center">{s.formsBody}</p>
            <p className="fine center">{s.formsNote} <a href={FORM_PDF} target="_blank" rel="noreferrer">{s.openForm} <Icon name="external" size={13} /></a></p>
          </div>
        </PaperStage>
      </section>

      <section className="home-sec">
        <h2 className="display h2 center">{s.howTitle}</h2>
        <p className="lede center">{s.homeFor}</p>
        <ol className="how-tiles">
          {s.how.map(([title, text], i) => (
            <li key={title} className="how-tile">
              <span className="how-n">{i + 1}</span>
              <strong>{title}</strong>
              <span className="row-sub">{text}</span>
            </li>
          ))}
        </ol>
        <p className="body-text center how-note">{s.howNote}</p>
        <Photo name="phone" alt={s.photos.phone[0]} caption={s.photos.phone[1]} className="side" />
      </section>

      {maria && (
        <section className="home-sec">
          <MariaTrail plan={maria} rules={rules} lang={lang} onOpen={() => onExample("maria")} />
        </section>
      )}

      <section className="home-cta">
        <h2 className="display">{s.ctaTitle}</h2>
        <p className="lede center">{s.ctaSub}</p>
        <div className="actions row">
          <button className="btn primary" onClick={onStart}>{s.start}</button>
          <button className="btn link" onClick={() => onExample("maria")}>{s.seeMaria} <Icon name="right" size={16} stroke={2} /></button>
        </div>
      </section>

      <p className="fine center">{s.homeFine}</p>
    </section>
  );
}

/** "No ID. No birth certificate." -> ["No ID.", "No birth certificate."], so
 *  wide screens can keep each sentence on its own line (styles.css, hero). */
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/);
