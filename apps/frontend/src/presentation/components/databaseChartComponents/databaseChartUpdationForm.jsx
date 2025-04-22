import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseChartByIDAPI,
  getDatabaseChartDataByIDAPI,
  getDatabaseChartDataUsingChartAPI,
  updateDatabaseChartByIDAPI,
} from "../../../data/apis/databaseChart";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DATABASE_CHARTS_CONFIG_MAP } from "../chartTypes";
import { DatabaseQueryTestingPanel } from "../databaseQueryComponents/databaseQueryTestingPanel";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseChartDeletionForm } from "./databaseChartDeletionForm";
import { DatabaseChartEditor } from "./databaseChartEditor";
import { DatabaseChartPreview } from "./databaseChartPreview";
const initialValues = {
  databaseChartName: "",
  databaseChartType: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
  databaseQueries: [
    {
      title: "",
      databaseQueryID: null,
      parameters: {
        backgroundColor: "#D84545",
        borderWidth: 1,
        type: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
      },
      databaseQueryArgValues: {},
      datasetFields: {
        xAxis: "",
        yAxis: "",
      },
    },
  ],
  databaseChartConfig: {
    responsive: true,
    maintainAspectRatio: true,
    backgroundColor: "rgba(255, 255, 255, 0)",
    color: "#666",
    plugins: {
      title: {
        display: false,
        text: "Chart Title",
        position: "top",
        font: { size: 16, color: "#333" },
      },
      legend: {
        display: true,
        position: "top",
        labels: { font: { size: 12, color: "#666" } },
      },
      customCanvasBackgroundColor: {
        backgroundColor: "#fff",
      },
    },
    scales: {
      x: { display: true, title: { display: false, text: "X Axis" } },
      y: { display: true, title: { display: false, text: "Y Axis" } },
    },
  },
};

export const DatabaseChartUpdationForm = ({ tenantID, databaseChartID }) => {
  DatabaseChartUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseChartID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();
  const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(false);
  const [databaseChartFetchedData, setDatabaseChartFetchedData] =
    useState(null);

  const {
    isLoading: isLoadingDatabaseChart,
    data: databaseChart,
    error: loadDatabaseChartError,
    isFetching: isFetchingDatabaseChart,
    isRefetching: isRefetechingDatabaseChart,
    refetch: refetchDatabaseChart,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID),
      databaseChartID,
    ],
    queryFn: () =>
      getDatabaseChartByIDAPI({
        tenantID,
        databaseChartID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingDatabaseChart, mutate: updateDatabaseChart } =
    useMutation({
      mutationFn: (data) => {
        return updateDatabaseChartByIDAPI({
          tenantID,
          databaseChartID,
          databaseChartData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_CHART_FORM_CHART_UPDATION_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const {
    isLoading: isLoadingDatabaseChartDataByID,
    isPending: isPendingFetchingDatabaseChartDataByID,
    data: databaseChartDataByID,
    isFetching: isFetchingDatabaseChartDataByID,
    isRefetching: isRefetechingDatabaseChartDataByID,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID),
      databaseChartID,
      "data",
    ],
    queryFn: () =>
      getDatabaseChartDataByIDAPI({
        tenantID,
        databaseChartID,
      }),
    refetchOnWindowFocus: false,
  });

  const {
    isPending: isFetchingDatabaseChartData,
    mutate: fetchDatabaseChartData,
  } = useMutation({
    mutationFn: (data) => {
      return getDatabaseChartDataUsingChartAPI({
        tenantID,
        databaseChartData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      setDatabaseChartFetchedData(data?.data);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const updateDatabaseChartForm = useFormik({
    initialValues: { ...initialValues, databaseChartID },
    validationSchema: formValidations.updateDatabaseChartFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_CHART_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_CHART_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-[#646cff]",
      });
      updateDatabaseChart(values);
    },
  });

  const _handleFetchDatabaseChartData = useCallback(() => {
    if (updateDatabaseChartForm && updateDatabaseChartForm.values) {
      fetchDatabaseChartData(updateDatabaseChartForm.values);
    }
  }, [updateDatabaseChartForm]);

  useEffect(() => {
    if (databaseChart && databaseChart.databaseChartID) {
      updateDatabaseChartForm.setValues({
        databaseChartName:
          databaseChart.databaseChartName || CONSTANTS.STRINGS.UNTITLED,
        databaseChartType:
          databaseChart.databaseChartType ||
          DATABASE_CHARTS_CONFIG_MAP.bar.value,
        databaseChartDescription: databaseChart.databaseChartDescription || "",
        databaseQueries: databaseChart.databaseQueries || [],
        databaseChartConfig: databaseChart.databaseChartConfig || {},
      });
    }
  }, [databaseChart]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
          {CONSTANTS.STRINGS.UPDATE_CHART_FORM_TITLE}
        </h1>

        {databaseChart && (
          <span className="text-xs text-[#646cff] mt-2">{`Chart ID: ${databaseChart.databaseChartID} `}</span>
        )}
      </div>
      <DatabaseQueryTestingPanel
        selectedQueryForTesting={selectedQueryForTesting}
        setSelectedQueryForTesting={setSelectedQueryForTesting}
      />
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseChart}
        isFetching={isFetchingDatabaseChart}
        isRefetching={isRefetechingDatabaseChart}
        refetch={refetchDatabaseChart}
        error={loadDatabaseChartError}
      >
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.CHART_UPDATION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full"}
        >
          <ResizablePanel defaultSize={20}>
            <form
              className="w-full h-full p-2 flex flex-col justify-start items-stretch gap-2 overflow-y-auto"
              onSubmit={updateDatabaseChartForm.handleSubmit}
            >
              {updateDatabaseChartForm && (
                <DatabaseChartEditor
                  key={databaseChart?.databaseChartID}
                  databaseChartEditorForm={updateDatabaseChartForm}
                  tenantID={tenantID}
                />
              )}
              <div className="flex flex-row justify-around items-center">
                <button
                  type="submit"
                  disabled={isUpdatingDatabaseChart}
                  className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                >
                  {isUpdatingDatabaseChart && (
                    <CircularProgress
                      className="!text-xs !mr-3"
                      size={16}
                      color="white"
                    />
                  )}
                  {CONSTANTS.STRINGS.UPDATE_CHART_FORM_SUBMIT_BUTTON}
                </button>
                <DatabaseChartDeletionForm
                  key={databaseChart?.databaseChartID}
                  tenantID={tenantID}
                  databaseChartID={databaseChartID}
                />
              </div>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            {databaseChart?.databaseChartType ==
            updateDatabaseChartForm?.values.databaseChartType ? (
              <DatabaseChartPreview
                key={databaseChart?.databaseChartID}
                databaseChartName={
                  updateDatabaseChartForm.values.databaseChartName
                }
                databaseChartType={
                  updateDatabaseChartForm.values.databaseChartType
                }
                databaseChartConfig={
                  updateDatabaseChartForm.values.databaseChartConfig
                }
                refreshData={_handleFetchDatabaseChartData}
                isFetchingData={
                  isFetchingDatabaseChartData ||
                  isFetchingDatabaseChartDataByID ||
                  isLoadingDatabaseChartDataByID ||
                  isPendingFetchingDatabaseChartDataByID
                }
                isRefreshingData={isRefetechingDatabaseChartDataByID}
                data={
                  databaseChartFetchedData
                    ? databaseChartFetchedData
                    : databaseChartDataByID?.data
                }
              />
            ) : isFetchingDatabaseChartData ? (
              <div className="h-full w-full flex justify-center items-center">
                <CircularProgress className="!text-[#646cff]" />
              </div>
            ) : null}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
