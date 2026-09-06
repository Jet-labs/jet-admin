import React, { useState } from "react";
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
  SearchSelect,
  Badge,
  JsonViewer,
} from "@jet-admin/ui";
import { MODES } from "@jet-admin/expression-engine";
import { Zap, Plus, Trash2, Edit2, Play, CircleSlash, Wand2, ChevronUp, ChevronDown, ChevronRight, Code2, ListTree } from "lucide-react";
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
  { value: "transform", label: "Transform Event", description: "Run JS over the event, filter or reshape it", icon: Wand2, iconClass: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { value: "trigger_workflow", label: "Trigger Workflow", description: "Start a workflow with event data", icon: GitBranch, iconClass: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "trigger_query", label: "Trigger Data Query", description: "Run a data query with event data", icon: FileCode2, iconClass: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "save_to_buffer", label: "Save to Buffer", description: "Persist events for replay / history", icon: DatabaseZap, iconClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "push_to_app_page", label: "Push to App Page", description: "Push live data to an app page", icon: PanelTop, iconClass: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
];

const getActionTypeConfig = (actionType) =>
  ACTION_TYPES.find((t) => t.value === actionType);

export const ListenerActionManager = ({ tenantID, listenerID, actions = [] }) => {
  const queryClient = useQueryClient();
  const [editingAction, setEditingAction] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedConfigs, setExpandedConfigs] = useState({});
  const [reorderingID, setReorderingID] = useState(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID), listenerID] });
  };

  const toggleExpanded = (actionID) =>
    setExpandedConfigs((prev) => ({ ...prev, [actionID]: !prev[actionID] }));



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

  const handleMove = async (action, direction) => {
    const sorted = [...actions].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const idx = sorted.findIndex((a) => a.actionID === action.actionID);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    setReorderingID(action.actionID);
    try {
      // Swap orderIndex values so execution order follows the visual order.
      await updateListenerActionAPI({
        tenantID,
        listenerID,
        actionID: action.actionID,
        actionData: { ...action, orderIndex: other.orderIndex ?? swapIdx },
      });
      await updateListenerActionAPI({
        tenantID,
        listenerID,
        actionID: other.actionID,
        actionData: { ...other, orderIndex: action.orderIndex ?? idx },
      });
      invalidate();
    } catch (err) {
      displayError(err);
    } finally {
      setReorderingID(null);
    }
  };

  const allActions = [...actions].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const nextOrderIndex = allActions.length > 0
    ? Math.max(...allActions.map((a) => a.orderIndex ?? 0)) + 1
    : 0;

  if (isAdding || editingAction) {
    return (
      <ActionForm
        action={editingAction}
        nextOrderIndex={nextOrderIndex}
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Pipeline Steps</h3>
          <Badge variant="secondary" className="text-xs font-medium">
            {allActions.length}
          </Badge>
        </div>
        {allActions.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Steps run in order, top to bottom, on every incoming event. Disabled steps are skipped.
      </p>

      {allActions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed py-10 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <ListTree className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">No pipeline steps yet</h4>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Transform the event, trigger workflows or queries, buffer it, or push it to an app page.
          </p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first step
          </Button>
        </Card>
      ) : (
        <ol className="space-y-2">
          {allActions.map((action, index) => (
            <PipelineStepCard
              key={action.actionID}
              action={action}
              index={index}
              isFirst={index === 0}
              isLast={index === allActions.length - 1}
              isExpanded={Boolean(expandedConfigs[action.actionID])}
              isReordering={reorderingID === action.actionID}
              tenantID={tenantID}
              listenerID={listenerID}
              onToggleExpand={() => toggleExpanded(action.actionID)}
              onEdit={() => setEditingAction(action)}
              onDelete={() => {
                if (window.confirm(`Delete step ${index + 1}? This cannot be undone.`)) {
                  deleteAction(action.actionID);
                }
              }}
              onToggleEnable={() => handleToggleEnable(action)}
              onMoveUp={() => handleMove(action, "up")}
              onMoveDown={() => handleMove(action, "down")}
            />
          ))}
        </ol>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Pipeline step presentation                                          */
/* ------------------------------------------------------------------ */

const DetailRow = ({ label, children }) => (
  <div className="grid grid-cols-[110px_1fr] items-start gap-2 py-1 text-xs">
    <dt className="shrink-0 pt-px text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words text-foreground">{children}</dd>
  </div>
);

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const MonoID = ({ children }) => (
  <code className="break-all rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]" title={String(children ?? "")}>
    {children}
  </code>
);

MonoID.propTypes = { children: PropTypes.node };

const WorkflowRef = ({ tenantID, workflowID }) => {
  const { data, isLoading } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), "detail", workflowID],
    queryFn: () => getWorkflowByIDAPI({ tenantID, workflowID }),
    enabled: Boolean(tenantID) && Boolean(workflowID),
    refetchOnWindowFocus: false,
  });
  if (!workflowID) return <span className="text-muted-foreground">—</span>;
  if (isLoading) return <span className="text-muted-foreground">Loading…</span>;
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="truncate font-medium">{data?.title || data?.workflowTitle || workflowID}</span>
      <MonoID>{workflowID}</MonoID>
    </span>
  );
};

