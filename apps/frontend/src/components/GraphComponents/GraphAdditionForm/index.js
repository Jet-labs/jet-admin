import { Grid } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { addGraphAPI } from "../../../api/graphs";
import { GraphComponentPreview } from "../GraphComponentPreview";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useTheme } from "@emotion/react";
import { GRAPH_PLUGINS_MAP } from "../../../plugins/graphs";
import { GraphEditor } from "../GraphEditor";

export const GraphAdditionForm = () => {
  const theme = useTheme();
  const {
    isPending: isAddingGraph,
    isSuccess: isAddingGraphSuccess,
    isError: isAddingGraphError,
    error: addGraphError,
    mutate: addGraph,
  } = useMutation({
    mutationFn: ({ data }) => {
      return addGraphAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Added graph successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const graphForm = useFormik({
    initialValues: {
      graph_type: GRAPH_PLUGINS_MAP.BAR.value,
      title_display_enabled: true,
      legend_position: LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION.TOP,
      graph_title: "",
      x_axis: "",
      y_axis: "",
      query_array: [{ dataset_title: "", query: "" }],
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      const { graph_title, ...graph_options } = values;
      addGraph({ data: { graph_title, graph_options } });
    },
  });

  return (
    <div className="w-full">
      <div
        className="flex flex-col items-start justify-start p-3 px-6"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">{`Add new graph`}</span>
      </div>
      <Grid container spacing={1} className="!px-3">
        <Grid item lg={5} md={4} className="w-full">
          <GraphEditor graphForm={graphForm} />
        </Grid>
        <Grid item lg={7} md={8} className="w-full">
          <GraphComponentPreview
            graphType={graphForm.values["graph_type"]}
            legendPosition={graphForm.values["legend_position"]}
            titleDisplayEnabled={graphForm.values["title_display_enabled"]}
            graphTitle={graphForm.values["graph_title"]}
          />
        </Grid>
      </Grid>
    </div>
  );
};
