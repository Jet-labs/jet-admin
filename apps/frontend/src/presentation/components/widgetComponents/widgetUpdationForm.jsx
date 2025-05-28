import { WIDGETS_MAP } from "@jet-admin/widgets";
import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
  getWidgetDataByIDAPI,
  getWidgetDataUsingWidgetAPI,
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

const initialValues = {
  widgetName: "",
  widgetType: CONSTANTS.WIDGET_TYPES.TEXT_WIDGET.value,
  dataQueries: [
    {
      title: "",
      dataQueryID: null,
      parameters: {},
      dataQueryArgValues: {},
      valueType: "static",
      datasetFields: {
        xAxis: "",
        yAxis: "",
      },
    },
  ],
  widgetConfig: {
    containerCss: {},
    widgetCss: {},
    containerTailwindCss: "",
    widgetTailwindCss: "text-slate-700",
  },
};

export const WidgetUpdationForm = ({ tenantID, widgetID }) => {
  WidgetUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
  };
  const uniqueKey = `widgetUpdationForm_${tenantID}_${widgetID}`;
  const queryClient = useQueryClient();
  const [widgetFetchedData, setWidgetFetchedData] = useState(null);

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

  const {
    isLoading: isLoadingWidgetDataByID,
    isPending: isPendingFetchingWidgetDataByID,
    data: widgetDataByID,
    isFetching: isFetchingWidgetDataByID,
    isRefetching: isRefetechingWidgetDataByID,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID, "data"],
    queryFn: () =>
      getWidgetDataByIDAPI({
        tenantID,
        widgetID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isFetchingWidgetData, mutate: fetchWidgetData } =
    useMutation({
      mutationKey: [
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
        widgetID,
        "data",
      ],
      mutationFn: (data) => {
        return getWidgetDataUsingWidgetAPI({
          tenantID,
          widgetData: data,
        });
      },
      retry: false,
      onSuccess: (data) => {
        setWidgetFetchedData(data?.data);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const updateWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.updateWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      updateWidget(values);
    },
  });

  const _handleFetchWidgetData = useCallback(() => {
    if (updateWidgetForm && updateWidgetForm.values) {
      fetchWidgetData(updateWidgetForm.values);
    }
  }, [updateWidgetForm]);

  useEffect(() => {
    if (widget && widget.widgetID) {
      updateWidgetForm.setValues({
        widgetName: widget.widgetName || CONSTANTS.STRINGS.UNTITLED,
        widgetType: widget.widgetType || WIDGETS_MAP.text.value,
        widgetDescription: widget.widgetDescription || "",
        dataQueries: widget.dataQueries || [],
        widgetConfig: widget.widgetConfig || {},
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
                  key={`widgetEditor_${uniqueKey}`}
                  tenantID={tenantID}
                  widgetID={widgetID}
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
                  key={`widgetCloneForm_${uniqueKey}`}
                  tenantID={tenantID}
                  widgetID={widgetID}
                />
                <WidgetDeletionForm
                  key={`widgetDeletionForm_${uniqueKey}`}
                  tenantID={tenantID}
                  widgetID={widgetID}
                />
              </div>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <WidgetPreview
              key={`{widgetPreview_${uniqueKey}}`}
              widgetID={widgetID}
              tenantID={tenantID}
              widgetName={updateWidgetForm.values.widgetName}
              widgetType={updateWidgetForm.values.widgetType}
              widgetConfig={updateWidgetForm.values.widgetConfig}
              refreshData={_handleFetchWidgetData}
              isFetchingData={
                isFetchingWidgetData ||
                isFetchingWidgetDataByID ||
                isLoadingWidgetDataByID ||
                isPendingFetchingWidgetDataByID
              }
              isRefreshingData={isRefetechingWidgetDataByID}
              data={
                widgetFetchedData ? widgetFetchedData : widgetDataByID?.data
              }
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
