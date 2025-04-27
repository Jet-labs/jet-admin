import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseWidgetByIDAPI,
  getDatabaseWidgetDataByIDAPI,
  getDatabaseWidgetDataUsingWidgetAPI,
  updateDatabaseWidgetByIDAPI,
} from "../../../data/apis/databaseWidget";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseWidgetDeletionForm } from "./databaseWidgetDeletionForm";
import { DatabaseWidgetEditor } from "./databaseWidgetEditor";
import { DatabaseWidgetPreview } from "./databaseWidgetPreview";
import { DATABASE_WIDGETS_CONFIG_MAP } from "./widgetConfig";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import PropTypes from "prop-types";
import { DatabaseWidgetCloneForm } from "./databaseWidgetCloneForm";

const initialValues = {
  databaseWidgetName: "",
  databaseWidgetType: CONSTANTS.DATABASE_WIDGET_TYPES.TEXT_WIDGET.value,
  databaseQueries: [
    {
      title: "",
      databaseQueryID: null,
      parameters: {},
      databaseQueryArgValues: {},
      valueType: "static",
      datasetFields: {
        xAxis: "",
        yAxis: "",
      },
    },
  ],
  databaseWidgetConfig: {
    containerCss: {},
    widgetCss: {},
    containerTailwindCss: "",
    widgetTailwindCss: "text-slate-700",
  },
};

export const DatabaseWidgetUpdationForm = ({ tenantID, databaseWidgetID }) => {
  DatabaseWidgetUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseWidgetID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const [databaseWidgetFetchedData, setDatabaseWidgetFetchedData] =
    useState(null);

  const {
    isLoading: isLoadingDatabaseWidget,
    data: databaseWidget,
    error: loadDatabaseWidgetError,
    isFetching: isFetchingDatabaseWidget,
    isRefetching: isRefetechingDatabaseWidget,
    refetch: refetchDatabaseWidget,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID),
      databaseWidgetID,
    ],
    queryFn: () =>
      getDatabaseWidgetByIDAPI({
        tenantID,
        databaseWidgetID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingDatabaseWidget, mutate: updateDatabaseWidget } =
    useMutation({
      mutationFn: (data) => {
        return updateDatabaseWidgetByIDAPI({
          tenantID,
          databaseWidgetID,
          databaseWidgetData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_WIDGET_UPDATION_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const {
    isLoading: isLoadingDatabaseWidgetDataByID,
    isPending: isPendingFetchingDatabaseWidgetDataByID,
    data: databaseWidgetDataByID,
    isFetching: isFetchingDatabaseWidgetDataByID,
    isRefetching: isRefetechingDatabaseWidgetDataByID,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID),
      databaseWidgetID,
      "data",
    ],
    queryFn: () =>
      getDatabaseWidgetDataByIDAPI({
        tenantID,
        databaseWidgetID,
      }),
    refetchOnWindowFocus: false,
  });

  const {
    isPending: isFetchingDatabaseWidgetData,
    mutate: fetchDatabaseWidgetData,
  } = useMutation({
    mutationFn: (data) => {
      return getDatabaseWidgetDataUsingWidgetAPI({
        tenantID,
        databaseWidgetData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      setDatabaseWidgetFetchedData(data?.data);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const updateDatabaseWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.updateDatabaseWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      updateDatabaseWidget(values);
    },
  });

  const _handleFetchDatabaseWidgetData = useCallback(() => {
    if (updateDatabaseWidgetForm && updateDatabaseWidgetForm.values) {
      fetchDatabaseWidgetData(updateDatabaseWidgetForm.values);
    }
  }, [updateDatabaseWidgetForm]);

  useEffect(() => {
    if (databaseWidget && databaseWidget.databaseWidgetID) {
      updateDatabaseWidgetForm.setValues({
        databaseWidgetName:
          databaseWidget.databaseWidgetName || CONSTANTS.STRINGS.UNTITLED,
        databaseWidgetType:
          databaseWidget.databaseWidgetType ||
          DATABASE_WIDGETS_CONFIG_MAP.text.value,
        databaseWidgetDescription:
          databaseWidget.databaseWidgetDescription || "",
        databaseQueries: databaseWidget.databaseQueries || [],
        databaseWidgetConfig: databaseWidget.databaseWidgetConfig || {},
      });
    }
  }, [databaseWidget]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3">
        {CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_TITLE}
      </h1>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseWidget}
        isFetching={isFetchingDatabaseWidget}
        isRefetching={isRefetechingDatabaseWidget}
        refetch={refetchDatabaseWidget}
        error={loadDatabaseWidgetError}
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
              onSubmit={updateDatabaseWidgetForm.handleSubmit}
            >
              {updateDatabaseWidgetForm && (
                <DatabaseWidgetEditor
                  databaseWidgetEditorForm={updateDatabaseWidgetForm}
                />
              )}
              <div className="flex flex-row justify-around items-center">
                <button
                  type="submit"
                  disabled={isUpdatingDatabaseWidget}
                  className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                >
                  {isUpdatingDatabaseWidget && (
                    <CircularProgress
                      className="!text-xs !mr-3"
                      size={16}
                      color="white"
                    />
                  )}
                  {CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_SUBMIT_BUTTON}
                </button>
                <DatabaseWidgetCloneForm
                  key={`databaseWidgetCloneForm_${databaseWidget?.databaseWidgetID}`}
                  tenantID={tenantID}
                  databaseWidgetID={databaseWidgetID}
                />
                <DatabaseWidgetDeletionForm
                  key={`databaseWidgetDeletionForm_${databaseWidget?.databaseWidgetID}`}
                  tenantID={tenantID}
                  databaseWidgetID={databaseWidgetID}
                />
              </div>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <DatabaseWidgetPreview
              databaseWidgetName={
                updateDatabaseWidgetForm.values.databaseWidgetName
              }
              databaseWidgetType={
                updateDatabaseWidgetForm.values.databaseWidgetType
              }
              databaseWidgetConfig={
                updateDatabaseWidgetForm.values.databaseWidgetConfig
              }
              refreshData={_handleFetchDatabaseWidgetData}
              isFetchingData={
                isFetchingDatabaseWidgetData ||
                isFetchingDatabaseWidgetDataByID ||
                isLoadingDatabaseWidgetDataByID ||
                isPendingFetchingDatabaseWidgetDataByID
              }
              isRefreshingData={isRefetechingDatabaseWidgetDataByID}
              data={
                databaseWidgetFetchedData
                  ? databaseWidgetFetchedData
                  : databaseWidgetDataByID?.data
              }
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
