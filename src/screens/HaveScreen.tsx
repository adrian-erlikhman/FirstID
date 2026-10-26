import { Icon } from "../components";
import type { RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";
import { clearPapers } from "../person";

// The papers a person has, as a checklist with one tap per row. "I know my
// SSN" is its own list because it isn't a paper, and people often don't
// realise the number alone is enough.
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
          <span className="box" aria-hidden="true"><Icon name="check" size={15} stroke={3} /></span>
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

          <div className="actions row have-actions">
            <button className="btn primary" onClick={onNext}>{s.toQuestions} <Icon name="arrow" size={18} /></button>
            <button className="btn text" onClick={() => { onChange(clearPapers(have)); onNext(); }}>{s.noneOfThese}</button>
            {onStartOver && <button className="btn text" onClick={() => {
              onStartOver();
              // The button goes away once there is nothing to clear, so hand focus to the heading.
              document.querySelector<HTMLElement>("main h1")?.focus();
            }}>{s.startOver}</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
