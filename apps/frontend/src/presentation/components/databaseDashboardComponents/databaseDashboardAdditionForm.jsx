import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createDatabaseDashboardAPI } from "../../../data/apis/databaseDashboard";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseDashboardDropzone } from "./databaseDashboardDropzone";
import { DatabaseDashboardEditor } from "./databaseDashboardEditor";
import { DatabaseDashboardWidgetList } from "./databaseDashboardWidgetList";
import { formValidations } from "../../../utils/formValidation";

export const DatabaseDashboardAdditionForm = ({ tenantID }) => {
  const queryClient = useQueryClient();
  const {
    isPending: isAddingDatabaseDashboard,
    isSuccess: isAddingDatabaseDashboardSuccess,
    isError: isAddingDatabaseDashboardError,
    error: addDatabaseDashboardError,
    mutate: addDatabaseDashboard,
  } = useMutation({
    mutationFn: (data) => {
      return createDatabaseDashboardAPI({
        tenantID,
        databaseDashboardData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(
        CONSTANTS.STRINGS.ADD_DASHBOARD_FORM_DASHBOARD_ADDITION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_DASHBOARDS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const dashboardAdditionForm = useFormik({
    initialValues: {
      databaseDashboardName: "",
      databaseDashboardDescription: "",
      databaseDashboardConfig: {
        widgets: [],
        layouts: {},
      },
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.addDashboardFormValidationSchema,
    onSubmit: (values) => {
      addDatabaseDashboard(values);
    },
  });
  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3">
        {CONSTANTS.STRINGS.ADD_DASHBOARD_FORM_TITLE}
      </h1>
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS
            .DASHBOARD_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full border-t border-gray-200"}
      >
        <ResizablePanel defaultSize={20}>
          <form
            onSubmit={dashboardAdditionForm.handleSubmit}
            className="w-full h-full"
          >
            <div className="w-full h-full flex flex-col justify-start items-stretch">
              <DatabaseDashboardEditor
                databaseDashboardEditorForm={dashboardAdditionForm}
              />
              <DatabaseDashboardWidgetList tenantID={tenantID} />
              <div className="flex flex-row justify-around items-center p-2">
                <button
                  type="submit"
                  disabled={isAddingDatabaseDashboard}
                  className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                >
                  {isAddingDatabaseDashboard && (
                    <CircularProgress
                      className="!text-xs !mr-3"
                      size={16}
                      color="white"
                    />
                  )}
                  {CONSTANTS.STRINGS.ADD_DASHBOARD_BUTTON_TEXT}
                </button>
              </div>
            </div>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80} className="">
          {dashboardAdditionForm && dashboardAdditionForm.values && (
            <DatabaseDashboardDropzone
              tenantID={tenantID}
              widgets={
                dashboardAdditionForm.values.databaseDashboardConfig.widgets
              }
              setWidgets={(value) =>
                dashboardAdditionForm.setFieldValue(
                  "databaseDashboardConfig.widgets",
                  value
                )
              }
              layouts={
                dashboardAdditionForm.values.databaseDashboardConfig.layouts
              }
              setLayouts={(value) => {
                dashboardAdditionForm.setFieldValue(
                  "databaseDashboardConfig.layouts",
                  value
                );
              }}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
