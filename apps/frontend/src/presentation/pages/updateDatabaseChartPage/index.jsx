import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseChartUpdationForm } from "../../components/ui/databaseChartUpdationForm";

const UpdateDatabaseChartPage = () => {
  const { tenantID, databaseChartID } = useParams();
  return (
    <DatabaseChartUpdationForm
      tenantID={tenantID}
      databaseChartID={databaseChartID}
    />
  );
};

export default UpdateDatabaseChartPage;
