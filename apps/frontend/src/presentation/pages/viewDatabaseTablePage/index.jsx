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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
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
