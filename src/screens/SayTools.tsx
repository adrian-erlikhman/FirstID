import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { t, type Lang } from "../i18n";

// Two helpers for the "Say this" line on a step:
// "Show the clerk" puts the line full screen in huge type, for holding the
// phone up at a counter, and "Read aloud" speaks the step with the phone's own
// voice (speechSynthesis runs on the device; nothing is sent anywhere).

type Props = {
  lang: Lang;
  /** The step's name, its place, what to bring and the say line, already in `lang`. */
  name: string;
  where: string;
  bring: string[];
  say: string;
};

export function SayTools({ lang, name, where, bring, say }: Props) {
  const s = t[lang];
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const speech = useSpeech(lang);

  const parts = [
    name,
    `${s.where}: ${where}`,
    ...(bring.length ? [`${s.bring}: ${bring.map((b) => (/[.!?]$/.test(b.trim()) ? b.trim() : `${b.trim()}.`)).join(" ")}`] : []),
    `${s.sayThis}: ${say}`,
  ];
  const close = useCallback(() => setOpen(false), []);

  // A new step or language stops whatever was being read.
  const key = `${lang}|${parts.join("|")}`;
  const { stop } = speech;
  useEffect(() => stop, [key, stop]);

  return (
    <div className="say-tools">
      <button ref={opener} type="button" className="btn ghost say-tool" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <ExpandIcon /> {s.showClerk}
      </button>
      {speech.supported && (
        <button
          type="button"
          className={`btn ghost say-tool${speech.speaking ? " is-on" : ""}`}
          onClick={() => (speech.speaking ? speech.stop() : speech.speak(parts))}
        >
          {speech.speaking ? <StopIcon /> : <SpeakerIcon />} {speech.speaking ? s.stopReading : s.readAloud}
        </button>
      )}
      {open && <ClerkView lang={lang} say={say} onClose={close} returnTo={opener} />}
    </div>
  );
}

/* ---------- Show the clerk ---------- */

function ClerkView({ lang, say, onClose, returnTo }: { lang: Lang; say: string; onClose: () => void; returnTo: RefObject<HTMLButtonElement> }) {
  const s = t[lang];
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useFitText(box, text, say);
  useWakeLock();

  // Focus the Close button, lock the page behind, and give focus back on close.
  useEffect(() => {
    const back = returnTo.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      back?.focus();
    };
  }, [returnTo]);

  // Escape closes from anywhere, even if focus somehow left the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep Tab inside the dialog.
  const trap = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialog.current) return;
    const items = Array.from(dialog.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return createPortal(
    <div ref={dialog} className="clerk" role="dialog" aria-modal="true" aria-labelledby="clerk-title" aria-describedby="clerk-say" lang={lang} onKeyDown={trap}>
      <div className="clerk-bar">
        <h2 id="clerk-title" className="clerk-title">{s.showClerkTitle}</h2>
        <button ref={closeBtn} type="button" className="clerk-close" onClick={onClose}>
          <CloseIcon /> {s.close}
        </button>
      </div>
      <div ref={box} className="clerk-box">
        <p ref={text} id="clerk-say" className="clerk-say">{say}</p>
      </div>
    </div>,
    document.body,
  );
}

