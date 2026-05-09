import React from "react";
import { useParams } from "react-router-dom";
import { DashboardUpdationForm } from "../../components/dashboardComponents/dashboardUpdationForm";

const UpdateDashboardPage = () => {
  const { tenantID, dashboardID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <DashboardUpdationForm tenantID={tenantID} dashboardID={dashboardID} />
    </div>
  );
};

export default UpdateDashboardPage;
