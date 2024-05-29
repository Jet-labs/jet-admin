import { SsidChart, BarChart, DataUsage, TableRows } from "@mui/icons-material";
import DataObjectIcon from "@mui/icons-material/DataObject";
import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getAllGraphAPI } from "../../api/graphs";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthState } from "../../contexts/authContext";
import { useMemo } from "react";

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

  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className="!overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      {graphs?.map((graph) => {
        const key = `graph_${graph.pm_graph_id}`;
        return (
          <ListItem
            key={`_graph_${graph.pm_graph_id}`}
            disablePadding
            sx={{
              borderRight: 0,
              borderColor: theme.palette.primary.main,
            }}
            draggable
          >
            <ListItemButton
              sx={{ background: theme.palette.background.default }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
              >
                {graph.graph_options.graph_type ===
                LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value ? (
                  <BarChart sx={{ fontSize: 16 }} />
                ) : graph.graph_options.graph_type ===
                  LOCAL_CONSTANTS.GRAPH_TYPES.PIE.value ? (
                  <DataUsage sx={{ fontSize: 16 }} />
                ) : (
                  <SsidChart sx={{ fontSize: 16 }} />
                )}
              </ListItemIcon>
              <ListItemText
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
                primary={graph.title}
                primaryTypographyProps={{
                  sx: {
                    marginLeft: -2,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
