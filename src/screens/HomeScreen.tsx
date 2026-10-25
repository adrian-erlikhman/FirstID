import { useMemo } from "react";
import { Card3D, CardBack, FORM_PDF, Icon, PathCard, Photo, photoUrl } from "../components";
import { plan } from "../engine/planner";
import type { RuleSet } from "../engine/types";
import { examples } from "../examples";
import { withImplied } from "../person";
import { t, type Lang } from "../i18n";
import { Bento, LoopStory, PaperStage } from "./HomeParts";
import { MariaTrail } from "./MariaTrail";

// The first thing anyone sees, laid out like a product page:
// one big line and the product itself (Maria's real computed path, as an ID
// card you can tilt and flip), then the problem told as a scroll story, the
// numbers, the real forms, how it works, and Maria's path on real paper.
export function HomeScreen({ rules, lang, onStart, onExample }: {
  rules: RuleSet; lang: Lang; onStart: () => void; onExample: (id: string) => void;
}) {
  const s = t[lang];
  // The example cards show each person's real computed path, not typed numbers.
  const exPlans = useMemo(() => examples.map((e) => plan(rules, { ...e.person, have: withImplied(e.person.have) }, "cheapest")), [rules]);
  const maria = exPlans[examples.findIndex((e) => e.id === "maria")];
  const band = (["office", "papers", "counter"] as const).filter((n) => photoUrl(n));

  return (
    <section className="screen home">
      <div className="hero">
        <p className="hero-eyebrow">{s.heroEyebrow}</p>
        <h1 tabIndex={-1} className="display hero-title">
          <span className="hero-a">{s.heroA}</span>{" "}
          <span className="hero-b"><span className="hl">{s.heroB}.</span></span>
        </h1>
        <p className="hero-lede">{s.heroLede}</p>
        <div className="actions row">
          <button className="btn primary" onClick={onStart}>{s.start}</button>
          <button className="btn link" onClick={() => onExample("maria")}>{s.seeMaria} <Icon name="right" size={16} stroke={2} /></button>
        </div>
        {maria && (
          <div className="hero-stage">
            <Card3D lang={lang} className="hero-c3d"
              front={<PathCard plan={maria} lang={lang} mode="cheapest" name={s.mariaName} />}
              back={<CardBack plan={maria} rules={rules} lang={lang} />} />
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

      <section className="home-sec dark-band">
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
