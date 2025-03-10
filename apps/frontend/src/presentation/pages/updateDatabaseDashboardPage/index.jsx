import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseDashboardUpdationForm } from "../../components/ui/databaseDashboardUpdationForm";

const UpdateDatabaseDashboardPage = () => {
  const { tenantID, databaseDashboardID } = useParams();
  return (
    <DatabaseDashboardUpdationForm
      tenantID={tenantID}
      databaseDashboardID={databaseDashboardID}
    />
  );
};

export default UpdateDatabaseDashboardPage;
