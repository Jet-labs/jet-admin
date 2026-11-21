/**
 * embedSafety — F03 safe content/embed boundary (B02/B03/B20; E05/E10/E13).
 *
 * Covers the shared pure module directly from source (no dist rebuild needed):
 * strict toggle normalization, always-present sandbox construction, URL
 * policy, escape-first Markdown over hostile + legitimate fixtures, and
 * exact-source postMessage envelope validation.
 *
 * NOTE: script/popup/form restriction itself is proven in a real browser in
 * apps/frontend/__tests__/embedSafety.browser.test.js — string assertions
 * here cannot execute a sandbox. That suite also covers cross-window message
 * discrimination with real Window objects.
 */
import {
  normalizeEmbedBoolean,
  buildSandboxAttribute,
  parseSandboxAttribute,
  isAllowedEmbedUrl,
  escapeHtml,
  renderMarkdownSafe,
  isTrustedMessageSource,
  isValidHtmlMessage,
  HTML_MESSAGE_TYPE,
} from "../src/_shared/embedSafety.js";

// ---------------------------------------------------------------------------
// Hostile + legitimate fixtures (shared shape with the browser suite)
// ---------------------------------------------------------------------------

const HOSTILE = {
  scriptTag: `<script>window.__xss = "pwned";</script>`,
  imgOnError: `<img src="x" onerror="window.__xss='pwned'">`,
  svgOnLoad: `<svg onload="window.__xss='pwned'">hi</svg>`,
  jsLink: `[click me](javascript:window.__xss='pwned')`,
  jsLinkMixedCase: `[click](JaVaScRiPt:alert(1))`,
  jsLinkSmuggledWs: `[click](java\tscript:alert(1))`,
  dataImage: `![evil](data:text/html,<script>alert(1)</script>)`,
  eventAttrLinkText: `[<img src=x onerror=alert(1)>](https://example.com)`,
  rawHtmlInEmphasis: `**bold <img src=x onerror=alert(1)>**`,
  codeFenceWithHtml: "```html\n<script>alert(1)</script>\n```",
  inlineCodeWithHtml: `Use \`<script>alert(1)</script>\` carefully`,
  entityObfuscated: `[x](&#106;avascript:alert(1))`,
  vbscriptLink: `[x](vbscript:msgbox(1))`,
};

const LEGIT = {
  heading: "# Revenue Report",
  boldItalic: "This is **bold** and *italic* with ~~struck~~ text.",
  list: "- apples\n- oranges\n\n1. first\n2. second",
  fence: "```js\nconst a = 1 < 2;\n```",
  httpsLink: "[Jet Admin](https://example.com/docs?q=1&r=2)",
  relativeLink: "[section](#summary)",
  mailtoLink: "[mail](mailto:ops@example.com)",
  httpsImage: "![chart](https://example.com/chart.png)",
  blockquote: "> a wise note",
  paragraph: "Value: {{ state.queries.sales.data[0].total }}",
};

/** Tags the safe renderer is allowed to emit (plus nothing else). */
const ALLOWED_TAGS = new Set([
  "pre",
  "code",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "a",
  "img",
  "strong",
  "em",
  "del",
]);

const emittedTags = (html) => {
  const tags = [];
  const re = /<([a-zA-Z][a-zA-Z0-9]*)\b/g;
  let m;
  while ((m = re.exec(html)) !== null) tags.push(m[1].toLowerCase());
  return tags;
};

describe("normalizeEmbedBoolean", () => {
  test("true values enable; false values disable", () => {
    expect(normalizeEmbedBoolean(true, false)).toBe(true);
    expect(normalizeEmbedBoolean("true", false)).toBe(true);
    expect(normalizeEmbedBoolean(" True ", false)).toBe(true);
    expect(normalizeEmbedBoolean(1, false)).toBe(true);
    expect(normalizeEmbedBoolean(false, true)).toBe(false);
    expect(normalizeEmbedBoolean("false", true)).toBe(false);
    expect(normalizeEmbedBoolean("FALSE", true)).toBe(false);
    expect(normalizeEmbedBoolean(0, true)).toBe(false);
    expect(normalizeEmbedBoolean("0", true)).toBe(false);
  });

  test("unset falls back to the default; ambiguous fails closed", () => {
    expect(normalizeEmbedBoolean(undefined, true)).toBe(true);
    expect(normalizeEmbedBoolean(null, false)).toBe(false);
    expect(normalizeEmbedBoolean("", true)).toBe(true);
    expect(normalizeEmbedBoolean("", false)).toBe(false);
    expect(normalizeEmbedBoolean("yes", true)).toBe(false);
    expect(normalizeEmbedBoolean({}, false)).toBe(false);
  });
});

