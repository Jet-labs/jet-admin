import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { useFormik } from "formik";
import {
  addDashboardAPI,
  deleteDashboardByIDAPI,
  getDashboardByIDAPI,
  updateDashboardAPI,
} from "../../api/dashboards";
import { FieldComponent } from "../../components/FieldComponent";
import { DashboardDropZoneComponent } from "../../components/DashboardDropZoneComponent";
import { GraphsDnDList } from "../../components/GraphsDnDList";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import { useParams } from "react-router-dom";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";

const DashboardEditView = () => {
  const { id } = useParams();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [
    isDeleteDashboardConfirmationOpen,
    setIsDeleteDashboardConfirmationOpen,
  ] = useState(false);

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
      queryClient.invalidateQueries([`REACT_QUERY_KEY_DASHBOARD_LAYOUTS`]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const {
    isPending: isDeletingDashboard,
    isSuccess: isDeletingDashboardSuccess,
    isError: isDeletingDashboardError,
    error: deleteDashboardError,
    mutate: deleteDashboard,
  } = useMutation({
    mutationFn: () => {
      return deleteDashboardByIDAPI({ dashboardID: id });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted dashboard layout successfully");
      queryClient.invalidateQueries([`REACT_QUERY_KEY_DASHBOARD_LAYOUTS`]);
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

  const _handleOpenDeleteDashboardConfirmation = () => {
    setIsDeleteDashboardConfirmationOpen(true);
  };
  const _handleDeclineDeleteDashboardConfirmation = () => {
    setIsDeleteDashboardConfirmationOpen(false);
  };

  const _handleAcceptDeleteDashboardConfirmation = () => {
    deleteDashboard();
    setIsDeleteDashboardConfirmationOpen(false);
  };

  return (
    <div className="w-full h-full">
      <ConfirmationDialog
        open={isDeleteDashboardConfirmationOpen}
        onAccepted={_handleAcceptDeleteDashboardConfirmation}
        onDecline={_handleDeclineDeleteDashboardConfirmation}
        title={"Delete dashboard?"}
        message={`Are you sure you want to delete dashboard : ${dashboard?.dashboard_title}`}
      />
      <Grid container className="!h-full">
        <Grid
          item
          lg={9}
          md={9}
          sm={8}
          className="w-full !h-[calc(100vh-66px)]"
          // style={{ background: theme.palette.divider }}
        >
          <DashboardDropZoneComponent
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
              className="flex flex-row justify-start items-center p-3 !border-b !border-white !border-opacity-10"
              style={{ background: theme.palette.background.paper }}
            >
              <FiSettings className="!text-base !font-semibold" />
              <span className="text-sm font-semibold text-start ml-2">{`Update dashboard`}</span>
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
              <div className="mt-3 w-full flex flex-row justify-end">
                <Button
                  color="error"
                  variant="outlined"
                  onClick={_handleOpenDeleteDashboardConfirmation}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  className="!ml-2"
                  onClick={dashboardForm.handleSubmit}
                >
                  Save
                </Button>
              </div>
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

export default DashboardEditView;
