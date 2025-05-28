import React from "react";
import { useParams } from "react-router-dom";
import { DashboardUpdationForm } from "../../components/dashboardComponents/dashboardUpdationForm";

const UpdateDashboardPage = () => {
  const { tenantID, dashboardID } = useParams();
  return (
    <DashboardUpdationForm tenantID={tenantID} dashboardID={dashboardID} />
  );
};

export default UpdateDashboardPage;
