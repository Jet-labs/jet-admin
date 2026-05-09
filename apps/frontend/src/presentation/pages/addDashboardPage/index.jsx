import React from "react";
import { DashboardAdditionForm } from "../../components/dashboardComponents/dashboardAdditionForm";
import { useParams } from "react-router-dom";

const AddDashboardPage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <DashboardAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddDashboardPage;
