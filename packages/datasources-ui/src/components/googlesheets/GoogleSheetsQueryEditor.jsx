import React, { useState, useCallback, useEffect, useRef } from "react";
import { useQueryEditorContext } from "../../context/QueryEditorContext";
import {
  Input,
  Label,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Checkbox,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Callout,
  EmptyState,
} from "@jet-admin/ui";
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
  RefreshCw,
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            className="pl-8"
            placeholder="Search spreadsheets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => doSearch(query, null)}
          title="Refresh list"
        >
          <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </div>
      {results.length === 0 && !loading && searched ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No spreadsheets found
        </div>
      ) :
        results?.length > 0 &&
        <div className="max-h-[240px] overflow-y-auto rounded border border-border">

          <div className="flex flex-col">
            {results.map((ss) => (
              <button
                key={ss.id}
                type="button"
                onClick={() => onSelect(ss)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-l-2 border-t border-t-border first:border-t-0 ${
                  selectedId === ss.id
                  ? "bg-primary/10 text-primary border-l-primary"
                  : "hover:bg-muted/30 border-l-transparent text-muted-foreground"
                }`}
              >
                <FileSpreadsheet className={`h-4 w-4 shrink-0 ${
                  selectedId === ss.id ? "text-primary" : "text-muted-foreground"
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{ss.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
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

      </div>
      }

      {nextPageToken && !loading && (
        <Button
          type="button"
          onClick={() => doSearch(query, nextPageToken)}
          variant="ghost"
          size="sm"
          className="w-full py-1 text-xs"
        >
          Load more...
        </Button>
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
    <div className="space-y-1">
      {spreadsheetTitle && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sheets in {spreadsheetTitle}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {sheets.map((sheet) => (
          <button
            key={sheet.sheetId}
            type="button"
            onClick={() => onSelect(sheet.title)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              selectedSheet === sheet.title
              ? "bg-primary/10 text-primary border-primary shadow-sm"
              : "bg-background text-muted-foreground border-border hover:bg-muted/50"
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
        <Button
          type="button"
          onClick={fetchPreview}
          variant="link"
          size="sm"
          className="h-auto p-0 text-[11px] font-normal"
        >
          Refresh
        </Button>
      </div>
      <div className="overflow-x-auto rounded border border-border">
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
      <div className="pb-2">
        <Label className="mb-2 block">Operation</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {OPERATIONS.map((op) => {
            const Icon = op.icon;
            const isSelected = operation === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => patch({ operation: op.id })}
                className={`flex items-center gap-2 p-2.5 rounded border text-left transition-all ${
                  isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-medium">
                  {op.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const badgeCount = badges[tab.id];
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 px-3 py-2 text-xs">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {tab.label}
                {badgeCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                    {badgeCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── Source tab ── */}
        <TabsContent value="source" className="mt-2 pb-2">
          <div className="space-y-2">
            {/* Spreadsheet ID — manual input OR search */}
            <div className="space-y-1">
              <Label>Spreadsheet ID</Label>
              <Input
                type="text"
                className="font-mono text-xs"
                placeholder="Enter spreadsheet ID or search below..."
                value={spreadsheetId}
                onChange={(e) => patch({ spreadsheetId: e.target.value })}
              />
            </div>

            {/* Search available spreadsheets */}
            <div className="space-y-1">
              <Label>
                Or search your spreadsheets
              </Label>
              <SpreadsheetSearch
                apiProxy={apiProxy}
                selectedId={spreadsheetId}
                onSelect={(ss) => patch({ spreadsheetId: ss.id })}
              />
            </div>

            {/* Sheet selector */}
            {spreadsheetId && (
              <div className="space-y-1 pt-2 border-t border-border">
                <Label>Sheet / Tab</Label>
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
              <div className="space-y-1">
                <Label>Range (A1 notation)</Label>
                <Input
                  type="text"
                  className="font-mono text-xs"
                  placeholder="A1:Z1000"
                  value={opts.range || ""}
                  onChange={(e) => patch({ range: e.target.value })}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Options tab ── */}
        <TabsContent value="options" className="pb-2">
          <div className="space-y-2">
            {(operation === "read") && (
              <>
                <div className="space-y-1">
                  <Label>Major Dimension</Label>
                  <Select
                    value={opts.majorDimension || "ROWS"}
                    onValueChange={(val) => patch({ majorDimension: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROWS">Rows</SelectItem>
                      <SelectItem value="COLUMNS">Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="gs-includeHeaders"
                    checked={opts.includeHeaders !== false}
                    onCheckedChange={(checked) => patch({ includeHeaders: checked })}
                  />
                  <Label htmlFor="gs-includeHeaders" className="cursor-pointer text-xs text-foreground font-normal">
                    Treat first row as headers
                  </Label>
                </div>
              </>
            )}

            {(operation === "write" || operation === "update" || operation === "append") && (
              <>
                <div className="space-y-1">
                  <Label>Data (JSON array of arrays)</Label>
                  <Textarea
                    className="min-h-[120px] font-mono text-xs"
                    placeholder='[["Header1", "Header2"], ["Value1", "Value2"]]'
                    value={opts.data || ""}
                    onChange={(e) => patch({ data: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Value Input Option</Label>
                  <Select
                    value={opts.valueInputOption || "USER_ENTERED"}
                    onValueChange={(val) => patch({ valueInputOption: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER_ENTERED">User Entered</SelectItem>
                      <SelectItem value="RAW">Raw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {operation === "append" && (
              <div className="space-y-1">
                <Label>Insert Data Option</Label>
                <Select
                  value={opts.insertDataOption || "INSERT_ROWS"}
                  onValueChange={(val) => patch({ insertDataOption: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSERT_ROWS">Insert Rows</SelectItem>
                    <SelectItem value="OVERWRITE">Overwrite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === "getSpreadsheetInfo" && (
              <Callout>
                This operation returns spreadsheet metadata including sheet names, row/column counts, and locale.
                No additional options required.
              </Callout>
            )}

            {operation === "clear" && (
              <Callout>
                This will clear all data in the specified range. The range is configured in the Source tab.
              </Callout>
            )}
          </div>
        </TabsContent>

        {/* ── Preview tab ── */}
        <TabsContent value="preview" className="pb-2">
          <DataPreview
            spreadsheetId={spreadsheetId}
            sheetName={sheetName}
            apiProxy={apiProxy}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
