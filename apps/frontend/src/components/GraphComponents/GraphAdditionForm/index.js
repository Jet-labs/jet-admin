import { Button, Grid } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { addGraphAPI } from "../../../api/graphs";
import { GraphComponentPreview } from "../GraphComponentPreview";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useTheme } from "@emotion/react";
import { GraphEditor } from "../GraphEditor";
import { GRAPH_PLUGINS_MAP } from "../GraphTypes";

export const GraphAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
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
      displaySuccess(LOCAL_CONSTANTS.STRINGS.GRAPH_ADDITION_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.GRAPHS]);
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
      pm_graph_title: "",
      refetch_interval: 5,
      query_array: [{ dataset_title: "", query: "" }],
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      const { pm_graph_title, ...pm_graph_options } = values;
      addGraph({ data: { pm_graph_title, pm_graph_options } });
    },
  });

  const _handleSubmit = () => {
    graphForm.handleSubmit();
  };

  return (
    <div className="w-full h-full overflow-y-scroll">
      <div
        className="flex flex-row items-center justify-between p-3 px-6"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.GRAPH_ADDITION_PAGE_TITLE}
          </span>
        </div>
        <div>
          <Button
            variant="contained"
            onClick={_handleSubmit}
            disabled={isAddingGraph}
          >
            {LOCAL_CONSTANTS.STRINGS.SUBMIT_BUTTON_TEXT}
          </Button>
        </div>
      </div>
      <Grid container spacing={1} className="!px-3">
        <Grid item lg={7} md={8} className="w-full">
          <GraphComponentPreview
            graphType={graphForm.values["graph_type"]}
            legendPosition={graphForm.values["legend_position"]}
            titleDisplayEnabled={graphForm.values["title_display_enabled"]}
            pmGraphTitle={graphForm.values["pm_graph_title"]}
          />
        </Grid>
        <Grid item lg={5} md={4} className="w-full">
          <GraphEditor graphForm={graphForm} />
        </Grid>
      </Grid>
    </div>
  );
};
