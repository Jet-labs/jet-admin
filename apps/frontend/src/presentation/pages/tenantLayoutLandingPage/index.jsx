import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { getUserTenantByIDAPI } from "../../../data/apis/tenant";
import { getAllCronJobsAPI } from "../../../data/apis/cronJob";
import { TenantLogo } from "../../components/tenantComponents/tenantLogo";
import { NoEntityUI } from "../../components/ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../../components/ui/reactQueryLoadingErrorWrapper";
import { Section } from "@jet-admin/ui";

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileCode2,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  PanelTop,
  Radio,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Small presentational helpers
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

/** A cron-job row shown in the scheduled-job panels */
const CronJobRow = ({ job, isLast, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50 transition-colors group ${!isLast ? "border-b border-border" : ""}`}
  >
    <div className="w-6 h-6 rounded border border-border bg-background flex items-center justify-center shrink-0 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
      <Clock className="w-3.5 h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-sm font-medium text-foreground truncate block">{job.cronJobTitle}</span>
      <span className="text-[12px] text-muted-foreground/60">{job.cronJobSchedule}</span>
    </div>
    {job.nextRunAt && (
      <span className="text-[11px] text-muted-foreground/50 shrink-0 hidden sm:block">
        Next: {moment(job.nextRunAt).fromNow()}
      </span>
    )}
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
   Main page
───────────────────────────────────────────────────────── */

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

  /* ── Scheduled jobs (lightweight list for the dashboard panels) ── */
  const { data: cronJobsData } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID), "dashboard"],
    queryFn: () => getAllCronJobsAPI({ tenantID, page: 1, pageSize: 50 }),
    enabled: !!tenantID,
    retry: 0,
  });

  const allJobs = Array.isArray(cronJobsData)
    ? cronJobsData
    : cronJobsData?.cronJobs ?? [];

  /* Split into disabled (failed-ish) and enabled (active/success) */
  const failedJobs = allJobs.filter((j) => j.isDisabled === true).slice(0, 5);
  const activeJobs = allJobs.filter((j) => j.isDisabled !== true).slice(0, 5);

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

          {/* ── Dashboard body ─────────────────────────────────────── */}
          <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">

            {/* ── Column 1 : Tenant info + Resources + Auth ────────── */}
            <div className="lg:col-span-1 flex flex-col gap-4">

              {/* Tenant info */}
              <Section title="Tenant">
                <div className="flex items-center gap-3 -m-2 p-2">
                  <span className="w-9 h-9 rounded border border-border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                    {tenant.tenantLogoURL ? (
                      <TenantLogo
                        src={tenant.tenantLogoURL}
                        alt="Tenant Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-4 h-4 text-muted-foreground" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tenant.tenantTitle}</p>
                    <p className="text-[12px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Created {moment(tenant.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                </div>
              </Section>

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
            </div>

            {/* ── Column 2-3 : Scheduled Jobs panels ───────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Active scheduled jobs */}
              <Section title="Active Scheduled Jobs" className="overflow-hidden">
                <div className="-m-2">
                  {activeJobs.length === 0 ? (
                    <EmptyState label="No active scheduled jobs" />
                  ) : (
                    activeJobs.map((job, idx) => (
                      <CronJobRow
                        key={job.cronJobID}
                        job={job}
                        isLast={idx === activeJobs.length - 1}
                        onClick={() =>
                          navigate(
                            CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.path(tenantID, job.cronJobID)
                          )
                        }
                      />
                    ))
                  )}
                </div>
              </Section>

              {/* Disabled scheduled jobs */}
              <Section title="Disabled Scheduled Jobs" className="overflow-hidden">
                <div className="-m-2">
                  {failedJobs.length === 0 ? (
                    <EmptyState label="No disabled scheduled jobs" />
                  ) : (
                    failedJobs.map((job, idx) => (
                      <CronJobRow
                        key={job.cronJobID}
                        job={job}
                        isLast={idx === failedJobs.length - 1}
                        onClick={() =>
                          navigate(
                            CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.path(tenantID, job.cronJobID)
                          )
                        }
                      />
                    ))
                  )}
                </div>
              </Section>

              {/* Scheduled jobs overview */}
              <Section title="Scheduled Jobs Overview">
                <div className="grid grid-cols-3 gap-2 -m-2 p-2">
                  {[
                    {
                      label: "Total",
                      value: tenant?.tenantCronJobCount ?? allJobs.length ?? 0,
                      highlight: "text-foreground",
                    },
                    {
                      label: "Active",
                      value: activeJobs.length,
                      highlight: "text-green-600 dark:text-green-400",
                    },
                    {
                      label: "Disabled",
                      value: failedJobs.length,
                      highlight: "text-destructive",
                    },
                  ].map((stat) => (
                    <button
                      key={stat.label}
                      onClick={() => navigate(CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID))}
                      className="rounded border border-border bg-background hover:bg-muted/50 transition-colors p-3 text-left"
                    >
                      <p className={`text-xl font-semibold tabular-nums ${stat.highlight}`}>
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{stat.label}</p>
                    </button>
                  ))}
                </div>
              </Section>
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