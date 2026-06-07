import React, { useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

/**
 * HtmlWidget
 *
 * Renders custom HTML and CSS inside a securely sandboxed <iframe>.
 * Supports events (onMessage) and methods (refresh).
 */
export const HtmlWidget = ({
  widgetID,
  widgetConfig,
  onWidgetInit,
  fireWidgetEvent,
}) => {
  const iframeRef = useRef(null);

  const html = widgetConfig?.html || "";
  const css = widgetConfig?.css || "";
  const allowScripts = widgetConfig?.allowScripts === true || widgetConfig?.allowScripts === "true";
  const allowForms = widgetConfig?.allowForms === true || widgetConfig?.allowForms === "true";
  const allowPopups = widgetConfig?.allowPopups === true || widgetConfig?.allowPopups === "true";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  // Listen for message events from inside the iframe sandbox
  useEffect(() => {
    const handleMessage = (event) => {
      // Validate that the message is meant for this widget instance
      if (
        event.data &&
        event.data.type === "jet-html-message" &&
        event.data.widgetID === widgetID
      ) {
        if (fireWidgetEvent) {
          fireWidgetEvent("onMessage", {
            data: event.data.payload || {},
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [widgetID, fireWidgetEvent]);

  // 1. Expose widget methods to the parent AppPage runtime
  useEffect(() => {
    if (onWidgetInit) {
      onWidgetInit({
        refresh: () => {
          if (iframeRef.current) {
            // Trigger iframe reload by resetting the srcDoc
            const currentSrcDoc = iframeRef.current.srcDoc;
            iframeRef.current.srcDoc = "";
            setTimeout(() => {
              if (iframeRef.current) {
                iframeRef.current.srcDoc = currentSrcDoc;
              }
            }, 50);
          }
        },
      });
    }
  }, [onWidgetInit]);

  // 2. Setup Sandbox Tokens
  const sandboxTokens = useMemo(() => {
    const tokens = [];
    if (allowScripts) tokens.push("allow-scripts");
    if (allowForms) tokens.push("allow-forms");
    if (allowPopups) tokens.push("allow-popups");
    // Explicitly omit allow-same-origin for maximum security (XSS protection)
    return tokens.join(" ") || undefined;
  }, [allowScripts, allowForms, allowPopups]);

  // 3. Assemble Iframe Document Content
  const srcDocContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
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
              background-color: transparent;
              color: var(--foreground, #ffffff);
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }, [html, css]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            Loading...
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        srcDoc={srcDocContent}
        sandbox={sandboxTokens}
        referrerPolicy="no-referrer"
        className="w-full h-full border-0 bg-transparent block"
        title="Custom HTML Embed"
      />
    </div>
  );
};

HtmlWidget.propTypes = {
  widgetID: PropTypes.string,
  widgetConfig: PropTypes.shape({
    html: PropTypes.string,
    css: PropTypes.string,
    allowScripts: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    allowForms: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    allowPopups: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    isLoading: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }),
  onWidgetInit: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
};

export default HtmlWidget;
