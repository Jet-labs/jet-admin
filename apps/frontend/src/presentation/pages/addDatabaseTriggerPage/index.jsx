import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseTriggerAdditionForm } from "../../components/databaseTriggerComponents/databaseTriggerAdditionForm";

const AddDatabaseTriggerPage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <DatabaseTriggerAdditionForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
      />
    </div>
  );
};

export default AddDatabaseTriggerPage;
