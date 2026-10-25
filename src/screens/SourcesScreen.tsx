import { useState } from "react";
import { Icon, SourceCard } from "../components";
import type { RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";

// OWNER: Michael (content) + Adrian (layout). The model card: every rule, its
// sources, when we checked it, which ones we couldn't confirm, and plainly
// what's real and what's made up.
const REPO_ISSUES = "https://github.com/adrian-erlikhman/FirstID/issues";

export function SourcesScreen({ rules, lang }: { rules: RuleSet; lang: Lang }) {
  const s = t[lang];
  const [open, setOpen] = useState<string | null>(null);
  const verified = rules.actions.filter((a) => a.verified).length;

  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.sourcesTitle}</h1>
      <p className="lede">{s.sourcesIntro}</p>

      <dl className="stats3 tiles3">
        <div><dt>{s.statRules}</dt><dd>{rules.actions.length}</dd></div>
        <div><dt>{s.statSources}</dt><dd>{Object.keys(rules.sources).length}</dd></div>
        <div><dt>{s.statVerified}</dt><dd>{verified}/{rules.actions.length}</dd></div>
      </dl>

      <ul className="rule-list">
        {rules.actions.map((a) => {
          const isOpen = open === a.id;
          return (
            <li key={a.id} className="rule">
              <button className="rule-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}>
                <span className="rule-name">{a.label[lang]}</span>
                <span className={`status-tag ${a.verified ? "ok" : "warn"}`}>{a.verified ? s.verified : s.callAhead}</span>
                <span className="rule-src">{a.sources.map((id) => rules.sources[id].title.split(" (")[0]).join(" · ")}</span>
              </button>
              {isOpen && (
                <div className="rule-body sources">
                  {a.why && <p className="muted">{a.why[lang]}</p>}
                  {a.sources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} verified={a.verified} />)}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <section className="block">
        <h2 className="section-title">{s.howPlanTitle}</h2>
        <ol className="plain-ol">{s.howPlan.map((x) => <li key={x}>{x}</li>)}</ol>
      </section>

      <section className="block honesty">
        <div><h3>{s.realTitle}</h3><ul>{s.realItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><h3>{s.madeUpTitle}</h3><ul>{s.madeUpItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><h3>{s.notYetTitle}</h3><ul>{s.notYetItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </section>

      <p className="fine">{s.reportWrong} <a href={REPO_ISSUES} target="_blank" rel="noreferrer">{s.reportLink} <Icon name="external" size={14} /></a></p>
    </section>
  );
}
