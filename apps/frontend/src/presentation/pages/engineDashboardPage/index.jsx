import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@jet-admin/ui";
import { Activity, Clock, Radio } from "lucide-react";
import { getListenerConnectionStatusAPI } from "../../../data/apis/listener";
import { getCronJobConnectionStatusAPI } from "../../../data/apis/cronJob";

const ACTIVE_BADGE_CLASS =
  "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30";
const INACTIVE_BADGE_CLASS =
  "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30";

const EngineDashboardPage = () => {
  const { tenantID } = useParams();
  const [listenerStatuses, setListenerStatuses] = useState({});
  const [cronJobStatuses, setCronJobStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const [listenersRes, cronJobsRes] = await Promise.all([
          getListenerConnectionStatusAPI({ tenantID }),
          getCronJobConnectionStatusAPI({ tenantID }),
        ]);
        if (listenersRes.success) setListenerStatuses(listenersRes.status || {});
        if (cronJobsRes.success) setCronJobStatuses(cronJobsRes.status || {});
      } catch (error) {
        console.error("Failed to fetch engine statuses", error);
      } finally {
        setLoading(false);
      }
    };
    if (tenantID) {
      fetchStatuses();
      const interval = setInterval(fetchStatuses, 5000);
      return () => clearInterval(interval);
    }
  }, [tenantID]);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-background px-6 py-4">
        <h1 className="flex items-center text-2xl font-medium tracking-tight text-foreground">
          <Activity className="mr-2 h-6 w-6 text-primary" aria-hidden="true" />
          Engine Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live listener proxy and scheduled-job status for this workspace.
        </p>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-2 md:grid-cols-2">
          {/* Listeners Card */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Radio className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
                Listener Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : listenerStatuses.mode === "proxy" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-sm font-medium">Ingress mode</span>
                    <Badge variant="outline" className={ACTIVE_BADGE_CLASS}>
                      {listenerStatuses.mode}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-sm font-medium">Assignment version</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {listenerStatuses.assignmentVersion ?? "—"}
                    </span>
                  </div>
                  {(listenerStatuses.proxies || []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      {listenerStatuses.placement === "unavailable"
                        ? "Listener proxy placement is unavailable."
                        : "No active listener proxies."}
                    </div>
                  ) : (
                    listenerStatuses.proxies.map((proxy) => (
                      <div
                        key={proxy.proxyID}
                        className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{proxy.proxyID}</span>
                          <span className="text-xs text-muted-foreground">
                            {proxy.version || "unknown version"} ·{" "}
                            {(proxy.assignedListeners || []).length} listener(s)
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            proxy.status === "active"
                              ? ACTIVE_BADGE_CLASS
                              : INACTIVE_BADGE_CLASS
                          }
                        >
                          {proxy.status || "unknown"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.keys(listenerStatuses).length === 0 ? (
                    <div className="text-sm text-muted-foreground">No active listeners.</div>
                  ) : (
                    Object.entries(listenerStatuses).map(([id, status]) => (
                      <div
                        key={id}
                        className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {status.title || `Listener ${id}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {status.type || "Unknown"}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            status.state === "running"
                              ? ACTIVE_BADGE_CLASS
                              : INACTIVE_BADGE_CLASS
                          }
                        >
                          {status.state}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cron Jobs Card */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Clock className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
                Cron Job Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : (
                <div className="space-y-2">
                  {Object.keys(cronJobStatuses).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No scheduled cron jobs.
                    </div>
                  ) : (
                    Object.entries(cronJobStatuses).map(([id, status]) => (
                      <div
                        key={id}
                        className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Cron Job {id}</span>
                        </div>
                        <Badge variant="outline" className={ACTIVE_BADGE_CLASS}>
                          {status.state}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EngineDashboardPage;
