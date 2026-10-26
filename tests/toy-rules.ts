// A toy rule set for testing the planner's mechanics only. These are not real
// California rules. The real ones live in data/rules.json with sources.
import type { RuleSet } from "../src/engine/types";

const L = (en: string) => ({ en, es: en });
const src = ["toy"];

export const toy: RuleSet = {
  version: "toy",
  goal: "id",
  docs: {
    id: { label: L("ID"), askAtIntake: false },
    cert: { label: L("Birth certificate"), askAtIntake: true },
    sworn: { label: L("Notarized statement"), askAtIntake: false },
    waiver_form: { label: L("Fee waiver form"), askAtIntake: false },
    old_id: { label: L("Old ID on file"), askAtIntake: true },
  },
  places: {
    office: { label: L("ID office"), inPerson: true },
    notary: { label: L("Notary"), inPerson: true },
    shelter: { label: L("Shelter"), inPerson: true },
    mail: { label: L("Mail"), inPerson: false },
  },
  sources: { toy: { id: "toy", title: "Toy", url: "https://example.org", quote: "toy", checked: "2026-10-18" } },
  actions: [
    { id: "apply", label: L("Apply for ID"), place: "office", requires: { doc: "cert" }, produces: ["id"], dollars: 40,
      waivers: [{ if: { doc: "waiver_form" }, dollars: 0, label: L("No fee"), sources: src }], days: 14, sources: src, verified: true },
    { id: "replace", label: L("Replace old ID"), place: "office", requires: { doc: "old_id" }, produces: ["id"], dollars: 40,
      waivers: [{ if: { doc: "waiver_form" }, dollars: 0, label: L("No fee"), sources: src }], days: 14, sources: src, verified: true },
    { id: "cert_counter", label: L("Get certificate at counter"), place: "office", requires: { doc: "id" }, produces: ["cert"], dollars: 30, days: 0, sources: src, verified: true },
    { id: "notarize", label: L("Notarize with witnesses"), place: "notary", requires: { fact: "hasWitnesses" }, produces: ["sworn"], dollars: 15, days: 0, sources: src, verified: true },
    { id: "cert_mail", label: L("Order certificate by mail"), place: "mail", requires: { doc: "sworn" }, eligible: { fact: "bornHere" }, produces: ["cert"], dollars: 30,
      waivers: [{ if: { fact: "unhoused" }, dollars: 0, label: L("Free if unhoused"), sources: src }], days: 30, sources: src, verified: true },
    { id: "waiver", label: L("Shelter signs fee waiver"), place: "shelter", requires: { fact: "unhoused" }, produces: ["waiver_form"], dollars: 0, days: 0, sources: src, verified: false },
  ],
};
