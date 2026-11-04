// The answers kept in this tab's sessionStorage (see App.tsx). They are read
// back with care: a value written by an older version of the app, or naming a
// paper or step the rules no longer have, must never stop the app from
// starting. Anything of the wrong shape is dropped, and that answer starts
// blank instead.
import type { Answers } from "./answers";
import type { Facts, Mode, RuleSet } from "./engine/types";
import type { Lang } from "./i18n";

export const SAVE_KEY = "first-id:v1";

/** `example` is set while an example (Maria) is on screen; the person's own
 *  answers wait in `own` and come back when they tap "Find my path". */
export interface Saved extends Answers { mode: Mode; lang: Lang; example: boolean; own: Answers | null }

const MODES: readonly Mode[] = ["cheapest", "fewestTrips", "fastest"];

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** A list of strings, keeping only the ones `known` allows; undefined if it isn't a list. */
function list(v: unknown, known?: (id: string) => boolean): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.filter((x): x is string => typeof x === "string" && (!known || known(x)));
}

function facts(v: unknown): Facts | undefined {
  if (!isObject(v)) return undefined;
  const out: Facts = {};
  for (const [k, x] of Object.entries(v)) {
    if (typeof x === "boolean" || typeof x === "string" || (typeof x === "number" && isFinite(x))) out[k] = x;
  }
  return out;
}

/** Reads the saved answers. Never throws; returns only fields of the right shape. */
export function readSaved(raw: string | null, rules: RuleSet): Partial<Saved> {
  let v: unknown;
  try { v = JSON.parse(raw ?? "{}"); } catch { return {}; }
  if (!isObject(v)) return {};

  const isDoc = (id: string) => Object.prototype.hasOwnProperty.call(rules.docs, id);
  const actionIds = new Set(rules.actions.map((a) => a.id));
  const isAction = (id: string) => actionIds.has(id);
  const answers = (a: Record<string, unknown>): Answers => ({
    have: list(a.have, isDoc) ?? [],
    facts: facts(a.facts) ?? {},
    unsure: list(a.unsure) ?? [],
    answered: a.answered === true,
    skip: list(a.skip, isAction) ?? [],
  });

  const out: Partial<Saved> = {};
  if (v.lang === "en" || v.lang === "es") out.lang = v.lang;
  if (MODES.includes(v.mode as Mode)) out.mode = v.mode as Mode;
  const have = list(v.have, isDoc); if (have) out.have = have;
  const f = facts(v.facts); if (f) out.facts = f;
  const unsure = list(v.unsure); if (unsure) out.unsure = unsure;
  const skip = list(v.skip, isAction); if (skip) out.skip = skip;
  if (typeof v.answered === "boolean") out.answered = v.answered;
  if (typeof v.example === "boolean") out.example = v.example;
  if (v.own === null) out.own = null;
  else if (isObject(v.own)) out.own = answers(v.own);
  return out;
}

/** Forgets the saved answers: the crash page's "Start over" really starts over. */
export function clearSaved(): void {
  try { sessionStorage.removeItem(SAVE_KEY); } catch { /* storage blocked: nothing was kept */ }
}
