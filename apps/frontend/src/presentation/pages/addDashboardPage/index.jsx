import React from "react";
import { DashboardAdditionForm } from "../../components/dashboardComponents/dashboardAdditionForm";
import { useParams } from "react-router-dom";

const AddDashboardPage = () => {
  const { tenantID } = useParams();
  return <DashboardAdditionForm tenantID={tenantID} />;
};

export default AddDashboardPage;
