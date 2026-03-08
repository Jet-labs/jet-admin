import React, { useState, useMemo } from "react";
import { FaPlay } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useWidgetsState } from "../../../logic/contexts/widgetsContext";

import { WidgetAdvancedOptions } from "./widgetAdvancedOptions";
import PropTypes from "prop-types";
import { VegaSpecEditor } from "./vegaSpecEditor";
import { WorkflowConsole } from "../workflowComponents/workflowConsole";
import { ShelfBuilder } from "./shelfBuilder";
import { parseVegaLiteSpec } from "@jet-admin/widgets-logic";
import { FiAlertTriangle, FiSettings } from "react-icons/fi";
import { VscTerminal } from "react-icons/vsc";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Switch,
} from "@jet-admin/ui";
// import './widgetEditor.css';

export const WidgetConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  workflowLogs,
  isRunningWorkflow,
  onTestWorkflow,
  onClearLogs,
}) => {
  WidgetConfigEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
    workflowContext: PropTypes.object,
    workflowLogs: PropTypes.array,
    isRunningWorkflow: PropTypes.bool,
    onTestWorkflow: PropTypes.func,
    onClearLogs: PropTypes.func,
  };

  const { workflows } = useWidgetsState();

  // Editor mode state
  const isVegaLite = widgetEditorForm.values.widgetType === 'vega-lite';
  const currentMode = widgetEditorForm.values.widgetConfig?.editorMode || (isVegaLite ? 'visual' : 'raw');
  const [showParseWarning, setShowParseWarning] = useState(false);
  const [parseWarningsList, setParseWarningsList] = useState([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // Handle mode switch
  const handleModeSwitch = (newMode) => {
    if (newMode === currentMode) return;

    if (newMode === 'visual') {
      try {
        const currentSpecText = widgetEditorForm.values.widgetConfig?.vegaSpec;
        if (currentSpecText) {
          const specObj = typeof currentSpecText === 'string'
            ? JSON.parse(currentSpecText)
            : currentSpecText;

          const { success, config, warnings } = parseVegaLiteSpec(specObj);

          if (!success || warnings.length > 0) {
            setParseWarningsList(warnings || ['Could not fully parse custom modifications.']);
            setShowParseWarning(true);
            return;
          } else if (config) {
            widgetEditorForm.setFieldValue('widgetConfig.chartBuilderSpec', config);
          }
        }
      } catch (e) {
        setParseWarningsList([`Invalid JSON: ${e.message}`]);
        setShowParseWarning(true);
        return;
      }
    }

    widgetEditorForm.setFieldValue('widgetConfig.editorMode', newMode);
  };

  const confirmModeSwitch = () => {
    widgetEditorForm.setFieldValue('widgetConfig.editorMode', 'visual');
    setShowParseWarning(false);
  };

  // Get selected workflow details
  const selectedWorkflow = useMemo(() => {
    const workflowID = widgetEditorForm.values.workflowID;
    if (!workflowID || !workflows) return null;
    return workflows.find(w => String(w.workflowID) === String(workflowID));
  }, [widgetEditorForm.values.workflowID, workflows]);

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
          value={widgetEditorForm.values.workflowID ? String(widgetEditorForm.values.workflowID) : ""}
          onValueChange={handleWorkflowChange}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Select an option" />
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

      {/* Row 4: Test Workflow + Settings buttons */}
      <div className="flex flex-row justify-start items-center gap-2">
        {selectedWorkflow && onTestWorkflow && (
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
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setIsSettingsDialogOpen(true)}
        >
          <FiSettings className="inline-block h-3 w-3 mr-2" />
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_SETTINGS_BUTTON}
        </Button>
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_SETTINGS_BUTTON}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {`${CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL} (ms)`}
                </Label>
                <Input
                  type="number"
                  name="widgetConfig.refetchInterval"
                  className="text-sm"
                  onChange={widgetEditorForm.handleChange}
                  value={widgetEditorForm.values.widgetConfig?.refetchInterval || ""}
                />
              </div>
              <div className="border-t border-border pt-4">
                <Label className="text-xs font-medium text-foreground">
                  Advanced Options
                </Label>
                <div className="mt-2 max-h-[50vh] overflow-y-auto pr-1">
                  <WidgetAdvancedOptions
                    widgetForm={widgetEditorForm}
                    parentWidgetType={widgetEditorForm.values.widgetType}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isVegaLite && (
        <div className="flex items-center gap-4 border-y border-border py-2">
          <div className="flex flex-row items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Visual Editor</span>
            <Switch className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5" checked={currentMode === 'visual'} onCheckedChange={(checked) => handleModeSwitch(checked ? 'visual' : 'raw')} />
          </div>
          
          {/* Render the ShelfBuilder modal trigger button if in visual mode */}
          {currentMode === 'visual' && !showParseWarning && (
            <div className="flex-1 flex justify-end">
              <ShelfBuilder
                widgetEditorForm={widgetEditorForm}
                workflowContext={workflowContext}
                workflows={workflows}
              />
            </div>
          )}
        </div>
      )}

      {/* Parse Warning Banner */}
      {showParseWarning && (
        <div className="my-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-start gap-2 text-xs">
            <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <h4 className="mb-1 font-semibold text-amber-900 dark:text-amber-200">Cannot fully parse chart config</h4>
              <p className="mb-2 text-amber-800 dark:text-amber-300">
                Switching to Visual mode may cause you to lose manual modifications:
              </p>
              <ul className="mb-3 list-disc pl-4 text-amber-800 dark:text-amber-300">
                {parseWarningsList.map((w, i) => <li key={i} className="mb-0.5">{w}</li>)}
              </ul>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowParseWarning(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={confirmModeSwitch} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600">
                  Switch & Overwrite
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 2: MAIN BODY — VegaSpecEditor (if raw mode)
          ═══════════════════════════════════════════ */}
      {!showParseWarning && currentMode === 'raw' && (
        <div className="min-h-[300px] flex-1 overflow-auto rounded-md border border-border bg-background">
          <VegaSpecEditor
            value={widgetEditorForm.values.widgetConfig?.vegaSpec}
            onChange={(spec) => widgetEditorForm.setFieldValue('widgetConfig.vegaSpec', spec)}
            workflowContext={workflowContext}
            workflow={selectedWorkflow}
          />
        </div>
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
