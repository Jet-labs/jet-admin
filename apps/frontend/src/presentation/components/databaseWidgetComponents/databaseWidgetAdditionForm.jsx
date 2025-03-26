import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useCallback, useState } from "react";
import * as Yup from "yup";
import { CONSTANTS } from "../../../constants";
import {
    createDatabaseWidgetAPI,
    getDatabaseWidgetDataUsingWidgetAPI,
} from "../../../data/apis/databaseWidget";
import { displaySuccess } from "../../../utils/notification";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseQueryResponseView } from "../databaseQueryComponents/databaseQueryResponseView";
import { DatabaseWidgetEditor } from "./databaseWidgetEditor";
import { DatabaseWidgetPreview } from "./databaseWidgetPreview";
const initialValues = {
  databaseWidgetName: "",
  databaseWidgetType: CONSTANTS.DATABASE_WIDGET_TYPES.TEXT_WIDGET.value,
  databaseQueries: [
    {
      title: "",
      databaseQueryID: null,
      valueType: "static",
      parameters: {},
      argsMap: {},
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

// Comprehensive Validation Schema
const validationSchema = Yup.object().shape({
  databaseWidgetName: Yup.string().required("Widget name is required"),
  databaseWidgetType: Yup.string().required("Widget type is required"),
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

export const DatabaseWidgetAdditionForm = ({ tenantID }) => {
  const queryClient = useQueryClient();
  const [databaseWidgetFetchedData, setDatabaseWidgetFetchedData] =
    useState(null);

  const {
    isPending: isAddingDatabaseWidget,
    isSuccess: isAddingDatabaseWidgetSuccess,
    isError: isAddingDatabaseWidgetError,
    error: addDatabaseWidgetError,
    mutate: addDatabaseWidget,
  } = useMutation({
    mutationFn: (data) => {
      return createDatabaseWidgetAPI({
        tenantID,
        databaseWidgetData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(CONSTANTS.STRINGS.ADD_WIDGET_FORM_WIDGET_ADDITION_SUCCESS);
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
    isSuccess: isFetchingDatabaseWidgetDataSuccess,
    isError: isFetchingDatabaseWidgetDataError,
    error: fetchDatabaseWidgetDataError,
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
    validationSchema,
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

  console.log({ addDatabaseWidgetForm: addDatabaseWidgetForm?.values });
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
            class="w-full h-full p-2 flex flex-col justify-start items-stretch gap-2 overflow-y-auto"
            onSubmit={addDatabaseWidgetForm.handleSubmit}
          >
            {addDatabaseWidgetForm && (
              <DatabaseWidgetEditor
                databaseWidgetEditorForm={addDatabaseWidgetForm}
              />
            )}
            <button
              type="submit"
              disabled={isAddingDatabaseWidget}
              className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
            >
              {isAddingDatabaseWidget && (
                <CircularProgress
                  className="!text-xs !mr-3"
                  size={16}
                  color="white"
                />
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
