import { FaChartLine } from "react-icons/fa";
import { GrDrag } from "react-icons/gr";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAllGraphAPI } from "../../../api/graphs";
import { useAuthState } from "../../../contexts/authContext";
import { GRAPH_PLUGINS_MAP } from "../../../plugins/graphs";
import "./styles.css";
export const GraphsDnDList = ({}) => {
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
    staleTime: Infinity,
  });

  const _handleDragStart = (e) => {
    e.dataTransfer.setData("text", e.currentTarget.id);
  };

  return (
    <List
      aria-labelledby="nested-list-subheader"
      className="!overflow-y-auto !overflow-x-hidden w-full !py-0 !px-2"
    >
      {graphs?.map((graph, index) => {
        const key = `graph_${graph.pm_graph_id}`;
        return (
          <ListItem
            key={`graph_${graph.pm_graph_id}`}
            id={`graph_${graph.pm_graph_id}`}
            disablePadding
            // sx={{
            //   borderRight: 0,
            //   borderColor: theme.palette.primary.main,
            // }}
            draggable
            onDragStart={_handleDragStart}
            className="draggable-graph-item"
            sx={{
              marginTop: 1,
              marginBottom: index === graphs.length - 1 ? 1 : 0,
              // minHeight: 800,
            }}
          >
            <ListItemButton
              sx={{ background: theme.palette.background.default }}
              className="!rounded !shadow-md !flex !flex-row !justify-between !items-center !w-full"
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
              >
                {GRAPH_PLUGINS_MAP[graph.graph_options.graph_type] ? (
                  GRAPH_PLUGINS_MAP[graph.graph_options.graph_type].icon
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
                className="draggable-graph-drag-icon-main"
              >
                <GrDrag className="!text-sm" />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
