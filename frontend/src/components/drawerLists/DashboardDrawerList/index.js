import { SsidChart, TableRows } from "@mui/icons-material";
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
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getAllDashboardAPI } from "../../../api/dashboards";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";

export const DashboardsList = ({ currentPageTitle }) => {
  const theme = useTheme();
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddDashboard = useMemo(() => {
    return (
      pmUser && pmUser.extractAuthorizationForDashboardAddFromPolicyObject()
    );
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
    staleTime: Infinity,
  });

  const _navigateToAddMoreDashboard = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_DASHBOARD_LAYOUT.path());
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
          primary="Dashboard Layouts"
        />
      </ListItemButton>
      {isAuthorizedToAddDashboard && (
        <div className="!p-3 !w-full !pb-1.5">
          <Button
            onClick={_navigateToAddMoreDashboard}
            variant="contained"
            className="!w-full"
          >
            Add more dashboards
          </Button>
        </div>
      )}

      {dashboards?.map((dashboard) => {
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
                  <SsidChart sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color:
                      key == currentPageTitle
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                  primary={dashboard.dashboard_title}
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
