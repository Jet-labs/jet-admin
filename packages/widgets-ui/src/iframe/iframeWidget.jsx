import React from "react";
import PropTypes from "prop-types";
import { Globe, ShieldAlert } from "lucide-react";
import {
  buildSandboxAttribute,
  isAllowedEmbedUrl,
  normalizeEmbedBoolean,
} from "../_shared/embedSafety";

/**
 * IframeWidget
 *
 * Renders an iframe securely with customizable sandbox capabilities
 * and referral policy.
 *
 * Security posture (F03/B02/E10):
 * - The sandbox attribute is ALWAYS rendered, including as "" (B02).
 * - Capability toggles normalize strictly ("false" disables); persisted
 *   defaults (scripts/forms on) are kept for saved-content compatibility.
 * - Only http(s)/relative URLs embed; other schemes render a blocked-embed
 *   fallback instead of a frame (URL policy).
 */
export const IframeWidget = ({
  widgetConfig,
}) => {
  // Legacy `src` alias accepted; `url` is the canonical runtime field.
  const rawUrl = widgetConfig?.url ?? widgetConfig?.src ?? "";
  const url = typeof rawUrl === "string" ? rawUrl.trim() : String(rawUrl ?? "").trim();
  // Compat defaults preserved for saved content; strict normalization means
  // an explicit "false"/0/"0" genuinely disables the token.
  const allowSameOrigin = normalizeEmbedBoolean(widgetConfig?.allowSameOrigin, false);
  const allowScripts = normalizeEmbedBoolean(widgetConfig?.allowScripts, true);
  const allowForms = normalizeEmbedBoolean(widgetConfig?.allowForms, true);
  const allowPopups = normalizeEmbedBoolean(widgetConfig?.allowPopups, false);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5">
        <Globe className="h-5 w-5 opacity-60" />
        <span>No iframe URL configured</span>
      </div>
    );
  }

  if (!isAllowedEmbedUrl(url)) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-destructive/40 bg-destructive/5 text-muted-foreground text-xs gap-1.5">
        <ShieldAlert className="h-5 w-5 opacity-60" />
        <span className="font-medium text-foreground">Embedding blocked</span>
        <span className="break-all text-center">This URL scheme cannot be embedded: {url.slice(0, 160)}</span>
      </div>
    );
  }

  // Construct sandbox attributes based on toggles (always a string).
  const sandboxValue = buildSandboxAttribute({
    allowSameOrigin,
    allowScripts,
    allowForms,
    allowPopups,
  });
  const isLoading = normalizeEmbedBoolean(widgetConfig?.isLoading, false);

  return (
    <div className="w-full h-full p-0 bg-background overflow-hidden relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}

      <iframe
        src={url}
        className="w-full h-full border-0 bg-background"
        sandbox={sandboxValue}
        referrerPolicy="no-referrer-when-downgrade"
        title="Embedded Content"
      />
    </div>
  );
};

IframeWidget.propTypes = {
  widgetConfig: PropTypes.object,
};

export default IframeWidget;
