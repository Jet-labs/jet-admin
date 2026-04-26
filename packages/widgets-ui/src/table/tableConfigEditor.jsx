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
export const TableConfigEditor = ({ widgetEditorForm, queryResults }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const columns = config.columns || [];
  const pagination = config.pagination || {
    enabled: false,
    pageParam: "page",
    pageSizeParam: "limit",
  };

  // Discover column keys from queryResults using dataMapping.dataArrayPath
  const dataArrayPath = config.dataMapping?.dataArrayPath;

  const discoveredColumns = useMemo(() => {
    if (!queryResults || !dataArrayPath) return [];

    const resolved = resolvePath(queryResults, dataArrayPath);

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
  }, [queryResults, dataArrayPath]);

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

  const handlePaginationChange = (field, value) => {
    widgetEditorForm.setFieldValue("widgetConfig.pagination", {
      ...pagination,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5">
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
        )}
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

      {/* Bottom spacer */}
      <div className="h-8 shrink-0" />
    </div>
  );
};

TableConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  queryResults: PropTypes.object,
};

export default TableConfigEditor;
