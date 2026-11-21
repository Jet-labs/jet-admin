import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { renderMarkdownSafe } from "../_shared/embedSafety";

/**
 * TextWidget
 *
 * Renders text content with optional Markdown formatting.
 * Supports {{ }} template expressions resolved by the AppPage runtime.
 * Markdown rendering is escape-first (raw HTML disabled by default) via the
 * shared embedSafety pipeline: hostile markup renders as inert text.
 */
export const TextWidget = ({
  widgetConfig,
  data,
}) => {
  const content = widgetConfig?.content;
  const format = widgetConfig?.format || "markdown";
  // Dual-read: canonical textAlign, legacy align fallback (F04).
  const textAlign = widgetConfig?.textAlign || widgetConfig?.align || "left";
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
    return renderMarkdownSafe(stringContent);
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
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
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
