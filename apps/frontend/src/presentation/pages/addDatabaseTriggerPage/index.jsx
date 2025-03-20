import React from "react";
import { useParams } from "react-router-dom";
import { TriggerCreationForm } from "../../components/ui/triggerAdditionForm";

const AddDatabaseTriggerPage = () => {
  const { tenantID, databaseSchemaName, databaseTableName } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <TriggerCreationForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
      />
    </div>
  );
};

export default AddDatabaseTriggerPage;
