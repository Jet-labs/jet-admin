import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Input,
  Label,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";
import { FiInfo, FiZap } from "react-icons/fi";
import {
  MdDeleteOutline,
  MdAdd,
  MdArrowUpward,
  MdArrowDownward,
  MdAutoAwesome,
} from "react-icons/md";

/**
 * Recursively walk a context object and collect all array-of-objects paths.
 */
const collectArrayPaths = (obj, prefix = "", depth = 0, maxDepth = 4) => {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("__")) continue;
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      results.push({
        path: fullPath,
        label: fullPath,
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
 * Collect numeric/scalar paths from a context object for total row count mapping.
 */
const collectScalarPaths = (obj, prefix = "", depth = 0, maxDepth = 3) => {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("__")) continue;
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (typeof val === "number") {
      results.push({ path: fullPath, label: fullPath, value: val });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      results.push(
        ...collectScalarPaths(val, fullPath, depth + 1, maxDepth)
      );
    }
  }
  return results;
};

/**
 * Resolve a dotted path against an object.
 */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
};

/**
 * TableDataMappingEditor
 *
 * Lets users map query result paths to the table widget's data inputs:
 * - dataArrayPath: which array from the query results feeds the table rows
 * - totalCountPath: which scalar value provides the total row count
 * - columns: auto-detected or manually defined column configuration
 */
