import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  createWidgetAPI,
} from "../../../data/apis/widget";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { WidgetEditor } from "./widgetEditor";
import { WidgetPreview } from "./widgetPreview";
import PropTypes from "prop-types";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
import { useWidgetRun, WIDGET_EXECUTION_MODES } from "./useWidgetRun";
import { Switch, FormControlLabel } from "@mui/material";

const defaultWidgetType = WIDGET_TYPES.BAR_CHART.value;
const initialValues = {
  widgetTitle: "",
  widgetType: defaultWidgetType,
  widgetConfig: {
    containerCss: {},
    widgetCss: {},
    containerTailwindCss: "",
    widgetTailwindCss: "text-slate-700",
    refetchInterval: 0,
  },
  workflowID: null,
  workflowConfig: {},// For workflow mode - single workflow object
};

export const WidgetAdditionForm = ({ tenantID }) => {
  WidgetAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const uniqueKey = `${tenantID}`;
  const queryClient = useQueryClient();
  const [executionMode, setExecutionMode] = useState(WIDGET_EXECUTION_MODES.ASYNC);

  // New Hook for Widget Execution/Preview
  const {
    data: previewData,
    isLoading: isPreviewLoading,
    runWidget,
    isLive,
    workflowStatus
  } = useWidgetRun({
    tenantID,
    executionMode,
    // Pass config for socket connection if available in form
    workflowID: addWidgetForm?.values?.workflowID,
    widgetType: addWidgetForm?.values?.widgetType,
    datasetFields: addWidgetForm?.values?.workflowConfig?.datasetFields,
    parameters: addWidgetForm?.values?.workflowConfig?.parameters,
  });

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

  const _handleFetchWidgetData = useCallback(() => {
    if (addWidgetForm && addWidgetForm.values) {
      runWidget(addWidgetForm.values);
    }
  }, [addWidgetForm, runWidget]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3">
        {CONSTANTS.STRINGS.ADD_WIDGET_FORM_TITLE}
      </h1>

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.WIDGET_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full border-t border-gray-200"}
      >
        <ResizablePanel defaultSize={20}>
          <form
            className="w-full h-full p-2 flex flex-col justify-start items-stretch gap-2 overflow-y-auto"
            onSubmit={addWidgetForm.handleSubmit}
          >
            {addWidgetForm && (
              <WidgetEditor
                key={`widgetEditor_${uniqueKey}`}
                widgetEditorForm={addWidgetForm}
              />
            )}
            <button
              type="submit"
              disabled={isAddingWidget}
              className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
            >
              {isAddingWidget && (
                <CircularProgress className="!mr-3" size={16} color="white" />
              )}
              {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
            </button>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80} className="relative">
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
            widgetTitle={addWidgetForm.values.widgetTitle}
            widgetType={addWidgetForm.values.widgetType}
            widgetConfig={addWidgetForm.values.widgetConfig}
            refreshData={_handleFetchWidgetData}
            isFetchingData={isPreviewLoading}
            isRefreshingData={isPreviewLoading}
            data={previewData}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
