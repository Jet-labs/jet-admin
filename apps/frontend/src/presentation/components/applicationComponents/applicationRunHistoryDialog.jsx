import React, { useState } from "react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@jet-admin/ui";
import { Activity } from "lucide-react";
import { listApplicationWorkflowRunsAPI } from "../../../data/apis/application";

const statusVariant = (status) => {
  if (["COMPLETED"].includes(status)) return "success";
  if (["FAILED", "CANCELLED", "STOPPED"].includes(status)) return "destructive";
  if (["RUNNING", "PENDING"].includes(status)) return "warning";
  return "outline";
};

export const ApplicationRunHistoryDialog = ({
  tenantID,
  applicationID,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const runsQuery = useQuery({
    queryKey: ["application-workflow-runs", tenantID, applicationID],
    queryFn: () =>
      listApplicationWorkflowRunsAPI({
        tenantID,
        applicationID,
        environment: "production",
        limit: 50,
      }),
    enabled: open,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const runs = runsQuery.data?.runs || [];

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
        title="Recent application workflow runs"
      >
        <Activity className="h-3.5 w-3.5" />
        Run history
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Workflow run history
            </DialogTitle>
            <DialogDescription>
              Recent production runs started by this application, resolved from
              release provenance. This list is read-only; observe or cancel a
              run from its page.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[70vh] overflow-auto">
            {runsQuery.isPending ? (
              <div className="flex h-24 items-center justify-center">
                <Spinner size={16} className="text-primary" />
              </div>
            ) : runsQuery.error ? (
              <p className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                {runsQuery.error.message || "Run history is unavailable."}
              </p>
            ) : runs.length === 0 ? (
              <p className="rounded border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
                No application workflow runs were recorded for production yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded border border-border/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1.5">Status</th>
                      <th className="px-2 py-1.5">Run</th>
                      <th className="px-2 py-1.5">Route / action</th>
                      <th className="px-2 py-1.5">Release</th>
                      <th className="px-2 py-1.5">Caller</th>
                      <th className="px-2 py-1.5">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {runs.map((run) => (
                      <tr key={run.instanceID} className="align-top">
                        <td className="px-2 py-1.5">
                          <Badge
                            variant={statusVariant(run.status)}
                            className="text-[9px] uppercase"
                          >
                            {run.status}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="font-mono text-[10px]">
                            {run.instanceID.slice(0, 12)}…
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            {run.workflowID?.slice(0, 12)}…
                          </p>
                        </td>
                        <td className="px-2 py-1.5">
                          <p className="font-medium text-foreground">
                            {run.routeID || "—"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {run.pageAssetKey}.{run.alias}
                          </p>
                        </td>
                        <td className="px-2 py-1.5">
                          <p className="text-[11px] text-muted-foreground">
                            {run.releaseID?.slice(0, 12) || "—"}…
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {run.environment}
                          </p>
                        </td>
                        <td className="px-2 py-1.5 text-[11px] text-muted-foreground">
                          {run.callerType || "—"}
                        </td>
                        <td className="px-2 py-1.5 text-[11px] text-muted-foreground">
                          {run.createdAt
                            ? new Date(run.createdAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

ApplicationRunHistoryDialog.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  applicationID: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
