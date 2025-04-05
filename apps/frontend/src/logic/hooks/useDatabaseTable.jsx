import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getDatabaseTableByNameAPI } from "../../data/apis/databaseTable";

export const useDatabaseTable = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
}) => {
  const queryKey = CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES_META(
    tenantID,
    databaseSchemaName,
    databaseTableName
  );

  const queryResult = useQuery({
    queryKey: [queryKey],
    queryFn: () =>
      getDatabaseTableByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
      }),
    enabled: !!tenantID && !!databaseSchemaName && !!databaseTableName, // Only run if identifiers are present
    refetchOnWindowFocus: false,
  });
  return {
    ...queryResult,
    databaseTableColumns: queryResult.data?.databaseTableColumns,
    databaseTableConstraints: queryResult.data?.databaseTableConstraints,
    databaseTablePrimaryKey: queryResult.data?.primaryKey,
    databaseTableColumnForeignKeyMap: queryResult.data?.columnForeignKeyMap,
  };
};
