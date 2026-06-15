import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { Badge, Button, Label, Spinner, SearchSelect, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { Plus, X } from "lucide-react";

import { useDebounce } from "@uidotdev/usehooks";

import { useInfiniteAppPages } from "../../../logic/hooks/useAppPages";
import { useInfiniteDataQueries } from "../../../logic/hooks/useDataQueries";
import { useInfiniteWorkflows } from "../../../logic/hooks/useWorkflows";
import { useInfiniteDatasources } from "../../../logic/hooks/useDatasources";
import { useInfiniteListeners } from "../../../logic/hooks/useListeners";
import { useInfiniteCronJobs } from "../../../logic/hooks/useCronJobs";
import { useInfiniteWidgets } from "../../../logic/hooks/useWidgets";

export const TenantAssetPermissionsInput = ({ value = [], onChange, error }) => {
  const { tenantID } = useParams();

  // Selection states (moved up for search hook)
  const [selectedType, setSelectedType] = useState("");
  const [selectedAssetID, setSelectedAssetID] = useState("");
  const [selectedAction, setSelectedAction] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Fetch all assets
  const { appPages = [], isLoadingAppPages, fetchNextPage: fetchNextAppPages, hasNextPage: hasNextAppPages, isFetchingNextPage: isFetchingNextAppPages } = useInfiniteAppPages(tenantID, selectedType === "appPage" ? debouncedSearch : "");
  const { dataQueries = [], isLoadingDataQueries, fetchNextPage: fetchNextDataQueries, hasNextPage: hasNextDataQueries, isFetchingNextPage: isFetchingNextDataQueries } = useInfiniteDataQueries(tenantID, selectedType === "dataquery" ? debouncedSearch : "");
  const { workflows = [], isLoadingWorkflows, fetchNextPage: fetchNextWorkflows, hasNextPage: hasNextWorkflows, isFetchingNextPage: isFetchingNextWorkflows } = useInfiniteWorkflows(tenantID, selectedType === "workflow" ? debouncedSearch : "");
  const { datasources = [], isLoadingDatasources, fetchNextPage: fetchNextDatasources, hasNextPage: hasNextDatasources, isFetchingNextPage: isFetchingNextDatasources } = useInfiniteDatasources(tenantID, selectedType === "datasource" ? debouncedSearch : "");
  const { listeners = [], isLoadingListeners, fetchNextPage: fetchNextListeners, hasNextPage: hasNextListeners, isFetchingNextPage: isFetchingNextListeners } = useInfiniteListeners(tenantID, selectedType === "listener" ? debouncedSearch : "");
  const { cronJobs = [], isLoadingCronJobs, fetchNextPage: fetchNextCronJobs, hasNextPage: hasNextCronJobs, isFetchingNextPage: isFetchingNextCronJobs } = useInfiniteCronJobs(tenantID, selectedType === "cronjob" ? debouncedSearch : "");
  const { widgets = [], isLoadingWidgets, fetchNextPage: fetchNextWidgets, hasNextPage: hasNextWidgets, isFetchingNextPage: isFetchingNextWidgets } = useInfiniteWidgets(tenantID, selectedType === "widget" ? debouncedSearch : "");

  const isLoadingAssets =
    isLoadingAppPages ||
    isLoadingDataQueries ||
    isLoadingWorkflows ||
    isLoadingDatasources ||
    isLoadingListeners ||
    isLoadingCronJobs ||
    isLoadingWidgets;

  // Build lists for selection dropdowns
  const assetLists = useMemo(() => ({
    appPage: (appPages || []).map(p => ({ id: p.appPageID, title: p.appPageTitle })),
    dataquery: (dataQueries || []).map(q => ({ id: q.dataQueryID, title: q.dataQueryTitle })),
    workflow: (workflows || []).map(w => ({ id: w.workflowID, title: w.title })),
    datasource: (datasources || []).map(d => ({ id: d.datasourceID, title: d.datasourceTitle })),
    listener: (listeners || []).map(l => ({ id: l.listenerID, title: l.listenerTitle })),
    cronjob: (cronJobs || []).map(c => ({ id: c.cronJobID, title: c.cronJobTitle })),
    widget: (widgets || []).map(w => ({ id: w.widgetID, title: w.widgetTitle })),
  }), [appPages, dataQueries, workflows, datasources, listeners, cronJobs, widgets]);

  // Build name lookup map
  const assetNameMap = useMemo(() => {
    const map = {};
    (appPages || []).forEach(p => { map[p.appPageID] = p.appPageTitle; });
    (dataQueries || []).forEach(q => { map[q.dataQueryID] = q.dataQueryTitle; });
    (workflows || []).forEach(w => { map[w.workflowID] = w.title; });
    (datasources || []).forEach(d => { map[d.datasourceID] = d.datasourceTitle; });
    (listeners || []).forEach(l => { map[l.listenerID] = l.listenerTitle; });
    (cronJobs || []).forEach(c => { map[c.cronJobID] = c.cronJobTitle; });
    (widgets || []).forEach(w => { map[w.widgetID] = w.widgetTitle; });
    return map;
  }, [appPages, dataQueries, workflows, datasources, listeners, cronJobs, widgets]);



  const handleAdd = () => {
    if (!selectedType || !selectedAssetID || !selectedAction) return;

    const exists = value.some(
      (item) =>
        item.resourceType === selectedType &&
        item.resourceID === selectedAssetID &&
        item.action === selectedAction
    );

    if (!exists) {
      const newValue = [
        ...value,
        {
          resourceType: selectedType,
          resourceID: selectedAssetID,
          action: selectedAction,
        },
      ];
      onChange({ target: { value: newValue } });
    }

    setSelectedAssetID("");
    setSelectedAction("");
  };

  const handleRemove = (indexToRemove) => {
    const newValue = value.filter((_, idx) => idx !== indexToRemove);
    onChange({ target: { value: newValue } });
  };

  const getActionsForType = (type) => {
    if (type === "dataquery") {
      return ["read", "update", "delete", "run"];
    }
    if (type === "workflow") {
      return ["read", "update", "delete", "execute"];
    }
    return ["read", "update", "delete"];
  };

  const resourceTypeLabels = {
    appPage: "App Page",
    dataquery: "Data Query",
    workflow: "Workflow",
    datasource: "Datasource",
    listener: "Listener",
    cronjob: "Cron Job",
    widget: "Widget",
  };

  return (
    <div className="space-y-2">
      {/* Existing permissions list */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Active Asset Permissions</Label>
        {value.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-2 text-center text-xs text-muted-foreground">
            No asset-specific permissions defined yet. Use the tool below to define granular policies.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground"
              >
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                  {resourceTypeLabels[item.resourceType] || item.resourceType}:
                </span>
                <span className="font-medium">
                  {assetNameMap[item.resourceID] || item.resourceID}
                </span>
                <span className="text-muted-foreground">
                  ({item.action})
                </span>
                <Button
                  type="button"
                  variant="destructive-ghost"
                  size="icon"
                  onClick={() => handleRemove(idx)}
                  className="h-4 w-4 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form to add a new asset permission */}
      <div className="rounded-md border border-border p-2 bg-muted/20 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add Granular Asset Rule
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* Asset Type Select */}
          <div className="space-y-1">
            <Label htmlFor="asset-type">Asset Type</Label>
            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val);
                setSelectedAssetID("");
                setSelectedAction("");
                setSearch("");
              }}
            >
              <SelectTrigger id="asset-type" className="h-8 text-sm">
                <SelectValue placeholder="Select Type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(resourceTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Select */}
          <div className="space-y-1">
            <Label htmlFor="asset-item">Specific Asset</Label>
            <SearchSelect
              disabled={!selectedType || isLoadingAssets}
              className="h-8 text-sm"
              value={selectedAssetID}
              onChange={(val) => setSelectedAssetID(val)}
              options={(assetLists[selectedType] || []).map((asset) => ({
                value: asset.id,
                label: asset.title || asset.id,
              }))}
              placeholder={isLoadingAssets ? "Loading Assets..." : "Select Asset..."}
              onSearchChange={setSearch}
              onLoadMore={() => {
                if (selectedType === "appPage") fetchNextAppPages();
                if (selectedType === "dataquery") fetchNextDataQueries();
                if (selectedType === "workflow") fetchNextWorkflows();
                if (selectedType === "datasource") fetchNextDatasources();
                if (selectedType === "listener") fetchNextListeners();
                if (selectedType === "cronjob") fetchNextCronJobs();
                if (selectedType === "widget") fetchNextWidgets();
              }}
              hasNextPage={
                selectedType === "appPage" ? hasNextAppPages :
                selectedType === "dataquery" ? hasNextDataQueries :
                selectedType === "workflow" ? hasNextWorkflows :
                selectedType === "datasource" ? hasNextDatasources :
                selectedType === "listener" ? hasNextListeners :
                selectedType === "cronjob" ? hasNextCronJobs :
                selectedType === "widget" ? hasNextWidgets : false
              }
              isFetchingNextPage={
                selectedType === "appPage" ? isFetchingNextAppPages :
                selectedType === "dataquery" ? isFetchingNextDataQueries :
                selectedType === "workflow" ? isFetchingNextWorkflows :
                selectedType === "datasource" ? isFetchingNextDatasources :
                selectedType === "listener" ? isFetchingNextListeners :
                selectedType === "cronjob" ? isFetchingNextCronJobs :
                selectedType === "widget" ? isFetchingNextWidgets : false
              }
            />
          </div>

          {/* Action Select */}
          <div className="space-y-1">
            <Label htmlFor="asset-action">Allowed Action</Label>
            <div className="flex gap-2">
              <Select
                value={selectedAction}
                onValueChange={(val) => setSelectedAction(val)}
                disabled={!selectedAssetID}
              >
                <SelectTrigger id="asset-action" className="h-8 text-sm flex-1">
                  <SelectValue placeholder="Select Action..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedType &&
                    getActionsForType(selectedType).map((act) => (
                      <SelectItem key={act} value={act}>
                        {act}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={!selectedType || !selectedAssetID || !selectedAction}
                size="default"
                square
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

TenantAssetPermissionsInput.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};
