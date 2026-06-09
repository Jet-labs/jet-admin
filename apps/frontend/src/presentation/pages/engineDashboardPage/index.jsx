import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@jet-admin/ui";
import { Activity, Clock, Radio } from "lucide-react";
import { getListenerConnectionStatusAPI } from "../../../data/apis/listener";
import { getCronJobConnectionStatusAPI } from "../../../data/apis/cronJob";

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
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
      <div className="px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-2xl font-medium tracking-tight flex items-center">
          <Activity className="w-6 h-6 mr-2 text-primary" />
          Engine Management
        </h1>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Listeners Card */}
          <Card className="hover:shadow-lg transition-all duration-300 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Radio className="w-4 h-4 mr-2 text-primary animate-pulse" />
                Listener Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {Object.keys(listenerStatuses).length === 0 ? (
                    <div className="text-sm text-muted-foreground">No active listeners.</div>
                  ) : (
                    Object.entries(listenerStatuses).map(([id, status]) => (
                      <div key={id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">{status.title || `Listener ${id}`}</span>
                          <span className="text-xs text-muted-foreground">{status.type || 'Unknown'}</span>
                        </div>
                        <Badge variant={status.state === 'running' ? 'default' : 'destructive'} className={status.state === 'running' ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" : ""}>
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
          <Card className="hover:shadow-lg transition-all duration-300 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary animate-pulse" />
                Cron Job Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {Object.keys(cronJobStatuses).length === 0 ? (
                    <div className="text-sm text-muted-foreground">No scheduled cron jobs.</div>
                  ) : (
                    Object.entries(cronJobStatuses).map(([id, status]) => (
                      <div key={id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Cron Job {id}</span>
                        </div>
                        <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">{status.state}</Badge>
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
