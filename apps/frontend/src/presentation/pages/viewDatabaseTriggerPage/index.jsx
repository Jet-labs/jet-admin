import { useParams } from "react-router-dom";
import { DatabaseTriggerView } from "../../components/databaseTriggerComponents/databaseTriggerView";
import React from "react";

/**
 *
 * @param {object} param0
 * @returns
 */
const ViewDatabaseTriggerPage = () => {
  // Extract route parameters
  const {
    tenantID,
    databaseSchemaName,
    databaseTableName,
    databaseTriggerName,
  } = useParams();
  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-y-auto">
      {databaseTriggerName && (
        <DatabaseTriggerView
          key={`trigger_${tenantID}.${databaseSchemaName}.${databaseTriggerName}`}
          tenantID={tenantID}
          databaseSchemaName={databaseSchemaName}
          databaseTableName={databaseTableName}
          databaseTriggerName={databaseTriggerName}
        />
      )}
    </div>
  );
};

export default ViewDatabaseTriggerPage;
