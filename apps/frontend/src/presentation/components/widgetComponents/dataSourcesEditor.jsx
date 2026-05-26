import React, { useCallback } from "react";
import { Loader, Plus, RefreshCw, Trash2 } from 'lucide-react';
import PropTypes from "prop-types";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";
import { WorkflowConsole } from "../workflowComponents/workflowConsole";
import { useRuntimeStore } from "../../../logic/stores/useRuntimeStore";

/**
 * DataSourcesEditor
 *
 * Generic editor for managing widget data sources (queries + workflows).
 * Lives in the "Data" tab of the WidgetConfigEditor.
 *
 * Each data source has:
 * - type: "query" | "workflow"
 * - queryID / workflowID
 * - alias: user-defined key for the results context
 * - inputArgValues: key/value pairs passed at execution time
 */
export const DataSourcesEditor = ({
  widgetEditorForm,
  dataQueries,
  workflows,
  dataSourceResults,
  onTestRun,
  isTestRunning,
}) => {
  const workflowExecutions = useRuntimeStore((state) => state.workflowExecutions);
  const dataSources =
    widgetEditorForm.values.widgetConfig?.dataSources || [];

  const updateDataSources = useCallback(
    (newSources) => {
      widgetEditorForm.setFieldValue("widgetConfig.dataSources", newSources);
    },
    [widgetEditorForm]
  );

  const handleAddSource = useCallback(() => {
    updateDataSources([
      ...dataSources,
      { type: "query", queryID: "", alias: "", inputArgValues: {} },
    ]);
  }, [dataSources, updateDataSources]);

  const handleRemoveSource = useCallback(
    (index) => {
      updateDataSources(dataSources.filter((_, i) => i !== index));
    },
    [dataSources, updateDataSources]
  );

  const handleSourceChange = useCallback(
    (index, field, value) => {
      const updated = dataSources.map((src, i) => {
        if (i !== index) return src;
        const next = { ...src, [field]: value };
        // Reset IDs when type changes
        if (field === "type") {
          next.queryID = "";
          next.workflowID = "";
          next.inputArgValues = {};
          next.alias = "";
        }
        // Auto-generate alias when source is selected
        if (field === "queryID" && value) {
          const query = dataQueries.find((q) => q.dataQueryID === value);
          if (query && !src.alias) {
            next.alias = query.dataQueryTitle
              ?.replace(/\s+/g, "_")
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "");
          }
        }
        if (field === "workflowID" && value) {
          const wf = workflows.find((w) => w.workflowID === value);
          if (wf && !src.alias) {
            next.alias = wf.title
              ?.replace(/\s+/g, "_")
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "");
          }
        }
        return next;
      });
      updateDataSources(updated);
    },
    [dataSources, dataQueries, workflows, updateDataSources]
  );

  const handleArgChange = useCallback(
    (index, argKey, argValue) => {
      const updated = dataSources.map((src, i) => {
        if (i !== index) return src;
        return {
          ...src,
          inputArgValues: { ...src.inputArgValues, [argKey]: argValue },
        };
      });
      updateDataSources(updated);
    },
    [dataSources, updateDataSources]
  );

  // Get arg definitions for a source
  const getSourceArgDefs = useCallback(
    (source) => {
      if (source.type === "query" && source.queryID) {
        const query = dataQueries.find(
          (q) => q.dataQueryID === source.queryID
        );
        return query?.dataQueryOptions?.args || [];
      }
      if (source.type === "workflow" && source.workflowID) {
        const wf = workflows.find((w) => w.workflowID === source.workflowID);
        const inputSchema = wf?.workflowOptions?.inputSchema;
        if (Array.isArray(inputSchema)) return inputSchema;
        return [];
      }
      return [];
    },
    [dataQueries, workflows]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Data Sources
        </p>
        <div className="flex items-center gap-1.5">
          {dataSourceResults && (
            <span className="inline-flex items-center text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
              Data loaded
            </span>
          )}
          {dataSources.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onTestRun}
              disabled={isTestRunning}
            >
              {isTestRunning ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {dataSourceResults ? "Refresh" : "Load Data"}
            </Button>
          )}
        </div>
      </div>

      {dataSources.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-center py-6">
          <p className="text-[10px] text-muted-foreground">
            No data sources bound. Add a data query or workflow to feed data into
            this widget.
          </p>
        </div>
      )}

      {dataSources.map((source, idx) => {
        const argDefs = getSourceArgDefs(source);
        return (
          <div
            key={idx}
            className="rounded-md border border-border bg-card p-3 space-y-2.5"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Source {idx + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveSource(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Type selector */}
            <div className="space-y-1">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Type
              </Label>
              <Select
                value={source.type}
                onValueChange={(val) =>
                  handleSourceChange(idx, "type", val)
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="query">Data Query</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source picker */}
            <div className="space-y-1">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {source.type === "query" ? "Data Query" : "Workflow"}
              </Label>
              {source.type === "query" ? (
                <Select
                  value={source.queryID || ""}
                  onValueChange={(val) =>
                    handleSourceChange(idx, "queryID", val)
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select a data query…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(dataQueries || []).map((q) => (
                      <SelectItem key={q.dataQueryID} value={q.dataQueryID}>
                        {q.dataQueryTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={source.workflowID || ""}
                  onValueChange={(val) =>
                    handleSourceChange(idx, "workflowID", val)
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select a workflow…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(workflows || []).map((w) => (
                      <SelectItem key={w.workflowID} value={w.workflowID}>
                        {w.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Alias */}
            <div className="space-y-1">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Alias
              </Label>
              <Input
                type="text"
                className="text-xs font-mono"
                value={source.alias || ""}
                onChange={(e) =>
                  handleSourceChange(idx, "alias", e.target.value)
                }
                placeholder="e.g. orders"
              />
              <p className="text-[10px] text-muted-foreground">
                Used as the key in query results. E.g.{" "}
                <code className="bg-background px-1 rounded border border-border font-mono text-xs">{source.alias || "alias"}.data</code>
              </p>
            </div>

            {/* Input Arguments */}
            {argDefs.length > 0 && (
              <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2 mt-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Input Arguments
                </p>
                {argDefs.map((arg) => {
                  const argKey = arg.key || arg.name;
                  return (
                    <div key={argKey} className="space-y-0.5">
                      <Label className="text-[10px] font-medium text-muted-foreground">
                        {argKey}
                        {arg.type && (
                          <span className="ml-1 text-muted-foreground/50">
                            ({arg.type})
                          </span>
                        )}
                      </Label>
                      <Input
                        type="text"
                        className="text-xs font-mono"
                        value={source.inputArgValues?.[argKey] ?? ""}
                        onChange={(e) =>
                          handleArgChange(idx, argKey, e.target.value)
                        }
                        placeholder={arg.defaultValue || ""}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Query result preview */}
            {dataSourceResults?.[source.alias] && (
              <div className="mt-2">
                <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {source.type === 'workflow' && dataSourceResults[source.alias]?.instanceID ? 'Execution Status' : 'Result Preview'}
                </Label>
                {source.type === 'workflow' && dataSourceResults[source.alias]?.instanceID ? (() => {
                  const instanceID = dataSourceResults[source.alias].instanceID;
                  const executionData = workflowExecutions[instanceID] || { 
                    logs: [{
                      type: 'start',
                      timestamp: Date.now(),
                      label: 'Workflow Dispatched',
                      message: `Instance ID: ${instanceID}`
                    }], 
                    status: 'RUNNING' 
                  };
                  
                  return (
                    <div className="mt-1 h-48 border border-border rounded-md overflow-hidden flex flex-col">
                      <WorkflowConsole 
                        logs={executionData.logs}
                        isRunning={executionData.status !== 'COMPLETED' && executionData.status !== 'FAILED'}
                        className="flex-1 h-full"
                      />
                    </div>
                  );
                })() : (
                  <pre className="mt-1 max-h-24 overflow-auto rounded-md bg-foreground text-background p-2 text-[10px] font-mono leading-relaxed">
                    {JSON.stringify(dataSourceResults[source.alias], null, 2)?.slice(
                      0,
                      500
                    )}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSource}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Data Source
        </Button>
      </div>
    </div>
  );
};

DataSourcesEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  dataQueries: PropTypes.array,
  workflows: PropTypes.array,
  dataSourceResults: PropTypes.object,
  onTestRun: PropTypes.func,
  isTestRunning: PropTypes.bool,
};

export default DataSourcesEditor;
