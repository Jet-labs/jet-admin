import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseTriggerCreationForm } from "../../components/databaseTriggerComponents/databaseTriggerAdditionForm";

const AddDatabaseTriggerPage = () => {
  const { tenantID, databaseSchemaName, databaseTableName } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <DatabaseTriggerCreationForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
      />
    </div>
  );
};

export default AddDatabaseTriggerPage;
