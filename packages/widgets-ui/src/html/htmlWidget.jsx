import React, { useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  buildSandboxAttribute,
  isTrustedMessageSource,
  isValidHtmlMessage,
  normalizeEmbedBoolean,
} from "../_shared/embedSafety";

/**
 * HtmlWidget
 *
 * Renders custom HTML and CSS inside a securely sandboxed <iframe>.
 * Supports events (onMessage) and methods (refresh).
 *
 * Security posture (F03/B02/B20/E13):
 * - The sandbox attribute is ALWAYS rendered, including as "" (B02).
 * - allow-same-origin is never granted: srcDoc + same-origin + scripts would
 *   escape the sandbox. The `js` schema field is intentionally NOT injected;
 *   authors put scripts in `html` behind the explicit allowScripts toggle.
 * - onMessage accepts only exact-source, valid-envelope messages. srcDoc
 *   frames have the opaque origin "null", so origin checks cannot gate them;
 *   the `event.source === contentWindow` identity check is the gate, and
 *   opaque origins are allowed ONLY under that source-checked policy.
 */
export const HtmlWidget = ({
  widgetID,
  widgetConfig,
  onWidgetInit,
  fireWidgetEvent,
}) => {
  const iframeRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const html = widgetConfig?.html || "";
  const css = widgetConfig?.css || "";
  const allowScripts = normalizeEmbedBoolean(widgetConfig?.allowScripts, false);
  const allowForms = normalizeEmbedBoolean(widgetConfig?.allowForms, false);
  const allowPopups = normalizeEmbedBoolean(widgetConfig?.allowPopups, false);
  const isLoading = normalizeEmbedBoolean(widgetConfig?.isLoading, false);

  // Listen for message events from inside the iframe sandbox
  useEffect(() => {
    const handleMessage = (event) => {
      // B20: the sender must be EXACTLY this placement's frame window.
      // Another frame/window knowing our widgetID still fails this gate.
      const frameWindow = iframeRef.current?.contentWindow;
      if (!isTrustedMessageSource(event?.source, frameWindow)) return;
      const check = isValidHtmlMessage(event?.data, widgetID);
      if (!check.valid) return;
      if (fireWidgetEvent) {
        fireWidgetEvent("onMessage", {
          data: check.payload,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [widgetID, fireWidgetEvent]);

  // Clear any pending refresh-restore timer on unmount.
  useEffect(() => {
    const timers = refreshTimerRef;
    return () => {
      if (timers.current) {
        clearTimeout(timers.current);
        timers.current = null;
      }
    };
  }, []);

  // 1. Expose widget methods to the parent AppPage runtime
  useEffect(() => {
    if (onWidgetInit) {
      onWidgetInit({
        refresh: () => {
          if (iframeRef.current) {
            // Trigger iframe reload by resetting the srcDoc
            const currentSrcDoc = iframeRef.current.srcDoc;
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
            iframeRef.current.srcDoc = "";
            refreshTimerRef.current = setTimeout(() => {
              refreshTimerRef.current = null;
              if (iframeRef.current) {
                iframeRef.current.srcDoc = currentSrcDoc;
              }
            }, 50);
          }
        },
      });
    }
  }, [onWidgetInit]);

  // 2. Setup Sandbox Tokens (always a string, possibly "" — never omitted)
  const sandboxTokens = useMemo(() => {
    return buildSandboxAttribute(
      { allowScripts, allowForms, allowPopups },
      { forbidSameOrigin: true }
    );
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
              /* CSS variables do not cross into a srcDoc iframe, so the old
                 var(--foreground) fallback produced white text on the white
                 iframe canvas (invisible preview). Use an explicit readable
                 canvas; authors can override it via CSS Styles. */
              background-color: #ffffff;
              color: #111827;
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
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
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
