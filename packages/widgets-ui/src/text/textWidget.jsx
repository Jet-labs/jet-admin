import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Lightweight Markdown-to-HTML converter.
 * Supports: headings, bold, italic, code blocks, inline code,
 * links, images, lists (ordered/unordered), blockquotes, hr, paragraphs.
 */
const parseMarkdown = (md) => {
  if (md === null || md === undefined) return "";
  let html = typeof md === "string" ? md : String(md);
  if (!html) return "";

  // Fenced code blocks (```lang\n...\n```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="jet-md-pre"><code class="jet-md-code${lang ? ` language-${lang}` : ""}">${code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .trim()}</code></pre>`;
  });

  // Split into lines for block-level parsing
  const lines = html.split("\n");
  const output = [];
  let inList = null; // "ul" | "ol" | null
  let listBuffer = [];

  const flushList = () => {
    if (inList && listBuffer.length > 0) {
      output.push(`<${inList} class="jet-md-list">${listBuffer.join("")}</${inList}>`);
      listBuffer = [];
      inList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip pre blocks (already handled)
    if (line.includes("<pre")) {
      flushList();
      output.push(line);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      output.push(`<h${level} class="jet-md-h${level}">${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      flushList();
      output.push('<hr class="jet-md-hr" />');
      continue;
    }

    // Blockquote
    if (line.match(/^>\s*/)) {
      flushList();
      const text = line.replace(/^>\s*/, "");
      output.push(`<blockquote class="jet-md-blockquote">${inlineFormat(text)}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== "ul") {
        flushList();
        inList = "ul";
      }
      listBuffer.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== "ol") {
        flushList();
        inList = "ol";
      }
      listBuffer.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    flushList();

    // Empty line
    if (line.trim() === "") {
      continue;
    }

    // Paragraph
    output.push(`<p class="jet-md-p">${inlineFormat(line)}</p>`);
  }

  flushList();
  return output.join("\n");
};

/** Inline formatting: bold, italic, code, links, images */
const inlineFormat = (text) => {
  // Images ![alt](src)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="jet-md-img" />');
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="jet-md-link">$1</a>');
  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, '<code class="jet-md-inline-code">$1</code>');
  // Bold **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");
  // Italic *text* or _text_
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/_(.+?)_/g, "<em>$1</em>");
  // Strikethrough ~~text~~
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
  return text;
};

/**
 * TextWidget
 *
 * Renders text content with optional Markdown formatting.
 * Supports {{ }} template expressions resolved by the AppPage runtime.
 */
export const TextWidget = ({
  widgetConfig,
  data,
}) => {
  const content = widgetConfig?.content;
  const format = widgetConfig?.format || "markdown";
  const textAlign = widgetConfig?.textAlign || "left";
  const fontSize = widgetConfig?.fontSize || "sm";

  const renderedHTML = useMemo(() => {
    if (content === null || content === undefined) return "";
    const stringContent = typeof content === "string" ? content : String(content);
    if (format === "plain") {
      return stringContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />");
    }
    return parseMarkdown(stringContent);
  }, [content, format]);

  const fontSizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }[fontSize] || "text-sm";

  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  return (
    <div
      className={`jet-md-root w-full h-full overflow-auto p-3 ${fontSizeClass} relative`}
      style={{ textAlign }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <style>{`
        .jet-md-root { color: var(--foreground, hsl(0 0% 98%)); line-height: 1.65; }
        .jet-md-h1 { font-size: 1.5em; font-weight: 700; margin: 0.6em 0 0.3em; color: var(--foreground); }
        .jet-md-h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0 0.25em; color: var(--foreground); }
        .jet-md-h3 { font-size: 1.15em; font-weight: 600; margin: 0.4em 0 0.2em; color: var(--foreground); }
        .jet-md-h4, .jet-md-h5, .jet-md-h6 { font-size: 1em; font-weight: 600; margin: 0.3em 0 0.15em; color: var(--foreground); }
        .jet-md-p { margin: 0.35em 0; }
        .jet-md-pre { background: hsl(var(--muted)); border-radius: 6px; padding: 0.75em 1em; margin: 0.5em 0; overflow-x: auto; }
        .jet-md-code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace; font-size: 0.85em; }
        .jet-md-inline-code { background: hsl(var(--muted)); padding: 0.15em 0.4em; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.85em; }
        .jet-md-link { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .jet-md-link:hover { opacity: 0.8; }
        .jet-md-blockquote { border-left: 3px solid hsl(var(--primary)); padding-left: 0.75em; margin: 0.5em 0; color: hsl(var(--muted-foreground)); font-style: italic; }
        .jet-md-hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 0.75em 0; }
        .jet-md-list { padding-left: 1.5em; margin: 0.35em 0; }
        .jet-md-list li { margin: 0.15em 0; }
        .jet-md-img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
    </div>
  );
};

TextWidget.propTypes = {
  widgetConfig: PropTypes.object,
  data: PropTypes.any,
};

export default TextWidget;
