import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createDashboardAPI } from "../../../data/apis/dashboard";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DashboardDropzone } from "./dashboardDropzone";
import { DashboardEditor } from "./dashboardEditor";
import { appendWidgetToDashboardConfig } from "./dashboardLayoutUtils";
import { DashboardWidgetList } from "./dashboardWidgetList";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Button, Spinner, PageHeader } from "@jet-admin/ui";
export const DashboardAdditionForm = ({ tenantID }) => {
  DashboardAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const { isPending: isAddingDashboard, mutate: addDashboard } = useMutation({
    mutationFn: (data) => {
      return createDashboardAPI({
        tenantID,
        dashboardData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.ADD_DASHBOARD_FORM_DASHBOARD_ADDITION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const dashboardAdditionForm = useFormik({
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
    validationSchema: formValidations.addDashboardFormValidationSchema,
    onSubmit: (values) => {
      addDashboard(values);
    },
  });

  const handleAddWidgetToCanvas = (widgetID) => {
    const nextDashboardConfig = appendWidgetToDashboardConfig(
      dashboardAdditionForm.values.dashboardConfig,
      widgetID
    );

    dashboardAdditionForm.setFieldValue(
      "dashboardConfig.widgets",
      nextDashboardConfig.widgets
    );
    dashboardAdditionForm.setFieldValue(
      "dashboardConfig.layouts",
      nextDashboardConfig.layouts
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full w-full flex-col items-center bg-background">
        <PageHeader
          title={CONSTANTS.STRINGS.ADD_DASHBOARD_FORM_TITLE}
          parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_DASHBOARDS_TITLE}
          onSave={dashboardAdditionForm.handleSubmit}
          isSaving={isAddingDashboard}
          saveText="Save"
        />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS
              .DASHBOARD_ADDITION_FORM_RESULT_SEPARATION
          }
          className="!h-full !w-full"
        >
          <ResizablePanel defaultSize={20} className="overflow-hidden bg-background">
            <form
              id="dashboard-addition-form"
              onSubmit={dashboardAdditionForm.handleSubmit}
              className="flex h-full w-full flex-col overflow-hidden bg-background"
            >
              <DashboardEditor dashboardEditorForm={dashboardAdditionForm} />
              <DashboardWidgetList
                tenantID={tenantID}
                placedWidgets={dashboardAdditionForm.values.dashboardConfig.widgets}
                onAddWidget={handleAddWidgetToCanvas}
              />
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
            {dashboardAdditionForm && dashboardAdditionForm.values && (
              <DashboardDropzone
                tenantID={tenantID}
                widgets={dashboardAdditionForm.values.dashboardConfig.widgets}
                setWidgets={(value) =>
                  dashboardAdditionForm.setFieldValue(
                    "dashboardConfig.widgets",
                    value
                  )
                }
                layouts={dashboardAdditionForm.values.dashboardConfig.layouts}
                setLayouts={(value) => {
                  dashboardAdditionForm.setFieldValue(
                    "dashboardConfig.layouts",
                    value
                  );
                }}
              />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DndProvider>
  );
};
