import React, { useCallback, useMemo } from "react";
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
import { FiPlus, FiTrash2, FiRefreshCw, FiLoader } from "react-icons/fi";

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
  queryResults,
  onTestRun,
  isTestRunning,
}) => {
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
        <Label className="text-xs font-semibold text-foreground">
          Data Sources
        </Label>
        <div className="flex items-center gap-1.5">
          {queryResults && (
            <span className="text-[0.6rem] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              Data loaded
            </span>
          )}
          {dataSources.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={onTestRun}
              disabled={isTestRunning}
            >
              {isTestRunning ? (
                <FiLoader className="w-3 h-3 animate-spin" />
              ) : (
                <FiRefreshCw className="w-3 h-3" />
              )}
              {queryResults ? "Refresh" : "Load Data"}
            </Button>
          )}
        </div>
      </div>

      {dataSources.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-md">
          No data sources bound. Add a data query or workflow to feed data into
          this widget.
        </p>
      )}

      {dataSources.map((source, idx) => {
        const argDefs = getSourceArgDefs(source);
        return (
          <div
            key={idx}
            className="space-y-2.5 rounded-lg border bg-background/50 p-3"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-medium text-muted-foreground">
                Source {idx + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveSource(idx)}
              >
                <FiTrash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Type selector */}
            <div className="space-y-1">
              <Label className="text-[0.65rem] text-muted-foreground">
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
              <Label className="text-[0.65rem] text-muted-foreground">
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
              <Label className="text-[0.65rem] text-muted-foreground">
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
              <p className="text-[0.6rem] text-muted-foreground">
                Used as the key in query results. E.g.{" "}
                <code className="font-mono">{source.alias || "alias"}.data</code>
              </p>
            </div>

            {/* Input Arguments */}
            {argDefs.length > 0 && (
              <div className="space-y-2 border-t pt-2">
                <Label className="text-[0.6rem] text-muted-foreground font-medium">
                  Input Arguments
                </Label>
                {argDefs.map((arg) => {
                  const argKey = arg.key || arg.name;
                  return (
                    <div key={argKey} className="space-y-0.5">
                      <Label className="text-[0.6rem] text-muted-foreground">
                        {argKey}
                        {arg.type && (
                          <span className="ml-1 text-muted-foreground/60">
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
            {queryResults?.[source.alias] && (
              <div className="border-t pt-2">
                <Label className="text-[0.6rem] text-muted-foreground">
                  Result Preview
                </Label>
                <pre className="mt-1 max-h-24 overflow-auto rounded bg-muted p-2 text-[0.6rem] font-mono">
                  {JSON.stringify(queryResults[source.alias], null, 2)?.slice(
                    0,
                    500
                  )}
                </pre>
              </div>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs gap-1"
        onClick={handleAddSource}
      >
        <FiPlus className="w-3 h-3" />
        Add Data Source
      </Button>
    </div>
  );
};

DataSourcesEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  dataQueries: PropTypes.array,
  workflows: PropTypes.array,
  queryResults: PropTypes.object,
  onTestRun: PropTypes.func,
  isTestRunning: PropTypes.bool,
};

export default DataSourcesEditor;
