import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useCallback, useEffect } from "react";
import {
  RiPushpinFill,
  RiUnpinFill
} from "react-icons/ri";
import { CONSTANTS } from "../../../constants";
import { getDatabaseDashboardByIDAPI, updateDatabaseDashboardByIDAPI } from "../../../data/apis/databaseDashboard";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseDashboardDeletionForm } from "./databaseDashboardDeletionForm";
import { DatabaseDashboardDropzone } from "./databaseDashboardDropzone";
import { DatabaseDashboardEditor } from "./databaseDashboardEditor";
import { DatabaseDashboardWidgetList } from "./databaseDashboardWidgetList";
import { formValidations } from "../../../utils/formValidation";

export const DatabaseDashboardUpdationForm = ({
  tenantID,
  databaseDashboardID,
}) => {
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();
  const { updateUserConfigKey } = useAuthActions();
  const { userConfig, isUpdatingUserConfig } = useAuthState();

  const {
    isLoading: isLoadingDatabaseDashboard,
    data: databaseDashboard,
    error: loadDatabaseDashboardError,
    isFetching: isFetchingDatabaseDashboard,
    isRefetching: isRefetechingDatabaseDashboard,
    refetch: refetchDatabaseDashboard,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_DASHBOARDS(tenantID),
      databaseDashboardID,
    ],
    queryFn: () =>
      getDatabaseDashboardByIDAPI({
        tenantID,
        databaseDashboardID,
      }),
    refetchOnWindowFocus: false,
  });

  const {
    isPending: isUpdatingDatabaseDashboard,
    isSuccess: isUpdatingDatabaseDashboardSuccess,
    isError: isUpdatingDatabaseDashboardError,
    error: updateDatabaseDashboardError,
    mutate: updateDatabaseDashboard,
  } = useMutation({
    mutationFn: (data) => {
      return updateDatabaseDashboardByIDAPI({
        tenantID,
        databaseDashboardID,
        databaseDashboardData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(
        CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_DASHBOARD_UPDATION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_DASHBOARDS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const dashboardUpdationForm = useFormik({
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
    validationSchema: formValidations.updateDashboardFormValidationSchema,
    onSubmit: async (values) => {
      await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-[#646cff]",
      });
      updateDatabaseDashboard(values);
    },
  });

  useEffect(() => {
    if (databaseDashboard) {
      // Update Formik form values with the fetched databaseDashboard data
      dashboardUpdationForm.setFieldValue(
        "databaseDashboardName",
        databaseDashboard.databaseDashboardName || CONSTANTS.STRINGS.UNTITLED
      );
      dashboardUpdationForm.setFieldValue(
        "databaseDashboardDescription",
        databaseDashboard.databaseDashboardDescription || ""
      );
      dashboardUpdationForm.setFieldValue(
        "databaseDashboardConfig",
        databaseDashboard.databaseDashboardConfig || {}
      );
    }
  }, [databaseDashboard]);

  const isDashboardPinned =
    userConfig &&
    databaseDashboard &&
    parseInt(userConfig[CONSTANTS.USER_CONFIG_KEYS.DEFAULT_DASHBOARD_ID]) ===
      databaseDashboard.databaseDashboardID;
  const _handleTogglePinDashboard = useCallback(() => {
    if (databaseDashboard) {
      updateUserConfigKey({
        tenantID,
        key: CONSTANTS.USER_CONFIG_KEYS.DEFAULT_DASHBOARD_ID,
        value: isDashboardPinned ? null : databaseDashboard.databaseDashboardID,
      });
    }
  }, [userConfig, isDashboardPinned, databaseDashboard, updateUserConfigKey]);
  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
            {CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_TITLE}
          </h1>

          {databaseDashboard && (
            <span className="text-xs text-[#646cff] mt-2">{`Dashboard ID: ${databaseDashboard.databaseDashboardID} `}</span>
          )}
        </div>
        <button
          onClick={_handleTogglePinDashboard}
          className="p-0 m-0 mx-3 px-2  bg-[#646cff]/10 py-1 rounded-full text-[#646cff] border-0 focus:border-0 focus:outline-none focus:ring-0 inline-flex items-center"
        >
          {isUpdatingUserConfig ? (
            <CircularProgress size={20} className="!text-[#646cff]" />
          ) : isDashboardPinned ? (
            <>
              <RiUnpinFill className="text-sm" />
              <span className="text-xs ml-1">Unpin</span>
            </>
          ) : (
            <>
              <RiPushpinFill className="text-sm" />
              <span className="text-xs ml-1">Pin</span>
            </>
          )}
        </button>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS
            .DASHBOARD_UPDATION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full border-t border-gray-200"}
      >
        <ResizablePanel defaultSize={20}>
          <form
            onSubmit={dashboardUpdationForm.handleSubmit}
            className="w-full h-full"
          >
            <div className="w-full h-full flex flex-col justify-start items-stretch p-2 gap-2">
              <DatabaseDashboardEditor
                databaseDashboardEditorForm={dashboardUpdationForm}
              />
              <DatabaseDashboardWidgetList />
              <div className="flex flex-row justify-around items-center">
                <button
                  type="submit"
                  disabled={isUpdatingDatabaseDashboard}
                  className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                >
                  {isUpdatingDatabaseDashboard && (
                    <CircularProgress
                      className="!text-xs !mr-3"
                      size={16}
                      color="white"
                    />
                  )}
                  {CONSTANTS.STRINGS.UPDATE_DASHBOARD_BUTTON_TEXT}
                </button>
                <DatabaseDashboardDeletionForm
                  key={databaseDashboard?.databaseDashboardID}
                  tenantID={tenantID}
                  databaseDashboardID={databaseDashboardID}
                />
              </div>
            </div>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80} className="">
          {dashboardUpdationForm && dashboardUpdationForm.values && (
            <DatabaseDashboardDropzone
              tenantID={tenantID}
              widgets={
                dashboardUpdationForm.values.databaseDashboardConfig.widgets
              }
              setWidgets={(value) =>
                dashboardUpdationForm.setFieldValue(
                  "databaseDashboardConfig.widgets",
                  value
                )
              }
              layouts={
                dashboardUpdationForm.values.databaseDashboardConfig.layouts
              }
              setLayouts={(value) => {
                dashboardUpdationForm.setFieldValue(
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
