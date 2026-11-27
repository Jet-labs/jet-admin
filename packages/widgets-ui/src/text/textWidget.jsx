import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Skeleton, WidgetSurface, cn } from "@jet-admin/ui";
import { renderMarkdownSafe } from "../_shared/embedSafety";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";
import { resolveConditionalStyle } from "../config/conditionalStyle";

const PRESET_CLASS = {
  heading: "text-xl font-medium leading-tight tracking-tight",
  body: "text-sm leading-relaxed",
  caption: "text-xs leading-relaxed text-muted-foreground",
};

export const TextWidget = ({ widgetConfig }) => {
  const content = widgetConfig?.content;
  const format = widgetConfig?.format || "markdown";
  const preset = widgetConfig?.preset || "body";
  const textAlign = widgetConfig?.textAlign || widgetConfig?.align || "left";
  const color = widgetConfig?.color || "";
  const lineClamp = Number(widgetConfig?.lineClamp) || 0;
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const conditional = resolveConditionalStyle(widgetConfig?.styleRules, { value: content, content, ...widgetConfig });

  const renderedHTML = useMemo(() => {
    if (content === null || content === undefined) return "";
    const stringContent = typeof content === "string" ? content : String(content);
    if (format === "plain") {
      return stringContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
    }
    return renderMarkdownSafe(stringContent);
  }, [content, format]);

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full flex-col gap-1.5">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface
      density={density}
      className={cn("jet-md-root h-full w-full overflow-auto", PRESET_CLASS[preset] || PRESET_CLASS.body, conditional?.className)}
      style={{
        textAlign,
        ...(color && !conditional ? { color } : {}),
        ...(lineClamp > 0
          ? { display: "-webkit-box", WebkitLineClamp: lineClamp, WebkitBoxOrient: "vertical", overflow: "hidden" }
          : null),
      }}
    >
      <style>{`
        .jet-md-root { color: inherit; }
        .jet-md-root h1 { font-size: 1.4em; font-weight: 500; margin: 0.6em 0 0.3em; color: hsl(var(--foreground)); }
        .jet-md-root h2 { font-size: 1.25em; font-weight: 500; margin: 0.5em 0 0.25em; color: hsl(var(--foreground)); }
        .jet-md-root h3 { font-size: 1.1em; font-weight: 500; margin: 0.4em 0 0.2em; color: hsl(var(--foreground)); }
        .jet-md-root p { margin: 0.35em 0; }
        .jet-md-root pre { background: hsl(var(--muted)); border-radius: var(--radius-card); padding: 0.75em 1em; margin: 0.5em 0; overflow-x: auto; }
        .jet-md-root code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85em; }
        .jet-md-root :not(pre) > code { background: hsl(var(--muted)); padding: 0.15em 0.4em; border-radius: var(--radius-control); }
        .jet-md-root a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .jet-md-root blockquote { border-left: 3px solid hsl(var(--primary)); padding-left: 0.75em; margin: 0.5em 0; color: hsl(var(--muted-foreground)); font-style: italic; }
        .jet-md-root hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 0.75em 0; }
        .jet-md-root ul, .jet-md-root ol { padding-left: 1.4em; margin: 0.35em 0; }
        .jet-md-root img { max-width: 100%; border-radius: var(--radius-card); margin: 0.5em 0; }
        .jet-md-root table { border-collapse: collapse; width: 100%; }
        .jet-md-root th, .jet-md-root td { border: 1px solid hsl(var(--border)); padding: 0.35em 0.5em; }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
    </WidgetSurface>
  );
};

TextWidget.propTypes = { widgetConfig: PropTypes.object };
export default TextWidget;
