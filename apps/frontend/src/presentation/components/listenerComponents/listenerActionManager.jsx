import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createListenerActionAPI,
  updateListenerActionAPI,
  deleteListenerActionAPI,
} from "../../../data/apis/listener";
import { getAllWorkflowsAPI } from "../../../data/apis/workflow";
import { getAllDataQueriesAPI } from "../../../data/apis/dataQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
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
  InputArgsForm,
  CardFooter,
  CardTitle,
} from "@jet-admin/ui";
import { Zap, Search, Save, Smartphone, Plus, Trash2, Edit2, Play, CircleSlash, ArrowRight } from "lucide-react";
import PropTypes from "prop-types";
import { GitBranch, FileCode2, DatabaseZap, PanelTop } from "lucide-react";
const ACTION_TYPES = [
  { value: "trigger_workflow", label: "Trigger Workflow", icon: GitBranch, color: "text-primary", bg: "bg-muted", border: "border-border" },
  { value: "trigger_query", label: "Trigger Data Query", icon: FileCode2, color: "text-primary", bg: "bg-muted", border: "border-border" },
  { value: "save_to_buffer", label: "Save to Buffer", icon: DatabaseZap, color: "text-primary", bg: "bg-muted", border: "border-border" },
  { value: "push_to_widget", label: "Push to Widget", icon: PanelTop, color: "text-primary", bg: "bg-muted", border: "border-border" },
];

