import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
// import './widgetEditor.css';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
  updateWidgetByIDAPI,
} from "../../../data/apis/widget";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { WidgetCloneForm } from "./widgetCloneForm";
import { WidgetDeletionForm } from "./widgetDeletionForm";
import { WidgetConfigEditor } from "./widgetConfigEditor";
import { WidgetPreview } from "./widgetPreview";
import { useWidgetRun, WIDGET_EXECUTION_MODES } from "./useWidgetRun";
import { WorkflowConsole } from "../workflowComponents/workflowConsole";
import { WorkflowContextPanel } from "../workflowComponents/workflowContextPanel";

import { Button, Label, Spinner, Switch } from "@jet-admin/ui";
const initialValues = {
  widgetTitle: "",
  widgetType: "vega-lite",
  workflowID: null,
  workflowConfig: {},// For workflow mode - single workflow object
  widgetConfig: {
    containerCss: {},
    widgetCss: {},
    containerTailwindCss: "",
    widgetTailwindCss: "text-foreground",
    refetchInterval: 0,
  },
};

export const WidgetUpdationForm = ({ tenantID, widgetID }) => {
  WidgetUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const [executionMode, setExecutionMode] = useState(WIDGET_EXECUTION_MODES.ASYNC);
  const queryClient = useQueryClient();
  const autoRunKeyRef = useRef(null);

  const [showConsole, setShowConsole] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);

  const updateWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.updateWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      updateWidget(values);
    },
  });

  const {
    isLoading: isLoadingWidget,
    data: widget,
    error: loadWidgetError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID],
    queryFn: () =>
      getWidgetByIDAPI({
        tenantID,
        widgetID,
      }),
    refetchOnWindowFocus: false,
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
    widgetID,
    executionMode,
    widgetFetchedData: widget,
    // Pass config for socket
    workflowID: updateWidgetForm?.values?.workflowID,
    widgetType: updateWidgetForm?.values?.widgetType,
    widgetConfig: updateWidgetForm?.values?.widgetConfig,
    workflowConfig: updateWidgetForm?.values?.workflowConfig,
  });

  const { isPending: isUpdatingWidget, mutate: updateWidget } = useMutation({
    mutationFn: (data) => {
      return updateWidgetByIDAPI({
        tenantID,
        widgetID,
        widgetData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_WIDGET_UPDATION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });


  const _handleFetchWidgetData = useCallback(() => {
    if (updateWidgetForm && updateWidgetForm.values) {
      runWidget(updateWidgetForm.values);
    }
  }, [updateWidgetForm, runWidget]);

  useEffect(() => {
    if (widget && widget.widgetID) {    
      updateWidgetForm.setValues({
        widgetTitle: widget.widgetTitle || CONSTANTS.STRINGS.UNTITLED,
        widgetType: widget.widgetType || WIDGETS_MAP.text.value,
        widgetDescription: widget.widgetDescription || "",
        widgetConfig: widget.widgetConfig || {},
        workflowID: widget.workflowID ?? null,
        workflowConfig: widget.workflowConfig || {},
      });
    }
  }, [widget]);

  useEffect(() => {
    if (isRunningWorkflow) {
      setShowConsole(true);
      setShowContextPanel(true);
    }
  }, [isRunningWorkflow]);

  useEffect(() => {
    const workflowID = updateWidgetForm?.values?.workflowID;
    const currentWidgetID = widget?.widgetID || widgetID;

    if (!workflowID || !currentWidgetID) {
      autoRunKeyRef.current = null;
      return;
    }

    const autoRunKey = `${currentWidgetID}_${workflowID}`;
    if (autoRunKeyRef.current === autoRunKey) {
      return;
    }

    autoRunKeyRef.current = autoRunKey;

    const widgetTypeBaseConfig = WIDGETS_MAP[updateWidgetForm.values.widgetType];
    const shouldAutoRun = updateWidgetForm.values.workflowConfig?.workflowAutoRun ?? widgetTypeBaseConfig?.defaultAutoRun ?? false;

    if (shouldAutoRun) {
      runWidget(updateWidgetForm.values);
    }
  }, [updateWidgetForm.values, widget, widgetID, runWidget]);



  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <div className="flex w-full items-start justify-between border-b border-border bg-background p-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_TITLE}
          </h1>
          {widget && (
            <span className="mt-1 text-xs text-muted-foreground">
              {`Widget ID: ${widget.widgetID}`}
            </span>
          )}
        </div>
        <div className="flex flex-row justify-end items-center gap-2">
          <WidgetCloneForm
            key={`widgetCloneForm_${widgetID}`}
            tenantID={tenantID}
            widgetID={widgetID}
          />
          <WidgetDeletionForm
            key={`widgetDeletionForm_${widgetID}`}
            tenantID={tenantID}
            widgetID={widgetID}
          />
          <Button
            type="button"
            onClick={updateWidgetForm.handleSubmit}
            disabled={isUpdatingWidget}
          >
            {isUpdatingWidget && (
              <Spinner className="mr-3" size={16} />
            )}
            {CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_SUBMIT_BUTTON}
          </Button>

        </div>

      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget}
        error={loadWidgetError}
      >
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId="widget-updation-canvas-terminal-split"
          className="!h-full !w-full"
        >
          <ResizablePanel defaultSize={showConsole || showContextPanel ? 65 : 100} minSize={30}>
            <ResizablePanelGroup
              direction="horizontal"
              autoSaveId={
                CONSTANTS.RESIZABLE_PANEL_KEYS
                  .WIDGET_UPDATION_FORM_RESULT_SEPARATION
              }
              className={"!w-full !h-full"}
            >
          <ResizablePanel defaultSize={35} className="!overflow-y-auto !pb-10">
            <form
              className="flex w-full flex-col items-stretch gap-2 bg-background p-3"
              onSubmit={updateWidgetForm.handleSubmit}
            >
              {updateWidgetForm && (
                <WidgetConfigEditor
                  key={`widgetConfigEditor_${widgetID}`}
                  widgetEditorForm={updateWidgetForm}
                  workflowContext={workflowContext}
                  workflowLogs={workflowLogs}
                  isRunningWorkflow={isRunningWorkflow}
                  initialWorkflowID={widget?.workflowID}
                  initialWorkflowTitle={widget?.workflow?.title || ""}
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
          <ResizablePanel defaultSize={65} className="relative flex flex-col min-h-0">
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
              key={`{widgetPreview_${widgetID}}`}
              widgetID={widgetID}
              tenantID={tenantID}
              widgetTitle={updateWidgetForm.values.widgetTitle}
              widgetType={updateWidgetForm.values.widgetType}
              widgetConfig={updateWidgetForm.values.widgetConfig}
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
                  autoSaveId="widget-updation-console-context-split"
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
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
