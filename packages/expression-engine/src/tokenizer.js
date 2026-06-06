/**
 * tokenizer.js — Object-path tokenization and safe value traversal.
 *
 * Parses dot/bracket notation paths like:
 *   ctx.items[0]["user-name"]
 *   state.queries.get_users.data
 *   args.filters[0].value
 *
 * Handles:
 *   • Dot-separated identifiers
 *   • Numeric bracket indices: [0], [42]
 *   • Quoted bracket keys:     ["user-name"], ['key with spaces']
 *   • Optional chaining:       ctx?.input?.id  →  normalized to ctx.input.id
 *   • Allowed-root enforcement: only traverse if the root matches (e.g. "ctx", "state")
 *
 * Security:
 *   • Blocks __proto__, prototype, constructor traversal
 *   • Returns null/undefined on malformed paths (never throws)
 *
 * Ported from packages/template-engine/src/tokenizer.js — canonical implementation.
 */

// ─── Security blocklist ───────────────────────────────────────────────────────

/** Path segments that must never be traversed (prototype pollution prevention). */
export const BLOCKED_PATH_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

// ─── Path normalization ───────────────────────────────────────────────────────

/**
 * Normalize and validate a raw path string against allowed roots.
 *
 * - Strips optional chaining `?.` → `.`
 * - Strips leading dots
 * - If `allowedRoots` is non-empty, verifies the path starts with one of
 *   the allowed roots and strips the root prefix from the returned path.
 *   Returns `null` if no root matches (= unauthorized access).
 *
 * @param {string} path
 * @param {string[]} [allowedRoots]
 * @returns {string|null}  Cleaned path (root stripped), or null if disallowed
 */
export function normalizePath(path, allowedRoots = []) {
  if (typeof path !== "string") return "";

  let cleanPath = path.trim().replace(/\?\./g, ".");

  while (cleanPath.startsWith(".")) {
    cleanPath = cleanPath.slice(1);
  }

  if (allowedRoots.length > 0) {
    for (const root of allowedRoots) {
      if (cleanPath === root) return "";
      if (cleanPath.startsWith(`${root}.`)) return cleanPath.slice(root.length + 1);
      if (cleanPath.startsWith(`${root}[`)) return cleanPath.slice(root.length);
    }

    return null;
  }

  return cleanPath;
}

// ─── Bracket parser ───────────────────────────────────────────────────────────

/**
 * Read a single bracket token starting at `path[startIndex]` which must be `[`.
 *
 * Supports:
 *   [0]           → numeric index
 *   ["key"]       → quoted string key
 *   ['key']       → single-quoted string key
 *
 * @param {string} path
 * @param {number} startIndex
 * @returns {{ token: string|number, nextIndex: number } | null}
 */
function readBracketToken(path, startIndex) {
  let cursor = startIndex + 1;

  // Skip whitespace after `[`
  while (cursor < path.length && path[cursor] === " ") cursor += 1;
  if (cursor >= path.length) return null;

  const quote = path[cursor];
  if (quote === '"' || quote === "'") {
    cursor += 1;
    const valueStart = cursor;

    while (cursor < path.length) {
      if (path[cursor] === quote && path[cursor - 1] !== "\\") break;
      cursor += 1;
    }

    if (cursor >= path.length) return null;

    const token = path.slice(valueStart, cursor);
    cursor += 1;
    while (cursor < path.length && path[cursor] === " ") cursor += 1;
    if (path[cursor] !== "]") return null;

    return { token, nextIndex: cursor + 1 };
  }

  // Numeric index
  const endIndex = path.indexOf("]", cursor);
  if (endIndex === -1) return null;

  const token = path.slice(cursor, endIndex).trim();
  if (!/^(0|[1-9][0-9]*)$/.test(token)) return null;

  return {
    token: Number(token),
    nextIndex: endIndex + 1,
  };
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

/**
 * Tokenize an object path into an array of string/number tokens.
 *
 * @param {string} path          e.g. "ctx.items[0].name"
 * @param {object} [options]
 * @param {string[]} [options.allowedRoots]
 * @returns {Array<string|number>|null}  Tokens, empty array for bare root, or null on failure
 */
export function tokenizeObjectPath(path, { allowedRoots = [] } = {}) {
  const cleanPath = normalizePath(path, allowedRoots);
  if (cleanPath === null) return null;
  if (!cleanPath) return [];

  const tokens = [];
  let cursor = 0;

  while (cursor < cleanPath.length) {
    const char = cleanPath[cursor];

    if (char === ".") {
      cursor += 1;
      continue;
    }

    if (char === "[") {
      const bracketToken = readBracketToken(cleanPath, cursor);
      if (!bracketToken) return null;
      tokens.push(bracketToken.token);
      cursor = bracketToken.nextIndex;
      continue;
    }

    const remainingPath = cleanPath.slice(cursor);
    const identifierMatch = remainingPath.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
    if (!identifierMatch) return null;

    tokens.push(identifierMatch[0]);
    cursor += identifierMatch[0].length;
  }

  return tokens;
}

// ─── Safe value traversal ─────────────────────────────────────────────────────

/**
 * Safely resolve a dot/bracket path against an object.
 *
 * Returns `undefined` for:
 *   • Malformed paths (tokenizer returns null)
 *   • Paths that don't match allowedRoots
 *   • Traversal through null/undefined intermediate values
 *   • Attempts to access __proto__, prototype, constructor
 *
 * @param {object} target        Root object to traverse
 * @param {string} path          Dot/bracket path
 * @param {object} [options]
 * @param {string[]} [options.allowedRoots]
 * @returns {*}
 */
export function getValueByPath(target, path, options = {}) {
  const tokens = tokenizeObjectPath(path, options);
  if (tokens === null) return undefined;

  let current = target;
  for (const token of tokens) {
    if (current === undefined || current === null) return undefined;
    if (typeof token === "string" && BLOCKED_PATH_SEGMENTS.has(token)) {
      return undefined;
    }
    current = current[token];
  }

  return current;
}
