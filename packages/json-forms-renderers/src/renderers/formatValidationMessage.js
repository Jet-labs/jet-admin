/**
 * Convert raw JSON-Schema/Ajv validation strings into concise, human copy.
 * Raw messages such as "must NOT have fewer than 1 characters" are
 * developer-facing and must never be the primary copy shown to end users.
 */
export function formatValidationMessage(rawMessage) {
  if (rawMessage === null || rawMessage === undefined) return "";
  const text = String(rawMessage).trim();
  if (!text) return "";

  const minLength = text.match(/must NOT have fewer than (\d+) characters?/i);
  if (minLength) {
    const count = Number(minLength[1]);
    return `Must be at least ${count} ${count === 1 ? "character" : "characters"}.`;
  }

  const maxLength = text.match(/must NOT have more than (\d+) characters?/i);
  if (maxLength) {
    const count = Number(maxLength[1]);
    return `Must be at most ${count} ${count === 1 ? "character" : "characters"}.`;
  }

  if (/must have required property|is a required property/i.test(text)) {
    return "This field is required.";
  }
  if (/must be integer/i.test(text)) return "Enter a whole number.";
  if (/must be number/i.test(text)) return "Enter a number.";
  if (/must be string/i.test(text)) return "Enter a text value.";
  if (/must be equal to one of the allowed values|must be one of/i.test(text)) {
    return "Choose a valid option.";
  }
  if (/must match format ["']?email["']?/i.test(text)) {
    return "Enter a valid email address.";
  }
  if (/must match format ["']?(uri|url)["']?/i.test(text)) {
    return "Enter a valid URL.";
  }

  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}
