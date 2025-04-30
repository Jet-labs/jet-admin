import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useRef, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  createDatabaseChartAPI,
  getDatabaseChartDataUsingChartAPI,
} from "../../../data/apis/databaseChart";
import { formValidations } from "../../../utils/formValidation";
import { displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseChartEditor } from "./databaseChartEditor";
import { DatabaseChartPreview } from "./databaseChartPreview";
import { DatabaseChartAIGeneratePrompt } from "./databaseChartAIGeneratePrompt";
import { displayError } from "../../../utils/notification";
import PropTypes from "prop-types";

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
    maintainAspectRatio: false,
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

export const DatabaseChartAdditionForm = ({ tenantID }) => {
  DatabaseChartAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const uniqueKey = useRef(`databaseChartAdditionForm_${Date.now()}`);
  console.log({ uniqueKey });
  const queryClient = useQueryClient();
  const [databaseChartFetchedData, setDatabaseChartFetchedData] =
    useState(null);

  const { isPending: isAddingDatabaseChart, mutate: addDatabaseChart } =
    useMutation({
      mutationFn: (data) => {
        return createDatabaseChartAPI({
          tenantID,
          databaseChartData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.ADD_CHART_FORM_CHART_ADDITION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
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

  const addDatabaseChartForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.addDatabaseChartFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      addDatabaseChart(values);
    },
  });

  const _handleFetchDatabaseChartData = useCallback(() => {
    if (addDatabaseChartForm && addDatabaseChartForm.values) {
      fetchDatabaseChartData(addDatabaseChartForm.values);
    }
  }, [addDatabaseChartForm]);

  const _handleOnChartConfigAccepted = useCallback((databaseChart) => {
    addDatabaseChartForm.setFieldValue(
      "databaseChartConfig",
      databaseChart?.databaseChartConfig
    );
    addDatabaseChartForm.setFieldValue(
      "databaseQueries",
      databaseChart?.databaseQueries
    );
    addDatabaseChartForm.setFieldValue(
      "databaseChartType",
      databaseChart?.databaseChartType
    );
    addDatabaseChartForm.setFieldValue(
      "databaseChartName",
      databaseChart?.databaseChartName
    );
    _handleFetchDatabaseChartData();
  }, []);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="w-full p-3 border-b border-gray-200 flex flex-row justify-between items-center">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start">
          {CONSTANTS.STRINGS.ADD_CHART_FORM_TITLE}
        </h1>
        {tenantID && uniqueKey && uniqueKey.current && (
          <DatabaseChartAIGeneratePrompt
            tenantID={tenantID}
            onAccepted={_handleOnChartConfigAccepted}
            key={`databaseChartAIGeneratePrompt_${uniqueKey.current}`}

            // onAccepted={() => {}}
          />
        )}
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.CHART_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full"}
      >
        <ResizablePanel defaultSize={20}>
          <form
            className="w-full h-full p-2 flex flex-col justify-start items-stretch gap-2 overflow-y-auto"
            onSubmit={addDatabaseChartForm.handleSubmit}
          >
            {addDatabaseChartForm && uniqueKey && uniqueKey.current && (
              <DatabaseChartEditor
                databaseChartEditorForm={addDatabaseChartForm}
                tenantID={tenantID}
                key={`databaseChartEditor_${uniqueKey.current}`}
                databaseChartFetchedData={databaseChartFetchedData}
              />
            )}
            <button
              type="submit"
              disabled={isAddingDatabaseChart}
              className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
            >
              {isAddingDatabaseChart && (
                <CircularProgress
                  className="!text-xs !mr-3"
                  size={16}
                  color="white"
                />
              )}
              {CONSTANTS.STRINGS.ADD_CHART_BUTTON_TEXT}
            </button>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80}>
          {uniqueKey && uniqueKey.current && (
            <DatabaseChartPreview
              databaseChartName={addDatabaseChartForm.values.databaseChartName}
              databaseChartType={addDatabaseChartForm.values.databaseChartType}
              databaseChartConfig={
                addDatabaseChartForm.values.databaseChartConfig
              }
              refreshData={_handleFetchDatabaseChartData}
              isFetchingData={isFetchingDatabaseChartData}
              isRefreshingData={isFetchingDatabaseChartData}
              data={databaseChartFetchedData}
              key={`databaseChartPreview_${uniqueKey.current}`}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
