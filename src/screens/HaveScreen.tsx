import { Icon } from "../components";
import type { RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";

// A plain checklist, like a paper form: big rows, one tap each,
// readable on a cracked screen. "I know my SSN" is its own group because it
// isn't a paper, and it's the thing people most often don't realise is enough.
export function HaveScreen(props: {
  rules: RuleSet; lang: Lang; have: string[];
  onChange: (h: string[]) => void; onNext: () => void;
  onStartOver?: () => void;
}) {
  const { rules, lang, have, onChange, onNext, onStartOver } = props;
  const s = t[lang];
  const docs = Object.entries(rules.docs).filter(([id, d]) => d.askAtIntake && id !== "ssn_known");
  const toggle = (id: string) => onChange(have.includes(id) ? have.filter((x) => x !== id) : [...have, id]);
  const row = (id: string, label: string, hint?: string) => {
    const on = have.includes(id);
    return (
      <li key={id}>
        <button className="check-row" role="checkbox" aria-checked={on} onClick={() => toggle(id)}>
          <span className="box" aria-hidden="true">{on && <Icon name="check" size={15} stroke={3} />}</span>
          <span className="check-text">{label}{hint && <span className="row-sub">{hint}</span>}</span>
        </button>
      </li>
    );
  };

  return (
    <section className="screen">
      <div className="split">
        <div className="head">
          <h1 tabIndex={-1} className="display">{s.haveTitle}</h1>
          <p className="lede">{s.haveHint}</p>
        </div>
        <div className="body">
          <ul className="panel check-list" aria-label={s.haveTitle}>
            {docs.map(([id, d]) => row(id, d.label[lang]))}
          </ul>
          {rules.docs.ssn_known && (
            <ul className="panel check-list single">{row("ssn_known", rules.docs.ssn_known.label[lang], s.ssnHint)}</ul>
          )}

          <div className="actions row">
            <button className="btn primary" onClick={onNext}>{s.toQuestions} <Icon name="arrow" size={18} /></button>
            <button className="btn text" onClick={() => { onChange(have.filter((id) => id === "ssn_known")); onNext(); }}>{s.noneOfThese}</button>
            {onStartOver && <button className="btn text" onClick={onStartOver}>{s.startOver}</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
