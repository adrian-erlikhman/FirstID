import { Component, type ReactNode } from "react";
import { t, type Lang } from "./i18n";
import { clearSaved } from "./saved";

// If a screen ever throws while drawing, React removes the whole app and the
// person is left with a blank page: no words, no way back, no phone number.
// This catches it and shows a plain page instead, in the language the app was
// in, that says so, offers to try again or go back to the start, and gives the
// 211 line. It uses nothing from the app's state, so it can't fail the same way.

/** The language the app last set on <html>, or the phone's, else English. */
export function pageLang(): Lang {
  const l = (typeof document !== "undefined" && document.documentElement.lang) || (typeof navigator !== "undefined" ? navigator.language : "");
  return /^es\b/i.test(l) ? "es" : "en";
}

export function CrashPage({ lang }: { lang: Lang }) {
  const s = t[lang];
  return (
    <main className="app crash" lang={lang}>
      <section className="screen">
        <h1 className="display">{s.crashTitle}</h1>
        <p className="lede">{s.crashBody}</p>
        <div className="actions row">
          <button type="button" className="btn primary" onClick={() => location.reload()}>{s.crashRetry}</button>
          {/* Start over forgets the saved answers, in case they are what failed: the page reloads clean. */}
          <a className="btn ghost" href="./" onClick={() => { clearSaved(); try { location.hash = "#/"; } catch { /* plain link still works */ } }}>{s.startOver}</a>
        </div>
        <p className="crash-help"><a href="tel:211"><strong>{s.help211}</strong></a> {s.help211Line}</p>
      </section>
    </main>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error("First ID hit an error while drawing a screen:", error); }
  render() { return this.state.failed ? <CrashPage lang={pageLang()} /> : this.props.children; }
}
