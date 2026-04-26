import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";
import { FiInfo } from "react-icons/fi";

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
 * TableDataMappingEditor
 *
 * Lives in the "Data" tab. Maps data source results to table inputs:
 * - dataArrayPath: which path in queryResults feeds the table rows
 * - totalCountPath: which scalar provides total count (pagination)
 *
 * Column configuration is handled by TableConfigEditor in the "Properties" tab.
 */
export const TableDataMappingEditor = ({
  widgetEditorForm,
  dataManifest,
  queryResults,
  boundDataSources,
}) => {
  const dataMapping = widgetEditorForm.values.widgetConfig?.dataMapping || {};

  // Build alias-based suggestions from bound data sources
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
        // Also suggest the alias directly (some queries return arrays directly)
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
  }, [queryResults, aliasSuggestions]);

  // Discover scalar (number) paths for total rows
  const scalarPaths = useMemo(() => {
    const paths = [];
    if (queryResults) {
      paths.push(...collectScalarPaths(queryResults));
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
  }, [queryResults, aliasSuggestions]);

  const handleMappingChange = (field, value) => {
    widgetEditorForm.setFieldValue("widgetConfig.dataMapping", {
      ...dataMapping,
      [field]: value,
    });
  };

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
              placeholder="alias.data"
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
              placeholder="alias.data"
            />
            <p className="text-[0.65rem] text-muted-foreground flex items-start gap-1">
              <FiInfo className="w-3 h-3 mt-0.5 shrink-0" />
              Click Load Data to discover available data arrays from query results.
            </p>
          </>
        )}
      </div>

      {/* Total Count Path */}
      <div className="space-y-1.5">
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
            placeholder="alias.meta.total"
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
