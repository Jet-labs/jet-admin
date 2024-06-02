import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { useFormik } from "formik";
import {
  addDashboardAPI,
  getDashboardByIDAPI,
  updateDashboardAPI,
} from "../../api/dashboards";
import { FieldComponent } from "../../components/FieldComponent";
import { GraphLayoutDropZoneComponent } from "../../components/GraphLayoutDropZoneComponent";
import { GraphsDnDList } from "../../components/GraphsDnDList";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import { useParams } from "react-router-dom";

const DashboardView = () => {
  const { id } = useParams();
  const theme = useTheme();

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DASHBOARD_LAYOUTS`, id],
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
      displaySuccess("Updated dashboard layout successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const dashboardForm = useFormik({
    initialValues: {
      dashboard_title: "",
      graph_ids: [],
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
        "graph_ids",
        dashboard.dashboard_options.graph_ids
      );
    }
  }, [dashboard]);
  return (
    <div className="w-full h-full">
      <Grid container className="!h-full">
        <Grid
          item
          lg={9}
          md={9}
          sm={8}
          className="w-full !h-[calc(100vh-66px)]"
          style={{ background: theme.palette.divider }}
        >
          <GraphLayoutDropZoneComponent
            graphIDData={dashboardForm.values["graph_ids"]}
            setGraphIDData={(value) =>
              dashboardForm.setFieldValue("graph_ids", value)
            }
          />
        </Grid>
        <Grid
          item
          lg={3}
          md={3}
          sm={4}
          className="w-full !border-r !border-white !border-opacity-10 !h-[calc(100vh-66px)] !overflow-y-auto"
        >
          <Grid sm={12} className="!top-0 !sticky !z-50">
            <div
              className="flex flex-row justify-between items-center p-3 !border-b !border-white !border-opacity-10"
              style={{ background: theme.palette.background.paper }}
            >
              <span className="text-sm font-medium text-start">{`Update dashboard`}</span>
              <Button variant="contained" onClick={dashboardForm.handleSubmit}>
                Save
              </Button>
            </div>
            <div
              className="flex flex-col justify-center items-start p-3 !border-b !border-white !border-opacity-10"
              style={{ background: theme.palette.background.paper }}
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
            </div>
          </Grid>

          <Grid sm={12}>
            <GraphsDnDList />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardView;
