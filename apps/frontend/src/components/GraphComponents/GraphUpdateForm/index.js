import { Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { getGraphDataByIDAPI, updateGraphAPI } from "../../../api/graphs";

import { useFormik } from "formik";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { GraphComponentPreview } from "../GraphComponentPreview";
import { GraphEditor } from "../GraphEditor";
import { GRAPH_PLUGINS_MAP } from "../GraphTypes";


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
    queryFn: () => getGraphDataByIDAPI({ graphID: id }),
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
      graphForm.setFieldValue(
        "refetch_interval",
        graphData.graph_options.refetch_interval
      );
    }
  }, [graphData]);

  return (
    <div className="w-full h-full overflow-y-scroll">
      <div
        className="flex flex-col items-start justify-start p-3 px-6"
        style={{
          background: theme.palette.background.default,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start ">
          {LOCAL_CONSTANTS.STRINGS.GRAPH_UPDATE_PAGE_TITLE}
        </span>
        {graphData && (
          <span
            className="text-xs font-thin text-start text-slate-300"
            style={{ color: theme.palette.text.secondary }}
          >{`${graphData.graph_title} | Graph ID : ${graphData.pm_graph_id}`}</span>
        )}
      </div>
      <Grid container spacing={1} className="!px-3">
        <Grid item lg={5} md={4} className="w-full">
          <GraphEditor graphID={id} graphForm={graphForm} />
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
