import { WIDGETS_MAP } from "@jet-admin/widgets";
import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState, useMemo } from "react";
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
import { WidgetEditor } from "./widgetEditor";
import { WidgetPreview } from "./widgetPreview";
import { useWidgetRun, WIDGET_EXECUTION_MODES } from "./useWidgetRun";
import { Switch, FormControlLabel } from "@mui/material";

const initialValues = {
  widgetTitle: "",
  widgetType: CONSTANTS.WIDGET_TYPES.TEXT_WIDGET.value,
  workflowID: null,
  workflowConfig: {},// For workflow mode - single workflow object
  widgetConfig: {
    containerCss: {},
    widgetCss: {},
    containerTailwindCss: "",
    widgetTailwindCss: "text-slate-700",
    refetchInterval: 0,
  },
};

export const WidgetUpdationForm = ({ tenantID, widgetID }) => {
  WidgetUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
  };

  const [executionMode, setExecutionMode] = useState(WIDGET_EXECUTION_MODES.ASYNC);





  const updateWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.updateWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      updateWidget(values);
    },
  });

  // New Hook for Widget Execution/Preview
  const {
    data: previewData,
    isLoading: isPreviewLoading,
    runWidget,
    isLive,
    workflowStatus
  } = useWidgetRun({
    tenantID,
    widgetID,
    executionMode,
    // Pass config for socket
    workflowID: updateWidgetForm?.values?.workflowID,
    widgetType: updateWidgetForm?.values?.widgetType,
    datasetFields: updateWidgetForm?.values?.workflowConfig?.datasetFields,
    parameters: updateWidgetForm?.values?.workflowConfig?.parameters,
  });

  const {
    isLoading: isLoadingWidget,
    data: widget,
    error: loadWidgetError,
    isFetching: isFetchingWidget,
    isRefetching: isRefetechingWidget,
    refetch: refetchWidget,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID],
    queryFn: () =>
      getWidgetByIDAPI({
        tenantID,
        widgetID,
      }),
    refetchOnWindowFocus: false,
  });

  console.log({ widget });

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
        workflowID: widget.workflowID || null,
        workflowConfig: widget.workflowConfig || {},
      });
    }
  }, [widget]);



  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3">
        {CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_TITLE}
      </h1>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget}
        isFetching={isFetchingWidget}
        isRefetching={isRefetechingWidget}
        refetch={refetchWidget}
        error={loadWidgetError}
      >
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS
              .WIDGET_UPDATION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full border-t border-gray-200"}
        >
          <ResizablePanel defaultSize={20}>
            <form
              className="w-full h-full p-2 flex flex-col justify-start items-stretch gap-2 overflow-y-auto"
              onSubmit={updateWidgetForm.handleSubmit}
            >
              {updateWidgetForm && (
                <WidgetEditor
                  key={`widgetEditor_${widgetID}`}
                  widgetEditorForm={updateWidgetForm}
                />
              )}
              <div className="flex flex-row justify-around items-center">
                <button
                  type="submit"
                  disabled={isUpdatingWidget}
                  className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                >
                  {isUpdatingWidget && (
                    <CircularProgress
                      className="!mr-3"
                      size={16}
                      color="white"
                    />
                  )}
                  {CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_SUBMIT_BUTTON}
                </button>
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
              </div>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            {/* Execution Mode Toggle */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-white/80 p-1 rounded shadow-sm">
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={executionMode === WIDGET_EXECUTION_MODES.ASYNC}
                    onChange={(e) => setExecutionMode(e.target.checked ? WIDGET_EXECUTION_MODES.ASYNC : WIDGET_EXECUTION_MODES.SYNC)}
                  />
                }
                label={<span className="text-xs">{executionMode === WIDGET_EXECUTION_MODES.ASYNC ? "Real-time" : "Sync"}</span>}
              />

              {isLive && (
                <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Live</span>
                </div>
              )}
            </div>
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
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
