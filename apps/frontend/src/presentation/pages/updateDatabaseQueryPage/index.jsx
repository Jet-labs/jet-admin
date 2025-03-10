import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseQueryUpdationForm } from "../../components/ui/databaseQueryUpdationForm";



const UpdateDatabaseQueryPage = () => {
    const { tenantID, databaseSchemaName,databaseQueryID } = useParams();
  return (
    <DatabaseQueryUpdationForm
      tenantID={tenantID}
      databaseSchemaName={databaseSchemaName}
      databaseQueryID={databaseQueryID}
    />
  );
};

export default UpdateDatabaseQueryPage;
