/**
 * embedSafety — shared pure helpers for the safe content/embed boundary
 * (F03; B02/B03/B20; E05/E10/E13 safety requirements).
 *
 * Dependency-free on purpose: unit tests import this module directly and the
 * browser regression page mirrors the message predicates 1:1 (see the
 * frontend browser suite, which also covers the predicates against real
 * Window objects that cannot exist in a node test).
 *
 * Policies:
 * - Sandbox attribute is ALWAYS rendered, including the empty string (B02).
 *   An omitted attribute and `sandbox=""` are not the same: only the latter
 *   keeps every capability locked down.
 * - Capability toggles normalize strictly and fail closed (B02): only real
 *   true values enable a token; "false"/0/"0"/"" fall back to the default.
 * - Markdown disables raw HTML by default: input is escaped first, then
 *   markdown constructs are applied (B03/E05). Link/image URLs must pass the
 *   URL policy or the tag is dropped to bare text.
 * - postMessage reception requires the EXACT sending window
 *   (`event.source === frame.contentWindow`). Sandboxed srcDoc frames have an
 *   opaque origin ("null"), so origin allow-listing is impossible there — the
 *   source check is the gate, plus envelope validation (B20/E13). Unrelated
 *   frames/windows can therefore never impersonate a widget even when they
 *   know its ID.
 */

// ---------------------------------------------------------------------------
// Boolean normalization (consistent across html/iframe/text toggles)
// ---------------------------------------------------------------------------

const TRUE_STRINGS = new Set(["true", "1"]);
const FALSE_STRINGS = new Set(["false", "0", ""]);

/**
 * Strict toggle coercion with fail-closed semantics.
 * - true/1/"true"/"1" (case-insensitive, trimmed) -> true
 * - false/0/"false"/"0" -> false
 * - null/undefined/"" (unset) -> defaultValue
 * - anything else -> false (never enable on ambiguous input)
 */
export const normalizeEmbedBoolean = (value, defaultValue = false) => {
  if (value === null || value === undefined) return !!defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return false;
  }
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if (t === "") return !!defaultValue;
    if (TRUE_STRINGS.has(t)) return true;
    if (FALSE_STRINGS.has(t)) return false;
    return false;
  }
  return false;
};

// ---------------------------------------------------------------------------
// Sandbox attribute construction (always present, even when empty)
// ---------------------------------------------------------------------------

export const EMBED_SANDBOX_TOKENS = Object.freeze([
  "allow-downloads",
  "allow-forms",
  "allow-modals",
  "allow-orientation-lock",
  "allow-pointer-lock",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-presentation",
  "allow-same-origin",
  "allow-scripts",
  "allow-top-navigation",
  "allow-top-navigation-by-user-activation",
  "allow-top-navigation-to-custom-protocols",
]);

const KNOWN_TOKENS = new Set(EMBED_SANDBOX_TOKENS);

/**
 * Build a validated sandbox attribute value. Unknown tokens are dropped.
 * `forbidSameOrigin` (html widget) never emits allow-same-origin: a srcDoc
 * frame with same-origin + scripts escapes the sandbox entirely.
 * ALWAYS returns a string — callers must render it verbatim so the attribute
 * stays present when empty (B02).
 */
export const buildSandboxAttribute = (flags = {}, options = {}) => {
  const { forbidSameOrigin = false } = options;
  const pick = (name, fn) => {
    const on = normalizeEmbedBoolean(flags[name], false);
    if (!on) return null;
    if (name === "allowSameOrigin" && forbidSameOrigin) return null;
    return fn;
  };
  const ordered = [
    pick("allowSameOrigin", "allow-same-origin"),
    pick("allowScripts", "allow-scripts"),
    pick("allowForms", "allow-forms"),
    pick("allowPopups", "allow-popups"),
  ].filter(Boolean);
  return ordered
    .filter((token) => KNOWN_TOKENS.has(token))
    .join(" ");
};

/** Parse a persisted sandbox string back into tokens (unknown dropped). */
export const parseSandboxAttribute = (value) => {
  if (typeof value !== "string") return [];
  return value.split(/\s+/).filter((t) => KNOWN_TOKENS.has(t));
};

// ---------------------------------------------------------------------------
// URL policy (markdown links/images, iframe src)
// ---------------------------------------------------------------------------

const DISALLOWED_SCHEME_RE = /^\s*(javascript|data|vbscript|file|blob)\s*:/i;
const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const ALLOWED_SCHEME_RE = /^(https?:|mailto:|tel:)/i;

