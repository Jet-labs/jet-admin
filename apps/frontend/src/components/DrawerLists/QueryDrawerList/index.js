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
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { FaPlus, FaRedo } from "react-icons/fa";
import { DiPostgresql } from "react-icons/di";
import { FaCloudSun } from "react-icons/fa6";
import { BiRadar } from "react-icons/bi";
import { getAllQueryAPI } from "../../../api/queries";
import { QUERY_PLUGINS_MAP } from "../../../plugins/queries";

export const QueryDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `query_${routeParam?.["*"]}`;

  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddQuery = useMemo(() => {
    return pmUser && pmUser.isAuthorizedToAddQuery;
  }, [pmUser]);
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

  const _navigateToAddMoreQuery = () => {
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
          {"Queries"}
        </span>
        <IconButton onClick={refetchQueries}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {isAuthorizedToAddQuery && (
        <div className="!px-3 !py-1.5 !w-full">
          <Button
            onClick={_navigateToAddMoreQuery}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            Add query
          </Button>
        </div>
      )}
      <div className="!mt-1"></div>

      {queries && queries.length > 0
        ? queries.map((query) => {
            const key = `query_${query.pm_query_id}`;
            return (
              <Link
                to={LOCAL_CONSTANTS.ROUTES.QUERY_VIEW.path(query.pm_query_id)}
                key={key}
              >
                <ListItem
                  key={`_query_${query.pm_query_id}`}
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
                      {QUERY_PLUGINS_MAP[query.pm_query_type] ? (
                        QUERY_PLUGINS_MAP[query.pm_query_type].icon
                      ) : (
                        <FaCloudSun className="!text-sm" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                      }}
                      primary={query.pm_query_title}
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
