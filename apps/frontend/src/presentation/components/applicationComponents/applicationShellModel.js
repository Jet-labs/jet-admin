export const APPLICATION_SHELL_DEFAULT_APPEARANCE = Object.freeze({
  variant: "pills",
  size: "md",
  width: 220,
  collapsedWidth: 64,
  collapsible: true,
  defaultCollapsed: false,
  sticky: true,
  position: "start",
  align: "start",
  showLabels: true,
  showIcons: true,
  showBranding: true,
});

export const APPLICATION_SHELL_KIND_VALUES = Object.freeze([
  "sidebar",
  "topbar",
  "bottom-bar",
  "hamburger",
]);

export function normalizeApplicationShell(shell, appTitle = "") {
  const rawKind = shell?.kind === "header" ? "topbar" : shell?.kind;
  return {
    kind: APPLICATION_SHELL_KIND_VALUES.includes(rawKind) ? rawKind : "sidebar",
    homeRouteID: shell?.homeRouteID || null,
    notFoundRouteID: shell?.notFoundRouteID || null,
    navigation: Array.isArray(shell?.navigation) ? shell.navigation : [],
    appearance: {
      ...APPLICATION_SHELL_DEFAULT_APPEARANCE,
      ...(shell?.appearance || {}),
    },
    branding: {
      title: shell?.branding?.title || appTitle || "",
      subtitle: shell?.branding?.subtitle || "",
    },
  };
}

export function normalizeApplicationNavigationItem(item, index = 0) {
  return {
    routeID: item?.routeID,
    label: item?.label || item?.routeID || `Item ${index + 1}`,
    icon: item?.icon || "dot",
    group: item?.group || "",
    badge: item?.badge || "",
    hidden: item?.hidden === true,
  };
}
