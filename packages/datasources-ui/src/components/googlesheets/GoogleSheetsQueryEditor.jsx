/**
 * GoogleSheetsQueryEditor.jsx
 *
 * Dedicated query editor for Google Sheets.
 * Rich UI: Operation picker → Spreadsheet search → Sheet selector → Range → Preview.
 *
 * Consumes QueryEditorContext for apiProxy (to call listSpreadsheets, listSheets, previewData).
 * Receives strict queryEditorForm: { dataQueryOptions, setQueryOptions, patchQueryOptions }
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useQueryEditorContext } from "../../context/QueryEditorContext";
import { EditorTabBar } from "../../primitives/EditorTabBar";
import { InfoCallout, EmptyState } from "../../primitives/EditorPrimitives";
import {
  BookOpen,
  PenLine,
  Plus,
  Trash2,
  Search,
  FileSpreadsheet,
  Table2,
  Settings2,
  Loader2,
  ChevronRight,
  ExternalLink,
  Info,
  Eye,
} from "lucide-react";

// ─── Operation cards ─────────────────────────────────────────────────────────

const OPERATIONS = [
  { id: "read", label: "Read", icon: BookOpen, description: "Fetch data from a sheet range" },
  { id: "write", label: "Write", icon: PenLine, description: "Write data to a sheet range" },
  { id: "append", label: "Append", icon: Plus, description: "Append rows to the end of a sheet" },
  { id: "update", label: "Update", icon: PenLine, description: "Update cells in a range" },
  { id: "clear", label: "Clear", icon: Trash2, description: "Clear data from a range" },
  { id: "getSpreadsheetInfo", label: "Get Info", icon: Info, description: "Get spreadsheet metadata" },
];

const TABS = [
  { id: "source", label: "Source", icon: FileSpreadsheet },
  { id: "options", label: "Options", icon: Settings2 },
  { id: "preview", label: "Preview", icon: Eye },
];

// ─── Spreadsheet Search ──────────────────────────────────────────────────────

function SpreadsheetSearch({ onSelect, selectedId, apiProxy }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (searchQuery, pageToken) => {
    setLoading(true);
    try {
      const res = await apiProxy.post("listSpreadsheets", {
        query: searchQuery,
        pageToken,
        pageSize: 10,
      });
      if (pageToken) {
        setResults((prev) => [...prev, ...(res.spreadsheets || [])]);
      } else {
        setResults(res.spreadsheets || []);
      }
      setNextPageToken(res.nextPageToken || null);
      setSearched(true);
    } catch (err) {
      console.error("listSpreadsheets failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiProxy]);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, null);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          className="flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Search spreadsheets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground animate-spin" />
        )}
      </div>

      <div className="max-h-[240px] overflow-y-auto rounded-md border border-border">
        {results.length === 0 && !loading && searched ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No spreadsheets found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((ss) => (
              <button
                key={ss.id}
                type="button"
                onClick={() => onSelect(ss)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  selectedId === ss.id
                    ? "bg-muted/50 border-l-2 border-l-foreground"
                    : "hover:bg-muted/30 border-l-2 border-l-transparent"
                }`}
              >
                <FileSpreadsheet className={`h-4 w-4 shrink-0 ${
                  selectedId === ss.id ? "text-foreground" : "text-muted-foreground"
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{ss.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {ss.owner && `${ss.owner} · `}
                    {ss.modifiedTime && new Date(ss.modifiedTime).toLocaleDateString()}
                  </p>
                </div>
                {ss.webViewLink && (
                  <a
                    href={ss.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {nextPageToken && !loading && (
        <button
          type="button"
          onClick={() => doSearch(query, nextPageToken)}
          className="w-full text-center text-xs text-foreground hover:underline py-1"
        >
          Load more...
        </button>
      )}
    </div>
  );
}

// ─── Sheet Selector ──────────────────────────────────────────────────────────

function SheetSelector({ spreadsheetId, selectedSheet, onSelect, apiProxy }) {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spreadsheetTitle, setSpreadsheetTitle] = useState("");

  useEffect(() => {
    if (!spreadsheetId) return;
    let cancelled = false;
    setLoading(true);
    apiProxy.post("listSheets", { spreadsheetId }).then((res) => {
      if (cancelled) return;
      setSheets(res.sheets || []);
      setSpreadsheetTitle(res.title || "");
      // Auto-select first sheet if none selected
      if (!selectedSheet && res.sheets?.length > 0) {
        onSelect(res.sheets[0].title);
      }
    }).catch((err) => {
      console.error("listSheets failed:", err);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadsheetId, apiProxy]);

  if (!spreadsheetId) return null;
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading sheets...
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {spreadsheetTitle && (
        <p className="text-[11px] text-muted-foreground">
          Sheets in <strong>{spreadsheetTitle}</strong>
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {sheets.map((sheet) => (
          <button
            key={sheet.sheetId}
            type="button"
            onClick={() => onSelect(sheet.title)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              selectedSheet === sheet.title
                ? "bg-muted text-foreground border-border"
                : "bg-muted/10 text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground"
            }`}
          >
            <Table2 className="h-3 w-3" />
            {sheet.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Data Preview ────────────────────────────────────────────────────────────

function DataPreview({ spreadsheetId, sheetName, apiProxy }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!spreadsheetId || !sheetName) return;
    setLoading(true);
    try {
      const res = await apiProxy.post("previewData", {
        spreadsheetId,
        sheetName,
        limit: 5,
      });
      setPreview(res);
    } catch (err) {
      console.error("previewData failed:", err);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId, sheetName, apiProxy]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  if (!spreadsheetId || !sheetName) {
    return (
      <EmptyState
        icon={Eye}
        message="Select a spreadsheet and sheet to preview data."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading preview...
      </div>
    );
  }

  if (!preview || preview.headers.length === 0) {
    return (
      <EmptyState icon={Table2} message="No data found in the selected range." />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Showing {preview.rows.length} of {preview.totalRows} rows
        </p>
        <button
          type="button"
          onClick={fetchPreview}
          className="text-[11px] text-foreground underline-offset-2 hover:underline"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              {preview.headers.map((h, i) => (
                <th key={i} className="px-3 py-1.5 text-left font-semibold text-foreground whitespace-nowrap border-b border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/20">
                {preview.headers.map((_, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-foreground whitespace-nowrap max-w-[200px] truncate">
                    {row[ci] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const GoogleSheetsQueryEditor = ({ queryEditorForm }) => {
  const { apiProxy } = useQueryEditorContext();
  const opts = queryEditorForm.dataQueryOptions || {};
  const [activeTab, setActiveTab] = useState("source");

  const patch = useCallback((updates) => {
    queryEditorForm.patchQueryOptions(updates);
  }, [queryEditorForm]);

  const operation = opts.operation || "read";
  const spreadsheetId = opts.spreadsheetId || "";
  const sheetName = opts.sheetName || "";

  // Ensure default "read" operation is actually saved into the form payload
  useEffect(() => {
    if (!opts.operation) {
      patch({ operation: "read" });
    }
  }, [opts.operation, patch]);

  // Tab badges
  const badges = {
    source: spreadsheetId ? 1 : 0,
  };

  return (
    <div className="space-y-0">
      {/* ── Operation picker ── */}
      <div className="pb-4">
        <label className="text-xs font-medium text-foreground mb-2 block">Operation</label>
        <div className="grid grid-cols-3 gap-1.5">
          {OPERATIONS.map((op) => {
            const Icon = op.icon;
            const isSelected = operation === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => patch({ operation: op.id })}
                className={`flex items-center gap-2 p-2.5 rounded-md border text-left transition-all ${
                  isSelected
                    ? "border-foreground bg-muted/20 shadow-sm"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/10"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${
                  isSelected ? "text-foreground" : "text-muted-foreground"
                }`} />
                <span className={`text-xs font-medium ${
                  isSelected ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {op.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <EditorTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} badges={badges} />

      <div className="pt-4 pb-2">
        {/* ── Source tab ── */}
        {activeTab === "source" && (
          <div className="space-y-4">
            {/* Spreadsheet ID — manual input OR search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Spreadsheet ID</label>
              <input
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter spreadsheet ID or search below..."
                value={spreadsheetId}
                onChange={(e) => patch({ spreadsheetId: e.target.value })}
              />
            </div>

            {/* Search available spreadsheets */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Search className="h-3 w-3" />
                Or search your spreadsheets
              </label>
              <SpreadsheetSearch
                apiProxy={apiProxy}
                selectedId={spreadsheetId}
                onSelect={(ss) => patch({ spreadsheetId: ss.id })}
              />
            </div>

            {/* Sheet selector */}
            {spreadsheetId && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="text-xs font-medium text-foreground">Sheet / Tab</label>
                <SheetSelector
                  spreadsheetId={spreadsheetId}
                  selectedSheet={sheetName}
                  onSelect={(name) => patch({ sheetName: name })}
                  apiProxy={apiProxy}
                />
              </div>
            )}

            {/* Range */}
            {spreadsheetId && (operation === "read" || operation === "write" || operation === "append" || operation === "update" || operation === "clear") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Range (A1 notation)</label>
                <input
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="A1:Z1000"
                  value={opts.range || ""}
                  onChange={(e) => patch({ range: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Options tab ── */}
        {activeTab === "options" && (
          <div className="space-y-4">
            {(operation === "read") && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Major Dimension</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={opts.majorDimension || "ROWS"}
                    onChange={(e) => patch({ majorDimension: e.target.value })}
                  >
                    <option value="ROWS">Rows</option>
                    <option value="COLUMNS">Columns</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gs-includeHeaders"
                    checked={opts.includeHeaders !== false}
                    onChange={(e) => patch({ includeHeaders: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="gs-includeHeaders" className="text-xs text-foreground">
                    Treat first row as headers
                  </label>
                </div>
              </>
            )}

            {(operation === "write" || operation === "update" || operation === "append") && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Data (JSON array of arrays)</label>
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                    placeholder='[["Header1", "Header2"], ["Value1", "Value2"]]'
                    value={opts.data || ""}
                    onChange={(e) => patch({ data: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Value Input Option</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={opts.valueInputOption || "USER_ENTERED"}
                    onChange={(e) => patch({ valueInputOption: e.target.value })}
                  >
                    <option value="USER_ENTERED">User Entered</option>
                    <option value="RAW">Raw</option>
                  </select>
                </div>
              </>
            )}

            {operation === "append" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Insert Data Option</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={opts.insertDataOption || "INSERT_ROWS"}
                  onChange={(e) => patch({ insertDataOption: e.target.value })}
                >
                  <option value="INSERT_ROWS">Insert Rows</option>
                  <option value="OVERWRITE">Overwrite</option>
                </select>
              </div>
            )}

            {operation === "getSpreadsheetInfo" && (
              <InfoCallout>
                This operation returns spreadsheet metadata including sheet names, row/column counts, and locale.
                No additional options required.
              </InfoCallout>
            )}

            {operation === "clear" && (
              <InfoCallout>
                This will clear all data in the specified range. The range is configured in the Source tab.
              </InfoCallout>
            )}
          </div>
        )}

        {/* ── Preview tab ── */}
        {activeTab === "preview" && (
          <DataPreview
            spreadsheetId={spreadsheetId}
            sheetName={sheetName}
            apiProxy={apiProxy}
          />
        )}
      </div>
    </div>
  );
};
