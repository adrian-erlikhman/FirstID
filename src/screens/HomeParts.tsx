import type { ReactNode } from "react";
import { FormPaper, Mark, money, fullPrice } from "../components";
import type { Plan, RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { useCountUp, useInView, useScrollProgress, useTilt } from "../motion";
// The state's own sample documents (sources in src/docs/README.md).
import caIdImg from "../docs/ca-id-sample.jpg";
import birthCertImg from "../docs/birth-certificate-sample.png";

// The home page's moving parts, built like a product page:
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

/** Two tiles: Maria's real path as the proof, and the scale behind it. Every
 *  number is counted from the rules, and counts up the first time the grid
 *  scrolls into view. */
export function Bento({ rules, lang, maria }: { rules: RuleSet; lang: Lang; maria: Plan | null }) {
  const s = t[lang];
  const [ref, seen] = useInView<HTMLUListElement>();
  const nWaivers = rules.actions.reduce((n, a) => n + (a.waivers?.length ?? 0), 0);
  // Distinct pages cited by a rule or a fee waiver (two ids can share one page).
  const cited = rules.actions.flatMap((a) => [...a.sources, ...(a.waivers ?? []).flatMap((w) => w.sources)]);
  const nSources = new Set(cited.map((id) => rules.sources[id]?.url).filter(Boolean)).size;
  const dollars = useCountUp(maria?.total.dollars ?? 0, seen);
  const scale: [number, string][] = [
    [useCountUp(nWaivers, seen), s.statsWaivers],
    [useCountUp(rules.actions.length, seen), s.statsRules],
    [useCountUp(nSources, seen), s.statsSources],
  ];
  return (
    <ul ref={ref} className={`bento${seen ? " seen" : ""}`}>
      {maria && (
        <Tile className="t-maria">
          <span className="tile-big num">{money(dollars)}</span>
          <span className="tile-sub">{s.statsMaria(fullPrice(maria))}</span>
          {/* The fee waivers that take her path down to this total. Her steps
              themselves are listed once, in Maria's path further down. */}
          <span className="tile-rows">
            {maria.steps.filter((st) => st.waiver).map((st, i) => (
              <span key={st.action.id} className="tile-row" style={{ ["--i" as string]: i }}>
                <span className="hs-label">{rules.docs[st.action.produces[0]]?.label[lang] ?? st.action.label[lang]}</span>
                <s className="num">{money(st.action.dollars)}</s>
                <span className="row-sub">{st.waiver!.label[lang]}</span>
              </span>
            ))}
          </span>
        </Tile>
      )}
      <Tile className="t-scale">
        <span className="scale-rows">
          {scale.map(([n, label]) => (
            <span key={label} className="scale-row"><span className="scale-n num">{n}</span><span className="scale-label">{label}</span></span>
          ))}
        </span>
        <span className="scale-foot">{s.statsReach}</span>
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
