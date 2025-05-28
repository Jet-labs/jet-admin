import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  createWidgetAPI,
  getWidgetDataUsingWidgetAPI,
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
import { WIDGETS_MAP } from "@jet-admin/widgets";
import { WIDGET_TYPES } from "@jet-admin/widget-types";

const defaultWidgetType = WIDGET_TYPES.BAR_CHART.value;
const initialValues = {
  widgetName: "",
  widgetType: defaultWidgetType,
  dataQueries: [
    {
      title: "",
      dataQueryID: null,
      valueType: "static",
      parameters: WIDGETS_MAP[defaultWidgetType].sampleConfig,
      dataQueryArgValues: {},
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

export const WidgetAdditionForm = ({ tenantID }) => {
  WidgetAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const [widgetFetchedData, setWidgetFetchedData] = useState(null);

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

  const { isPending: isFetchingWidgetData, mutate: fetchWidgetData } =
    useMutation({
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
      fetchWidgetData(addWidgetForm.values);
    }
  }, [addWidgetForm]);

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
                tenantID={tenantID}
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
        <ResizablePanel defaultSize={80}>
          <WidgetPreview
            widgetName={addWidgetForm.values.widgetName}
            widgetType={addWidgetForm.values.widgetType}
            widgetConfig={addWidgetForm.values.widgetConfig}
            refreshData={_handleFetchWidgetData}
            isFetchingData={isFetchingWidgetData}
            isRefreshingData={isFetchingWidgetData}
            data={widgetFetchedData}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
