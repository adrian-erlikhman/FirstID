// OWNER: Michael. Invented people (no real names, addresses or numbers) that
// cover the main ways someone ends up without ID. Each one's plan is worked out
// BY HAND from the sources first, then written into personas.test.ts. If the
// planner ever disagrees with the hand-worked plan, one of them is wrong, and
// we find out which before a real person does.
import type { Person } from "../src/engine/types";

export const personas: Record<string, Person & { story: string }> = {
  maria: {
    story: "34, born in LA County, lost her wallet and papers, staying in a shelter. Has her Medi-Cal card and knows her Social Security number.",
    facts: { born: "la_county", age: 34, unhoused: true, hasWitnesses: true },
    have: ["medi_cal_card", "ssn_known"],
  },
  maria_had_id: {
    story: "Maria again, but she had a California ID ten years ago.",
    facts: { born: "la_county", age: 34, unhoused: true, hasWitnesses: true },
    have: ["medi_cal_card", "ssn_known", "dmv_record"],
  },
  deshawn: {
    story: "18, still in extended foster care in LA County. The county never gave him his documents. Has a placement letter with his address.",
    facts: { born: "la_county", age: 18, fosterYouth: true, hasWitnesses: true },
    have: ["residency_doc"],
  },
  luis: {
    story: "41, released from LA County jail last month, born in Texas, staying in a shelter, knows his Social Security number, had a California ID years ago.",
    facts: { born: "us_state", age: 41, unhoused: true, hasWitnesses: false },
    have: ["ssn_known", "dmv_record"],
  },
  jayden: {
    story: "16, a LACES student getting a first ID. His parent has his birth certificate and a utility bill.",
    facts: { born: "la_county", age: 16, hasWitnesses: true },
    have: ["birth_cert_ca", "ssn_known", "residency_doc"],
  },
};
