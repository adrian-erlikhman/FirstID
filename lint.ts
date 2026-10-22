import { docsIn } from "./expr";
import type { Expr, RuleSet } from "./types";

/**
 * Checks the rules file before it ships. Runs in CI, so a typo in a document id
 * or a missing source fails the build instead of giving someone a wrong plan.
 */
export function lint(rules: RuleSet): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  const negatesDoc = (e: Expr): boolean =>
    "not" in e ? docsIn(e.not).length > 0 || negatesDoc(e.not)
    : "all" in e ? e.all.some(negatesDoc)
    : "any" in e ? e.any.some(negatesDoc)
    : false;

  if (!rules.docs[rules.goal]) errors.push(`goal "${rules.goal}" is not a known document`);

  for (const a of rules.actions) {
    if (ids.has(a.id)) errors.push(`duplicate action id ${a.id}`);
    ids.add(a.id);
    if (!rules.places[a.place]) errors.push(`${a.id}: unknown place "${a.place}"`);
    if (!a.sources.length) errors.push(`${a.id}: no source. Every rule needs one.`);
    for (const s of a.sources) if (!rules.sources[s]) errors.push(`${a.id}: unknown source "${s}"`);
    for (const d of [...a.produces, ...docsIn(a.requires), ...(a.eligible ? docsIn(a.eligible) : [])])
      if (!rules.docs[d]) errors.push(`${a.id}: unknown document "${d}"`);
    // The planner's guarantee ("more documents never makes your plan worse")
    // only holds if no rule says "you must NOT have document X".
    if (negatesDoc(a.requires) || (a.eligible && negatesDoc(a.eligible)))
      errors.push(`${a.id}: requirements may not negate a document`);
    for (const w of a.waivers ?? []) {
      if (negatesDoc(w.if)) errors.push(`${a.id}: waiver may not negate a document`);
      if (w.dollars > a.dollars) errors.push(`${a.id}: waiver costs more than the base fee`);
      for (const s of w.sources) if (!rules.sources[s]) errors.push(`${a.id}: waiver has unknown source "${s}"`);
    }
    if (!a.label.es) errors.push(`${a.id}: missing Spanish label`);
    for (const [field, text] of [["why", a.why], ["say", a.say], ...(a.waivers ?? []).map((w) => ["waiver say", w.say] as const)] as const)
      if (text && (!text.en || !text.es)) errors.push(`${a.id}: ${field} needs both English and Spanish`);
    for (const b of a.bring ?? []) if (!b.en || !b.es) errors.push(`${a.id}: every "bring" line needs both languages`);
  }
  for (const [id, s] of Object.entries(rules.sources)) {
    if (!/^https:\/\//.test(s.url)) errors.push(`source ${id}: url must be https`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checked)) errors.push(`source ${id}: checked date must be YYYY-MM-DD`);
    if (s.quote.split(/\s+/).length > 30) errors.push(`source ${id}: quote too long, keep it under 30 words`);
  }
  return errors;
}
