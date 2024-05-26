import { Grid, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getGraphDataByIDAPI } from "../../api/graphs";
import { LineGraphComponent } from "../../components/LineGraphComponent";
import { LOCAL_CONSTANTS } from "../../constants";

const GraphView = () => {
  const theme = useTheme();
  const id = 4;
  const {
    isLoading: isLoadingGraphData,
    data: graphData,
    error: loadGraphDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_GRAPH`, id],
    queryFn: () => getGraphDataByIDAPI({ graphID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });
  console.log(graphData);
  return (
    <div className="!pt-10  !sticky !top-0 !z-50">
      <Grid
        container
        rowSpacing={2}
        className="rounded !p-3"
        style={{ background: theme.palette.action.selected }}
      >
        {graphData &&
          graphData.graph_options.graph_type ===
            LOCAL_CONSTANTS.GRAPH_TYPES.LINE.value && (
            <LineGraphComponent
              legendPosition={graphData.graph_options.legend_position}
              legendDisplay={graphData.graph_options.legend_display}
              graphTitle={graphData.graph_options.graph_title}
              data={graphData.dataset}
            />
          )}
      </Grid>
    </div>
  );
};

export default GraphView;
