import { useEffect, useMemo, useState } from "react";
import rulesJson from "../data/rules.json";
import { Lockup, TopBar } from "./components";
import { plan, whatHelps } from "./engine/planner";
import type { Facts, Mode, Person, Plan, RuleSet } from "./engine/types";
import { examples } from "./examples";
import { withImplied } from "./person";
import { t, type Lang } from "./i18n";
import { go, parse, useRoute, type Route } from "./router";
import { HaveScreen } from "./screens/HaveScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { OfficesScreen } from "./screens/OfficesScreen";
import { PacketScreen } from "./screens/PacketScreen";
import { PathScreen } from "./screens/PathScreen";
import { QuestionsScreen } from "./screens/QuestionsScreen";
import { SourcesScreen } from "./screens/SourcesScreen";
import { StepScreen } from "./screens/StepScreen";
import { WhatIfScreen } from "./screens/WhatIfScreen";

const rules = rulesJson as unknown as RuleSet;

// Answers are kept in this tab's sessionStorage, so a phone that reloads the
// page in the background doesn't wipe them. It never leaves the phone, and it
// is gone when the tab closes. If storage is blocked, the app still works.
const SAVE_KEY = "first-id:v1";
interface Saved { have: string[]; facts: Facts; unsure: string[]; answered: boolean; mode: Mode; lang: Lang }
const saved: Partial<Saved> = (() => {
  try { return JSON.parse(sessionStorage.getItem(SAVE_KEY) ?? "{}"); } catch { return {}; }
})();

/**
 * The whole app is a few pieces of state: what you have, facts about you,
 * which way to sort the path, and the language. The plan is computed from
 * them, so a "what if" is just changing one fact and letting it recompute.
 */
export default function App() {
  const route = useRoute();
  const [lang, setLang] = useState<Lang>(saved.lang ?? (navigator.language?.startsWith("es") ? "es" : "en"));
  const [have, setHave] = useState<string[]>(saved.have ?? []);
  const [facts, setFacts] = useState<Facts>(saved.facts ?? {});
  const [unsure, setUnsure] = useState<string[]>(saved.unsure ?? []);
  const [answered, setAnswered] = useState(saved.answered ?? false);
  const [mode, setMode] = useState<Mode>(saved.mode ?? "cheapest");
  const s = t[lang];
  const person: Person = useMemo(() => ({ facts, have: withImplied(have) }), [facts, have]);

  useEffect(() => {
    try { sessionStorage.setItem(SAVE_KEY, JSON.stringify({ have, facts, unsure, answered, mode, lang } satisfies Saved)); } catch { /* storage blocked */ }
  }, [have, facts, unsure, answered, mode, lang]);

  const { result, ms } = useMemo(() => {
    if (!answered) return { result: null as Plan | null, ms: 0 };
    const t0 = performance.now();
    const p = plan(rules, person, mode);
    return { result: p, ms: performance.now() - t0 };
  }, [answered, person, mode]);

  // "What would help most": only ever suggest something that makes the path
  // cheaper or shorter, never one that saves a trip by costing more.
  const help = useMemo(() => {
    if (!result) return null;
    const top = whatHelps(rules, person, mode)[0];
    const p = top && plan(rules, { ...person, have: [...person.have, top.doc] }, mode);
    if (!top || !p) return null;
    const a = p.total, b = result.total;
    const better = a.dollars <= b.dollars && a.steps <= b.steps && (a.dollars < b.dollars || a.steps < b.steps);
    return better ? { doc: top.doc, plan: p } : null;
  }, [result, person, mode]);

  const load = (p: Person) => { setHave([...p.have]); setFacts({ ...p.facts }); setUnsure([]); setAnswered(true); };
  const reset = () => { setHave([]); setFacts({}); setUnsure([]); setAnswered(false); setMode("cheapest"); };

  // Deep links (#/example/maria) and screens that need answers first.
  useEffect(() => {
    if (route.name === "example") {
      const ex = examples.find((e) => e.id === route.id);
      if (ex) load(ex.person);
      go(ex ? { name: "path" } : { name: "home" }, true);
      return;
    }
    const needsAnswers = ["path", "step", "whatif", "packet"].includes(route.name);
    if (needsAnswers && !answered) go({ name: "have" }, true);
    else if (route.name === "step" && (!result || route.n > result.steps.length)) go({ name: "path" }, true);
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

  const bar = (back?: Route) => (
    <TopBar lang={lang} onLang={setLang} onBack={back ? () => go(back) : undefined} onHome={() => go({ name: "home" })}
      onStart={route.name === "home" ? () => go({ name: "have" }) : undefined} />
  );

  let screen: JSX.Element | null = null;
  let top = bar();
  switch (route.name) {
    case "home":
      screen = <HomeScreen rules={rules} lang={lang} onStart={() => go({ name: "have" })} onExample={(id) => go({ name: "example", id })} />;
      break;
    case "have":
      top = bar({ name: "home" });
      screen = <HaveScreen rules={rules} lang={lang} have={have} onChange={setHave}
        onNext={() => go({ name: "questions" })}
        onStartOver={answered || have.length ? reset : undefined} />;
      break;
    case "questions":
      top = bar({ name: "have" });
      screen = <QuestionsScreen lang={lang} facts={facts} unsure={unsure}
        onChange={(f, u) => { setFacts(f); setUnsure(u); }}
        onNext={() => { setAnswered(true); go({ name: "path" }); }} />;
      break;
    case "path":
      top = bar({ name: "questions" });
      screen = answered ? <PathScreen rules={rules} lang={lang} result={result} mode={mode} onMode={setMode} ms={ms} person={person}
        help={help} facts={facts} onChangeAnswers={() => go({ name: "questions" })} /> : null;
      break;
    case "step":
      if (result?.steps[route.n - 1]) {
        top = bar({ name: "path" });
        screen = <StepScreen rules={rules} lang={lang} plan={result} n={route.n} />;
      }
      break;
    case "whatif":
      top = bar({ name: "path" });
      screen = answered ? <WhatIfScreen rules={rules} lang={lang} person={person} mode={mode}
        onApply={(p) => { load(p); go({ name: "path" }); }} /> : null;
      break;
    case "packet":
      top = bar({ name: "path" });
      screen = result ? <PacketScreen rules={rules} lang={lang} result={result} /> : null;
      break;
    case "sources":
      top = bar(answered ? { name: "path" } : { name: "home" });
      screen = <SourcesScreen rules={rules} lang={lang} />;
      break;
    case "offices":
      top = bar(route.n && result?.steps[route.n - 1] ? { name: "step", n: route.n } : answered ? { name: "path" } : { name: "home" });
      screen = <OfficesScreen lang={lang} kind={route.kind} />;
      break;
  }

  return (
    <div className={`app route-${route.name}`}>
      {top}
      <main key={route.name === "step" ? `step-${route.n}` : route.name}>{screen}</main>
      <footer className="foot no-print">
        <Lockup />
        <p>{s.privacy}</p>
      </footer>
    </div>
  );
}
