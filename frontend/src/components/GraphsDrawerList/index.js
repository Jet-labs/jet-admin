import {
  SsidChart,
  BarChart,
  DataUsage,
  TableRows,
  TrackChanges,
} from "@mui/icons-material";
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

export const GraphsDrawerList = ({ setCurrentPageTitle, currentPageTitle }) => {
  const theme = useTheme();
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
      <ListItemButton>
        <ListItemIcon>
          <TableRows sx={{}} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            sx: { marginLeft: -2 },
          }}
          primary="Graphs"
        />
      </ListItemButton>
      {isAuthorizedToAddGraph && (
        <div className="!p-3 !w-full !pb-1.5">
          <Button
            onClick={_navigateToAddMoreGraph}
            variant="contained"
            className="!w-full"
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
            onClick={() => {
              setCurrentPageTitle(key);
            }}
            key={key}
          >
            <ListItem
              key={`_graph_${graph.pm_graph_id}`}
              disablePadding
              // sx={{
              //   borderRight: key == currentPageTitle ? 3 : 0,
              //   borderColor: theme.palette.primary.main,
              // }}
              className="!px-3 !py-1.5"
            >
              <ListItemButton
                sx={{ background: theme.palette.background.default }}
                selected={key == currentPageTitle}
                className="!rounded"
              >
                <ListItemIcon
                  className="!ml-1"
                  sx={{
                    color:
                      key == currentPageTitle
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                >
                  {graph.graph_options.graph_type ===
                  LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value ? (
                    <BarChart sx={{ fontSize: 16 }} />
                  ) : graph.graph_options.graph_type ===
                      LOCAL_CONSTANTS.GRAPH_TYPES.PIE.value ||
                    graph.graph_options.graph_type ===
                      LOCAL_CONSTANTS.GRAPH_TYPES.DOUGHNUT.value ||
                    graph.graph_options.graph_type ===
                      LOCAL_CONSTANTS.GRAPH_TYPES.POLAR_AREA.value ? (
                    <DataUsage sx={{ fontSize: 16 }} />
                  ) : graph.graph_options.graph_type ===
                    LOCAL_CONSTANTS.GRAPH_TYPES.RADAR.value ? (
                    <TrackChanges sx={{ fontSize: 16 }} />
                  ) : (
                    <SsidChart sx={{ fontSize: 16 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color:
                      key == currentPageTitle
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                  primary={graph.title}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: key == currentPageTitle ? "700" : "500",
                      marginLeft: -2,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
            {/* <Divider className="!mx-4" /> */}
          </Link>
        );
      })}
    </List>
  );
};
