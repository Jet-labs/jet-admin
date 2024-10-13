import { Button, FormControl, Grid, TextField, useTheme } from "@mui/material";
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
    queryFn: () => getDashboardByIDAPI({ pmDashboardID: id }),
    retry: 0,
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

  const dashboardUpdateForm = useFormik({
    initialValues: {
      pm_dashboard_title: "",
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
      const {
        pm_dashboard_title,
        pm_dashboard_description,
        ...pm_dashboard_options
      } = values;
      updateDashboard({
        data: {
          pm_dashboard_id: id,
          pm_dashboard_title: pm_dashboard_title,
          pm_dashboard_description: pm_dashboard_description,
          pm_dashboard_options,
        },
      });
    },
  });

  useEffect(() => {
    if (dashboard) {
      dashboardUpdateForm.setFieldValue(
        "pm_dashboard_title",
        dashboard.pm_dashboard_title
      );
      dashboardUpdateForm.setFieldValue(
        "pm_dashboard_description",
        dashboard.pm_dashboard_description
      );
      dashboardUpdateForm.setFieldValue(
        "widgets",
        dashboard.pm_dashboard_options.widgets
      );
      dashboardUpdateForm.setFieldValue(
        "layouts",
        dashboard.pm_dashboard_options.layouts
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
            widgets={dashboardUpdateForm.values["widgets"]}
            setWidgets={(value) =>
              dashboardUpdateForm.setFieldValue("widgets", value)
            }
            layouts={dashboardUpdateForm.values["layouts"]}
            setLayouts={(value) => {
              dashboardUpdateForm.setFieldValue("layouts", value);
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
              <FormControl fullWidth size="small" className="">
                <span className="text-xs font-light  !capitalize mb-1">{`Dashboard title`}</span>
                <TextField
                  required={true}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="text"
                  name={"pm_dashboard_title"}
                  value={dashboardUpdateForm.values["pm_dashboard_title"]}
                  onChange={dashboardUpdateForm.handleChange}
                  onBlur={dashboardUpdateForm.handleBlur}
                  error={dashboardUpdateForm.errors["pm_dashboard_title"]}
                />
              </FormControl>
              <FormControl fullWidth size="small" className="!mt-3">
                <span className="text-xs font-light  !capitalize mb-1">{`Description`}</span>
                <TextField
                  required={true}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="text"
                  name={"pm_dashboard_description"}
                  value={dashboardUpdateForm.values["pm_dashboard_description"]}
                  onChange={dashboardUpdateForm.handleChange}
                  onBlur={dashboardUpdateForm.handleBlur}
                  error={dashboardUpdateForm.errors["pm_dashboard_description"]}
                />
              </FormControl>
              <div className="mt-3 w-full flex flex-row justify-end">
                <Button
                  variant="contained"
                  className="!ml-2"
                  onClick={dashboardUpdateForm.handleSubmit}
                >
                  {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
                </Button>
                <DashboardDeletionForm id={id} />
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
