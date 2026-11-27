import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Badge, Button, Input, Spinner } from "@jet-admin/ui";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { listApplicationsAPI } from "../../../../data/apis/application";
import { useAuthState } from "../../../../logic/hooks/useAuth";
import { CONSTANTS } from "../../../../constants";
import { ApplicationCreateDialog } from "../../applicationComponents/applicationCreateDialog";
import { ApplicationFeedback } from "../../applicationComponents/applicationFeedback";

export function ApplicationDrawerList({ tenantID: tenantIDProp = null }) {
  const params = useParams();
  const { tenantID: routeTenantID, applicationID } = params;
  const tenantID = tenantIDProp || routeTenantID;
  const { firebaseUserState } = useAuthState();
  const principal = firebaseUserState?.user?.uid;
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const debouncedSearch = useDebounce(search, 250);

  const query = useQuery({
    queryKey: ["applications", principal, tenantID, "sidebar", debouncedSearch],
    queryFn: ({ signal }) =>
      listApplicationsAPI({
        tenantID,
        params: { search: debouncedSearch, page: 1, pageSize: 100 },
        signal,
      }),
    enabled: !!principal && !!tenantID,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const applications = query.data?.applications || [];

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden bg-background">
      <div className="flex items-center gap-2 p-2 pb-0">
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-start"
          onClick={() => setCreating(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New application
        </Button>
      </div>

      <div className="px-2 py-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            type="text"
            size="sm"
            placeholder="Search applications..."
            className="w-full border-border/50 pl-8 focus:border-primary/30"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search applications"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 pt-0">
        {query.isPending ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner size={14} className="text-primary" />
          </div>
        ) : query.error ? (
          <ApplicationFeedback error={query.error} onRetry={() => query.refetch()} />
        ) : applications.length === 0 ? (
          <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-center text-[11px] text-muted-foreground">
            {debouncedSearch
              ? "No applications match this search."
              : "No applications yet. Create one to start composing pages."}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {applications.map((app) => {
              const active = app.applicationID === applicationID;
              return (
                <li key={app.applicationID}>
                  <Link
                    to={CONSTANTS.ROUTES.APPLICATION_STUDIO.path(
                      tenantID,
                      app.applicationID
                    )}
                    className={`flex min-w-0 items-center gap-2 rounded px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      active
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${
                        active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm ${
                          active ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {app.title}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground">
                        {app.slug}
                      </span>
                    </span>
                    <Badge
                      variant={app.status === "ARCHIVED" ? "secondary" : "outline"}
                      className="shrink-0 text-[9px]"
                    >
                      {app.status === "ARCHIVED" ? "Archived" : "Draft"}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border/60 px-2 py-1.5 text-[10px] text-muted-foreground">
        {query.isPending
          ? "Loading applications"
          : `${applications.length} application${applications.length === 1 ? "" : "s"}`}
      </div>

      <ApplicationCreateDialog
        tenantID={tenantID}
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  );
}

ApplicationDrawerList.propTypes = {
  tenantID: PropTypes.string,
};
