import React from "react";
import { DatabaseTableAdditionForm } from "../../components/databaseTableComponents/databaseTableAdditionForm";
import { useParams } from "react-router-dom";

const AddDatabaseTablePage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <DatabaseTableAdditionForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
      />
    </div>
  );
};

export default AddDatabaseTablePage;
