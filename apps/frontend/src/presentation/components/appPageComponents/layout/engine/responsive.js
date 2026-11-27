/**
 * responsive.js
 *
 * Shared breakpoint helpers for per-node responsive overrides.
 *
 * A node may carry a `responsive` object shaped like:
 *   {
 *     tablet: { span?: 1..12, direction?: 'horizontal' | 'vertical', hidden?: boolean },
 *     mobile: { span?: 1..12, direction?: 'horizontal' | 'vertical', hidden?: boolean }
 *   }
 *
 * Desktop always uses the node's base props. Mobile defaults to a full-width
 * span (12) so legacy layouts keep stacking on small screens even without an
 * explicit override; tablet inherits the base span.
 */

export const BREAKPOINT_TIERS = ["desktop", "tablet", "mobile"];

export const BREAKPOINT_LABELS = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

export const getBreakpointTier = (width) => {
  if (!Number.isFinite(width)) return "desktop";
  if (width <= 640) return "mobile";
  if (width <= 1023) return "tablet";
  return "desktop";
};

export const clampSpan = (value, fallback = 12) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(12, Math.round(parsed)));
};

export const getResponsiveOverride = (responsive, tier) => {
  if (!responsive || tier === "desktop") return null;
  return responsive[tier] || null;
};

export const resolveResponsiveSpan = (baseSpan, responsive, tier) => {
  const override = getResponsiveOverride(responsive, tier);
  if (override?.span != null && override.span !== "") {
    return clampSpan(override.span, 12);
  }
  if (tier === "mobile") return 12;
  return clampSpan(baseSpan, 12);
};

export const resolveResponsiveDirection = (baseDirection, responsive, tier) => {
  const override = getResponsiveOverride(responsive, tier);
  if (override?.direction === "horizontal" || override?.direction === "vertical") {
    return override.direction;
  }
  return baseDirection || "vertical";
};

export const isResponsiveHidden = (responsive, tier) =>
  Boolean(getResponsiveOverride(responsive, tier)?.hidden);

export const sanitizeResponsive = (responsive) => {
  if (!responsive || typeof responsive !== "object") return null;
  const next = {};
  for (const tier of ["tablet", "mobile"]) {
    const entry = responsive[tier];
    if (!entry || typeof entry !== "object") continue;
    const clean = {};
    if (entry.span != null && entry.span !== "") clean.span = clampSpan(entry.span, 12);
    if (entry.direction === "horizontal" || entry.direction === "vertical") {
      clean.direction = entry.direction;
    }
    if (entry.hidden) clean.hidden = true;
    if (Object.keys(clean).length) next[tier] = clean;
  }
  return Object.keys(next).length ? next : null;
};
