/**
 * Widget titles are user-authored, but imported/demo fixtures sometimes use
 * machine identifiers (e.g. `QA_062058_ALERT`). Never surface those as the
 * primary user-facing name when a readable widget-type label is available.
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALL_CAPS_ID_PATTERN = /^[A-Z0-9]+(?:_[A-Z0-9]+){2,}$/;

export const isInternalEntityName = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) || ALL_CAPS_ID_PATTERN.test(trimmed);
};

export const getWidgetDisplayName = ({ widgetTitle, widgetTypeLabel } = {}) => {
  const title = typeof widgetTitle === "string" ? widgetTitle.trim() : "";
  if (!title || isInternalEntityName(title)) {
    return widgetTypeLabel || "Untitled widget";
  }
  return title;
};
