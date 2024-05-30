import { Button, Grid, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";

import { useFormik } from "formik";
import { addDashboardLayoutAPI } from "../../api/dashboardLayouts";
import { FieldComponent } from "../../components/FieldComponent";
import { GraphsDnDList } from "../../components/GraphsDnDList";
import { GraphWidgetComponent } from "../../components/GraphWidgetComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";

const GraphLayoutDropZoneComponent = ({ graphIDs, setGraphIDs }) => {
  const theme = useTheme();

  const [isDraggableInDropZone, setIsDraggableInDropZone] = useState(false);
  const _enableDropping = (e) => {
    e.preventDefault();
  };
  const _handleDragOverStart = () => setIsDraggableInDropZone(true);
  const _handleDragOverEnd = () => setIsDraggableInDropZone(false);

  const _handleDrop = (e) => {
    const id = e.dataTransfer.getData("text");
    if (graphIDs && id) {
      const _graphIDs = [...graphIDs, parseInt(id.split("_")[1])];
      setGraphIDs(_graphIDs);
    }
    setIsDraggableInDropZone(false);
  };

  return (
    <div
      className="w-full h-full p-2"
      style={{ background: theme.palette.divider }}
    >
      <Grid
        className="w-full h-full"
        container
        style={
          isDraggableInDropZone
            ? {
                background: theme.palette.divider,
                borderRadius: 2,
                borderWidth: 2,
                borderStyle: "dotted",
                borderColor: theme.palette.info.main,
              }
            : {
                background: theme.palette.divider,
                borderRadius: 2,
                borderWidth: 1,
                borderStyle: "dotted",
                borderColor: theme.palette.info.dark,
              }
        }
        onDragEnter={_handleDragOverStart}
        onDragLeave={_handleDragOverEnd}
        onDragOver={_enableDropping}
        onDrop={_handleDrop}
      >
        {graphIDs?.map((graphID, index) => {
          return (
            <Grid item sx={6} md={6} lg={6} className="!p-1">
              <GraphWidgetComponent id={graphID} />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};
const AddDashboardLayoutView = () => {
  const theme = useTheme();

  const {
    isPending: isAddingDashboardLayout,
    isSuccess: isAddingDashboardLayoutSuccess,
    isError: isAddingDashboardLayoutError,
    error: addDashboardLayoutError,
    mutate: addDashboardLayout,
  } = useMutation({
    mutationFn: ({ data }) => {
      return addDashboardLayoutAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Added dashboard layout successfully");
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
      addDashboardLayout({
        data: { dashboard_layout_title, dashboard_layout_options },
      });
    },
  });
  return (
    <div className="w-full h-full">
      <Grid container className="!h-full">
        <Grid
          item
          lg={3}
          md={3}
          sm={4}
          className="w-full !border-r !border-white !border-opacity-10"
        >
          <Grid sm={12}>
            <div
              className="flex flex-row justify-between items-center p-3 !border-b !border-white !border-opacity-10"
              style={{ background: theme.palette.background.paper }}
            >
              <span className="text-lg font-bold text-start">{`Add new dashboard`}</span>
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
          lg={9}
          md={9}
          sm={8}
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
            graphIDs={dashboardLayoutForm.values["graph_ids"]}
            setGraphIDs={(value) =>
              dashboardLayoutForm.setFieldValue("graph_ids", value)
            }
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default AddDashboardLayoutView;