describe("buildSandboxAttribute", () => {
  test("empty capabilities yield an empty string, never undefined", () => {
    expect(buildSandboxAttribute({})).toBe("");
    expect(buildSandboxAttribute({ allowScripts: false })).toBe("");
    expect(buildSandboxAttribute({ allowScripts: "false" }, {})).toBe("");
  });

  test("enabled toggles map to exact tokens in stable order", () => {
    expect(
      buildSandboxAttribute({ allowScripts: true, allowForms: true, allowPopups: true })
    ).toBe("allow-scripts allow-forms allow-popups");
    expect(buildSandboxAttribute({ allowSameOrigin: true })).toBe("allow-same-origin");
  });

  test("html variant never emits allow-same-origin", () => {
    expect(
      buildSandboxAttribute(
        { allowSameOrigin: true, allowScripts: true },
        { forbidSameOrigin: true }
      )
    ).toBe("allow-scripts");
  });

  test("round-trips through the parser; unknown tokens dropped", () => {
    const value = buildSandboxAttribute({ allowScripts: true });
    expect(parseSandboxAttribute(value)).toEqual(["allow-scripts"]);
    expect(parseSandboxAttribute("allow-scripts allow-evil nonsense")).toEqual([
      "allow-scripts",
    ]);
    expect(parseSandboxAttribute("")).toEqual([]);
  });
});

describe("isAllowedEmbedUrl", () => {
  test("allows web, relative, anchor and contact links", () => {
    for (const u of [
      "https://example.com",
      "http://example.com/a?b=1",
      "//cdn.example.com/x.js",
      "/reports/weekly",
      "reports/weekly",
      "#summary",
      "mailto:ops@example.com",
      "tel:+15551234567",
    ]) {
      expect(isAllowedEmbedUrl(u)).toBe(true);
    }
  });

  test("denies executable and opaque schemes, even smuggled", () => {
    for (const u of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "java\tscript:alert(1)",
      "java\nscript:alert(1)",
      "data:text/html,<script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
      "blob:https://example.com/1",
      "",
      "   ",
    ]) {
      expect(isAllowedEmbedUrl(u)).toBe(false);
    }
    expect(isAllowedEmbedUrl(null)).toBe(false);
    expect(isAllowedEmbedUrl(42)).toBe(false);
  });
});

describe("renderMarkdownSafe hostile fixtures", () => {
  test("raw markup renders as inert text, never elements", () => {
    for (const [name, md] of Object.entries({
      script: HOSTILE.scriptTag,
      imgHandler: HOSTILE.imgOnError,
      svgHandler: HOSTILE.svgOnLoad,
    })) {
      const html = renderMarkdownSafe(md);
      expect(emittedTags(html).every((t) => ALLOWED_TAGS.has(t))).toBe(true);
      expect(html).not.toContain("<script");
      expect(html).not.toContain("<svg");
      expect(html).toContain("&lt;");
    }
  });

  test("executable link/image schemes degrade to bare text", () => {
    for (const [md, text] of [
      [HOSTILE.jsLink, "click me"],
      [HOSTILE.jsLinkMixedCase, "click"],
      [HOSTILE.jsLinkSmuggledWs, "click"],
      [HOSTILE.vbscriptLink, "x"],
    ]) {
      const html = renderMarkdownSafe(md);
      expect(html).not.toContain("<a ");
      expect(html).not.toMatch(/javascript:/i);
      expect(html).toContain(text);
    }
    const dataImg = renderMarkdownSafe(HOSTILE.dataImage);
    expect(dataImg).not.toContain("<img");
    expect(dataImg).toContain("evil");
  });

  test("markup smuggled inside emphasis/link text is escaped", () => {
    const html = renderMarkdownSafe(
      HOSTILE.eventAttrLinkText + "\n\n" + HOSTILE.rawHtmlInEmphasis
    );
    expect(html).not.toContain("<img");
    // No executable handler attributes anywhere (escaped text may still
    // mention the word, but only inside &lt;…&gt; text, never a real tag).
    expect(html).not.toMatch(/<[^>]*\son\w+\s*=/i);
    expect(html).toContain("&lt;img");
    expect(html).toContain("https://example.com");
  });

  test("entity-obfuscated schemes cannot slip through", () => {
    const html = renderMarkdownSafe(HOSTILE.entityObfuscated);
    expect(html).not.toContain("<a ");
  });

  test("code spans and fences keep hostile source inert", () => {
    const fenced = renderMarkdownSafe(HOSTILE.codeFenceWithHtml);
    expect(fenced).toContain("<pre");
    expect(fenced).toContain("&lt;script&gt;");
    expect(fenced).not.toContain("<script>alert");
    const inline = renderMarkdownSafe(HOSTILE.inlineCodeWithHtml);
    expect(inline).toContain("&lt;script&gt;");
    expect(inline).not.toContain("<script>alert");
  });

  test("escapeHtml covers text and attribute contexts", () => {
    expect(escapeHtml('<a href="x&y">')).toBe("&lt;a href=&quot;x&amp;y&quot;&gt;");
    expect(escapeHtml(null)).toBe("");
  });
});

