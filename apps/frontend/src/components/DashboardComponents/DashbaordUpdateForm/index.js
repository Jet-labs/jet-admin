import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import {
  getDashboardByIDAPI,
  updateDashboardAPI,
} from "../../../api/dashboards";
import { DashboardDeletionForm } from "../../../components/DashboardComponents/DashboardDeletionForm";
import { DashboardDropZoneComponent } from "../../../components/DashboardComponents/DashboardDropZoneComponent";
import { FieldComponent } from "../../../components/FieldComponent";
import { WidgetsDnDList } from "../../../components/DashboardComponents/WidgetsDnDList";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";

export const DashboardUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS, id],
    queryFn: () => getDashboardByIDAPI({ dashboardID: id }),
    retry: 1,
  });

  const {
    isPending: isUpdatingDashboard,
    isSuccess: isUpdatingDashboardSuccess,
    isError: isUpdatingDashboardError,
    error: updateDashboardError,
    mutate: updateDashboard,
  } = useMutation({
    mutationFn: ({ data }) => {
      return updateDashboardAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.DASHBOARD_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const dashboardForm = useFormik({
    initialValues: {
      dashboard_title: "",
      widgets: [],
      layouts: {},
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      const { dashboard_title, dashboard_description, ...dashboard_options } =
        values;
      updateDashboard({
        data: {
          pm_dashboard_id: id,
          dashboard_title: dashboard_title,
          dashboard_description: dashboard_description,
          dashboard_options,
        },
      });
    },
  });

  useEffect(() => {
    if (dashboard) {
      dashboardForm.setFieldValue("dashboard_title", dashboard.dashboard_title);
      dashboardForm.setFieldValue(
        "dashboard_description",
        dashboard.dashboard_description
      );
      dashboardForm.setFieldValue(
        "widgets",
        dashboard.dashboard_options.widgets
      );
      dashboardForm.setFieldValue(
        "layouts",
        dashboard.dashboard_options.layouts
      );
    }
  }, [dashboard]);

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup
        className={"!h-full"}
        direction="horizontal"
        autoSaveId="dashboard-update-widget-panel-sizes"
      >
        <ResizablePanel
          defaultSize={70}
          className="w-full !h-[calc(100vh-48px)]"
          // style={{ background: theme.palette.divider }}
        >
          <DashboardDropZoneComponent
            widgets={dashboardForm.values["widgets"]}
            setWidgets={(value) =>
              dashboardForm.setFieldValue("widgets", value)
            }
            layouts={dashboardForm.values["layouts"]}
            setLayouts={(value) => {
              dashboardForm.setFieldValue("layouts", value);
            }}
          />
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel
          defaultSize={30}
          className="w-full !h-[calc(100vh-48px)] !overflow-y-auto"
          style={{ background: theme.palette.background.default }}
        >
          <Grid sm={12} className="!top-0 !sticky !z-50">
            <div
              className="flex flex-row justify-start items-center p-3 "
              style={{ background: theme.palette.background.default }}
            >
              <FiSettings className="!text-base !font-semibold" />
              <span className="text-sm font-semibold text-start ml-2">{`Update dashboard : ${id}`}</span>
            </div>
            <div
              className="flex flex-col justify-center items-start p-3 "
              style={{ background: theme.palette.background.default }}
            >
              <FieldComponent
                name={"dashboard_title"}
                type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                value={dashboardForm.values["dashboard_title"]}
                onChange={dashboardForm.handleChange}
              />
              <div className="mt-2"></div>
              <FieldComponent
                name={"dashboard_description"}
                type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                value={dashboardForm.values["dashboard_description"]}
                onChange={dashboardForm.handleChange}
              />
              <div className="mt-3 w-full flex flex-row justify-end">
                <Button
                  variant="contained"
                  className="!ml-2"
                  onClick={dashboardForm.handleSubmit}
                >
                  {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
                </Button>
                <DashboardDeletionForm dashboardID={id} />
              </div>
            </div>
          </Grid>

          <Grid sm={12}>
            <WidgetsDnDList />
          </Grid>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
