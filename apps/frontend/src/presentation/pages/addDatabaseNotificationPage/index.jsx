import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseNotificationAdditionForm } from "../../components/databaseNotificationComponents/databaseNotificationAdditionForm";

const AddDatabaseNotificationPage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <DatabaseNotificationAdditionForm
        tenantID={tenantID}
        databaseSchemaName={databaseSchemaName}
      />
    </div>
  );
};

export default AddDatabaseNotificationPage;
