import React from "react";
import { DatabaseTableAdditionForm } from "../../components/databaseTableComponents/databaseTableAdditionForm";
import { useParams } from "react-router-dom";

const AddDatabaseTablePage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <DatabaseTableAdditionForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
      />
    </div>
  );
};

export default AddDatabaseTablePage;
