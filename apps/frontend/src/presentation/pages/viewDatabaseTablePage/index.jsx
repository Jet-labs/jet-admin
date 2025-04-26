import { useParams, useSearchParams } from "react-router-dom";
import { DatabaseTableGrid } from "../../components/databaseTableComponents/databaseTableGrid";
import React from "react";

/**
 *
 * @param {object} param0
 * @returns
 */
const ViewDatabaseTablePage = () => {
  // Extract route parameters
  const { tenantID, databaseSchemaName, databaseTableName } = useParams();

  const [searchParams] = useSearchParams();
  const filterQuery = searchParams.get("filterQuery");

  let parsedFilterQuery = null;
  if (filterQuery) {
    try {
      parsedFilterQuery = JSON.parse(decodeURIComponent(filterQuery));
    } catch (error) {
      console.error("Failed to parse filterQuery:", error);
    }
  }

  console.log({ parsedFilterQuery });

  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full ">
      {databaseTableName && (
        <DatabaseTableGrid
          key={`${tenantID}.${databaseSchemaName}.${databaseTableName}`}
          tenantID={tenantID}
          databaseSchemaName={databaseSchemaName}
          databaseTableName={databaseTableName}
          showStats={true}
          initialFilterQuery={parsedFilterQuery}
        />
      )}
    </div>
  );
};

export default ViewDatabaseTablePage;