/**
 * True for http(s) URLs, protocol-relative and relative references, and
 * mailto:/tel: links. False for empty values and for javascript:/data:/
 * vbscript:/file:/blob: payloads, including whitespace/control-character
 * smuggling (browsers strip ASCII whitespace inside schemes).
 */
export const isAllowedEmbedUrl = (url) => {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const compact = trimmed.replace(/[\x00-\x20]+/g, "");
  if (!compact) return false;
  if (DISALLOWED_SCHEME_RE.test(compact)) return false;
  if (SCHEME_RE.test(compact)) return ALLOWED_SCHEME_RE.test(compact);
  return true;
};

// ---------------------------------------------------------------------------
// HTML escaping + safe Markdown (raw HTML disabled by default)
// ---------------------------------------------------------------------------

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

/** Escape text for insertion into HTML text or double-quoted attributes. */
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"]/g, (ch) => HTML_ESCAPES[ch]);
};

// Placeholders use control characters so emphasis/escaping passes cannot
// match or mangle them (written as escapes: no raw control bytes in source).
const FENCE_PLACEHOLDER = (i) => `\u0000JETF${i}\u0000`;
const CODE_PLACEHOLDER = (i) => `\u0000JETC${i}\u0000`;
const FENCE_RESTORE_RE = /^\u0000JETF(\d+)\u0000$/;
const CODE_RESTORE_RE = /\u0000JETC(\d+)\u0000/g;

// Entity-looking sequences inside a URL mean the author wrote markup that
// only looks safe after one decode round (e.g. &#106;avascript:). Browsers
// decode entities in attributes, so such URLs are dropped to bare text.
const ENTITY_LIKE_RE = /&(#\d+;?|#x[0-9a-f]+;?|[a-z]{2,};)/i;

const replaceLinksAndImages = (escapedText, isImage) => {
  const pattern = isImage
    ? /!\[([^\]]*)\]\(([^)]*)\)/g
    : /\[([^\]]+)\]\(([^)]*)\)/g;
  return escapedText.replace(pattern, (match, text, inner) => {
    // First whitespace-delimited token is the URL; the rest is an optional
    // title (dropped). The URL is entity-escaped already, so attribute
    // breakout via quotes is impossible.
    const token = inner.trim().split(/\s+/)[0] || "";
    if (!token) return text;
    // Gate on the compacted FULL inner content (not the truncated token) so
    // smuggled schemes split by whitespace (java<TAB>script:) or hidden
    // behind entities cannot slip through as an innocent-looking prefix.
    const compactInner = inner.replace(/&amp;/g, "&").replace(/[\x00-\x20]+/g, "");
    if (ENTITY_LIKE_RE.test(compactInner)) return text;
    if (!isAllowedEmbedUrl(compactInner)) return text; // drop tag, keep text
    if (/[\x00-\x20]/.test(token)) return text; // raw whitespace in URL: invalid
    if (!isAllowedEmbedUrl(token.replace(/&amp;/g, "&"))) return text;
    if (isImage) {
      return `<img src="${token}" alt="${text}" class="jet-md-img" />`;
    }
    return `<a href="${token}" target="_blank" rel="noopener noreferrer" class="jet-md-link">${text}</a>`;
  });
};

/**
 * Escape-first Markdown renderer. Supports the same constructs as before
 * (headings, bold/italic/del, code spans/blocks, links, images, lists,
 * blockquotes, hr, paragraphs) but raw HTML in the source can never become
 * markup: the input is escaped before any construct is applied, and URLs
 * pass the embed URL policy.
 */
