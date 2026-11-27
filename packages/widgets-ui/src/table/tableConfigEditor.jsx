import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Sparkles, Zap, Trash2, Plus } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@jet-admin/ui";
import { getValueByPath } from "@jet-admin/expression-engine";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  ConditionBuilder,
  OptionListEditor,
  SegmentedControl,
  TagField,
  useConfigValue,
} from "../config";

const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  return getValueByPath(obj, path, { allowedRoots: ["state"] });
};

export const TableConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => (stateTree ? { state: stateTree } : null), [stateTree]);

  const [dataArrayTemplate, setDataArrayTemplate] = useConfigValue("dataArrayTemplate", "");
  const [columns, setColumns] = useConfigValue("columns", []);
  const [pagination, setPagination] = useConfigValue("pagination", {
    enabled: false,
    pageParam: "page",
    pageSizeParam: "limit",
    pageSize: 10,
    totalTemplate: "",
  });
  const [search, setSearch] = useConfigValue("search", { enabled: false, serverSide: false, placeholder: "Search..." });
  const [exportConfig, setExportConfig] = useConfigValue("export", { enabled: false, format: "csv", serverSide: false, buttonLabel: "Export", scope: "filtered" });
  const [multiSelect, setMultiSelect] = useConfigValue("multiSelect", { enabled: false, showSelectAll: true, actions: [] });
  const [editing, setEditing] = useConfigValue("editing", { enabled: false });
  const [bulkEdit, setBulkEdit] = useConfigValue("bulkEdit", { enabled: false, saveLabel: "Save All Changes" });
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No data available.");
  const [emptyHint, setEmptyHint] = useConfigValue("emptyHint", "");
  const [noResultsText, setNoResultsText] = useConfigValue("noResultsText", "No rows match the current filters.");
  const [loadingText, setLoadingText] = useConfigValue("loadingText", "Updating...");
  const [striped, setStriped] = useConfigValue("striped", true);
  const [hoverHighlight, setHoverHighlight] = useConfigValue("hoverHighlight", true);
  const [stickyHeader, setStickyHeader] = useConfigValue("stickyHeader", true);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const [rowKey, setRowKey] = useConfigValue("rowKey", "id");
  const [resizableColumns, setResizableColumns] = useConfigValue("resizableColumns", false);
  const [virtualize, setVirtualize] = useConfigValue("virtualize", false);
  const [expandableRows, setExpandableRows] = useConfigValue("expandableRows", false);
  const [detailFields, setDetailFields] = useConfigValue("detailFields", []);
  const [detailTitleKey, setDetailTitleKey] = useConfigValue("detailTitleKey", "");
  const [savedViews, setSavedViews] = useConfigValue("savedViews", { enabled: false, storageKey: "" });

  const dataArrayPath = String(dataArrayTemplate || "").replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");

  const discoveredColumns = useMemo(() => {
    if (!stateTree || !dataArrayPath) return [];
    const resolved = resolvePath(stateTree, dataArrayPath);
    if (Array.isArray(resolved) && resolved.length > 0 && typeof resolved[0] === "object" && resolved[0] !== null) {
      return Object.keys(resolved[0]).map((key) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
      }));
    }
    return [];
  }, [stateTree, dataArrayPath]);

  const autoPopulate = useCallback(() => {
    if (!discoveredColumns.length) return;
    setColumns(
      discoveredColumns.map((column) => ({
        key: column.key,
        label: column.label,
        type: "text",
        sortable: true,
      }))
    );
  }, [discoveredColumns, setColumns]);

  const updatePagination = (patch) => setPagination({ ...pagination, ...patch });
  const updateSearch = (patch) => setSearch({ ...search, ...patch });
  const updateExport = (patch) => setExportConfig({ ...exportConfig, ...patch });
  const updateMultiSelect = (patch) => setMultiSelect({ ...multiSelect, ...patch });
  const updateEditing = (enabled) => {
    setEditing({ ...editing, enabled });
    if (enabled && bulkEdit.enabled) setBulkEdit({ ...bulkEdit, enabled: false });
  };
  const updateBulkEdit = (enabled) => {
    setBulkEdit({ ...bulkEdit, enabled });
    if (enabled && editing.enabled) setEditing({ ...editing, enabled: false });
  };

  const bulkActions = Array.isArray(multiSelect?.actions) ? multiSelect.actions : [];
  const updateBulkAction = (index, key, value) => {
    const next = bulkActions.map((action, actionIndex) => (actionIndex === index ? { ...action, [key]: value } : action));
    updateMultiSelect({ actions: next });
  };
  const removeBulkAction = (index) => updateMultiSelect({ actions: bulkActions.filter((_, actionIndex) => actionIndex !== index) });
  const addBulkAction = () => updateMultiSelect({
    actions: [...bulkActions, { label: "New action", actionKey: `action_${bulkActions.length + 1}`, variant: "outline" }],
  });

  const renderColumnFields = (column, index, update, ids) => (
    <>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label htmlFor={ids.labelId} className="text-[9px] uppercase tracking-wider text-muted-foreground">Header</label>
          <Input
            id={ids.labelId}
            value={column?.label ?? ""}
            onChange={(event) => update(index, "label", event.target.value)}
            placeholder="User name"
            className="h-7 text-[11px]"
          />
        </div>
        <div className="space-y-0.5">
          <label htmlFor={ids.valueId} className="text-[9px] uppercase tracking-wider text-muted-foreground">Data key</label>
          <Input
            id={ids.valueId}
            value={column?.key ?? ""}
            onChange={(event) => update(index, "key", event.target.value)}
            placeholder="user.name"
            className="h-7 font-mono text-[11px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Type</label>
          <Select value={column?.type || "text"} onValueChange={(value) => update(index, "type", value)}>
            <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="badge">Badge</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Width</label>
          <Input
            type="number"
            value={column?.width ?? ""}
            onChange={(event) => update(index, "width", event.target.value === "" ? undefined : Number(event.target.value))}
            placeholder="auto"
            className="h-7 text-[11px]"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Align</label>
          <Select value={column?.align || "left"} onValueChange={(value) => update(index, "align", value)}>
            <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {column?.type === "currency" && (
        <div className="grid grid-cols-2 gap-1.5">
          <div className="space-y-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Currency</label>
            <Input
              value={column?.currency ?? "USD"}
              onChange={(event) => update(index, "currency", event.target.value.toUpperCase())}
              className="h-7 font-mono text-[11px]"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Decimals</label>
            <Input
              type="number"
              min={0}
              max={6}
              value={column?.decimals ?? 2}
              onChange={(event) => update(index, "decimals", Number(event.target.value))}
              className="h-7 text-[11px]"
            />
          </div>
        </div>
      )}
      {column?.type === "number" && (
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Decimals</label>
          <Input
            type="number"
            min={0}
            max={6}
            value={column?.decimals ?? 2}
            onChange={(event) => update(index, "decimals", Number(event.target.value))}
            className="h-7 text-[11px]"
          />
        </div>
      )}
      {column?.type === "link" && (
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Link label</label>
          <Input
            value={column?.format ?? ""}
            onChange={(event) => update(index, "format", event.target.value)}
            placeholder="Open record"
            className="h-7 text-[11px]"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Pin</label>
          <Select value={column?.pinned || "none"} onValueChange={(value) => update(index, "pinned", value === "none" ? "" : value)}>
            <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Min width</label>
          <Input
            type="number"
            min={40}
            value={column?.minWidth ?? ""}
            onChange={(event) => update(index, "minWidth", event.target.value === "" ? undefined : Number(event.target.value))}
            placeholder="80"
            className="h-7 text-[11px]"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Max width</label>
          <Input
            type="number"
            min={60}
            value={column?.maxWidth ?? ""}
            onChange={(event) => update(index, "maxWidth", event.target.value === "" ? undefined : Number(event.target.value))}
            placeholder="auto"
            className="h-7 text-[11px]"
          />
        </div>
      </div>

      <details className="rounded-control border border-border/60 bg-muted/20 p-1.5">
        <summary className="cursor-pointer text-[10px] text-muted-foreground">Conditional style</summary>
        <div className="mt-1.5 space-y-1.5">
          <ConditionBuilder
            value={column?.conditionalStyles}
            onChange={(value) => update(index, "conditionalStyles", value)}
            fields={["value", column?.key ? `row.${column.key}` : "row.status"]}
            emptyLabel="No rules — use the column's default style."
          />
          <div className="grid grid-cols-2 gap-1.5">
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Tone</label>
              <Select
                value={column?.conditionalStyles?.style?.tone || "neutral"}
                onValueChange={(tone) => update(index, "conditionalStyles", {
                  ...(column?.conditionalStyles || { logic: "and", rules: [] }),
                  style: { ...(column?.conditionalStyles?.style || {}), tone },
                })}
              >
                <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="danger">Danger</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Emphasis</label>
              <Select
                value={column?.conditionalStyles?.style?.emphasis || "normal"}
                onValueChange={(emphasis) => update(index, "conditionalStyles", {
                  ...(column?.conditionalStyles || { logic: "and", rules: [] }),
                  style: { ...(column?.conditionalStyles?.style || {}), emphasis },
                })}
              >
                <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="muted">Muted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-1">
        {[
          ["sortable", "Sortable", column?.sortable !== false],
          ["filterable", "Filterable", !!column?.filterable],
          ["editable", "Editable", !!column?.editable],
          ["hidden", "Hidden", !!column?.hidden],
        ].map(([key, label, checked]) => (
          <label key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Switch
              checked={checked}
              onCheckedChange={(value) => update(index, key, !!value)}
              className="h-[14px] w-[24px] [&>span]:h-2.5 [&>span]:w-2.5 data-[state=checked]:[&>span]:translate-x-2.5"
              aria-label={`${label} ${column?.label || column?.key || index + 1}`}
            />
            {label}
          </label>
        ))}
      </div>
    </>
  );

  return (
    <>
      <ConfigSection id="table-data" title="Data" description="Where rows come from and how totals are resolved." tab="content">
        <ConfigField label="Data array template" path="dataArrayTemplate" helper="Must resolve to an array of row objects.">
          <BindableInput
            value={dataArrayTemplate}
            onChange={setDataArrayTemplate}
            liveStateTree={liveStateTree}
            placeholder="e.g. {{ state.queries.orders.data }}"
          />
        </ConfigField>
        <ConfigField label="Total count template" path="pagination.totalTemplate" helper="Server-side total; leave empty to use array length.">
          <BindableInput
            value={pagination?.totalTemplate || ""}
            onChange={(value) => updatePagination({ totalTemplate: value })}
            liveStateTree={liveStateTree}
            placeholder="e.g. {{ state.queries.orders.total }}"
          />
        </ConfigField>
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.orders.isLoading }}" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection
        id="table-columns"
        title="Columns"
        description="Reorder, format and control what each column shows."
        tab="content"
        actions={
          discoveredColumns.length > 0 ? (
            <Button type="button" variant="outline" size="sm" className="h-6 px-1.5 text-[10px]" onClick={autoPopulate} title="Auto-detect columns from loaded data">
              <Sparkles className="mr-1 h-3 w-3" /> Auto-detect
            </Button>
          ) : null
        }
      >
        {discoveredColumns.length > 0 && (!columns || columns.length === 0) && (
          <div className="flex items-center gap-1.5 rounded-control border border-border bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">
            <Zap className="h-3 w-3 shrink-0 text-primary" />
            <span>
              <strong className="text-foreground">{discoveredColumns.length}</strong> fields detected. Auto-detect to populate.
            </span>
          </div>
        )}
        <ConfigField label="Column list" path="columns">
          <OptionListEditor
            value={columns || []}
            onChange={setColumns}
            labelKey="label"
            valueKey="key"
            itemLabel="Column"
            allowDisabled={false}
            getPreview={(column) => `${column?.label || column?.key || "Untitled"}${column?.hidden ? " · hidden" : ""}`}
            renderFields={renderColumnFields}
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="table-states" title="Empty & loading copy" tab="content" defaultOpen={false}>
        <ConfigField label="Empty text" path="emptyText">
          <BindableInput value={emptyText} onChange={setEmptyText} liveStateTree={liveStateTree} placeholder="No data available." />
        </ConfigField>
        <ConfigField label="Empty hint" path="emptyHint">
          <BindableInput value={emptyHint} onChange={setEmptyHint} liveStateTree={liveStateTree} placeholder="Explain how to load data." />
        </ConfigField>
        <ConfigField label="No-results text" path="noResultsText">
          <BindableInput value={noResultsText} onChange={setNoResultsText} liveStateTree={liveStateTree} placeholder="No rows match the current filters." />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Loading text" path="loadingText">
            <BindableInput value={loadingText} onChange={setLoadingText} liveStateTree={liveStateTree} placeholder="Updating..." />
          </ConfigField>
          <ConfigField label="Row key" path="rowKey" defaultValue="id" htmlFor="table-row-key" helper="Preferred stable identifier field.">
            <Input id="table-row-key" value={rowKey ?? "id"} onChange={(event) => setRowKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="table-style" title="Table style" tab="style">
        <div className="grid grid-cols-3 gap-3">
          <ConfigField label="Zebra stripes" path="striped" defaultValue={true} inline>
            <Switch checked={striped !== false} onCheckedChange={setStriped} aria-label="Zebra stripes" />
          </ConfigField>
          <ConfigField label="Row hover" path="hoverHighlight" defaultValue={true} inline>
            <Switch checked={hoverHighlight !== false} onCheckedChange={setHoverHighlight} aria-label="Row hover highlight" />
          </ConfigField>
          <ConfigField label="Sticky header" path="stickyHeader" defaultValue={true} inline>
            <Switch checked={stickyHeader !== false} onCheckedChange={setStickyHeader} aria-label="Sticky header" />
          </ConfigField>
        </div>
        <p className="text-[10px] leading-snug text-muted-foreground">
          Density and surface styling are shared across widgets in the Surface section above.
        </p>
      </ConfigSection>

      <ConfigSection id="table-behavior" title="Pagination, search & export" description="How people move through and take data out of the table." tab="behavior">
        <ConfigField label="Server-side pagination" path="pagination.enabled" defaultValue={false} inline helper="Fires onPageChange; bind a query to the event.">
          <Switch checked={!!pagination?.enabled} onCheckedChange={(checked) => updatePagination({ enabled: !!checked })} aria-label="Server-side pagination" />
        </ConfigField>
        {pagination?.enabled && (
          <div className="grid grid-cols-2 gap-2">
            <ConfigField label="Rows per page" path="pagination.pageSize" defaultValue={10} htmlFor="table-page-size">
              <Input
                id="table-page-size"
                type="number"
                min={1}
                max={500}
                value={pagination?.pageSize ?? 10}
                onChange={(event) => updatePagination({ pageSize: Number(event.target.value) })}
                className="h-8 text-xs"
              />
            </ConfigField>
            <ConfigField label="Mode" path="pagination.mode" defaultValue="client">
              <SegmentedControl
                ariaLabel="Pagination mode"
                value={pagination?.mode || (pagination?.enabled ? "server" : "client")}
                onChange={(mode) => updatePagination({ mode })}
                options={[
                  { value: "client", label: "Client" },
                  { value: "server", label: "Server" },
                ]}
              />
            </ConfigField>
          </div>
        )}

        <div className="space-y-2 rounded-control border border-border/70 bg-muted/20 p-2">
          <ConfigField label="Search box" path="search.enabled" defaultValue={false} inline>
            <Switch checked={!!search?.enabled} onCheckedChange={(checked) => updateSearch({ enabled: !!checked })} aria-label="Search box" />
          </ConfigField>
          {search?.enabled && (
            <>
              <ConfigField label="Search placeholder" path="search.placeholder" defaultValue="Search..." htmlFor="table-search-placeholder">
                <Input id="table-search-placeholder" value={search?.placeholder ?? ""} onChange={(event) => updateSearch({ placeholder: event.target.value })} className="h-8 text-xs" />
              </ConfigField>
              <ConfigField label="Server-side search" path="search.serverSide" defaultValue={false} inline helper="Fires onSearch on Enter or the search button.">
                <Switch checked={!!search?.serverSide} onCheckedChange={(checked) => updateSearch({ serverSide: !!checked })} aria-label="Server-side search" />
              </ConfigField>
            </>
          )}
        </div>

        <div className="space-y-2 rounded-control border border-border/70 bg-muted/20 p-2">
          <ConfigField label="Export" path="export.enabled" defaultValue={false} inline>
            <Switch checked={!!exportConfig?.enabled} onCheckedChange={(checked) => updateExport({ enabled: !!checked })} aria-label="Export" />
          </ConfigField>
          {exportConfig?.enabled && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <ConfigField label="Button label" path="export.buttonLabel" defaultValue="Export" htmlFor="table-export-label">
                  <Input id="table-export-label" value={exportConfig?.buttonLabel ?? ""} onChange={(event) => updateExport({ buttonLabel: event.target.value })} className="h-8 text-xs" />
                </ConfigField>
                <ConfigField label="Format" path="export.format" defaultValue="csv">
                  <Select value={exportConfig?.format || "csv"} onValueChange={(format) => updateExport({ format })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    </SelectContent>
                  </Select>
                </ConfigField>
              </div>
              <ConfigField label="File name" path="export.filename" htmlFor="table-export-filename" helper="Optional; extension is added from the format.">
                <Input id="table-export-filename" value={exportConfig?.filename ?? ""} onChange={(event) => updateExport({ filename: event.target.value })} placeholder="orders-export" className="h-8 font-mono text-xs" />
              </ConfigField>
              <ConfigField label="Scope" path="export.scope" defaultValue="filtered">
                <SegmentedControl
                  ariaLabel="Export scope"
                  value={exportConfig?.scope || "filtered"}
                  onChange={(scope) => updateExport({ scope })}
                  options={[
                    { value: "filtered", label: "Filtered" },
                    { value: "page", label: "Page" },
                    { value: "selected", label: "Selected" },
                    { value: "all", label: "All" },
                  ]}
                />
              </ConfigField>
              <ConfigField label="Server-side export" path="export.serverSide" defaultValue={false} inline helper="Fire onExport and let the page produce the file.">
                <Switch checked={!!exportConfig?.serverSide} onCheckedChange={(checked) => updateExport({ serverSide: !!checked })} aria-label="Server-side export" />
              </ConfigField>
              <p className="text-[10px] leading-snug text-muted-foreground">
                XLSX is generated in the browser with a dependency-free OOXML writer. Choose server-side export for very large datasets.
              </p>
            </>
          )}
        </div>
      </ConfigSection>

      <ConfigSection id="table-selection" title="Selection & editing" tab="behavior">
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Multi-row selection" path="multiSelect.enabled" defaultValue={false} inline>
            <Switch checked={!!multiSelect?.enabled} onCheckedChange={(checked) => updateMultiSelect({ enabled: !!checked })} aria-label="Multi-row selection" />
          </ConfigField>
          <ConfigField label="Show select all" path="multiSelect.showSelectAll" defaultValue={true} inline>
            <Switch checked={multiSelect?.showSelectAll !== false} onCheckedChange={(checked) => updateMultiSelect({ showSelectAll: !!checked })} aria-label="Show select all" disabled={!multiSelect?.enabled} />
          </ConfigField>
        </div>

        {multiSelect?.enabled && (
          <div className="space-y-1.5 rounded-control border border-border/70 bg-muted/20 p-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Bulk actions</span>
              <Button type="button" variant="outline" size="sm" className="h-6 px-1.5 text-[10px]" onClick={addBulkAction}>
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
            {bulkActions.length === 0 && <p className="text-[10px] text-muted-foreground">Selection is tracked in widget state. Add an action to show a button bar.</p>}
            {bulkActions.map((action, index) => (
              <div key={index} className="flex items-center gap-1">
                <Input value={action.label ?? ""} onChange={(event) => updateBulkAction(index, "label", event.target.value)} placeholder="Label" className="h-7 w-24 text-[11px]" />
                <Input value={action.actionKey ?? ""} onChange={(event) => updateBulkAction(index, "actionKey", event.target.value)} placeholder="actionKey" className="h-7 flex-1 font-mono text-[11px]" />
                <Select value={action.variant || "outline"} onValueChange={(variant) => updateBulkAction(index, "variant", variant)}>
                  <SelectTrigger className="h-7 w-20 text-[11px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="destructive">Danger</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeBulkAction(index)} aria-label="Remove action">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Inline row editing" path="editing.enabled" defaultValue={false} inline helper="Fires onRowSave. Mark at least one column editable.">
            <Switch checked={!!editing?.enabled} onCheckedChange={updateEditing} aria-label="Inline row editing" />
          </ConfigField>
          <ConfigField label="Excel-style bulk edit" path="bulkEdit.enabled" defaultValue={false} inline helper="Double-click a cell; fires onBulkEdit.">
            <Switch checked={!!bulkEdit?.enabled} onCheckedChange={updateBulkEdit} aria-label="Bulk edit" />
          </ConfigField>
        </div>
        {bulkEdit?.enabled && (
          <ConfigField label="Save button label" path="bulkEdit.saveLabel" defaultValue="Save All Changes" htmlFor="table-bulk-save">
            <Input id="table-bulk-save" value={bulkEdit?.saveLabel ?? ""} onChange={(event) => setBulkEdit({ ...bulkEdit, saveLabel: event.target.value })} className="h-8 text-xs" />
          </ConfigField>
        )}
      </ConfigSection>

      <ConfigSection id="table-interaction" title="Columns & rows" description="Resizing, saved views, detail rows and large-table rendering." tab="behavior">
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Resizable columns" path="resizableColumns" defaultValue={false} inline helper="Drag header edges; double-click resets.">
            <Switch checked={!!resizableColumns} onCheckedChange={setResizableColumns} aria-label="Resizable columns" />
          </ConfigField>
          <ConfigField label="Virtualize rows" path="virtualize" defaultValue={false} inline helper="Window very long pages for smoother scrolling.">
            <Switch checked={!!virtualize} onCheckedChange={setVirtualize} aria-label="Virtualize rows" />
          </ConfigField>
        </div>

        <div className="space-y-2 rounded-control border border-border/70 bg-muted/20 p-2">
          <ConfigField label="Expandable detail rows" path="expandableRows" defaultValue={false} inline helper="Adds a chevron column; fires onRowExpand.">
            <Switch checked={!!expandableRows} onCheckedChange={setExpandableRows} aria-label="Expandable detail rows" />
          </ConfigField>
          {expandableRows && (
            <>
              <ConfigField label="Detail title key" path="detailTitleKey" htmlFor="table-detail-title" helper="Field used as the detail heading.">
                <Input id="table-detail-title" value={detailTitleKey ?? ""} onChange={(event) => setDetailTitleKey(event.target.value)} placeholder="name" className="h-8 font-mono text-xs" />
              </ConfigField>
              <ConfigField label="Detail fields" path="detailFields" helper="Field keys shown as label/value pairs. Empty shows all fields.">
                <TagField value={Array.isArray(detailFields) ? detailFields : []} onChange={setDetailFields} placeholder="Add a field key…" />
              </ConfigField>
            </>
          )}
        </div>

        <div className="space-y-2 rounded-control border border-border/70 bg-muted/20 p-2">
          <ConfigField label="Saved views" path="savedViews.enabled" defaultValue={false} inline helper="Stores sort, filters, column order and widths in this browser.">
            <Switch
              checked={!!savedViews?.enabled}
              onCheckedChange={(checked) => setSavedViews({ ...(savedViews || {}), enabled: !!checked })}
              aria-label="Saved views"
            />
          </ConfigField>
          {savedViews?.enabled && (
            <ConfigField label="Storage key" path="savedViews.storageKey" htmlFor="table-saved-views-key" helper="Leave empty to scope views to this widget.">
              <Input
                id="table-saved-views-key"
                value={savedViews?.storageKey ?? ""}
                onChange={(event) => setSavedViews({ ...savedViews, storageKey: event.target.value })}
                placeholder="orders-table"
                className="h-8 font-mono text-xs"
              />
            </ConfigField>
          )}
        </div>
      </ConfigSection>
    </>
  );
};

TableConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};
TableConfigEditor.usesConfigKit = true;

export default TableConfigEditor;
