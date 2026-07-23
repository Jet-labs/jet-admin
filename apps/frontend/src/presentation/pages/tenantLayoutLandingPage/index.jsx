import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { CONSTANTS } from "../../../constants";
import { getUserTenantByIDAPI } from "../../../data/apis/tenant";
import { getAllCronJobsAPI } from "../../../data/apis/cronJob";
import { getAllListenersAPI } from "../../../data/apis/listener";
import { getAuditLogsAPI } from "../../../data/apis/auditLog";
import { getAllDatasourcesAPI } from "../../../data/apis/datasource";
import { NoEntityUI } from "../../components/ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../../components/ui/reactQueryLoadingErrorWrapper";
import { Button, PageHeader, Section } from "@jet-admin/ui";
import { TenantLogo } from "../../components/tenantComponents/tenantLogo";


import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Database,
  FileCode2,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  PanelTop,
  Radio,
  Settings,
  ShieldCheck,
  Store,
  Users,
  XCircle,
  AlertCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────────────────────── */

/** A single compact resource row */
const ResourceRow = ({ icon, title, description, count, onClick, isLast }) => (
  <div
    onClick={onClick}
    className={`
      flex items-center gap-2 p-2 cursor-pointer
      hover:bg-muted/50 transition-colors group
      ${!isLast ? "border-b border-border" : ""}
    `}
  >
    <div className="w-6 h-6 rounded border border-border bg-background flex items-center justify-center shrink-0 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-muted-foreground/40 mx-2 text-xs select-none">—</span>
      <span className="text-[13px] text-muted-foreground/70">{description}</span>
    </div>
    <span className="text-sm font-medium text-foreground tabular-nums shrink-0">{count}</span>
    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
  </div>
);

/** Empty state for a section */
const EmptyState = ({ label }) => (
  <div className="flex items-center justify-center p-6 text-[12px] text-muted-foreground/50 select-none">
    {label}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Shared Doughnut chart wrapper (Recharts)
───────────────────────────────────────────────────────────── */

/**
 * Segments: array of { value, color, label }
 * Zero-value segments are hidden automatically.
 * Total count is rendered in the centre via an SVG <text> label.
 */
const DonutChart = ({ segments, total }) => {
  // Chart canvas size — slightly larger than the ring to give breathing room
  const SIZE = 88;
  const MARGIN = 4;                  // margin on each side so arcs don't clip
  const INNER = 24;
  const OUTER = 36;
  const CENTER = SIZE / 2;           // true centre of the SVG

  const hasData = total > 0 && segments.some((s) => s.value > 0);

  const chartData = hasData
    ? segments.filter((s) => s.value > 0)
    : [{ value: 1, color: "rgba(120,120,120,0.15)", label: "" }];

  return (
    <div className="shrink-0" style={{ width: SIZE, height: SIZE, overflow: "visible" }}>
      <PieChart
        width={SIZE}
        height={SIZE}
        margin={{ top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }}
      >
        <RechartsTooltip
          formatter={(val, name) => [val, name]}
          contentStyle={{
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--popover)",
            color: "var(--popover-foreground)",
          }}
        />
        <Pie
          data={chartData}
          cx={CENTER}
          cy={CENTER}
          innerRadius={INNER}
          outerRadius={OUTER}
          dataKey="value"
          nameKey="label"
          paddingAngle={chartData.length > 1 ? 2 : 0}
          strokeWidth={0}
          isAnimationActive
          animationDuration={400}
          labelLine={false}
        >
          {chartData.map((seg, i) => (
            <Cell key={i} fill={seg.color} />
          ))}
        </Pie>
        {/* Centre total — same x/y as Pie cx/cy, dy="0.35em" for reliable vertical centering */}
        {/* {hasData && (
          <text
            x={CENTER}
            y={CENTER}
            textAnchor="middle"
            dy="0.35em"
            fontSize="13"
            fontWeight="700"
            fill="currentColor"
          >
            {total}
          </text>
        )} */}
      </PieChart>
    </div>
  );
};



