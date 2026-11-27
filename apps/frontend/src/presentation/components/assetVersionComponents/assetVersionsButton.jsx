import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Separator,
  Spinner,
  Textarea,
} from "@jet-admin/ui";
import { ChevronDown, ChevronRight, GitCompare, History, Plus, RotateCcw } from "lucide-react";
import { CONSTANTS } from "../../../constants";
import {
  createAssetVersionAPI,
  getAssetVersionDiffAPI,
  getAssetVersionImpactAPI,
  getAssetVersionsAPI,
  restoreAssetVersionAPI,
} from "../../../data/apis/assetVersion";
import { displayError, displayInfo, displaySuccess } from "../../../utils/notification";

const ASSET_TYPE_LABELS = {
  datasource: "Datasource",
  listener: "Listener",
  query: "Query",
  cronjob: "Cron job",
  widget: "Widget",
  workflow: "Workflow",
  appPage: "App Page",
};

const shortHash = (hash) => (hash ? `${hash.slice(0, 12)}…` : "no hash");
const assetTypeLabel = (type) => ASSET_TYPE_LABELS[type] || type;

function VersionImpact({ tenantID, assetType, assetID, versionID }) {
  const impact = useQuery({
    queryKey: [
      ...CONSTANTS.REACT_QUERY_KEYS.ASSET_VERSIONS(tenantID, assetType, assetID),
      versionID,
      "impact",
    ],
    queryFn: () =>
      getAssetVersionImpactAPI({ tenantID, assetType, assetID, versionID }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (impact.isPending) {
    return (
      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-2 py-2 text-xs text-muted-foreground">
        <Spinner size={13} />
        Checking references…
      </div>
    );
  }
  if (impact.error) {
    return (
      <p className="border-t border-destructive/30 bg-destructive/10 px-2 py-2 text-xs text-destructive">
        {impact.error.message || "References are unavailable."}
      </p>
    );
  }
  const usedBy = impact.data?.usedBy || [];
  if (!usedBy.length) {
    return (
      <p className="border-t border-border/60 bg-muted/20 px-2 py-2 text-xs text-muted-foreground">
        Not referenced by another version or Application release yet. This
        version stays retained as immutable history.
      </p>
    );
  }
  return (
    <div className="space-y-1.5 border-t border-border/60 bg-muted/20 px-2 py-2">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Used by
      </p>
      <ul className="space-y-1">
        {usedBy.map((item) => {
          if (item.type === "applicationRelease") {
            return (
              <li
                key={`release:${item.releaseID}`}
                className="flex flex-wrap items-center gap-1.5 text-xs"
              >
                <Badge variant="secondary">Application</Badge>
                <span className="font-medium text-foreground">
                  {item.applicationTitle || item.applicationID}
                </span>
                <span className="text-muted-foreground">
                  Release {item.releaseNumber}
                </span>
                {item.environments?.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    Deployed: {item.environments.join(", ")}
                  </span>
                )}
              </li>
            );
          }
          return (
            <li
              key={`version:${item.assetVersionID}`}
              className="flex flex-wrap items-center gap-1.5 text-xs"
            >
              <Badge variant="outline">{assetTypeLabel(item.assetType)}</Badge>
              <span className="font-medium text-foreground">
                {item.title || item.assetID}
              </span>
              <span className="text-muted-foreground">v{item.versionNumber}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {shortHash(item.contentHash)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

VersionImpact.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  assetType: PropTypes.string.isRequired,
  assetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  versionID: PropTypes.string.isRequired,
};

const previewValue = (value) => {
  if (value === undefined) return "—";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 220 ? `${text.slice(0, 217)}…` : text;
};

function VersionDiff({
  tenantID,
  assetType,
  assetID,
  version,
  versions = [],
  versionsKey,
  onRestore,
  restoring = false,
}) {
  const [againstVersionID, setAgainstVersionID] = useState("draft");
  const againstVersion = versions.find(
    (item) => item.assetVersionID === againstVersionID
  );
  const comparingDraft = againstVersionID === "draft";
  const diff = useQuery({
    queryKey: [...versionsKey, version.assetVersionID, "diff", againstVersionID],
    queryFn: () =>
      getAssetVersionDiffAPI({
        tenantID,
        assetType,
        assetID,
        versionID: version.assetVersionID,
        againstVersionID: comparingDraft ? undefined : againstVersionID,
      }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (diff.isPending) {
    return (
      <div className="flex items-center gap-2 border-t border-border/60 px-2 py-2 text-xs text-muted-foreground">
        <Spinner size={13} />
        Comparing with the current draft…
      </div>
    );
  }
  if (diff.error) {
    return (
      <p className="border-t border-destructive/30 bg-destructive/10 px-2 py-2 text-xs text-destructive">
        {diff.error.message || "The version diff is unavailable."}
      </p>
    );
  }

  const changes = diff.data?.changes || [];
  return (
    <div className="space-y-2 border-t border-border/60 bg-muted/10 px-2 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {comparingDraft
            ? "Version → current draft"
            : `v${version.versionNumber} → v${againstVersion?.versionNumber ?? "?"}`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[11px]"
          disabled={restoring}
          onClick={() => onRestore(version, diff.data?.currentUpdatedAt)}
        >
          {restoring ? <Spinner size={12} /> : <RotateCcw className="h-3 w-3" />}
          Restore draft
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground">Compare with</span>
        <select
          className="h-7 rounded border border-border bg-background px-2 text-[11px]"
          value={againstVersionID}
          onChange={(event) => setAgainstVersionID(event.target.value)}
        >
          <option value="draft">Current draft</option>
          {versions
            .filter((item) => item.assetVersionID !== version.assetVersionID)
            .map((item) => (
              <option key={item.assetVersionID} value={item.assetVersionID}>
                Version {item.versionNumber}
              </option>
            ))}
        </select>
      </div>
      {diff.data?.dependencyChanges?.length > 0 && (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 p-1.5">
          <p className="px-1 pb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            Captured dependency changes
          </p>
          <div className="space-y-1">
            {diff.data.dependencyChanges.map((dependency) => (
              <div
                key={`${dependency.assetType}:${dependency.assetID}`}
                className="flex flex-wrap items-center gap-1.5 rounded bg-background/60 px-1.5 py-1 text-[11px]"
              >
                <Badge variant="outline" className="text-[9px] uppercase">
                  {dependency.assetType}
                </Badge>
                <span className="font-medium">
                  {dependency.title || dependency.assetID.slice(0, 8)}
                </span>
                <span className="text-muted-foreground">
                  {dependency.change === "added"
                    ? "captured"
                    : dependency.change === "removed"
                      ? "no longer captured"
                      : "version changed"}
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {dependency.beforeVersionNumber
                    ? `v${dependency.beforeVersionNumber}`
                    : "—"}{" "}
                  →{" "}
                  {dependency.afterVersionNumber
                    ? `v${dependency.afterVersionNumber}`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
          <p className="px-1 pt-1 text-[10px] text-amber-800/80 dark:text-amber-300/80">
            These dependency versions are captured inside the selected
            version. A changed query version can create a new workflow version
            without any live workflow edit.
          </p>
        </div>
      )}
      {changes.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {comparingDraft
            ? `The current draft already matches version ${version.versionNumber}.`
            : `Version ${version.versionNumber} matches version ${againstVersion?.versionNumber}.`}
        </p>
      ) : (
        <div className="space-y-1">
          {comparingDraft && (
            <p className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-1 text-[11px] text-amber-800 dark:text-amber-300">
              Live edits are not part of version {version.versionNumber}. Create a
              new version (or publish) to capture them.
            </p>
          )}
          <div className="max-h-64 space-y-1 overflow-y-auto rounded border border-border/60 bg-background p-1.5">
          {changes.map((change, index) => (
            <div
              key={`${change.path}:${index}`}
              className="rounded px-1.5 py-1 text-[11px] odd:bg-muted/30"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={
                    change.change === "added"
                      ? "success"
                      : change.change === "removed"
                        ? "destructive"
                        : "outline"
                  }
                  className="text-[9px] uppercase"
                >
                  {change.change}
                </Badge>
                <span className="break-all font-mono text-[10px] text-muted-foreground">
                  {change.path}
                </span>
              </div>
              <div className="mt-0.5 grid gap-1 sm:grid-cols-2">
                <div className="break-all text-muted-foreground">
                  <span className="font-semibold">before:</span>{" "}
                  {previewValue(change.before)}
                </div>
                <div className="break-all text-foreground">
                  <span className="font-semibold">after:</span>{" "}
                  {previewValue(change.after)}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
      {diff.data?.truncated && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400">
          Diff truncated at 500 entries.
        </p>
      )}
      <p className="text-[11px] text-muted-foreground">
        Restore writes the mutable draft/source row only. Immutable versions and
        published releases are unchanged.
      </p>
    </div>
  );
}

VersionDiff.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  assetType: PropTypes.string.isRequired,
  assetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  version: PropTypes.object.isRequired,
  versions: PropTypes.array,
  versionsKey: PropTypes.array.isRequired,
  onRestore: PropTypes.func.isRequired,
  restoring: PropTypes.bool,
};

export const AssetVersionsButton = ({
  tenantID,
  assetType,
  assetID,
  label = "Versions",
  disabled = false,
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [expandedVersionID, setExpandedVersionID] = useState(null);
  const [diffVersionID, setDiffVersionID] = useState(null);
  const versionsKey = CONSTANTS.REACT_QUERY_KEYS.ASSET_VERSIONS(
    tenantID,
    assetType,
    assetID
  );

  const versionsQuery = useQuery({
    queryKey: versionsKey,
    queryFn: () => getAssetVersionsAPI({ tenantID, assetType, assetID }),
    enabled: open && !!tenantID && !!assetID,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const createVersion = useMutation({
    mutationFn: () =>
      createAssetVersionAPI({ tenantID, assetType, assetID, changeNote }),
    onSuccess: async (version) => {
      setChangeNote("");
      setExpandedVersionID(version.assetVersionID);
      if (version.reused) {
        displayInfo(
          `Content is unchanged. Version ${version.versionNumber} is already current.`
        );
      } else {
        displaySuccess(
          `Created immutable version ${version.versionNumber} for this ${assetTypeLabel(
            assetType
          ).toLowerCase()}.`
        );
      }
      await queryClient.invalidateQueries({ queryKey: versionsKey });
    },
    onError: displayError,
  });

  const versions = versionsQuery.data?.versions || [];

  const restoreVersion = useMutation({
    mutationFn: ({ versionID, expectedUpdatedAt }) =>
      restoreAssetVersionAPI({
        tenantID,
        assetType,
        assetID,
        versionID,
        expectedUpdatedAt,
      }),
    onSuccess: async () => {
      displaySuccess(
        "Version restored into the mutable draft. Published releases are unchanged."
      );
      await queryClient.invalidateQueries();
      setDiffVersionID(null);
      setExpandedVersionID(null);
    },
    onError: displayError,
  });

  const handleRestore = (version, expectedUpdatedAt) => {
    if (
      !window.confirm(
        `Restore version ${version.versionNumber} into the current draft? Immutable versions and published releases are unchanged.`
      )
    ) {
      return;
    }
    restoreVersion.mutate({
      versionID: version.assetVersionID,
      expectedUpdatedAt: expectedUpdatedAt || undefined,
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled || !assetID}
        title="Immutable versions, change notes and reference impact"
      >
        <History className="h-3.5 w-3.5" />
        {label}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setExpandedVersionID(null);
            setDiffVersionID(null);
            setChangeNote("");
          }
        }}
      >
        <DialogContent className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              {assetTypeLabel(assetType)} versions
            </DialogTitle>
            <DialogDescription>
              Versions freeze the saved definition. They are immutable and
              referenced by exact version ID.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-2 rounded border border-border/60 bg-muted/20 p-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Create version
              </p>
              <Textarea
                value={changeNote}
                onChange={(event) => setChangeNote(event.target.value)}
                placeholder="What changed? Stored with this immutable version."
                rows={2}
                maxLength={2000}
                className="text-xs"
                disabled={createVersion.isPending}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  Save editor changes first. Unchanged content reuses the latest
                  version.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => createVersion.mutate()}
                  disabled={createVersion.isPending || !assetID}
                >
                  {createVersion.isPending ? (
                    <Spinner size={14} />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Create version
                </Button>
              </div>
            </div>

            <Separator />

            {versionsQuery.isPending ? (
              <div className="flex h-20 items-center justify-center">
                <Spinner size={16} className="text-primary" />
              </div>
            ) : versionsQuery.error ? (
              <p className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                {versionsQuery.error.message || "Version history is unavailable."}
              </p>
            ) : versions.length === 0 ? (
              <p className="rounded border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
                No versions yet. Create one here, or publish an Application that
                uses this {assetTypeLabel(assetType).toLowerCase()} to capture
                versions automatically.
              </p>
            ) : (
              <div className="space-y-1.5">
                {versions.map((version, index) => {
                  const expanded = expandedVersionID === version.assetVersionID;
                  return (
                    <div
                      key={version.assetVersionID}
                      className="overflow-hidden rounded border border-border/60 bg-background"
                    >
                      <button
                        type="button"
                        className="flex w-full flex-wrap items-center gap-2 px-2 py-1.5 text-left hover:bg-muted/30"
                        onClick={() => {
                          const next = expanded ? null : version.assetVersionID;
                          setExpandedVersionID(next);
                          if (!next) setDiffVersionID(null);
                        }}
                        aria-expanded={expanded}
                      >
                        {expanded ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <Badge variant="outline">v{version.versionNumber}</Badge>
                        {index === 0 && <Badge variant="success">Latest</Badge>}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {shortHash(version.contentHash)}
                        </span>
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </button>
                      {version.changeNote && (
                        <p className="border-t border-border/50 px-2 py-1.5 text-xs text-foreground">
                          {version.changeNote}
                        </p>
                      )}
                      {expanded && (
                        <>
                          <VersionImpact
                            tenantID={tenantID}
                            assetType={assetType}
                            assetID={assetID}
                            versionID={version.assetVersionID}
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-2 py-1.5">
                            <p className="text-[11px] text-muted-foreground">
                              Compare this immutable version with the current
                              draft.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px]"
                              onClick={() =>
                                setDiffVersionID(
                                  diffVersionID === version.assetVersionID
                                    ? null
                                    : version.assetVersionID
                                )
                              }
                            >
                              <GitCompare className="h-3 w-3" />
                              {diffVersionID === version.assetVersionID
                                ? "Hide diff"
                                : "Compare"}
                            </Button>
                          </div>
                          {diffVersionID === version.assetVersionID && (
                            <VersionDiff
                              tenantID={tenantID}
                              assetType={assetType}
                              assetID={assetID}
                              version={version}
                              versions={versionsQuery.data?.versions || []}
                              versionsKey={versionsKey}
                              onRestore={handleRestore}
                              restoring={restoreVersion.isPending}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

AssetVersionsButton.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  assetType: PropTypes.oneOf(Object.keys(ASSET_TYPE_LABELS)).isRequired,
  assetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  disabled: PropTypes.bool,
};