WorkflowRef.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  workflowID: PropTypes.string,
};

const DataQueryRef = ({ tenantID, dataQueryID }) => {
  const { data, isLoading } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID), "detail", dataQueryID],
    queryFn: () => getDataQueryByIDAPI({ tenantID, dataQueryID }),
    enabled: Boolean(tenantID) && Boolean(dataQueryID),
    refetchOnWindowFocus: false,
  });
  if (!dataQueryID) return <span className="text-muted-foreground">—</span>;
  if (isLoading) return <span className="text-muted-foreground">Loading…</span>;
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="truncate font-medium">{data?.dataQueryTitle || data?.title || dataQueryID}</span>
      <MonoID>{dataQueryID}</MonoID>
    </span>
  );
};

DataQueryRef.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  dataQueryID: PropTypes.string,
};

const AppPageRef = ({ tenantID, appPageID }) => {
  const { data, isLoading } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID), "detail", appPageID],
    queryFn: () => getAppPageByIDAPI({ tenantID, appPageID }),
    enabled: Boolean(tenantID) && Boolean(appPageID),
    refetchOnWindowFocus: false,
  });
  if (!appPageID) return <span className="text-muted-foreground">—</span>;
  if (isLoading) return <span className="text-muted-foreground">Loading…</span>;
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="truncate font-medium">{data?.appPageTitle || data?.title || appPageID}</span>
      <MonoID>{appPageID}</MonoID>
    </span>
  );
};

AppPageRef.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const MappingPreview = ({ mapping }) => {
  const entries = mapping && typeof mapping === "object" ? Object.entries(mapping) : [];
  if (entries.length === 0) {
    return <span className="text-muted-foreground">No mappings</span>;
  }
  return (
    <ul className="space-y-1">
      {entries.map(([key, value]) => (
        <li key={key} className="flex min-w-0 items-start gap-2 font-mono text-[11px]">
          <span className="shrink-0 font-semibold text-foreground">{key}:</span>
          <span className="min-w-0 break-all text-muted-foreground" title={typeof value === "object" ? JSON.stringify(value) : String(value)}>
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
        </li>
      ))}
    </ul>
  );
};

MappingPreview.propTypes = { mapping: PropTypes.object };

