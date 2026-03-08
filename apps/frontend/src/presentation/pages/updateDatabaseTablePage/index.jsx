import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseTableUpdationForm } from "../../components/databaseTableComponents/databaseTableUpdationForm";

const UpdateDatabaseTablePage = () => {
  const { tenantID, databaseSchemaName, databaseTableName } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <DatabaseTableUpdationForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
        databaseTableName={databaseTableName}
      />
    </div>
  );
};

export default UpdateDatabaseTablePage;
