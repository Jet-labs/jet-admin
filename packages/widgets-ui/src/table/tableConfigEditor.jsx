import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Switch, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { MdDeleteOutline, MdAdd, MdArrowUpward, MdArrowDownward, MdAutoAwesome } from "react-icons/md";
import { FiZap, FiInfo } from "react-icons/fi";

/**
 * Recursively walk context and collect all array-of-objects paths.
 * Reuses the same algorithm as the Vega DataFieldPanel.
 */
const collectArrayPaths = (obj, prefix = "ctx", depth = 0, maxDepth = 4) => {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("__")) continue; // skip internal keys
    const val = obj[key];
    const fullPath = `${prefix}.${key}`;

    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      results.push({
        path: `{{${fullPath}}}`,
        label: fullPath.replace(/^ctx\./, ""),
        sampleKeys: Object.keys(val[0]),
        rowCount: val.length,
      });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      results.push(...collectArrayPaths(val, fullPath, depth + 1, maxDepth));
    }
  }
  return results;
};

/**
 * Collect numeric/scalar paths from ctx for total row count mapping.
 */
const collectScalarPaths = (obj, prefix = "ctx", depth = 0, maxDepth = 3) => {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("__")) continue;
    const val = obj[key];
    const fullPath = `${prefix}.${key}`;

    if (typeof val === "number") {
      results.push({ path: `{{${fullPath}}}`, label: fullPath.replace(/^ctx\./, ""), value: val });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      results.push(...collectScalarPaths(val, fullPath, depth + 1, maxDepth));
    }
  }
  return results;
};

