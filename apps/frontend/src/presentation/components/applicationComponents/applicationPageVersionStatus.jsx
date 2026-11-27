import React from "react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { Badge, SearchSelect, Spinner } from "@jet-admin/ui";
import { ExternalLink, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { getAssetVersionsAPI } from "../../../data/apis/assetVersion";
import {
  findDeployedVersion,
  resolvePageVersionReadiness,
} from "../../../logic/assetVersion/versionReadiness";
import { AssetVersionsButton } from "../assetVersionComponents/assetVersionsButton";

const shortHash = (hash) => (hash ? `${hash.slice(0, 10)}…` : null);

export const ApplicationPageVersionStatus = ({
  tenantID,
  asset,
  deployedRelease,
  onPin,
  pinDisabled = false,
}) => {
  const versionsQuery = useQuery({
    queryKey: CONSTANTS.REACT_QUERY_KEYS.ASSET_VERSIONS(
      tenantID,
      "appPage",
      asset.appPageID
    ),
    queryFn: () =>
      getAssetVersionsAPI({
        tenantID,
        assetType: "appPage",
        assetID: asset.appPageID,
        pageSize: 100,
      }),
    enabled: !!tenantID && !!asset.appPageID,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const versions = versionsQuery.error ? [] : versionsQuery.data?.versions || [];
  const latest = versions[0];
  const pinnedPageVersionID = asset.pageVersionID || null;
  const pinnedVersion = pinnedPageVersionID
    ? versions.find(
        (version) => version.assetVersionID === pinnedPageVersionID
      ) || null
    : null;
  const deployedPageVersionID = deployedRelease?.pageVersions?.[asset.assetKey];
  const deployedVersion = findDeployedVersion(versions, deployedPageVersionID);
  const status = versionsQuery.error
    ? { label: "Version access denied", variant: "destructive" }
    : resolvePageVersionReadiness({
        latest,
        deployedPageVersionID,
        pageVersionCount: deployedRelease?.pageVersionCount || 0,
        pinnedPageVersionID,
        pinnedVersion,
      });

  return (
    <div className="flex flex-wrap items-center gap-2 bg-background px-2 py-1.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted/50">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs font-medium text-foreground">
          {asset.assetKey}
        </p>
        <Link
          to={CONSTANTS.ROUTES.UPDATE_APP_PAGE_BY_ID.path(
            tenantID,
            asset.appPageID
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-primary/90 hover:text-primary"
        >
          Open {asset.managementMode === "managed" ? "managed page" : "shared page"}
          <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>

      <SearchSelect
        value={pinnedPageVersionID || ""}
        onChange={(value) => onPin?.(value || null)}
        options={[
          { value: "", label: "Capture latest at publish" },
          ...versions.map((version) => ({
            value: version.assetVersionID,
            label: `v${version.versionNumber} · ${shortHash(version.contentHash)}`,
          })),
        ]}
        placeholder="Capture latest at publish"
        size="sm"
        className="w-40 text-xs"
        disabled={
          pinDisabled ||
          !onPin ||
          versionsQuery.isPending ||
          !!versionsQuery.error
        }
      />

      {versionsQuery.isPending ? (
        <Spinner size={13} className="text-muted-foreground" />
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-1.5 text-[11px]">
          {pinnedVersion ? (
            <Badge variant="outline">Pinned v{pinnedVersion.versionNumber}</Badge>
          ) : pinnedPageVersionID ? (
            <Badge variant="outline">Pinned {shortHash(pinnedPageVersionID)}</Badge>
          ) : latest ? (
            <Badge variant="outline">Latest v{latest.versionNumber}</Badge>
          ) : null}
          {latest && pinnedVersion && latest.assetVersionID !== pinnedPageVersionID && (
            <span className="text-muted-foreground">
              latest v{latest.versionNumber}
            </span>
          )}
          {deployedVersion && (
            <span className="text-muted-foreground">
              deployed v{deployedVersion.versionNumber}
            </span>
          )}
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      )}

      <AssetVersionsButton
        tenantID={tenantID}
        assetType="appPage"
        assetID={asset.appPageID}
        label="Versions"
      />
    </div>
  );
};

ApplicationPageVersionStatus.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  asset: PropTypes.shape({
    assetKey: PropTypes.string.isRequired,
    appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    managementMode: PropTypes.oneOf(["referenced", "managed"]),
    pageVersionID: PropTypes.string,
  }).isRequired,
  deployedRelease: PropTypes.shape({
    pageVersionCount: PropTypes.number,
    pageVersions: PropTypes.objectOf(PropTypes.string),
  }),
  onPin: PropTypes.func,
  pinDisabled: PropTypes.bool,
};
