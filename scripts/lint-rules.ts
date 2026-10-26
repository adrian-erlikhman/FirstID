// npm run lint:rules: fails if data/rules.json has a broken rule.
import { readFileSync } from "node:fs";
import { lint } from "../src/engine/lint";
import type { RuleSet } from "../src/engine/types";

const rules: RuleSet = JSON.parse(readFileSync(new URL("../data/rules.json", import.meta.url), "utf8"));
const errors = lint(rules);
const unverified = rules.actions.filter((a) => !a.verified).map((a) => a.id);

if (unverified.length) console.warn(`call-ahead (unverified) rules: ${unverified.join(", ")}`);
if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`rules ${rules.version}: ${rules.actions.length} actions, ${Object.keys(rules.sources).length} sources, all checks pass`);
