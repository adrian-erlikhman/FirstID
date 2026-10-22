// Prints WCAG contrast ratios for the colour tokens in src/styles.css.
// Keep these values in sync with the stylesheet; text needs 4.5, UI borders 3.0.
// usage: npm run contrast
const hex = h => h.replace('#','').match(/../g).map(x => parseInt(x,16)/255).map(c => c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4);
const L = h => { const [r,g,b] = hex(h); return 0.2126*r + 0.7152*g + 0.0722*b; };
const cr = (a,b) => { const [x,y] = [L(a),L(b)].sort((p,q)=>q-p); return ((x+0.05)/(y+0.05)).toFixed(2); };
const themes = {
  light: { paper:'#F5F3EC', card:'#FFFFFF', ink:'#1A1C1F', muted:'#565B63', go:'#0B6B5D', onGo:'#FFFFFF', goSoft:'#DDEFEA', amberInk:'#7A3A03', amberSoft:'#FCEFD9', lineStrong:'#8F8A7E' },
  dark:  { paper:'#121416', card:'#1B1E21', ink:'#F1EFE9', muted:'#A6ABB3', go:'#5CC7B2', onGo:'#06231E', goSoft:'#173A33', amberInk:'#F6C07A', amberSoft:'#3A2911', lineStrong:'#6B7178' },
};
for (const [n,t] of Object.entries(themes)) {
  console.log(n, {
    'ink/paper': cr(t.ink,t.paper), 'ink/card': cr(t.ink,t.card), 'muted/paper': cr(t.muted,t.paper), 'muted/card': cr(t.muted,t.card),
    'go/paper (link text)': cr(t.go,t.paper), 'go/card': cr(t.go,t.card), 'onGo/go (button)': cr(t.onGo,t.go), 'ink/goSoft': cr(t.ink,t.goSoft), 'go/goSoft': cr(t.go, t.goSoft),
    'amberInk/amberSoft': cr(t.amberInk,t.amberSoft), 'amberInk/paper': cr(t.amberInk,t.paper), 'amberInk/card': cr(t.amberInk,t.card), 'lineStrong/card (UI 3:1)': cr(t.lineStrong,t.card), 'muted/goSoft': cr(t.muted,t.goSoft)
  });
}
