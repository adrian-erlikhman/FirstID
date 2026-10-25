// Prints WCAG contrast ratios for the light and dark colours in src/styles.css.
// Keep these values in sync with the stylesheet. Text needs 4.5; borders that
// show where a control is need 3.0. Exits with an error if anything fails.
// usage: npm run contrast
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (h) => { const [r, g, b] = h.slice(1).match(/../g).map((x) => lin(parseInt(x, 16) / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const P = {
  "monte light": { ground: "#f7f8fa", panel: "#ffffff", ink: "#0e0f12", onInk: "#f7f8fa", text2: "#2c2f36", slate: "#6b6f78", accent: "#2f45ff", wash: "#eef0f3", accentWash: "#eef0ff", control: "#858a95" },
  "monte dark": { ground: "#0b0c0e", panel: "#141518", ink: "#f2f3f5", onInk: "#0b0c0e", text2: "#c9cdd4", slate: "#9aa0aa", accent: "#7d8bff", wash: "#1b1d21", accentWash: "#1a1f45", control: "#6f7684" },
};
let failed = 0;
for (const [name, t] of Object.entries(P)) {
  const checks = [
    ["ink on page", t.ink, t.ground, 4.5], ["ink on panel", t.ink, t.panel, 4.5], ["ink on hover row", t.ink, t.wash, 4.5],
    ["ink on picked row", t.ink, t.accentWash, 4.5], ["secondary text on page", t.text2, t.ground, 4.5], ["secondary on panel", t.text2, t.panel, 4.5],
    ["headline second voice on page", t.slate, t.ground, 4.5], ["primary button text", t.onInk, t.ink, 4.5], ["picked pill text", t.onInk, t.ink, 4.5],
    ["accent note / bracket on page", t.accent, t.ground, 4.5], ["accent on panel", t.accent, t.panel, 4.5],
    ["control outline on panel", t.control, t.panel, 3], ["control outline on page", t.control, t.ground, 3], ["checkbox fill vs panel", t.accent, t.panel, 3],
  ];
  const out = checks.map(([label, a, b, min]) => { const r = cr(a, b); if (r < min) failed++; return `${label} ${r.toFixed(2)}${r < min ? " FAIL" : ""}`; });
  console.log(`${name}: ${out.join(" · ")}`);
}
if (failed) { console.error(`${failed} contrast check(s) failed`); process.exit(1); }
console.log("all contrast checks pass");
