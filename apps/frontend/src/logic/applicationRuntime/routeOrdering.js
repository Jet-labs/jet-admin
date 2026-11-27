/**
 * Pure route-order helpers for Application Studio.
 *
 * The routes array is the source of order. Navigation is a filtered view of
 * that array and follows it whenever routes are reordered; homeRouteID stays
 * sticky so drag-and-drop never silently changes the application entry point.
 */

function alignNavigation(definition) {
  const order = new Map(
    definition.routes.map((route, index) => [route.id, index])
  );
  definition.shell.navigation = [...definition.shell.navigation].sort(
    (left, right) =>
      (order.get(left.routeID) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(right.routeID) ?? Number.MAX_SAFE_INTEGER)
  );
}

export function moveApplicationRoute(
  definition,
  sourceID,
  targetID,
  position = "before"
) {
  if (!definition || sourceID === targetID) return null;
  const sourceIndex = definition.routes.findIndex(
    (route) => route.id === sourceID
  );
  if (sourceIndex === -1) return null;

  const next = structuredClone(definition);
  const [moved] = next.routes.splice(sourceIndex, 1);
  let targetIndex = next.routes.findIndex((route) => route.id === targetID);
  if (targetIndex === -1) return null;
  if (position === "after") targetIndex += 1;
  next.routes.splice(targetIndex, 0, moved);

  const before = definition.routes.map((route) => route.id);
  const after = next.routes.map((route) => route.id);
  if (before.length === after.length && before.every((id, index) => id === after[index])) {
    return null;
  }

  alignNavigation(next);
  return next;
}

export function moveApplicationRouteByOffset(definition, routeID, offset) {
  const index = definition?.routes?.findIndex((route) => route.id === routeID) ?? -1;
  const target = index === -1 ? null : definition.routes[index + offset];
  if (!target) return null;
  return moveApplicationRoute(
    definition,
    routeID,
    target.id,
    offset < 0 ? "before" : "after"
  );
}

export function shouldRedirectToHome(routes, relativePath, homeRouteID) {
  if (!Array.isArray(routes) || relativePath !== "/") return false;
  // A real root route is a reachable application view and always wins.
  if (routes.some((route) => route.path === "/")) return false;
  const home = routes.find((route) => route.id === homeRouteID);
  return Boolean(home && home.path !== "/");
}
