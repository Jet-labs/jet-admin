import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { getGraphDataByIDAPI, updateGraphAPI } from "../../../api/graphs";

import { useFormik } from "formik";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { GraphComponentPreview } from "../GraphComponentPreview";
import { GraphEditor } from "../GraphEditor";
import { GRAPH_PLUGINS_MAP } from "../GraphTypes";
import { GraphDeletionForm } from "../GraphDeletionForm";

export const GraphUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingGraphData,
    data: graphData,
    error: loadGraphDataError,
    refetch: refetchGraphData,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.GRAPHS, id],
    queryFn: () => getGraphDataByIDAPI({ pmGraphID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });
  const {
    isPending: isUpdatingGraph,
    isSuccess: isUpdatingGraphSuccess,
    isError: isUpdatingGraphError,
    error: updateGraphError,
    mutate: updateGraph,
  } = useMutation({
    mutationFn: ({ data }) => {
      return updateGraphAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.GRAPH_UPDATED_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.GRAPHS]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const graphForm = useFormik({
    initialValues: {
      pm_graph_id: id,
      graph_type: GRAPH_PLUGINS_MAP.BAR.value,
      title_display_enabled: true,
      legend_position: LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION.TOP,
      pm_graph_title: "",
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
      updateGraph({
        data: {
          pm_graph_id: graphData?.pm_graph_id,
          pm_graph_title,
          pm_graph_options,
        },
      });
    },
  });

  useEffect(() => {
    if (graphData) {
      graphForm.setFieldValue(
        "graph_type",
        graphData.pm_graph_options.graph_type
      );
      graphForm.setFieldValue(
        "title_display_enabled",
        graphData.pm_graph_options.title_display_enabled
      );
      graphForm.setFieldValue(
        "legend_position",
        graphData.pm_graph_options.legend_position
      );
      graphForm.setFieldValue("pm_graph_title", graphData.pm_graph_title);

      graphForm.setFieldValue(
        "query_array",
        graphData.pm_graph_options.query_array
      );
      graphForm.setFieldValue(
        "refetch_interval",
        graphData.pm_graph_options.refetch_interval
      );
    }
  }, [graphData]);

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
            {LOCAL_CONSTANTS.STRINGS.GRAPH_UPDATE_PAGE_TITLE}
          </span>
          {graphData && (
            <span
              className="text-xs font-thin text-start text-slate-300"
              style={{ color: theme.palette.text.secondary }}
            >{`${graphData.pm_graph_title} | Graph ID : ${graphData.pm_graph_id}`}</span>
          )}
        </div>
        <div>
          <Button
            variant="contained"
            onClick={_handleSubmit}
            disabled={isUpdatingGraph}
          >
            {LOCAL_CONSTANTS.STRINGS.SUBMIT_BUTTON_TEXT}
          </Button>
          {(id != null || id != undefined) && <GraphDeletionForm id={id} />}
        </div>
      </div>
      <Grid container spacing={1} className="!pl-3 pr-6">
        <Grid item lg={5} md={4} className="w-full">
          <GraphEditor pmGraphID={id} graphForm={graphForm} />
        </Grid>
        {graphData && graphData.dataset && (
          <Grid item lg={7} md={8} className="w-full">
            <GraphComponentPreview
              graphType={graphForm.values["graph_type"]}
              legendPosition={graphForm.values["legend_position"]}
              titleDisplayEnabled={graphForm.values["title_display_enabled"]}
              pmGraphTitle={graphForm.values["pm_graph_title"]}
              data={graphData.dataset}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
};
