import { CircularProgress } from "@mui/material";
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
import { DashboardWidgetList } from "./dashboardWidgetList";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const DashboardAdditionForm = ({ tenantID }) => {
  DashboardAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
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
  return (
    <DndProvider backend={HTML5Backend}>
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
                <DashboardEditor dashboardEditorForm={dashboardAdditionForm} />
                <DashboardWidgetList tenantID={tenantID} />
                <div className="flex flex-row justify-around items-center p-2">
                  <button
                    type="submit"
                    disabled={isAddingDashboard}
                    className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                  >
                    {isAddingDashboard && (
                      <CircularProgress
                        className="!mr-3"
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
