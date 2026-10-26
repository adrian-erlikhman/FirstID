// Many made-up answer sets, built the way the app builds a person: every
// answer to the seven questions (yes, no or "Not sure" for the yes/no ones,
// one age per band) times a few common sets of papers. Used by the tests that
// must hold for anyone, not just the named personas.
import type { DocId, Facts, Person } from "../src/engine/types";
import { withImplied } from "../src/person";

export const BORN = ["la_county", "california", "us_state", "abroad"] as const;
const AGES = [16, 19, 30, 62]; // one per band on the questions screen
const YES_NO = ["unhoused", "fireSurvivor", "hasWitnesses", "publicAssistance", "fosterYouth"];
const ANSWERS = [true, false, undefined]; // undefined = "Not sure"

export const PAPER_SETS: DocId[][] = [
  [],
  ["ssn_known"],
  ["medi_cal_card", "ssn_known"],
  ["ssn_known", "residency_doc"],
  ["birth_cert_ca", "ssn_known", "residency_doc"],
  ["dmv_record"],
];

/** Every answer set for one birthplace, with each paper set. */
export function* people(born: (typeof BORN)[number], papers: DocId[][] = PAPER_SETS): Generator<Person> {
  for (const age of AGES)
    for (let m = 0; m < ANSWERS.length ** YES_NO.length; m++)
      for (const have of papers) {
        const facts: Facts = { born, age };
        let k = m;
        for (const f of YES_NO) {
          const v = ANSWERS[k % ANSWERS.length];
          k = Math.floor(k / ANSWERS.length);
          if (v !== undefined) facts[f] = v;
        }
        yield { facts, have: withImplied(have) };
      }
}
