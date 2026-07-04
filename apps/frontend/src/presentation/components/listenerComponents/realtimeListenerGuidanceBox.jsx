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
      case "purple":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "blue":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "emerald":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "red":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "pink":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Section
      title={guidance.title || `${typeConfig.name} Listener Guidance`}
      description="Real-time configuration suggestions and copyable test commands from package definition"
    >
      <div className="space-y-4 text-sm">
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
          <div className="space-y-3">
            {guidance.urls.map((u, i) => (
              <div key={i} className="p-3 bg-muted/60 rounded-md border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    {u.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs flex items-center gap-1 text-primary hover:text-primary/80"
                    onClick={() => handleCopy(u.url, `url_${i}`)}
                  >
                    {copiedKey === `url_${i}` ? <TbCheck className="w-3.5 h-3.5 text-emerald-500" /> : <TbCopy className="w-3.5 h-3.5" />}
                    {copiedKey === `url_${i}` ? "Copied!" : "Copy URL"}
                  </Button>
                </div>
                <code className="block p-2 bg-background rounded border border-border text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all">
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
          <div className="space-y-3">
            {guidance.snippets.map((s, i) => (
              <div key={i} className="p-3 bg-zinc-950 text-zinc-100 rounded-md border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-400 flex items-center gap-1.5">
                    <TbTerminal2 className="w-4 h-4 text-emerald-400" /> {s.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-300 hover:text-white flex items-center gap-1"
                    onClick={() => handleCopy(s.code, `snippet_${i}`)}
                  >
                    {copiedKey === `snippet_${i}` ? <TbCheck className="w-3.5 h-3.5 text-emerald-400" /> : <TbCopy className="w-3.5 h-3.5" />}
                    {copiedKey === `snippet_${i}` ? "Copied Command!" : "Copy Code"}
                  </Button>
                </div>
                <pre className="p-2.5 bg-black/50 rounded text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all border border-zinc-800/80">
                  {s.code}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Instructions & Summary */}
        {guidance.instructions && (
          <div className="p-3 bg-muted/40 rounded-md border border-border space-y-1">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider flex items-center gap-1">
              <TbInfoCircle className="w-4 h-4 text-primary" /> Setup & Configuration Guide
            </p>
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