const StepDetails = ({ action, tenantID, listenerID }) => {
  const config = action.actionConfig || {};

  switch (action.actionType) {
    case "transform": {
      const script = config.script || "";
      if (!script.trim()) {
        return <p className="text-xs italic text-muted-foreground">No script — event passes through unchanged.</p>;
      }
      const lineCount = script.split("\n").length;
      return (
        <div className="space-y-1.5">
          <DetailRow label="Script">
            <span className="text-muted-foreground">{lineCount} line{lineCount === 1 ? "" : "s"}</span>
          </DetailRow>
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-border/60 bg-muted/40 p-2 font-mono text-[11px] leading-relaxed text-foreground">
            {script}
          </pre>
          <p className="text-[11px] italic text-muted-foreground">
            Return the transformed event. Return <code>null</code> to discard it.
          </p>
        </div>
      );
    }
    case "trigger_workflow": {
      if (!config.workflowID) return <p className="text-xs italic text-muted-foreground">No workflow selected.</p>;
      const inputValues = typeof config.inputValues === "object" ? config.inputValues : {};
      const inputCount = Object.keys(inputValues || {}).length;
      return (
        <dl className="divide-y divide-border/40">
          <DetailRow label="Workflow">
            <WorkflowRef tenantID={tenantID} workflowID={config.workflowID} />
          </DetailRow>
          <DetailRow label={`Inputs (${inputCount})`}>
            <MappingPreview mapping={inputValues} />
          </DetailRow>
        </dl>
      );
    }
    case "trigger_query": {
      if (!config.dataQueryID) return <p className="text-xs italic text-muted-foreground">No data query selected.</p>;
      const inputValues = typeof config.inputValues === "object" ? config.inputValues : {};
      const argCount = Object.keys(inputValues || {}).length;
      return (
        <dl className="divide-y divide-border/40">
          <DetailRow label="Data query">
            <DataQueryRef tenantID={tenantID} dataQueryID={config.dataQueryID} />
          </DetailRow>
          <DetailRow label={`Arguments (${argCount})`}>
            <MappingPreview mapping={inputValues} />
          </DetailRow>
        </dl>
      );
    }
    case "save_to_buffer": {
      return (
        <dl className="divide-y divide-border/40">
          <DetailRow label="Buffer">
            <span className="font-medium">{config.bufferName || "default"}</span>
          </DetailRow>
          <DetailRow label="Retention">
            {config.retentionPolicy === "time"
              ? `Time based — keep ${config.maxAgeHours ?? 24}h`
              : config.retentionPolicy === "both"
                ? `Count + time — ${config.maxEvents ?? 1000} events / ${config.maxAgeHours ?? 24}h`
                : `Count based — keep ${config.maxEvents ?? 1000} events`}
          </DetailRow>
        </dl>
      );
    }
    case "push_to_app_page": {
      if (!config.appPageID) return <p className="text-xs italic text-muted-foreground">No app page selected.</p>;
      return (
        <dl className="divide-y divide-border/40">
          <DetailRow label="App page">
            <AppPageRef tenantID={tenantID} appPageID={config.appPageID} />
          </DetailRow>
          <DetailRow label="Channel">
            <MonoID>{config.channelName || `listener:${listenerID}`}</MonoID>
          </DetailRow>
          <DetailRow label="Update mode">
            <span className="capitalize">{config.mode || "replace"}</span>
            {(config.mode === "append" || config.mode === "prepend") && (
              <span className="text-muted-foreground"> · max {config.maxArrayLength ?? 1000}</span>
            )}
          </DetailRow>
        </dl>
      );
    }
    default: {
      if (Object.keys(config).length === 0) {
        return <p className="text-xs italic text-muted-foreground">No configuration.</p>;
      }
      return <MappingPreview mapping={config} />;
    }
  }
};

StepDetails.propTypes = {
  action: PropTypes.object.isRequired,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  listenerID: PropTypes.string.isRequired,
};

