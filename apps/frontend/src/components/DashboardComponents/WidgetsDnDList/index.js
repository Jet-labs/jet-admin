import { FaPlus, FaChartLine } from "react-icons/fa";
import { GrDrag } from "react-icons/gr";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getAllGraphAPI } from "../../../api/graphs";
import { useAuthState } from "../../../contexts/authContext";
import { GRAPH_PLUGINS_MAP } from "../../../plugins/graphs";
import "./styles.css";
import { LOCAL_CONSTANTS } from "../../../constants";
import { getAllQueryAPI } from "../../../api/queries";
import { QUERY_PLUGINS_MAP } from "../../../plugins/queries";

export const WidgetsDnDList = ({}) => {
  const theme = useTheme();
  const { pmUser } = useAuthState();
  const navigate = useNavigate();

  const {
    isLoading: isLoadingGraphs,
    data: graphs,
    error: loadGraphsError,
    refetch: refetchGraphs,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_GRAPH`],
    queryFn: () => getAllGraphAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingQueries,
    data: queries,
    error: loadQueriesError,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_QUERIES`],
    queryFn: () => getAllQueryAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const _handleDragStart = (e) => {
    e.dataTransfer.setData("widget", `${e.currentTarget.id}-${Date.now()}`);
  };

  return (
    <List
      aria-labelledby="nested-list-subheader"
      className="!overflow-y-auto !overflow-x-hidden w-full !py-0 !px-3"
      style={{ background: theme.palette.background.default }}
    >
      {graphs && graphs.length > 0 && (
        <ListSubheader
          className="!text-xs !font-medium !py-1 !px-0"
          style={{ background: theme.palette.background.default }}
        >{`Graphs`}</ListSubheader>
      )}

      {graphs &&
        graphs.length > 0 &&
        graphs.map((graph, index) => {
          const key = `graph_${graph.pm_graph_id}`;
          const graphPlugin = graph.graph_options?.graph_type
            ? GRAPH_PLUGINS_MAP[graph.graph_options?.graph_type]
            : null;
          return (
            <ListItem
              key={key}
              id={key}
              disablePadding
              draggable={true}
              onDragStart={_handleDragStart}
              className="draggable-graph-item"
              sx={{
                marginTop: 1,
                marginBottom: index === graphs.length - 1 ? 1 : 0,
                // minHeight: 800,
              }}
            >
              <ListItemButton
                sx={{
                  background: theme.palette.background.default,
                  border: 1,
                  borderColor: theme.palette.divider,
                  borderWidth: 1,
                }}
                className="!rounded  !flex !flex-row !justify-between !items-center !w-full"
                style={{}}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  {graphPlugin ? (
                    graphPlugin.icon
                  ) : (
                    <FaChartLine className="!text-sm" />
                  )}
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                  primary={graph.graph_title}
                  primaryTypographyProps={{
                    sx: {
                      marginLeft: -2,
                    },
                  }}
                />
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                  className="draggable-drag-icon-main"
                >
                  <GrDrag className="!text-sm" />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          );
        })}
      {queries && queries.length > 0 && (
        <ListSubheader
          className="!text-xs !font-medium !py-1 !px-0"
          style={{ background: theme.palette.background.default }}
        >{`Queries`}</ListSubheader>
      )}

      {queries &&
        queries.length > 0 &&
        queries.map((query, index) => {
          const key = `query_${query.pm_query_id}`;
          const queryPlugin = query.pm_query_type
            ? QUERY_PLUGINS_MAP[query.pm_query_type]
            : null;
          return (
            <ListItem
              key={key}
              id={key}
              disablePadding
              draggable={true}
              onDragStart={_handleDragStart}
              className="draggable-query-item"
              sx={{
                marginTop: 1,
                marginBottom: index === queries.length - 1 ? 1 : 0,
                // minHeight: 800,
              }}
            >
              <ListItemButton
                sx={{
                  background: theme.palette.background.default,
                  border: 1,
                  borderColor: theme.palette.divider,
                  borderWidth: 1,
                }}
                className="!rounded  !flex !flex-row !justify-between !items-center !w-full"
                style={{}}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  {queryPlugin ? (
                    queryPlugin.icon
                  ) : (
                    <FaChartLine className="!text-sm" />
                  )}
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                  primary={query.pm_query_title}
                  primaryTypographyProps={{
                    sx: {
                      marginLeft: -2,
                    },
                  }}
                />
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                  className="draggable-drag-icon-main"
                >
                  <GrDrag className="!text-sm" />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          );
        })}
      {!queries || queries.length == 0 || !graphs || graphs.length == 0 ? (
        <Link
          to={`../../${LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.path()}/${LOCAL_CONSTANTS.ROUTES.ADD_GRAPH.path()}`}
        >
          <ListItemButton
            sx={{
              background: theme.palette.background.default,
              border: `1px dotted`,
              borderColor: theme.palette.info.main,
              borderWidth: 2,
              marginTop: 1,
            }}
            className="!rounded  !flex !flex-row !justify-between !items-center !w-full"
          >
            <ListItemIcon
              sx={{
                color: theme.palette.primary.contrastText,
              }}
            >
              <FaPlus className="!text-sm" />
            </ListItemIcon>
            <ListItemText
              sx={{
                color: theme.palette.primary.contrastText,
              }}
              primary={`No graphs found. Add graphs`}
              primaryTypographyProps={{
                sx: {
                  marginLeft: -2,
                },
              }}
            />
          </ListItemButton>
        </Link>
      ) : null}
    </List>
  );
};
