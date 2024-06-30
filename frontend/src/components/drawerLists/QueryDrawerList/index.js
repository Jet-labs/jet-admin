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

export const QueryDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `query_${routeParam?.["*"]}`;

  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddQuery = useMemo(() => {
    return pmUser && pmUser.extractAuthorizationForQueryAddFromPolicyObject();
  }, [pmUser]);
  const {
    isLoading: isLoadingQueries,
    data: queries,
    error: loadQueriesError,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DATA_SOURCE`],
    queryFn: () => getAllQueryAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });

  const _navigateToAddMoreQuery = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_GRAPH.path());
  };
  console.log({ queries });
  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-66px)] !overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      <div className="!px-3.5 py-1 flex flex-row justify-between items-center w-full">
        <span className="!font-semibold">{"Queries"}</span>
        <IconButton onClick={refetchQueries}>
          <FaRedo className="!text-sm" />
        </IconButton>
      </div>
      {isAuthorizedToAddQuery && (
        <div className="!p-3 !w-full !pb-1.5">
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

      {queries?.map((masterQuery) => {
        const key = `query_${masterQuery.pm_query_master_id}`;
        return (
          <Link
            to={LOCAL_CONSTANTS.ROUTES.QUERY_VIEW.path(
              masterQuery.pm_query_master_id
            )}
            key={key}
          >
            <ListItem
              key={`_query_${masterQuery.pm_query_master_id}`}
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
                  {masterQuery.pm_query_type ==
                  LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE.POSTGRE_QUERY.value ? (
                    <DiPostgresql className="!text-lg" />
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
                  primary={masterQuery.query?.getTitle()}
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
