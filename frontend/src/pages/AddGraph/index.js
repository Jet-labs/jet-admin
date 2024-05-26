import { Grid } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { addGraphAPI } from "../../api/graphs";
import { GraphBuilderForm } from "../../components/GraphBuilderForm";
import { GraphBuilderPreview } from "../../components/GraphBuilderPreview";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";

const AddGraph = () => {
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
      graph_type: LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value,
      legend_enabled: true,
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
      <Grid container spacing={1} className="!px-3">
        <Grid item lg={5} md={4} className="w-full">
          <GraphBuilderForm isLoading={isAddingGraph} graphForm={graphForm} />
        </Grid>
        <Grid item lg={7} md={8} className="w-full">
          <GraphBuilderPreview
            graphType={graphForm.values["graph_type"]}
            legendPosition={graphForm.values["legend_position"]}
            legendDisplay={graphForm.values["legend_enabled"]}
            graphTitle={graphForm.values["graph_title"]}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default AddGraph;
