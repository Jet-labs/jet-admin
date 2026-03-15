import React, { useMemo } from "react";
import { FaPlay } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useWidgetsState } from "../../../logic/contexts/widgetsContext";

import PropTypes from "prop-types";
import { WorkflowConsole } from "../workflowComponents/workflowConsole";
import { VscTerminal } from "react-icons/vsc";

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { WidgetAdvancedOptions } from "./widgetAdvancedOptions";
import { TbBraces } from "react-icons/tb";

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
  showConsole,
  setShowConsole,
  showContextPanel,
  setShowContextPanel,
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
    showConsole: PropTypes.bool,
    setShowConsole: PropTypes.func,
    showContextPanel: PropTypes.bool,
    setShowContextPanel: PropTypes.func,
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
    <div className="flex h-full w-full flex-col gap-3">
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

      {/* Show Header toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="showHeader"
          checked={widgetEditorForm.values.widgetConfig?.showHeader ?? true}
          onCheckedChange={(checked) =>
            widgetEditorForm.setFieldValue('widgetConfig.showHeader', !!checked)
          }
        />
        <Label htmlFor="showHeader" className="text-xs text-muted-foreground cursor-pointer">
          Show widget header (with refresh button)
        </Label>
      </div>

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
      {selectedWorkflow && onTestWorkflow && <div className="flex flex-row justify-between items-center gap-2">

          <Button
            type="button"
            size="sm"
            onClick={onTestWorkflow}
            disabled={isRunningWorkflow}
          className="text-xs w-full"
          >
            {isRunningWorkflow ? (
              <Spinner size={12} className="mr-2" />
            ) : (
              <FaPlay className="inline-block h-3 w-3 mr-2" />
            )}
            {isRunningWorkflow ? CONSTANTS.STRINGS.TEST_WORKFLOW_BUTTON_RUNNING : CONSTANTS.STRINGS.TEST_WORKFLOW_BUTTON}
          </Button>

        <div className="flex flex-row gap-1.5">
          <Button
            type="button"
            onClick={() => setShowConsole(!showConsole)}
            title={showConsole ? 'Hide Console' : 'Show Console'}
            variant="outline"
            size="sm"
            className={`px-2 flex items-center gap-1.5 transition-colors ${showConsole ? 'border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <VscTerminal className="size-4" />
            {workflowLogs && workflowLogs.length > 0 && (
              <span className="px-1 py-0.5 text-[9px] font-bold bg-muted text-muted-foreground rounded-full leading-none min-w-[16px] text-center">
                {workflowLogs.length}
              </span>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => setShowContextPanel(!showContextPanel)}
            title={showContextPanel ? 'Hide Context' : 'Show Context'}
            variant="outline"
            size="sm"
            className={`px-2 flex items-center gap-1.5 transition-colors ${showContextPanel ? 'border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <TbBraces className="size-4" />
            {workflowContext && Object.keys(workflowContext).filter(k => !k.startsWith('__')).length > 0 && (
              <span className="px-1 py-0.5 text-[9px] font-bold bg-muted text-muted-foreground rounded-full leading-none min-w-[16px] text-center">
                {Object.keys(workflowContext).filter(k => !k.startsWith('__')).length}
              </span>
            )}
          </Button>
        </div>

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

      {/* Widget Advanced Options Generic Form */}
      <WidgetAdvancedOptions
        widgetForm={widgetEditorForm}
        parentWidgetType={widgetType}
      />


    </div>
  );
};
