import React from "react";
import { DatabaseChartAdditionForm } from "../../components/ui/databaseChartAdditionForm";
import { useParams } from "react-router-dom";



const AddDatabaseChartPage = () => {
    const { tenantID, databaseSchemaName } = useParams();
  return <DatabaseChartAdditionForm tenantID={tenantID}  databaseSchemaName={databaseSchemaName}/>;
};

export default AddDatabaseChartPage;
