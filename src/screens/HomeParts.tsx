import type { ReactNode } from "react";
import { FormPaper, Mark, money, fullPrice } from "../components";
import type { Plan, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { useCountUp, useInView, useScrollProgress, useTilt } from "../motion";
// The state's own sample documents (sources in src/docs/README.md).
import caIdImg from "../docs/ca-id-sample.jpg";
import birthCertImg from "../docs/birth-certificate-sample.png";

// OWNER: Adrian. The home page's moving parts, built like a product page:
// a scroll story that pins while it plays, tiles whose numbers count up, the
// real forms turning flat as you reach them. Maria's whole path is in
// MariaTrail.tsx.

/** The loop, told in three beats while the section stays pinned: the two
 *  documents (the state's own samples) chase each other round a ring, then
 *  the card breaks out. */
export function LoopStory({ lang }: { lang: Lang }) {
  const s = t[lang];
  const [ref, stage] = useScrollProgress<HTMLElement>("pin", 3);
  return (
    <section ref={ref} className={`story st-${stage}`} aria-label={s.secLoop}>
      <div className="story-pin">
        <div className="story-text">
          {s.story.map(([h, sub], i) => (
            <div key={h} className={`story-line${i === stage ? " on" : ""}`}>
              <h2 className="display">{h}</h2>
              <p>{sub}</p>
            </div>
          ))}
        </div>
        <div className="story-art" aria-hidden="true">
          <div className="orbit">
            <svg className="orbit-ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" /></svg>
            <div className="orb orb-id">
              <img className="orb-card" src={caIdImg} alt="" width={752} height={474} decoding="async" />
              <span className="orb-label">{s.storyId}</span>
            </div>
            <div className="orb orb-bc">
              <img className="orb-sheet" src={birthCertImg} alt="" width={1105} height={1200} decoding="async" />
              <span className="orb-label">{s.storyBc}</span>
            </div>
          </div>
          <div className="breakout"><Mark size={120} /></div>
        </div>
        <div className="story-dots" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i <= stage ? "on" : ""} />)}</div>
      </div>
    </section>
  );
}

function Tile({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useTilt<HTMLLIElement>(3);
  return <li ref={ref} className={`tile ${className}`}>{children}</li>;
}

/** Five tiles of real numbers, in a grid. The numbers count up the first
 *  time the grid scrolls into view. */
export function Bento({ rules, lang, maria }: { rules: RuleSet; lang: Lang; maria: Plan | null }) {
  const s = t[lang];
  const [ref, seen] = useInView<HTMLUListElement>();
  const nWaivers = rules.actions.reduce((n, a) => n + (a.waivers?.length ?? 0), 0);
  const dollars = useCountUp(maria?.total.dollars ?? 0, seen);
  const waivers = useCountUp(nWaivers, seen);
  const nRules = useCountUp(rules.actions.length, seen);
  return (
    <ul ref={ref} className={`bento${seen ? " seen" : ""}`}>
      {maria && (
        <Tile className="t-maria">
          <span className="tile-big num">{money(dollars)}</span>
          <span className="tile-sub">{s.statsMaria(fullPrice(maria))}</span>
          <span className="tile-rows">
            {maria.steps.map((st, i) => (
              <span key={st.action.id} className="tile-row" style={{ ["--i" as string]: i }}>
                <span className="hs-n">{i + 1}</span>
                <span className="hs-label">{st.action.label[lang]}</span>
                <span className={`num${st.dollars === 0 ? " free" : ""}`}>{st.dollars === 0 ? s.free : money(st.dollars)}</span>
              </span>
            ))}
          </span>
        </Tile>
      )}
      <Tile className="t-yellow"><span className="tile-big num">{waivers}</span><span className="tile-sub">{s.statsWaivers}</span></Tile>
      <Tile className="t-rules"><span className="tile-big num">{nRules}</span><span className="tile-sub">{s.statsRules}</span></Tile>
      <Tile className="t-lang"><span className="tile-big">{s.tileLangs[0]}</span><span className="tile-sub">{s.tileLangs[1]}</span></Tile>
      <Tile className="t-packet">
        <span className="tile-big">{s.tilePacket[0]}</span><span className="tile-sub">{s.tilePacket[1]}</span>
        <span className="mini-sheet" aria-hidden="true"><b /><i /><i /><i /><i /></span>
      </Tile>
    </ul>
  );
}

/** The two real forms on a dark stage. They start turned away and lie flat
 *  as the section reaches the middle of the screen. */
export function PaperStage({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [ref] = useScrollProgress<HTMLDivElement>("view");
  return (
    <div ref={ref} className="paper-stage">
      {children}
      <div className="papers papers3d">
        <FormPaper form="application" lang={lang} className="p-a" />
        <FormPaper form="certificate" lang={lang} className="p-b" />
      </div>
    </div>
  );
}
