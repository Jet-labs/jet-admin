import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { useFormik } from "formik";
import {
  addDashboardLayoutAPI,
  getDashboardLayoutByIDAPI,
  updateDashboardLayoutAPI,
} from "../../api/dashboardLayouts";
import { FieldComponent } from "../../components/FieldComponent";
import { GraphLayoutDropZoneComponent } from "../../components/GraphLayoutDropZoneComponent";
import { GraphsDnDList } from "../../components/GraphsDnDList";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import { useParams } from "react-router-dom";

const UpdateDashboardLayoutView = () => {
  const { id } = useParams();
  const theme = useTheme();

  const {
    isLoading: isLoadingDashboardLayout,
    data: dashboardLayout,
    error: loadDashboardLayoutError,
    refetch: refetchDashboardLayout,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DASHBOARD_LAYOUTS`, id],
    queryFn: () => getDashboardLayoutByIDAPI({ graphID: id }),

    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });

  console.log({ dashboardLayout });
  const {
    isPending: isUpdatingDashboardLayout,
    isSuccess: isUpdatingDashboardLayoutSuccess,
    isError: isUpdatingDashboardLayoutError,
    error: updateDashboardLayoutError,
    mutate: updateDashboardLayout,
  } = useMutation({
    mutationFn: ({ data }) => {
      return updateDashboardLayoutAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Updated dashboard layout successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const dashboardLayoutForm = useFormik({
    initialValues: {
      dashboard_layout_title: "",
      graph_ids: [],
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      const { dashboard_layout_title, ...dashboard_layout_options } = values;
      updateDashboardLayout({
        data: {
          pm_dashboard_layout_id: id,
          title: dashboard_layout_title,
          dashboard_layout_options,
        },
      });
    },
  });

  useEffect(() => {
    if (dashboardLayout) {
      dashboardLayoutForm.setFieldValue(
        "dashboard_layout_title",
        dashboardLayout.title
      );
      dashboardLayoutForm.setFieldValue(
        "graph_ids",
        dashboardLayout.dashboard_layout_options.graph_ids
      );
    }
  });
  return (
    <div className="w-full h-full">
      <Grid container className="!h-full">
        <Grid
          item
          xl={2}
          lg={3}
          md={3}
          sm={3}
          className="w-full !border-r !border-white !border-opacity-10"
        >
          <Grid sm={12}>
            <div
              className="flex flex-row justify-between items-center p-3 !border-b !border-white !border-opacity-10"
              style={{ background: theme.palette.background.paper }}
            >
              <span className="text-sm font-medium text-start">{`Update dashboard`}</span>
              <Button
                variant="contained"
                onClick={dashboardLayoutForm.handleSubmit}
              >
                Save
              </Button>
            </div>
          </Grid>
          <Grid sm={12}>
            <GraphsDnDList />
          </Grid>
        </Grid>

        <Grid
          item
          xl={10}
          lg={9}
          md={9}
          sm={9}
          className="w-full !overflow-y-auto"
          style={{ background: theme.palette.divider }}
        >
          <Grid
            xs={12}
            md={12}
            lg={12}
            item
            className="!p-2"
            style={{ background: theme.palette.divider }}
          >
            <FieldComponent
              name={"dashboard_layout_title"}
              type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
              value={dashboardLayoutForm.values["dashboard_layout_title"]}
              onChange={dashboardLayoutForm.handleChange}
            />
          </Grid>
          <GraphLayoutDropZoneComponent
            graphIDData={dashboardLayoutForm.values["graph_ids"]}
            setGraphIDData={(value) =>
              dashboardLayoutForm.setFieldValue("graph_ids", value)
            }
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default UpdateDashboardLayoutView;
