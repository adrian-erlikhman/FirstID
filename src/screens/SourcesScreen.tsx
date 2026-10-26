import { useState } from "react";
import { Block, Icon, SourceCard } from "../components";
import type { RuleSet } from "../engine/types";
import { t, type Lang } from "../i18n";

// The model card: every rule, its sources, when we checked it, which ones we
// couldn't confirm, and plainly what's real and what's made up.
const REPO_ISSUES = "https://github.com/adrian-erlikhman/FirstID/issues/new?template=wrong-rule.yml";

export function SourcesScreen({ rules, lang }: { rules: RuleSet; lang: Lang }) {
  const s = t[lang];
  const [open, setOpen] = useState<string | null>(null);
  const verified = rules.actions.filter((a) => a.verified).length;

  return (
    <section className="screen">
      <div className="split">
        <div className="head">
          <h1 tabIndex={-1} className="display">{s.sourcesTitle}</h1>
          <p className="lede">{s.sourcesIntro} {s.verifiedSoFar(verified, rules.actions.length)}</p>
        </div>

        <div className="body">
          <ul className="panel rule-list">
            {rules.actions.map((a, i) => {
              const isOpen = open === a.id;
              return (
                <li key={a.id} className="rule">
                  <button className="rule-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}>
                    <span className="row-num" aria-hidden="true">{i + 1}</span>
                    <span className="rule-name">{a.label[lang]}</span>
                    <span className={`tag ${a.verified ? "ok" : "draft"}`}>{a.verified ? s.verified : s.callAhead}</span>
                    <span className="rule-src"><span lang="en">{a.sources.map((id) => rules.sources[id].title.split(" (")[0]).join("; ")}</span>{s.inEnglish && <> <span className="rule-src-lang">{s.inEnglish.trim()}</span></>}</span>
                    <span className="rule-chev"><Icon name="chevron" size={18} /></span>
                  </button>
                  {isOpen && (
                    <div className="rule-body sources">
                      {a.why && <p className="row-sub">{a.why[lang]}</p>}
                      {a.sources.map((id) => <SourceCard key={id} src={rules.sources[id]} lang={lang} verified={a.verified} />)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <Block label={s.howPlanTitle}>
            <ol className="panel how">
              {s.howPlan.map((x, i) => (
                <li key={x}><span className="row-num" aria-hidden="true">{i + 1}</span><span>{x}</span></li>
              ))}
            </ol>
          </Block>

          <div className="honesty">
            <div className="panel"><h2 className="label">{s.realTitle}</h2><ul>{s.realItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div className="panel"><h2 className="label">{s.madeUpTitle}</h2><ul>{s.madeUpItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div className="panel"><h2 className="label">{s.notYetTitle}</h2><ul>{s.notYetItems.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>

          <p className="fine">{s.notLegalAdvice}</p>
          <p className="fine">{s.reportWrong} <a href={REPO_ISSUES} target="_blank" rel="noreferrer">{s.reportLink} <Icon name="external" size={13} /></a></p>
        </div>
      </div>
    </section>
  );
}
