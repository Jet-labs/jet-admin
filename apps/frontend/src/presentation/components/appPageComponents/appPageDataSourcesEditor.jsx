import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useWorkflows } from "../../../logic/hooks/useWorkflows";
import { useDataQueries } from "../../../logic/hooks/useDataQueries";
import { useListeners } from "../../../logic/hooks/useListeners";
import { useAppPageDispatch, appPageActions, useAppPageStateTree } from "../../../logic/appPageRuntime";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { Plus, Trash2, Edit2, Play, Square, Database, GitBranch, Layers, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { testDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { stopTestWorkflowAPI } from "../../../data/apis/workflow";
import { executeWorkflowWithStreaming } from "../../../logic/appPageRuntime/executeWorkflowWithStreaming";
import { resolveValue } from "../../../logic/evaluationEngine";
import { useSocketStore } from "../../../logic/stores/useSocketStore";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { displaySuccess, displayError } from "../../../utils/notification";

export const AppPageDataSourcesEditor = ({ appPageEditorForm }) => {
  const { tenantID } = useParams();
  const { workflows = [], isLoadingWorkflows, loadWorkflowsError } = useWorkflows(tenantID);
  const { dataQueries = [], isLoadingDataQueries, loadDataQueriesError } = useDataQueries(tenantID);
  const { listeners = [], isLoadingListeners, loadListenersError } = useListeners(tenantID);
  const dispatch = useAppPageDispatch();
  const stateTree = useAppPageStateTree();

  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Track active workflow disconnectors for cleanup
  const workflowDisconnectorsRef = React.useRef({});
  const listenerDisconnectorsRef = React.useRef({});

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      for (const alias of Object.keys(workflowDisconnectorsRef.current)) {
        if (typeof workflowDisconnectorsRef.current[alias] === "function") {
          workflowDisconnectorsRef.current[alias]();
        }
      }
      workflowDisconnectorsRef.current = {};

      for (const alias of Object.keys(listenerDisconnectorsRef.current)) {
        if (typeof listenerDisconnectorsRef.current[alias] === "function") {
          listenerDisconnectorsRef.current[alias]();
        }
      }
      listenerDisconnectorsRef.current = {};
    };
  }, []);

  const handleFetchData = async (source) => {
    if (!source.alias) return;
    
    if (source.type === "listener") {
      const socket = useSocketStore.getState().socket;
      if (!socket) {
        displayError(`Socket not connected. Cannot start listening to "${source.alias}".`);
        return;
      }

      if (typeof listenerDisconnectorsRef.current[source.alias] === "function") {
        listenerDisconnectorsRef.current[source.alias]();
      }

      dispatch(appPageActions.setListenerResult(source.alias, null));

      // The runtime room is listener:app_page:appPageID but appPageID might not be in URL if we are in editor.
      // Wait, in editor, are we in a specific app page URL? No, the URL is usually `.../app-pages/:appPageID/...`
      // Wait, if appPageEditorForm has the ID, let's use it, otherwise fall back to pageID from props or URL.
      // Actually we just don't have appPageID readily available here, let's just use the URL param if present.
      // We don't necessarily need to join the room if the runtime already joined it.

      const channelName = source.channelName || `listener:${source.listenerID}`;

      const handleListenerEvent = (payload) => {
        if (
          payload.channelName === `listener:${source.listenerID}` ||
          payload.channelName === channelName
        ) {
          dispatch(appPageActions.setListenerResult(source.alias, payload.data, null, payload.mode, payload.limit));
        }
      };

      socket.on("listener_event", handleListenerEvent);

      listenerDisconnectorsRef.current[source.alias] = () => {
        socket.off("listener_event", handleListenerEvent);
      };

      displaySuccess(`Refreshed listener connection for "${source.alias}". Waiting for events...`);
      return;
    }

    if (source.type === "workflow") {
      dispatch(appPageActions.setWorkflowLoading(source.alias));
    } else {
      dispatch(appPageActions.setQueryLoading(source.alias));
    }
    
    try {
      const resolvedInputValues = {};
      const variablesList = appPageEditorForm.values.appPageConfig?.variables || [];
      const mockStateTree = {
        variables: variablesList.reduce((acc, v) => ({ ...acc, [v.key]: v.defaultValue }), {}),
        globals: {},
      };
      
      const inputValues = source.inputValues || {};
      for (const [k, v] of Object.entries(inputValues)) {
        if (typeof v === "string" && v.startsWith("{{") && v.endsWith("}}")) {
          resolvedInputValues[k] = resolveValue(v, mockStateTree) || "";
        } else {
          resolvedInputValues[k] = v;
        }
      }

      if (source.type === "workflow") {
        // Disconnect any existing stream for this alias
        if (typeof workflowDisconnectorsRef.current[source.alias] === "function") {
          workflowDisconnectorsRef.current[source.alias]();
        }

        const { disconnect } = executeWorkflowWithStreaming({
          tenantID,
          workflowID: source.workflowID,
          inputValues: resolvedInputValues,
          alias: source.alias,
          dispatch,
          onError: (err) => {
            displayError(`Failed to execute workflow "${source.alias}": ${err.message || err}`);
          },
        });

        workflowDisconnectorsRef.current[source.alias] = disconnect;
        displaySuccess(`Workflow "${source.alias}" triggered. Observing updates live.`);
      } else {
        const result = await testDataQueryByIDAPI({
          tenantID,
          dataQueryID: source.queryID,
          inputValues: resolvedInputValues,
        });

        appPageEditorForm.setFieldValue(`fetchedDataPreview.${source.alias}`, {
          data: result,
          error: null,
          isLoading: false,
          lastFetched: new Date().toLocaleTimeString(),
        });
        
        // For queries, set the result in the state tree
        dispatch(appPageActions.setQueryResult(source.alias, result));
        displaySuccess(`Data source "${source.alias}" fetched successfully.`);
      }
    } catch (err) {
      console.error(err);
      appPageEditorForm.setFieldValue(`fetchedDataPreview.${source.alias}`, {
        data: null,
        error: err.message || "Failed to fetch data",
        isLoading: false,
      });
      if (source.type === "workflow") {
        dispatch(appPageActions.setWorkflowResult(source.alias, null, err.message || err));
      } else {
        dispatch(appPageActions.setQueryResult(source.alias, null, err.message || err));
      }
      displayError(`Failed to fetch data source "${source.alias}": ${err.message || err}`);
    }
  };

  const handleStopWorkflow = async (source) => {
    if (!source.alias) return;
    const stateTreeSource = stateTree?.workflows?.[source.alias];
    const instanceID = stateTreeSource?.instanceID;

    try {
      // 1. Disconnect local websocket stream
      if (typeof workflowDisconnectorsRef.current[source.alias] === "function") {
        workflowDisconnectorsRef.current[source.alias]();
        delete workflowDisconnectorsRef.current[source.alias];
      }

      // 2. If we have a running instance ID, call the stop API
      if (instanceID) {
        await stopTestWorkflowAPI({ tenantID, instanceID });
      }

      // 3. Mark the workflow as stopped in the state tree
      dispatch(
        appPageActions.setWorkflowResult(
          source.alias,
          stateTreeSource?.data,
          "Workflow execution was stopped",
          false,
          instanceID
        )
      );

      displaySuccess(`Workflow "${source.alias}" execution stopped.`);
    } catch (err) {
      console.error("Failed to stop workflow:", err);
      displayError(`Failed to stop workflow "${source.alias}": ${err.message || err}`);
    }
  };

  const getFetchedSummary = (source, stateTreeSource) => {
    if (!stateTreeSource) return null;
    if (stateTreeSource.isLoading) {
      return { status: "loading", message: "Running..." };
    }
    if (stateTreeSource.error) {
      const errMessage = typeof stateTreeSource.error === "object"
        ? stateTreeSource.error.message || JSON.stringify(stateTreeSource.error)
        : String(stateTreeSource.error);
      return { status: "error", message: `Error: ${errMessage}` };
    }
    const data = stateTreeSource.data;
    if (data === null || data === undefined) return null;
    
    let count = null;
    if (Array.isArray(data)) {
      count = data.length;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.data)) {
        count = data.data.length;
      } else {
        count = Object.keys(data).length;
      }
    }
    const countStr = count !== null ? `(${count} records)` : "";
    const timeStr = stateTreeSource.lastUpdated
      ? new Date(stateTreeSource.lastUpdated).toLocaleTimeString()
      : "";
    return { status: "success", message: `Fetched: ${timeStr} ${countStr}` };
  };

  const dataSources = appPageEditorForm.values.appPageConfig?.dataSources || [];
  const variables = appPageEditorForm.values.appPageConfig?.variables || [];

  const updateDataSources = useCallback(
    (newSources) => {
      appPageEditorForm.setFieldValue("appPageConfig.dataSources", newSources);
    },
    [appPageEditorForm]
  );

  const handleAddSource = () => {
    const newSource = {
      alias: `query_${dataSources.length + 1}`,
      type: "query",
      queryID: "",
      workflowID: "",
      inputValues: {},
      triggerMode: "auto",
      refreshOn: [],
      refetchInterval: null,
    };
    updateDataSources([...dataSources, newSource]);
    setEditingIndex(dataSources.length);
    setIsAdding(true);
  };

  const handleRemoveSource = (index) => {
    if (confirm("Are you sure you want to delete this data source?")) {
      const updated = dataSources.filter((_, i) => i !== index);
      updateDataSources(updated);
      if (editingIndex === index) {
        setEditingIndex(null);
        setIsAdding(false);
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleSourceChange = (index, field, value) => {
    const updated = dataSources.map((src, i) => {
      if (i !== index) return src;
      const next = { ...src, [field]: value };
      if (field === "type") {
        next.queryID = "";
        next.workflowID = "";
        next.listenerID = "";
        next.channelName = "";
        next.inputValues = {};
        next.refreshOn = [];
      }
      return next;
    });
    updateDataSources(updated);
  };

  const getSourceInputDefinitions = (source) => {
    if (source.type === "query" && source.queryID) {
      const query = dataQueries.find((q) => String(q.dataQueryID) === String(source.queryID));
      return query?.dataQueryOptions?.inputDefinitions || [];
    }
    if (source.type === "workflow" && source.workflowID) {
      const wf = workflows.find((w) => String(w.workflowID) === String(source.workflowID));
      const inputDefinitions = wf?.workflowOptions?.inputDefinitions;
      if (Array.isArray(inputDefinitions)) return inputDefinitions;
      return [];
    }
    return [];
  };

  const selectedSource = editingIndex !== null ? dataSources[editingIndex] : null;

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingWorkflows || isLoadingDataQueries || isLoadingListeners}
      error={loadWorkflowsError || loadDataQueriesError || loadListenersError}
    >
    <div className="flex flex-col h-full min-h-0 bg-background">
      {editingIndex !== null && selectedSource ? (
        /* ─── Detail / Edit View ─── */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setEditingIndex(null);
                  setIsAdding(false);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {isAdding ? "New Data Source" : "Edit Data Source"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Alias field */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Alias / Reference Name
              </Label>
              <Input
                type="text"
                className="w-full text-xs font-mono"
                placeholder="e.g. users_list"
                value={selectedSource.alias || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                  handleSourceChange(editingIndex, "alias", val);
                }}
              />
              <p className="text-[10px] text-muted-foreground">
                Accessible via expression engine, e.g.{" "}
                <code className="bg-background px-1 rounded border border-border font-mono text-xs">{`{{ state.${selectedSource.type === "workflow" ? "workflows" : "queries"}.${selectedSource.alias || "alias"}.data }}`}</code>
              </p>
            </div>

            {/* Type selector */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Source Type
              </Label>
              <Select
                value={selectedSource.type}
                onValueChange={(val) => handleSourceChange(editingIndex, "type", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="query">Data Query</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="listener">Listener</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Select */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {selectedSource.type === "query"
                  ? "Select Query"
                  : selectedSource.type === "workflow"
                    ? "Select Workflow"
                    : "Select Listener"}
              </Label>
              {selectedSource.type === "query" ? (
                <Select
                  value={selectedSource.queryID ? String(selectedSource.queryID) : ""}
                  onValueChange={(val) => handleSourceChange(editingIndex, "queryID", val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choose a query…" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataQueries.map((q) => (
                      <SelectItem key={q.dataQueryID} value={String(q.dataQueryID)}>
                        {q.dataQueryTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : selectedSource.type === "workflow" ? (
                <Select
                  value={selectedSource.workflowID ? String(selectedSource.workflowID) : ""}
                  onValueChange={(val) => handleSourceChange(editingIndex, "workflowID", val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choose a workflow…" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map((w) => (
                      <SelectItem key={w.workflowID} value={String(w.workflowID)}>
                        {w.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                ) : (
                  <Select
                    value={selectedSource.listenerID ? String(selectedSource.listenerID) : ""}
                    onValueChange={(val) => handleSourceChange(editingIndex, "listenerID", val)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Choose a listener…" />
                    </SelectTrigger>
                    <SelectContent>
                      {listeners.map((l) => (
                        <SelectItem key={l.listenerID} value={String(l.listenerID)}>
                          {l.listenerTitle || `Listener ${l.listenerID}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              )}
            </div>

            {/* Custom Channel Name (for listener) */}
            {selectedSource.type === "listener" && (
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Custom Channel Name (Optional)
                </Label>
                <Input
                  type="text"
                  className="w-full text-xs font-mono"
                  placeholder="e.g. custom_channel"
                  value={selectedSource.channelName || ""}
                  onChange={(e) => handleSourceChange(editingIndex, "channelName", e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Defaults to <code className="bg-background px-1 rounded border border-border font-mono text-xs">{`listener:${selectedSource.listenerID}`}</code> if left blank.
                </p>
              </div>
            )}

            {/* Trigger Mode */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Trigger Mode
              </Label>
              <Select
                value={selectedSource.triggerMode || "auto"}
                onValueChange={(val) => handleSourceChange(editingIndex, "triggerMode", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Fetch on load)</SelectItem>
                  <SelectItem value="reactive">Reactive (Fetch when variables change)</SelectItem>
                  <SelectItem value="manual">Manual (Fetch via events/actions only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh On Variables (for reactive mode) */}
            {selectedSource.triggerMode === "reactive" && (
              <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Refresh When Variable Changes
                </p>
                {variables.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground/70 italic">
                    No page variables defined. Define variables in the Variables tab first.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {variables.map((v) => {
                      const path = `variables.${v.key}`;
                      const isChecked = selectedSource.refreshOn?.includes(path);
                      return (
                        <div key={v.key} className="flex items-center gap-2">
                          <Checkbox
                            id={`refreshOn-${v.key}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const current = selectedSource.refreshOn || [];
                              const next = checked
                                ? [...current, path]
                                : current.filter((p) => p !== path);
                              handleSourceChange(editingIndex, "refreshOn", next);
                            }}
                          />
                          <Label
                            htmlFor={`refreshOn-${v.key}`}
                            className="text-xs font-mono cursor-pointer"
                          >
                            {path}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Polling Interval */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Refetch Interval (ms)
              </Label>
              <Input
                type="number"
                className="w-full text-xs"
                placeholder="e.g. 5000 (Optional, leave blank to disable polling)"
                value={selectedSource.refetchInterval || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  handleSourceChange(editingIndex, "refetchInterval", val);
                }}
              />
            </div>

            {/* Input Arguments Form */}
            {getSourceInputDefinitions(selectedSource).length > 0 && (
              <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Parameters / Arguments
                </p>
                {getSourceInputDefinitions(selectedSource).map((inputDef) => (
                  <div key={inputDef.key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground font-mono">{inputDef.key}</Label>
                    <TemplateAutocompleteInput
                      value={selectedSource.inputValues?.[inputDef.key] || ""}
                      onChange={(val) => {
                        appPageEditorForm.setFieldValue(
                          `appPageConfig.dataSources.${editingIndex}.inputValues.${inputDef.key}`,
                          val
                        );
                      }}
                      placeholder={`e.g. {{ state.variables.${inputDef.key} }}`}
                      liveStateTree={stateTree ? { state: stateTree } : null}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── List View ─── */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Page Data Sources
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                Define the query models that fuel this page.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {dataSources.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-center flex flex-col items-center justify-center py-10">
                <Layers className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs font-medium text-foreground">No Page Data Sources</p>
                <p className="text-[10px] text-muted-foreground/70 max-w-[200px] mt-1">
                  Add queries or workflows that widgets can consume reactively.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dataSources.map((source, index) => {
                  const isQuery = source.type === "query";
                  const isWorkflow = source.type === "workflow";
                  const Icon = isQuery ? Database : isWorkflow ? GitBranch : Layers;
                  const stateTreeSource = isWorkflow
                    ? stateTree?.workflows?.[source.alias]
                    : stateTree?.queries?.[source.alias];
                  const isFetching = !!stateTreeSource?.isLoading;
                  const summary = getFetchedSummary(source, stateTreeSource);

                  return (
                    <div
                      key={index}
                      className="rounded-md border border-border bg-card p-3 flex flex-col hover:shadow-sm transition-shadow group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-mono font-medium truncate text-foreground block">
                              {source.alias || `source_${index + 1}`}
                            </span>
                            <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
                              {source.type} : {isQuery ? source.queryID : isWorkflow ? source.workflowID : source.listenerID}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] font-mono text-muted-foreground/70 uppercase tracking-wider">Trigger:</span>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                              {source.triggerMode || "auto"}
                            </span>
                          </div>
                          {summary && (
                            <div className={`text-[10px] font-medium flex items-center gap-1.5 ${
                              summary.status === "error" ? "text-destructive" :
                              summary.status === "success" ? "text-primary" :
                              "text-muted-foreground"
                            } truncate`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                summary.status === "error" ? "bg-destructive" :
                                summary.status === "success" ? "bg-primary" :
                                "bg-muted-foreground"
                              }`} />
                              <span className="truncate max-w-[100px]">{summary.message}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {source.type === "workflow" && isFetching ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleStopWorkflow(source)}
                              title="Stop workflow execution"
                            >
                              <Square className="h-3 w-3 fill-current text-destructive" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                                disabled={
                                  isFetching ||
                                  (source.type === "query" && !source.queryID) ||
                                  (source.type === "workflow" && !source.workflowID) ||
                                  (source.type === "listener" && !source.listenerID)
                                }
                              className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
                              onClick={() => handleFetchData(source)}
                                title={
                                  source.type === "workflow"
                                    ? "Run workflow"
                                    : source.type === "listener"
                                      ? "Refresh Listener Socket"
                                      : "Fetch query"
                                }
                            >
                              {isFetching ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                                ) : source.type === "listener" ? (
                                  <RefreshCw className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3 fill-current" />
                              )}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingIndex(index);
                              setIsAdding(false);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveSource(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1"
                onClick={handleAddSource}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ReactQueryLoadingErrorWrapper>
  );
};

AppPageDataSourcesEditor.propTypes = {
  appPageEditorForm: PropTypes.object.isRequired,
};
