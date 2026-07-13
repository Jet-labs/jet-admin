import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Store } from 'lucide-react';
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { getUserTenantByIDAPI } from "../../../data/apis/tenant";
import { TenantLogo } from "../../components/tenantComponents/tenantLogo";
import { NoEntityUI } from "../../components/ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../../components/ui/reactQueryLoadingErrorWrapper";

import {
  Clock,
  Database,
  FileCode2,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  PanelTop,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";

const TenantLayoutLandingPage = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();

  const {
    isLoading: isLoadingTenant,
    data: tenant,
    error: tenantError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS, tenantID],
    queryFn: () => getUserTenantByIDAPI({ tenantID }),
    retry: 0,
  });

  const tenantCards = [
    {
      title: "Users",
      icon: <Users className="w-3.5 h-3.5" />,
      count: tenant?.relationships?.length || 0,
      description: "Manage users and access permissions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID)),
    },
    {
      title: "Data Sources",
      icon: <Database className="w-3.5 h-3.5" />,
      count: tenant?.tenantDatasourceCount || 0,
      description: "External data source connections",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID)),
    },
    {
      title: "Saved Queries",
      icon: <FileCode2 className="w-3.5 h-3.5" />,
      count: tenant?.tenantDataQueryCount || 0,
      description: "Stored database query definitions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_QUERIES.path(tenantID)),
    },
    {
      title: "Data Listeners",
      icon: <Radio className="w-3.5 h-3.5" />,
      count: tenant?.tenantListenerCount || 0,
      description: "Real-time data event listeners",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID)),
    },
    {
      title: "Workflows",
      icon: <GitBranch className="w-3.5 h-3.5" />,
      count: tenant?.tenantWorkflowCount || 0,
      description: "Visual automation and pipelines",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_WORKFLOWS.path(tenantID)),
    },
    {
      title: "Widgets",
      icon: <PanelTop className="w-3.5 h-3.5" />,
      count: tenant?.tenantWidgetCount || 0,
      description: "Reusable data visualization components",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_WIDGETS.path(tenantID)),
    },
    {
      title: "App Pages",
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      count: tenant?.tenantAppPageCount || tenant?.tenantDashboardCount || 0,
      description: "Composed widget layouts and views",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_APP_PAGES.path(tenantID)),
    },
    {
      title: "Roles",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      count: tenant?.tenantRolesCount || 0,
      description: "Permission sets and access control groups",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID)),
    },
    {
      title: "API Keys",
      icon: <KeyRound className="w-3.5 h-3.5" />,
      count: tenant?.tenantAPIKeyCount || 0,
      description: "Programmatic access credentials",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)),
    },
    {
      title: "Scheduled Jobs",
      icon: <Clock className="w-3.5 h-3.5" />,
      count: tenant?.tenantCronJobCount || 0,
      description: "Scheduled and recurring task automation",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID)),
    },
  ];

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenant}
      error={tenantError}
    >
      {tenant ? (
        <div className="bg-background w-full h-full">

          {/* ── Tenant Header ─────────────────────────────────── */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
            <div className="w-7 h-7 rounded border border-border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
              {tenant.tenantLogoURL ? (
                <TenantLogo
                  src={tenant.tenantLogoURL}
                  alt="Tenant Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                  <Store className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>

            <h1 className="text-sm font-medium text-foreground">
              {tenant.tenantTitle}
            </h1>

            <span className="text-muted-foreground/40 text-xs select-none">·</span>

            <span className="text-[13px] text-muted-foreground/70">
              Created {moment(tenant.createdAt).format("MMM D, YYYY")}
            </span>

            <span className="ml-auto bg-primary/10 text-primary text-[11px] font-medium px-1.5 py-0.5 rounded-full">
              Active
            </span>
          </div>

          {/* ── Resource List ──────────────────────────────────── */}
          <div className="px-6 py-4">

            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Resources
            </p>

            <div className="rounded border border-border overflow-hidden">
              {tenantCards.map((card, index) => (
                <div
                  key={index}
                  onClick={card.action}
                  className={`
                    flex items-center gap-2 p-2 cursor-pointer
                    hover:bg-muted/50 transition-colors group
                    ${index !== tenantCards.length - 1 ? "border-b border-border" : ""}
                  `}
                >
                  {/* Icon */}
                  <div className="w-6 h-6 rounded border border-border bg-background flex items-center justify-center shrink-0 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                    {card.icon}
                  </div>

                  {/* Title + description */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      {card.title}
                    </span>
                    <span className="text-muted-foreground/40 mx-2 text-xs select-none">—</span>
                    <span className="text-[13px] text-muted-foreground/70">
                      {card.description}
                    </span>
                  </div>

                  {/* Count */}
                  <span className="text-sm font-medium text-foreground tabular-nums shrink-0">
                    {card.count}
                  </span>

                  {/* Chevron */}
                  <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
                </div>
              ))}
            </div>

          </div>
        </div>
      ) : (
        <NoEntityUI />
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};

export default TenantLayoutLandingPage;