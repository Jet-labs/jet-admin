import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useCallback, useState } from "react";
import * as Yup from "yup";
import { CONSTANTS } from "../../../constants";
import {
  createDatabaseChartAPI,
  getDatabaseChartDataUsingChartAPI,
} from "../../../data/apis/databaseChart";
import { displaySuccess } from "../../../utils/notification";
import { DatabaseChartEditor } from "./databaseChartEditor";
import { DatabaseChartPreview } from "./databaseChartPreview";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";
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
      argsMap: {},
      datasetFields: {
        xAxis: "",
        yAxis: "",
      },
    },
  ],
  databaseChartConfig: {
    legendPosition: CONSTANTS.DATABASE_CHART_LEGEND_POSITION.TOP,
    titleDisplayEnabled: true,
    legendDisplayEnabled: true,
    refetchInterval: 5,
    xStacked: true,
    yStacked: true,
    indexAxis: "y",
  },
};

// Comprehensive Validation Schema
const validationSchema = Yup.object().shape({
  databaseChartName: Yup.string().required("Chart name is required"),
  databaseChartType: Yup.string().required("Chart type is required"),
  queries: Yup.array()
    .of(
      Yup.object().shape({
        databaseQueryID: Yup.string().required("Query is required"),
        title: Yup.string()
          .required("Alias is required")
          .test("unique-alias", "Alias must be unique", function (value) {
            const aliases = this.parent.map((q) => q.title);
            return aliases.filter((a) => a === value).length === 1;
          }),
      })
    )
    .min(1, "At least 1 query required"),
});

export const DatabaseChartAdditionForm = ({ tenantID }) => {
  const queryClient = useQueryClient();
  const [databaseChartFetchedData, setDatabaseChartFetchedData] =
    useState(null);

  const {
    isPending: isAddingDatabaseChart,
    isSuccess: isAddingDatabaseChartSuccess,
    isError: isAddingDatabaseChartError,
    error: addDatabaseChartError,
    mutate: addDatabaseChart,
  } = useMutation({
    mutationFn: (data) => {
      return createDatabaseChartAPI({
        tenantID,
        databaseChartData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
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
    isSuccess: isFetchingDatabaseChartDataSuccess,
    isError: isFetchingDatabaseChartDataError,
    error: fetchDatabaseChartDataError,
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
    validationSchema,
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

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3">
        {CONSTANTS.STRINGS.ADD_CHART_FORM_TITLE}
      </h1>

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.CHART_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full border-t border-gray-200"}
      >
        <ResizablePanel defaultSize={20}>
          <form
            class="w-full h-full p-2 flex flex-col justify-start items-stretch gap-2"
            onSubmit={addDatabaseChartForm.handleSubmit}
          >
            {addDatabaseChartForm && (
              <DatabaseChartEditor
                databaseChartEditorForm={addDatabaseChartForm}
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
          {/* <DatabaseQueryResponseView
            databaseQueryTestResult={databaseQueryTestResult}
          /> */}
          <DatabaseChartPreview
            databaseChartName={addDatabaseChartForm.values.databaseChartName}
            databaseChartType={addDatabaseChartForm.values.databaseChartType}
            legendDisplayEnabled={
              addDatabaseChartForm.values.databaseChartConfig
                .legendDisplayEnabled
            }
            titleDisplayEnabled={
              addDatabaseChartForm.values.databaseChartConfig
                .titleDisplayEnabled
            }
            legendPosition={
              addDatabaseChartForm.values.databaseChartConfig.legendPosition
            }
            xStacked={addDatabaseChartForm.values.databaseChartConfig.xStacked}
            yStacked={addDatabaseChartForm.values.databaseChartConfig.yStacked}
            indexAxis={
              addDatabaseChartForm.values.databaseChartConfig.indexAxis
            }
            refreshData={_handleFetchDatabaseChartData}
            isFetchingData={isFetchingDatabaseChartData}
            isRefreshingData={isFetchingDatabaseChartData}
            data={databaseChartFetchedData}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
