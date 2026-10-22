import { useEffect, useState } from "react";

// A tiny hash router, so the phone's back button works and every screen has a
// link (#/path, #/step/2, #/example/maria) we can open straight from the video
// script. Nothing about the person goes in the URL: only which screen.
export type Route =
  | { name: "have" }
  | { name: "questions" }
  | { name: "path" }
  | { name: "step"; n: number }
  | { name: "whatif" }
  | { name: "packet" }
  | { name: "sources" }
  | { name: "example"; id: string };

export function parse(hash: string): Route {
  const [, a, b] = hash.replace(/^#/, "").split("/");
  switch (a) {
    case "questions": case "path": case "whatif": case "packet": case "sources":
      return { name: a };
    case "step": {
      const n = Number(b);
      return Number.isInteger(n) && n > 0 ? { name: "step", n } : { name: "path" };
    }
    case "example":
      return b ? { name: "example", id: b } : { name: "have" };
    default:
      return { name: "have" };
  }
}

export function href(r: Route): string {
  if (r.name === "have") return "#/";
  if (r.name === "step") return `#/step/${r.n}`;
  if (r.name === "example") return `#/example/${r.id}`;
  return `#/${r.name}`;
}

// The current screen lives here as well as in the URL, so the app still works
// where a frame won't let the page change its own address.
let current: Route = typeof location === "undefined" ? { name: "have" } : parse(location.hash);
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
  const fromUrl = () => emit(parse(location.hash));
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
