import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { Input, Label, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { FiPlus, FiTrash2, FiInfo } from "react-icons/fi";

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
 * VegaDataMappingEditor
 *
 * Lets users create named data source bindings for Vega specs.
 * Each entry maps a Vega data source name to a query result path.
 *
 * Stored in widgetConfig.dataMapping.dataSources as:
 *   { "table": "orders.data", "categories": "users.data" }
 */
export const VegaDataMappingEditor = ({ widgetEditorForm, dataManifest, queryResults, boundDataSources }) => {
  const dataMapping = widgetEditorForm.values.widgetConfig?.dataMapping || {};
  const dataSources = dataMapping.dataSources || {};
  const entries = Object.entries(dataSources);

  // Discover array paths from live query results
  const arrayPaths = useMemo(() => {
    if (!queryResults) return [];
    return collectArrayPaths(queryResults);
  }, [queryResults]);

  const updateDataSources = useCallback((newSources) => {
    widgetEditorForm.setFieldValue("widgetConfig.dataMapping", {
      ...dataMapping,
      dataSources: newSources,
    });
  }, [widgetEditorForm, dataMapping]);

  const handleAddEntry = useCallback(() => {
    const key = `source_${entries.length}`;
    updateDataSources({ ...dataSources, [key]: "" });
  }, [dataSources, entries.length, updateDataSources]);

  const handleRemoveEntry = useCallback((keyToRemove) => {
    const next = { ...dataSources };
    delete next[keyToRemove];
    updateDataSources(next);
  }, [dataSources, updateDataSources]);

  const handleNameChange = useCallback((oldKey, newKey) => {
    if (newKey === oldKey) return;
    // Rebuild the object preserving order but with the new key
    const next = {};
    for (const [k, v] of Object.entries(dataSources)) {
      next[k === oldKey ? newKey : k] = v;
    }
    updateDataSources(next);
  }, [dataSources, updateDataSources]);

  const handlePathChange = useCallback((key, path) => {
    updateDataSources({ ...dataSources, [key]: path });
  }, [dataSources, updateDataSources]);

  return (
    <div className="space-y-4 border-t pt-4">
      <Label className="text-xs font-semibold text-foreground">
        Data Mapping — Vega Data Sources
      </Label>

      {entries.length === 0 && (
        <p className="text-[0.65rem] text-muted-foreground flex items-start gap-1">
          <FiInfo className="w-3 h-3 mt-0.5 shrink-0" />
          No data source mappings yet. Add one to map query results to Vega named data sources.
        </p>
      )}

      {entries.map(([vegaName, path], idx) => (
        <div key={idx} className="flex items-end gap-2 rounded-md border bg-background/50 p-2">
          {/* Vega Data Source Name */}
          <div className="flex-1 space-y-1">
            <Label className="text-[0.6rem] text-muted-foreground">Vega Data Name</Label>
            <Input
              type="text"
              className="text-xs font-mono"
              value={vegaName}
              onChange={(e) => handleNameChange(vegaName, e.target.value)}
              placeholder="table"
            />
          </div>

          {/* Query Result Path */}
          <div className="flex-1 space-y-1">
            <Label className="text-[0.6rem] text-muted-foreground">Query Result Path</Label>
            {arrayPaths.length > 0 ? (
              <Select
                value={path || ""}
                onValueChange={(val) => handlePathChange(vegaName, val)}
              >
                <SelectTrigger className="text-xs font-mono">
                  <SelectValue placeholder="Select a path…" />
                </SelectTrigger>
                <SelectContent>
                  {arrayPaths.map((arr, i) => (
                    <SelectItem key={i} value={arr.path}>
                      <span className="font-mono">{arr.label}</span>
                      <span className="text-muted-foreground ml-2">
                        ({arr.rowCount} rows)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="text"
                className="text-xs font-mono"
                value={path || ""}
                onChange={(e) => handlePathChange(vegaName, e.target.value)}
                placeholder="orders.data"
              />
            )}
          </div>

          {/* Remove */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
            onClick={() => handleRemoveEntry(vegaName)}
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs gap-1"
        onClick={handleAddEntry}
      >
        <FiPlus className="w-3 h-3" />
        Add Data Source Mapping
      </Button>
    </div>
  );
};

VegaDataMappingEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  dataManifest: PropTypes.object,
  queryResults: PropTypes.object,
  boundDataSources: PropTypes.array,
};

export default VegaDataMappingEditor;
