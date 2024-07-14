import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useFormik } from "formik";

import { FieldComponent } from "../../../components/FieldComponent";

import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { FiPlus } from "react-icons/fi";
import { DashboardDropZoneComponent } from "../DashboardDropZoneComponent";
import { GraphsDnDList } from "../GraphsDnDList";
import { addDashboardAPI } from "../../../api/dashboards";

export const DashboardAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isPending: isAddingDashboard,
    isSuccess: isAddingDashboardSuccess,
    isError: isAddingDashboardError,
    error: addDashboardError,
    mutate: addDashboard,
  } = useMutation({
    mutationFn: ({ data }) => {
      return addDashboardAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Added dashboard successfully");
      queryClient.invalidateQueries([`REACT_QUERY_KEY_GRAPH`]);
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
      const { dashboard_title, ...dashboard_options } = values;
      addDashboard({
        data: { dashboard_title, dashboard_options },
      });
    },
  });
  return (
    <div className="w-full h-full">
      <Grid container className="!h-full">
        <Grid
          item
          lg={9}
          md={9}
          sm={8}
          className="w-full !h-[calc(100vh-48px)]"
          style={{ background: theme.palette.divider }}
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
          className="w-full !h-[calc(100vh-48px)] !overflow-y-auto"
          style={{
            background: theme.palette.background.default,
            borderLeftWidth: 1,
            borderColor: theme.palette.divider,
          }}
        >
          <Grid sm={12} className="!top-0 !sticky !z-50">
            <div
              className="flex flex-row justify-start items-center p-3"
              style={{ background: theme.palette.background.default }}
            >
              <FiPlus className="!text-base !font-semibold" />
              <span className="text-sm font-semibold text-start ml-2">{`Add new dashboard`}</span>
            </div>
            <div
              className="flex flex-col justify-center items-start p-3"
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
