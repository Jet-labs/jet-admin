import React, { useState } from "react";
import PropTypes from "prop-types";
import { Section, Button, Badge } from "@jet-admin/ui";
import { TbCopy, TbCheck, TbInfoCircle, TbTerminal2 } from "react-icons/tb";

export const RealtimeListenerGuidanceBox = ({
  tenantID,
  listenerID,
  datasourceType,
  listenerConfig = {},
  datasourceOptions = {},
  typeConfig,
}) => {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!datasourceType || !typeConfig) return null;

  const envPort =
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_WEBHOOK_PORT || import.meta.env.REACT_APP_WEBHOOK_PORT)) ||
    (typeof process !== "undefined" && process.env && (process.env.REACT_APP_WEBHOOK_PORT || process.env.WEBHOOK_PORT)) ||
    "8095";
  const port = envPort;
  const baseUrl = `${window.location.protocol}//${window.location.hostname}:${port}`;

  // Call the dedicated per-datasource guidance generator function from typeConfig.listenerGuidance
  const guidanceFn = typeConfig.listenerGuidance;
  const guidance = typeof guidanceFn === "function"
    ? guidanceFn({
        tenantID,
        listenerID,
        listenerConfig,
        datasourceOptions,
        baseUrl,
      })
    : null;

  if (!guidance) return null;

  // Badge color mapping helper
  const getBadgeClass = (color) => {
    switch (color) {
      case "emerald":
        return "bg-primary/10 text-primary border-primary/30";
      case "blue":
      case "purple":
      case "neutral":
        return "bg-muted/50 text-foreground border-border";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <Section
      title={guidance.title || `${typeConfig.name} Listener Guidance`}
      description="Real-time configuration suggestions and copyable test commands from package definition"
    >
      <div className="space-y-2 text-sm">
        {/* Dynamic Badges */}
        {guidance.badges && guidance.badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {guidance.badges.map((b, i) => (
              <Badge key={i} variant="outline" className={getBadgeClass(b.color)}>
                {b.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Dynamic Copyable URLs */}
        {guidance.urls && guidance.urls.length > 0 && (
          <div className="space-y-2">
            {guidance.urls.map((u, i) => (
              <div key={i} className="p-2 bg-muted/30 rounded border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    {u.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs flex items-center gap-1 text-primary hover:text-primary/80"
                    onClick={(e) => { e.preventDefault(); handleCopy(u.url, `url_${i}`); }}
                  >
                    {copiedKey === `url_${i}` ? <TbCheck className="w-3.5 h-3.5 text-primary" /> : <TbCopy className="w-3.5 h-3.5" />}
                    {copiedKey === `url_${i}` ? "Copied!" : "Copy URL"}
                  </Button>
                </div>
                <code className="block p-2 bg-background rounded border border-border text-xs font-mono text-primary break-all">
                  {u.url}
                </code>
                {u.description && (
                  <p className="text-[11px] text-muted-foreground">{u.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Code & CLI Snippets */}
        {guidance.snippets && guidance.snippets.length > 0 && (
          <div className="space-y-2">
            {guidance.snippets.map((s, i) => (
              <div key={i} className="p-2 bg-background text-foreground rounded border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-muted-foreground flex items-center gap-1.5">
                    <TbTerminal2 className="w-4 h-4 text-primary" /> {s.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    onClick={(e) => { e.preventDefault(); handleCopy(s.code, `snippet_${i}`); }}
                  >
                    {copiedKey === `snippet_${i}` ? <TbCheck className="w-3.5 h-3.5 text-primary" /> : <TbCopy className="w-3.5 h-3.5" />}
                    {copiedKey === `snippet_${i}` ? "Copied Command!" : "Copy Code"}
                  </Button>
                </div>
                <pre className="p-2 bg-muted/30 rounded text-xs font-mono text-primary overflow-x-auto whitespace-pre-wrap break-all border border-border/50">
                  {s.code}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Instructions & Summary */}
        {guidance.instructions && (
          <div className="p-2 bg-muted/30 rounded border border-border space-y-2">
            <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <TbInfoCircle className="w-4 h-4 text-primary" /> Setup & Configuration Guide
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {guidance.instructions}
            </p>
          </div>
        )}
      </div>
    </Section>
  );
};

RealtimeListenerGuidanceBox.propTypes = {
  tenantID: PropTypes.string.isRequired,
  listenerID: PropTypes.string,
  datasourceType: PropTypes.string,
  listenerConfig: PropTypes.object,
  datasourceOptions: PropTypes.object,
  typeConfig: PropTypes.object,
};