export const TableDataMappingEditor = ({
  widgetEditorForm,
  dataManifest,
  queryResults,
  boundDataSources,
}) => {
  const dataMapping =
    widgetEditorForm.values.widgetConfig?.dataMapping || {};
  const columns = widgetEditorForm.values.widgetConfig?.columns || [];

  // Build alias-based suggestions from bound data sources (always available)
  const aliasSuggestions = useMemo(() => {
    if (!boundDataSources?.length) return [];
    return boundDataSources.filter((s) => s.alias).map((s) => s.alias);
  }, [boundDataSources]);

  // Discover array paths from live query results
  const arrayPaths = useMemo(() => {
    const paths = [];
    if (queryResults) {
      paths.push(...collectArrayPaths(queryResults));
    }
    // If no discovered paths, generate suggestions from aliases
    if (paths.length === 0 && aliasSuggestions.length > 0) {
      for (const alias of aliasSuggestions) {
        paths.push({
          path: `${alias}.data`,
          label: `${alias}.data`,
          sampleKeys: [],
          rowCount: 0,
          isSuggestion: true,
        });
      }
    }
    return paths;
  }, [queryResults, aliasSuggestions]);

  // Discover scalar (number) paths for total rows
  const scalarPaths = useMemo(() => {
    const paths = [];
    if (queryResults) {
      paths.push(...collectScalarPaths(queryResults));
    }
    // Suggestions from aliases
    if (paths.length === 0 && aliasSuggestions.length > 0) {
      for (const alias of aliasSuggestions) {
        paths.push({
          path: `${alias}.total`,
          label: `${alias}.total`,
          value: null,
          isSuggestion: true,
        });
      }
    }
    return paths;
  }, [queryResults, aliasSuggestions]);

  // Discover column keys from the selected data array path
  const discoveredColumns = useMemo(() => {
    if (!queryResults || !dataMapping.dataArrayPath) return [];
    const resolved = resolvePath(queryResults, dataMapping.dataArrayPath);
    if (Array.isArray(resolved) && resolved.length > 0 && typeof resolved[0] === "object") {
      return Object.keys(resolved[0]).map((key) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        type: typeof resolved[0][key],
      }));
    }
    // Also try alias-based matching from arrayPaths
    const match = arrayPaths.find((p) => p.path === dataMapping.dataArrayPath);
    if (match && match.sampleKeys?.length > 0) {
      return match.sampleKeys.map((key) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        type: "string",
      }));
    }
    return [];
  }, [queryResults, dataMapping.dataArrayPath, arrayPaths]);

  // All available field keys for dropdown suggestions in column key inputs
  const availableKeys = useMemo(() => {
    return discoveredColumns.map((c) => c.key);
  }, [discoveredColumns]);

  const handleMappingChange = (field, value) => {
    widgetEditorForm.setFieldValue("widgetConfig.dataMapping", {
      ...dataMapping,
      [field]: value,
    });
  };

  // ── Column helpers ──
  const handleAddColumn = useCallback(() => {
    widgetEditorForm.setFieldValue("widgetConfig.columns", [
      ...columns,
      { label: "New Column", key: "" },
    ]);
  }, [widgetEditorForm, columns]);

  const handleAutoPopulateColumns = useCallback(() => {
    if (discoveredColumns.length === 0) return;
    const newColumns = discoveredColumns.map((col) => ({
      label: col.label,
      key: col.key,
    }));
    widgetEditorForm.setFieldValue("widgetConfig.columns", newColumns);
  }, [widgetEditorForm, discoveredColumns]);

  const handleUpdateColumn = useCallback(
    (index, field, value) => {
      const updated = [...columns];
      updated[index] = { ...updated[index], [field]: value };
      widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
    },
    [widgetEditorForm, columns]
  );

  const handleRemoveColumn = useCallback(
    (index) => {
      const updated = [...columns];
      updated.splice(index, 1);
      widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
    },
    [widgetEditorForm, columns]
  );

  const handleMoveColumn = useCallback(
    (index, direction) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= columns.length) return;
      const updated = [...columns];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
    },
    [widgetEditorForm, columns]
  );

  return (
    <div className="space-y-4 border-t pt-4">
      <Label className="text-xs font-semibold text-foreground">
        Data Mapping
      </Label>

      {/* Data Array Path */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">
          Data Array Path
        </Label>
        {arrayPaths.length > 0 ? (
          <>
            <Select
              value={dataMapping.dataArrayPath || ""}
              onValueChange={(val) =>
                handleMappingChange("dataArrayPath", val)
              }
            >
              <SelectTrigger className="text-xs font-mono">
                <SelectValue placeholder="Select a data array from results…" />
              </SelectTrigger>
              <SelectContent>
                {arrayPaths.map((arr, idx) => (
                  <SelectItem key={idx} value={arr.path}>
                    <span className="font-mono">{arr.label}</span>
                    {arr.isSuggestion ? (
                      <span className="text-muted-foreground ml-2">
                        (suggested)
                      </span>
                    ) : (
                      <span className="text-muted-foreground ml-2">
                        ({arr.rowCount} rows, {arr.sampleKeys.length} fields)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[0.6rem] text-muted-foreground">
              Or type a custom path below.
            </p>
            <Input
              type="text"
              className="text-xs font-mono"
              value={dataMapping.dataArrayPath || ""}
              onChange={(e) =>
                handleMappingChange("dataArrayPath", e.target.value)
              }
              placeholder="orders.data"
            />
          </>
        ) : (
          <>
            <Input
              type="text"
              className="text-sm font-mono"
              value={dataMapping.dataArrayPath || ""}
              onChange={(e) =>
                handleMappingChange("dataArrayPath", e.target.value)
              }
              placeholder="orders.data"
            />
            <p className="text-[0.65rem] text-muted-foreground flex items-start gap-1">
              <FiInfo className="w-3 h-3 mt-0.5 shrink-0" />
              Click Load Data to discover available data arrays from query
              results.
            </p>
          </>
        )}
      </div>

      {/* ═══ Columns ═══ */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-foreground">
            Table Columns
          </Label>
          <div className="flex gap-1">
            {discoveredColumns.length > 0 && (
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

        {discoveredColumns.length > 0 && columns.length === 0 && (
          <div className="flex items-center gap-2 text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <FiZap className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>{discoveredColumns.length}</strong> fields detected from
              loaded data. Click <strong>Auto-detect</strong> to populate
              columns.
            </span>
          </div>
        )}

        {columns.length === 0 && discoveredColumns.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs">
            No columns defined. Select a data array path first, then click
            Auto-detect or add columns manually.
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
                  {availableKeys.length > 0 ? (
                    <Select
                      value={col.key || ""}
                      onValueChange={(val) =>
                        handleUpdateColumn(idx, "key", val)
                      }
                    >
                      <SelectTrigger className="h-7 text-xs font-mono">
                        <SelectValue placeholder="Select field…" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableKeys.map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={col.key}
                      onChange={(e) =>
                        handleUpdateColumn(idx, "key", e.target.value)
                      }
                      className="h-7 text-xs font-mono"
                      placeholder="user_name"
                    />
                  )}
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

      {/* Total Count Path */}
      <div className="space-y-1.5 border-t pt-4">
        <Label className="text-xs font-medium text-foreground">
          Total Count Path{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        {scalarPaths.length > 0 ? (
          <Select
            value={dataMapping.totalCountPath || ""}
            onValueChange={(val) =>
              handleMappingChange("totalCountPath", val)
            }
          >
            <SelectTrigger className="text-xs font-mono">
              <SelectValue placeholder="Select a total count field…" />
            </SelectTrigger>
            <SelectContent>
              {scalarPaths.map((s, idx) => (
                <SelectItem key={idx} value={s.path}>
                  <span className="font-mono">{s.label}</span>
                  <span className="text-muted-foreground ml-2">
                    = {s.value}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            className="text-xs font-mono"
            value={dataMapping.totalCountPath || ""}
            onChange={(e) =>
              handleMappingChange("totalCountPath", e.target.value)
            }
            placeholder="orders.meta.total"
          />
        )}
        <p className="text-[0.6rem] text-muted-foreground">
          Used for server-side pagination. Leave empty to use the array length.
        </p>
      </div>
    </div>
  );
};

TableDataMappingEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  dataManifest: PropTypes.object,
  queryResults: PropTypes.object,
  boundDataSources: PropTypes.array,
};

export default TableDataMappingEditor;
