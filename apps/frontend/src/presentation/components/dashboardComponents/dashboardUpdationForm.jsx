import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getDashboardByIDAPI,
  updateDashboardByIDAPI,
} from "../../../data/apis/dashboard";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DashboardCloneForm } from "./dashboardCloneForm";
import { DashboardDeletionForm } from "./dashboardDeletionForm";
import { DashboardDropzone } from "./dashboardDropzone";
import { DashboardEditor } from "./dashboardEditor";
import { DashboardWidgetList } from "./dashboardWidgetList";

export const DashboardUpdationForm = ({ tenantID, dashboardID }) => {
  DashboardUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    dashboardID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
    isFetching: isFetchingDashboard,
    isRefetching: isRefetechingDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID), dashboardID],
    queryFn: () =>
      getDashboardByIDAPI({
        tenantID,
        dashboardID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingDashboard, mutate: updateDashboard } =
    useMutation({
      mutationFn: (data) => {
        return updateDashboardByIDAPI({
          tenantID,
          dashboardID,
          dashboardData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_DASHBOARD_UPDATION_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const dashboardUpdationForm = useFormik({
    initialValues: {
      dashboardTitle: "",
      dashboardDescription: "",
      dashboardConfig: {
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
      updateDashboard(values);
    },
  });

  useEffect(() => {
    if (dashboard) {
      // Update Formik form values with the fetched dataQuery data
      dashboardUpdationForm.setFieldValue(
        "dashboardTitle",
        dashboard.dashboardTitle || CONSTANTS.STRINGS.UNTITLED
      );
      dashboardUpdationForm.setFieldValue(
        "dashboardDescription",
        dashboard.dashboardDescription || ""
      );
      dashboardUpdationForm.setFieldValue(
        "dashboardConfig",
        dashboard.dashboardConfig || {}
      );
    }
  }, [dashboard]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
            {CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_TITLE}
          </h1>

          {dashboard && (
            <span className="text-xs text-[#646cff] mt-2">{`Dashboard ID: ${dashboard.dashboardID} `}</span>
          )}
        </div>
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDashboard}
        isFetching={isFetchingDashboard}
        error={loadDashboardError}
        refetch={refetchDashboard}
        isRefetching={isRefetechingDashboard}
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
                <DashboardEditor dashboardEditorForm={dashboardUpdationForm} />
                <DashboardWidgetList tenantID={tenantID} />
                <div className="flex flex-row justify-around items-center p-2">
                  <button
                    type="submit"
                    disabled={isUpdatingDashboard}
                    className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                  >
                    {isUpdatingDashboard && (
                      <CircularProgress
                        className="!mr-3"
                        size={16}
                        color="white"
                      />
                    )}
                    {CONSTANTS.STRINGS.UPDATE_DASHBOARD_BUTTON_TEXT}
                  </button>
                  <DashboardCloneForm
                    key={`dashboardCloneForm_${dashboard?.dashboardID}`}
                    tenantID={tenantID}
                    dashboardID={dashboardID}
                  />
                  <DashboardDeletionForm
                    key={`dashboardDeletionForm_${dashboard?.dashboardID}`}
                    tenantID={tenantID}
                    dashboardID={dashboardID}
                  />
                </div>
              </div>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="">
            {dashboardUpdationForm && dashboardUpdationForm.values && (
              <DashboardDropzone
                tenantID={tenantID}
                widgets={dashboardUpdationForm.values.dashboardConfig.widgets}
                setWidgets={(value) =>
                  dashboardUpdationForm.setFieldValue(
                    "dashboardConfig.widgets",
                    value
                  )
                }
                layouts={dashboardUpdationForm.values.dashboardConfig.layouts}
                setLayouts={(value) => {
                  dashboardUpdationForm.setFieldValue(
                    "dashboardConfig.layouts",
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
