import {
  strictEvaluateVisibility,
  strictResolveConfig,
  strictResolveValue,
} from "../src/logic/applicationRuntime/applicationStrictExpressions";

const state = {
  application: { variables: { allowed: true } },
  route: { id: "risk", params: {}, query: { page: 2 } },
  variables: { search: "open" },
};

describe("strict application expressions", () => {
  it("resolves path-only values and preserves types", () => {
    expect(
      strictResolveValue("{{ state.route.query.page }}", state)
    ).toBe(2);
    expect(
      strictResolveConfig({ label: "{{ state.variables.search }}" }, state)
    ).toEqual({ label: "open" });
  });

  it("rejects JavaScript execution in strict mode", () => {
    expect(strictResolveValue("{{ 1 + 1 }}", state)).toBeUndefined();
    expect(
      strictResolveValue("{{ state.application.variables.allowed ? 'yes' : 'no' }}", state)
    ).toBeUndefined();
  });

  it("fails closed for non-boolean visibility conditions", () => {
    expect(
      strictEvaluateVisibility("{{ state.application.variables.allowed }}", state)
    ).toEqual({ visible: true });
    expect(
      strictEvaluateVisibility("{{ state.route.id === 'other' }}", state)
    ).toEqual({ visible: false });
    expect(strictEvaluateVisibility("", state)).toEqual({ visible: true });
  });
});
