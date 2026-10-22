import { useEffect, useMemo, useState } from "react";
import rulesJson from "../data/rules.json";
import { TopBar } from "./components";
import { plan, whatHelps } from "./engine/planner";
import type { Facts, Mode, Person, RuleSet } from "./engine/types";
import { examples } from "./examples";
import { t, type Lang } from "./i18n";
import { go, parse, useRoute, type Route } from "./router";
import { HaveScreen } from "./screens/HaveScreen";
import { PacketScreen } from "./screens/PacketScreen";
import { PathScreen } from "./screens/PathScreen";
import { QuestionsScreen } from "./screens/QuestionsScreen";
import { SourcesScreen } from "./screens/SourcesScreen";
import { StepScreen } from "./screens/StepScreen";
import { WhatIfScreen } from "./screens/WhatIfScreen";

const rules = rulesJson as unknown as RuleSet;

/**
 * The whole app is a few pieces of state: what you have, facts about you,
 * which way to sort the path, and the language. The plan is computed from
 * them, so a "what if" is just changing one fact and letting it recompute.
 * Nothing is saved or sent anywhere: close the tab and it's gone.
 */
export default function App() {
  const route = useRoute();
  const [lang, setLang] = useState<Lang>(navigator.language?.startsWith("es") ? "es" : "en");
  const [have, setHave] = useState<string[]>([]);
  const [facts, setFacts] = useState<Facts>({});
  const [answered, setAnswered] = useState(false);
  const [mode, setMode] = useState<Mode>("cheapest");
  const s = t[lang];
  const person: Person = useMemo(() => ({ facts, have }), [facts, have]);

  const result = useMemo(() => (answered ? plan(rules, person, mode) : null), [answered, person, mode]);
  const help = useMemo(() => {
    if (!result) return null;
    const top = whatHelps(rules, person, mode)[0];
    const p = top && plan(rules, { ...person, have: [...person.have, top.doc] }, mode);
    return top && p ? { doc: top.doc, plan: p } : null;
  }, [result, person, mode]);

  const load = (p: Person) => { setHave([...p.have]); setFacts({ ...p.facts }); setAnswered(true); };

  // Deep links (#/example/maria) and screens that need answers first.
  useEffect(() => {
    if (route.name === "example") {
      const ex = examples.find((e) => e.id === route.id);
      if (ex) load(ex.person);
      go(ex ? { name: "path" } : { name: "have" }, true);
      return;
    }
    const needsAnswers = ["path", "step", "whatif", "packet"].includes(route.name);
    if (needsAnswers && !answered) go({ name: "have" }, true);
    else if (route.name === "step" && result && route.n > result.steps.length) go({ name: "path" }, true);
    else if (route.name === "packet" && !result) go({ name: "path" }, true);
  }, [route, answered, result]);

  // New screen: start at the top and move focus to its heading, so a screen
  // reader announces where you are.
  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true }));
  }, [route.name, route.name === "step" ? route.n : 0]);

  useEffect(() => { document.documentElement.lang = lang; document.title = s.appName; }, [lang, s.appName]);

  // In-app links (#/step/2) change the screen ourselves, so they work the same
  // inside frames and previews that would otherwise treat them as navigation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#/']");
      if (!a) return;
      e.preventDefault();
      go(parse(a.getAttribute("href")!));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const bar = (label?: string, back?: Route) => (
    <TopBar lang={lang} onLang={() => setLang(lang === "en" ? "es" : "en")} label={label}
      onBack={back ? () => go(back) : undefined} home={() => go({ name: "have" })} />
  );

  let screen: JSX.Element | null = null;
  let top = bar();
  switch (route.name) {
    case "have":
      top = bar(s.stepOf(1, 3));
      screen = <HaveScreen rules={rules} lang={lang} have={have} onChange={setHave}
        onNext={() => go({ name: "questions" })} onExample={(id) => go({ name: "example", id })}
        onStartOver={answered || have.length ? () => { setHave([]); setFacts({}); setAnswered(false); setMode("cheapest"); } : undefined} />;
      break;
    case "questions":
      top = bar(s.stepOf(2, 3), { name: "have" });
      screen = <QuestionsScreen lang={lang} facts={facts} onChange={setFacts}
        onNext={() => { setAnswered(true); go({ name: "path" }); }} />;
      break;
    case "path":
      top = bar(s.stepOf(3, 3), { name: "questions" });
      screen = answered ? <PathScreen rules={rules} lang={lang} result={result} mode={mode} onMode={setMode}
        help={help} facts={facts} onChangeAnswers={() => go({ name: "questions" })} /> : null;
      break;
    case "step":
      if (result?.steps[route.n - 1]) {
        const st = result.steps[route.n - 1];
        top = bar(s.stepHeader(route.n, result.steps.length, rules.places[st.action.place].label[lang]), { name: "path" });
        screen = <StepScreen rules={rules} lang={lang} plan={result} n={route.n} />;
      }
      break;
    case "whatif":
      top = bar(s.whatIfLabel, { name: "path" });
      screen = answered ? <WhatIfScreen rules={rules} lang={lang} person={person} mode={mode}
        onApply={(p) => { load(p); go({ name: "path" }); }} /> : null;
      break;
    case "packet":
      top = bar(s.printPacket, { name: "path" });
      screen = result ? <PacketScreen rules={rules} lang={lang} result={result} /> : null;
      break;
    case "sources":
      top = bar(s.sourcesLabel, answered ? { name: "path" } : { name: "have" });
      screen = <SourcesScreen rules={rules} lang={lang} />;
      break;
  }

  return (
    <div className={`app route-${route.name}`}>
      {top}
      <main key={route.name === "step" ? `step-${route.n}` : route.name}>{screen}</main>
      <footer className="foot no-print">
        <p>{s.privacy}</p>
      </footer>
    </div>
  );
}
