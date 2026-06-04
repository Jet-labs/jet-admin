import React, { useCallback, useState, useMemo } from "react";
import { Plus, Trash2, Key, Database, PanelTop, MessageSquare, ChevronDown, ChevronUp, Info } from 'lucide-react';
import PropTypes from "prop-types";
import { getWidgetEventTypes, getWidgetMethods, getEventArgs } from "@jet-admin/widget-types";
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { useParams } from "react-router-dom";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { useDataQueries } from "../../../logic/hooks/useDataQueries";
import { useWorkflows } from "../../../logic/hooks/useWorkflows";
import { CONSTANTS } from "../../../constants";
import { getWidgetByIDAPI } from "../../../data/apis/widget";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
} from "@jet-admin/ui";

const ACTION_TYPES = [
  {
    value: "SET_VARIABLE",
    label: "Set Page Variable",
    icon: Key,
    color: "text-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    description: "Update a page state variable",
  },
  {
    value: "EXECUTE_QUERY",
    label: "Execute Data Source",
    icon: Database,
    color: "text-blue-500",
    bg: "bg-blue-50/50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    description: "Run a page-level data source",
  },
  // {
  //   value: "CALL_WIDGET_METHOD",
  //   label: "Call Widget Method",
  //   icon: PanelTop,
  //   color: "text-purple-500",
  //   bg: "bg-purple-50/50 dark:bg-purple-500/10",
  //   border: "border-purple-200 dark:border-purple-500/20",
  //   description: "Invoke a method on another widget",
  // },
  {
    value: "SHOW_TOAST",
    label: "Show Toast",
    icon: MessageSquare,
    color: "text-emerald-500",
    bg: "bg-emerald-50/50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    description: "Show a toast notification",
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
  const { dataQueries = [] } = useDataQueries(tenantID);
  const { workflows = [] } = useWorkflows(tenantID);

  // Page-level data sources from appPageConfig
  const pageDataSources = useMemo(
    () => appPageEditorForm?.values?.appPageConfig?.dataSources || [],
    [appPageEditorForm?.values?.appPageConfig?.dataSources]
  );

  // Look up arg definitions for a page-level data source by alias
  const getArgDefsForAlias = useCallback((alias) => {
    const ds = pageDataSources.find((s) => s.alias === alias);
    if (!ds) return [];
    if (ds.type === "query" && ds.queryID) {
      const q = dataQueries.find((q) => String(q.dataQueryID) === String(ds.queryID));
      return q?.dataQueryOptions?.args || [];
    }
    if (ds.type === "workflow" && ds.workflowID) {
      const wf = workflows.find((w) => String(w.workflowID) === String(ds.workflowID));
      return wf?.workflowOptions?.args || [];
    }
    return [];
  }, [pageDataSources, dataQueries, workflows]);

  const placedIDs = useMemo(() => {
    const placedKeys = appPageEditorForm?.values?.appPageConfig?.widgets || [];
    return Array.from(new Set(placedKeys.map((k) => String(k).split("_")[1])));
  }, [appPageEditorForm?.values?.appPageConfig?.widgets]);

  const widgetQueries = useQueries({
    queries: placedIDs.map((id) => ({
      queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), id],
      queryFn: () => getWidgetByIDAPI({ tenantID, widgetID: id }),
      staleTime: Infinity,
    })),
  });

  const pageWidgets = useMemo(() => {
    return widgetQueries.map((q) => q.data).filter(Boolean);
  }, [widgetQueries]);

  const events = widgetEditorForm.values.widgetConfig?.events || {};
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
        defaultConfig = { alias: "", inputArgs: {} };
      } else if (actionTypeValue === "CALL_WIDGET_METHOD") {
        defaultConfig = { targetWidgetID: "", methodName: "", args: [] };
      } else if (actionTypeValue === "SHOW_TOAST") {
        defaultConfig = { message: "", variant: "success" };
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
    <div className="space-y-4">
      {Object.entries(events).map(([eventType, actions]) => {
        const eventInfo = supportedEventTypes.find((et) => et.value === eventType);
        const eventLabel = eventInfo?.label || eventType;

        const eventArgsSchema = getEventArgs(widgetType, eventType) || [];
        const hasEventArgs = eventArgsSchema.length > 0;
        
        let localStateTree = liveStateTree;
        if (hasEventArgs && liveStateTree) {
          const mockEventObj = eventArgsSchema.reduce((acc, arg) => {
            const path = arg.key.replace(/^event\./, "");
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
            className="rounded-md border border-border bg-muted/20 p-3 space-y-3"
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

            {hasEventArgs && (
              <div className="rounded-md border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/5 p-2">
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mb-1.5 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Available Event Context
                </p>
                <div className="space-y-1">
                  {eventArgsSchema.map((arg, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2">
                      <code className="text-[9px] bg-background px-1 py-0.5 rounded border border-border whitespace-nowrap text-muted-foreground font-mono">
                        {`{{ ${arg.key} }}`}
                      </code>
                      <span className="text-[9px] text-muted-foreground truncate">{arg.description}</span>
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
                      className={`transition-all border border-border/50 bg-background ${
                        isExpanded ? "overflow-visible ring-1 ring-primary/20 shadow-md" : "overflow-hidden hover:shadow-sm"
                      }`}
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
                        <div className="p-3 border-t border-border/50 bg-muted/10 space-y-3.5 animate-in slide-in-from-top-1 duration-200">
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
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Data Source</Label>
                                {pageDataSources.length > 0 ? (
                                  <Select
                                    value={action.config?.alias || ""}
                                    onValueChange={(val) => {
                                      handleActionConfigChange(eventType, actionIndex, "alias", val);
                                      handleActionConfigChange(eventType, actionIndex, "inputArgs", {});
                                    }}
                                  >
                                    <SelectTrigger className="text-xs bg-background">
                                      <SelectValue placeholder="Select a page data source…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {pageDataSources.filter((ds) => ds.alias).map((ds) => (
                                        <SelectItem key={ds.alias} value={ds.alias}>
                                          <span className="flex items-center gap-2">
                                            <Database className="h-3 w-3 text-blue-500" />
                                            <span className="font-mono">{ds.alias}</span>
                                            <span className="text-muted-foreground text-[9px] ml-1">({ds.type})</span>
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="rounded-md border border-dashed border-border p-2.5 text-center">
                                    <p className="text-[10px] text-muted-foreground">No page-level data sources defined. Add them in the Data tab of the page editor.</p>
                                  </div>
                                )}
                              </div>
                              {/* Dynamic Input Args */}
                              {action.config?.alias && (() => {
                                const argDefs = getArgDefsForAlias(action.config.alias);
                                if (argDefs.length === 0) return null;
                                return (
                                  <div className="rounded-md border border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 p-3 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <Info className="h-3 w-3 text-blue-500" />
                                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Input Arguments</p>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">Override argument values when this data source is executed by this event action.</p>
                                    {argDefs.map((arg) => {
                                      const argKey = arg.key || arg.name;
                                      return (
                                        <div key={argKey} className="space-y-0.5">
                                          <Label className="text-[10px] font-medium text-muted-foreground">
                                            {argKey}
                                            {arg.type && <span className="ml-1 text-muted-foreground/50">({arg.type})</span>}
                                          </Label>
                                          <TemplateAutocompleteInput
                                            value={action.config?.inputArgs?.[argKey] ?? ""}
                                            onChange={(val) => {
                                              const updated = { ...(action.config?.inputArgs || {}), [argKey]: val };
                                              handleActionConfigChange(eventType, actionIndex, "inputArgs", updated);
                                            }}
                                            placeholder={arg.defaultValue || `e.g. {{ state.variables.${argKey} }}`}
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
                            <div className="space-y-3">
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
                                            <PanelTop className="h-3 w-3 text-purple-500" />
                                            <span>{w.widgetTitle}</span>
                                            <span className="text-muted-foreground text-[9px] font-mono ml-1">({w.widgetType})</span>
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="rounded-md border border-dashed border-border p-2.5 text-center">
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
                                        <p className="text-[9px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                                          <Info className="h-3 w-3" />
                                          {selectedMethod.description}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <div className="rounded-md border border-dashed border-border p-2.5 text-center">
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
        <div className="pt-2">
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
        <div className="rounded-md border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            No event handlers configured. Add an event trigger to wire widget interactions.
          </p>
        </div>
      )}
    </div>
  );
};
