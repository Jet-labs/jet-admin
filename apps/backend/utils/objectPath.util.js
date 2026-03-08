const BLOCKED_PATH_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

function normalizePath(path, allowedRoots = []) {
  if (typeof path !== "string") return "";

  let cleanPath = path.trim().replace(/\?\./g, ".");

  while (cleanPath.startsWith(".")) {
    cleanPath = cleanPath.slice(1);
  }

  for (const root of allowedRoots) {
    if (cleanPath === root) return "";
    if (cleanPath.startsWith(`${root}.`)) return cleanPath.slice(root.length + 1);
    if (cleanPath.startsWith(`${root}[`)) return cleanPath.slice(root.length);
  }

  return cleanPath;
}

function readBracketToken(path, startIndex) {
  let cursor = startIndex + 1;

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

  const endIndex = path.indexOf("]", cursor);
  if (endIndex === -1) return null;

  const token = path.slice(cursor, endIndex).trim();
  if (!/^(0|[1-9][0-9]*)$/.test(token)) return null;

  return {
    token: Number(token),
    nextIndex: endIndex + 1,
  };
}

function tokenizeObjectPath(path, { allowedRoots = [] } = {}) {
  const cleanPath = normalizePath(path, allowedRoots);
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

function getValueByPath(target, path, options = {}) {
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

module.exports = {
  BLOCKED_PATH_SEGMENTS,
  tokenizeObjectPath,
  getValueByPath,
};