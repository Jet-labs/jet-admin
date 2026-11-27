export const APPLICATION_STATE_TYPES = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "null",
];

export function formatApplicationStateDefault(value) {
  if (value === null) return "null";
  if (value !== null && typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  }
  return String(value);
}

export function parseApplicationStateDefault(type, text) {
  const raw = typeof text === "string" ? text : "";
  switch (type) {
    case "string":
      return { ok: true, value: raw };
    case "number": {
      if (!raw.trim()) return { ok: false, error: "Enter a number." };
      const value = Number(raw);
      return Number.isFinite(value)
        ? { ok: true, value }
        : { ok: false, error: "Enter a finite number." };
    }
    case "boolean": {
      const normalized = raw.trim().toLowerCase();
      if (normalized === "true") return { ok: true, value: true };
      if (normalized === "false") return { ok: true, value: false };
      return { ok: false, error: "Enter true or false." };
    }
    case "null":
      return { ok: true, value: null };
    case "object":
    case "array": {
      try {
        const value = JSON.parse(raw || (type === "object" ? "{}" : "[]"));
        if (type === "object") {
          if (!value || typeof value !== "object" || Array.isArray(value)) {
            return { ok: false, error: "Enter a JSON object." };
          }
        } else if (!Array.isArray(value)) {
          return { ok: false, error: "Enter a JSON array." };
        }
        return { ok: true, value };
      } catch {
        return {
          ok: false,
          error: type === "object" ? "Enter a JSON object." : "Enter a JSON array.",
        };
      }
    }
    default:
      return { ok: false, error: "Unsupported application variable type." };
  }
}
