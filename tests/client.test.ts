// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { apply } from "../src/client/index.tsx";

/** Minimal client context: slots, locale and effects. */
function fakeContext() {
  const slots: string[] = [];
  const effects: string[] = [];
  return {
    slots,
    effects,
    slotsApi: {
      register(definition: { name: string }) {
        slots.push(definition.name);
        return () => {};
      },
      inject(_name: string, factory: () => unknown) {
        return factory();
      },
    },
    locale: {
      register() {
        return () => {};
      },
      bind() {
        return (key: string) => key;
      },
    },
    effect(run: () => void, label: string) {
      effects.push(label);
      run();
      return () => {};
    },
  };
}

describe("client half", () => {
  it("registers the navigation entry and the page", () => {
    const ctx = fakeContext();
    apply({ ...ctx, slots: ctx.slotsApi, locale: ctx.locale, effect: ctx.effect });
    expect(ctx.slots).toContain("sidebar.panellist");
    expect(ctx.slots).toContain("main");
  });
});
