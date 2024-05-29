import { Grid, useTheme } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
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

const AddDashboardLayoutView = () => {
  const theme = useTheme();

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
    <div className="w-full">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 !border-b !border-white !border-opacity-10"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start ">{`Add new dashboard`}</span>
      </div>
      <Grid container>
        <Grid item lg={3} md={4} sm={4} className="w-full">
          <GraphsDnDList />
        </Grid>
        <Grid item lg={9} md={8} sm={8} className="w-full">
          <div
            className="w-full h-full bg-red-50"
            // onDragCapture={(e) => {
            //   console.log("grad");
            // }}
            // onDragOver={(e) => {
            //   console.log("grad");
            // }}
            onDrop={(e) => {
              e.preventDefault();
              console.log("grad");
            }}
          ></div>
        </Grid>
      </Grid>
    </div>
  );
};

export default AddDashboardLayoutView;
