import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  addGraphAPI,
  getGraphDataByIDAPI,
  updateGraphAPI,
} from "../../api/graphs";
import { LineGraphComponent } from "../../components/LineGraphComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { useFormik } from "formik";
import { GraphBuilderForm } from "../../components/GraphBuilderForm";
import { GraphBuilderPreview } from "../../components/GraphBuilderPreview";
import { displayError, displaySuccess } from "../../utils/notification";
import { useParams } from "react-router-dom";
import { GraphsDnDList } from "../../components/GraphsDnDList";
import { GraphBuilderPreviewWrapper } from "../../components/GraphBuilderPreviewWrapper";

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
    console.log(`Somebody dropped an element with id: ${id}`);
    if (graphIDs && id && !graphIDs.includes(parseInt(id.split("_")[1]))) {
      const _graphIDs = [...graphIDs, parseInt(id.split("_")[1])];
      setGraphIDs(_graphIDs);
    }
    setIsDraggableInDropZone(false);
  };
  console.log({ graphIDs });
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
            <Grid item sx={6}>
              <GraphBuilderPreviewWrapper id={graphID} />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};
const AddDashboardLayoutView = () => {
  const theme = useTheme();
  const [graphIDs, setGraphIDs] = useState([]);
  const dashboardLayoutForm = useFormik({
    initialValues: {
      dashboard_title: "",
      dashboard_description: "",
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      const { dashboard_title, dashboard_description, ...graph_options } =
        values;
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
          className="w-full !border-r !border-white !border-opacity-10 "
        >
          <Grid sm={12}>
            <div
              className="flex flex-row justify-between items-center p-3 !border-b !border-white !border-opacity-10"
              style={{ background: theme.palette.background.paper }}
            >
              <span className="text-lg font-bold text-start">{`Add new dashboard`}</span>
              <Button variant="contained">Save</Button>
            </div>
          </Grid>
          <Grid sm={12}>
            <GraphsDnDList />
          </Grid>
        </Grid>
        <Grid item lg={9} md={9} sm={8} className="w-full">
          <GraphLayoutDropZoneComponent
            graphIDs={graphIDs}
            setGraphIDs={setGraphIDs}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default AddDashboardLayoutView;
