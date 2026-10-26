// Documents a person holds without ticking them separately.
import type { Facts } from "./engine/types";

/** A California ID from the last five years also means the DMV has a record of you. */
export const withImplied = (have: string[]) =>
  have.includes("old_ca_id_5yr") && !have.includes("dmv_record") ? [...have, "dmv_record"] : have;

/** Rows on the Have screen that aren't papers: a number you know and a card you
 *  had before. "None of these" clears the papers and keeps these. */
export const NOT_PAPERS = ["ssn_known", "dmv_record"];

export const clearPapers = (have: string[]) => have.filter((id) => NOT_PAPERS.includes(id));

/** The rules can't pick a birth certificate office without a birthplace, so
 *  "Show my path" waits for that answer. */
export const readyForPath = (facts: Facts) => facts.born !== undefined;
