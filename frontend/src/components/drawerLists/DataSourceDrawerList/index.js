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
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaPlus,
  FaRedo,
} from "react-icons/fa";
import { DiPostgresql } from "react-icons/di";
import { FaCloudSun } from "react-icons/fa6";
import { BiRadar } from "react-icons/bi";
import { getAllDataSourceAPI } from "../../../api/dataSources";

export const DataSourceDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `data_source_${routeParam?.["*"]}`;

  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddDataSource = useMemo(() => {
    return (
      pmUser && pmUser.extractAuthorizationForDataSourceAddFromPolicyObject()
    );
  }, [pmUser]);
  const {
    isLoading: isLoadingDataSources,
    data: dataSources,
    error: loadDataSourcesError,
    refetch: refetchDataSources,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DATA_SOURCE`],
    queryFn: () => getAllDataSourceAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });

  const _navigateToAddMoreDataSource = () => {
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
        <span className="!font-semibold">{"Data sources"}</span>
        <IconButton onClick={refetchDataSources}>
          <FaRedo className="!text-sm" />
        </IconButton>
      </div>
      {isAuthorizedToAddDataSource && (
        <div className="!p-3 !w-full !pb-1.5">
          <Button
            onClick={_navigateToAddMoreDataSource}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            Add data source
          </Button>
        </div>
      )}
      <div className="!mt-1"></div>

      {dataSources?.map((dataSource) => {
        const key = `data_source_${dataSource.pm_data_source_id}`;
        return (
          <Link
            to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(
              dataSource.pm_data_source_id
            )}
            key={key}
          >
            <ListItem
              key={`_data_source_${dataSource.pm_data_source_id}`}
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
                  {dataSource.pm_data_source_type ==
                  LOCAL_CONSTANTS.DATA_SOURCE_TYPES.POSTGRE_QUERY.value ? (
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
                  primary={dataSource.pm_data_source_title}
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
