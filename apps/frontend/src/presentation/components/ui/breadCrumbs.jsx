import React, { useMemo } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTenantState } from "../../../logic/hooks/useTenant";

// Human labels for route segments. Unknown segments fall back to a readable
// title-cased form so user-facing breadcrumbs never expose raw route tokens.
const SEGMENT_LABELS = {
  tenants: "Workspaces",
  settings: "Settings",
  datasources: "Datasources",
  queries: "Queries",
  widgets: "Widgets",
  "app-pages": "App pages",
  listeners: "Listeners",
  workflows: "Workflows",
  engines: "Engines",
  marketplace: "Marketplace",
  apikeys: "API keys",
  cronjobs: "Scheduled jobs",
  audit: "Audit logs",
  users: "Users",
  roles: "Roles",
  add: "Create",
  history: "History",
  runs: "Runs",
  editor: "Editor",
  account: "Account",
};

const isIdentifier = (segment) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
  /^\d{4,}$/.test(segment);

const formatFallback = (segment) =>
  decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const shortIdentifier = (segment) => `#${segment.slice(0, 6)}`;

export const Breadcrumbs = () => {
  const location = useLocation();
  const { tenantID } = useParams();
  const { tenants } = useTenantState();
  const segments = location.pathname.split("/").filter(Boolean);

  const tenantTitle = useMemo(() => {
    if (!tenantID || !Array.isArray(tenants)) return null;
    return tenants.find((tenant) => tenant.tenantID === tenantID)?.tenantTitle || null;
  }, [tenants, tenantID]);

  const breadcrumbs = segments.map((segment, index) => {
    const url = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const isTenantSegment = Boolean(tenantID) && segment === tenantID;

    const fullLabel = isTenantSegment
      ? tenantTitle || "Workspace"
      : SEGMENT_LABELS[segment] || formatFallback(segment);

    const displayLabel = isIdentifier(segment) && !isTenantSegment
      ? shortIdentifier(segment)
      : fullLabel;

    return (
      <React.Fragment key={`${segment}-${index}`}>
        <ChevronRight size={12} className="text-primary/40 flex-shrink-0" aria-hidden="true" />
        {isLast ? (
          <span
            title={fullLabel}
            aria-current="page"
            className="text-xs font-medium text-muted-foreground/70 inline-block truncate max-w-[160px]"
          >
            {displayLabel}
          </span>
        ) : (
          <Link
            to={url}
            title={fullLabel}
            className="text-xs inline-block truncate max-w-[160px] text-primary/80 hover:text-primary transition-colors duration-150"
          >
            {displayLabel}
          </Link>
        )}
      </React.Fragment>
    );
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-0.5 overflow-hidden rounded bg-muted px-2.5 py-1 h-7 w-fit max-w-full"
    >
      <Link
        to="/"
        aria-label="Home"
        className="flex items-center text-primary/80 hover:text-primary transition-colors duration-150 flex-shrink-0"
      >
        <Home size={12} />
      </Link>
      {breadcrumbs}
    </nav>
  );
};
