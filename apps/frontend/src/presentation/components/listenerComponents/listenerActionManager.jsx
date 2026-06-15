import React, { useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createListenerActionAPI,
  updateListenerActionAPI,
  deleteListenerActionAPI,
} from "../../../data/apis/listener";
import { useInfiniteWorkflows } from "../../../logic/hooks/useWorkflows";
import { useInfiniteDataQueries } from "../../../logic/hooks/useDataQueries";
import { useInfiniteAppPages } from "../../../logic/hooks/useAppPages";
import { getWorkflowByIDAPI } from "../../../data/apis/workflow";
import { getDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { getAppPageByIDAPI } from "../../../data/apis/appPage";
import { useDebounce } from "@uidotdev/usehooks";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CONSTANTS } from "../../../constants";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  Button,
  Spinner,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Switch,
  Card,
  CodeEditor,
  InputValuesForm,
  CardFooter,
  CardTitle,
  SearchSelect,
} from "@jet-admin/ui";
import { MODES } from "@jet-admin/expression-engine";
import { Zap, Search, Save, Smartphone, Plus, Trash2, Edit2, Play, CircleSlash, ArrowRight, Wand2 } from "lucide-react";
import PropTypes from "prop-types";
import { GitBranch, FileCode2, DatabaseZap, PanelTop } from "lucide-react";

// Listener action mappings resolve {{event.*}} against the incoming event via
// the backend's safe-path resolver, so suggestions use the `event` root only.
const LISTENER_EVENT_STATE_TREE = {
  event: {
    payload: {},
    headers: {},
    source: "",
    timestamp: 0,
    topic: "",
  },
};
const ACTION_TYPES = [
  { value: "transform", label: "Transform Event", icon: Wand2, color: "text-primary", bg: "bg-muted", border: "border-border" },
  { value: "trigger_workflow", label: "Trigger Workflow", icon: GitBranch, color: "text-primary", bg: "bg-muted", border: "border-border" },
  { value: "trigger_query", label: "Trigger Data Query", icon: FileCode2, color: "text-primary", bg: "bg-muted", border: "border-border" },
  { value: "save_to_buffer", label: "Save to Buffer", icon: DatabaseZap, color: "text-primary", bg: "bg-muted", border: "border-border" },
  { value: "push_to_app_page", label: "Push to AppPage", icon: PanelTop, color: "text-primary", bg: "bg-muted", border: "border-border" },
];

