import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllGraphAPI } from "../../../api/graphs";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaPlus,
  FaRedo,
} from "react-icons/fa";

import { BiRadar } from "react-icons/bi";

export const GraphDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `graph_${routeParam?.["*"]}`;

  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddGraph = useMemo(() => {
    return pmUser && pmUser.extractAuthorizationForGraphAddFromPolicyObject();
  }, [pmUser]);
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

  const _navigateToAddMoreGraph = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_GRAPH.path());
  };
  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-66px)] !overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      <div className="!px-3.5 py-1 flex flex-row justify-between items-center w-full">
        <span className="!font-semibold">{"Graphs"}</span>
        <IconButton onClick={refetchGraphs}>
          <FaRedo className="!text-sm" />
        </IconButton>
      </div>
      {isAuthorizedToAddGraph && (
        <div className="!p-3 !w-full !pb-1.5">
          <Button
            onClick={_navigateToAddMoreGraph}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            Add more graphs
          </Button>
        </div>
      )}

      {graphs?.map((graph) => {
        const key = `graph_${graph.pm_graph_id}`;
        return (
          <Link
            to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(graph.pm_graph_id)}
            key={key}
          >
            <ListItem
              key={`_graph_${graph.pm_graph_id}`}
              disablePadding
              sx={{}}
              className="!px-3 !py-1.5"
            >
              <ListItemButton
                sx={{
                  background: theme.palette.background.default,
                  border: key == currentPage ? 1 : 0,
                  borderColor: theme.palette.primary.main,
                }}
                selected={key == currentPage}
                className="!rounded"
              >
                <ListItemIcon
                  className="!ml-1"
                  sx={{
                    color:
                      key == currentPage
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                    minWidth: 0,
                  }}
                >
                  {graph.graph_options.graph_type ===
                  LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value ? (
                    <FaChartBar className="!text-sm" />
                  ) : graph.graph_options.graph_type ===
                      LOCAL_CONSTANTS.GRAPH_TYPES.PIE.value ||
                    graph.graph_options.graph_type ===
                      LOCAL_CONSTANTS.GRAPH_TYPES.DOUGHNUT.value ||
                    graph.graph_options.graph_type ===
                      LOCAL_CONSTANTS.GRAPH_TYPES.POLAR_AREA.value ? (
                    <FaChartPie className="!text-sm" />
                  ) : graph.graph_options.graph_type ===
                    LOCAL_CONSTANTS.GRAPH_TYPES.RADAR.value ? (
                    <BiRadar className="!text-sm" />
                  ) : (
                    <FaChartLine className="!text-sm" />
                  )}
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color:
                      key == currentPage
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                  primary={graph.graph_title}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: key == currentPage ? "700" : "500",
                      marginLeft: 2,
                      fontSize: 12,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Link>
        );
      })}
    </List>
  );
};