const ListenerStats = ({ tenantID, navigate }) => {
  const { data: listenerData } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID), "dashboard-stats"],
    queryFn: () => getAllListenersAPI({ tenantID, page: 1, pageSize: 50 }),
    enabled: !!tenantID,
    retry: 0,
    refetchInterval: 15000,
  });

  const listeners = Array.isArray(listenerData)
    ? listenerData
    : (listenerData?.listeners ?? []);

  const activeCount = listeners.filter((l) => l.status === "active").length;
  const inactiveCount = listeners.filter((l) => l.status === "inactive" || !l.status).length;
  const errorCount = listeners.filter((l) => l.status === "error").length;
  const total = listeners.length;

  return (
    <Section title="Listeners" className="overflow-hidden">
      {total === 0 ? (
        <EmptyState label="No listeners configured" />
      ) : (
        <div className="space-y-3">
          {/* Donut + legend */}
          <div className="flex items-center gap-4">
            <DonutChart
              total={total}
              segments={[
                { value: activeCount, color: "#22c55e", label: "Active" },
                { value: inactiveCount, color: "#f59e0b", label: "Inactive" },
                { value: errorCount, color: "#ef4444", label: "Error" },
              ]}
            />
            <div className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-muted-foreground">Active</span>
                <span className="ml-auto font-semibold tabular-nums text-foreground pl-3">{activeCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-muted-foreground">Inactive</span>
                <span className="ml-auto font-semibold tabular-nums text-foreground pl-3">{inactiveCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-muted-foreground">Error</span>
                <span className="ml-auto font-semibold tabular-nums text-foreground pl-3">{errorCount}</span>
              </div>
              <div className="flex items-center gap-1.5 border-t border-border pt-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                <span className="text-muted-foreground">Total</span>
                <span className="ml-auto font-semibold tabular-nums text-foreground pl-3">{total}</span>
              </div>
            </div>
          </div>

          {/* Top 5 listeners */}
          <div className="border-t border-border -mx-2">
            {listeners.slice(0, 5).map((ls, idx) => {
              const statusCls =
                ls.status === "active"
                  ? "bg-green-500/10 text-green-500"
                  : ls.status === "error"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-amber-500/10 text-amber-500";
              return (
                <div
                  key={ls.listenerID}
                  onClick={() => navigate(CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID))}
                  className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors group ${idx < Math.min(listeners.length, 5) - 1 ? "border-b border-border" : ""
                    }`}
                >
                  <Radio className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-foreground font-medium block truncate">
                      {ls.listenerTitle}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 capitalize">
                      {ls.listenerType}
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0 capitalize ${statusCls}`}>
                    {ls.status || "inactive"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate(CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID))}
            className="text-[11px] text-primary hover:underline w-full text-right pr-0.5"
          >
            View all listeners →
          </button>
        </div>
      )}
    </Section>
  );
};

/* ─────────────────────────────────────────────────────────────
   Audit Log Activity Feed
───────────────────────────────────────────────────────────── */

const AUDIT_TYPE_COLORS = {
  CREATE: "text-green-500 bg-green-500/10",
  UPDATE: "text-blue-500 bg-blue-500/10",
  DELETE: "text-red-500 bg-red-500/10",
  READ: "text-muted-foreground bg-muted/50",
  LOGIN: "text-purple-500 bg-purple-500/10",
  EXECUTE: "text-amber-500 bg-amber-500/10",
};

const getAuditTypeStyle = (type = "") => {
  const key = type.toUpperCase();
  return AUDIT_TYPE_COLORS[key] || "text-muted-foreground bg-muted/50";
};

const AuditFeed = ({ tenantID, navigate }) => {
  const { data: auditData } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.AUDIT_LOGS(tenantID), "dashboard-feed"],
    queryFn: () => getAuditLogsAPI({ tenantID, page: 1, pageSize: 8 }),
    enabled: !!tenantID,
    retry: 0,
    refetchInterval: 15000,
  });

  const logs = auditData?.auditLogs ?? [];

  return (
    <Section title="Recent Activity" className="overflow-hidden">
      {logs.length === 0 ? (
        <EmptyState label="No recent activity" />
      ) : (
        <div className="-m-2">
          {logs.map((log, idx) => (
            <div
              key={log.auditLogID}
              className={`flex items-start gap-2 p-2 ${idx < logs.length - 1 ? "border-b border-border" : ""}`}
            >
              {/* success/fail icon */}
              <div className="shrink-0 mt-0.5">
                {log.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* type badge */}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${getAuditTypeStyle(log.type)}`}>
                    {log.type}
                  </span>
                  {log.subType && (
                    <span className="text-[11px] text-muted-foreground/70 truncate">{log.subType}</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  {moment(log.createdAt).fromNow()}
                </p>
              </div>
            </div>
          ))}
            <div className="p-2 pt-1">
              <button
                onClick={() => navigate(CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.path(tenantID))}
                className="text-[11px] text-primary hover:underline w-full text-right"
              >
                View all audit logs →
              </button>
            </div>
          </div>
      )}
    </Section>
  );
};

/* ─────────────────────────────────────────────────────────────
   Datasource Connection Status Grid
───────────────────────────────────────────────────────────── */

const DS_STATUS_META = {
  active: { label: "Active", icon: CheckCircle2, className: "text-green-500 bg-green-500/10 border-green-500/20" },
  inactive: { label: "Inactive", icon: Circle, className: "text-muted-foreground bg-muted/50 border-border" },
  error: { label: "Error", icon: AlertCircle, className: "text-red-500 bg-red-500/10 border-red-500/20" },
};

const DatasourceStatusGrid = ({ tenantID, navigate }) => {
  const { data: dsData } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID), "dashboard-status"],
    queryFn: () => getAllDatasourcesAPI({ tenantID, page: 1, pageSize: 20 }),
    enabled: !!tenantID,
    retry: 0,
    refetchInterval: 20000,
  });

  const datasources = Array.isArray(dsData) ? dsData : (dsData?.datasources ?? []);

  return (
    <Section title="Datasource Status" className="overflow-hidden">
      {datasources.length === 0 ? (
        <EmptyState label="No datasources connected" />
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {datasources.slice(0, 8).map((ds) => {
              const status = ds.connectionStatus || "inactive";
              const meta = DS_STATUS_META[status] || DS_STATUS_META.inactive;
              const Icon = meta.icon;
              return (
                <button
                  key={ds.datasourceID}
                  onClick={() => navigate(CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID))}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-left hover:opacity-80 transition-opacity ${meta.className}`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{ds.datasourceTitle}</p>
                    <p className="text-[10px] opacity-70 capitalize">{ds.datasourceType}</p>
                  </div>
                </button>
              );
            })}
            </div>

            {/* Summary counts */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-border">
              {[
                { label: "Active", value: datasources.filter((d) => d.connectionStatus === "active").length, cls: "text-green-500" },
                { label: "Inactive", value: datasources.filter((d) => !d.connectionStatus || d.connectionStatus === "inactive").length, cls: "text-muted-foreground" },
                { label: "Error", value: datasources.filter((d) => d.connectionStatus === "error").length, cls: "text-red-500" },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => navigate(CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID))}
                  className="rounded border border-border bg-background hover:bg-muted/50 transition-colors p-2 text-center"
                >
                  <p className={`text-lg font-semibold tabular-nums ${s.cls}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground/60">{s.label}</p>
                </button>
              ))}
            </div>

            {datasources.length > 8 && (
              <button
                onClick={() => navigate(CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID))}
                className="text-[11px] text-primary hover:underline w-full text-right"
              >
                +{datasources.length - 8} more datasources →
              </button>
            )}
          </div>
      )}
    </Section>
  );
};

/* ─────────────────────────────────────────────────────────────
   Scheduled Jobs Stats — donut + top 5 list
───────────────────────────────────────────────────────────── */

const CronJobStats = ({ tenantID, navigate }) => {
  const { data: cronJobsData } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID), "dashboard-stats"],
    queryFn: () => getAllCronJobsAPI({ tenantID, page: 1, pageSize: 50 }),
    enabled: !!tenantID,
    retry: 0,
    refetchInterval: 30000,
  });

  const allJobs = Array.isArray(cronJobsData)
    ? cronJobsData
    : (cronJobsData?.cronJobs ?? []);

  const activeCount = allJobs.filter((j) => !j.isDisabled).length;
  const disabledCount = allJobs.filter((j) => j.isDisabled).length;
  const total = allJobs.length;

  return (
    <Section title="Scheduled Jobs" className="overflow-hidden">
      {total === 0 ? (
        <EmptyState label="No scheduled jobs configured" />
      ) : (
        <div className="space-y-3">
          {/* Donut + legend */}
          <div className="flex items-center gap-4">
            <DonutChart
              total={total}
              segments={[
                { value: activeCount, color: "#22c55e", label: "Active" },
                { value: disabledCount, color: "#ef4444", label: "Disabled" },
              ]}
            />
            <div className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-muted-foreground">Active</span>
                <span className="ml-auto font-semibold tabular-nums text-foreground pl-3">{activeCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-muted-foreground">Disabled</span>
                <span className="ml-auto font-semibold tabular-nums text-foreground pl-3">{disabledCount}</span>
              </div>
              <div className="flex items-center gap-1.5 border-t border-border pt-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                <span className="text-muted-foreground">Total</span>
                <span className="ml-auto font-semibold tabular-nums text-foreground pl-3">{total}</span>
              </div>
            </div>
          </div>

          {/* Top 5 cron jobs */}
          <div className="border-t border-border -mx-2">
            {allJobs.slice(0, 5).map((job, idx) => (
              <div
                key={job.cronJobID}
                onClick={() =>
                  navigate(CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.path(tenantID, job.cronJobID))
                }
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors group ${idx < Math.min(allJobs.length, 5) - 1 ? "border-b border-border" : ""
                  }`}
              >
                <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-foreground font-medium block truncate">
                    {job.cronJobTitle}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {job.cronJobSchedule}
                    {job.nextRunAt && (
                      <span className="ml-1.5 opacity-70">· next {moment(job.nextRunAt).fromNow()}</span>
                    )}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${job.isDisabled
                      ? "bg-red-500/10 text-red-500"
                      : "bg-green-500/10 text-green-500"
                    }`}
                >
                  {job.isDisabled ? "Disabled" : "Active"}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID))}
            className="text-[11px] text-primary hover:underline w-full text-right pr-0.5"
          >
            View all scheduled jobs →
          </button>
        </div>
      )}
    </Section>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────── */

const TenantLayoutLandingPage = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();

  /* ── Tenant data ── */
  const {
    isLoading: isLoadingTenant,
    data: tenant,
    error: tenantError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS, tenantID],
    queryFn: () => getUserTenantByIDAPI({ tenantID }),
    retry: 0,
  });

  /* ── Resource cards ── */
  const resourceCards = [
    {
      title: "Data Sources",
      icon: <Database className="w-3.5 h-3.5" />,
      count: tenant?.tenantDatasourceCount ?? 0,
      description: "External data source connections",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID)),
    },
    {
      title: "Saved Queries",
      icon: <FileCode2 className="w-3.5 h-3.5" />,
      count: tenant?.tenantDataQueryCount ?? 0,
      description: "Stored database query definitions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_QUERIES.path(tenantID)),
    },
    {
      title: "Data Listeners",
      icon: <Radio className="w-3.5 h-3.5" />,
      count: tenant?.tenantListenerCount ?? 0,
      description: "Real-time data event listeners",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID)),
    },
    {
      title: "Workflows",
      icon: <GitBranch className="w-3.5 h-3.5" />,
      count: tenant?.tenantWorkflowCount ?? 0,
      description: "Visual automation and pipelines",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_WORKFLOWS.path(tenantID)),
    },
    {
      title: "Widgets",
      icon: <PanelTop className="w-3.5 h-3.5" />,
      count: tenant?.tenantWidgetCount ?? 0,
      description: "Reusable data visualization components",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_WIDGETS.path(tenantID)),
    },
    {
      title: "App Pages",
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      count: tenant?.tenantAppPageCount ?? tenant?.tenantDashboardCount ?? 0,
      description: "Composed widget layouts and views",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_APP_PAGES.path(tenantID)),
    },
  ];

  /* ── Auth cards ── */
  const authCards = [
    {
      title: "Users",
      icon: <Users className="w-3.5 h-3.5" />,
      count: tenant?.relationships?.length ?? 0,
      description: "Manage users and access permissions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID)),
    },
    {
      title: "Roles",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      count: tenant?.tenantRolesCount ?? 0,
      description: "Permission sets and access control groups",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID)),
    },
    {
      title: "API Keys",
      icon: <KeyRound className="w-3.5 h-3.5" />,
      count: tenant?.tenantAPIKeyCount ?? 0,
      description: "Programmatic access credentials",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)),
    },
  ];

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenant}
      error={tenantError}
    >
      {tenant ? (
        <div className="bg-background w-full h-full flex flex-col overflow-auto">
          <PageHeader
            title={tenant?.tenantTitle}
            id={tenantID}
            leadingChildren={
              tenant.tenantLogoURL ? (
                <TenantLogo
                  src={tenant.tenantLogoURL}
                  alt="Tenant Logo"
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <Store className="w-4 h-4 text-muted-foreground" />
              )
            }
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(CONSTANTS.ROUTES.MANAGE_TENANT.path(tenantID))}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </PageHeader>

          {/* ── Dashboard body ─────────────────────────────────────── */}
          <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1">

            {/* ── Column 1 : Resources + Auth + Datasource Status ── */}
            <div className="lg:col-span-1 flex flex-col gap-2">

              {/* Resources */}
              <Section title="Resources" className="overflow-hidden">
                <div className="-m-2">
                  {resourceCards.map((card, idx) => (
                    <ResourceRow
                      key={card.title}
                      icon={card.icon}
                      title={card.title}
                      description={card.description}
                      count={card.count}
                      onClick={card.action}
                      isLast={idx === resourceCards.length - 1}
                    />
                  ))}
                </div>
              </Section>

              {/* Auth & Access */}
              <Section title="Auth & Access" className="overflow-hidden">
                <div className="-m-2">
                  {authCards.map((card, idx) => (
                    <ResourceRow
                      key={card.title}
                      icon={card.icon}
                      title={card.title}
                      description={card.description}
                      count={card.count}
                      onClick={card.action}
                      isLast={idx === authCards.length - 1}
                    />
                  ))}
                </div>
              </Section>

              {/* Datasource connection status */}
              <DatasourceStatusGrid tenantID={tenantID} navigate={navigate} />
            </div>

            {/* ── Column 2-3 : Right panels ─────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-2">

              {/* Stats row: Listener stats + Scheduled Jobs side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ListenerStats tenantID={tenantID} navigate={navigate} />
                <CronJobStats tenantID={tenantID} navigate={navigate} />
              </div>

              {/* Audit feed full width below */}
              <AuditFeed tenantID={tenantID} navigate={navigate} />
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