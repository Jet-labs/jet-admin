import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseNotificationUpdationForm } from "../../components/databaseNotificationComponents/databaseNotificationUpdationForm";



const UpdateDatabaseNotificationPage = () => {
    const { tenantID,databaseNotificationID } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <DatabaseNotificationUpdationForm
        tenantID={tenantID}
        databaseNotificationID={databaseNotificationID}
      />
    </div>
  );
};

export default UpdateDatabaseNotificationPage;
