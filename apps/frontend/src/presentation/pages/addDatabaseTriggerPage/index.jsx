import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseTriggerAdditionForm } from "../../components/databaseTriggerComponents/databaseTriggerAdditionForm";

const AddDatabaseTriggerPage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <DatabaseTriggerAdditionForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
      />
    </div>
  );
};

export default AddDatabaseTriggerPage;
