import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getDashboardByIDAPI,
  updateDashboardByIDAPI,
} from "../../../data/apis/dashboard";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
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
import { appendWidgetToDashboardConfig } from "./dashboardLayoutUtils";
import { DashboardWidgetList } from "./dashboardWidgetList";

import { PageHeader } from "@jet-admin/ui";
export const DashboardUpdationForm = ({ tenantID, dashboardID }) => {
  DashboardUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    dashboardID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
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
        confirmButtonClass: "!bg-primary",
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

  const handleAddWidgetToCanvas = (widgetID) => {
    const nextDashboardConfig = appendWidgetToDashboardConfig(
      dashboardUpdationForm.values.dashboardConfig,
      widgetID
    );

    dashboardUpdationForm.setFieldValue(
      "dashboardConfig.widgets",
      nextDashboardConfig.widgets
    );
    dashboardUpdationForm.setFieldValue(
      "dashboardConfig.layouts",
      nextDashboardConfig.layouts
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_DASHBOARDS_TITLE}

        id={dashboardID}
        onSave={dashboardUpdationForm.handleSubmit}
        isSaving={isUpdatingDashboard}
      >
        <DashboardDeletionForm
          key={`dashboardDeletionForm_${dashboard?.dashboardID}`}
          tenantID={tenantID}
          dashboardID={dashboardID}
        />
        <DashboardCloneForm
          key={`dashboardCloneForm_${dashboard?.dashboardID}`}
          tenantID={tenantID}
          dashboardID={dashboardID}
        />
      </PageHeader>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDashboard}
        error={loadDashboardError}
      >
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS
              .DASHBOARD_UPDATION_FORM_RESULT_SEPARATION
          }
          className="!h-full !w-full"
        >
          <ResizablePanel defaultSize={20} className="overflow-hidden bg-background">
            <form
              id="dashboard-updation-form"
              onSubmit={dashboardUpdationForm.handleSubmit}
              className="flex h-full w-full flex-col overflow-hidden bg-background"
            >
              <DashboardEditor dashboardEditorForm={dashboardUpdationForm} />
              <DashboardWidgetList
                tenantID={tenantID}
                placedWidgets={dashboardUpdationForm.values.dashboardConfig.widgets}
                onAddWidget={handleAddWidgetToCanvas}
              />
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
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
