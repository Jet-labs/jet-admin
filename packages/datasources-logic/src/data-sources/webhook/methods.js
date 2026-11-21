export function normalizeAllowedMethods(value) {
  const raw = Array.isArray(value) ? value : String(value ?? "POST").split(/[,\s]+/);
  const methods = raw
    .map((m) => String(m || "").trim().toUpperCase())
    .filter(Boolean);
  return methods.length > 0 ? methods : ["POST"];
}
