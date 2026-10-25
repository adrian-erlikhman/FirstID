import { useEffect, useState } from "react";

// A tiny hash router, so the phone's back button works and every screen has a
// link (#/path, #/step/2, #/example/maria) that opens it directly. Nothing
// about the person goes in the URL: only which screen.
export type Route =
  | { name: "home" }
  | { name: "have" }
  | { name: "questions" }
  | { name: "path" }
  | { name: "step"; n: number }
  | { name: "whatif" }
  | { name: "packet" }
  | { name: "sources" }
  | { name: "example"; id: string }
  | { name: "offices"; kind: string; n?: number };

export function parse(hash: string): Route {
  const [, a, b] = hash.replace(/^#/, "").split("/");
  switch (a) {
    case "have": case "questions": case "path": case "whatif": case "packet": case "sources":
      return { name: a };
    case "step": {
      const n = Number(b);
      return Number.isInteger(n) && n > 0 ? { name: "step", n } : { name: "path" };
    }
    case "example":
      return b ? { name: "example", id: b } : { name: "home" };
    case "offices": { // #/offices/dmv/3: the DMV list, opened from step 3
      const n = Number(hash.split("/")[3]);
      return b ? { name: "offices", kind: b, ...(Number.isInteger(n) && n > 0 ? { n } : {}) } : { name: "home" };
    }
    default:
      return { name: "home" };
  }
}

export function href(r: Route): string {
  if (r.name === "home") return "#/";
  if (r.name === "step") return `#/step/${r.n}`;
  if (r.name === "example") return `#/example/${r.id}`;
  if (r.name === "offices") return `#/offices/${r.kind}${r.n ? `/${r.n}` : ""}`;
  return `#/${r.name}`;
}

// The current screen lives here as well as in the URL, so the app still works
// where a frame won't let the page change its own address.
let current: Route = typeof location === "undefined" ? { name: "home" } : parse(location.hash);
const listeners = new Set<(r: Route) => void>();
const emit = (r: Route) => { current = r; listeners.forEach((f) => f(r)); };

export function go(r: Route, replace = false) {
  try {
    if (replace) history.replaceState(null, "", href(r));
    else history.pushState(null, "", href(r));
  } catch { /* address bar is off-limits here; the in-memory route still changes */ }
  emit(r);
}

if (typeof window !== "undefined") {
  // Only act when the address names a different screen. Changing the hash
  // fires both popstate and hashchange, and by the second one the app may
  // already have moved on (an example link swaps itself for #/path).
  const fromUrl = () => { const r = parse(location.hash); if (href(r) !== href(current)) emit(r); };
  window.addEventListener("popstate", fromUrl);   // back and forward buttons
  window.addEventListener("hashchange", fromUrl); // someone typed or pasted a link
}

export function useRoute(): Route {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    listeners.add(setRoute);
    setRoute(current);
    return () => { listeners.delete(setRoute); };
  }, []);
  return route;
}
