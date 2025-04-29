import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { CONSTANTS } from "../../constants";
import { getDatabaseTableRowsAPI } from "../../data/apis/databaseTable";
import { PostgreSQLUtils } from "../../utils/postgre";
export const useDatabaseTableRows = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  page,
  pageSize,
  databaseTablePrimaryKey,
  filterQuery,
  databaseTableColumnSortModel,
}) => {
  const queryClient = useQueryClient();
  const queryKey = [
    CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES_ROWS(
      tenantID,
      databaseSchemaName,
      databaseTableName
    ),
    page,
    pageSize,
    filterQuery, // Use the generated query object as part of the key
    databaseTableColumnSortModel, // Use the generated sort string as part of the key
  ];
  const queryResult = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      getDatabaseTableRowsAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        page,
        pageSize,
        filterQuery: filterQuery,
        databaseTableColumnSortModel: databaseTableColumnSortModel
          ? PostgreSQLUtils.generateOrderByQuery(databaseTableColumnSortModel)
          : null,
      }),
    enabled: !!tenantID && !!databaseSchemaName && !!databaseTableName,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const _generateInitialRowID = useCallback(
    (row) => {
      if (databaseTablePrimaryKey) {
        return PostgreSQLUtils.combinePrimaryKeyToWhereClause(
          databaseTablePrimaryKey,
          row
        );
      } else {
        return PostgreSQLUtils.combinePrimaryKeyToWhereClause(["ctid"], row);
      }
    },
    [databaseTablePrimaryKey]
  );

  const processedDatabaseTableRows = queryResult.data?.rows?.map((_row) => {
    // eslint-disable-next-line no-unused-vars
    const { ctid, ...row } = _row;
    const __row__uid = _generateInitialRowID(_row);
    return { ...row, __row__uid };
  });

  return {
    ...queryResult,
    rows: processedDatabaseTableRows,
    reloadDatabaseTableRows: queryResult.refetch,
    invalidateDatabaseTableRows: () => {
      queryClient.invalidateQueries(queryKey);
    },
  };
};
