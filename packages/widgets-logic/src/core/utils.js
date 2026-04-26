/**
 * Utility functions for widget data mapping.
 * 
 * These are pure JavaScript helpers with no React or UI dependencies.
 */

/**
 * Safely resolve a dot-notated path against an object.
 * Handles bracket notation: "arr[0].name" → "arr.0.name"
 * 
 * @param {object} obj - Root object
 * @param {string} path - Dot-notated path like "orders.data[0].name"
 * @returns {*} Resolved value or undefined
 */
export const getByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  const normalized = path.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalized.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};
