import React, { useState, useCallback, useMemo } from "react";
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
  CodeEditor,
} from "@jet-admin/ui";
import {
  Plus,
  Trash2,
  Database,
  Layers,
  Filter as FilterIcon,
  ArrowUpDown,
  SlidersHorizontal,
  GitBranch,
  GripVertical,
  MoveUp,
  MoveDown,
  Check,
  Copy,
  Code2,
  LayoutGrid,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const AGG_FUNCTIONS = [
  "NONE",
  "COUNT",
  "COUNT DISTINCT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "ARRAY_AGG",
  "STRING_AGG",
];

const JOIN_TYPES = ["INNER", "LEFT", "RIGHT", "FULL", "CROSS"];
const JOIN_OPERATORS = ["=", "<>", "<", "<=", ">", ">="];

const WHERE_OPERATORS = [
  "=",
  "<>",
  "<",
  "<=",
  ">",
  ">=",
  "LIKE",
  "NOT LIKE",
  "ILIKE",
  "NOT ILIKE",
  "IN",
  "NOT IN",
  "BETWEEN",
  "IS NULL",
  "IS NOT NULL",
  "IS DISTINCT FROM",
  "IS NOT DISTINCT FROM",
];

const NO_VALUE_OPERATORS = new Set(["IS NULL", "IS NOT NULL"]);
const LIST_OPERATORS = new Set(["IN", "NOT IN"]);

const SORT_DIRECTIONS = [
  { value: "ASC", label: "ASC (Ascending)" },
  { value: "DESC", label: "DESC (Descending)" },
];

const NULLS_ORDER = [
  { value: "DEFAULT", label: "— default —" },
  { value: "NULLS FIRST", label: "NULLS FIRST" },
  { value: "NULLS LAST", label: "NULLS LAST" },
];

const TABS = [
  { id: "select", label: "Select", icon: Layers },
  { id: "from", label: "From / Join", icon: GitBranch },
  { id: "where", label: "Where", icon: FilterIcon },
  { id: "groupBy", label: "Group By", icon: Database },
  { id: "orderBy", label: "Order By", icon: ArrowUpDown },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

const genId = () => `_${Math.random().toString(36).slice(2, 9)}`;

// ─── Factories ─────────────────────────────────────────────────────────────────

function newColumn() {
  return { id: genId(), expression: "", alias: "", aggFn: "NONE" };
}
function newJoinCondition() {
  return { id: genId(), left: "", operator: "=", right: "" };
}
function newJoin() {
  return {
    id: genId(),
    type: "INNER",
    table: "",
    alias: "",
    conditions: [newJoinCondition()],
  };
}
function newWhereCondition() {
  return {
    id: genId(),
    column: "",
    operator: "=",
    value: "",
    valueType: "literal",
    logic: "AND",
  };
}
function newGroupByItem() {
  return { id: genId(), expression: "" };
}
function newOrderByItem() {
  return { id: genId(), expression: "", direction: "ASC", nulls: "DEFAULT" };
}

// ─── Normalise ────────────────────────────────────────────────────────────────

function normalise(opts = {}) {
  return {
    // mode — "query" = raw SQL code editor, "gui" = visual builder
    queryType: opts.queryType ?? "query",
    query: opts.query ?? "",
    // visual builder state
    distinct: opts.distinct ?? false,
    columns: Array.isArray(opts.columns) ? opts.columns : [],
    schema: opts.schema ?? "",
    table: opts.table ?? "",
    tableAlias: opts.tableAlias ?? "",
    joins: Array.isArray(opts.joins) ? opts.joins : [],
    where: Array.isArray(opts.where) ? opts.where : [],
    groupBy: Array.isArray(opts.groupBy) ? opts.groupBy : [],
    having: Array.isArray(opts.having) ? opts.having : [],
    orderBy: Array.isArray(opts.orderBy) ? opts.orderBy : [],
    limit: opts.limit ?? "",
    offset: opts.offset ?? "",
  };
}

// ─── SQL Builder ──────────────────────────────────────────────────────────────

function quoteLiteral(raw) {
  if (raw === undefined || raw === null || raw === "") return "''";
  const s = String(raw).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return s;
  if (/^(true|false|null)$/i.test(s)) return s.toUpperCase();
  return `'${s.replace(/'/g, "''")}'`;
}

function renderWhereCondition(cond) {
  const col = cond.column || "?";
  if (NO_VALUE_OPERATORS.has(cond.operator)) return `${col} ${cond.operator}`;
  if (cond.operator === "BETWEEN") {
    const [a, b] = (cond.value || "").split(",").map((s) => s.trim());
    const fmt = (v) => (cond.valueType === "column" ? v || "?" : quoteLiteral(v));
    return `${col} BETWEEN ${fmt(a)} AND ${fmt(b)}`;
  }
  if (LIST_OPERATORS.has(cond.operator)) {
    const vals = (cond.value || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const formatted = vals.length
      ? vals.map((v) => (cond.valueType === "column" ? v : quoteLiteral(v))).join(", ")
      : "?";
    return `${col} ${cond.operator} (${formatted})`;
  }
  const val =
    cond.valueType === "column" ? cond.value || "?" : quoteLiteral(cond.value);
  return `${col} ${cond.operator} ${val}`;
}

function renderConditionGroup(conditions) {
  if (!conditions.length) return "";
  const parts = [];
  conditions.forEach((cond, idx) => {
    if (!cond.column) return;
    const rendered = renderWhereCondition(cond);
    if (idx === 0) {
      parts.push(rendered);
    } else {
      parts.push(`${cond.logic} ${rendered}`);
    }
  });
  return parts.join("\n  ");
}

function buildSQL(opts) {
  const lines = [];

  // SELECT
  const cols = (opts.columns || []).filter((c) => c.expression);
  const selectList = cols.length
    ? cols
        .map((c) => {
          const base =
            c.aggFn === "NONE"
              ? c.expression
              : c.aggFn === "COUNT DISTINCT"
              ? `COUNT(DISTINCT ${c.expression})`
              : c.aggFn === "STRING_AGG"
              ? `STRING_AGG(${c.expression}, ', ')`
              : `${c.aggFn}(${c.expression})`;
          return c.alias ? `${base} AS ${c.alias}` : base;
        })
        .join(",\n  ")
    : "*";
  lines.push(`SELECT${opts.distinct ? " DISTINCT" : ""}\n  ${selectList}`);

  // FROM
  const fromTable = opts.schema
    ? `${opts.schema}.${opts.table || "?table"}`
    : opts.table || "?table";
  const fromClause = opts.tableAlias
    ? `${fromTable} AS ${opts.tableAlias}`
    : fromTable;
  lines.push(`FROM ${fromClause}`);

  // JOINS
  (opts.joins || []).forEach((join) => {
    if (!join.table) return;
    const joinTable = join.alias ? `${join.table} AS ${join.alias}` : join.table;
    if (join.type === "CROSS") {
      lines.push(`CROSS JOIN ${joinTable}`);
      return;
    }
    const conds = (join.conditions || [])
      .filter((c) => c.left && c.right)
      .map((c) => `${c.left} ${c.operator} ${c.right}`)
      .join("\n    AND ");
    lines.push(`${join.type} JOIN ${joinTable}${conds ? `\n  ON ${conds}` : ""}`);
  });

  // WHERE
  const whereBody = renderConditionGroup(opts.where || []);
  if (whereBody) lines.push(`WHERE\n  ${whereBody}`);

  // GROUP BY
  const gbItems = (opts.groupBy || []).filter((g) => g.expression).map((g) => g.expression);
  if (gbItems.length) lines.push(`GROUP BY ${gbItems.join(", ")}`);

  // HAVING
  const havingBody = renderConditionGroup(opts.having || []);
  if (havingBody && gbItems.length) lines.push(`HAVING\n  ${havingBody}`);

  // ORDER BY
  const obItems = (opts.orderBy || [])
    .filter((o) => o.expression)
    .map(
      (o) =>
        `${o.expression} ${o.direction}${o.nulls !== "DEFAULT" ? ` ${o.nulls}` : ""}`
    );
  if (obItems.length) lines.push(`ORDER BY ${obItems.join(", ")}`);

  // LIMIT / OFFSET
  if (opts.limit !== "" && opts.limit !== null && opts.limit !== undefined)
    lines.push(`LIMIT ${opts.limit}`);
  if (opts.offset !== "" && opts.offset !== null && opts.offset !== undefined)
    lines.push(`OFFSET ${opts.offset}`);

  return lines.join("\n") + ";";
}

// ─── SELECT Tab ───────────────────────────────────────────────────────────────

function SelectTab({ opts, update }) {
  const columns = opts.columns;

  const addColumn = () =>
    update({ columns: [...columns, newColumn()] });

  const removeColumn = (id) =>
    update({ columns: columns.filter((c) => c.id !== id) });

  const patchColumn = (id, patch) =>
    update({ columns: columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const moveColumn = (index, dir) => {
    const next = [...columns];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ columns: next });
  };

  return (
    <div className="space-y-2">
      <Callout>
        Define which columns to return. Leave empty to select{" "}
        <code className="bg-background px-1 rounded border border-border font-mono text-[11px]">
          *
        </code>
        . Use an aggregate function to summarise grouped data.
      </Callout>

      {/* DISTINCT toggle */}
      <div className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2">
        <input
          id="pg-distinct"
          type="checkbox"
          checked={opts.distinct}
          onChange={(e) => update({ distinct: e.target.checked })}
          className="h-3.5 w-3.5 rounded accent-primary"
        />
        <Label htmlFor="pg-distinct" className="cursor-pointer text-xs font-mono font-medium">
          DISTINCT
        </Label>
        <span className="text-[11px] text-muted-foreground">
          — eliminate duplicate rows from the result set
        </span>
      </div>

      {columns.length === 0 ? (
        <EmptyState
          icon={Layers}
          message="No columns added — query will SELECT *."
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
          <div className="grid grid-cols-[28px_28px_140px_1fr_100px_28px_28px] gap-2 items-center px-1">
            <span />
            <span />
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
              Aggregate
            </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
              Column / Expression
            </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
              Alias
            </Label>
            <span />
            <span />
          </div>

          {columns.map((col, idx) => (
            <div
              key={col.id}
              className="grid grid-cols-[28px_28px_140px_1fr_100px_28px_28px] gap-2 items-center rounded border border-border bg-background px-2 py-2"
            >
              {/* Move up/down */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveColumn(idx, -1)}
                  disabled={idx === 0}
                  className="flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveColumn(idx, 1)}
                  disabled={idx === columns.length - 1}
                  className="flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveDown className="h-3 w-3" />
                </button>
              </div>

              {/* Drag handle (decorative) */}
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />

              {/* Aggregate function */}
              <Select
                value={col.aggFn}
                onValueChange={(val) => patchColumn(col.id, { aggFn: val })}
              >
                <SelectTrigger className="h-7 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGG_FUNCTIONS.map((fn) => (
                    <SelectItem key={fn} value={fn} className="text-xs font-mono">
                      {fn === "NONE" ? "— none —" : fn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Expression */}
              <Input
                placeholder="column or expression"
                value={col.expression}
                onChange={(e) => patchColumn(col.id, { expression: e.target.value })}
                className="h-7 text-xs font-mono"
              />

              {/* Alias */}
              <Input
                placeholder="alias"
                value={col.alias}
                onChange={(e) => patchColumn(col.id, { alias: e.target.value })}
                className="h-7 text-xs font-mono"
              />

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeColumn(col.id)}
                className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* placeholder to fill grid */}
              <span />
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

// ─── FROM / JOIN Tab ──────────────────────────────────────────────────────────

function JoinConditionRow({ cond, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="left.column"
        value={cond.left}
        onChange={(e) => onChange({ ...cond, left: e.target.value })}
        className="flex-1 h-7 text-xs font-mono"
      />
      <div className="w-20 shrink-0">
        <Select
          value={cond.operator}
          onValueChange={(val) => onChange({ ...cond, operator: val })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOIN_OPERATORS.map((op) => (
              <SelectItem key={op} value={op} className="text-xs font-mono">
                {op}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        placeholder="right.column"
        value={cond.right}
        onChange={(e) => onChange({ ...cond, right: e.target.value })}
        className="flex-1 h-7 text-xs font-mono"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function FromJoinTab({ opts, update }) {
  const joins = opts.joins;

  const patchJoin = (id, patch) =>
    update({ joins: joins.map((j) => (j.id === id ? { ...j, ...patch } : j)) });

  const removeJoin = (id) =>
    update({ joins: joins.filter((j) => j.id !== id) });

  const addJoin = () =>
    update({ joins: [...joins, newJoin()] });

  const updateJoinCond = (joinId, condId, patch) => {
    patchJoin(joinId, {
      conditions: joins
        .find((j) => j.id === joinId)
        .conditions.map((c) => (c.id === condId ? { ...c, ...patch } : c)),
    });
  };

  const removeJoinCond = (joinId, condId) => {
    patchJoin(joinId, {
      conditions: joins.find((j) => j.id === joinId).conditions.filter((c) => c.id !== condId),
    });
  };

  const addJoinCond = (joinId) => {
    const join = joins.find((j) => j.id === joinId);
    patchJoin(joinId, { conditions: [...join.conditions, newJoinCondition()] });
  };

  return (
    <div className="space-y-3">
      <Callout>
        Set the base table for the query and optionally join additional tables.
        Use the schema field to qualify the table (e.g.{" "}
        <code className="bg-background px-0.5 rounded border border-border font-mono text-[11px]">
          public
        </code>
        ).
      </Callout>

      {/* Base table */}
      <div className="space-y-1">
        <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
          Base Table (FROM)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="schema (e.g. public)"
            value={opts.schema}
            onChange={(e) => update({ schema: e.target.value })}
            className="w-40 h-7 text-xs font-mono"
          />
          <span className="text-muted-foreground text-xs shrink-0">.</span>
          <Input
            placeholder="table_name"
            value={opts.table}
            onChange={(e) => update({ table: e.target.value })}
            className="flex-1 h-7 text-xs font-mono"
          />
          <span className="text-[11px] text-muted-foreground shrink-0">AS</span>
          <Input
            placeholder="alias"
            value={opts.tableAlias}
            onChange={(e) => update({ tableAlias: e.target.value })}
            className="w-28 h-7 text-xs font-mono"
          />
        </div>
      </div>

      {/* Joins */}
      <div className="space-y-2">
        <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
          Joins
        </Label>

        {joins.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            message="No joins added."
            action={
              <Button type="button" variant="outline" size="sm" onClick={addJoin}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Join
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {joins.map((join) => (
              <div
                key={join.id}
                className="rounded border border-border bg-muted/20 p-3 space-y-2"
              >
                {/* Join header */}
                <div className="flex items-center gap-2">
                  <div className="w-28 shrink-0">
                    <Select
                      value={join.type}
                      onValueChange={(val) => patchJoin(join.id, { type: val })}
                    >
                      <SelectTrigger className="h-7 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOIN_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs font-mono">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 font-mono">JOIN</span>
                  <Input
                    placeholder="joined_table"
                    value={join.table}
                    onChange={(e) => patchJoin(join.id, { table: e.target.value })}
                    className="flex-1 h-7 text-xs font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground shrink-0">AS</span>
                  <Input
                    placeholder="alias"
                    value={join.alias}
                    onChange={(e) => patchJoin(join.id, { alias: e.target.value })}
                    className="w-24 h-7 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => removeJoin(join.id)}
                    className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* ON conditions */}
                {join.type !== "CROSS" && (
                  <div className="space-y-1 border-l border-border/60 pl-3">
                    <Label className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground block">
                      ON
                    </Label>
                    {join.conditions.map((cond) => (
                      <JoinConditionRow
                        key={cond.id}
                        cond={cond}
                        onChange={(patch) => updateJoinCond(join.id, cond.id, patch)}
                        onRemove={() => removeJoinCond(join.id, cond.id)}
                        canRemove={join.conditions.length > 1}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addJoinCond(join.id)}
                      className="text-[11px] h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add condition
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addJoin} className="w-full">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Join
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WHERE / HAVING shared condition editor ───────────────────────────────────

function ConditionList({ conditions, onChange, clauseLabel = "WHERE" }) {
  const addCondition = () =>
    onChange([...conditions, newWhereCondition()]);

  const removeCondition = (id) =>
    onChange(conditions.filter((c) => c.id !== id));

  const patchCondition = (id, patch) =>
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-2">
      {conditions.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          message={`No ${clauseLabel} conditions — all rows will be included.`}
          action={
            <Button type="button" variant="outline" size="sm" onClick={addCondition}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Condition
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {conditions.map((cond, idx) => {
            const needsValue = !NO_VALUE_OPERATORS.has(cond.operator);
            const isList = LIST_OPERATORS.has(cond.operator);
            const isBetween = cond.operator === "BETWEEN";

            return (
              <div key={cond.id} className="space-y-1">
                {/* Logic chip between rows */}
                {idx > 0 && (
                  <div className="flex items-center gap-2 py-0.5 pl-1">
                    <div className="h-px flex-1 bg-border" />
                    <LogicChip
                      value={cond.logic}
                      onChange={(val) => patchCondition(cond.id, { logic: val })}
                    />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                <div className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2">
                  {/* Column */}
                  <Input
                    placeholder="column"
                    value={cond.column}
                    onChange={(e) => patchCondition(cond.id, { column: e.target.value })}
                    className="h-7 text-xs font-mono flex-[2]"
                  />

                  {/* Operator */}
                  <div className="flex-[2] min-w-[120px]">
                    <Select
                      value={cond.operator}
                      onValueChange={(val) =>
                        patchCondition(cond.id, { operator: val })
                      }
                    >
                      <SelectTrigger className="h-7 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WHERE_OPERATORS.map((op) => (
                          <SelectItem key={op} value={op} className="text-xs font-mono">
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value type */}
                  {needsValue && (
                    <div className="w-24 shrink-0">
                      <Select
                        value={cond.valueType}
                        onValueChange={(val) =>
                          patchCondition(cond.id, { valueType: val })
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="literal" className="text-xs">
                            Value
                          </SelectItem>
                          <SelectItem value="column" className="text-xs">
                            Column
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Value input */}
                  {needsValue ? (
                    <Input
                      placeholder={
                        isList
                          ? "a, b, c"
                          : isBetween
                          ? "low, high"
                          : "value or {{inputs.param}}"
                      }
                      value={cond.value}
                      onChange={(e) =>
                        patchCondition(cond.id, { value: e.target.value })
                      }
                      className="h-7 text-xs font-mono flex-[3]"
                    />
                  ) : (
                    <div className="flex-[3]" />
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeCondition(cond.id)}
                    className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
            className="w-full"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Condition
          </Button>
        </div>
      )}

      {/* Dynamic values hint */}
      {conditions.length > 0 && (
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

// ─── WHERE Tab ────────────────────────────────────────────────────────────────

function WhereTab({ opts, update }) {
  return (
    <div className="space-y-2">
      <Callout>
        Filter rows <strong>before</strong> grouping. Conditions are applied in
        order; use the AND / OR chip to control how they combine.
      </Callout>
      <ConditionList
        conditions={opts.where}
        onChange={(where) => update({ where })}
        clauseLabel="WHERE"
      />
    </div>
  );
}

// ─── GROUP BY Tab ─────────────────────────────────────────────────────────────

function GroupByTab({ opts, update }) {
  const groupBy = opts.groupBy;
  const having = opts.having;

  const addGroupBy = () =>
    update({ groupBy: [...groupBy, newGroupByItem()] });

  const removeGroupBy = (id) =>
    update({ groupBy: groupBy.filter((g) => g.id !== id) });

  const patchGroupBy = (id, expression) =>
    update({ groupBy: groupBy.map((g) => (g.id === id ? { ...g, expression } : g)) });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Callout>
          Group rows sharing the same values in the listed columns. Combine with
          aggregate functions (SUM, COUNT, etc.) in the Select tab.
        </Callout>

        {groupBy.length === 0 ? (
          <EmptyState
            icon={Database}
            message="No GROUP BY — results will not be aggregated."
            action={
              <Button type="button" variant="outline" size="sm" onClick={addGroupBy}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Group
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {groupBy.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2"
              >
                <Input
                  placeholder="column or expression"
                  value={item.expression}
                  onChange={(e) => patchGroupBy(item.id, e.target.value)}
                  className="h-7 text-xs font-mono flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeGroupBy(item.id)}
                  className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGroupBy}
              className="w-full"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Group
            </Button>
          </div>
        )}
      </div>

      {/* HAVING — only useful when GROUP BY is set */}
      {groupBy.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
            Having (filter on aggregates)
          </Label>
          <ConditionList
            conditions={having}
            onChange={(h) => update({ having: h })}
            clauseLabel="HAVING"
          />
        </div>
      )}
    </div>
  );
}

// ─── ORDER BY Tab ─────────────────────────────────────────────────────────────

function OrderByTab({ opts, update }) {
  const orderBy = opts.orderBy;

  const addOrder = () =>
    update({ orderBy: [...orderBy, newOrderByItem()] });

  const removeOrder = (id) =>
    update({ orderBy: orderBy.filter((o) => o.id !== id) });

  const patchOrder = (id, patch) =>
    update({ orderBy: orderBy.map((o) => (o.id === id ? { ...o, ...patch } : o)) });

  const moveOrder = (index, dir) => {
    const next = [...orderBy];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ orderBy: next });
  };

  return (
    <div className="space-y-2">
      <Callout>
        Sort the result set. Rules are applied top-to-bottom — the first entry
        is the primary sort key.
      </Callout>

      {orderBy.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          message="No ORDER BY — rows returned in natural table order."
          action={
            <Button type="button" variant="outline" size="sm" onClick={addOrder}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Sort
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[24px_24px_1fr_130px_130px_28px] gap-2 items-center px-1">
            <span />
            <span />
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
              Column / Expression
            </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
              Direction
            </Label>
              <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
              NULLS
            </Label>
            <span />
          </div>

          {orderBy.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-[24px_24px_1fr_130px_130px_28px] gap-2 items-center rounded border border-border bg-background px-2 py-2"
            >
              {/* Priority badge */}
              <span
                className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold ${
                  idx === 0
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {idx + 1}
              </span>

              {/* Move up/down */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveOrder(idx, -1)}
                  disabled={idx === 0}
                  className="flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveOrder(idx, 1)}
                  disabled={idx === orderBy.length - 1}
                  className="flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <MoveDown className="h-3 w-3" />
                </button>
              </div>

              {/* Expression */}
              <Input
                placeholder="column or expression"
                value={item.expression}
                onChange={(e) => patchOrder(item.id, { expression: e.target.value })}
                className="h-7 text-xs font-mono"
              />

              {/* Direction */}
              <Select
                value={item.direction}
                onValueChange={(val) => patchOrder(item.id, { direction: val })}
              >
                <SelectTrigger className="h-7 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value} className="text-xs font-mono">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* NULLS order */}
              <Select
                value={item.nulls}
                onValueChange={(val) => patchOrder(item.id, { nulls: val })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NULLS_ORDER.map((n) => (
                    <SelectItem key={n.value} value={n.value} className="text-xs">
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeOrder(item.id)}
                className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addOrder} className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Sort
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ opts, update }) {
  const [copied, setCopied] = useState(false);
  const sql = useMemo(() => buildSQL(opts), [opts]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — fail silently
    }
  };

  return (
    <div className="space-y-4">
      <Callout>
        Cap and paginate the result set with <strong>LIMIT</strong> and{" "}
        <strong>OFFSET</strong>. The generated SQL preview updates live as you
        configure the query.
      </Callout>

      {/* LIMIT / OFFSET */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pg-limit">Limit</Label>
          <Input
            id="pg-limit"
            type="number"
            min="0"
            placeholder="no limit"
            value={opts.limit}
            onChange={(e) => update({ limit: e.target.value })}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Maximum rows returned. Leave blank for no cap.
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pg-offset">Offset</Label>
          <Input
            id="pg-offset"
            type="number"
            min="0"
            placeholder="0"
            value={opts.offset}
            onChange={(e) => update({ offset: e.target.value })}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Skip this many rows before returning results.
          </p>
        </div>
      </div>

      {/* Generated SQL preview */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
            Generated SQL Preview
          </Label>
          <Button
            type="button"
            variant={copied ? "default" : "outline"}
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs gap-1"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div className="rounded bg-muted/40 border border-border p-4 font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground">
          <pre className="whitespace-pre-wrap break-words">{sql}</pre>
        </div>
        <p className="text-[11px] text-muted-foreground">
          This SQL is generated from your visual configuration and sent to the
          PostgreSQL datasource at query runtime.
        </p>
      </div>
    </div>
  );
}

// ─── Code Editor Panel ────────────────────────────────────────────────────────

function CodeEditorPanel({ opts, update }) {
  return (
    <div className="space-y-2">
      <Callout>
        Write raw PostgreSQL SQL. Use{" "}
        <code className="bg-background px-1 rounded border border-border font-mono text-[11px]">
          {"{{inputs.paramName}}"}
        </code>{" "}
        to inject runtime query inputs.
      </Callout>
      <CodeEditor
        value={opts.query}
        language="pgsql"
        onChange={(val) => update({ query: val })}
        height="280px"
        showHeader={false}
        className="rounded border border-border"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * PostgresQueryEditor
 *
 * Supports two modes toggled by a GUI / Code pill:
 *   - "query" (Code) — raw SQL written in a Monaco editor, stored in opts.query
 *   - "gui"          — visual SELECT builder; generated SQL is synced into opts.query
 *                      so the backend always receives the same `query` field.
 *
 * @param {Object} props
 * @param {{ dataQueryOptions: Object, setQueryOptions: Function, patchQueryOptions: Function }} props.queryEditorForm
 */
export const PostgresQueryEditor = ({ queryEditorForm }) => {
  const raw = queryEditorForm?.dataQueryOptions || {};
  const opts = normalise(raw);

  const [activeTab, setActiveTab] = useState("select");

  const queryType = opts.queryType; // "query" | "gui"
  const isGUI = queryType === "gui";

  /**
   * Merge `updates` into `dataQueryOptions` via the strict editor form.
   * Always sends the full normalised shape so we never lose sibling keys.
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

  // When switching GUI → Code: stamp the current generated SQL into opts.query
  // so the user has a starting point and the backend keeps receiving valid SQL.
  const handleModeSwitch = useCallback(
    (newMode) => {
      if (newMode === queryType) return;
      if (newMode === "query") {
        // GUI → Code: pre-fill with the visual builder's current SQL
        const generatedSQL = buildSQL(opts);
        update({ queryType: "query", query: generatedSQL });
      } else {
        // Code → GUI: just switch mode; visual builder state is preserved
        update({ queryType: "gui" });
      }
    },
    [queryType, opts, update]
  );

  // Badge counts — only count meaningful/filled entries
  const badges = {
    select: opts.columns.filter((c) => c.expression).length,
    from: opts.joins.filter((j) => j.table).length,
    where: opts.where.filter((c) => c.column).length,
    groupBy:
      opts.groupBy.filter((g) => g.expression).length +
      opts.having.filter((c) => c.column).length,
    orderBy: opts.orderBy.filter((o) => o.expression).length,
    settings:
      (opts.limit !== "" && opts.limit !== null && opts.limit !== undefined ? 1 : 0) +
      (opts.offset !== "" && opts.offset !== null && opts.offset !== undefined ? 1 : 0),
  };

  return (
    <div className="space-y-2">
      {/* ── Mode toggle ── */}
      <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5 w-fit">
        <button
          type="button"
          onClick={() => handleModeSwitch("query")}
          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            !isGUI
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Code
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("gui")}
          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            isGUI
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          GUI
        </button>
      </div>

      {/* ── Code mode ── */}
      {!isGUI && (
        <CodeEditorPanel opts={opts} update={update} />
      )}

      {/* ── GUI mode ── */}
      {isGUI && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* ── Tab bar ── */}
          <TabsList>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const badgeCount = badges[tab.id];
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 px-3 py-2 text-xs"
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {tab.label}
                  {badgeCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {badgeCount}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* ── Tab panels ── */}
          <TabsContent value="select" className="mt-2 pb-2">
            <SelectTab opts={opts} update={update} />
          </TabsContent>

          <TabsContent value="from" className="mt-2 pb-2">
            <FromJoinTab opts={opts} update={update} />
          </TabsContent>

          <TabsContent value="where" className="mt-2 pb-2">
            <WhereTab opts={opts} update={update} />
          </TabsContent>

          <TabsContent value="groupBy" className="mt-2 pb-2">
            <GroupByTab opts={opts} update={update} />
          </TabsContent>

          <TabsContent value="orderBy" className="mt-2 pb-2">
            <OrderByTab opts={opts} update={update} />
          </TabsContent>

          <TabsContent value="settings" className="mt-2 pb-2">
            <SettingsTab opts={opts} update={update} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