/** Grow the text as large as it can go without overflowing its box (never below 32px; scrolls if even that is too big). */
function useFitText(box: RefObject<HTMLElement>, el: RefObject<HTMLElement>, content: string) {
  useLayoutEffect(() => {
    const b = box.current, p = el.current;
    if (!b || !p) return;
    const fit = () => {
      const fits = (px: number) => {
        p.style.fontSize = `${px}px`;
        return p.scrollHeight <= b.clientHeight && p.scrollWidth <= b.clientWidth;
      };
      // Whole words only while measuring, so a long word shrinks the text instead of splitting.
      p.style.overflowWrap = "normal";
      let lo = 32, hi = 160;
      if (!fits(lo)) { p.style.fontSize = `${lo}px`; p.style.overflowWrap = "anywhere"; return; }
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (fits(mid)) lo = mid; else hi = mid;
      }
      p.style.fontSize = `${lo}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    void document.fonts?.ready.then(fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, [box, el, content]);
}

type WakeLockSentinelLike = { release: () => Promise<void> };
type WakeLockNav = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> } };

/** Keep the screen on while mounted, where the Wake Lock API exists. Silent if it doesn't or is refused. */
function useWakeLock() {
  useEffect(() => {
    const nav = navigator as WakeLockNav;
    if (!nav.wakeLock) return;
    let lock: WakeLockSentinelLike | null = null;
    let done = false;
    const get = async () => {
      try {
        const l = await nav.wakeLock!.request("screen");
        if (done) void l.release().catch(() => {});
        else lock = l;
      } catch { /* refused (low battery, not visible): the view still works */ }
    };
    // The browser drops the lock when the tab is hidden; take it again on return.
    const onVis = () => { if (document.visibilityState === "visible") void get(); };
    void get();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      done = true;
      document.removeEventListener("visibilitychange", onVis);
      void lock?.release().catch(() => {});
    };
  }, []);
}

/* ---------- Read aloud ---------- */

const voicePrefs: Record<Lang, string[]> = { es: ["es-US", "es-MX", "es-ES"], en: ["en-US"] };
const norm = (tag: string) => tag.replace("_", "-").toLowerCase();

/** Pick the best on-device voice for the language: preferred regions first, then any of that
 *  language. Network voices (`localService: false`, such as Chrome's "Google" voices) are never
 *  used, because they send the text to a server. No on-device voice means no Read aloud. */
export function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | null {
  const local = voices.filter((v) => v.localService);
  for (const tag of voicePrefs[lang]) {
    const v = local.find((x) => norm(x.lang) === tag.toLowerCase());
    if (v) return v;
  }
  return local.find((x) => norm(x.lang).startsWith(`${lang}-`) || norm(x.lang) === lang) ?? null;
}

/** speechSynthesis as Play/Stop. `supported` is false where the API is missing or the
 *  device has no voice of its own for the language. */
function useSpeech(lang: Lang) {
  const api = typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const run = useRef(0);

  useEffect(() => {
    if (!api) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => {
      synth.removeEventListener?.("voiceschanged", load);
      synth.cancel();
    };
  }, [api]);

  const supported = api && pickVoice(voices, lang) !== null;

  const stop = useCallback(() => {
    if (!api) return;
    run.current++;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [api]);

  const speak = useCallback((parts: string[]) => {
    if (!api) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const id = ++run.current;
    const voice = pickVoice(voices.length ? voices : synth.getVoices(), lang);
    if (!voice) return;
    const tag = voice.lang.replace("_", "-");
    const list = parts.filter(Boolean);
    // One utterance per part: shorter utterances avoid browsers cutting long speech off.
    list.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = tag;
      u.voice = voice;
      u.rate = 0.95;
      if (i === list.length - 1) u.onend = () => { if (run.current === id) setSpeaking(false); };
      u.onerror = () => { if (run.current === id) setSpeaking(false); };
      synth.speak(u);
    });
    setSpeaking(list.length > 0);
  }, [api, voices, lang]);

  return { supported, speaking, speak, stop };
}

/* ---------- icons (stroke, same weight as the app's own) ---------- */

const svg = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className: "icon" };
const ExpandIcon = () => <svg {...svg}><path d="M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5" /></svg>;
const SpeakerIcon = () => <svg {...svg}><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z M16 9a4 4 0 0 1 0 6 M18.5 6.5a7.5 7.5 0 0 1 0 11" /></svg>;
const StopIcon = () => <svg {...svg}><path d="M7 7h10v10H7z" /></svg>;
const CloseIcon = () => <svg {...svg} width={22} height={22}><path d="M6 6l12 12 M18 6L6 18" /></svg>;
