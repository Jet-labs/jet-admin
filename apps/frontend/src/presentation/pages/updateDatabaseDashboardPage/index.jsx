import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseDashboardUpdationForm } from "../../components/databaseDashboardComponents/databaseDashboardUpdationForm";

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
