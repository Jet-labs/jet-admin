import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";
import { getAssetVersionsAPI } from "../../../../data/apis/assetVersion";
import { useEntityItems } from "../../../../logic/hooks/useEntityItems";
import { parseWidgetKey } from "./appPageLayoutUtils";

const WidgetVersionRow = ({ widgetID, widgetTitle, selection, onChange, tenantID }) => {
  const versionMode =
    selection?.versionMode || (selection?.widgetVersionID ? "specific" : "latest-at-capture");
  const { data, isLoading } = useQuery({
    queryKey: ["asset-versions", tenantID, "widget", widgetID],
    queryFn: () =>
      getAssetVersionsAPI({
        tenantID,
        assetType: "widget",
        assetID: widgetID,
        page: 1,
        pageSize: 100,
      }),
    enabled: Boolean(tenantID) && Boolean(widgetID),
    refetchOnWindowFocus: false,
  });
  const versions = data?.versions || [];

  return (
    <div className="rounded border border-border/60 bg-background/30 p-2 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">
            {widgetTitle || widgetID.slice(0, 8)}
          </p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{widgetID}</p>
        </div>
        <Select
          value={versionMode}
          onValueChange={(value) =>
            onChange({
              versionMode: value,
              ...(value === "latest-at-capture" ? { widgetVersionID: "" } : {}),
            })
          }
        >
          <SelectTrigger className="h-7 w-[180px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest-at-capture">Latest at capture</SelectItem>
            <SelectItem value="specific">Specific version</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(versionMode === "specific" || selection?.widgetVersionID) && (
        <Select
          value={selection?.widgetVersionID ? String(selection.widgetVersionID) : ""}
          onValueChange={(value) => onChange({ versionMode: "specific", widgetVersionID: value })}
          disabled={isLoading}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Choose a widget version…" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((version) => (
              <SelectItem key={version.assetVersionID} value={String(version.assetVersionID)}>
                v{version.versionNumber}
                {version.createdAt ? ` · ${new Date(version.createdAt).toLocaleString()}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {!isLoading && versions.length === 0 && versionMode === "specific" && (
        <p className="text-[10px] text-destructive">No versions exist for this widget yet.</p>
      )}
      <p className="text-[10px] text-muted-foreground">
        Resolved when this page version is created. Deployed pages keep the captured version.
      </p>
    </div>
  );
};

WidgetVersionRow.propTypes = {
  widgetID: PropTypes.string.isRequired,
  widgetTitle: PropTypes.string,
  selection: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  tenantID: PropTypes.string.isRequired,
};

export const AppPageWidgetVersionsEditor = ({ appPageEditorForm }) => {
  const { tenantID } = useParams();
  const { items: widgets = [] } = useEntityItems({ tenantID, entityType: "widget" });
  const placedWidgets = appPageEditorForm.values?.appPageConfig?.widgets || [];
  const selections = appPageEditorForm.values?.appPageConfig?.widgetVersionSelections || {};

  const widgetIDs = useMemo(() => {
    const ids = new Set();
    for (const item of placedWidgets) {
      const widgetID = typeof item === "string" ? parseWidgetKey(item) : item?.widgetID;
      if (widgetID) ids.add(String(widgetID));
    }
    return [...ids];
  }, [placedWidgets]);

  const titles = useMemo(
    () => Object.fromEntries(widgets.map((widget) => [String(widget.widgetID), widget.widgetTitle])),
    [widgets]
  );

  const updateSelection = (widgetID, patch) => {
    const nextSelections = {
      ...selections,
      [widgetID]: { ...(selections[widgetID] || {}), ...patch },
    };
    appPageEditorForm.setFieldValue("appPageConfig", {
      ...(appPageEditorForm.values.appPageConfig || {}),
      widgetVersionSelections: nextSelections,
    });
  };

  if (widgetIDs.length === 0) {
    return (
      <div className="p-3 text-xs text-muted-foreground">
        Place a widget on this page to choose its captured version.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Widget versions
        </Label>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          One version is captured per widget on this page. Same widget on multiple pages can use
          different versions.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {widgetIDs.map((widgetID) => (
          <WidgetVersionRow
            key={widgetID}
            widgetID={widgetID}
            widgetTitle={titles[widgetID]}
            selection={selections[widgetID]}
            onChange={(patch) => updateSelection(widgetID, patch)}
            tenantID={tenantID}
          />
        ))}
      </div>
    </div>
  );
};

AppPageWidgetVersionsEditor.propTypes = {
  appPageEditorForm: PropTypes.object.isRequired,
};
