import type { Plan } from "./engine/types";
import { t, type Lang } from "./i18n";
import type { Route } from "./router";

// The browser tab's title for each screen: what the screen is, then the app's
// name. It shows in the tab, in bookmarks and in the back button's history,
// which otherwise lists every screen as "First ID". The words are the screens'
// own headings, so they follow the language switch.

const plain = (heading: string) => heading.trim().replace(/[.。]$/, "");

export function pageTitle(route: Route, lang: Lang, result: Plan | null): string {
  const s = t[lang];
  const name = s.appName;
  const titled = (what: string) => `${plain(what)} · ${name}`;
  switch (route.name) {
    case "have": return titled(s.haveTitle);
    case "questions": return titled(s.questionsTitle);
    case "path": return titled(result ? s.pathTitle : s.noPathTitle);
    case "packet": return titled(s.pathTitle);
    case "whatif": return titled(s.whatIfTitle);
    case "sources": return titled(s.howWeKnow);
    case "offices": return titled(s.officesTitle(route.kind));
    case "step": {
      const st = result?.steps[route.n - 1];
      return st ? titled(`${s.stepOf(route.n, result!.steps.length)}: ${st.action.label[lang]}`) : name;
    }
    default: return name;
  }
}
