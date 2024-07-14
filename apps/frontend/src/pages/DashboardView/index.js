import { Button, useTheme } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { FiSettings } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getDashboardByIDAPI } from "../../api/dashboards";
import { DashboardViewComponent } from "../../components/DashboardComponents/DashboardViewComponent";
import { LOCAL_CONSTANTS } from "../../constants";
const DashboardView = () => {
  const { id } = useParams();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [
    isDeleteDashboardConfirmationOpen,
    setIsDeleteDashboardConfirmationOpen,
  ] = useState(false);

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DASHBOARD_LAYOUTS`, id],
    queryFn: () => getDashboardByIDAPI({ dashboardID: id }),
    retry: 1,
  });

  const _handleNavigateToEditScreen = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.DASHBOARD_EDIT_VIEW.path(id));
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-stretch">
      {dashboard && (
        <div
          className="w-full flex flex-row justify-between items-center px-4 py-2 pb-0 flex-shrink"
          style={{ background: theme.palette.background.default }}
        >
          <span
            className="!text-lg font-bold"
            style={{ color: theme.palette.primary.main }}
          >
            {dashboard.dashboard_title}
          </span>
          <Button
            variant="outlined"
            startIcon={<FiSettings />}
            onClick={_handleNavigateToEditScreen}
          >{`Edit dashboard`}</Button>
        </div>
      )}
      {dashboard && (
        <DashboardViewComponent
          graphIDData={
            dashboard.dashboard_options
              ? dashboard.dashboard_options.graph_ids
              : null
          }
        />
      )}
    </div>
  );
};

export default DashboardView;
