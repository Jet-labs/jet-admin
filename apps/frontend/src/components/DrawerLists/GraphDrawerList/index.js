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
import { FaChartLine, FaPlus, FaRedo } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllGraphAPI } from "../../../api/graphs";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { GRAPH_PLUGINS_MAP } from "../../GraphComponents/GraphTypes";

export const GraphDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `graph_${routeParam?.["*"]}`;

  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddGraph = useMemo(() => {
    return pmUser && pmUser.extractGraphAdditionAuthorization();
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
    staleTime: 0,
  });

  const _navigateToAddMoreGraph = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_GRAPH.path());
  };
 
  return (
    <List
      style={{
        borderRightWidth: 1,
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.default,
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-48px)] !overflow-y-auto !overflow-x-hidden w-full"
    >
      <div className="!px-3.5 py-1 flex flex-row justify-between items-center w-full">
        <span
          style={{ color: theme.palette.primary.main }}
          className="!font-semibold"
        >
          {"Graphs"}
        </span>
        <IconButton onClick={refetchGraphs}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {isAuthorizedToAddGraph && (
        <div className="!px-3 !py-1.5 !w-full">
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
      <div className="!mt-1"></div>
      {graphs && graphs.length > 0
        ? graphs.map((graph) => {
            const key = `graph_${graph.pm_graph_id}`;
            const graphPlugin = graph.graph_options?.graph_type
              ? GRAPH_PLUGINS_MAP[graph.graph_options?.graph_type]
              : null;
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
                      background: theme.palette.background.paper,
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
                      {graphPlugin ? (
                        graphPlugin.icon
                      ) : (
                        <FaChartLine className="!text-lg" />
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
          })
        : null}
    </List>
  );
};
