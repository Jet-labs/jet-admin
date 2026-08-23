import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { JsonViewer } from "@jet-admin/ui";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const METHOD_STYLES = {
  GET:    "bg-green-950/40 text-green-400 border-green-800/40",
  POST:   "bg-blue-950/40 text-blue-400 border-blue-800/40",
  PUT:    "bg-yellow-950/40 text-yellow-400 border-yellow-800/40",
  PATCH:  "bg-orange-950/40 text-orange-400 border-orange-800/40",
  DELETE: "bg-red-950/40 text-red-400 border-red-800/40",
};

const STATUS_STYLE = (code) => {
  if (code >= 500) return "bg-red-950/40 text-red-400";
  if (code >= 400) return "bg-orange-950/40 text-orange-400";
  if (code >= 300) return "bg-yellow-950/40 text-yellow-400";
  return "bg-green-950/40 text-green-400";
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
    <div className="flex flex-col gap-4 text-sm">

      {/* ── Request summary ──────────────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Request
        </p>

        {/* Method + URL hero row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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

        <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2">
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
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Response
        </p>

        <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2">
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
              <span className={durationMs > 2000 ? "text-orange-400" : durationMs > 500 ? "text-yellow-400" : "text-green-400"}>
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
