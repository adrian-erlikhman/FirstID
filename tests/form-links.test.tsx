// The pictures of LA County's two forms are links to the official PDF. The
// picture's alt text says what is on the page, so the link also has to say
// where it goes, or a screen reader hears a description and nothing more.
// On the step screens the picture is the only link to the form.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FORM_PDF, FormPaper } from "../src/components";
import { t, type Lang } from "../src/i18n";

const LANGS: Lang[] = ["en", "es"];
const FORMS = ["application", "certificate"];

describe("form pictures say they open the official PDF", () => {
  for (const lang of LANGS)
    for (const form of FORMS)
      it(`${lang} ${form}`, () => {
        const html = renderToStaticMarkup(<FormPaper form={form} lang={lang} />);
        const link = html.match(/<a [^>]*class="paper-sheet"[^>]*>([\s\S]*?)<\/a>/);
        expect(link, "the picture is a link").not.toBeNull();
        expect(link![0]).toContain(`href="${FORM_PDF.replace(/&/g, "&amp;")}"`);
        expect(link![1]).toContain(`alt="`);
        expect(link![1]).toContain(`<span class="sr-only"> ${t[lang].openForm}</span>`);
      });
});
