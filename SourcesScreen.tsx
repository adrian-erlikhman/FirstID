import { useState } from "react";
import { Icon, SourceCard } from "../components";
import type { RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";

// OWNER: Michael (content) + Adrian (layout). The model card: every rule, its
// sources, when we checked it, which ones we couldn't confirm, and plainly
// what's real and what's made up.
const REPO_ISSUES = "https://github.com/adrian-erlikhman/first-id/issues";

export function SourcesScreen({ rules, lang }: { rules: RuleSet; lang: Lang }) {
  const s = t[lang];
  const [open, setOpen] = useState<string | null>(null);
  const verified = rules.actions.filter((a) => a.verified).length;
  const checked = Object.values(rules.sources).map((x) => x.checked).sort().at(-1) ?? "";
  const checkedShort = new Date(checked + "T12:00:00").toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "short", day: "numeric" });

  return (
    <section className="screen">
      <h1 tabIndex={-1}>{s.sourcesTitle}</h1>
      <p className="lede">{s.sourcesIntro}</p>

      <dl className="stats">
        <div><dd>{rules.actions.length}</dd><dt>{s.statRules}</dt></div>
        <div><dd>{Object.keys(rules.sources).length}</dd><dt>{s.statSources}</dt></div>
        <div><dd>{verified}/{rules.actions.length}</dd><dt>{s.statVerified}</dt></div>
        <div><dd>{checkedShort}</dd><dt>{s.statChecked}</dt></div>
      </dl>

      <ul className="rules-list">
        {rules.actions.map((a) => {
          const isOpen = open === a.id;
          return (
            <li key={a.id} className="rule">
              <button className="rule-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}>
                <span className="rule-name">{a.label[lang]}</span>
                <span className={`chip ${a.verified ? "go" : "amber"}`}>{a.verified ? s.verified : s.callAhead}</span>
                <span className="mono rule-src">{a.sources.map((id) => rules.sources[id].title.split(" (")[0]).join(" · ")}</span>
              </button>
              {isOpen && (
                <div className="sources-stack">
                  {a.why && <p className="muted">{a.why[lang]}</p>}
                  {a.sources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} />)}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <section className="block">
        <h2>{s.howPlanTitle}</h2>
        <ol className="plain-ol">{s.howPlan.map((x) => <li key={x}>{x}</li>)}</ol>
      </section>

      <section className="block honesty">
        <div><h3>{s.realTitle}</h3><ul>{s.realItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><h3>{s.madeUpTitle}</h3><ul>{s.madeUpItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><h3>{s.notYetTitle}</h3><ul>{s.notYetItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </section>

      <p className="fine">{s.reportWrong} <a href={REPO_ISSUES} target="_blank" rel="noreferrer">{s.reportLink} <Icon name="external" size={14} stroke={2} /></a></p>
    </section>
  );
}
