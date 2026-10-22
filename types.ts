// The shared contract. Rules data, the planner and the UI all speak these types.
// Change this file only with the whole team: every module depends on it.

export type DocId = string;    // a document or status the person can hold, e.g. "birth_cert_ca"
export type PlaceId = string;  // where an action happens, e.g. "dmv", "rrcc_counter", "mail"
export type SourceId = string; // key into sources.json

/** Facts are things that are true about the person. They never change during a plan. */
export type Facts = Record<string, boolean | number | string>;

/**
 * A requirement is a small boolean expression over documents the person holds
 * and facts about them. Kept as plain JSON so the rules file stays readable
 * and every rule can be checked against its source by a person.
 */
export type Expr =
  | { doc: DocId }
  | { fact: string; eq?: boolean | number | string; gte?: number; lt?: number }
  | { all: Expr[] }
  | { any: Expr[] }
  | { not: Expr };

/** A fee override, e.g. "$0 with a signed DL 933". The cheapest one that applies wins. */
export interface Waiver {
  if: Expr;
  dollars: number;
  label: { en: string; es: string };
  sources: SourceId[];
  /** What to say at the counter when this waiver applies. Replaces the action's own `say`. */
  say?: { en: string; es: string };
}

export interface Action {
  id: string;
  label: { en: string; es: string };
  place: PlaceId;
  /** Must already be true before this step can happen. */
  requires: Expr;
  /** Who this path is open to at all (age, birthplace, housing status...). Defaults to everyone. */
  eligible?: Expr;
  produces: DocId[];
  dollars: number;
  waivers?: Waiver[];
  /** Typical days until the step's output is in hand (0 = same visit). */
  days: number;
  /** What to bring, shown on the step card and the printed packet. */
  bring?: { en: string; es: string }[];
  /** One or two plain sentences: why this step is allowed. Shown above the sources. */
  why?: { en: string; es: string };
  /** A sentence the person can say at the counter. */
  say?: { en: string; es: string };
  sources: SourceId[];
  /** false = we could not confirm this from a primary source. Shown as "call ahead". */
  verified: boolean;
}

export interface Source {
  id: SourceId;
  title: string;
  url: string;
  quote: string;   // short excerpt that supports the rule, under 25 words
  checked: string; // ISO date a person last checked it
}

export interface Place {
  label: { en: string; es: string };
  /** false for mail, phone or online steps: they don't cost a trip. */
  inPerson: boolean;
}

export interface Doc {
  label: { en: string; es: string };
  /** Shown on the intake checklist ("Do you have this?"). */
  askAtIntake: boolean;
}

export interface RuleSet {
  version: string;
  goal: DocId;
  docs: Record<DocId, Doc>;
  places: Record<PlaceId, Place>;
  actions: Action[];
  sources: Record<SourceId, Source>;
}

export interface Person {
  facts: Facts;
  have: DocId[];
}

export interface Cost {
  dollars: number;
  trips: number;
  days: number;
  steps: number;
}

export type Mode = "cheapest" | "fewestTrips" | "fastest";

export interface Step {
  action: Action;
  dollars: number;          // after the best waiver
  waiver?: Waiver;          // which waiver applied, if any
  newTrip: boolean;         // false when it happens on the same visit as the previous step
  startDay: number;
  endDay: number;
}

export interface Plan {
  steps: Step[];
  total: Cost;
  mode: Mode;
  /** Every step is backed by a verified source. */
  allVerified: boolean;
}
