import React, { useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Skeleton, WidgetSurface } from "@jet-admin/ui";
import {
  buildSandboxAttribute,
  isTrustedMessageSource,
  isValidHtmlMessage,
  normalizeEmbedBoolean,
} from "../_shared/embedSafety";

export const HtmlWidget = ({ widgetID, widgetConfig, onWidgetInit, fireWidgetEvent }) => {
  const iframeRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const html = widgetConfig?.html || "";
  const css = widgetConfig?.css || "";
  const allowScripts = normalizeEmbedBoolean(widgetConfig?.allowScripts, false);
  const allowForms = normalizeEmbedBoolean(widgetConfig?.allowForms, false);
  const allowPopups = normalizeEmbedBoolean(widgetConfig?.allowPopups, false);
  const isLoading = normalizeEmbedBoolean(widgetConfig?.isLoading, false);
  const isDark = widgetConfig?.colorScheme === "dark";
  const backgroundColor = widgetConfig?.backgroundColor || (isDark ? "#171717" : "#ffffff");
  const textColor = widgetConfig?.textColor || (isDark ? "#fafafa" : "#111827");
  const density = widgetConfig?.properties?.density || "comfortable";

  useEffect(() => {
    const handleMessage = (event) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!isTrustedMessageSource(event?.source, frameWindow)) return;
      const check = isValidHtmlMessage(event?.data, widgetID);
      if (!check.valid) return;
      fireWidgetEvent?.("onMessage", { data: check.payload });
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [widgetID, fireWidgetEvent]);

  useEffect(() => () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  useEffect(() => {
    onWidgetInit?.({
      refresh: () => {
        if (!iframeRef.current) return;
        const currentSrcDoc = iframeRef.current.srcDoc;
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        iframeRef.current.srcDoc = "";
        refreshTimerRef.current = setTimeout(() => {
          refreshTimerRef.current = null;
          if (iframeRef.current) iframeRef.current.srcDoc = currentSrcDoc;
        }, 50);
      },
    });
  }, [onWidgetInit]);

  const sandboxTokens = useMemo(
    () => buildSandboxAttribute({ allowScripts, allowForms, allowPopups }, { forbidSameOrigin: true }),
    [allowScripts, allowForms, allowPopups]
  );

  const srcDocContent = useMemo(
    () => `<!DOCTYPE html>
      <html lang="en"${isDark ? ' data-theme="dark"' : ""}>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: auto;
              background-color: ${backgroundColor};
              color: ${textColor};
              color-scheme: ${isDark ? "dark" : "light"};
              font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            ${css}
          </style>
        </head>
        <body>${html}</body>
      </html>`,
    [html, css, backgroundColor, textColor, isDark]
  );

  return (
    <WidgetSurface density={density} className="relative h-full w-full overflow-hidden p-0">
      {isLoading && <Skeleton className="absolute inset-0 z-10 rounded-none" />}
      <iframe
        ref={iframeRef}
        srcDoc={srcDocContent}
        sandbox={sandboxTokens}
        referrerPolicy="no-referrer"
        className="block h-full w-full border-0 bg-transparent"
        title={widgetConfig?.title || "Custom HTML embed"}
      />
    </WidgetSurface>
  );
};

HtmlWidget.propTypes = {
  widgetID: PropTypes.string,
  widgetConfig: PropTypes.object,
  onWidgetInit: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
};

export default HtmlWidget;
