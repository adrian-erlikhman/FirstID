// If a screen throws while drawing, the person gets a plain page with a way
// back and the 211 line, in the app's language, not a blank page.
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CrashPage, ErrorBoundary, pageLang } from "../src/ErrorBoundary";
import { t, type Lang } from "../src/i18n";

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

describe("when a screen fails to draw", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it.each(["en", "es"] as Lang[])("%s: the page says so, offers to try again or start over, and gives 211", (lang) => {
    const html = decode(renderToStaticMarkup(<CrashPage lang={lang} />));
    const s = t[lang];
    for (const text of [s.crashTitle, s.crashBody, s.crashRetry, s.startOver, s.help211, s.help211Line]) expect(html).toContain(text);
    expect(html).toContain('href="tel:211"');
    expect(html).toContain(`lang="${lang}"`);
  });

  it("the boundary switches to that page when a child throws", () => {
    expect(ErrorBoundary.getDerivedStateFromError()).toEqual({ failed: true });
    const b = new ErrorBoundary({ children: "the app" });
    expect(b.render()).toBe("the app");
    b.state = { failed: true };
    expect(renderToStaticMarkup(<>{b.render()}</>)).toContain(t.en.crashTitle);
  });

  it("uses the language the app last set, then the phone's, else English", () => {
    vi.stubGlobal("document", { documentElement: { lang: "es" } });
    expect(pageLang()).toBe("es");
    vi.stubGlobal("document", { documentElement: { lang: "" } });
    vi.stubGlobal("navigator", { language: "es-MX" });
    expect(pageLang()).toBe("es");
    vi.stubGlobal("navigator", { language: "ko-KR" });
    expect(pageLang()).toBe("en");
  });
});
