import React, { useCallback, useState, useMemo } from "react";
import { Plus, Trash2, Key, Database, PanelTop, MessageSquare, ChevronDown, ChevronUp, Info, GitBranch } from 'lucide-react';
import PropTypes from "prop-types";
import { getWidgetEventTypes, getWidgetMethods, getEventInputDefinitions } from "@jet-admin/widget-types";
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { useParams } from "react-router-dom";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { useInfiniteDataQueries } from "../../../logic/hooks/useDataQueries";
import { useInfiniteWorkflows } from "../../../logic/hooks/useWorkflows";
import { CONSTANTS } from "../../../constants";
import { getWidgetByIDAPI } from "../../../data/apis/widget";
import { getDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { getWorkflowByIDAPI } from "../../../data/apis/workflow";
import { useDebounce } from "@uidotdev/usehooks";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  SearchSelect,
} from "@jet-admin/ui";

const ACTION_TYPES = [
  {
    value: "SET_VARIABLE",
    label: "Set Page Variable",
    icon: Key,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
    description: "Update a page state variable",
  },
  {
    value: "EXECUTE_QUERY",
    label: "Execute Data Source",
    icon: Database,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
    description: "Run a page-level data source",
  },
  // {
  //   value: "CALL_WIDGET_METHOD",
  //   label: "Call Widget Method",
  //   icon: PanelTop,
  //   color: "text-muted-foreground",
  //   bg: "bg-muted/50",
  //   border: "border-border/50",
  //   description: "Invoke a method on another widget",
  // },
  {
    value: "SHOW_TOAST",
    label: "Show Toast",
    icon: MessageSquare,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
    description: "Show a toast notification",
  },
  {
    value: "TRIGGER_WORKFLOW",
    label: "Trigger Workflow",
    icon: GitBranch,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
    description: "Run a background workflow directly",
  },
  {
    value: "TRIGGER_QUERY",
    label: "Trigger Query",
    icon: Database,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
    description: "Run a data query directly",
  },
];

const getShallowKeys = (obj) => {
  if (!obj) return {};
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = null; // null value prevents CodeMirror schema walker from traversing deeper
    return acc;
  }, {});
};

