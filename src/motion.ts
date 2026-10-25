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
export function liteDevice() {
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
