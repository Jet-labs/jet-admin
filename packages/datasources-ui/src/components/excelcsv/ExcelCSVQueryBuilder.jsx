import React, { useState, useCallback, useRef } from "react";
import {
  Input,
  Label,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Callout,
  EmptyState,
  LogicChip,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@jet-admin/ui";
import {
  Plus,
  Trash2,
  GripVertical,
  Database,
  Columns2,
  Filter as FilterIcon,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPERATORS = [
  { value: "eq", label: "equals", needsValue: true },
  { value: "neq", label: "not equals", needsValue: true },
  { value: "gt", label: "greater than", needsValue: true },
  { value: "gte", label: "greater than or equal", needsValue: true },
  { value: "lt", label: "less than", needsValue: true },
  { value: "lte", label: "less than or equal", needsValue: true },
  { value: "contains", label: "contains", needsValue: true },
  { value: "not_contains", label: "does not contain", needsValue: true },
  { value: "starts_with", label: "starts with", needsValue: true },
  { value: "ends_with", label: "ends with", needsValue: true },
  { value: "is_empty", label: "is empty", needsValue: false },
  { value: "is_not_empty", label: "is not empty", needsValue: false },
];

const SORT_DIRECTIONS = [
  { value: "asc", label: "A → Z  (Ascending)" },
  { value: "desc", label: "Z → A  (Descending)" },
];

const COLUMN_TYPES = [
  { value: "auto", label: "Auto" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
];

const TABS = [
  { id: "source", label: "Source", icon: Database, },
  { id: "columns", label: "Columns", icon: Columns2, },
  { id: "filter", label: "Filter", icon: FilterIcon, },
  { id: "sort", label: "Sort", icon: ArrowUpDown, },
  { id: "settings", label: "Settings", icon: SlidersHorizontal, },
];

const genId = () => `_${Math.random().toString(36).slice(2, 9)}`;

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Returns a shallow-patched `dataQueryOptions` with safe array defaults for
 * the three visual-query arrays so callers never need to null-guard them.
 */
function normalise(opts = {}) {
  return {
    sheetName: opts.sheetName ?? "",
    headerRow: opts.headerRow ?? 1,
    range: opts.range ?? "",
    limit: opts.limit ?? "",
    columns: Array.isArray(opts.columns) ? opts.columns : [],
    filters: Array.isArray(opts.filters) ? opts.filters : [],
    sort: Array.isArray(opts.sort) ? opts.sort : [],
  };
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

/** SOURCE TAB — sheetName, headerRow */
function SourceTab({ opts, update }) {
  return (
    <div className="space-y-2">
      <Callout>
        Configure which sheet and header row to read. Leave Sheet Name blank to
        use the first available sheet.
      </Callout>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="sheetName">Sheet Name</Label>
          <Input
            id="sheetName"
            name="sheetName"
            placeholder="e.g. Sheet1"
            value={opts.sheetName}
            onChange={(e) => update({ sheetName: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to read the first sheet.
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="headerRow">Header Row</Label>
          <Input
            id="headerRow"
            name="headerRow"
            type="number"
            min="1"
            placeholder="1"
            value={opts.headerRow}
            onChange={(e) =>
              update({ headerRow: Math.max(1, parseInt(e.target.value, 10) || 1) })
            }
          />
          <p className="text-xs text-muted-foreground">
            Row number (1-based) containing column headers.
          </p>
        </div>
      </div>
    </div>
  );
}

/** COLUMNS TAB — projection / aliasing / reorder */
function ColumnsTab({ opts, update }) {
  const columns = opts.columns;

  const addColumn = () =>
    update({
      columns: [
        ...columns,
        { id: genId(), sourceName: "", alias: "", type: "auto", enabled: true },
      ],
    });

  const removeColumn = (id) =>
    update({ columns: columns.filter((c) => c.id !== id) });

  const patchColumn = (id, patch) =>
    update({ columns: columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const moveColumn = (index, direction) => {
    const next = [...columns];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ columns: next });
  };

  return (
    <div className="space-y-2">
      <Callout>
        Declare each column from your spreadsheet. Use <strong>Alias</strong>{" "}
        to rename it in query results. Leave empty to include all columns as-is.
      </Callout>

      {columns.length === 0 ? (
        <EmptyState
          icon={Columns2}
          message="No columns declared — all spreadsheet columns will be returned."
          action={
            <Button type="button" variant="outline" size="sm" onClick={addColumn}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Column
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center px-1">
            <span />
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Source Column
              </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Alias (optional)
              </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Type
              </Label>
            <span />
            <span />
            <span />
          </div>

          {columns.map((col, idx) => (
            <div
              key={col.id}
              className={`grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center rounded border px-2 py-2 transition-colors ${col.enabled
                  ? "border-border bg-background"
                  : "border-border/50 bg-muted/30 opacity-60"
                }`}
            >
              {/* Drag handle (decorative — full dnd is app-layer concern) */}
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />

              {/* Source name */}
              <Input
                placeholder="e.g. Revenue"
                value={col.sourceName}
                onChange={(e) => patchColumn(col.id, { sourceName: e.target.value })}
                className="h-7 text-xs"
                size="sm"
              />

              {/* Alias */}
              <Input
                placeholder="same as source"
                value={col.alias}
                onChange={(e) => patchColumn(col.id, { alias: e.target.value })}
                className="h-7 text-xs"
                size="sm"
              />

              {/* Type */}
              <Select
                value={col.type || "auto"}
                onValueChange={(val) => patchColumn(col.id, { type: val })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMN_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Visibility toggle */}
              <button
                type="button"
                onClick={() => patchColumn(col.id, { enabled: !col.enabled })}
                className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                title={col.enabled ? "Hide column" : "Show column"}
              >
                {col.enabled ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Move up/down */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveColumn(idx, -1)}
                  disabled={idx === 0}
                  className="flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveColumn(idx, 1)}
                  disabled={idx === columns.length - 1}
                  className="flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveDown className="h-3 w-3" />
                </button>
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeColumn(col.id)}
                className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addColumn} className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Column
          </Button>
        </div>
      )}
    </div>
  );
}

/** FILTER TAB — multi-condition rows with AND/OR */
function FilterTab({ opts, update }) {
  const filters = opts.filters;

  const addFilter = () =>
    update({
      filters: [
        ...filters,
        { id: genId(), column: "", operator: "eq", value: "", logic: "AND" },
      ],
    });

  const removeFilter = (id) =>
    update({ filters: filters.filter((f) => f.id !== id) });

  const patchFilter = (id, patch) =>
    update({ filters: filters.map((f) => (f.id === id ? { ...f, ...patch } : f)) });

  return (
    <div className="space-y-2">
      <Callout>
        Filter rows after fetching. Multiple conditions are applied in order.
        Use the <strong>AND / OR</strong> chip to control how each condition
        combines with the next.
      </Callout>

      {filters.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          message="No filters applied — all rows will be returned."
          action={
            <Button type="button" variant="outline" size="sm" onClick={addFilter}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Filter
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filters.map((filter, idx) => {
            const operatorDef = FILTER_OPERATORS.find((o) => o.value === filter.operator);
            const needsValue = operatorDef?.needsValue !== false;

            return (
              <div key={filter.id} className="space-y-1">
                {/* Logic connector (shown between rows, not before first) */}
                {idx > 0 && (
                  <div className="flex items-center gap-2 py-0.5 pl-1">
                    <div className="h-px flex-1 bg-border" />
                    <LogicChip
                      value={filter.logic}
                      onChange={(val) => patchFilter(filter.id, { logic: val })}
                    />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                <div className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2">
                  {/* Column name */}
                  <Input
                    placeholder="Column name"
                    value={filter.column}
                    onChange={(e) => patchFilter(filter.id, { column: e.target.value })}
                    className="h-7 text-xs flex-[2]"
                    size="sm"
                  />

                  {/* Operator */}
                  <div className="flex-[2]">
                    <Select
                      value={filter.operator}
                      onValueChange={(val) => patchFilter(filter.id, { operator: val })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value} className="text-xs">
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value — hidden for nullary operators */}
                  {needsValue ? (
                    <Input
                      placeholder="Value or {{inputs.param}}"
                      value={filter.value}
                      onChange={(e) => patchFilter(filter.id, { value: e.target.value })}
                      className="h-7 text-xs flex-[3] font-mono"
                      size="sm"
                    />
                  ) : (
                    <div className="flex-[3]" />
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeFilter(filter.id)}
                    className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" onClick={addFilter} className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Condition
          </Button>
        </div>
      )}

      {/* Template hint */}
      {filters.length > 0 && (
        <div className="rounded border border-border bg-muted/30 p-3 space-y-1">
          <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
            Dynamic values
          </Label>
          <p className="text-[11px] text-muted-foreground mt-1">
            Use{" "}
            <code className="bg-background px-1 rounded border border-border font-mono">
              {"{{inputs.paramName}}"}
            </code>{" "}
            in Value fields to inject runtime inputs from the query engine.
          </p>
        </div>
      )}
    </div>
  );
}

/** SORT TAB — ordered multi-column sort rules */
function SortTab({ opts, update }) {
  const sort = opts.sort;

  const addSort = () =>
    update({
      sort: [...sort, { id: genId(), column: "", direction: "asc" }],
    });

  const removeSort = (id) =>
    update({ sort: sort.filter((s) => s.id !== id) });

  const patchSort = (id, patch) =>
    update({ sort: sort.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const moveSort = (index, direction) => {
    const next = [...sort];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ sort: next });
  };

  return (
    <div className="space-y-2">
      <Callout>
        Sort rows after fetching and filtering. Rules are applied from top to
        bottom — the first rule is the primary sort key.
      </Callout>

      {sort.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          message="No sort rules — rows returned in spreadsheet order."
          action={
            <Button type="button" variant="outline" size="sm" onClick={addSort}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Sort Rule
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {/* Priority indicator header */}
          <div className="grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center px-1">
            <span />
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                #
              </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Column
              </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Direction
              </Label>
            <span />
          </div>

          {sort.map((rule, idx) => (
            <div
              key={rule.id}
              className="grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center rounded border border-border bg-background px-2 py-2"
            >
              {/* Move up/down */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveSort(idx, -1)}
                  disabled={idx === 0}
                  className="flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSort(idx, 1)}
                  disabled={idx === sort.length - 1}
                  className="flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveDown className="h-3 w-3" />
                </button>
              </div>

              {/* Priority badge */}
              <span
                className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold ${idx === 0
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {idx + 1}
              </span>

              {/* Column name */}
              <Input
                placeholder="Column name"
                value={rule.column}
                onChange={(e) => patchSort(rule.id, { column: e.target.value })}
                className="h-7 text-xs"
                size="sm"
              />

              {/* Direction */}
              <Select
                value={rule.direction}
                onValueChange={(val) => patchSort(rule.id, { direction: val })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value} className="text-xs">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeSort(rule.id)}
                className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addSort} className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Sort Rule
          </Button>
        </div>
      )}
    </div>
  );
}

/** SETTINGS TAB — range, limit (advanced datasource.js params) */
function SettingsTab({ opts, update }) {
  return (
    <div className="space-y-2">
      <Callout>
        Advanced fetch settings. <strong>Range</strong> limits which rows are
        read from the file itself (before any filters). <strong>Limit</strong>{" "}
        caps the final result count.
      </Callout>

      <div className="space-y-2">
        <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
          Row Range
        </Label>
        <div className="grid grid-cols-2 gap-3 !mt-0">
          <div className="space-y-1">
            <Label htmlFor="range">A1-Notation Range</Label>
            <Input
              id="range"
              name="range"
              placeholder="e.g. A1:Z500"
              value={opts.range}
              onChange={(e) => update({ range: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Restricts rows read from the spreadsheet at the file-parse level.
              Format:{" "}
              <code className="bg-background px-0.5 rounded border border-border font-mono text-[11px]">
                A1:Z100
              </code>
              . Leave blank for all rows.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="limit">Row Limit</Label>
            <Input
              id="limit"
              name="limit"
              type="number"
              min="1"
              placeholder="No limit"
              value={opts.limit}
              onChange={(e) =>
                update({
                  limit: e.target.value === "" ? "" : parseInt(e.target.value, 10),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum rows returned after all filters and sorts are applied.
              Equivalent to{" "}
              <code className="bg-background px-0.5 rounded border border-border font-mono text-[11px]">
                rows.slice(0, limit)
              </code>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
          Full Datasource Call Preview
        </Label>
        <div className="rounded bg-muted/40 border border-border p-4 font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground">
          <code className="whitespace-pre">
            {buildDatasourcePreview(opts)}
          </code>
        </div>
        
      </div>
    </div>
  );
}

// ─── Preview builder (for Settings tab) ──────────────────────────────────────

function buildDatasourcePreview(opts) {
  const enabledCols = (opts.columns || []).filter((c) => c.enabled && c.sourceName);
  const activeFilters = (opts.filters || []).filter((f) => f.column);
  const activeSort = (opts.sort || []).filter((s) => s.column);

  const obj = {
    ...(opts.sheetName ? { sheetName: opts.sheetName } : {}),
    headerRow: opts.headerRow || 1,
    ...(opts.range ? { range: opts.range } : {}),
    ...(opts.limit ? { limit: opts.limit } : {}),
    ...(enabledCols.length
      ? {
        columns: enabledCols.map((c) => ({
          sourceName: c.sourceName,
          ...(c.alias ? { alias: c.alias } : {}),
          ...(c.type && c.type !== "auto" ? { type: c.type } : {}),
        })),
      }
      : {}),
    ...(activeFilters.length ? { filters: activeFilters.map(({ id, ...rest }) => rest) } : {}),
    ...(activeSort.length ? { sort: activeSort.map(({ id, ...rest }) => rest) } : {}),
  };

  return JSON.stringify(obj, null, 2);
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {import("../../context/QueryEditorContext").QueryEditorForm} props.queryEditorForm
 *   Strict interface: { dataQueryOptions, setQueryOptions, patchQueryOptions, ... }
 */
export const ExcelCSVQueryBuilder = ({ queryEditorForm }) => {
  const raw = queryEditorForm?.dataQueryOptions || {};
  const opts = normalise(raw);

  const [activeTab, setActiveTab] = useState("source");

  /**
   * Merges `updates` into `dataQueryOptions` via the strict editor form.
   * Always preserves the full normalised shape so callers only send diffs.
   */
  const update = useCallback(
    (updates) => {
      queryEditorForm.setQueryOptions({
        ...opts,
        ...updates,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryEditorForm, JSON.stringify(opts)]
  );

  // Badge counts for each tab
  const badges = {
    columns: opts.columns.filter((c) => c.enabled && c.sourceName).length,
    filter: opts.filters.filter((f) => f.column).length,
    sort: opts.sort.filter((s) => s.column).length,
  };

  return (
    <div className="space-y-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* ── Tab bar ── */}
        <TabsList>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const badgeCount = badges[tab.id];
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2 px-3 py-2 text-xs">
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {badgeCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {badgeCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── Tab panels ── */}
        <TabsContent value="source" className="pb-2">
          <SourceTab opts={opts} update={update} />
        </TabsContent>

        <TabsContent value="columns" className="pb-2">
          <ColumnsTab opts={opts} update={update} />
        </TabsContent>

        <TabsContent value="filter" className="pb-2">
          <FilterTab opts={opts} update={update} />
        </TabsContent>

        <TabsContent value="sort" className="pb-2">
          <SortTab opts={opts} update={update} />
        </TabsContent>

        <TabsContent value="settings" className="pb-2">
          <SettingsTab opts={opts} update={update} />
        </TabsContent>
      </Tabs>
    </div>
  );
};