import React from "react";
import { DatabaseDashboardAdditionForm } from "../../components/ui/databaseDashboardAdditionForm";
import { useParams } from "react-router-dom";

const AddDatabaseDashboardPage = () => {
  const { tenantID } = useParams();
  return <DatabaseDashboardAdditionForm tenantID={tenantID} />;
};

export default AddDatabaseDashboardPage;
