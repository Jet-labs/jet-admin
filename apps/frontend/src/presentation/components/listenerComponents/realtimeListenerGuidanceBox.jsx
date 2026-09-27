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
  // Server-provided ingress truth (listener API `ingress` block). When present,
  // all URLs + the allowlist panel use the real public proxy address instead
  // of guessing from the browser host.
  ingress = null,
}) => {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!datasourceType || !typeConfig) return null;

  // Prefer the server-provided public proxy address (correct in every
  // deployment). Fall back to the legacy browser-host guess (dev only).
  const envPort =
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_WEBHOOK_PORT || import.meta.env.REACT_APP_WEBHOOK_PORT)) ||
    (typeof process !== "undefined" && process.env && (process.env.REACT_APP_WEBHOOK_PORT || process.env.WEBHOOK_PORT)) ||
    "8095";
  const port = envPort;
  const baseUrl = (ingress && ingress.baseUrl) ||
    `${window.location.protocol}//${window.location.hostname}:${port}`;

  // Host the connector owner must allowlist + health URL to verify it.
  let allowlistHost = "";
  try {
    if (ingress && ingress.baseUrl) {
      allowlistHost = new URL(ingress.baseUrl).hostname;
    }
  } catch (_) {
    allowlistHost = "";
  }
  const showAllowlist = Boolean(
    ingress && ingress.webhookUrls && ingress.webhookUrls.length > 0 && allowlistHost
  );

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

        {/* Connector allowlist — what to whitelist at the connector's end */}
        {showAllowlist && (
          <div className="p-2 bg-muted/30 rounded border border-border space-y-2">
            <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <TbInfoCircle className="w-4 h-4 text-primary" /> Connector allowlist
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Register the URLs above in your connector (Stripe, GitHub, Shopify, …).
              Webhook traffic must reach the <span className="font-semibold text-foreground">listener-proxy</span> — allowlist host{" "}
              <code className="font-mono text-primary">{allowlistHost}</code> (with port, if shown in the URL) in your firewall — not the API/backend host.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Proxy health check
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs flex items-center gap-1 text-primary hover:text-primary/80"
                onClick={(e) => { e.preventDefault(); handleCopy(ingress.healthUrl, "allowlist_health"); }}
              >
                {copiedKey === "allowlist_health" ? <TbCheck className="w-3.5 h-3.5 text-primary" /> : <TbCopy className="w-3.5 h-3.5" />}
                {copiedKey === "allowlist_health" ? "Copied!" : "Copy URL"}
              </Button>
            </div>
            <code className="block p-2 bg-background rounded border border-border text-xs font-mono text-primary break-all">
              {ingress.healthUrl}
            </code>
            <p className="text-[11px] text-muted-foreground">
              Open this URL from the connector&apos;s network — a status-ok response proves the proxy is reachable before you send real events.
            </p>
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
  ingress: PropTypes.object,
};
