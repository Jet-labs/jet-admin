/**
 * AppPageVersionHistory
 *
 * History icon-button (sits in the update-form PageHeader next to clone /
 * delete / export) opening a dialog with the page's version timeline:
 * list every snapshot, preview any version read-only, restore with a
 * confirmation. Restores snapshot current state first, so every restore
 * is itself undoable from this same dialog.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, RotateCcw, Eye } from "lucide-react";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { CONSTANTS } from "../../../../constants";
import {
  getAppPageVersionsAPI,
  getAppPageVersionByIDAPI,
  restoreAppPageVersionAPI,
} from "../../../../data/apis/appPage";
import { useGlobalUI } from "../../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../../utils/notification";
import { AppPageView } from "../viewer/AppPageView";
import { ReactQueryLoadingErrorWrapper } from "../../ui/reactQueryLoadingErrorWrapper";

import {
  Button,
  Spinner,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  Badge,
} from "@jet-admin/ui";

const formatWhen = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso || "");
  }
};

export const AppPageVersionHistory = ({ tenantID, appPageID }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersionID, setSelectedVersionID] = useState(null);
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const versionsKey = [...CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID), appPageID, "versions"];

  const {
    data: versionsData,
    isLoading: isLoadingVersions,
    error: versionsError,
    refetch: refetchVersions,
  } = useQuery({
    queryKey: versionsKey,
    queryFn: () => getAppPageVersionsAPI({ tenantID, appPageID, page: 1, pageSize: 50 }),
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const {
    data: selectedVersion,
    isLoading: isLoadingVersion,
    error: versionError,
  } = useQuery({
    queryKey: [...versionsKey, selectedVersionID],
    queryFn: () =>
      getAppPageVersionByIDAPI({ tenantID, appPageID, versionID: selectedVersionID }),
    enabled: isOpen && !!selectedVersionID,
    refetchOnWindowFocus: false,
  });

  const { isPending: isRestoring, mutate: restoreVersion } = useMutation({
    mutationFn: (versionID) => restoreAppPageVersionAPI({ tenantID, appPageID, versionID }),
    retry: false,
    onSuccess: () => {
      displaySuccess("Version restored. The editor now shows the restored state.");
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID)],
      });
      setIsOpen(false);
      setSelectedVersionID(null);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const handleRestore = async (version) => {
    const confirmed = await showConfirmation({
      title: `Restore v${version.versionNumber}?`,
      message:
        "Current state is snapshotted first, so this restore is itself undoable from history.",
      confirmText: "Restore",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    restoreVersion(version.appPageVersionID);
  };

  const versions = versionsData?.versions || [];

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        className="shrink-0"
        aria-label="Version history"
        title="Version history"
        onClick={() => {
          setSelectedVersionID(null);
          setIsOpen(true);
        }}
      >
        <History className="h-3 w-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setSelectedVersionID(null); } }}>
        <DialogContent className="max-w-6xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>
              Every save snapshots the page. Preview any version, restore with one click.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[70vh] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3 p-1">
              <div className="flex flex-col gap-1.5 min-w-0">
                <ReactQueryLoadingErrorWrapper
                  isLoading={isLoadingVersions}
                  error={versionsError}
                  refetch={refetchVersions}
                >
                  {versions.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">
                      No versions yet — save the page to create the first snapshot.
                    </p>
                  ) : (
                    versions.map((v) => (
                      <div
                        key={v.appPageVersionID}
                        className={`rounded border p-2 flex flex-col gap-1 cursor-pointer transition-colors ${
                          selectedVersionID === v.appPageVersionID
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedVersionID(v.appPageVersionID)}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">v{v.versionNumber}</Badge>
                          <span className="text-xs font-medium truncate flex-1">
                            {v.appPageTitle || "Untitled"}
                          </span>
                        </div>
                        {v.changeNote && (
                          <span className="text-[11px] text-muted-foreground truncate">{v.changeNote}</span>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground">{formatWhen(v.createdAt)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[11px]"
                            disabled={isRestoring}
                            onClick={(e) => { e.stopPropagation(); handleRestore(v); }}
                          >
                            {isRestoring ? <Spinner size={12} /> : <><RotateCcw className="h-3 w-3 mr-1" />Restore</>}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </ReactQueryLoadingErrorWrapper>
              </div>

              <div className="min-w-0 min-h-[300px] rounded border border-border bg-muted/30 overflow-hidden flex flex-col">
                {!selectedVersionID ? (
                  <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Select a version to preview it.
                    </p>
                  </div>
                ) : (
                  <ReactQueryLoadingErrorWrapper
                    isLoading={isLoadingVersion}
                    error={versionError}
                  >
                    {selectedVersion?.appPageConfig ? (
                      <div className="flex-1 min-h-[300px] flex flex-col overflow-hidden">
                        <AppPageView
                          tenantID={tenantID}
                          pageID={appPageID}
                          pageConfig={selectedVersion.appPageConfig}
                          syncVariablesToUrl={false}
                        />
                      </div>
                    ) : null}
                  </ReactQueryLoadingErrorWrapper>
                )}
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

AppPageVersionHistory.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
