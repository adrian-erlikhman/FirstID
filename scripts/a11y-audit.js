// Accessibility check for every screen, in English and Spanish, with axe-core
// (WCAG 2.0 and 2.1 A and AA, WCAG 2.2 AA, and axe's best practices) plus
// three checks of our own that axe doesn't make: text under 16px, tap targets
// under 44px, and an <html lang> that matches the language picked.
//
// It runs in the browser, against the dev server:
//   1. npm run dev
//   2. open the app at a phone width (375px) in Chrome's device mode
//   3. in the devtools console:  await (await import("/scripts/a11y-audit.js")).audit()
// It loads Maria's example, visits each screen in both languages and returns
// a list of problems (an empty list means nothing found). The session's
// answers are replaced by Maria's; start over afterwards if that matters.
// Nothing is sent anywhere: axe-core is served from node_modules.

const SCREENS = ["#/", "#/have", "#/questions", "#/example/maria", "#/step/1", "#/step/2", "#/step/3", "#/step/4",
  "#/whatif", "#/offices/dmv/4", "#/sources", "#/packet"];

// Small text that is a label, not something a person reads as a sentence.
// Kept short on purpose: anything new that is small shows up in the report.
const SMALL_OK = [".label", ".tag", ".row-num", ".source-host", ".source-meta", ".switch-text", ".step-place", ".cc-mode",
  ".lang", ".nav-cta", ".ts-toggle", ".ts-menu", ".foot", ".sheet", ".facts dt", ".cc-fields dt", ".orb-label",
  ".solver-head", ".sr-only", ".step-cost s", ".trail-n"];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadAxe() {
  if (window.axe) return window.axe;
  await new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = "/node_modules/axe-core/axe.min.js";
    s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  });
  return window.axe;
}

function visible(el) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && !el.closest("[aria-hidden='true'], [hidden]");
}

/** Text nodes drawn under 16px that aren't labels. */
function smallText() {
  const out = [];
  const walker = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || !n.textContent.trim() || !visible(el) || el.closest(SMALL_OK.join(","))) continue;
    const px = parseFloat(getComputedStyle(el).fontSize);
    if (px < 15.95) out.push(`${px}px "${n.textContent.trim().slice(0, 40)}" (${el.className || el.tagName.toLowerCase()})`);
  }
  return [...new Set(out)];
}

/** Things you tap that are smaller than 44 x 44, counting a ::after that widens the hit area.
 *  Links inside a sentence are allowed to be small (WCAG 2.5.8 exception). */
function smallTargets() {
  const out = [];
  for (const el of document.querySelectorAll("button, a[href], input, [role=checkbox], [role=switch], [role=radio]")) {
    if (!visible(el) || el.closest(".sr-only")) continue;
    if (el.tagName === "A" && el.closest("p, li.rule-body, .fine, .office-note") && getComputedStyle(el).display === "inline") continue;
    // A hidden input inside a label: the label is the target.
    const box = (el.tagName === "INPUT" && el.closest("label")) || el;
    const r = box.getBoundingClientRect();
    const a = getComputedStyle(box, "::after");
    let w = r.width, h = r.height;
    if (a.content !== "none" && a.position === "absolute") {
      const px = (v) => (v === "auto" ? 0 : -parseFloat(v) || 0);
      h += px(a.top) + px(a.bottom); w += px(a.left) + px(a.right);
    }
    if (w < 43.5 || h < 43.5) out.push(`${Math.round(w)}x${Math.round(h)} ${box.className || box.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}"`);
  }
  return [...new Set(out)];
}

async function setLang(lang) {
  const b = document.querySelector(`.lang [lang="${lang}"]`);
  if (b && b.getAttribute("aria-checked") !== "true") b.click();
  await wait(200);
}

export async function audit({ langs = ["en", "es"], screens = SCREENS } = {}) {
  const axe = await loadAxe();
  const problems = [];
  for (const lang of langs) {
    for (const hash of screens) {
      location.hash = hash;
      await wait(700);
      await setLang(lang);
      await wait(500); // let slides and count-ups finish
      // A background tab pauses CSS animations part way, which leaves text at
      // opacity 0 and hides it from the contrast check. Jump them to the end.
      document.getAnimations().forEach((a) => { try { a.finish(); } catch { /* an infinite animation can't finish */ } });
      await wait(50);
      const where = `${lang} ${location.hash}`;
      if (document.documentElement.lang !== lang) problems.push(`${where}: <html lang="${document.documentElement.lang}">`);
      const res = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
      for (const v of res.violations) {
        problems.push(`${where}: axe ${v.id} (${v.impact}): ${v.help} -> ${v.nodes.slice(0, 4).map((n) => n.target.join(" ")).join(" | ")}`);
      }
      for (const t of smallText()) problems.push(`${where}: small text ${t}`);
      for (const t of smallTargets()) problems.push(`${where}: small target ${t}`);
    }
  }
  return problems;
}
