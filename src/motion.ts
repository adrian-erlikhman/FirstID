import { useEffect, useRef, useState } from "react";

// The site's motion, in three small hooks. Everything here is
// decoration: it switches itself off for people who ask for reduced motion,
// and on phones that are likely slow or saving data (light mode). The tilt
// only runs with a real mouse (never on touch screens).

type Nav = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

/** A device that is likely slow or saving data: Data Saver on, or 2 GB of
 *  memory or less (deviceMemory is Chromium-only, so this means low-end
 *  Android). Core counts are not used: Safari on iOS reports a clamped
 *  hardwareConcurrency, which would turn every iPhone into light mode.
 *  Browsers that don't say count as fast. */
function liteDevice() {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Nav;
  const mem = n.deviceMemory;
  return n.connection?.saveData === true || (typeof mem === "number" && mem > 0 && mem <= 2);
}

// Light mode is one flag on <html>, so the CSS (the pinned story, the card's
// float and sheen, every animation) switches off exactly as it does for
// prefers-reduced-motion. Anything else that wants to know reads data-motion.
if (typeof document !== "undefined" && liteDevice()) document.documentElement.dataset.motion = "lite";

const reduced = () =>
  (typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) ||
  (typeof document !== "undefined" && document.documentElement.dataset.motion === "lite");
const finePointer = () => typeof window !== "undefined" && !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

/** Tilts whatever is inside toward the mouse. Sets --rx and --ry (degrees)
 *  and --gx and --gy (where the light hits, in %) on the element. */
export function useTilt<T extends HTMLElement>(max = 10) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !finePointer()) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
        el.dataset.tilt = "on";
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      delete el.dataset.tilt;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, [max]);
  return ref;
}

/**
 * How far the page has scrolled through an element, 0 to 1, written to --p.
 * "pin": for a tall section with a sticky inside (0 at its top, 1 when its
 * bottom reaches the bottom of the screen). "view": 0 when the element's top
 * enters the screen, 1 when its middle reaches the middle.
 * Returns the ref and which of `stages` equal parts we are in.
 */
export function useScrollProgress<T extends HTMLElement>(mode: "pin" | "view" = "pin", stages = 1) {
  const ref = useRef<T>(null);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { el.style.setProperty("--p", "1"); setStage(stages - 1); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const h = window.innerHeight;
      let v: number;
      if (mode === "pin") {
        const total = r.height - h;
        v = total > 0 ? -r.top / total : r.top < h ? 1 : 0;
      } else {
        v = (h - r.top) / (h / 2 + r.height / 2);
      }
      v = Math.min(1, Math.max(0, v));
      el.style.setProperty("--p", v.toFixed(4));
      const st = Math.min(stages - 1, Math.floor(v * stages));
      setStage((old) => (old === st ? old : st));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [mode, stages]);
  return [ref, stage] as const;
}

/** True once the element has scrolled into view (and stays true). */
export function useInView<T extends HTMLElement>(margin = "0px 0px -15% 0px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, seen] as const;
}

/** Counts up from 0 to `to` once `go` is true. */
export function useCountUp(to: number, go: boolean, ms = 900) {
  const [n, setN] = useState(reduced() ? to : 0);
  useEffect(() => {
    if (!go || reduced()) { if (go) setN(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, go, ms]);
  return n;
}

/** A number that glides to its new value instead of jumping: the card's total
 *  counts down from $89 to $15 when an answer changes. Snaps straight there
 *  for reduced motion and light mode. */
export function useTween(value: number, ms = 700) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced() || from.current === value) { from.current = value; setShown(value); return; }
    const start = from.current, t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const v = start + (value - start) * (1 - Math.pow(1 - p, 4));
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

type Phase = "closed" | "opening" | "expanding" | "open" | "closing";

/** For something that comes and goes: keeps it mounted while it slides shut,
 *  and gives it one collapsed frame before it slides open. `settled` is true
 *  once it is fully open (so it can stop clipping its contents). */
export function usePresence(show: boolean, ms = 450) {
  const [phase, setPhase] = useState<Phase>(show ? "open" : "closed");
  useEffect(() => {
    if (show) {
      if (phase === "open" || phase === "expanding") return;
      if (reduced()) { setPhase("open"); return; }
      setPhase("opening");
      let r2 = 0;
      const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setPhase("expanding")); });
      return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }
    if (phase === "closed") return;
    if (reduced()) { setPhase("closed"); return; }
    setPhase("closing");
    const id = setTimeout(() => setPhase("closed"), ms);
    return () => clearTimeout(id);
    // Only `show` drives this; phase is read, not watched.
  }, [show]);
  useEffect(() => {
    if (phase !== "expanding") return;
    const id = setTimeout(() => setPhase("open"), ms);
    return () => clearTimeout(id);
  }, [phase, ms]);
  return { mounted: phase !== "closed", open: phase === "expanding" || phase === "open", settled: phase === "open" };
}

type Row<T> = { item: T; key: string; phase: "first" | "enter" | "in" | "leave"; num: number };

/** A list whose rows slide in and out instead of popping: a removed row stays
 *  where it was while it collapses, a new row starts collapsed and opens. */
export function useListPresence<T>(items: T[], keyOf: (item: T) => string, ms = 450): Row<T>[] {
  const sig = items.map(keyOf).join("|");
  const [prevSig, setPrevSig] = useState(sig);
  const [rows, setRows] = useState<Row<T>[]>(() => items.map((item, i) => ({ item, key: keyOf(item), phase: "first", num: i + 1 })));
  let current = rows;
  if (sig !== prevSig) {
    const next = new Map(items.map((item, i) => [keyOf(item), i]));
    const merged: Row<T>[] = items.map((item, i) => {
      const old = rows.find((r) => r.key === keyOf(item));
      const phase = !old ? "enter" : old.phase === "leave" ? "in" : old.phase;
      return { item, key: keyOf(item), phase: reduced() && phase === "enter" ? "in" : phase, num: i + 1 };
    });
    // Put each row that's leaving back after the row it used to follow.
    rows.forEach((r, i) => {
      if (next.has(r.key)) return;
      const prevKey = rows.slice(0, i).reverse().find((p) => merged.some((m) => m.key === p.key))?.key;
      const at = prevKey ? merged.findIndex((m) => m.key === prevKey) + 1 : 0;
      merged.splice(at, 0, { ...r, phase: "leave" });
    });
    current = reduced() ? merged.filter((r) => r.phase !== "leave") : merged;
    setPrevSig(sig);
    setRows(current);
  }
  useEffect(() => {
    if (!rows.some((r) => r.phase === "enter")) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setRows((rs) => rs.map((r) => (r.phase === "enter" ? { ...r, phase: "in" } : r)))); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [rows]);
  useEffect(() => {
    if (!rows.some((r) => r.phase === "leave")) return;
    const id = setTimeout(() => setRows((rs) => rs.filter((r) => r.phase !== "leave")), ms);
    return () => clearTimeout(id);
  }, [rows, ms]);
  // Rows that stay keep showing the latest data (a price can change in place).
  const fresh = new Map(items.map((item) => [keyOf(item), item]));
  return current.map((r) => (fresh.has(r.key) ? { ...r, item: fresh.get(r.key)! } : r));
}