export const WidgetEventsEditor = ({ widgetEditorForm, stateTree, appPageEditorForm }) => {
  WidgetEventsEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
    stateTree: PropTypes.object,
    appPageEditorForm: PropTypes.object,
  };

  const { tenantID } = useParams();
  const queryClient = useQueryClient();
  const [querySearch, setQuerySearch] = useState("");
  const debouncedQuerySearch = useDebounce(querySearch, 300);
  const { dataQueries = [], isLoadingDataQueries, fetchNextPage: fetchNextQueriesPage, hasNextPage: hasNextQueriesPage, isFetchingNextPage: isFetchingNextQueriesPage } = useInfiniteDataQueries(tenantID, debouncedQuerySearch);

  const [workflowSearch, setWorkflowSearch] = useState("");
  const debouncedWorkflowSearch = useDebounce(workflowSearch, 300);
  const { workflows = [], isLoadingWorkflows, fetchNextPage: fetchNextWorkflowsPage, hasNextPage: hasNextWorkflowsPage, isFetchingNextPage: isFetchingNextWorkflowsPage } = useInfiniteWorkflows(tenantID, debouncedWorkflowSearch);

  // Page-level data sources from appPageConfig
  const pageDataSources = useMemo(
    () => appPageEditorForm?.values?.appPageConfig?.dataSources || [],
    [appPageEditorForm?.values?.appPageConfig?.dataSources]
  );

  const events = widgetEditorForm.values.widgetConfig?.events || {};

  // Collect all queryIDs and workflowIDs needed for input definitions
  const neededQueryIDsStr = useMemo(() => {
    const ids = new Set();
    pageDataSources.forEach(ds => { if (ds.type === "query" && ds.queryID) ids.add(String(ds.queryID)); });
    Object.values(events).flat().forEach(action => {
      if (action.actionType === "TRIGGER_QUERY" && action.config?.queryID) ids.add(String(action.config.queryID));
    });
    return Array.from(ids).sort().join(",");
  }, [pageDataSources, events]);

  const neededQueryIDs = useMemo(() => {
    return neededQueryIDsStr ? neededQueryIDsStr.split(",") : [];
  }, [neededQueryIDsStr]);

  const neededWorkflowIDsStr = useMemo(() => {
    const ids = new Set();
    pageDataSources.forEach(ds => { if (ds.type === "workflow" && ds.workflowID) ids.add(String(ds.workflowID)); });
    Object.values(events).flat().forEach(action => {
      if (action.actionType === "TRIGGER_WORKFLOW" && action.config?.workflowID) ids.add(String(action.config.workflowID));
    });
    return Array.from(ids).sort().join(",");
  }, [pageDataSources, events]);

  const neededWorkflowIDs = useMemo(() => {
    return neededWorkflowIDsStr ? neededWorkflowIDsStr.split(",") : [];
  }, [neededWorkflowIDsStr]);

  const queryOptions = useMemo(() => {
    return neededQueryIDs.map((id) => ({
      queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID), "detail", id],
      queryFn: () => getDataQueryByIDAPI({ tenantID, dataQueryID: id }),
      staleTime: Infinity,
    }));
  }, [neededQueryIDs, tenantID]);

  const queryDetails = useQueries({
    queries: queryOptions
  });

  const workflowOptions = useMemo(() => {
    return neededWorkflowIDs.map((id) => ({
      queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), "detail", id],
      queryFn: () => getWorkflowByIDAPI({ tenantID, workflowID: id }),
      staleTime: Infinity,
    }));
  }, [neededWorkflowIDs, tenantID]);

  const workflowDetails = useQueries({
    queries: workflowOptions
  });

  const resolvedQueries = useMemo(() => queryDetails.map(q => q.data).filter(Boolean), [queryDetails]);
  const resolvedWorkflows = useMemo(() => workflowDetails.map(q => q.data).filter(Boolean), [workflowDetails]);

  // Look up input definitions for a page-level data source by alias
  const getInputDefinitionsForAlias = useCallback((alias) => {
    const ds = pageDataSources.find((s) => s.alias === alias);
    if (!ds) return [];
    if (ds.type === "query" && ds.queryID) {
      const q = resolvedQueries.find((q) => String(q.dataQueryID) === String(ds.queryID));
      return q?.dataQueryOptions?.inputDefinitions || [];
    }
    if (ds.type === "workflow" && ds.workflowID) {
      const wf = resolvedWorkflows.find((w) => String(w.workflowID) === String(ds.workflowID));
      return wf?.workflowOptions?.inputDefinitions || [];
    }
    return [];
  }, [pageDataSources, resolvedQueries, resolvedWorkflows]);

  const getInputDefinitionsForDirectAction = useCallback((actionType, config) => {
    if (actionType === "TRIGGER_QUERY" && config?.queryID) {
      const q = resolvedQueries.find((q) => String(q.dataQueryID) === String(config.queryID));
      return q?.dataQueryOptions?.inputDefinitions || [];
    }
    if (actionType === "TRIGGER_WORKFLOW" && config?.workflowID) {
      const wf = resolvedWorkflows.find((w) => String(w.workflowID) === String(config.workflowID));
      return wf?.workflowOptions?.inputDefinitions || [];
    }
    return [];
  }, [resolvedQueries, resolvedWorkflows]);

  const placedIDs = useMemo(() => {
    const placedKeys = appPageEditorForm?.values?.appPageConfig?.widgets || [];
    return Array.from(new Set(placedKeys.map((k) => String(k).split("_")[1])));
  }, [appPageEditorForm?.values?.appPageConfig?.widgets]);

  const widgetQueryOptions = useMemo(() => {
    return placedIDs.map((id) => ({
      queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), id],
      queryFn: () => getWidgetByIDAPI({ tenantID, widgetID: id }),
      staleTime: Infinity,
    }));
  }, [placedIDs, tenantID]);

  const widgetQueries = useQueries({
    queries: widgetQueryOptions,
  });

  const pageWidgets = useMemo(() => {
    return widgetQueries.map((q) => q.data).filter(Boolean);
  }, [widgetQueries]);


  const [expandedActionPath, setExpandedActionPath] = useState(null);

  const widgetType = widgetEditorForm.values.widgetType;

  // Wrap stateTree so {{ state.X }} resolves correctly in the JS sandbox
  const liveStateTree = useMemo(() => stateTree ? { state: stateTree } : null, [stateTree]);
  const variablesStateTree = useMemo(() => stateTree ? { state: { variables: getShallowKeys(stateTree.variables) } } : null, [stateTree]);
  const dataSourcesStateTree = useMemo(() => stateTree ? { state: { queries: getShallowKeys(stateTree.queries), workflows: getShallowKeys(stateTree.workflows) } } : null, [stateTree]);
  const widgetsStateTree = useMemo(() => stateTree ? { state: { widgets: getShallowKeys(stateTree.widgets) } } : null, [stateTree]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddAction = useCallback(
    (eventType) => {
      const currentActions = events[eventType] || [];
      const newAction = { actionType: "SHOW_TOAST", config: { message: "Action run!" } };
      const updatedActions = [...currentActions, newAction];
      
      widgetEditorForm.setFieldValue(`widgetConfig.events.${eventType}`, updatedActions);
      setExpandedActionPath(`${eventType}-${updatedActions.length - 1}`);
    },
    [events, widgetEditorForm]
  );

  const handleRemoveAction = useCallback(
    (eventType, actionIndex) => {
      const currentActions = [...(events[eventType] || [])];
      currentActions.splice(actionIndex, 1);
      
      if (currentActions.length === 0) {
        const newEvents = { ...events };
        delete newEvents[eventType];
        widgetEditorForm.setFieldValue("widgetConfig.events", newEvents);
        setExpandedActionPath(null);
      } else {
        widgetEditorForm.setFieldValue(`widgetConfig.events.${eventType}`, currentActions);
        if (expandedActionPath === `${eventType}-${actionIndex}`) {
          setExpandedActionPath(null);
        }
      }
    },
    [events, expandedActionPath, widgetEditorForm]
  );

  const handleActionTypeChange = useCallback(
    (eventType, actionIndex, actionTypeValue) => {
      widgetEditorForm.setFieldValue(
        `widgetConfig.events.${eventType}[${actionIndex}].actionType`,
        actionTypeValue
      );
      let defaultConfig = {};
      if (actionTypeValue === "SET_VARIABLE") {
        defaultConfig = { key: "", value: "" };
      } else if (actionTypeValue === "EXECUTE_QUERY") {
        defaultConfig = { alias: "", inputValues: {} };
      } else if (actionTypeValue === "CALL_WIDGET_METHOD") {
        defaultConfig = { targetWidgetID: "", methodName: "", args: [] };
      } else if (actionTypeValue === "SHOW_TOAST") {
        defaultConfig = { message: "", variant: "success" };
      } else if (actionTypeValue === "TRIGGER_QUERY") {
        defaultConfig = { queryID: "", inputValues: {} };
      } else if (actionTypeValue === "TRIGGER_WORKFLOW") {
        defaultConfig = { workflowID: "", inputValues: {} };
      }
      widgetEditorForm.setFieldValue(
        `widgetConfig.events.${eventType}[${actionIndex}].config`,
        defaultConfig
      );
    },
    [widgetEditorForm]
  );

  const handleActionConfigChange = useCallback(
    (eventType, actionIndex, configKey, value) => {
      widgetEditorForm.setFieldValue(
        `widgetConfig.events.${eventType}[${actionIndex}].config.${configKey}`,
        value
      );
    },
    [widgetEditorForm]
  );

  const toggleExpand = (path) => {
    setExpandedActionPath(expandedActionPath === path ? null : path);
  };

  const getActionSummary = (action) => {
    const { actionType, config = {} } = action;
    if (actionType === "SET_VARIABLE") {
      return `Set variable: ${config.key || "..."} = ${config.value || "..."}`;
    }
    if (actionType === "EXECUTE_QUERY") {
      return `Execute: ${config.alias || "..."}`;
    }
    if (actionType === "CALL_WIDGET_METHOD") {
      const w = pageWidgets.find((pw) => String(pw.widgetID) === String(config.targetWidgetID));
      const label = w?.widgetTitle || config.targetWidgetID || "...";
      return `Call: ${label}.${config.methodName || "..."}()`;
    }
    if (actionType === "SHOW_TOAST") {
      return `Toast: "${config.message || "..."}"`;
    }
    if (actionType === "TRIGGER_QUERY") {
      const q = resolvedQueries.find(q => String(q.dataQueryID) === String(config.queryID));
      return `Trigger Query: ${q ? q.dataQueryTitle : config.queryID || "..."}`;
    }
    if (actionType === "TRIGGER_WORKFLOW") {
      const wf = resolvedWorkflows.find(w => String(w.workflowID) === String(config.workflowID));
      return `Trigger Workflow: ${wf ? wf.title : config.workflowID || "..."}`;
    }
    return "Not configured";
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const supportedEventTypes = useMemo(() => getWidgetEventTypes(widgetType), [widgetType]);

  const availableEventTypes = useMemo(() => {
    return supportedEventTypes.filter(
      (et) => !events[et.value] || events[et.value].length === 0
    );
  }, [supportedEventTypes, events]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      {Object.entries(events).map(([eventType, actions]) => {
        const eventInfo = supportedEventTypes.find((et) => et.value === eventType);
        const eventLabel = eventInfo?.label || eventType;

        const eventInputDefinitions = getEventInputDefinitions(widgetType, eventType) || [];
        const hasEventInputs = eventInputDefinitions.length > 0;
        
        let localStateTree = liveStateTree;
        if (hasEventInputs && liveStateTree) {
          const mockEventObj = eventInputDefinitions.reduce((acc, inputDef) => {
            const path = inputDef.key.replace(/^event\./, "");
            const parts = path.split(".");
            let current = acc;
            for (let i = 0; i < parts.length - 1; i++) {
              current[parts[i]] = current[parts[i]] || {};
              current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = null;
            return acc;
          }, {});

          localStateTree = {
            ...liveStateTree,
            event: mockEventObj
          };
        }

        return (
          <div
            key={eventType}
            className="rounded border border-border bg-muted/20 p-2 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {eventLabel}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {eventInfo?.desc || ""}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] gap-1"
                onClick={() => handleAddAction(eventType)}
              >
                <Plus className="h-3 w-3" />
                Add Step
              </Button>
            </div>

            {hasEventInputs && (
              <div className="rounded border border-primary/20 bg-primary/5 p-2">
                <p className="text-[10px] font-semibold text-primary mb-1.5 flex items-center gap-1">
                  <Info className="h-3 w-3 text-primary" /> Available Event Context
                </p>
                <div className="space-y-1">
                  {eventInputDefinitions.map((inputDef, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2">
                      <code className="text-[9px] bg-background px-1 py-0.5 rounded border border-border whitespace-nowrap text-muted-foreground font-mono">
                        {`{{ ${inputDef.key} }}`}
                      </code>
                      <span className="text-[9px] text-muted-foreground truncate">{inputDef.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(actions) && actions.length > 0 && (
              <div className="space-y-2.5">
                {actions.map((action, actionIndex) => {
                  const path = `${eventType}-${actionIndex}`;
                  const isExpanded = expandedActionPath === path;
                  const typeConfig = ACTION_TYPES.find(t => t.value === action.actionType) || ACTION_TYPES[0];
                  const Icon = typeConfig.icon;

                  return (
                    <Card
                      key={actionIndex}
                      className={`transition-all border border-border/50 bg-background`}
                    >
                      <div
                        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/10"
                        onClick={() => toggleExpand(path)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted border border-border text-[10px] font-bold text-muted-foreground">
                            {actionIndex + 1}
                          </div>
                          
                          <div className={`flex h-7 w-7 items-center justify-center rounded border ${typeConfig.border} ${typeConfig.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-foreground block leading-none mb-0.5">
                              {typeConfig.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate block max-w-[200px]">
                              {getActionSummary(action)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAction(eventType, actionIndex);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-2 border-t border-border/50 bg-muted/10 space-y-2 animate-in slide-in-from-top-1 duration-200">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Action Type
                            </Label>
                            <Select
                              value={action.actionType}
                              onValueChange={(val) =>
                                handleActionTypeChange(eventType, actionIndex, val)
                              }
                            >
                              <SelectTrigger className="text-xs bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTION_TYPES.map((t) => {
                                  const AtIcon = t.icon;
                                  return (
                                    <SelectItem key={t.value} value={t.value}>
                                      <span className="flex items-center gap-2">
                                        <AtIcon className={`h-3.5 w-3.5 ${t.color}`} />
                                        {t.label}
                                      </span>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          {action.actionType === "SET_VARIABLE" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Variable Key</Label>
                                <TemplateAutocompleteInput
                                  value={action.config?.key || ""}
                                  onChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "key", val)
                                  }
                                  placeholder="e.g. {{ state.variables.selectedUserId }}"
                                  liveStateTree={variablesStateTree}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Value Expression</Label>
                                <TemplateAutocompleteInput
                                  value={action.config?.value || ""}
                                  onChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "value", val)
                                  }
                                  placeholder="e.g. {{ state.event.args[0].id }}"
                                  liveStateTree={localStateTree}
                                />
                              </div>
                            </div>
                          )}

                          {action.actionType === "EXECUTE_QUERY" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Data Source</Label>
                                {pageDataSources.length > 0 ? (
                                  <SearchSelect
                                    value={action.config?.alias || ""}
                                    onChange={(val) => {
                                      handleActionConfigChange(eventType, actionIndex, "alias", val);
                                      handleActionConfigChange(eventType, actionIndex, "inputValues", {});
                                    }}
                                    options={pageDataSources.filter((ds) => ds.alias).map((ds) => ({
                                      value: ds.alias,
                                      label: `${ds.alias} (${ds.type})`
                                    }))}
                                    placeholder="Select a page data source…"
                                    className="text-xs bg-background"
                                  />
                                ) : (
                                    <div className="rounded border border-dashed border-border p-2.5 text-center">
                                    <p className="text-[10px] text-muted-foreground">No page-level data sources defined. Add them in the Data tab of the page editor.</p>
                                  </div>
                                )}
                              </div>
                              {/* Dynamic Input Values */}
                              {action.config?.alias && (() => {
                                const inputDefinitions = getInputDefinitionsForAlias(action.config.alias);
                                if (inputDefinitions.length === 0) return null;
                                return (
                                  <div className="rounded border border-border bg-muted/30 p-2 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <Info className="h-3 w-3 text-muted-foreground" />
                                      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Input Arguments</p>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">Override argument values when this data source is executed by this event action.</p>
                                    {inputDefinitions.map((inputDef) => {
                                      const inputKey = inputDef.key || inputDef.name;
                                      return (
                                        <div key={inputKey} className="space-y-0.5">
                                          <Label className="text-[10px] font-medium text-muted-foreground">
                                            {inputKey}
                                            {inputDef.type && <span className="ml-1 text-muted-foreground/50">({inputDef.type})</span>}
                                          </Label>
                                          <TemplateAutocompleteInput
                                            value={action.config?.inputValues?.[inputKey] ?? ""}
                                            onChange={(val) => {
                                              handleActionConfigChange(eventType, actionIndex, `inputValues.${inputKey}`, val);
                                            }}
                                            placeholder={inputDef.defaultValue || `e.g. {{ state.variables.${inputKey} }}`}
                                            liveStateTree={localStateTree}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {action.actionType === "TRIGGER_QUERY" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Data Query</Label>
                                <SearchSelect
                                  value={action.config?.queryID || ""}
                                  onChange={(val) => {
                                    handleActionConfigChange(eventType, actionIndex, "queryID", val);
                                    handleActionConfigChange(eventType, actionIndex, "inputValues", {});
                                  }}
                                  options={dataQueries.map((q) => ({
                                    value: String(q.dataQueryID),
                                    label: q.dataQueryTitle,
                                  }))}
                                  placeholder="Select a query…"
                                  className="text-xs bg-background"
                                  onSearchChange={setQuerySearch}
                                  onLoadMore={fetchNextQueriesPage}
                                  hasNextPage={hasNextQueriesPage}
                                  isFetchingNextPage={isFetchingNextQueriesPage}
                                  isLoading={isLoadingDataQueries}
                                />
                              </div>
                              {/* Input Values */}
                              {action.config?.queryID && (() => {
                                const inputDefinitions = getInputDefinitionsForDirectAction(action.actionType, action.config);
                                if (inputDefinitions.length === 0) return null;
                                return (
                                  <div className="rounded border border-border bg-muted/30 p-2 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <Info className="h-3 w-3 text-muted-foreground" />
                                      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Input Arguments</p>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">Override argument values when this query is executed.</p>
                                    {inputDefinitions.map((inputDef) => {
                                      const inputKey = inputDef.key || inputDef.name;
                                      return (
                                        <div key={inputKey} className="space-y-0.5">
                                          <Label className="text-[10px] font-medium text-muted-foreground">
                                            {inputKey}
                                            {inputDef.type && <span className="ml-1 text-muted-foreground/50">({inputDef.type})</span>}
                                          </Label>
                                          <TemplateAutocompleteInput
                                            value={action.config?.inputValues?.[inputKey] ?? ""}
                                            onChange={(val) => {
                                              handleActionConfigChange(eventType, actionIndex, `inputValues.${inputKey}`, val);
                                            }}
                                            placeholder={inputDef.defaultValue || `e.g. {{ state.variables.${inputKey} }}`}
                                            liveStateTree={localStateTree}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {action.actionType === "TRIGGER_WORKFLOW" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Workflow</Label>
                                <SearchSelect
                                  value={action.config?.workflowID || ""}
                                  onChange={(val) => {
                                    handleActionConfigChange(eventType, actionIndex, "workflowID", val);
                                    handleActionConfigChange(eventType, actionIndex, "inputValues", {});
                                  }}
                                  options={workflows.map((w) => ({
                                    value: String(w.workflowID),
                                    label: w.title,
                                  }))}
                                  placeholder="Select a workflow…"
                                  className="text-xs bg-background"
                                  onSearchChange={setWorkflowSearch}
                                  onLoadMore={fetchNextWorkflowsPage}
                                  hasNextPage={hasNextWorkflowsPage}
                                  isFetchingNextPage={isFetchingNextWorkflowsPage}
                                  isLoading={isLoadingWorkflows}
                                />
                              </div>
                              {/* Input Values */}
                              {action.config?.workflowID && (() => {
                                const inputDefinitions = getInputDefinitionsForDirectAction(action.actionType, action.config);
                                if (inputDefinitions.length === 0) return null;
                                return (
                                  <div className="rounded border border-border bg-muted/30 p-2 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <Info className="h-3 w-3 text-muted-foreground" />
                                      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Input Arguments</p>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">Override argument values when this workflow is executed.</p>
                                    {inputDefinitions.map((inputDef) => {
                                      const inputKey = inputDef.key || inputDef.name;
                                      return (
                                        <div key={inputKey} className="space-y-0.5">
                                          <Label className="text-[10px] font-medium text-muted-foreground">
                                            {inputKey}
                                            {inputDef.type && <span className="ml-1 text-muted-foreground/50">({inputDef.type})</span>}
                                          </Label>
                                          <TemplateAutocompleteInput
                                            value={action.config?.inputValues?.[inputKey] ?? ""}
                                            onChange={(val) => {
                                              handleActionConfigChange(eventType, actionIndex, `inputValues.${inputKey}`, val);
                                            }}
                                            placeholder={inputDef.defaultValue || `e.g. {{ state.variables.${inputKey} }}`}
                                            liveStateTree={localStateTree}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {action.actionType === "CALL_WIDGET_METHOD" && (() => {
                            const selectedWidgetID = action.config?.targetWidgetID || "";
                            const selectedWidget = pageWidgets.find((w) => String(w.widgetID) === selectedWidgetID);
                            const availableMethods = selectedWidget ? getWidgetMethods(selectedWidget.widgetType) : [];
                            const selectedMethod = availableMethods.find((m) => m.name === action.config?.methodName);
                            return (
                              <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Target Widget</Label>
                                {pageWidgets.length > 0 ? (
                                  <Select
                                    value={selectedWidgetID}
                                    onValueChange={(val) => {
                                      handleActionConfigChange(eventType, actionIndex, "targetWidgetID", val);
                                      handleActionConfigChange(eventType, actionIndex, "methodName", "");
                                    }}
                                  >
                                    <SelectTrigger className="text-xs bg-background">
                                      <SelectValue placeholder="Select a widget on this page…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {pageWidgets.map((w) => (
                                        <SelectItem key={w.widgetID} value={String(w.widgetID)}>
                                          <span className="flex items-center gap-2">
                                            <PanelTop className="h-3 w-3 text-muted-foreground" />
                                            <span>{w.widgetTitle}</span>
                                            <span className="text-muted-foreground text-[9px] font-mono ml-1">({w.widgetType})</span>
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                      <div className="rounded border border-dashed border-border p-2.5 text-center">
                                    <p className="text-[10px] text-muted-foreground">No widgets on this page yet. Place widgets on the canvas first.</p>
                                  </div>
                                )}
                              </div>
                              {selectedWidgetID && (
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground font-semibold">Method</Label>
                                  {availableMethods.length > 0 ? (
                                    <>
                                      <Select
                                        value={action.config?.methodName || ""}
                                        onValueChange={(val) =>
                                          handleActionConfigChange(eventType, actionIndex, "methodName", val)
                                        }
                                      >
                                        <SelectTrigger className="text-xs bg-background">
                                          <SelectValue placeholder="Select a method…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableMethods.map((m) => (
                                            <SelectItem key={m.name} value={m.name}>
                                              <span className="flex items-center gap-2">
                                                <span className="font-mono">{m.name}()</span>
                                              </span>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {selectedMethod && (
                                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                          <Info className="h-3 w-3" />
                                          {selectedMethod.description}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                        <div className="rounded border border-dashed border-border p-2.5 text-center">
                                      <p className="text-[10px] text-muted-foreground">This widget type does not expose any callable methods.</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            );
                          })()}

                          {action.actionType === "SHOW_TOAST" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Toast Message</Label>
                                <TemplateAutocompleteInput
                                  value={action.config?.message || ""}
                                  onChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "message", val)
                                  }
                                  placeholder="e.g. Record saved successfully"
                                  liveStateTree={localStateTree}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Variant</Label>
                                <Select
                                  value={action.config?.variant || "success"}
                                  onValueChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "variant", val)
                                  }
                                >
                                  <SelectTrigger className="text-xs bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="success">Success (Green)</SelectItem>
                                    <SelectItem value="error">Error (Red)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {availableEventTypes.length > 0 && (
        <div>
          <Select onValueChange={(val) => handleAddAction(val)}>
            <SelectTrigger className="text-xs w-full bg-background border-dashed">
              <SelectValue placeholder="Add event handler trigger..." />
            </SelectTrigger>
            <SelectContent>
              {availableEventTypes.map((et) => (
                <SelectItem key={et.value} value={et.value}>
                  {et.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {Object.keys(events).length === 0 && (
        <div className="rounded border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            No event handlers configured. Add an event trigger to wire widget interactions.
          </p>
        </div>
      )}
    </div>
  );
};
