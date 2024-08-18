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
import { FaChalkboardTeacher, FaPlus, FaRedo } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllDashboardAPI } from "../../../api/dashboards";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { MdSpaceDashboard } from "react-icons/md";
export const DashboardsDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `dashboard_${routeParam?.["*"]}`;
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddDashboard = useMemo(() => {
    return pmUser && pmUser.extractDashboardAdditionAuthorization();
  }, [pmUser]);
  const {
    isLoading: isLoadingDashboards,
    data: dashboards,
    error: loadDashboardsError,
    refetch: refetchDashboards,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DASHBOARD_LAYOUTS`],
    queryFn: () => getAllDashboardAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const _navigateToAddMoreDashboard = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_DASHBOARD_LAYOUT.path());
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
          className="!font-semibold"
          style={{ color: theme.palette.primary.main }}
        >
          {"Dashboard Layouts"}
        </span>
        <IconButton onClick={refetchDashboards}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {isAuthorizedToAddDashboard && (
        <div className="!px-3 !py-1.5 !w-full">
          <Button
            onClick={_navigateToAddMoreDashboard}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            Add more dashboards
          </Button>
        </div>
      )}
      <div className="!mt-1"></div>
      {dashboards && dashboards.length > 0
        ? dashboards.map((dashboard) => {
            const key = `dashboard_${dashboard.pm_dashboard_id}`;
            return (
              <Link
                to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(
                  dashboard.pm_dashboard_id
                )}
                key={key}
              >
                <ListItem
                  key={`_dashboard_${dashboard.pm_dashboard_id}`}
                  disablePadding
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
                      <MdSpaceDashboard className="!text-lg" />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                      }}
                      primary={dashboard.dashboard_title}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: key == currentPage ? "700" : "500",
                          fontSize: 12,
                          marginLeft: 2,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {/* <Divider className="!mx-4" /> */}
              </Link>
            );
          })
        : null}
    </List>
  );
};
