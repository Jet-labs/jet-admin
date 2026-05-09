import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Input,
  Label,
  Switch,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";
import {
  MdDeleteOutline,
  MdAdd,
  MdArrowUpward,
  MdArrowDownward,
  MdAutoAwesome,
} from "react-icons/md";
import { FiZap } from "react-icons/fi";

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

  const handleSelect = (path) => {
    onChange(path);
    setShowSuggestions(false);
  };

  // Filter suggestions based on current input
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
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-brand-dark border border-border rounded-md shadow-lg max-h-48 overflow-auto">
          {filteredSuggestions.map((s, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s.value)}
              className="w-full px-2 py-1.5 text-left text-xs hover:bg-muted flex items-center justify-between gap-2 border-b border-border last:border-0 cursor-pointer transition-colors"
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
      results.push(...collectScalarPaths(val, fullPath, depth + 1, maxDepth));
    }
  }
  return results;
};

/**
 * Resolve a dotted path against an object (e.g. "alias.data" -> obj.alias.data).
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
 * TableConfigEditor
 *
 * Lives in the "Properties" tab. Handles:
 * - Column configuration (with auto-detect from queryResults)
 * - Pagination settings
 *
 * Data source binding and path mapping are handled in the "Data" tab.
 */
export const TableConfigEditor = ({ widgetEditorForm, dataSourceResults }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const dataSources = config.dataSources || [];
  const columns = config.columns || [];
  const pagination = config.pagination || {
    enabled: false,
    pageParam: "page",
    pageSizeParam: "limit",
    totalTemplate: "",
  };

  // Build alias-based suggestions from bound data sources
  const aliasSuggestions = useMemo(() => {
    if (!dataSources?.length) return [];
    return dataSources.filter((s) => s.alias).map((s) => s.alias);
  }, [dataSources]);

  // Discover array paths from live query results
  const arrayPaths = useMemo(() => {
    const paths = [];
    if (dataSourceResults) {
      paths.push(...collectArrayPaths(dataSourceResults));
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
        paths.push({
          path: alias,
          label: alias,
          sampleKeys: [],
          rowCount: 0,
          isSuggestion: true,
        });
      }
    }
    return paths;
  }, [dataSourceResults, aliasSuggestions]);

  // Discover scalar (number) paths for total rows
  const scalarPaths = useMemo(() => {
    const paths = [];
    if (dataSourceResults) {
      paths.push(...collectScalarPaths(dataSourceResults));
    }
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
  }, [dataSourceResults, aliasSuggestions]);

  const arraySuggestions = useMemo(() => {
    return arrayPaths.map(arr => ({
      label: `{{ ${arr.path} }}`,
      value: `{{ ${arr.path} }}`,
      detail: arr.isSuggestion ? "suggested" : `${arr.rowCount} rows`
    }));
  }, [arrayPaths]);

  const scalarSuggestions = useMemo(() => {
    return scalarPaths.map(s => ({
      label: `{{ ${s.path} }}`,
      value: `{{ ${s.path} }}`,
      detail: s.isSuggestion ? "" : `= ${s.value}`
    }));
  }, [scalarPaths]);

  // Discover column keys from queryResults using dataArrayTemplate
  // We need to strip {{ }} to resolve the path in the builder
  const dataArrayPathStr = config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "";
  const dataArrayPath = dataArrayPathStr.replace(/^{{\s*/, '').replace(/\s*}}$/, '');

  const discoveredColumns = useMemo(() => {
    if (!dataSourceResults || !dataArrayPath) return [];

    const resolved = resolvePath(dataSourceResults, dataArrayPath);

    if (
      Array.isArray(resolved) &&
      resolved.length > 0 &&
      typeof resolved[0] === "object"
    ) {
      return Object.keys(resolved[0]).map((key) => ({
        key,
        label: key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        type: typeof resolved[0][key],
      }));
    }
    return [];
  }, [dataSourceResults, dataArrayPath]);

  // All available field keys for dropdown suggestions in column key inputs
  const availableKeys = useMemo(() => {
    return discoveredColumns.map((c) => c.key);
  }, [discoveredColumns]);

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

  // ── Pagination helpers ──
  const handlePaginationToggle = (checked) => {
    widgetEditorForm.setFieldValue("widgetConfig.pagination", {
      ...pagination,
      enabled: checked,
    });
  };

  const handleConfigChange = (field, value) => {
    widgetEditorForm.setFieldValue(`widgetConfig.${field}`, value);
  };

  const handlePaginationChange = (field, value) => {
    widgetEditorForm.setFieldValue("widgetConfig.pagination", {
      ...pagination,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5">
      {/* ═══ Data Source Mapping ═══ */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Data Array Template
          </Label>
          <TemplateAutocompleteInput
            value={config.dataArrayTemplate || config.dataMapping?.dataArrayPath || ""}
            onChange={(val) => handleConfigChange("dataArrayTemplate", val)}
            placeholder="e.g. {{ queries.my_query.data }}"
            suggestions={arraySuggestions}
          />
          <p className="text-[0.65rem] text-muted-foreground">
            Mustache template evaluating to an array of objects.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Total Count Template <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <TemplateAutocompleteInput
            value={pagination.totalTemplate || config.dataMapping?.totalCountPath || ""}
            onChange={(val) => handlePaginationChange("totalTemplate", val)}
            placeholder="e.g. {{ queries.my_query.total }}"
            suggestions={scalarSuggestions}
          />
          <p className="text-[0.6rem] text-muted-foreground">
            Used for server-side pagination. Leave empty to use array length.
          </p>
        </div>
      </div>

      {/* ═══ Columns ═══ */}
      <div className="space-y-2">
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

        {/* Hint: auto-detect available */}
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

        {/* No data source hint */}
        {!dataArrayPath && columns.length === 0 && (
          <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs">
            Configure a Data Array Path in the Data tab first, then come back
            here to set up columns.
          </div>
        )}

        {/* No results yet hint */}
        {dataArrayPath &&
          discoveredColumns.length === 0 &&
          columns.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs">
              No columns detected. Click <strong>Load Data</strong> in the
              Data tab, or add columns manually.
            </div>
          )}

        {/* Column list */}
        {columns.length > 0 && (
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
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => handleMoveColumn(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <MdArrowUpward className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => handleMoveColumn(idx, 1)}
                    disabled={idx === columns.length - 1}
                    title="Move down"
                  >
                    <MdArrowDownward className="h-3.5 w-3.5" />
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
                  size="icon"
                  className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveColumn(idx)}
                  title="Remove column"
                >
                  <MdDeleteOutline className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Pagination ═══ */}
      <div className="space-y-3">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[0.65rem]">Page Argument Name</Label>
                <Input
                  value={pagination.pageParam || ""}
                  onChange={(e) =>
                    handlePaginationChange("pageParam", e.target.value)
                  }
                  placeholder="page"
                  className="h-7 text-xs font-mono"
                />
                <p className="text-[0.6rem] text-muted-foreground">
                  Input argument that receives the page number.
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-[0.65rem]">
                  Page Size Argument Name
                </Label>
                <Input
                  value={pagination.pageSizeParam || ""}
                  onChange={(e) =>
                    handlePaginationChange("pageSizeParam", e.target.value)
                  }
                  placeholder="limit"
                  className="h-7 text-xs font-mono"
                />
                <p className="text-[0.6rem] text-muted-foreground">
                  Input argument that receives rows per page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TableConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  dataSourceResults: PropTypes.object,
};

export default TableConfigEditor;
