import { Icon, money, fullPrice } from "../components";
import type { Plan, RuleSet, Step } from "../engine/types";
import { t, type Lang, type Strings } from "../i18n";
import { useInView, useTilt } from "../motion";
// LA County's form, and the state's own sample documents (sources in src/docs/README.md).
import coiImg from "../forms/certificate-of-identity.jpg";
import birthCertImg from "../docs/birth-certificate-sample.png";
import caIdImg from "../docs/ca-id-sample.jpg";

// OWNER: Adrian. One made-up person, start to finish, in place of a row of
// example people: Maria's real computed path, each step on the real paper it
// leaves her holding, ending on the card.

type Paper = { src: string; w: number; h: number; alt: string; credit: string; card?: boolean };

/** The paper a step leaves Maria holding, when we can show it. */
function paperFor(actionId: string, s: Strings): Paper | null {
  switch (actionId) {
    case "notary_witnesses": case "notary_own_id":
      return { src: coiImg, w: 1105, h: 1430, alt: s.trailAltCoi, credit: s.trailCreditCoi };
    case "rrcc_mail":
      return { src: birthCertImg, w: 1105, h: 1200, alt: s.trailAltBc, credit: s.trailCreditBc };
    case "dmv_original": case "dmv_replace":
      return { src: caIdImg, w: 752, h: 474, alt: s.trailAltId, credit: s.trailCreditId, card: true };
    default:
      return null;
  }
}

function TrailStep({ st, i, rules, lang }: { st: Step; i: number; rules: RuleSet; lang: Lang }) {
  const s = t[lang];
  const tilt = useTilt<HTMLDivElement>(6);
  const paper = paperFor(st.action.id, s);
  const gets = st.action.produces.map((d) => rules.docs[d]?.label[lang]).filter(Boolean);
  // The DL 933 and DL 937 are never shown: the DMV says they must not be shared or uploaded online.
  const dmvForm = gets.join(" ").match(/DL \d+/)?.[0];
  return (
    <li className={`trail-step${paper?.card ? " is-card" : ""}`} style={{ ["--i" as string]: i }}>
      <div className="trail-desk">
        <div ref={tilt} className="trail-doc">
          {paper
            ? <img src={paper.src} alt={paper.alt} width={paper.w} height={paper.h} loading="lazy" decoding="async" />
            : <span className="trail-hidden"><b>{dmvForm ?? gets[0]}</b>{dmvForm && <span>{s.trailHiddenShort}</span>}</span>}
        </div>
      </div>
      <div className="trail-text">
        <span className="trail-meta">
          <span className="trail-n">{i + 1}</span>
          <span className={`trail-cost num${st.dollars === 0 ? " free" : ""}`}>{st.dollars === 0 ? s.free : money(st.dollars)}</span>
        </span>
        <strong>{st.action.label[lang]}</strong>
        {gets.length > 0 && <span className="row-sub">{s.trailGets(gets.join(", "))}</span>}
        {paper && <span className="trail-credit">{paper.credit}</span>}
        {!paper && dmvForm && <span className="trail-credit">{s.trailHidden}</span>}
      </div>
    </li>
  );
}

export function MariaTrail({ plan, rules, lang, onOpen }: { plan: Plan; rules: RuleSet; lang: Lang; onOpen: () => void }) {
  const s = t[lang];
  const [ref, seen] = useInView<HTMLOListElement>();
  const full = fullPrice(plan);
  return (
    <div className="trail-wrap">
      <div className="trail-head">
        <h2 className="display h2">{s.trailTitle}</h2>
        <p className="lede">{s.trailWho}</p>
      </div>
      <ol ref={ref} className={`trail${seen ? " seen" : ""}`}>
        {plan.steps.map((st, i) => <TrailStep key={st.action.id} st={st} i={i} rules={rules} lang={lang} />)}
      </ol>
      <div className="trail-foot">
        <p className="trail-total"><span className="num">{money(plan.total.dollars)}</span> <span>{s.trailTotal(plan.total.steps, full > plan.total.dollars ? full : 0)}</span></p>
        <button className="btn primary" onClick={onOpen}>{s.seeMaria} <Icon name="right" size={16} stroke={2} /></button>
      </div>
      <p className="fine trail-note">{s.trailNote}</p>
    </div>
  );
}