const PipelineStepCard = ({
  action,
  index,
  isFirst,
  isLast,
  isExpanded,
  isReordering,
  tenantID,
  listenerID,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleEnable,
  onMoveUp,
  onMoveDown,
}) => {
  const typeConfig = getActionTypeConfig(action.actionType);
  const Icon = typeConfig?.icon || Zap;

  return (
    <li className="relative flex gap-3">
      {/* Step number rail */}
      <div className="flex w-7 shrink-0 flex-col items-center" aria-hidden="true">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
            action.isEnabled
              ? "border-border bg-muted text-foreground"
              : "border-dashed border-border bg-background text-muted-foreground"
          }`}
        >
          {index + 1}
        </span>
        {!isLast && <span className="w-px flex-1 bg-border/70" />}
      </div>

      <Card className={`min-w-0 flex-1 p-3 ${!action.isEnabled ? "opacity-70" : ""}`}>
        {/* Header — always-visible controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${typeConfig?.iconClass || "border-border bg-muted text-muted-foreground"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {typeConfig?.label || action.actionType}
              </span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                Step {index + 1}
              </Badge>
              {action.isEnabled ? (
                <Badge variant="success" className="px-1.5 py-0 text-[11px]">
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-1.5 py-0 text-[11px] text-muted-foreground">
                  <CircleSlash className="mr-1 h-3 w-3" />
                  Disabled
                </Badge>
              )}
            </div>
            {typeConfig?.description && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{typeConfig.description}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Move up"
              disabled={isFirst || isReordering}
              onClick={onMoveUp}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Move down"
              disabled={isLast || isReordering}
              onClick={onMoveDown}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <span className="mx-1 h-4 w-px bg-border/70" />
            <Switch
              checked={Boolean(action.isEnabled)}
              onCheckedChange={onToggleEnable}
              title={action.isEnabled ? "Disable step" : "Enable step"}
              className="scale-90"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit step" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete step"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Details — full config, not truncated */}
        <div className="mt-2 rounded-md border border-border/50 bg-background/40 p-2.5">
          <StepDetails action={action} tenantID={tenantID} listenerID={listenerID} />
        </div>

        {/* Full JSON — collapsed by default */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          <Code2 className="h-3 w-3" />
          {isExpanded ? "Hide full config" : "Show full config"}
        </button>
        {isExpanded && (
          <div className="mt-1.5 rounded-md border border-border/50 bg-muted/20 p-2">
            <JsonViewer data={action.actionConfig || {}} />
          </div>
        )}
      </Card>
    </li>
  );
};

PipelineStepCard.propTypes = {
  action: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isReordering: PropTypes.bool.isRequired,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  listenerID: PropTypes.string.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleEnable: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
};

const ActionForm = ({ action, nextOrderIndex = 0, onSave, onCancel, isSaving, tenantID, listenerID }) => {
  const [formData, setFormData] = useState(
    action || {
      actionType: "transform",
      actionConfig: {},
      isEnabled: true,
      orderIndex: nextOrderIndex,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // This form is rendered inside the listener update page's outer <form>;
    // submit events bubble through React's tree, so without stopPropagation
    // saving a step would also trigger the outer Formik submit.
    e.stopPropagation();
    onSave(formData);
  };

  const selectedType = getActionTypeConfig(formData.actionType);
  const SelectedIcon = selectedType?.icon || Zap;

  return (
    <Card className="">
      <div className="border-b rounded-t-md border-border/50 bg-background p-3 flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${selectedType?.iconClass || "border-border bg-muted text-muted-foreground"}`}>
          <SelectedIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {action ? `Edit Step — ${selectedType?.label || formData.actionType}` : "Add Pipeline Step"}
          </h3>
          {selectedType?.description && (
            <p className="truncate text-[11px] text-muted-foreground">{selectedType.description}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3 space-y-3">
        <div className="space-y-3">
          <div className="space-y-1.5">
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
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{t.label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border/50 bg-background/40 p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <SelectedIcon className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">{selectedType?.label || "Configuration"}</h4>
            </div>
             <ActionConfigEditor
              type={formData.actionType}
              config={formData.actionConfig}
              onChange={(config) => setFormData({ ...formData, actionConfig: config })}
              tenantID={tenantID}
              listenerID={listenerID}
            />
          </div>

          <div className="flex items-center justify-between rounded border border-border/50 bg-background/40 p-2">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded ${formData.isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
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
          <span className="text-xs text-muted-foreground/60 mb-1">Supports {"{{event.property}}"} syntax</span>
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
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded text-center bg-background/20">
                Select a workflow above to configure its inputs.
              </p>
            );
          }
          
          if (inputDefinitions.length === 0) {
            return (
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded text-center bg-background/20">
                This workflow has no inputs defined.
              </p>
            );
          }
          
          const normalizedInputDefs = inputDefinitions.map(inputDef => ({ ...inputDef, key: inputDef.key || inputDef.name }));

          return (
            <div className="rounded border border-border/60 bg-background/30 p-2 shadow-sm">
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
          <span className="text-xs text-muted-foreground/60 mb-1">Supports {"{{event.property}}"} syntax</span>
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
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded text-center bg-background/20">
                Select a data query above to configure its arguments.
              </p>
            );
          }
          
          if (inputDefinitions.length === 0) {
            return (
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 p-2 rounded text-center bg-background/20">
                This query has no arguments defined.
              </p>
            );
          }
          
          const normalizedInputDefs = inputDefinitions.map(inputDef => ({ ...inputDef, key: inputDef.key || inputDef.name }));

          return (
            <div className="rounded border border-border/60 bg-background/30 p-2 shadow-sm">
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
        <p className="text-xs text-muted-foreground">The App Page to push data to.</p>
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
          <p className="text-xs text-muted-foreground">Defaults to `listener:${listenerID}`.</p>
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
    <div className="flex items-center gap-1 mt-1.5 bg-background/60 p-0.5 rounded border border-border/40 w-fit">
      <span 
        className={`text-xs px-2.5 py-1 rounded cursor-pointer transition-colors ${!isJsonMode ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-brand-border/30'}`} 
        onClick={() => setIsJsonMode(false)}
      >
        Form
      </span>
      <span 
        className={`text-xs px-2.5 py-1 rounded cursor-pointer transition-colors ${isJsonMode ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-brand-border/30'}`} 
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
          <p className="text-xs text-muted-foreground italic">
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
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  listenerID: PropTypes.string.isRequired,
  actions: PropTypes.array,
};

ActionForm.propTypes = {
  action: PropTypes.object,
  nextOrderIndex: PropTypes.number,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  listenerID: PropTypes.string.isRequired,
};

ActionConfigEditor.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  tenantID: PropTypes.string.isRequired,
  listenerID: PropTypes.string.isRequired,
};

