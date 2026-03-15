import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  createWidgetAPI,
} from "../../../data/apis/widget";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { FiRefreshCcw } from "react-icons/fi";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { WidgetConfigEditor } from "./widgetConfigEditor";
import { WidgetPreview } from "./widgetPreview";
import PropTypes from "prop-types";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useWidgetRun, WIDGET_EXECUTION_MODES } from "./useWidgetRun";
import { WorkflowConsole } from "../workflowComponents/workflowConsole";
import { WorkflowContextPanel } from "../workflowComponents/workflowContextPanel";

import { Button, Label, Spinner, Switch } from "@jet-admin/ui";
const defaultWidgetType = WIDGET_TYPES.VEGA_LITE.value;
const initialValues = {
  widgetTitle: "",
  widgetType: defaultWidgetType,
  widgetConfig: {
    containerCss: {},
    widgetCss: {},
    containerTailwindCss: "",
    widgetTailwindCss: "text-foreground",
    refetchInterval: 0,
  },
  workflowID: null,
  workflowConfig: {},// For workflow mode - single workflow object
};

export const WidgetAdditionForm = ({ tenantID }) => {
  WidgetAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const uniqueKey = `${tenantID}`;
  const queryClient = useQueryClient();
  const [executionMode, setExecutionMode] = useState(WIDGET_EXECUTION_MODES.ASYNC);
  const autoRunWorkflowRef = useRef(null);

  const [showConsole, setShowConsole] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);

  const { isPending: isAddingWidget, mutate: addWidget } = useMutation({
    mutationFn: (data) => {
      return createWidgetAPI({
        tenantID,
        widgetData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.ADD_WIDGET_FORM_WIDGET_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const addWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.addWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      addWidget(values);
    },
  });

  // Single source of truth for Widget Execution/Preview
  const {
    data: previewData,
    context: workflowContext,
    logs: workflowLogs,
    isLoading: isPreviewLoading,
    isRunning: isRunningWorkflow,
    runWidget,
    clearLogs,
    isLive,
  } = useWidgetRun({
    tenantID,
    executionMode,
    // Pass config for socket connection if available in form
    workflowID: addWidgetForm?.values?.workflowID,
    widgetType: addWidgetForm?.values?.widgetType,
    widgetConfig: addWidgetForm?.values?.widgetConfig,
    workflowConfig: addWidgetForm?.values?.workflowConfig,
  });

  const _handleFetchWidgetData = useCallback(() => {
    if (addWidgetForm && addWidgetForm.values) {
      runWidget(addWidgetForm.values);
    }
  }, [addWidgetForm, runWidget]);

  useEffect(() => {
    if (isRunningWorkflow) {
      setShowConsole(true);
      setShowContextPanel(true);
    }
  }, [isRunningWorkflow]);

  useEffect(() => {
    const workflowID = addWidgetForm?.values?.workflowID;

    if (!workflowID) {
      autoRunWorkflowRef.current = null;
      return;
    }

    if (autoRunWorkflowRef.current === String(workflowID)) {
      return;
    }

    autoRunWorkflowRef.current = String(workflowID);
    
    // Only auto-run if workflowAutoRun is not explicitly false (or explicitly true for buttons)
    const widgetTypeBaseConfig = WIDGETS_MAP[addWidgetForm.values.widgetType];
    const shouldAutoRun = addWidgetForm.values.workflowConfig?.workflowAutoRun ?? widgetTypeBaseConfig?.defaultAutoRun ?? false;

    if (shouldAutoRun) {
      runWidget(addWidgetForm.values);
    }
  }, [addWidgetForm.values, runWidget]);

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <div className="flex w-full items-center justify-between border-b border-border bg-background p-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {CONSTANTS.STRINGS.ADD_WIDGET_FORM_TITLE}
        </h1>
        <Button type="submit" form="widget-addition-form" disabled={isAddingWidget}>
          {isAddingWidget && <Spinner className="mr-2" size={16} />}
          {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
        </Button>
      </div>

      <ResizablePanelGroup
        direction="vertical"
        autoSaveId="widget-addition-canvas-terminal-split"
        className="!h-full !w-full"
      >
        <ResizablePanel defaultSize={showConsole || showContextPanel ? 65 : 100} minSize={30}>
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId={
              CONSTANTS.RESIZABLE_PANEL_KEYS.WIDGET_ADDITION_FORM_RESULT_SEPARATION
            }
            className={"!w-full !h-full"}
          >
        <ResizablePanel defaultSize={55}>
          <form
            id="widget-addition-form"
            className="flex h-full w-full flex-col items-stretch gap-2 overflow-y-auto bg-background p-3 pb-10"
            onSubmit={addWidgetForm.handleSubmit}
          >
            {addWidgetForm && (
              <WidgetConfigEditor
                key={`widgetConfigEditor_${uniqueKey}`}
                widgetEditorForm={addWidgetForm}
                workflowContext={workflowContext}
                workflowLogs={workflowLogs}
                isRunningWorkflow={isRunningWorkflow}
                onTestWorkflow={_handleFetchWidgetData}
                onClearLogs={clearLogs}
                showConsole={showConsole}
                setShowConsole={setShowConsole}
                showContextPanel={showContextPanel}
                setShowContextPanel={setShowContextPanel}
              />
            )}

          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={45} className="relative flex flex-col min-h-0">
          {/* Execution Mode Toggle */}
          <div className="flex items-center border-b border-border flex-row justify-end gap-2 bg-background/95 p-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <Switch
                className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                checked={executionMode === WIDGET_EXECUTION_MODES.ASYNC}
                onCheckedChange={(checked) => setExecutionMode(checked ? WIDGET_EXECUTION_MODES.ASYNC : WIDGET_EXECUTION_MODES.SYNC)}
              />
              <Label className="cursor-pointer text-xs text-muted-foreground">{executionMode === WIDGET_EXECUTION_MODES.ASYNC ? "Real-time" : "Sync"}</Label>

            </div>

            {isLive && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1 text-xs font-medium text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </div>
            )}
            <Button
              type="button"
              variant='ghost'
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 bg-white"
              onClick={_handleFetchWidgetData}
            >
              {isPreviewLoading ? (
                <Spinner size={14} />
              ) : (
                <FiRefreshCcw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <div className="flex-1 min-h-0 w-full relative">
            <WidgetPreview
              widgetTitle={addWidgetForm.values.widgetTitle}
              widgetType={addWidgetForm.values.widgetType}
              widgetConfig={addWidgetForm.values.widgetConfig}
              refreshData={_handleFetchWidgetData}
              isFetchingData={isPreviewLoading}
              isRefreshingData={isPreviewLoading}
              data={previewData}
              workflowContext={workflowContext}
              runWorkflow={_handleFetchWidgetData}
              isRunningWorkflow={isRunningWorkflow}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
        </ResizablePanel>

        {/* Terminal Section - Console and Context */}
        {(showConsole || showContextPanel) && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={15} maxSize={60}>
              <ResizablePanelGroup
                direction="horizontal"
                autoSaveId="widget-addition-console-context-split"
                className="!h-full"
              >
                {/* Console Panel */}
                {showConsole && (
                  <ResizablePanel defaultSize={showContextPanel ? 50 : 100} minSize={25}>
                    <WorkflowConsole
                      logs={workflowLogs || []}
                      isRunning={isRunningWorkflow}
                      onClear={clearLogs}
                      className="h-full rounded-none border-t-0 border-l-0"
                    />
                  </ResizablePanel>
                )}

                {/* Resize Handle between Console and Context */}
                {showConsole && showContextPanel && (
                  <ResizableHandle withHandle />
                )}

                {/* Context Panel */}
                {showContextPanel && (
                  <ResizablePanel defaultSize={showConsole ? 50 : 100} minSize={25}>
                    <WorkflowContextPanel
                      context={workflowContext || {}}
                      isRunning={isRunningWorkflow}
                      className="h-full rounded-none border-t-0 border-r-0"
                    />
                  </ResizablePanel>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
