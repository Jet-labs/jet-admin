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
  Checkbox,
} from "@jet-admin/ui";
import { Trash2, Plus, ArrowUp, ArrowDown, Sparkles, Zap } from 'lucide-react';

import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { getSuggestionsFromStateTree } from '../intellisense/suggestionEngine';
import { getValueByPath } from "@jet-admin/template-engine";

/**
 * Resolve a dotted path against an object (e.g. "alias.data" -> obj.alias.data).
 */
/**
 * Resolve a dotted path against an object, stripping "state." prefix.
 * Uses the shared template engine tokenizer with allowedRoots.
 */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  return getValueByPath(obj, path, { allowedRoots: ['state'] });
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
export const TableConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const dataSources = config.dataSources || [];
  const columns = config.columns || [];
  const pagination = config.pagination || {
    enabled: false,
    pageParam: "page",
    pageSizeParam: "limit",
    totalTemplate: "",
  };
  const search = config.search || { enabled: false, serverSide: false, placeholder: "Search..." };
  const exportConfig = config.export || { enabled: false, format: "csv", serverSide: false, buttonLabel: "Export" };
  const editing = config.editing || { enabled: false };
  const multiSelect = config.multiSelect || { enabled: false, showSelectAll: true, actions: [] };
  const bulkEdit = config.bulkEdit || { enabled: false, saveLabel: "Save All Changes" };

  // Build namespace-based suggestions from the state tree
  const aliasSuggestions = useMemo(() => {
    const suggestions = [];
    if (!stateTree) return suggestions;
    if (stateTree.queries) {
      Object.keys(stateTree.queries).forEach(alias => suggestions.push(`state.queries.${alias}`));
    }
    if (stateTree.workflows) {
      Object.keys(stateTree.workflows).forEach(alias => suggestions.push(`state.workflows.${alias}`));
    }
    return suggestions;
  }, [stateTree]);

  // ── Unified Intellisense from State Tree ──
  const stateTreeSuggestions = useMemo(() => {
    return getSuggestionsFromStateTree(stateTree);
  }, [stateTree]);

  const arraySuggestions = useMemo(() => {
    const fromTree = stateTreeSuggestions
      .filter(s => s.valueType === 'array')
      .map(s => ({
        label: `{{${s.value}}}`,
        value: `{{${s.value}}}`,
        detail: s.detail || "Runtime data array"
      }));
    
    // Add alias fallbacks if tree is empty
    if (fromTree.length === 0 && aliasSuggestions.length > 0) {
      return aliasSuggestions.map(alias => ({
        label: `{{${alias}.data}}`,
        value: `{{${alias}.data}}`,
        detail: "suggested"
      }));
    }
    return fromTree;
  }, [stateTreeSuggestions, aliasSuggestions]);

  const scalarSuggestions = useMemo(() => {
    const fromTree = stateTreeSuggestions
      .filter(s => s.valueType === 'scalar' && !isNaN(Number(s.rawValue)))
      .map(s => ({
        label: `{{${s.value}}}`,
        value: `{{${s.value}}}`,
        detail: `= ${s.rawValue}`
      }));
      
    if (fromTree.length === 0 && aliasSuggestions.length > 0) {
      return aliasSuggestions.map(alias => ({
        label: `{{${alias}.total}}`,
        value: `{{${alias}.total}}`,
        detail: "suggested"
      }));
    }
    return fromTree;
  }, [stateTreeSuggestions, aliasSuggestions]);

  const loadingSuggestions = useMemo(() => {
    const fromTree = stateTreeSuggestions
      .filter(s => s.valueType === 'boolean')
      .map(s => ({
        label: `{{${s.value}}}`,
        value: `{{${s.value}}}`,
        detail: `= ${s.rawValue}`
      }));
      
    if (fromTree.length === 0 && aliasSuggestions.length > 0) {
      return aliasSuggestions.map(alias => ({
        label: `{{${alias}.isLoading}}`,
        value: `{{${alias}.isLoading}}`,
        detail: "suggested"
      }));
    }
    return fromTree;
  }, [stateTreeSuggestions, aliasSuggestions]);

  // Discover column keys from queryResults using dataArrayTemplate
  // We need to strip {{ }} to resolve the path in the builder
  const dataArrayPathStr = config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "";
  const dataArrayPath = dataArrayPathStr.replace(/^\{{\s*/, '').replace(/\s*}}$/, '');

  const discoveredColumns = useMemo(() => {
    if (!stateTree || !dataArrayPath) return [];

    const resolved = resolvePath(stateTree, dataArrayPath);

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
  }, [stateTree, dataArrayPath]);

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

  // ── Multi-Select Actions helpers ──
  const handleAddBulkAction = useCallback(() => {
    const currentActions = multiSelect.actions || [];
    widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", [
      ...currentActions,
      { label: "New Action", actionKey: `action_${currentActions.length + 1}`, variant: "default" },
    ]);
  }, [widgetEditorForm, multiSelect]);

  const handleUpdateBulkAction = useCallback((index, field, value) => {
    const updated = [...(multiSelect.actions || [])];
    updated[index] = { ...updated[index], [field]: value };
    widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", updated);
  }, [widgetEditorForm, multiSelect]);

  const handleRemoveBulkAction = useCallback((index) => {
    const updated = [...(multiSelect.actions || [])];
    updated.splice(index, 1);
    widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", updated);
  }, [widgetEditorForm, multiSelect]);

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
            placeholder="e.g. {{ state.queries.my_query.data }}"
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
            placeholder="e.g. {{ state.queries.my_query.total }}"
            suggestions={scalarSuggestions}
          />
          <p className="text-[0.6rem] text-muted-foreground">
            Used for server-side pagination. Leave empty to use array length.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <TemplateAutocompleteInput
            value={config.isLoading || ""}
            onChange={(val) => handleConfigChange("isLoading", val)}
            placeholder="e.g. {{ state.queries.my_query.isLoading }}"
            suggestions={loadingSuggestions}
          />
          <p className="text-[0.6rem] text-muted-foreground">
            Mustache template evaluating to a boolean loading state.
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
                <Sparkles className="mr-1 text-amber-500" /> Auto-detect
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddColumn}
              className="h-7 text-xs px-2"
            >
              <Plus className="mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Hint: auto-detect available */}
        {discoveredColumns.length > 0 && columns.length === 0 && (
          <div className="flex items-center gap-2 text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <Zap className="w-3.5 h-3.5 shrink-0" />
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
            Configure a Data Array Template above first, then come back
            here to set up columns.
          </div>
        )}

        {/* No results yet hint */}
        {dataArrayPath &&
          discoveredColumns.length === 0 &&
          columns.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs leading-relaxed">
              No columns detected from <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary">{dataArrayPath}</code>.
              <br/><br/>
              Make sure the expression points to an array of objects and that you have executed the data source in the App Page Editor, or add columns manually.
            </div>
          )}

        {/* Column list */}
        {columns.length > 0 && (
          <div className="space-y-2">
            {columns.map((col, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 p-2 border rounded-md bg-muted/30"
              >
                <div className="flex items-end gap-1.5">
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
                    <ArrowUp className="h-3.5 w-3.5" />
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
                    <ArrowDown className="h-3.5 w-3.5" />
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
                  <Trash2 className="h-4 w-4" />
                </Button>
                </div>
                {/* Editable toggle */}
                <div className="flex items-center pl-8">
                  <Checkbox
                    id={`col-edit-${idx}`}
                    checked={!!col.editable}
                    onCheckedChange={(val) => handleUpdateColumn(idx, "editable", !!val)}
                    className="h-3.5 w-3.5"
                  />
                  <Label htmlFor={`col-edit-${idx}`} className="text-[10px] ml-1.5 text-muted-foreground cursor-pointer">
                    Editable Column
                  </Label>
                </div>
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
          <div className="space-y-2 bg-muted/30 p-3 rounded-md border mt-1">
            <p className="text-[0.6rem] text-muted-foreground">
              Configure pagination actions in the <strong>Events</strong> tab
              using the <strong>On Page Change</strong> event.
              Event data: <code className="bg-background px-1 rounded border border-border font-mono text-[10px]">{"{{ event.page }}"}</code>,{" "}
              <code className="bg-background px-1 rounded border border-border font-mono text-[10px]">{"{{ event.offset }}"}</code>,{" "}
              <code className="bg-background px-1 rounded border border-border font-mono text-[10px]">{"{{ event.pageSize }}"}</code>
            </p>
          </div>
        )}
      </div>

      {/* ═══ Search & Export ═══ */}
      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">Search Box</Label>
            <Switch
              checked={search.enabled}
              onCheckedChange={(v) => handleConfigChange("search", { ...search, enabled: v })}
            />
          </div>
          {search.enabled && (
            <div className="space-y-2 bg-muted/30 p-2 rounded border">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="search-server"
                  checked={search.serverSide}
                  onCheckedChange={(v) => handleConfigChange("search", { ...search, serverSide: !!v })}
                />
                <Label htmlFor="search-server" className="text-[10px] cursor-pointer">Server-side (fires onSearch)</Label>
              </div>
              <Input
                value={search.placeholder || ""}
                onChange={(e) => handleConfigChange("search", { ...search, placeholder: e.target.value })}
                placeholder="Search placeholder..."
                className="h-7 text-xs"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">Export Data</Label>
            <Switch
              checked={exportConfig.enabled}
              onCheckedChange={(v) => handleConfigChange("export", { ...exportConfig, enabled: v })}
            />
          </div>
          {exportConfig.enabled && (
            <div className="space-y-2 bg-muted/30 p-2 rounded border">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="export-server"
                  checked={exportConfig.serverSide}
                  onCheckedChange={(v) => handleConfigChange("export", { ...exportConfig, serverSide: !!v })}
                />
                <Label htmlFor="export-server" className="text-[10px] cursor-pointer">Server-side (fires onExport)</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={exportConfig.buttonLabel || ""}
                  onChange={(e) => handleConfigChange("export", { ...exportConfig, buttonLabel: e.target.value })}
                  placeholder="Button Label"
                  className="h-7 text-xs flex-1"
                />
                <Select
                  value={exportConfig.format || "csv"}
                  onValueChange={(v) => handleConfigChange("export", { ...exportConfig, format: v })}
                >
                  <SelectTrigger className="h-7 text-xs w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Multi-Select & Bulk Actions ═══ */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">Multi-Row Selection</Label>
          <Switch
            checked={multiSelect.enabled}
            onCheckedChange={(v) => handleConfigChange("multiSelect", { ...multiSelect, enabled: v })}
          />
        </div>
        {multiSelect.enabled && (
          <div className="space-y-2 bg-muted/30 p-3 rounded border">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                id="ms-select-all"
                checked={multiSelect.showSelectAll}
                onCheckedChange={(v) => handleConfigChange("multiSelect", { ...multiSelect, showSelectAll: !!v })}
              />
              <Label htmlFor="ms-select-all" className="text-[10px] cursor-pointer">Show "Select All" Checkbox</Label>
            </div>
            
            <div className="pt-1">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[10px] font-medium">Bulk Actions</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddBulkAction} className="h-6 text-[10px] px-2">
                  <Plus className="mr-1 h-3 w-3" /> Add Action
                </Button>
              </div>
              {(!multiSelect.actions || multiSelect.actions.length === 0) && (
                <p className="text-[10px] text-muted-foreground italic">No bulk actions configured. Selection will be tracked in widgetState.</p>
              )}
              <div className="space-y-1.5">
                {(multiSelect.actions || []).map((act, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-background p-1.5 rounded border">
                    <Input
                      value={act.label}
                      onChange={(e) => handleUpdateBulkAction(idx, "label", e.target.value)}
                      placeholder="Label"
                      className="h-6 text-[10px] w-24"
                    />
                    <Input
                      value={act.actionKey}
                      onChange={(e) => handleUpdateBulkAction(idx, "actionKey", e.target.value)}
                      placeholder="actionKey"
                      className="h-6 text-[10px] font-mono flex-1"
                    />
                    <Select value={act.variant || "default"} onValueChange={(v) => handleUpdateBulkAction(idx, "variant", v)}>
                      <SelectTrigger className="h-6 text-[10px] w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="destructive">Danger</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBulkAction(idx)} className="h-6 w-6 text-destructive shrink-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Row Editing Features ═══ */}
      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">Inline Row Editing</Label>
            <Switch
              checked={editing.enabled}
              onCheckedChange={(v) => {
                handleConfigChange("editing", { ...editing, enabled: v });
                if (v && bulkEdit.enabled) handleConfigChange("bulkEdit", { ...bulkEdit, enabled: false }); // Mutual exclusivity
              }}
            />
          </div>
          <p className="text-[9.5px] text-muted-foreground leading-tight">
            Adds an Edit button to each row. Fires <code className="bg-background px-1 border rounded">onRowSave</code>.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">Excel-Style Bulk Edit</Label>
            <Switch
              checked={bulkEdit.enabled}
              onCheckedChange={(v) => {
                handleConfigChange("bulkEdit", { ...bulkEdit, enabled: v });
                if (v && editing.enabled) handleConfigChange("editing", { ...editing, enabled: false }); // Mutual exclusivity
              }}
            />
          </div>
          <p className="text-[9.5px] text-muted-foreground leading-tight">
            Double-click cells to edit. Fires <code className="bg-background px-1 border rounded">onBulkEdit</code> on save.
          </p>
          {bulkEdit.enabled && (
            <div className="space-y-1 bg-muted/30 p-2 rounded border mt-2">
              <Label className="text-[10px]">Save Button Label</Label>
              <Input
                value={bulkEdit.saveLabel || "Save All Changes"}
                onChange={(e) => handleConfigChange("bulkEdit", { ...bulkEdit, saveLabel: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TableConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  dataSourceResults: PropTypes.object,
};

export default TableConfigEditor;