describe("renderMarkdownSafe legitimate fixtures", () => {
  test("kitchen sink keeps supported constructs and styling hooks", () => {
    const html = renderMarkdownSafe(
      [
        LEGIT.heading,
        "",
        LEGIT.boldItalic,
        "",
        LEGIT.list,
        "",
        LEGIT.fence,
        "",
        LEGIT.blockquote,
        "",
        LEGIT.paragraph,
      ].join("\n")
    );
    expect(html).toContain('<h1 class="jet-md-h1">Revenue Report</h1>');
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<del>struck</del>");
    expect(html).toContain('<ul class="jet-md-list">');
    expect(html).toContain('<ol class="jet-md-list">');
    expect(html).toContain("const a = 1 &lt; 2;");
    expect(html).toContain("jet-md-blockquote");
    expect(html).toContain("{{ state.queries.sales.data[0].total }}");
  });

  test("safe links and images keep working", () => {
    expect(renderMarkdownSafe(LEGIT.httpsLink)).toContain(
      '<a href="https://example.com/docs?q=1&amp;r=2"'
    );
    expect(renderMarkdownSafe(LEGIT.relativeLink)).toContain('href="#summary"');
    expect(renderMarkdownSafe(LEGIT.mailtoLink)).toContain("href=\"mailto:");
    const img = renderMarkdownSafe(LEGIT.httpsImage);
    expect(img).toContain('<img src="https://example.com/chart.png"');
    expect(img).toContain('alt="chart"');
  });

  test("only allow-listed tags are ever emitted", () => {
    const html = renderMarkdownSafe(Object.values({ ...HOSTILE, ...LEGIT }).join("\n\n"));
    for (const tag of emittedTags(html)) {
      expect(ALLOWED_TAGS.has(tag)).toBe(true);
    }
  });

  test("nullish and empty input render empty", () => {
    expect(renderMarkdownSafe(null)).toBe("");
    expect(renderMarkdownSafe(undefined)).toBe("");
    expect(renderMarkdownSafe("")).toBe("");
  });
});

describe("postMessage validation (node-side predicates)", () => {
  test("accepts a well-formed envelope for the right instance", () => {
    const check = isValidHtmlMessage(
      { type: HTML_MESSAGE_TYPE, widgetID: "w1", payload: { hello: 1 } },
      "w1"
    );
    expect(check).toEqual({ valid: true, payload: { hello: 1 }, reason: null });
    expect(isValidHtmlMessage({ type: HTML_MESSAGE_TYPE, widgetID: "w1" }, "w1").payload).toEqual(
      {}
    );
  });

  test("rejects wrong type, wrong instance, and malformed payloads", () => {
    expect(isValidHtmlMessage({ type: "nope", widgetID: "w1" }, "w1").reason).toBe("type");
    expect(
      isValidHtmlMessage({ type: HTML_MESSAGE_TYPE, widgetID: "w2" }, "w1").reason
    ).toBe("widget");
    expect(
      isValidHtmlMessage({ type: HTML_MESSAGE_TYPE, widgetID: "w1", payload: [1] }, "w1").reason
    ).toBe("payload");
    expect(
      isValidHtmlMessage({ type: HTML_MESSAGE_TYPE, widgetID: "w1", payload: "x" }, "w1").reason
    ).toBe("payload");
    expect(isValidHtmlMessage(null, "w1").reason).toBe("envelope");
    expect(isValidHtmlMessage("s", "w1").reason).toBe("envelope");
  });

  test("rejects oversized payloads", () => {
    const big = { blob: "x".repeat(70 * 1024) };
    const check = isValidHtmlMessage(
      { type: HTML_MESSAGE_TYPE, widgetID: "w1", payload: big },
      "w1"
    );
    expect(check.valid).toBe(false);
    expect(check.reason).toBe("size");
  });

  test("source check is strict identity (opaque origins pass only here)", () => {
    const frame = { name: "frame-window" };
    const other = { name: "other-window" };
    expect(isTrustedMessageSource(frame, frame)).toBe(true);
    expect(isTrustedMessageSource(other, frame)).toBe(false);
    expect(isTrustedMessageSource(null, frame)).toBe(false);
    expect(isTrustedMessageSource(frame, null)).toBe(false);
    expect(isTrustedMessageSource(undefined, undefined)).toBe(false);
  });
});