export const ListenerActionManager = ({ tenantID, listenerID, actions = [] }) => {
  const queryClient = useQueryClient();
  const [editingAction, setEditingAction] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data: workflows = [] } = useQuery({
    queryKey: ["WORKFLOWS", tenantID],
    queryFn: () => getAllWorkflowsAPI({ tenantID }),
  });

  const { data: dataQueries = [] } = useQuery({
    queryKey: ["DATA_QUERIES", tenantID],
    queryFn: () => getAllDataQueriesAPI({ tenantID }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries(["LISTENER_DETAIL", tenantID, listenerID]);
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
        workflows={workflows}
        dataQueries={dataQueries}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">Pipeline Actions</h3>
          <p className="text-xs text-muted-foreground mt-1">Actions execute sequentially when an event is received.</p>
        </div>
        {actions.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Action
          </Button>
        )}
      </div>

      {actions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-border/60 bg-background/20 py-16 text-center transition-colors hover:bg-background/40 hover:border-border">
          <div className="mb-4 rounded-full bg-brand-border/40 p-4 ring-1 ring-border shadow-inner">
            <Play className="h-6 w-6 text-muted-foreground/80 pl-1" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">No actions configured</h4>
          <p className="mt-2 text-xs text-muted-foreground max-w-sm">
            Add your first action to start processing, transforming, and routing incoming data events.
          </p>
          <Button size="sm" variant="secondary" className="mt-6" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Configure Action
          </Button>
        </Card>
      ) : (
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
          {actions.map((action, index) => {
            const typeConfig = ACTION_TYPES.find(t => t.value === action.actionType);
            const Icon = typeConfig?.icon || Zap;
            
            return (
              <div key={action.actionID} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Timeline Node */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-brand-dark bg-brand-border/80 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ring-1 ring-border/20 transition-all group-hover:ring-brand-green/30 group-hover:border-brand-dark/90">
                  <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground">{index + 1}</span>
                </div>

                {/* Card Content */}
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
                          {Object.keys(action.actionConfig).length > 0 ? (
                            <span className="flex items-center gap-1.5">
                              {Object.entries(action.actionConfig).slice(0, 2).map(([k, v]) => (
                                <React.Fragment key={k}>
                                  <span className="text-muted-foreground">{k}:</span>
                                  <span className="text-foreground truncate">{typeof v === 'object' ? '{...}' : String(v)}</span>
                                </React.Fragment>
                              ))}
                            </span>
                          ) : (
                            "No configuration"
                          )}
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
                             if (confirm("Are you sure you want to delete this action?")) {
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

const ActionForm = ({ action, onSave, onCancel, isSaving, workflows, dataQueries }) => {
  const [formData, setFormData] = useState(
    action || {
      actionType: "trigger_workflow",
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
      <div className="border-b rounded-t-md border-border/50 bg-background p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">

          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {action ? "Edit Pipeline Action" : "Add Pipeline Action"}
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ACTION_TYPES.map((t) => {
                const isSelected = formData.actionType === t.value;
                const Icon = t.icon;
                return (
                  <div
                    key={t.value}
                    onClick={() => setFormData({ ...formData, actionType: t.value, actionConfig: {} })}
                    className={`cursor-pointer rounded-sm border p-4 transition-all duration-200 ${
                      isSelected 
                        ? `border-${t.color.split('-')[1]}-500/50 ${t.bg} shadow-sm ring-1 ring-${t.color.split('-')[1]}-500/20` 
                      : "border-border/50 bg-background/40 hover:border-border hover:bg-brand-border/20"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-3 ${isSelected ? t.color : "text-muted-foreground"}`} />
                    <div className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {t.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-sm border border-border/50 bg-background/40 p-5">
            <div className="flex items-center gap-2 mb-4">
              <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
              <h4 className="text-sm font-medium text-foreground">Configuration Details</h4>
            </div>
            <ActionConfigEditor
              type={formData.actionType}
              config={formData.actionConfig}
              onChange={(config) => setFormData({ ...formData, actionConfig: config })}
              workflows={workflows}
              dataQueries={dataQueries}
            />
          </div>

          <div className="flex items-center justify-between rounded-sm border border-border/50 bg-background/40 p-4">
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
            {action ? "Save Changes" : "Create Action"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

const ActionConfigEditor = ({ type, config, onChange, workflows = [], dataQueries = [] }) => {
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
    case "trigger_workflow":
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
           <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Select Workflow</Label>
            <Select 
              value={config.workflowID || ""} 
              onValueChange={(val) => {
                const selected = workflows.find(w => w.workflowID === val);
                const defaultMapping = {};
                if (selected && selected.inputs) {
                  selected.inputs.forEach(input => {
                    const key = input.key || input.name;
                    if (key) defaultMapping[key] = `{{event.${key}}}`;
                  });
                }
                onChange({ ...config, workflowID: val, inputMapping: defaultMapping });
              }}
            >
              <SelectTrigger className="font-mono text-sm bg-background">
                <SelectValue placeholder="Choose a workflow..." />
              </SelectTrigger>
              <SelectContent>
                {workflows.map(w => (
                  <SelectItem key={w.workflowID} value={w.workflowID}>{w.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <div>
                <Label className="text-xs text-muted-foreground">Input Mapping</Label>
                {renderModeToggle()}
              </div>
              <span className="text-[10px] text-muted-foreground/60 mb-1">Supports {"{{event.property}}"} syntax</span>
            </div>
            
            {isJsonMode ? (
              <div className="rounded-sm border border-border/60 overflow-hidden ring-1 ring-black/5 shadow-sm">
                <CodeEditor
                  height={180}
                  language="json"
                  value={getJsonString(config.inputMapping)}
                  onChange={(val) => {
                    try {
                      const parsed = JSON.parse(val);
                      onChange({ ...config, inputMapping: parsed });
                    } catch (e) {
                      onChange({ ...config, inputMapping: val });
                    }
                  }}
                  showFormatButton={true}
                  showExpandButton={false}
                  showHeader={true}
                  title="Input Parameters (JSON)"
                />
              </div>
            ) : (() => {
              const selected = workflows.find(w => w.workflowID === config.workflowID);
              const args = selected?.inputs || [];
              
              if (!config.workflowID) {
                return (
                  <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-4 rounded-sm text-center bg-background/20">
                    Select a workflow above to configure its inputs.
                  </p>
                );
              }
              
              if (args.length === 0) {
                return (
                  <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-4 rounded-sm text-center bg-background/20">
                    This workflow has no input arguments defined.
                  </p>
                );
              }

              // Normalizing arg schema if necessary
              const normalizedArgs = args.map(arg => ({ ...arg, key: arg.key || arg.name }));

              return (
                <div className="rounded-sm border border-border/60 bg-background/30 p-4 shadow-sm">
                  <InputArgsForm
                    args={normalizedArgs}
                    values={typeof config.inputMapping === 'object' ? config.inputMapping : {}}
                    onChange={(key, val) => {
                      const currentMapping = typeof config.inputMapping === 'object' ? config.inputMapping : {};
                      const updated = { ...currentMapping };
                      if (val === undefined || val === null || val === "") {
                        delete updated[key];
                      } else {
                        updated[key] = val;
                      }
                      onChange({ ...config, inputMapping: updated });
                    }}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      );
    case "trigger_query":
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Select Data Query</Label>
            <Select 
              value={config.dataQueryID || ""} 
              onValueChange={(val) => {
                const selected = dataQueries.find(q => q.dataQueryID === val);
                const defaultMapping = {};
                const args = selected?.dataQueryOptions?.options?.arguments || selected?.dataQueryOptions?.arguments || [];
                args.forEach(arg => {
                  const key = arg.key || arg.name;
                  if (key) defaultMapping[key] = `{{event.${key}}}`;
                });
                onChange({ ...config, dataQueryID: val, argMapping: defaultMapping });
              }}
            >
              <SelectTrigger className="font-mono text-sm bg-background">
                <SelectValue placeholder="Choose a data query..." />
              </SelectTrigger>
              <SelectContent>
                {dataQueries.map(q => (
                  <SelectItem key={q.dataQueryID} value={q.dataQueryID}>{q.dataQueryTitle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <div>
                <Label className="text-xs text-muted-foreground">Argument Mapping</Label>
                {renderModeToggle()}
              </div>
              <span className="text-[10px] text-muted-foreground/60 mb-1">Supports {"{{event.property}}"} syntax</span>
            </div>
            
            {isJsonMode ? (
              <div className="rounded-sm border border-border/60 overflow-hidden ring-1 ring-black/5 shadow-sm">
                <CodeEditor
                  height={180}
                  language="json"
                  value={getJsonString(config.argMapping)}
                  onChange={(val) => {
                    try {
                      const parsed = JSON.parse(val);
                      onChange({ ...config, argMapping: parsed });
                    } catch (e) {
                      onChange({ ...config, argMapping: val });
                    }
                  }}
                  showFormatButton={true}
                  showExpandButton={false}
                  showHeader={true}
                  title="Query Arguments (JSON)"
                />
              </div>
            ) : (() => {
              const selected = dataQueries.find(q => q.dataQueryID === config.dataQueryID);
              const args = selected?.dataQueryOptions?.options?.arguments || selected?.dataQueryOptions?.arguments || [];
              
              if (!config.dataQueryID) {
                return (
                  <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-4 rounded-sm text-center bg-background/20">
                    Select a data query above to configure its arguments.
                  </p>
                );
              }
              
              if (args.length === 0) {
                return (
                  <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-4 rounded-sm text-center bg-background/20">
                    This query has no arguments defined.
                  </p>
                );
              }

              // Normalizing arg schema if necessary
              const normalizedArgs = args.map(arg => ({ ...arg, key: arg.key || arg.name }));

              return (
                <div className="rounded-sm border border-border/60 bg-background/30 p-4 shadow-sm">
                  <InputArgsForm
                    args={normalizedArgs}
                    values={typeof config.argMapping === 'object' ? config.argMapping : {}}
                    onChange={(key, val) => {
                      const currentMapping = typeof config.argMapping === 'object' ? config.argMapping : {};
                      const updated = { ...currentMapping };
                      if (val === undefined || val === null || val === "") {
                        delete updated[key];
                      } else {
                        updated[key] = val;
                      }
                      onChange({ ...config, argMapping: updated });
                    }}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      );
    case "save_to_buffer":
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Buffer Name</Label>
            <Input
              value={config.bufferName || "default"}
              onChange={(e) => onChange({ ...config, bufferName: e.target.value })}
              className="bg-background font-medium"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
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
    case "push_to_widget":
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Target Widget ID</Label>
              <Input
                value={config.widgetID || ""}
                onChange={(e) => onChange({ ...config, widgetID: e.target.value })}
                placeholder="Leave empty to broadcast to all"
                className="font-mono text-sm bg-background"
              />
              <p className="text-[10px] text-muted-foreground">If empty, broadcasts on listener channel.</p>
            </div>
            <div className="space-y-2">
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
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Data Path</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1.5 rounded-sm border border-border/50">event.</span>
              <Input
                value={config.dataPath || ""}
                onChange={(e) => onChange({ ...config, dataPath: e.target.value })}
                placeholder="e.g. payload.items (Optional)"
                className="font-mono text-sm bg-background"
              />
            </div>
          </div>
        </div>
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
  isSaving: PropTypes.boolean,
};

ActionConfigEditor.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

