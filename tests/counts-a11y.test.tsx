// Animated numbers and screen readers. The home page's counts start at 0 and
// only count up once the grid scrolls into view, and the path card's totals
// glide between values when the sort changes. A screen reader can reach either
// at any moment, so it must read the final number, never a frame of the
// animation. These render the real components as HTML, before any animation
// has run: the state a screen reader meets on arrival.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import rulesJson from "../data/rules.json";
import { Counted, PathCard, money } from "../src/components";
import { plan } from "../src/engine/planner";
import type { RuleSet } from "../src/engine/types";
import { Bento, waiverKinds } from "../src/screens/HomeParts";
import { personas } from "./personas";

const rules = rulesJson as unknown as RuleSet;
const maria = plan(rules, personas.maria)!;
const read = (final: string) => `<span class="sr-only">${final}</span>`;

describe("animated numbers read their final value", () => {
  it("Counted shows the moving number and reads the final one", () => {
    const html = renderToStaticMarkup(<Counted shown="$0" final="$15" />);
    expect(html).toBe(`<span aria-hidden="true">$0</span>${read("$15")}`);
  });

  it("the home page's counts read their real values before they have counted up", () => {
    const html = renderToStaticMarkup(<Bento rules={rules} lang="en" maria={maria} />);
    expect(html).toContain(`<span aria-hidden="true">${money(0)}</span>${read(money(maria.total.dollars))}`);
    expect(html).toContain(read(String(waiverKinds(rules))));
    expect(html).toContain(read(String(rules.actions.length)));
    expect(html).not.toContain(read(money(0)));
  });

  it("the path card's totals read their values too", () => {
    const html = renderToStaticMarkup(<PathCard plan={maria} lang="en" mode="cheapest" />);
    expect(html).toContain(read(money(maria.total.dollars)));
    expect(html).toContain(read(String(maria.total.steps)));
  });
});
