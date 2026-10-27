import type { Facts } from "./engine/types";

/** One set of answers. `skip` lists the steps the person said they can't do. */
export interface Answers { have: string[]; facts: Facts; unsure: string[]; answered: boolean; skip: string[] }

export const BLANK: Answers = { have: [], facts: {}, unsure: [], answered: false, skip: [] };

/**
 * Opening an example (Maria) sets the person's own answers aside instead of
 * overwriting them. If an example is already on screen, what is set aside
 * stays the person's, never the example's. Nothing answered yet: nothing to keep.
 */
export function setAside(showingExample: boolean, own: Answers | null, current: Answers): Answers | null {
  if (showingExample) return own;
  return current.answered || current.have.length ? current : null;
}

/** "Find my path" after an example: the person's own answers, or a blank start. */
export function restoreOwn(own: Answers | null): Answers {
  return own ?? BLANK;
}
