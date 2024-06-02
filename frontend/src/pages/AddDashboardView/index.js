import { Button, Grid, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { useFormik } from "formik";
import { addDashboardAPI } from "../../api/dashboards";
import { FieldComponent } from "../../components/FieldComponent";
import { GraphLayoutDropZoneComponent } from "../../components/GraphLayoutDropZoneComponent";
import { GraphsDnDList } from "../../components/GraphsDnDList";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";

const AddDashboardView = () => {
  const theme = useTheme();

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
      displaySuccess("Added dashboard layout successfully");
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
          className="w-full !h-[calc(100vh-66px)]"
          style={{ background: theme.palette.divider }}
        >
          {/* <Grid
            xs={12}
            md={12}
            lg={12}
            item
            className="!p-2"
            style={{ background: theme.palette.divider }}
          >
            <FieldComponent
              name={"dashboard_title"}
              type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
              value={dashboardForm.values["dashboard_title"]}
              onChange={dashboardForm.handleChange}
            />
          </Grid> */}
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
          className="w-full !border-r !border-white !border-opacity-10  !h-[calc(100vh-66px)] !overflow-y-auto"
        >
          <Grid sm={12} className="!top-0 !sticky !z-50">
            <div
              className="flex flex-row justify-between items-center p-3 !border-b !border-white !border-opacity-10"
              style={{ background: theme.palette.background.paper }}
            >
              <span className="text-lg font-bold text-start">{`Add new dashboard`}</span>
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

export default AddDashboardView;
