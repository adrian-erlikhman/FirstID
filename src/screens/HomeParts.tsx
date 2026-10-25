import { useRef, type ReactNode } from "react";
import { FormPaper, Icon, Mark, Portrait, Br, money, fullPrice } from "../components";
import type { Plan, RuleSet } from "../engine/types";
import type { Example } from "../examples";
import { t, type Lang } from "../i18n";
import { useCountUp, useInView, useScrollProgress, useTilt } from "../motion";

// OWNER: Adrian. The home page's moving parts, built like a product page:
// a scroll story that pins while it plays, tiles whose numbers count up, the
// real forms turning flat as you reach them, and a row of people to swipe.

/** The loop, told in three beats while the section stays pinned: the two
 *  documents chase each other round a ring, then the card breaks out. */
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
              <span className="mini-id"><Portrait className="mini-pic" /><i /><i /></span>
              <span className="orb-label">{s.storyId}</span>
            </div>
            <div className="orb orb-bc">
              <span className="mini-bc"><i /><i /><i /><i /></span>
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

function PersonCard({ e, p, lang, onOpen }: { e: Example; p: Plan | null; lang: Lang; onOpen: () => void }) {
  const s = t[lang];
  const ref = useTilt<HTMLLIElement>(7);
  return (
    <li ref={ref} className="rail-item">
      <button className="person-card" onClick={onOpen}>
        <Portrait className="pc-photo" />
        <span className="pc-body">
          <strong>{e.name}</strong>
          <span className="row-sub">{e.line[lang]}</span>
        </span>
        <span className="pc-foot">
          {p
            ? <><Br>{money(p.total.dollars)}</Br><span>{p.total.steps} {s.unitSteps(p.total.steps)}, {s.timeShort(p.total.days)}</span></>
            : <span>{s.noPathShort}</span>}
          <Icon name="arrow" size={16} />
        </span>
      </button>
    </li>
  );
}

/** The made-up people, in a row you can swipe (or page with the arrows). */
export function PeopleRail({ people, plans, lang, onExample }: { people: Example[]; plans: (Plan | null)[]; lang: Lang; onExample: (id: string) => void }) {
  const s = t[lang];
  const rail = useRef<HTMLUListElement>(null);
  const page = (dir: number) => {
    const el = rail.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(".rail-item");
    el.scrollBy({ left: dir * ((item?.offsetWidth ?? 300) + 16), behavior: "smooth" });
  };
  return (
    <div className="rail-wrap">
      <ul ref={rail} className="rail">
        {people.map((e, i) => <PersonCard key={e.id} e={e} p={plans[i]} lang={lang} onOpen={() => onExample(e.id)} />)}
      </ul>
      <div className="rail-nav">
        <button className="rail-btn" onClick={() => page(-1)} aria-label={s.prev}><Icon name="left" size={18} stroke={2} /></button>
        <button className="rail-btn" onClick={() => page(1)} aria-label={s.next}><Icon name="right" size={18} stroke={2} /></button>
      </div>
    </div>
  );
}