export const TableConfigEditor = ({ widgetEditorForm, workflowContext, workflows, selectedWorkflow }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const columns = config.columns || [];
  const pagination = config.pagination || {
    enabled: false,
    pageParam: "page",
    pageSizeParam: "limit",
    totalTemplate: "{{ctx.total}}",
  };

  // Workflow input args — extract from selectedWorkflow's schema
  const workflowArgs = useMemo(() => {
    if (!selectedWorkflow) return [];
    try {
      const schema = selectedWorkflow.workflowInputSchema
        || selectedWorkflow.tblWorkflowVersions?.[0]?.workflowInputSchema
        || selectedWorkflow.inputSchema;

      if (!schema) return [];
      const parsed = typeof schema === "string" ? JSON.parse(schema) : schema;

      if (Array.isArray(parsed)) return parsed;
      if (parsed.properties) {
        return Object.entries(parsed.properties).map(([key, def]) => ({
          name: key,
          type: def.type || "string",
          description: def.description || "",
        }));
      }
      return [];
    } catch {
      return [];
    }
  }, [selectedWorkflow]);

  // Discover array paths from live workflowContext
  const ctxArrayPaths = useMemo(() => {
    if (!workflowContext) return [];
    return collectArrayPaths(workflowContext);
  }, [workflowContext]);

  // Discover scalar (number) paths for total rows
  const ctxScalarPaths = useMemo(() => {
    if (!workflowContext) return [];
    return collectScalarPaths(workflowContext);
  }, [workflowContext]);

  // Resolve current data template to get sample keys for auto-populate
  const currentArrayInfo = useMemo(() => {
    const template = config.dataArrayTemplate;
    if (!template || !workflowContext) return null;
    const match = ctxArrayPaths.find((a) => a.path === template);
    return match || null;
  }, [config.dataArrayTemplate, workflowContext, ctxArrayPaths]);

  // ── Column helpers ──
  const handleAddColumn = () => {
    widgetEditorForm.setFieldValue("widgetConfig.columns", [
      ...columns,
      { label: "New Column", key: "new_key" },
    ]);
  };

  const handleAutoPopulateColumns = () => {
    if (!currentArrayInfo) return;
    const newColumns = currentArrayInfo.sampleKeys.map((key) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      key,
    }));
    widgetEditorForm.setFieldValue("widgetConfig.columns", newColumns);
  };

  const handleUpdateColumn = (index, field, value) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
  };

  const handleRemoveColumn = (index) => {
    const updated = [...columns];
    updated.splice(index, 1);
    widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
  };

  const handleMoveColumn = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= columns.length) return;
    const updated = [...columns];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
  };

  // ── Workflow arg value helpers ──
  const workflowArgValues = widgetEditorForm.values.workflowConfig?.workflowArgValues || {};

  const handleArgValueChange = (argName, value) => {
    widgetEditorForm.setFieldValue("workflowConfig.workflowArgValues", {
      ...workflowArgValues,
      [argName]: value,
    });
  };

  // ── Pagination helpers ──
  const handlePaginationToggle = (checked) => {
    widgetEditorForm.setFieldValue("widgetConfig.pagination", {
      ...pagination,
      enabled: checked,
    });
  };

  const handlePaginationChange = (field, value) => {
    widgetEditorForm.setFieldValue("widgetConfig.pagination", {
      ...pagination,
      [field]: value,
    });
  };

  // Which args are claimed by pagination?
  const paginationArgNames = pagination.enabled
    ? [pagination.pageParam, pagination.pageSizeParam].filter(Boolean)
    : [];

  // Filter out pagination-claimed args from the general inputs section
  const generalArgs = workflowArgs.filter(
    (arg) => !paginationArgNames.includes(arg.name)
  );

  return (
    <div className="space-y-5">
      {/* ═══ Data Source ═══ */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">
          Data Array Source
        </Label>
        {ctxArrayPaths.length > 0 ? (
          <>
            <Select
              value={config.dataArrayTemplate || ""}
              onValueChange={(val) =>
                widgetEditorForm.setFieldValue("widgetConfig.dataArrayTemplate", val)
              }
            >
              <SelectTrigger className="text-xs font-mono">
                <SelectValue placeholder="Select a data array from context…" />
              </SelectTrigger>
              <SelectContent>
                {ctxArrayPaths.map((arr, idx) => (
                  <SelectItem key={idx} value={arr.path}>
                    <span className="font-mono">{arr.label}</span>
                    <span className="text-muted-foreground ml-2">
                      ({arr.rowCount} rows, {arr.sampleKeys.length} fields)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[0.6rem] text-muted-foreground">
              Or type a custom template path below.
            </p>
            <Input
              type="text"
              className="text-xs font-mono"
              value={config.dataArrayTemplate || ""}
              onChange={(e) =>
                widgetEditorForm.setFieldValue(
                  "widgetConfig.dataArrayTemplate",
                  e.target.value
                )
              }
              placeholder="{{ctx.query_result}}"
            />
          </>
        ) : (
          <>
            <Input
              type="text"
              className="text-sm font-mono"
              value={config.dataArrayTemplate || ""}
              onChange={(e) =>
                widgetEditorForm.setFieldValue(
                  "widgetConfig.dataArrayTemplate",
                  e.target.value
                )
              }
              placeholder="{{ctx.data}}"
            />
            <p className="text-[0.65rem] text-muted-foreground flex items-start gap-1">
              <FiInfo className="w-3 h-3 mt-0.5 shrink-0" />
              Run the workflow to discover available data arrays from context.
            </p>
          </>
        )}
      </div>

      {/* ═══ Workflow Input Arguments ═══ */}
      {generalArgs.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <Label className="text-xs font-medium text-foreground">
            Workflow Input Arguments
          </Label>
          <p className="text-[0.6rem] text-muted-foreground">
            Set default values for the workflow inputs. Pagination args are configured in the Pagination section below.
          </p>
          <div className="space-y-2">
            {generalArgs.map((arg) => (
              <div key={arg.name} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-[0.65rem] font-mono">{arg.name}</Label>
                  <Input
                    value={workflowArgValues[arg.name] ?? ""}
                    onChange={(e) => handleArgValueChange(arg.name, e.target.value)}
                    className="h-7 text-xs"
                    placeholder={arg.description || `Value for ${arg.name}`}
                  />
                </div>
                <span className="text-[0.6rem] text-muted-foreground pb-2">{arg.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Columns ═══ */}
      <div className="space-y-2 pt-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-foreground">Columns</Label>
          <div className="flex gap-1">
            {currentArrayInfo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoPopulateColumns}
                className="h-7 text-xs px-2"
                title="Auto-detect columns from data"
              >
                <MdAutoAwesome className="mr-1 text-amber-500" /> Auto-detect
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddColumn}
              className="h-7 text-xs px-2"
            >
              <MdAdd className="mr-1" /> Add
            </Button>
          </div>
        </div>

        {currentArrayInfo && columns.length === 0 && (
          <div className="flex items-center gap-2 text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <FiZap className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>{currentArrayInfo.sampleKeys.length}</strong> fields detected from live data.
              Click <strong>Auto-detect</strong> to populate columns.
            </span>
          </div>
        )}

        {columns.length === 0 && !currentArrayInfo ? (
          <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs">
            No columns defined. Columns will be auto-detected from the first row&apos;s keys at render time.
          </div>
        ) : columns.length > 0 ? (
          <div className="space-y-2">
            {columns.map((col, idx) => (
              <div
                key={idx}
                className="flex items-end gap-1.5 p-2 border rounded-md bg-muted/30"
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    square
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    onClick={() => handleMoveColumn(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <MdArrowUpward className="text-xs" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    square
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    onClick={() => handleMoveColumn(idx, 1)}
                    disabled={idx === columns.length - 1}
                    title="Move down"
                  >
                    <MdArrowDownward className="text-xs" />
                  </Button>
                </div>
                {/* Fields */}
                <div className="flex-1 space-y-1">
                  <Label className="text-[0.65rem]">Header Label</Label>
                  <Input
                    value={col.label}
                    onChange={(e) =>
                      handleUpdateColumn(idx, "label", e.target.value)
                    }
                    className="h-7 text-xs"
                    placeholder="User Name"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-[0.65rem]">Data Key</Label>
                  <Input
                    value={col.key}
                    onChange={(e) =>
                      handleUpdateColumn(idx, "key", e.target.value)
                    }
                    className="h-7 text-xs font-mono"
                    placeholder="user_name"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  square
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleRemoveColumn(idx)}
                  title="Remove column"
                >
                  <MdDeleteOutline />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* ═══ Pagination ═══ */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">
            Pagination
          </Label>
          <Switch
            checked={pagination.enabled}
            onCheckedChange={handlePaginationToggle}
          />
        </div>

        {pagination.enabled && (
          <div className="space-y-3 bg-muted/30 p-3 rounded-md border mt-1">
            {/* Instructions */}
            <div className="text-[0.65rem] text-muted-foreground bg-background border rounded p-2.5 space-y-1.5">
              <p className="font-medium text-foreground text-[0.7rem]">How pagination works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Your workflow must accept <strong>page</strong> and <strong>page size</strong> as input arguments
                  (e.g. use them in a SQL <code className="bg-muted px-1 rounded">LIMIT / OFFSET</code>).
                </li>
                <li>
                  Map those argument names below. When the user changes pages, the table will
                  re-run the workflow with these values — <em>overriding</em> any defaults set above.
                </li>
                <li>
                  Set a <strong>Total Rows</strong> template so the paginator can calculate total pages.
                </li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[0.65rem]">Page Argument Name</Label>
                {workflowArgs.length > 0 ? (
                  <Select
                    value={pagination.pageParam || ""}
                    onValueChange={(val) => handlePaginationChange("pageParam", val)}
                  >
                    <SelectTrigger className="h-7 text-xs font-mono">
                      <SelectValue placeholder="Select arg…" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowArgs.map((arg) => (
                        <SelectItem key={arg.name} value={arg.name}>
                          {arg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={pagination.pageParam || ""}
                    onChange={(e) => handlePaginationChange("pageParam", e.target.value)}
                    placeholder="page"
                    className="h-7 text-xs font-mono"
                  />
                )}
                <p className="text-[0.6rem] text-muted-foreground">
                  Workflow input that receives the page number.
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-[0.65rem]">Page Size Argument Name</Label>
                {workflowArgs.length > 0 ? (
                  <Select
                    value={pagination.pageSizeParam || ""}
                    onValueChange={(val) => handlePaginationChange("pageSizeParam", val)}
                  >
                    <SelectTrigger className="h-7 text-xs font-mono">
                      <SelectValue placeholder="Select arg…" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowArgs.map((arg) => (
                        <SelectItem key={arg.name} value={arg.name}>
                          {arg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={pagination.pageSizeParam || ""}
                    onChange={(e) => handlePaginationChange("pageSizeParam", e.target.value)}
                    placeholder="limit"
                    className="h-7 text-xs font-mono"
                  />
                )}
                <p className="text-[0.6rem] text-muted-foreground">
                  Workflow input that receives rows per page.
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[0.65rem]">Total Rows (Template)</Label>
              {ctxScalarPaths.length > 0 ? (
                <Select
                  value={pagination.totalTemplate || ""}
                  onValueChange={(val) => handlePaginationChange("totalTemplate", val)}
                >
                  <SelectTrigger className="h-7 text-xs font-mono">
                    <SelectValue placeholder="Select or type a template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {ctxScalarPaths.map((s, idx) => (
                      <SelectItem key={idx} value={s.path}>
                        <span className="font-mono">{s.label}</span>
                        <span className="text-muted-foreground ml-2">= {s.value}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={pagination.totalTemplate || ""}
                  onChange={(e) => handlePaginationChange("totalTemplate", e.target.value)}
                  placeholder="{{ctx.total_count}}"
                  className="h-7 text-xs font-mono"
                />
              )}
              <p className="text-[0.6rem] text-muted-foreground">
                Context template that resolves to the total number of records.
              </p>
            </div>

            {/* Dual-mapping notice */}
            {paginationArgNames.length > 0 && generalArgs.length > 0 && (
              <div className="text-[0.6rem] text-muted-foreground bg-background border rounded px-2.5 py-1.5 flex items-start gap-1.5">
                <FiInfo className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                <span>
                  The pagination args (<code className="bg-muted px-0.5 rounded">{paginationArgNames.join(", ")}</code>)
                  are hidden from &quot;Workflow Input Arguments&quot; above to avoid conflict.
                  On page change, they will <em>override</em> any base values.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-8 shrink-0" />
    </div>
  );
};

TableConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  workflowContext: PropTypes.object,
  workflows: PropTypes.array,
  selectedWorkflow: PropTypes.object,
};

export default TableConfigEditor;
