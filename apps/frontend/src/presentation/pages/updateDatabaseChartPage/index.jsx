import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseChartUpdationForm } from "../../components/databaseChartComponents/databaseChartUpdationForm";

const UpdateDatabaseChartPage = () => {
  const { tenantID, databaseChartID } = useParams();
  return (
    <DatabaseChartUpdationForm
      tenantID={tenantID}
      databaseChartID={databaseChartID}
      key={databaseChartID}
    />
  );
};

export default UpdateDatabaseChartPage;
