import { resolveValue } from "../evaluationEngine";

/**
 * Evaluate an application route guard. Guards fail closed: only a literal
 * boolean true admits the route. A guard expression may be a bare expression
 * (`state.application.variables.allowed`) or already templated.
 */
export function evaluateApplicationRouteGuard(guard, expressionContext) {
  if (!guard?.expression) return true;
  const raw = String(guard.expression).trim();
  if (!raw) return true;
  const template = raw.includes("{{") ? raw : `{{ ${raw} }}`;
  try {
    return resolveValue(template, expressionContext || {}) === true;
  } catch {
    return false;
  }
}

export function applicationRouteGuardRedirect(route, routes, expressionContext) {
  if (!route?.guard) return null;
  if (evaluateApplicationRouteGuard(route.guard, expressionContext)) return null;
  return (
    routes.find((candidate) => candidate.id === route.guard.redirectRouteID) ||
    null
  );
}
