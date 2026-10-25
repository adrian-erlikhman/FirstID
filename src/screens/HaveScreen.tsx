import { Icon } from "../components";
import type { RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";

// OWNER: Adrian. A plain checklist, like a paper form: big rows, one tap each,
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
          <span className="box" aria-hidden="true">{on && <Icon name="check" size={16} stroke={3} />}</span>
          <span className="check-text">{label}{hint && <span className="hint">{hint}</span>}</span>
        </button>
      </li>
    );
  };

  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.haveTitle}</h1>
      <p className="lede">{s.haveHint}</p>

      <ul className="check-list" aria-label={s.haveTitle}>
        {docs.map(([id, d]) => row(id, d.label[lang]))}
      </ul>
      {rules.docs.ssn_known && (
        <ul className="check-list single">{row("ssn_known", rules.docs.ssn_known.label[lang], s.ssnHint)}</ul>
      )}

      <div className="actions stack">
        <button className="primary" onClick={onNext}>{s.toQuestions}</button>
        <button className="text-btn" onClick={() => { onChange([]); onNext(); }}>{s.noneOfThese}</button>
        {onStartOver && <button className="text-btn" onClick={onStartOver}>{s.startOver}</button>}
      </div>

    </section>
  );
}
