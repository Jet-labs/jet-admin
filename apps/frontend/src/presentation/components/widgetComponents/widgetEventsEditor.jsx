import React, { useCallback, useState, useMemo, useContext } from "react";
import { Plus, Trash2, Edit2, Play, CircleSlash, Key, Database, PanelTop, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useWidgets } from "../../../logic/hooks/useWidgets";
import { AppPageMetaContext } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { getWidgetEventTypes } from "@jet-admin/widget-types";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
} from "@jet-admin/ui";

const TemplateAutocompleteInput = ({ value, onChange, placeholder, suggestions }) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleFocus = () => {
    if (suggestions.length > 0) setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelect = (val) => {
    onChange(val);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(s =>
    !value || s.value.toLowerCase().includes(value.toLowerCase()) || value === "{{"
  );

  return (
    <div className="relative flex flex-col gap-1">
      <Input
        type="text"
        className="text-xs font-mono h-8 w-full"
        value={value || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-popover border border-border rounded-md shadow-lg z-50">
          {filteredSuggestions.map((s, i) => (
            <div
              key={i}
              className="px-2 py-1.5 text-xs hover:bg-muted cursor-pointer flex justify-between items-center"
              onClick={() => handleSelect(s.value)}
            >
              <span className="font-mono text-foreground">{s.label}</span>
              {s.detail && <span className="text-[10px] text-muted-foreground">{s.detail}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Action types available for widget events, matching AppPage runtime.
 */
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
  {
    value: "CALL_WIDGET_METHOD",
    label: "Call Widget Method",
    icon: PanelTop,
    color: "text-purple-500",
    bg: "bg-purple-50/50 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20",
    description: "Invoke a method on another widget",
  },
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

export const WidgetEventsEditor = ({ widgetEditorForm, dataSourceResults }) => {
  WidgetEventsEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
    dataSourceResults: PropTypes.object,
  };

  const events = widgetEditorForm.values.widgetConfig?.events || {};
  const [expandedActionPath, setExpandedActionPath] = useState(null); // format: `${eventType}-${actionIndex}`

  const { tenantID } = useParams();
  const { widgets } = useWidgets(tenantID);
  const meta = useContext(AppPageMetaContext);

  const widgetIDSuggestions = useMemo(() => {
    if (!widgets || !Array.isArray(widgets)) return [];
    
    // Only suggest widgets that are in the page dropzone / layout
    const placedWidgetIDs = (meta?.pageConfig?.widgets || [])
      .map((k) => {
        const parts = String(k).split("_");
        return parts.length > 1 ? parts[1] : parts[0];
      })
      .filter(Boolean);

    const filteredWidgets = placedWidgetIDs.length > 0
      ? widgets.filter((w) => placedWidgetIDs.includes(w.widgetID))
      : widgets;

    return filteredWidgets.map((w) => ({
      label: w.widgetTitle || w.widgetID,
      value: w.widgetID,
      detail: w.widgetType,
    }));
  }, [widgets, meta]);

  // Build suggestions for expression templates
  const contextSuggestions = useMemo(() => {
    const suggestions = [];
    suggestions.push({ label: "{{event.args[0]}}", value: "{{event.args[0]}}", detail: "event payload" });
    suggestions.push({ label: "{{event.page}}", value: "{{event.page}}", detail: "current page number" });
    suggestions.push({ label: "{{event.offset}}", value: "{{event.offset}}", detail: "row offset (skip)" });
    suggestions.push({ label: "{{event.pageSize}}", value: "{{event.pageSize}}", detail: "rows per page (limit)" });
    
    if (!dataSourceResults) return suggestions;
    
    if (dataSourceResults.queries) {
      Object.keys(dataSourceResults.queries).forEach(alias => {
        suggestions.push({ label: `{{ queries.${alias}.data }}`, value: `{{ queries.${alias}.data }}` });
        suggestions.push({ label: `{{ queries.${alias}.run() }}`, value: `{{ queries.${alias}.run() }}` });
      });
    }
    if (dataSourceResults.workflows) {
      Object.keys(dataSourceResults.workflows).forEach(alias => {
        suggestions.push({ label: `{{ workflows.${alias}.data }}`, value: `{{ workflows.${alias}.data }}` });
        suggestions.push({ label: `{{ workflows.${alias}.run() }}`, value: `{{ workflows.${alias}.run() }}` });
      });
    }
    return suggestions;
  }, [dataSourceResults]);

  // Build suggestions for direct query/workflow aliases (without curly braces)
  const aliasSuggestions = useMemo(() => {
    const suggestions = [];
    if (!dataSourceResults) return suggestions;
    if (dataSourceResults.queries) {
      Object.keys(dataSourceResults.queries).forEach(alias => {
        suggestions.push({ label: alias, value: alias, detail: "query" });
      });
    }
    if (dataSourceResults.workflows) {
      Object.keys(dataSourceResults.workflows).forEach(alias => {
        suggestions.push({ label: alias, value: alias, detail: "workflow" });
      });
    }
    return suggestions;
  }, [dataSourceResults]);

  // Build suggestions for variable keys (plain names, not template expressions)
  const variableKeySuggestions = useMemo(() => {
    const suggestions = [];
    // Add defined page variables
    const varDefs = meta?.variableDefinitions || [];
    for (const def of varDefs) {
      if (def.key) {
        suggestions.push({ label: def.key, value: def.key, detail: "page variable" });
      }
    }
    // Add common pagination variable hints if not already present
    const existing = new Set(suggestions.map(s => s.value));
    for (const common of ["skip", "limit", "page", "pageSize"]) {
      if (!existing.has(common)) {
        suggestions.push({ label: common, value: common, detail: "pagination" });
      }
    }
    return suggestions;
  }, [meta?.variableDefinitions]);

  // Add a new event action step
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

  // Remove an action step from an event
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

  // Change action type
  const handleActionTypeChange = useCallback(
    (eventType, actionIndex, actionTypeValue) => {
      widgetEditorForm.setFieldValue(
        `widgetConfig.events.${eventType}[${actionIndex}].actionType`,
        actionTypeValue
      );
      // Initialize with template config values
      let defaultConfig = {};
      if (actionTypeValue === "SET_VARIABLE") {
        defaultConfig = { key: "", value: "" };
      } else if (actionTypeValue === "EXECUTE_QUERY") {
        defaultConfig = { alias: "" };
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

  // Change action config fields
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
      return `Call: ${config.targetWidgetID || "..."}.${config.methodName || "..."}()`;
    }
    if (actionType === "SHOW_TOAST") {
      return `Toast: "${config.message || "..."}"`;
    }
    return "Not configured";
  };

  const widgetType = widgetEditorForm.values.widgetType;
  const supportedEventTypes = useMemo(() => getWidgetEventTypes(widgetType), [widgetType]);

  const availableEventTypes = useMemo(() => {
    return supportedEventTypes.filter(
      (et) => !events[et.value] || events[et.value].length === 0
    );
  }, [supportedEventTypes, events]);

  return (
    <div className="space-y-4">
      {/* Existing events & their pipeline actions */}
      {Object.entries(events).map(([eventType, actions]) => {
        const eventInfo = supportedEventTypes.find((et) => et.value === eventType);
        const eventLabel = eventInfo?.label || eventType;

        return (
          <div
            key={eventType}
            className="rounded-md border border-border bg-muted/20 p-3 space-y-3"
          >
            {/* Event Header */}
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

            {/* Pipeline Step List */}
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
                      {/* Step Header */}
                      <div
                        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/10"
                        onClick={() => toggleExpand(path)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Step Number Indicator */}
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted border border-border text-[10px] font-bold text-muted-foreground">
                            {actionIndex + 1}
                          </div>
                          
                          {/* Action Icon */}
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

                      {/* Step Config Panel */}
                      {isExpanded && (
                        <div className="p-3 border-t border-border/50 bg-muted/10 space-y-3.5 animate-in slide-in-from-top-1 duration-200">
                          {/* Select Action Type */}
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

                          {/* Action Config Fields */}
                          {action.actionType === "SET_VARIABLE" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Variable Key</Label>
                                <TemplateAutocompleteInput
                                  value={action.config?.key || ""}
                                  onChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "key", val)
                                  }
                                  placeholder="e.g. selectedUserId"
                                  suggestions={variableKeySuggestions}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Value Expression</Label>
                                <TemplateAutocompleteInput
                                  value={action.config?.value || ""}
                                  onChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "value", val)
                                  }
                                  placeholder="e.g. {{event.args.0.id}}"
                                  suggestions={contextSuggestions}
                                />
                              </div>
                            </div>
                          )}

                          {action.actionType === "EXECUTE_QUERY" && (
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground font-semibold">Data Source Alias</Label>
                              <TemplateAutocompleteInput
                                value={action.config?.alias || ""}
                                onChange={(val) =>
                                  handleActionConfigChange(eventType, actionIndex, "alias", val)
                                }
                                placeholder="e.g. get_users_list"
                                suggestions={aliasSuggestions}
                              />
                              <p className="text-[9px] text-muted-foreground">
                                Must match the reference alias of a page-level data source.
                              </p>
                            </div>
                          )}

                          {action.actionType === "CALL_WIDGET_METHOD" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Target Widget ID</Label>
                                <TemplateAutocompleteInput
                                  value={action.config?.targetWidgetID || ""}
                                  onChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "targetWidgetID", val)
                                  }
                                  placeholder="e.g. table_1"
                                  suggestions={widgetIDSuggestions}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-semibold">Method Name</Label>
                                <TemplateAutocompleteInput
                                  value={action.config?.methodName || ""}
                                  onChange={(val) =>
                                    handleActionConfigChange(eventType, actionIndex, "methodName", val)
                                  }
                                  placeholder="e.g. refresh"
                                  suggestions={(() => {
                                    const selectedTargetId = action.config?.targetWidgetID;
                                    const selectedWidget = widgets?.find(w => w.widgetID === selectedTargetId);
                                    const type = selectedWidget?.widgetType;
                                    
                                    const methods = [];
                                    if (type === "table") {
                                      methods.push({ label: "refresh", value: "refresh", detail: "Reload table data" });
                                      methods.push({ label: "setSelectedRow", value: "setSelectedRow", detail: "Select a row by index" });
                                      methods.push({ label: "clearSelection", value: "clearSelection", detail: "Clear row selection" });
                                    } else if (type === "vega-lite" || type === "vega") {
                                      methods.push({ label: "refresh", value: "refresh", detail: "Redraw visual chart" });
                                      methods.push({ label: "resize", value: "resize", detail: "Resize to fit container" });
                                    } else if (type === "button") {
                                      methods.push({ label: "click", value: "click", detail: "Trigger button action" });
                                    } else {
                                      methods.push({ label: "refresh", value: "refresh", detail: "Refresh widget" });
                                    }
                                    return methods;
                                  })()}
                                />
                              </div>
                            </div>
                          )}

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
                                  suggestions={contextSuggestions}
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

      {/* Add new event handler picker */}
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

      {/* Empty state */}
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
