import { Button, IconButton, useTheme } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getDashboardByIDAPI } from "../../api/dashboards";
import { DashboardViewComponent } from "../../components/DashboardComponents/DashboardViewComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { LuPinOff, LuPin } from "react-icons/lu";

const DashboardView = () => {
  const { id } = useParams();
  const [isPinned, setIsPinned] = useState(
    parseInt(
      localStorage.getItem(LOCAL_CONSTANTS.STRINGS.DEFAULT_DASHBOARD_ID_STORAGE)
    ) == id
  );

  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [
    isDeleteDashboardConfirmationOpen,
    setIsDeleteDashboardConfirmationOpen,
  ] = useState(false);

  useEffect(() => {
    if (id) {
      setIsPinned(
        parseInt(
          localStorage.getItem(
            LOCAL_CONSTANTS.STRINGS.DEFAULT_DASHBOARD_ID_STORAGE
          )
        ) == id
      );
    }
  }, [id]);

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DASHBOARD_LAYOUTS`, id],
    queryFn: () => getDashboardByIDAPI({ pmDashboardID: id }),
    retry: 1,
  });

  const _handleNavigateToEditScreen = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.DASHBOARD_EDIT_VIEW.path(id));
  };

  const _handleToggleDashboardPin = () => {
    const pinnedDashboardID = localStorage.getItem(
      LOCAL_CONSTANTS.STRINGS.DEFAULT_DASHBOARD_ID_STORAGE
    );
    if (id == parseInt(pinnedDashboardID)) {
      localStorage.setItem(
        LOCAL_CONSTANTS.STRINGS.DEFAULT_DASHBOARD_ID_STORAGE,
        null
      );
      setIsPinned(false);
    } else {
      localStorage.setItem(
        LOCAL_CONSTANTS.STRINGS.DEFAULT_DASHBOARD_ID_STORAGE,
        String(id)
      );
      setIsPinned(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-stretch">
      {dashboard && (
        <div
          className="w-full flex flex-row justify-between items-center px-4 py-2 flex-shrink"
          style={{ background: theme.palette.background.default }}
        >
          <div className="!flex flex-row justify-start items-center">
            <span
              className="!text-lg font-bold"
              style={{ color: theme.palette.primary.main }}
            >
              {dashboard.pm_dashboard_title}
            </span>
            <IconButton onClick={_handleToggleDashboardPin}>
              {isPinned ? (
                <LuPinOff
                  style={{ color: theme.palette.primary.light }}
                  className="!text-base"
                />
              ) : (
                <LuPin
                  style={{ color: theme.palette.primary.light }}
                  className="!text-base"
                />
              )}
            </IconButton>
          </div>

          <Button
            variant="outlined"
            startIcon={<FiSettings />}
            onClick={_handleNavigateToEditScreen}
          >{`Edit dashboard`}</Button>
        </div>
      )}
      {dashboard && (
        <DashboardViewComponent
          widgets={
            dashboard.pm_dashboard_options
              ? dashboard.pm_dashboard_options.widgets
              : null
          }
          layouts={
            dashboard.pm_dashboard_options
              ? dashboard.pm_dashboard_options.layouts
              : null
          }
        />
      )}
    </div>
  );
};

export default DashboardView;
