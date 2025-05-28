import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseDashboardByIDAPI,
  updateDatabaseDashboardByIDAPI,
} from "../../../data/apis/databaseDashboard";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatabaseDashboardCloneForm } from "./databaseDashboardCloneForm";
import { DatabaseDashboardDeletionForm } from "./databaseDashboardDeletionForm";
import { DatabaseDashboardDropzone } from "./databaseDashboardDropzone";
import { DatabaseDashboardEditor } from "./databaseDashboardEditor";
import { DatabaseDashboardWidgetList } from "./databaseDashboardWidgetList";

export const DatabaseDashboardUpdationForm = ({
  tenantID,
  databaseDashboardID,
}) => {
  DatabaseDashboardUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseDashboardID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();

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
    onSuccess: () => {
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
      // Update Formik form values with the fetched dataQuery data
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
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseDashboard}
        isFetching={isFetchingDatabaseDashboard}
        error={loadDatabaseDashboardError}
        refetch={refetchDatabaseDashboard}
        isRefetching={isRefetechingDatabaseDashboard}
      >
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
              <div className="w-full h-full flex flex-col justify-start items-stretch">
                <DatabaseDashboardEditor
                  databaseDashboardEditorForm={dashboardUpdationForm}
                />
                <DatabaseDashboardWidgetList tenantID={tenantID} />
                <div className="flex flex-row justify-around items-center p-2">
                  <button
                    type="submit"
                    disabled={isUpdatingDatabaseDashboard}
                    className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                  >
                    {isUpdatingDatabaseDashboard && (
                      <CircularProgress
                        className="!mr-3"
                        size={16}
                        color="white"
                      />
                    )}
                    {CONSTANTS.STRINGS.UPDATE_DASHBOARD_BUTTON_TEXT}
                  </button>
                  <DatabaseDashboardCloneForm
                    key={`databaseDashboardCloneForm_${databaseDashboard?.databaseDashboardID}`}
                    tenantID={tenantID}
                    databaseDashboardID={databaseDashboardID}
                  />
                  <DatabaseDashboardDeletionForm
                    key={`databaseDashboardDeletionForm_${databaseDashboard?.databaseDashboardID}`}
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
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
