const STATUS = {
  notVersioned: { label: "Not versioned", variant: "secondary" },
  legacy: { label: "Legacy release", variant: "secondary" },
  newOnPublish: { label: "New on publish", variant: "outline" },
  current: { label: "Up to date", variant: "success" },
  upgrade: { label: "Upgrade on publish", variant: "warning" },
  pinnedCurrent: { label: "Pinned · up to date", variant: "success" },
  pinnedPending: { label: "Pinned · deploy pending", variant: "warning" },
  pinnedUnavailable: { label: "Pinned version unavailable", variant: "destructive" },
};

export function resolvePageVersionReadiness({
  latest,
  deployedPageVersionID,
  pageVersionCount = 0,
  pinnedPageVersionID,
  pinnedVersion,
}) {
  if (pinnedPageVersionID) {
    if (!pinnedVersion) return STATUS.pinnedUnavailable;
    if (deployedPageVersionID === pinnedPageVersionID) return STATUS.pinnedCurrent;
    return STATUS.pinnedPending;
  }
  if (!latest) return STATUS.notVersioned;
  if (!deployedPageVersionID && pageVersionCount === 0) return STATUS.legacy;
  if (!deployedPageVersionID) return STATUS.newOnPublish;
  if (deployedPageVersionID === latest.assetVersionID) return STATUS.current;
  return STATUS.upgrade;
}

export function findDeployedVersion(versions = [], deployedPageVersionID) {
  if (!deployedPageVersionID) return null;
  return (
    versions.find(
      (version) => version.assetVersionID === deployedPageVersionID
    ) || null
  );
}
