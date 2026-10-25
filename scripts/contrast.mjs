// Prints WCAG contrast ratios for the light and dark colours in src/styles.css.
// Keep these values in sync with the stylesheet. Text needs 4.5; borders that
// show where a control is need 3.0. Exits with an error if anything fails.
// usage: npm run contrast
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (h) => { const [r, g, b] = h.slice(1).match(/../g).map((x) => lin(parseInt(x, 16) / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const P = {
  "passport light": { bg: "#ffffff", surface: "#f5f6f8", ink: "#131722", muted: "#545c6b", control: "#858d9a", accent: "#1e3a6d", accentInk: "#ffffff", wash: "#e9eef8", ok: "#17663e", warnInk: "#8a4b00", warnWash: "#fff4e0", total: "#1e3a6d" },
  "passport dark": { bg: "#0d1016", surface: "#151922", ink: "#edeff3", muted: "#a1a8b5", control: "#697285", accent: "#a8bfea", accentInk: "#0d1016", wash: "#1a2539", ok: "#5cc98e", warnInk: "#f5be6b", warnWash: "#33240e", total: "#c3d3f2" },
};
let failed = 0;
for (const [name, t] of Object.entries(P)) {
  const checks = [
    ["ink on page", t.ink, t.bg, 4.5], ["ink on surface", t.ink, t.surface, 4.5], ["muted on page", t.muted, t.bg, 4.5],
    ["muted on surface", t.muted, t.surface, 4.5], ["button text", t.accentInk, t.accent, 4.5], ["link/accent on page", t.accent, t.bg, 4.5],
    ["ink on selected row", t.ink, t.wash, 4.5], ["free/ok text", t.ok, t.bg, 4.5], ["ok on selected", t.ok, t.wash, 4.5],
    ["warning text", t.warnInk, t.warnWash, 4.5], ["warning on page", t.warnInk, t.bg, 4.5], ["total on surface", t.total, t.surface, 4.5],
    ["control border", t.control, t.bg, 3],
  ];
  const out = checks.map(([label, a, b, min]) => { const r = cr(a, b); if (r < min) failed++; return `${label} ${r.toFixed(2)}${r < min ? " FAIL" : ""}`; });
  console.log(`${name}: ${out.join(" · ")}`);
}
if (failed) { console.error(`${failed} contrast check(s) failed`); process.exit(1); }
console.log("all contrast checks pass");
