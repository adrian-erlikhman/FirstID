import { Icon, docIcon } from "../components";
import type { RuleSet } from "../engine/types";
import { examples } from "../examples";
import { t, type Lang } from "../i18n";

// OWNER: Adrian. Big tiles, works one-handed, readable on a cracked screen.
// "I know my SSN" sits apart from the tiles because it isn't a paper: it's
// the thing people most often don't realise is enough.
export function HaveScreen(props: {
  rules: RuleSet; lang: Lang; have: string[];
  onChange: (h: string[]) => void; onNext: () => void; onExample: (id: string) => void;
  onStartOver?: () => void;
}) {
  const { rules, lang, have, onChange, onNext, onExample, onStartOver } = props;
  const s = t[lang];
  const docs = Object.entries(rules.docs).filter(([id, d]) => d.askAtIntake && id !== "ssn_known");
  const toggle = (id: string) => onChange(have.includes(id) ? have.filter((x) => x !== id) : [...have, id]);
  const ssn = rules.docs.ssn_known;

  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.haveTitle}</h1>
      <p className="lede">{s.haveHint}</p>
      {onStartOver && <button className="link-btn start-over" onClick={onStartOver}>{s.startOver}</button>}

      <div className="tiles" role="group" aria-label={s.haveTitle}>
        {docs.map(([id, d]) => {
          const on = have.includes(id);
          return (
            <button key={id} className="tile" aria-pressed={on} onClick={() => toggle(id)}>
              <span className="tile-top">
                <Icon name={docIcon[id] ?? "doc"} />
                <span className={`tick ${on ? "on" : ""}`}>{on && <Icon name="check" size={18} stroke={2.6} />}</span>
              </span>
              <span className="tile-label">{d.label[lang]}</span>
            </button>
          );
        })}
      </div>

      {ssn && (
        <button className="ssn-row" aria-pressed={have.includes("ssn_known")} onClick={() => toggle("ssn_known")}>
          <span className={`tick ${have.includes("ssn_known") ? "on" : ""}`}>{have.includes("ssn_known") && <Icon name="check" size={18} stroke={2.6} />}</span>
          <span><strong>{ssn.label[lang]}</strong><br /><span className="muted">{s.ssnHint}</span></span>
        </button>
      )}

      <div className="actions sticky">
        <button className="link-btn" onClick={() => { onChange([]); onNext(); }}>{s.noneOfThese}</button>
        <button className="primary grow" onClick={onNext}>{s.toQuestions} <Icon name="arrow" size={20} stroke={2.2} /></button>
      </div>

      <aside className="examples">
        <h2 className="kicker">{s.examplesTitle}</h2>
        <ul>
          {examples.map((e) => (
            <li key={e.id}>
              <button className="example" onClick={() => onExample(e.id)}>
                <span className="example-name">{e.name}</span>
                <span className="example-line">{e.line[lang]}</span>
                <Icon name="arrow" size={18} />
              </button>
            </li>
          ))}
        </ul>
        <p className="fine">{s.examplesNote}</p>
      </aside>
    </section>
  );
}
