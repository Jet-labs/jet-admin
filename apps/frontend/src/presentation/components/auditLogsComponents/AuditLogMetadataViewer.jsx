import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { JsonViewer } from "@jet-admin/ui";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NEUTRAL_CHIP = "bg-muted/40 text-foreground border-border";

const METHOD_STYLES = {
  GET: NEUTRAL_CHIP,
  POST: NEUTRAL_CHIP,
  PUT: NEUTRAL_CHIP,
  PATCH: NEUTRAL_CHIP,
  DELETE: "bg-destructive/10 text-destructive border-destructive/30",
};

const STATUS_STYLE = (code) => {
  if (code >= 400) return "bg-destructive/10 text-destructive";
  return "bg-primary/10 text-primary";
};

/** Strips the tenant prefix from API URLs for readability. */
const prettifyUrl = (url = "") => {
  // e.g. /api/v1/tenants/42/workflows  →  /workflows
  return url.replace(/^\/api\/v\d+\/tenants\/\d+/, "") || url;
};

/** Render a row in the summary table */
const Row = ({ label, children }) => (
  <div className="flex flex-row items-start gap-2 py-1 border-b border-border/40 last:border-0">
    <span className="w-28 flex-shrink-0 text-xs text-muted-foreground font-medium">{label}</span>
    <span className="text-xs text-foreground break-all">{children}</span>
  </div>
);

/** Collapsible raw JSON block */
const CollapsibleJson = ({ label, data }) => {
  const [open, setOpen] = useState(false);
  if (data === null || data === undefined) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {label}
      </button>
      {open && (
        <div className="mt-1 rounded border border-border/40 bg-muted/20 overflow-auto max-h-48">
          <JsonViewer data={data} />
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Renders audit log metadata in a human-readable format.
 *
 * Expected metadata shape (from audit.middleware.js):
 * {
 *   request:   { method, url, ip, headers, body },
 *   response:  { statusCode, body, headers },
 *   durationMs: number,
 *   authType:   string,
 *   apiKeyID:   string | null,
 *   apiKeyTitle: string | null,
 * }
 */
export const AuditLogMetadataViewer = ({ metadata }) => {
  if (!metadata || typeof metadata !== "object") {
    return (
      <p className="text-xs text-muted-foreground italic">No metadata available.</p>
    );
  }

  const { request, response, durationMs, authType, apiKeyTitle, apiKeyID } = metadata;

  const method      = request?.method;
  const url         = request?.url;
  const ip          = request?.ip;
  const reqBody     = request?.body;
  const reqHeaders  = request?.headers;

  const statusCode  = response?.statusCode;
  const resBody     = response?.body;
  const resHeaders  = response?.headers;

  const methodStyle = METHOD_STYLES[method] ?? "bg-muted text-foreground border-border";

  return (
    <div className="flex flex-col gap-2 text-sm">

      {/* ── Request summary ──────────────────────────────────────── */}
      <section>
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Request
        </p>

        {/* Method + URL hero row */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {method && (
            <span className={`px-2 py-0.5 rounded border text-xs font-bold font-mono ${methodStyle}`}>
              {method}
            </span>
          )}
          {url && (
            <span className="text-xs font-mono text-foreground break-all">
              {prettifyUrl(url)}
              {url !== prettifyUrl(url) && (
                <span className="ml-1 text-muted-foreground/60 text-[10px]">
                  ({url})
                </span>
              )}
            </span>
          )}
        </div>

        <div className="rounded border border-border/50 bg-muted/10 p-2">
          {ip          && <Row label="IP Address">{ip}</Row>}
          {authType    && <Row label="Auth type">{authType}</Row>}
          {apiKeyTitle && <Row label="API key">{apiKeyTitle}</Row>}
          {!apiKeyTitle && apiKeyID && <Row label="API key ID">{apiKeyID}</Row>}
        </div>

        <CollapsibleJson label="Request body" data={reqBody} />
        <CollapsibleJson label="Request headers" data={reqHeaders} />
      </section>

      {/* ── Response summary ─────────────────────────────────────── */}
      <section>
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Response
        </p>

        <div className="rounded border border-border/50 bg-muted/10 p-2">
          {statusCode !== undefined && (
            <Row label="Status">
              <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold ${STATUS_STYLE(statusCode)}`}>
                {statusCode}
              </span>
              {" "}
              <span className="text-muted-foreground">
                {statusCode >= 500 ? "Server error"
                  : statusCode >= 400 ? "Client error"
                  : statusCode >= 300 ? "Redirect"
                  : "Success"}
              </span>
            </Row>
          )}
          {durationMs !== undefined && (
            <Row label="Duration">
              <span className={durationMs > 2000 ? "text-destructive" : "text-foreground"}>
                {durationMs} ms
              </span>
            </Row>
          )}
        </div>

        <CollapsibleJson label="Response body" data={resBody} />
        <CollapsibleJson label="Response headers" data={resHeaders} />
      </section>

      {/* ── Raw JSON fallback ────────────────────────────────────── */}
      <CollapsibleJson label="View raw JSON" data={metadata} />
    </div>
  );
};
