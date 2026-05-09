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

import { Button, Spinner } from "@jet-admin/ui";
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
      <div className="flex h-full w-full flex-col items-center bg-brand-dark">
        <div className="flex w-full items-center justify-between gap-3 border-b border-border bg-brand-dark px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">
            {CONSTANTS.STRINGS.ADD_DASHBOARD_FORM_TITLE}
          </h1>
          <Button
            type="submit"
            form="dashboard-addition-form"
            disabled={isAddingDashboard}
          >
            {isAddingDashboard && <Spinner className="mr-2" size={16} />}
            {CONSTANTS.STRINGS.ADD_DASHBOARD_BUTTON_TEXT}
          </Button>
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS
              .DASHBOARD_ADDITION_FORM_RESULT_SEPARATION
          }
          className="!h-full !w-full"
        >
          <ResizablePanel defaultSize={20} className="overflow-hidden bg-brand-dark">
            <form
              id="dashboard-addition-form"
              onSubmit={dashboardAdditionForm.handleSubmit}
              className="flex h-full w-full flex-col overflow-hidden bg-brand-dark"
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
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-brand-dark">
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
