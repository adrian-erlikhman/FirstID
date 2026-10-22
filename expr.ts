import type { Expr, Facts, DocId } from "./types";

/** Evaluate a requirement against the documents held and the person's facts. */
export function holds(e: Expr, have: ReadonlySet<DocId>, facts: Facts): boolean {
  if ("doc" in e) return have.has(e.doc);
  if ("fact" in e) {
    const v = facts[e.fact];
    if (e.eq !== undefined) return v === e.eq;
    if (e.gte !== undefined) return typeof v === "number" && v >= e.gte;
    if (e.lt !== undefined) return typeof v === "number" && v < e.lt;
    return v === true;
  }
  if ("all" in e) return e.all.every((x) => holds(x, have, facts));
  if ("any" in e) return e.any.some((x) => holds(x, have, facts));
  if ("not" in e) return !holds(e.not, have, facts);
  throw new Error(`Unknown expression: ${JSON.stringify(e)}`);
}

/** Every document id an expression mentions. Used by the rules linter. */
export function docsIn(e: Expr): DocId[] {
  if ("doc" in e) return [e.doc];
  if ("all" in e) return e.all.flatMap(docsIn);
  if ("any" in e) return e.any.flatMap(docsIn);
  if ("not" in e) return docsIn(e.not);
  return [];
}
