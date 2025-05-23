import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  createDatabaseWidgetAPI,
  getDatabaseWidgetDataUsingWidgetAPI,
} from "../../../data/apis/databaseWidget";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseWidgetEditor } from "./databaseWidgetEditor";
import { DatabaseWidgetPreview } from "./databaseWidgetPreview";
import PropTypes from "prop-types";
import { WIDGETS_MAP } from "@jet-admin/widgets";
import { WIDGET_TYPES } from "@jet-admin/widget-types";

const defaultChartType = WIDGET_TYPES.BAR_CHART.value;
const initialValues = {
  databaseWidgetName: "",
  databaseWidgetType: defaultChartType,
  databaseQueries: [
    {
      title: "",
      databaseQueryID: null,
      valueType: "static",
      parameters: WIDGETS_MAP[defaultChartType].sampleConfig,
      databaseQueryArgValues: {},
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

export const DatabaseWidgetAdditionForm = ({ tenantID }) => {
  DatabaseWidgetAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const [databaseWidgetFetchedData, setDatabaseWidgetFetchedData] =
    useState(null);

  const { isPending: isAddingDatabaseWidget, mutate: addDatabaseWidget } =
    useMutation({
      mutationFn: (data) => {
        return createDatabaseWidgetAPI({
          tenantID,
          databaseWidgetData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.ADD_WIDGET_FORM_WIDGET_ADDITION_SUCCESS
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

  const addDatabaseWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.addDatabaseWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      addDatabaseWidget(values);
    },
  });

  const _handleFetchDatabaseWidgetData = useCallback(() => {
    if (addDatabaseWidgetForm && addDatabaseWidgetForm.values) {
      fetchDatabaseWidgetData(addDatabaseWidgetForm.values);
    }
  }, [addDatabaseWidgetForm]);

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
            onSubmit={addDatabaseWidgetForm.handleSubmit}
          >
            {addDatabaseWidgetForm && (
              <DatabaseWidgetEditor
                tenantID={tenantID}
                databaseWidgetEditorForm={addDatabaseWidgetForm}
              />
            )}
            <button
              type="submit"
              disabled={isAddingDatabaseWidget}
              className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
            >
              {isAddingDatabaseWidget && (
                <CircularProgress className="!mr-3" size={16} color="white" />
              )}
              {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
            </button>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80}>
          <DatabaseWidgetPreview
            databaseWidgetName={addDatabaseWidgetForm.values.databaseWidgetName}
            databaseWidgetType={addDatabaseWidgetForm.values.databaseWidgetType}
            databaseWidgetConfig={
              addDatabaseWidgetForm.values.databaseWidgetConfig
            }
            refreshData={_handleFetchDatabaseWidgetData}
            isFetchingData={isFetchingDatabaseWidgetData}
            isRefreshingData={isFetchingDatabaseWidgetData}
            data={databaseWidgetFetchedData}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
