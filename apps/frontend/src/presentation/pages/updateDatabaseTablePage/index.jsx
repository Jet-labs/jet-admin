import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseTableUpdationForm } from "../../components/ui/databaseTableUpdationForm";

const UpdateDatabaseTablePage = () => {
  const { tenantID, databaseSchemaName, databaseTableName } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <DatabaseTableUpdationForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
        databaseTableName={databaseTableName}
      />
    </div>
  );
};

export default UpdateDatabaseTablePage;