export const ListenerActionManager = ({ tenantID, listenerID, actions = [] }) => {
  const queryClient = useQueryClient();
  const [editingAction, setEditingAction] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID), listenerID] });
  };



  const { isPending: isSaving, mutate: saveAction } = useMutation({
    mutationFn: (data) => {
      if (editingAction?.actionID) {
        return updateListenerActionAPI({
          tenantID,
          listenerID,
          actionID: editingAction.actionID,
          actionData: data,
        });
      }
      return createListenerActionAPI({ tenantID, listenerID, actionData: data });
    },
    onSuccess: () => {
      displaySuccess("Action saved successfully");
      setEditingAction(null);
      setIsAdding(false);
      invalidate();
    },
    onError: (err) => displayError(err),
  });

  const { mutate: deleteAction } = useMutation({
    mutationFn: (actionID) => deleteListenerActionAPI({ tenantID, listenerID, actionID }),
    onSuccess: () => {
      displaySuccess("Action deleted");
      invalidate();
    },
    onError: (err) => displayError(err),
  });

  const handleToggleEnable = (action) => {
    updateListenerActionAPI({
      tenantID,
      listenerID,
      actionID: action.actionID,
      actionData: { ...action, isEnabled: !action.isEnabled },
    }).then(() => {
      invalidate();
    }).catch(err => displayError(err));
  };

  const allActions = [...actions].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (isAdding || editingAction) {
    return (
      <ActionForm
        action={editingAction}
        isSaving={isSaving}
        onSave={(data) => saveAction(data)}
        onCancel={() => {
          setEditingAction(null);
          setIsAdding(false);
        }}
        tenantID={tenantID}
        listenerID={listenerID}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pipeline Steps</h3>
          <p className="text-[11px] text-muted-foreground">Steps execute sequentially on each incoming event.</p>
        </div>
        {allActions.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        )}
      </div>

      {allActions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-border/60 bg-background/20 py-16 text-center transition-colors hover:bg-background/40 hover:border-border">
          <div className="mb-4 rounded-full bg-brand-border/40 p-4 ring-1 ring-border shadow-inner">
            <Play className="h-6 w-6 text-muted-foreground/80 pl-1" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">No pipeline steps configured</h4>
          <p className="mt-2 text-xs text-muted-foreground max-w-sm">
            Add your first step to start processing, transforming, and routing incoming data events.
          </p>
          <Button size="sm" variant="secondary" className="mt-6" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </Card>
      ) : (
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
          {allActions.map((action, index) => {
            const typeConfig = ACTION_TYPES.find(t => t.value === action.actionType);
            const Icon = typeConfig?.icon || Zap;
            const summaryText = action.actionType === 'transform'
              ? (action.actionConfig?.script ? `${action.actionConfig.script.substring(0, 60)}...` : 'No script')
              : Object.keys(action.actionConfig).length > 0
                ? Object.entries(action.actionConfig).slice(0, 2).map(([k, v]) => `${k}: ${typeof v === 'object' ? '{...}' : String(v)}`).join(' · ')
                : 'No configuration';
            
            return (
              <div key={action.actionID} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-brand-dark bg-brand-border/80 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ring-1 ring-border/20 transition-all group-hover:ring-brand-primary/30 group-hover:border-brand-dark/90">
                  <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground">{index + 1}</span>
                </div>

                <Card className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 transition-all duration-300 border shadow-sm hover:shadow-md ${!action.isEnabled ? 'opacity-60 grayscale-[0.3]' : 'hover:border-border/80 bg-background/60 backdrop-blur-sm'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border ${typeConfig?.border || 'border-border'} ${typeConfig?.bg || 'bg-muted'} shadow-inner`}>
                        <Icon className={`h-4 w-4 ${typeConfig?.color || 'text-muted-foreground'}`} />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {typeConfig?.label || action.actionType}
                          </h4>
                          {!action.isEnabled && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-400 ring-1 ring-inset ring-zinc-800">
                              <CircleSlash className="h-3 w-3" />
                              Disabled
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate max-w-full opacity-80">
                          {summaryText}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Switch
                        checked={action.isEnabled}
                        onCheckedChange={() => handleToggleEnable(action)}
                        size="sm"
                        className="scale-90 data-[state=checked]:bg-primary"
                      />
                      <div className="hidden sm:block w-px h-4 bg-border/60 mx-1"></div>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-brand-border/40"
                          onClick={() => setEditingAction(action)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                             if (confirm("Are you sure you want to delete this step?")) {
                               deleteAction(action.actionID);
                             }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ActionForm = ({ action, onSave, onCancel, isSaving, tenantID, listenerID }) => {
  const [formData, setFormData] = useState(
    action || {
      actionType: "transform",
      actionConfig: {},
      isEnabled: true,
      orderIndex: 0,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const selectedType = ACTION_TYPES.find(t => t.value === formData.actionType);

  return (
    <Card className="">
      <div className="border-b rounded-t-md border-border/50 bg-background p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">

          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {action ? "Edit Pipeline Step" : "Add Pipeline Step"}
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-2 space-y-2">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step Type</Label>
            <Select
              value={formData.actionType}
              onValueChange={(val) => setFormData({ ...formData, actionType: val, actionConfig: {} })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose a step type..." />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 shrink-0 ${t.color}`} />
                        {t.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-sm border border-border/50 bg-background/40 p-2">
            <div className="flex items-center gap-2 mb-2">
              <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
              <h4 className="text-sm font-medium text-foreground">Configuration Details</h4>
            </div>
             <ActionConfigEditor
              type={formData.actionType}
              config={formData.actionConfig}
              onChange={(config) => setFormData({ ...formData, actionConfig: config })}
              tenantID={tenantID}
              listenerID={listenerID}
            />
          </div>

          <div className="flex items-center justify-between rounded-sm border border-border/50 bg-background/40 p-2">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-sm ${formData.isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {formData.isEnabled ? <Play className="h-4 w-4" /> : <CircleSlash className="h-4 w-4" />}
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-medium cursor-pointer" htmlFor="enable-action">Enable Action</Label>
                <p className="text-xs text-muted-foreground">When disabled, this action will be skipped during execution.</p>
              </div>
            </div>
            <Switch
              id="enable-action"
              checked={formData.isEnabled}
              onCheckedChange={(val) => setFormData({ ...formData, isEnabled: val })}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="destructive" size="sm" type="button" onClick={onCancel} disabled={isSaving} className="px-6 hover:bg-brand-border/40">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} size="sm" variant="default">
            {isSaving && <Spinner size={14} className="mr-2" />}
            {action ? "Save Changes" : "Create Step"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

const TriggerWorkflowConfig = ({ config, onChange, tenantID, renderModeToggle, isJsonMode, getJsonString }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    workflows = [],
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoadingWorkflows,
  } = useInfiniteWorkflows(tenantID, debouncedSearch);

  const selectedWorkflowID = config.workflowID;
  const { data: selectedWorkflowDetail } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), "detail", selectedWorkflowID],
    queryFn: () => getWorkflowByIDAPI({ tenantID, workflowID: selectedWorkflowID }),
    enabled: Boolean(tenantID) && Boolean(selectedWorkflowID),
    refetchOnWindowFocus: false,
  });

  const selectedWorkflow = selectedWorkflowDetail || workflows.find(w => w.workflowID === selectedWorkflowID);

  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Select Workflow</Label>
        <SearchSelect
          value={config.workflowID || ""}
          onChange={(val) => {
            const selected = workflows.find(w => w.workflowID === val) || (selectedWorkflowDetail?.workflowID === val ? selectedWorkflowDetail : null);
            const defaultMapping = {};
            if (selected && selected.inputs) {
              selected.inputs.forEach(input => {
                const key = input.key || input.name;
                if (key) defaultMapping[key] = `{{event.${key}}}`;
              });
            }
            onChange({ ...config, workflowID: val, inputValues: defaultMapping });
          }}
          options={workflows.map(w => ({
            value: w.workflowID,
            label: w.title
          }))}
          onSearchChange={setSearch}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoadingWorkflows}
          placeholder="Choose a workflow..."
          selectedLabel={selectedWorkflowDetail?.title}
        />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-end mb-1">
          <div>
            <Label className="text-xs text-muted-foreground">Input Values</Label>
            {renderModeToggle()}
          </div>
          <span className="text-[10px] text-muted-foreground/60 mb-1">Supports {"{{event.property}}"} syntax</span>
        </div>
        
        {isJsonMode ? (
          <CodeEditor
            height={180}
            language="json"
            value={getJsonString(config.inputValues)}
            onChange={(val) => {
              try {
                const parsed = JSON.parse(val);
                onChange({ ...config, inputValues: parsed });
              } catch (e) {
                onChange({ ...config, inputValues: val });
              }
            }}
            showFormatButton={true}
            showExpandButton={false}
            showHeader={true}
            title="Input Parameters (JSON)"
          />
        ) : (() => {
          const inputDefinitions = selectedWorkflow?.inputs || [];
          
          if (!config.workflowID) {
            return (
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded-sm text-center bg-background/20">
                Select a workflow above to configure its inputs.
              </p>
            );
          }
          
          if (inputDefinitions.length === 0) {
            return (
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded-sm text-center bg-background/20">
                This workflow has no inputs defined.
              </p>
            );
          }
          
          const normalizedInputDefs = inputDefinitions.map(inputDef => ({ ...inputDef, key: inputDef.key || inputDef.name }));

          return (
            <div className="rounded-sm border border-border/60 bg-background/30 p-2 shadow-sm">
              <InputValuesForm
                inputDefinitions={normalizedInputDefs}
                values={typeof config.inputValues === 'object' ? config.inputValues : {}}
                stateTree={LISTENER_EVENT_STATE_TREE}
                templateMode={MODES.SAFE_PATH}
                onChange={(key, val) => {
                  const currentMapping = typeof config.inputValues === 'object' ? config.inputValues : {};
                  const updated = { ...currentMapping };
                  if (val === undefined || val === null || val === "") {
                    delete updated[key];
                  } else {
                    updated[key] = val;
                  }
                  onChange({ ...config, inputValues: updated });
                }}
                className="space-y-2"
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const TriggerQueryConfig = ({ config, onChange, tenantID, renderModeToggle, isJsonMode, getJsonString }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    dataQueries = [],
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoadingDataQueries,
  } = useInfiniteDataQueries(tenantID, debouncedSearch);

  const selectedQueryID = config.dataQueryID;
  const { data: selectedQueryDetail } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID), "detail", selectedQueryID],
    queryFn: () => getDataQueryByIDAPI({ tenantID, dataQueryID: selectedQueryID }),
    enabled: Boolean(tenantID) && Boolean(selectedQueryID),
    refetchOnWindowFocus: false,
  });

  const selectedQuery = selectedQueryDetail || dataQueries.find(q => q.dataQueryID === selectedQueryID);

  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Select Data Query</Label>
        <SearchSelect
          value={config.dataQueryID || ""}
          onChange={(val) => {
            const selected = dataQueries.find(q => q.dataQueryID === val) || (selectedQueryDetail?.dataQueryID === val ? selectedQueryDetail : null);
            const defaultMapping = {};
            const inputDefinitions = selected?.dataQueryOptions?.inputDefinitions || selected?.dataQueryOptions?.options?.arguments || selected?.dataQueryOptions?.arguments || [];
            inputDefinitions.forEach(inputDef => {
              const key = inputDef.key || inputDef.name;
              if (key) defaultMapping[key] = `{{event.${key}}}`;
            });
            onChange({ ...config, dataQueryID: val, inputValues: defaultMapping });
          }}
          options={dataQueries.map(q => ({
            value: q.dataQueryID,
            label: q.dataQueryTitle
          }))}
          onSearchChange={setSearch}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoadingDataQueries}
          placeholder="Choose a data query..."
          selectedLabel={selectedQueryDetail?.dataQueryTitle}
        />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-end mb-1">
          <div>
            <Label className="text-xs text-muted-foreground">Argument Values</Label>
            {renderModeToggle()}
          </div>
          <span className="text-[10px] text-muted-foreground/60 mb-1">Supports {"{{event.property}}"} syntax</span>
        </div>
        
        {isJsonMode ? (
          <CodeEditor
            height={180}
            language="json"
            value={getJsonString(config.inputValues)}
            onChange={(val) => {
              try {
                const parsed = JSON.parse(val);
                onChange({ ...config, inputValues: parsed });
              } catch (e) {
                onChange({ ...config, inputValues: val });
              }
            }}
            showFormatButton={true}
            showExpandButton={false}
            showHeader={true}
            title="Query Arguments (JSON)"
          />
        ) : (() => {
          const inputDefinitions = selectedQuery?.dataQueryOptions?.inputDefinitions || selectedQuery?.dataQueryOptions?.options?.arguments || selectedQuery?.dataQueryOptions?.arguments || [];
          
          if (!config.dataQueryID) {
            return (
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded-sm text-center bg-background/20">
                Select a data query above to configure its arguments.
              </p>
            );
          }
          
          if (inputDefinitions.length === 0) {
            return (
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded-sm text-center bg-background/20">
                This query has no arguments defined.
              </p>
            );
          }
          
          const normalizedInputDefs = inputDefinitions.map(inputDef => ({ ...inputDef, key: inputDef.key || inputDef.name }));

          return (
            <div className="rounded-sm border border-border/60 bg-background/30 p-2 shadow-sm">
              <InputValuesForm
                inputDefinitions={normalizedInputDefs}
                values={typeof config.inputValues === 'object' ? config.inputValues : {}}
                stateTree={LISTENER_EVENT_STATE_TREE}
                templateMode={MODES.SAFE_PATH}
                onChange={(key, val) => {
                  const currentMapping = typeof config.inputValues === 'object' ? config.inputValues : {};
                  const updated = { ...currentMapping };
                  if (val === undefined || val === null || val === "") {
                    delete updated[key];
                  } else {
                    updated[key] = val;
                  }
                  onChange({ ...config, inputValues: updated });
                }}
                className="space-y-2"
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const PushToAppPageConfig = ({ config, onChange, tenantID, listenerID }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    appPages = [],
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoadingAppPages,
  } = useInfiniteAppPages(tenantID, debouncedSearch);

  const selectedAppPageID = config.appPageID;
  const { data: selectedAppPageDetail } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID), "detail", selectedAppPageID],
    queryFn: () => getAppPageByIDAPI({ tenantID, appPageID: selectedAppPageID }),
    enabled: Boolean(tenantID) && Boolean(selectedAppPageID),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Select App Page</Label>
        <SearchSelect
          value={config.appPageID || ""}
          onChange={(val) => onChange({ ...config, appPageID: val })}
          options={appPages.map(page => ({
            value: page.appPageID,
            label: `${page.appPageTitle} (${page.appPageID})`
          }))}
          onSearchChange={setSearch}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoadingAppPages}
          placeholder="Choose an app page..."
          selectedLabel={selectedAppPageDetail ? `${selectedAppPageDetail.appPageTitle} (${selectedAppPageDetail.appPageID})` : ""}
        />
        <p className="text-[10px] text-muted-foreground">The App Page to push data to.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Custom Channel Name (Optional)</Label>
          <Input
            value={config.channelName || ""}
            onChange={(e) => onChange({ ...config, channelName: e.target.value })}
            placeholder="Leave empty to use listener ID"
            className="font-mono text-sm bg-background"
          />
          <p className="text-[10px] text-muted-foreground">Defaults to `listener:${listenerID}`.</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Update Mode</Label>
          <Select value={config.mode || "replace"} onValueChange={(val) => onChange({ ...config, mode: val })}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="replace">Replace Data</SelectItem>
              <SelectItem value="append">Append to Array</SelectItem>
              <SelectItem value="prepend">Prepend to Array</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(config.mode === "append" || config.mode === "prepend") && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Max Array Length</Label>
            <Input
              type="number"
              value={config.maxArrayLength || 1000}
              onChange={(e) => onChange({ ...config, maxArrayLength: parseInt(e.target.value) || 1000 })}
              className="bg-background font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ActionConfigEditor = ({ type, config, onChange, tenantID, listenerID }) => {
  const [isJsonMode, setIsJsonMode] = useState(false);

  const getJsonString = (val) => {
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    if (!val) return "{\n  \n}";
    return val;
  };

  const renderModeToggle = () => (
    <div className="flex items-center gap-1 mt-1.5 bg-background/60 p-0.5 rounded-sm border border-border/40 w-fit">
      <span 
        className={`text-[10px] px-2.5 py-1 rounded-sm cursor-pointer transition-colors ${!isJsonMode ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-brand-border/30'}`} 
        onClick={() => setIsJsonMode(false)}
      >
        Form
      </span>
      <span 
        className={`text-[10px] px-2.5 py-1 rounded-sm cursor-pointer transition-colors ${isJsonMode ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-brand-border/30'}`} 
        onClick={() => setIsJsonMode(true)}
      >
        JSON
      </span>
    </div>
  );

  switch (type) {
    case "transform":
      return (
        <div className="space-y-2 animate-in fade-in duration-300">
          <CodeEditor
            height={220}
            language="javascript"
            value={config.script || ""}
            onChange={(val) => onChange({ ...config, script: val })}
            showFormatButton={true}
            showExpandButton={false}
            showHeader={true}
            title="Transform Script (JS)"
            stateTree={LISTENER_EVENT_STATE_TREE}
          />
          <p className="text-[10px] text-muted-foreground italic">
            Receives <code>event</code> in scope. Return the transformed event object, or return <code>null</code> / <code>undefined</code> to filter out (discard) the event.
          </p>
        </div>
      );
    case "trigger_workflow":
      return (
        <TriggerWorkflowConfig
          config={config}
          onChange={onChange}
          tenantID={tenantID}
          renderModeToggle={renderModeToggle}
          isJsonMode={isJsonMode}
          getJsonString={getJsonString}
        />
      );
    case "trigger_query":
      return (
        <TriggerQueryConfig
          config={config}
          onChange={onChange}
          tenantID={tenantID}
          renderModeToggle={renderModeToggle}
          isJsonMode={isJsonMode}
          getJsonString={getJsonString}
        />
      );
    case "save_to_buffer":
      return (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Buffer Name</Label>
            <Input
              value={config.bufferName || "default"}
              onChange={(e) => onChange({ ...config, bufferName: e.target.value })}
              className="bg-background font-medium"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Retention Policy</Label>
              <Select value={config.retentionPolicy || "count"} onValueChange={(val) => onChange({ ...config, retentionPolicy: val })}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Count Based (Max Events)</SelectItem>
                  <SelectItem value="time">Time Based (Max Age)</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(config.retentionPolicy === "count" || config.retentionPolicy === "both" || !config.retentionPolicy) && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Max Events to Keep</Label>
                <Input
                  type="number"
                  value={config.maxEvents || 1000}
                  onChange={(e) => onChange({ ...config, maxEvents: parseInt(e.target.value) })}
                  className="bg-background"
                />
              </div>
            )}
            {(config.retentionPolicy === "time" || config.retentionPolicy === "both") && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Max Age (Hours)</Label>
                <Input
                  type="number"
                  value={config.maxAgeHours || 24}
                  onChange={(e) => onChange({ ...config, maxAgeHours: parseInt(e.target.value) })}
                  className="bg-background"
                  placeholder="e.g. 24 for 1 day"
                />
              </div>
            )}
          </div>
        </div>
      );
    case "push_to_app_page":
      return (
        <PushToAppPageConfig
          config={config}
          onChange={onChange}
          tenantID={tenantID}
          listenerID={listenerID}
        />
      );
    default:
      return null;
  }
};

ListenerActionManager.propTypes = {
  tenantID: PropTypes.string.isRequired,
  listenerID: PropTypes.string.isRequired,
  actions: PropTypes.array,
};

ActionForm.propTypes = {
  action: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  tenantID: PropTypes.string.isRequired,
  listenerID: PropTypes.string.isRequired,
};

ActionConfigEditor.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  tenantID: PropTypes.string.isRequired,
  listenerID: PropTypes.string.isRequired,
};