export const renderMarkdownSafe = (md) => {
  if (md === null || md === undefined) return "";
  let src = typeof md === "string" ? md : String(md);
  if (!src) return "";

  // Fenced code blocks -> placeholders (content escaped, never parsed).
  const fences = [];
  src = src.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const safeLang = /^[a-zA-Z0-9+#-]{1,20}$/.test(lang || "") ? lang : "";
    const body = escapeHtml(code.replace(/\n+$/, "")).trim();
    fences.push(
      `<pre class="jet-md-pre"><code class="jet-md-code${safeLang ? ` language-${safeLang}` : ""}">${body}</code></pre>`
    );
    return FENCE_PLACEHOLDER(fences.length - 1);
  });

  // Inline code spans -> placeholders (content escaped, never parsed).
  const codes = [];
  src = src.replace(/`([^`\n]+)`/g, (match, code) => {
    codes.push(`<code class="jet-md-inline-code">${escapeHtml(code)}</code>`);
    return CODE_PLACEHOLDER(codes.length - 1);
  });

  const inlineFormat = (text) => {
    let out = escapeHtml(text);
    out = replaceLinksAndImages(out, true);
    out = replaceLinksAndImages(out, false);
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/__(.+?)__/g, "<strong>$1</strong>");
    out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
    out = out.replace(/_(.+?)_/g, "<em>$1</em>");
    out = out.replace(/~~(.+?)~~/g, "<del>$1</del>");
    out = out.replace(CODE_RESTORE_RE, (m, i) => codes[Number(i)] ?? m);
    return out;
  };

  const lines = src.split("\n");
  const output = [];
  let inList = null;
  let listBuffer = [];
  const flushList = () => {
    if (inList && listBuffer.length > 0) {
      output.push(`<${inList} class="jet-md-list">${listBuffer.join("")}</${inList}>`);
      listBuffer = [];
      inList = null;
    }
  };

  for (const line of lines) {
    const fence = line.match(FENCE_RESTORE_RE);
    if (fence && fences[Number(fence[1])] !== undefined) {
      flushList();
      output.push(fences[Number(fence[1])]);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      output.push(`<h${level} class="jet-md-h${level}">${inlineFormat(heading[2])}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      flushList();
      output.push('<hr class="jet-md-hr" />');
      continue;
    }
    if (/^>\s*/.test(line)) {
      flushList();
      output.push(`<blockquote class="jet-md-blockquote">${inlineFormat(line.replace(/^>\s*/, ""))}</blockquote>`);
      continue;
    }
    const ul = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (ul) {
      if (inList !== "ul") {
        flushList();
        inList = "ul";
      }
      listBuffer.push(`<li>${inlineFormat(ul[1])}</li>`);
      continue;
    }
    const ol = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (ol) {
      if (inList !== "ol") {
        flushList();
        inList = "ol";
      }
      listBuffer.push(`<li>${inlineFormat(ol[1])}</li>`);
      continue;
    }
    flushList();
    if (line.trim() === "") continue;
    output.push(`<p class="jet-md-p">${inlineFormat(line)}</p>`);
  }
  flushList();
  return output.join("\n");
};

// ---------------------------------------------------------------------------
// postMessage validation (exact source + envelope + payload)
// ---------------------------------------------------------------------------

export const HTML_MESSAGE_TYPE = "jet-html-message";
export const HTML_MESSAGE_MAX_PAYLOAD_BYTES = 64 * 1024;

const isRecord = (v) =>
  !!v && typeof v === "object" && !Array.isArray(v);

/**
 * The sending window must be EXACTLY the embedded frame's window.
 * srcDoc frames without allow-same-origin have the opaque origin "null",
 * so origin checks cannot discriminate — this identity check is the gate.
 * Opaque origins are therefore allowed ONLY under this source-checked
 * policy (documented here and in the html widget).
 */
export const isTrustedMessageSource = (eventSource, frameWindow) =>
  !!eventSource && !!frameWindow && eventSource === frameWindow;

/**
 * Validate the message envelope and payload.
 * - type must equal HTML_MESSAGE_TYPE
 * - widgetID must equal the receiving placement instance
 * - payload, when present, must be a JSON-serializable record within the
 *   byte budget (arrays/preimitives are rejected: the runtime forwards
 *   payloads as `data` objects to onMessage actions)
 */
export const isValidHtmlMessage = (data, widgetID, options = {}) => {
  const maxBytes = options.maxPayloadBytes || HTML_MESSAGE_MAX_PAYLOAD_BYTES;
  if (!isRecord(data)) return { valid: false, payload: {}, reason: "envelope" };
  if (data.type !== HTML_MESSAGE_TYPE) return { valid: false, payload: {}, reason: "type" };
  if (typeof data.widgetID !== "string" || !data.widgetID || data.widgetID !== widgetID) {
    return { valid: false, payload: {}, reason: "widget" };
  }
  const payload = data.payload === undefined ? {} : data.payload;
  if (!isRecord(payload)) return { valid: false, payload: {}, reason: "payload" };
  try {
    if (JSON.stringify(payload).length > maxBytes) {
      return { valid: false, payload: {}, reason: "size" };
    }
  } catch {
    return { valid: false, payload: {}, reason: "payload" };
  }
  return { valid: true, payload, reason: null };
};


