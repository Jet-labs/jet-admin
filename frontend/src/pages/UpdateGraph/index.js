import { Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import {
  deleteGraphByIDAPI,
  getGraphDataByIDAPI,
  updateGraphAPI,
} from "../../api/graphs";

import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import { GraphComponentPreview } from "../../components/GraphComponents/GraphComponentPreview";
import { GraphEditor } from "../../components/GraphComponents/GraphEditor";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";

const UpdateGraph = () => {
  const theme = useTheme();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingGraphData,
    data: graphData,
    error: loadGraphDataError,
    refetch: refetchGraphData,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_GRAPH`, id],
    queryFn: () => getGraphDataByIDAPI({ graphID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
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
      displaySuccess("Updated graph successfully");
      queryClient.invalidateQueries([`REACT_QUERY_KEY_GRAPH`]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const {
    isPending: isDeletingGraph,
    isSuccess: isDeletingGraphSuccess,
    isError: isDeletingGraphError,
    error: deleteGraphError,
    mutate: deleteGraph,
  } = useMutation({
    mutationFn: () => {
      return deleteGraphByIDAPI({ graphID: id });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted graph layout successfully");
      queryClient.invalidateQueries([`REACT_QUERY_KEY_GRAPH`]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const graphForm = useFormik({
    initialValues: {
      graph_type: LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value,
      title_display_enabled: true,
      legend_position: LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION.TOP,
      graph_title: "",
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
      updateGraph({
        data: {
          pm_graph_id: graphData?.pm_graph_id,
          graph_title,
          graph_options,
        },
      });
    },
  });

  useEffect(() => {
    if (graphData) {
      console.log({ graphData });
      graphForm.setFieldValue("graph_type", graphData.graph_options.graph_type);
      graphForm.setFieldValue(
        "title_display_enabled",
        graphData.graph_options.title_display_enabled
      );
      graphForm.setFieldValue(
        "legend_position",
        graphData.graph_options.legend_position
      );
      graphForm.setFieldValue("graph_title", graphData.graph_title);

      graphForm.setFieldValue(
        "query_array",
        graphData.graph_options.query_array
      );
    }
  }, [graphData]);

  return (
    <div className="w-full">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 !border-b !border-white !border-opacity-10"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start ">{`Update graph`}</span>
        {graphData && (
          <span className="text-xs font-thin text-start text-slate-300">{`${graphData.graph_title} | Graph ID : ${graphData.pm_graph_id}`}</span>
        )}
      </div>
      <Grid container spacing={1} className="!px-3">
        <Grid item lg={5} md={4} className="w-full">
          <GraphEditor
            graphID={id}
            isLoading={isUpdatingGraph}
            graphForm={graphForm}
            deleteGraph={deleteGraph}
          />
        </Grid>
        {graphData && graphData.dataset && (
          <Grid item lg={7} md={8} className="w-full">
            <GraphComponentPreview
              graphType={graphForm.values["graph_type"]}
              legendPosition={graphForm.values["legend_position"]}
              titleDisplayEnabled={graphForm.values["title_display_enabled"]}
              graphTitle={graphForm.values["graph_title"]}
              data={graphData.dataset}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default UpdateGraph;
