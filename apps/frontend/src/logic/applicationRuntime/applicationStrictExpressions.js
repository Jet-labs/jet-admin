import {
  resolveCompositionConfig,
  resolveCompositionValue,
} from "./compositionRuntime";

/**
 * Strict expression mode for deployed applications that opt in with
 * definition.expressionMode = "safe-path". It reuses the composition
 * resolver: path-only state reads, no JavaScript execution, fail-closed
 * visibility.
 */
export function strictResolveValue(value, stateTree) {
  return resolveCompositionValue(value, stateTree);
}

export function strictResolveConfig(value, stateTree) {
  return resolveCompositionConfig(value, stateTree);
}

export function strictEvaluateVisibility(condition, stateTree) {
  if (typeof condition !== "string" || !condition.trim()) {
    return { visible: true };
  }
  try {
    return { visible: resolveCompositionValue(condition, stateTree) === true };
  } catch {
    return { visible: false, error: "Strict expression evaluation failed." };
  }
}
