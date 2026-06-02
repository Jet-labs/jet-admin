import React from "react";
import PropTypes from "prop-types";
import { Globe } from "lucide-react";

/**
 * IframeWidget
 *
 * Renders an iframe securely with customizable sandbox capabilities
 * and referral policy.
 */
export const IframeWidget = ({
  widgetConfig,
}) => {
  const url = widgetConfig?.url || "";
  const allowSameOrigin = widgetConfig?.allowSameOrigin ?? false;
  const allowScripts = widgetConfig?.allowScripts ?? true;
  const allowForms = widgetConfig?.allowForms ?? true;
  const allowPopups = widgetConfig?.allowPopups ?? false;

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5">
        <Globe className="h-5 w-5 opacity-60" />
        <span>No iframe URL configured</span>
      </div>
    );
  }

  // Construct sandbox attributes based on toggles
  const sandboxTokens = [];
  if (allowSameOrigin) sandboxTokens.push("allow-same-origin");
  if (allowScripts) sandboxTokens.push("allow-scripts");
  if (allowForms) sandboxTokens.push("allow-forms");
  if (allowPopups) sandboxTokens.push("allow-popups");
  
  const sandboxValue = sandboxTokens.join(" ");
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  return (
    <div className="w-full h-full p-0 bg-background overflow-hidden relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}

      <iframe
        src={url}
        className="w-full h-full border-0 bg-white"
        sandbox={sandboxValue || undefined}
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
