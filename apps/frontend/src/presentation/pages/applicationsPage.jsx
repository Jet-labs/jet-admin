import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Spinner,
} from "@jet-admin/ui";
import { ArrowRight, LayoutGrid, Plus, Rocket } from "lucide-react";
import { listApplicationsAPI } from "../../data/apis/application";
import { useAuthState } from "../../logic/hooks/useAuth";
import { ApplicationFeedback } from "../components/applicationComponents/applicationFeedback";
import { ApplicationCreateDialog } from "../components/applicationComponents/applicationCreateDialog";
import { CONSTANTS } from "../../constants";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
};

export default function ApplicationsPage() {
  const { tenantID } = useParams();
  const { firebaseUserState } = useAuthState();
  const principal = firebaseUserState?.user?.uid;
  const [creating, setCreating] = useState(false);
  const query = useQuery({
    queryKey: ["applications", principal, tenantID, "sidebar", ""],
    queryFn: ({ signal }) =>
      listApplicationsAPI({
        tenantID,
        params: { search: "", page: 1, pageSize: 100 },
        signal,
      }),
    enabled: !!principal && !!tenantID,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const applications = query.data?.applications || [];
  const totalCount = query.data?.totalCount || applications.length;
  const archivedCount = applications.filter(
    (app) => app.status === "ARCHIVED"
  ).length;
  const draftCount = applications.length - archivedCount;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <PageHeader
        title="Applications"
        subTitle={
          query.isPending
            ? "Loading application drafts"
            : `${totalCount} application${totalCount === 1 ? "" : "s"} · composition previews`
        }
      >
        <Button type="button" size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-3.5 w-3.5" />
          New application
        </Button>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <ApplicationFeedback error={query.error} onRetry={() => query.refetch()} />
        {query.isPending ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size={16} className="text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            message="Compose existing pages into a routed application. Choose a page, arrange routes, and publish an immutable release."
            action={
              <Button type="button" size="sm" onClick={() => setCreating(true)}>
                <Plus className="h-3.5 w-3.5" />
                New application
              </Button>
            }
          />
        ) : (
          <div className="mx-auto max-w-4xl space-y-3">
            <div className="rounded border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Rocket className="h-4 w-4" />
                    </span>
                    <h2 className="text-base font-semibold text-foreground">
                      Application studio
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pick an application from the sidebar to edit its navigation,
                    routes, state and release. The sidebar stays available while
                    you work, just like the page and widget builders.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded border border-border/60 bg-background px-3 py-2 text-center">
                    <p className="font-mono text-lg font-semibold text-foreground">
                      {applications.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total
                    </p>
                  </div>
                  <div className="rounded border border-border/60 bg-background px-3 py-2 text-center">
                    <p className="font-mono text-lg font-semibold text-foreground">
                      {draftCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Drafts
                    </p>
                  </div>
                  <div className="rounded border border-border/60 bg-background px-3 py-2 text-center">
                    <p className="font-mono text-lg font-semibold text-foreground">
                      {archivedCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Archived
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent applications
                </p>
                <span className="text-[10px] text-muted-foreground">
                  Select one in the sidebar or jump straight in
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {applications.slice(0, 6).map((app) => (
                  <Link
                    key={app.applicationID}
                    to={CONSTANTS.ROUTES.APPLICATION_STUDIO.path(
                      tenantID,
                      app.applicationID
                    )}
                    className="group flex min-w-0 items-center gap-2 rounded border border-border bg-card p-2.5 transition-colors hover:border-primary/40 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <LayoutGrid className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {app.title}
                        </span>
                        <Badge
                          variant={app.status === "ARCHIVED" ? "secondary" : "outline"}
                          className="shrink-0"
                        >
                          {app.status === "ARCHIVED" ? "Archived" : "Draft"}
                        </Badge>
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                        {app.slug} · updated {formatDate(app.updatedAt)}
                      </span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ApplicationCreateDialog
        tenantID={tenantID}
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  );
}
