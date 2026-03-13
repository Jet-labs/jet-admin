import React, { useMemo } from "react";
import { FaPlay } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useWidgetsState } from "../../../logic/contexts/widgetsContext";

import PropTypes from "prop-types";
import { WorkflowConsole } from "../workflowComponents/workflowConsole";
import { VscTerminal } from "react-icons/vsc";

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";

import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@jet-admin/ui";
// import './widgetEditor.css';

export const WidgetConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  workflowLogs,
  isRunningWorkflow,
  initialWorkflowID,
  initialWorkflowTitle,
  onTestWorkflow,
  onClearLogs,
}) => {
  WidgetConfigEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
    workflowContext: PropTypes.object,
    workflowLogs: PropTypes.array,
    isRunningWorkflow: PropTypes.bool,
    initialWorkflowID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    initialWorkflowTitle: PropTypes.string,
    onTestWorkflow: PropTypes.func,
    onClearLogs: PropTypes.func,
  };

  const { workflows, isLoadingWorkflows } = useWidgetsState();

  const widgetType = widgetEditorForm.values.widgetType;
  const ConfigEditorComponent = WIDGETS_MAP[widgetType]?.configEditor;

  // Get selected workflow details
  const selectedWorkflow = useMemo(() => {
    const workflowID = widgetEditorForm.values.workflowID;
    if (workflowID == null || !workflows?.length) return null;
    return workflows.find(w => String(w.workflowID) === String(workflowID));
  }, [widgetEditorForm.values.workflowID, workflows]);

  const workflowValue = widgetEditorForm.values.workflowID != null
    ? String(widgetEditorForm.values.workflowID)
    : "";
  const selectedWorkflowTitle = selectedWorkflow?.title
    || (workflowValue && String(initialWorkflowID) === workflowValue ? initialWorkflowTitle : undefined);
  const workflowSelectKey = `workflow-select_${isLoadingWorkflows ? 'loading' : 'ready'}_${workflows?.length || 0}_${workflowValue || 'empty'}`;

  // Handle workflow change — clear parent context
  const handleWorkflowChange = (value) => {
    widgetEditorForm.setFieldValue('workflowID', value);
    widgetEditorForm.setFieldValue('workflowConfig.workflowArgValues', {});
    if (onClearLogs) onClearLogs();
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-hidden">
      <div className="space-y-1.5">
        <Label
          htmlFor="widgetTitle"
          className="text-xs font-medium text-foreground"
        >
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="widgetTitle"
          id="widgetTitle"
          className="text-sm"
          placeholder={CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_PLACEHOLDER}
          required={true}
          onChange={widgetEditorForm.handleChange}
          onBlur={widgetEditorForm.handleBlur}
          value={widgetEditorForm.values.widgetTitle}
        />
      </div>

      {/* Row 2: Workflow selector — inline label + select */}
      <div className="space-y-1.5">
        <Label
          htmlFor="workflowID"
          className="text-xs font-medium text-foreground"
        >
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_WORKFLOW_LABEL}
        </Label>
        <Select
          key={workflowSelectKey}
          value={workflowValue}
          disabled={isLoadingWorkflows && !workflows?.length}
          onValueChange={handleWorkflowChange}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder={isLoadingWorkflows ? "Loading workflows..." : "Select an option"}>
              {selectedWorkflowTitle}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {workflows?.map((workflow) => (
            <SelectItem key={workflow.workflowID} value={String(workflow.workflowID)}>
              {workflow.title}
            </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Auto-run toggle — minimal inline */}
      {selectedWorkflow && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="workflowAutoRun"
            checked={
              widgetEditorForm.values.workflowConfig?.workflowAutoRun
              ?? WIDGETS_MAP[widgetType]?.defaultAutoRun
              ?? false
            }
            onCheckedChange={(checked) =>
              widgetEditorForm.setFieldValue('workflowConfig.workflowAutoRun', !!checked)
            }
          />
          <Label htmlFor="workflowAutoRun" className="text-xs text-muted-foreground cursor-pointer">
            Auto-run workflow on load
          </Label>
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="workflowConfig.workflowAutoRun"
          className="text-xs font-medium text-foreground"
        >
          Select widget type
        </Label>
        <Select value={widgetType} onValueChange={(val) => widgetEditorForm.setFieldValue('widgetType', val)}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(WIDGETS_MAP).map((widget) => (
              <SelectItem key={widget.value} value={widget.value}>
                {widget.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 4: Test Workflow + Settings buttons */}
      {selectedWorkflow && onTestWorkflow && <div className="flex flex-row justify-start items-center gap-2">

          <Button
            type="button"
            size="sm"
            onClick={onTestWorkflow}
            disabled={isRunningWorkflow}
            className="text-xs"
          >
            {isRunningWorkflow ? (
              <Spinner size={12} className="mr-2" />
            ) : (
              <FaPlay className="inline-block h-3 w-3 mr-2" />
            )}
            {isRunningWorkflow ? CONSTANTS.STRINGS.TEST_WORKFLOW_BUTTON_RUNNING : CONSTANTS.STRINGS.TEST_WORKFLOW_BUTTON}
          </Button>


      </div>
      }

      {/* ═══════════════════════════════════════════
          SECTION 2: MAIN BODY — Type-Specific Config Editor
          ═══════════════════════════════════════════ */}
      {ConfigEditorComponent && (
        <ConfigEditorComponent
          widgetEditorForm={widgetEditorForm}
          workflowContext={workflowContext}
          workflows={workflows}
          selectedWorkflow={selectedWorkflow}
        />
      )}

      {/* ═══════════════════════════════════════════
          SECTION 3: WORKFLOW TERMINAL (docked footer)
          ═══════════════════════════════════════════ */}
      {selectedWorkflow && ((workflowLogs && workflowLogs.length > 0) || workflowContext) && (
        <div
          className="relative z-20 mt-4 flex shrink-0 flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm"
          style={{ maxHeight: '35vh' }}
        >
          {/* Terminal header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <VscTerminal className="h-4 w-4 text-muted-foreground" /> Workflow Terminal
            </span>
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[10px] font-medium" 
              onClick={onClearLogs}
            >
              Clear
            </Button>
          </div>
          
          {/* Terminal body */}
          <div className="flex-1 overflow-auto flex flex-col">
            <WorkflowConsole
              logs={workflowLogs || []}
              isRunning={isRunningWorkflow}
              onClear={onClearLogs}
              className="flex-1 rounded-none border-none shadow-none"
            />
            {workflowContext && (
              <div className="shrink-0 border-t border-border bg-muted p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground">Workflow Context (ctx)</span>
                  <span className="text-[10px] text-muted-foreground">Use these paths in your Vega spec</span>
                </div>
                <pre className="max-h-32 overflow-auto rounded border border-border bg-background p-2 font-mono text-[10px] text-muted-foreground shadow-inner">
                  {JSON.stringify(workflowContext, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
