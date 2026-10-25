// Prints WCAG contrast ratios for the light and dark colours in src/styles.css.
// Keep these values in sync with the stylesheet. Text needs 4.5; borders that
// show where a control is need 3.0. Exits with an error if anything fails.
// usage: npm run contrast
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (h) => { const [r, g, b] = h.slice(1).match(/../g).map((x) => lin(parseInt(x, 16) / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const mix = (a, b, w) => { const ch = (h) => h.slice(1).match(/../g).map((x) => parseInt(x, 16)); const [x, y] = [ch(a), ch(b)]; return "#" + x.map((v, i) => Math.round(v * w + y[i] * (1 - w)).toString(16).padStart(2, "0")).join(""); };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const P = {
  light: { ground: "#ffffff", panel: "#ffffff", ink: "#0a0a0a", onInk: "#ffffff", text2: "#4d4d4d", slate: "#767676", wash: "#f5f5f5", pick: "#f0f0f0", control: "#8f8f8f", c1: "#ffe14d", c2: "#8be3bf", c3: "#9ccbff", c4: "#ffb067", onC: "#0a0a0a" },
  dark: { ground: "#0a0a0a", panel: "#121212", ink: "#f5f5f5", onInk: "#0a0a0a", text2: "#b8b8b8", slate: "#8f8f8f", wash: "#1a1a1a", pick: "#1f1f1f", control: "#737373", c1: "#ffe14d", c2: "#8be3bf", c3: "#9ccbff", c4: "#ffb067", onC: "#0a0a0a" },
};
let failed = 0;
for (const [name, t] of Object.entries(P)) {
  const checks = [
    ["ink on page", t.ink, t.ground, 4.5], ["ink on panel", t.ink, t.panel, 4.5], ["ink on hover row", t.ink, t.wash, 4.5],
    ["ink on picked row", t.ink, t.pick, 4.5], ["secondary text on page", t.text2, t.ground, 4.5], ["secondary on panel", t.text2, t.panel, 4.5],
    ["secondary on hover row", t.text2, t.wash, 4.5], ["headline second voice on page", t.slate, t.ground, 4.5],
    ["primary button text", t.onInk, t.ink, 4.5], ["picked choice text", t.onInk, t.ink, 4.5],
    ["path card text (72% white on black)", mix(t.onInk, t.ink, 0.72), t.ink, 4.5],
    ["control outline on panel", t.control, t.panel, 3], ["control outline on page", t.control, t.ground, 3], ["checkbox fill vs panel", t.ink, t.panel, 3],
    ["text on yellow highlight", t.onC, t.c1, 4.5], ["text on mint", t.onC, t.c2, 4.5], ["text on sky", t.onC, t.c3, 4.5], ["text on orange", t.onC, t.c4, 4.5],
  ];
  const out = checks.map(([label, a, b, min]) => { const r = cr(a, b); if (r < min) failed++; return `${label} ${r.toFixed(2)}${r < min ? " FAIL" : ""}`; });
  console.log(`${name}: ${out.join(" · ")}`);
}
if (failed) { console.error(`${failed} contrast check(s) failed`); process.exit(1); }
console.log("all contrast checks pass");
