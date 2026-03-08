import { DataGrid } from "@mui/x-data-grid";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "react-data-grid/lib/styles.css";
import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../../../constants";

import { capitalize, lowerCase } from "lodash";
import PropTypes from "prop-types";
import { FaPlus, FaTimes } from "react-icons/fa";
import {
  MdOutlineDensityLarge,
  MdOutlineDensityMedium,
  MdOutlineDensitySmall,
  MdOutlineRefresh,
} from "react-icons/md";
import { useDatabaseTable } from "../../../logic/hooks/useDatabaseTable";
import { useDatabaseTableMutations } from "../../../logic/hooks/useDatabaseTableMutations";
import { useDatabaseTableRows } from "../../../logic/hooks/useDatabaseTableRows";
import { useDatabaseTableStatistics } from "../../../logic/hooks/useDatabaseTableStatistics";
import { displayError } from "../../../utils/notification";
import { PostgreSQLUtils } from "../../../utils/postgre";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { DatabaseTableColumnFilter } from "./databaseTableColumnFilter";
import { getFormattedTableColumns } from "./databaseTableGridFormatter";
import { DatabaseTableRowsDeletionForm } from "./databaseTableRowsDeletionForm";
import { DatabaseTableRowsExportForm } from "./databaseTableRowsExportForm";
import { DatabaseTableStatistics } from "./databaseTableStatistics";
import { AppliedFilters, AppliedFiltersBadge, AppliedFiltersCompact } from "./databaseTableAppliedFilters";

import { Button, Checkbox, Spinner } from "@jet-admin/ui";
export const DatabaseTableGrid = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  showStats,
  containerClass,
  initialFilterQuery,
  visiblyShowPagination = true,
  visiblyShowFilters = true,
}) => {
  DatabaseTableGrid.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    showStats: PropTypes.bool,
    containerClass: PropTypes.string,
    initialFilterQuery: PropTypes.object,
  };
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [databaseTableColumnFilters, setDatabaseTableColumnFilters] = useState(
    initialFilterQuery || []
  );

  // eslint-disable-next-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [databaseTableColumnSortModel, setDatabaseTableColumnSortModel] =
    useState(null);
  const [multipleSelectedQuery, setMultipleSelectedQuery] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [isSelectAllRowCheckBoxEnabled, setIsSelectAllRowCheckBoxEnabled] =
    useState(false);
  const [isAllRowSelectChecked, setIsAllRowSelectChecked] = useState(false);
  const [
    isDatabaseTableColumnFiltersMenuOpen,
    setIsDatabaseTableColumnFilterMenuOpen,
  ] = useState(false);
  const [databaseTableRowChanges, setDatabaseTableRowChanges] = useState({});
  const [
    databaseTableRowChangesForUITracking,
    setDatabaseTableRowChangesForUITracking,
  ] = useState({});

  const [databaseTableNewRows, setDatabaseTableNewRows] = useState([]);
  const [_rowSelectionModel, _setRowSelectionModel] = useState();
  const [databaseTableGridDensity, setDatabaseTableGridDensity] =
    useState("compact");
  const datagridRef = useRef();
  const datagridAPIRef = useRef();

  const databaseTableRowChangeCount = Object.values(
    databaseTableRowChangesForUITracking
  ).reduce((acc, row) => acc + Object.keys(row).length, 0);

  const {
    databaseTableColumns,
    databaseTablePrimaryKey,
    databaseTableColumnForeignKeyMap,
    isLoading: isLoadingDatabaseTable,
    error: loadDatabaseTableError,
    isFetching: isFetchingDatabaseTable,
  } = useDatabaseTable({
    tenantID,
    databaseSchemaName,
    databaseTableName,
  });

  const {
    isLoading: isLoadingDatabaseTableRows,
    rows: databaseTableRows,
    error: loadDatabaseTableRowsError,
    isFetching: isFetchingDatabaseTableRows,
    reloadDatabaseTableRows,
    invalidateDatabaseTableRows,
  } = useDatabaseTableRows({
    tenantID,
    databaseSchemaName,
    databaseTableName,
    page,
    pageSize,
    databaseTablePrimaryKey,
    filterQuery,
    databaseTableColumnSortModel,
  });

  const { databaseTableRowCount, isLoading: isLoadingDatabaseTableStatistics } =
    useDatabaseTableStatistics({
      tenantID,
      databaseSchemaName,
      databaseTableName,
      filterQuery,
    });

  useEffect(() => {
    /**
     * Build complex filter query from filter structure
     * Handles nested groups, special operators, and combinators
     */
    const buildComplexFilterQuery = (filters) => {
      if (!filters || filters.length === 0) return null;

      const stack = [{ combinator: 'AND', queries: [] }];
      let currentLevel = stack[0];

      filters.forEach((filter) => {
        // Handle group start - create new nesting level
        if (filter.groupStart) {
          const newLevel = { combinator: 'AND', queries: [] };
          stack.push(newLevel);
          currentLevel = newLevel;
          return;
        }

        // Handle group end - pop level and add to parent
        if (filter.groupEnd) {
          const completedLevel = stack.pop();
          currentLevel = stack[stack.length - 1];

          if (completedLevel.queries.length > 0) {
            const groupQuery = completedLevel.queries.length === 1
              ? completedLevel.queries[0]
              : { [completedLevel.combinator]: completedLevel.queries };
            currentLevel.queries.push(groupQuery);
          }
          return;
        }

        // Handle combinator
        if (filter.combinator) {
          currentLevel.combinator = filter.combinator;
          return;
        }

        // Handle regular filter rule
        if (filter.field && filter.operator) {
          const query = buildFilterCondition(filter);
          if (query) {
            currentLevel.queries.push(query);
          }
        }
      });

      // Build final query from root level
      if (currentLevel.queries.length === 0) return null;
      if (currentLevel.queries.length === 1) return currentLevel.queries[0];
      return { [currentLevel.combinator]: currentLevel.queries };
    };

    /**
     * Build a single filter condition with proper operator handling
     */
    const buildFilterCondition = (filter) => {
      const { field, operator, value } = filter;

      // Map operators to query format
      const operatorMap = {
        '=': 'eq',
        '!=': 'ne',
        '>': 'gt',
        '>=': 'gte',
        '<': 'lt',
        '<=': 'lte',
        'LIKE': 'like',
        'NOT LIKE': 'nlike',
        'ILIKE': 'ilike',
        'NOT ILIKE': 'nilike',
        'IN': 'in',
        'NOT IN': 'nin',
        'IS NULL': 'null',
        'IS NOT NULL': 'nnull',
        '@>': 'contains',      // JSON contains
        '<@': 'containedBy',   // JSON contained by
        '?': 'hasKey',         // JSON has key
      };

      // Handle NULL checks (no value needed)
      if (operator === 'IS NULL') {
        return { [field]: { null: true } };
      }
      if (operator === 'IS NOT NULL') {
        return { [field]: { nnull: true } };
      }

      // Handle BETWEEN operator
      if (operator === 'BETWEEN') {
        if (Array.isArray(value) && value.length === 2) {
          return {
            AND: [
              { [field]: { gte: value[0] } },
              { [field]: { lte: value[1] } },
            ],
          };
        }
        return null;
      }

      // Handle STARTS_WITH
      if (operator === 'STARTS_WITH') {
        return { [field]: { ilike: `${value}%` } };
      }

      // Handle ENDS_WITH
      if (operator === 'ENDS_WITH') {
        return { [field]: { ilike: `%${value}` } };
      }

      // Handle array values (IN, NOT IN)
      if (Array.isArray(value)) {
        const mappedOp = operatorMap[operator] || operator.toLowerCase();
        return { [field]: { [mappedOp]: value } };
      }

      // Handle standard operators
      const mappedOperator = operatorMap[operator] || operator.toLowerCase();
      return { [field]: { [mappedOperator]: value } };
    };

    /**
     * Build search query across all string columns
     */
    const buildSearchQuery = (searchTerm) => {
      if (!searchTerm || !databaseTableColumns) return null;

      const searchQueries = [];
      const trimmedSearchTerm = searchTerm.trim();

      databaseTableColumns.forEach((column) => {
        const columnType = CONSTANTS.POSTGRE_SQL_DATA_TYPES[
          column.databaseTableColumnType
        ];

        // Only search in string type columns
        if (
          columnType &&
          columnType.normalizedType === CONSTANTS.DATA_TYPES.STRING
        ) {
          searchQueries.push({
            [column.databaseTableColumnName]: {
              ilike: `%${trimmedSearchTerm}%`,
            },
          });
        }
      });

      if (searchQueries.length === 0) return null;
      if (searchQueries.length === 1) return searchQueries[0];
      return { OR: searchQueries };
    };

    /**
     * Combine filters and search into final query
     */
    const buildFinalQuery = () => {
      let filterQuery = null;
      let searchQuery = null;

    // Build filter query from complex filter structure
      if (
        databaseTableColumns &&
        databaseTableName &&
        databaseTableColumnFilters &&
        databaseTableColumnFilters.length > 0
      ) {
        filterQuery = buildComplexFilterQuery(databaseTableColumnFilters);
      }

      // Build search query
      if (
        databaseTableColumns &&
        databaseTableName &&
        debouncedSearchTerm &&
        debouncedSearchTerm.trim() !== ""
      ) {
        searchQuery = buildSearchQuery(debouncedSearchTerm.trim());
      }

      // Combine filter and search queries
      if (filterQuery && searchQuery) {
        // Both filters and search exist - combine with AND
        // This means: apply filters AND match search term
        setFilterQuery?.({ AND: [filterQuery, searchQuery] });
      } else if (filterQuery) {
        // Only filters
        setFilterQuery?.(filterQuery);
      } else if (searchQuery) {
        // Only search
        setFilterQuery?.(searchQuery);
      } else {
        // No filters or search
        setFilterQuery?.(null);
      }
    };

    buildFinalQuery();
  }, [
    databaseTableColumnFilters,
    debouncedSearchTerm,
    databaseTableColumns,
    databaseTableName,
    setFilterQuery,
  ]);

  console.log({ "filterQuery": filterQuery, "searchTerm": searchTerm, "databaseTableColumnFilters": databaseTableColumnFilters });

  const formattedDatabaseTableColumns = useMemo(() => {
    if (databaseTableColumns && databaseTableName) {
      const c = getFormattedTableColumns({
        databaseTableColumns,
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTableColumnForeignKeyMap,
      });
      return c;
    } else {
      return null;
    }
  }, [
    databaseTableName,
    databaseTableColumnForeignKeyMap,
    databaseTableColumns,
  ]);

  const _getRowID = useCallback(
    (row) => {
      if (row.__is__new__row) {
        return row.__new__row__uuid;
      } else {
        return row.__row__uid;
      }
    },
    [databaseTablePrimaryKey]
  );

  const _handleToggleAllRowSelectCheckbox = useCallback(
    (v) => {
      setIsAllRowSelectChecked(v);
    },
    [setIsAllRowSelectChecked]
  );

  const _handleToggleDatabaseTableGridDensity = useCallback(() => {
    setDatabaseTableGridDensity((prev) => {
      // Toggle between 'compact', 'comfortable', and 'spacious'
      if (prev === "compact") {
        return "comfortable";
      } else if (prev === "comfortable") {
        return "standard";
      } else {
        return "compact"; // Default back to 'compact' after 'spacious'
      }
    });
  }, [setDatabaseTableGridDensity]);

  const _handleMultipleSelectedRowsQueryBuilder = useCallback(
    (rowSelectionModel) => {
      if (rowSelectionModel.length == 0) {
        setMultipleSelectedQuery(null);
        setIsSelectAllRowCheckBoxEnabled(false);
        _handleToggleAllRowSelectCheckbox(false);
      } else {
        _setRowSelectionModel(rowSelectionModel);
        setMultipleSelectedQuery(rowSelectionModel.join(" OR "));
        setIsSelectAllRowCheckBoxEnabled(true);
      }
    },
    [
      setIsAllRowSelectChecked,
      _setRowSelectionModel,
      setMultipleSelectedQuery,
      setIsSelectAllRowCheckBoxEnabled,
      _handleToggleAllRowSelectCheckbox,
      databaseTableRowCount,
    ]
  );

  const _handleOpenDatabaseTableColumnFilterMenu = () => {
    setIsDatabaseTableColumnFilterMenuOpen(true);
  };

  const _handleCloseDatabaseTableColumnFilterMenu = () => {
    setIsDatabaseTableColumnFilterMenuOpen(false);
  };

  const _handleDeleteDatabaseTableColumnFilters = (index) => {
    if (index > -1) {
      const _f = [...databaseTableColumnFilters];
      _f.splice(index, 1);
      setDatabaseTableColumnFilters(_f);
    }
  };

  const _handleClearDatabaseTableRowChanges = useCallback(() => {
    setDatabaseTableRowChanges({});
    setDatabaseTableRowChangesForUITracking({});
    invalidateDatabaseTableRows();
    reloadDatabaseTableRows();
  }, [queryClient, page, pageSize, filterQuery, databaseTableColumnSortModel]);

  const _handleCommitDatabaseTableRowChanges = () => {
    bulkUpdateDatabaseTableRows({
      databaseTableRowData: Object.keys(databaseTableRowChanges).map((key) => {
        // eslint-disable-next-line no-unused-vars
        const { __row__uid, ...data } = databaseTableRowChanges[key];
        return { query: key, data };
      }),
    });
  };

  const _handleDataGridRowUpdate = (updatedRow, originalRow) => {
    if (!originalRow.__is__new__row && databaseTableNewRows?.length > 0) {
      displayError(CONSTANTS.ERROR_CODES.CANNOT_EDIT_ROW_WHILE_ADDING);
      return originalRow;
    }
    if (originalRow.__is__new__row) {
      try {
        const _i = databaseTableNewRows.findIndex(
          (_r) => _r.__new__row__uuid == originalRow.__new__row__uuid
        );
        const _dtnr = structuredClone(databaseTableNewRows);
        _dtnr[_i] = structuredClone(updatedRow);
        setDatabaseTableNewRows([..._dtnr]);
      } catch (error) {
        console.error(error);
      }
      return updatedRow;
    } else {
      const changedFields = Object.keys(updatedRow).reduce((acc, key) => {
        if (!Object.is(updatedRow[key], originalRow[key])) {
          acc[key] = updatedRow[key];
        }
        return acc;
      }, {});
      const rowUID = originalRow.__row__uid;

      if (Object.keys(changedFields).length > 0) {
        setDatabaseTableRowChangesForUITracking((prev) => ({
          ...prev,
          [rowUID]: {
            ...prev[rowUID],
            ...changedFields,
          },
        }));
      }
      // Update our databaseTableRowChanges state

      setDatabaseTableRowChanges((prev) => {
        const existingChanges = prev[rowUID] || {};
        return {
          ...prev,
          [rowUID]: { ...existingChanges, ...updatedRow },
        };
      });

      return updatedRow;
    }
  };

  const _handleAddDatabaseTableBlankRow = useCallback(() => {
    if (databaseTableColumns) {
      const _r = { __is__new__row: true, __new__row__uuid: `__${uuidv4()}` };
      databaseTableColumns.forEach((_c) => {
        _r[_c.databaseTableColumnName] = undefined;
      });
      setDatabaseTableNewRows([_r, ...databaseTableNewRows]);
    }
  }, [databaseTableColumns, databaseTableNewRows]);

  const _handleCommitAddDatabaseTableRow = () => {
    bulkAdditionDatabaseTableRows({
      databaseTableRowData: databaseTableNewRows.map((databaseTableNewRow) => {
        // eslint-disable-next-line no-unused-vars
        const { __is__new__row, __new__row__uuid, ...data } =
          databaseTableNewRow;
        return data;
      }),
    });
  };

  const _handleClearAddDatabaseTableRow = useCallback(() => {
    setDatabaseTableNewRows([]);
  }, [setDatabaseTableNewRows]);

  const handleRemoveFilter = (filterIndex) => {
    const newFilters = databaseTableColumnFilters.filter(
      (_, index) => index !== filterIndex
    );
    setDatabaseTableColumnFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setDatabaseTableColumnFilters([]);
    setSearchTerm("");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleEditFilters = () => {
    setIsDatabaseTableColumnFilterMenuOpen(true);
  };

  const {
    bulkAddRows: bulkAdditionDatabaseTableRows,
    bulkUpdateRows: bulkUpdateDatabaseTableRows,
    isAdding: isBulkAddingDatabaseTableRows,
    isUpdating: isBulkUpdatingDatabaseTableRows,
  } = useDatabaseTableMutations({
    tenantID,
    databaseSchemaName,
    databaseTableName,
    reloadDatabaseTableRows,
    invalidateDatabaseTableRows,
    onBulkAddSuccess: _handleClearAddDatabaseTableRow,
    onBulkUpdateSuccess: _handleClearDatabaseTableRowChanges,
  });

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingDatabaseTable || isLoadingDatabaseTableRows}
      error={loadDatabaseTableRowsError || loadDatabaseTableError}
      isFetching={isFetchingDatabaseTableRows || isFetchingDatabaseTable}
      refetch={reloadDatabaseTableRows}
    >
      <div
        className={`w-full h-full !overflow-y-hidden flex flex-col justify-start items-stretch ${containerClass} `}
      >
        <div className="w-full flex flex-col justify-start items-stretch">
          {showStats && (
            <div className="p-2 border-b border-slate-200 ">
              <DatabaseTableStatistics
                tenantID={tenantID}
                databaseSchemaName={databaseSchemaName}
                databaseTableName={databaseTableName}
                isLoadingDatabaseTableStatistics={
                  isLoadingDatabaseTableStatistics
                }
                databaseTableRowCount={databaseTableRowCount}
              />
            </div>
          )}
          {(databaseTableRowChangeCount > 0 ||
            isSelectAllRowCheckBoxEnabled) ? null : visiblyShowFilters ? (
            <div className="px-2 py-2 border-b border-slate-200 flex flex-row justify-between items-start gap-2 w-full">
              {databaseTableColumnFilters &&
              databaseTableColumnFilters.length > 0 ? null : (
                <div className="flex flex-row justify-start items-center gap-2">
                  <Button
                    onClick={_handleToggleDatabaseTableGridDensity}
                    variant="primary-ghost" size="sm"
                  >
                    {databaseTableGridDensity === "compact" ? (
                      <MdOutlineDensitySmall className="mr-2 h-4 w-4" />
                    ) : databaseTableGridDensity === "standard" ? (
                      <MdOutlineDensityMedium className="mr-2 h-4 w-4" />
                    ) : (
                      <MdOutlineDensityLarge className="mr-2 h-4 w-4" />
                    )}

                    {`${capitalize(databaseTableGridDensity)} view`}
                  </Button>
                </div>
              )}
                <div className="flex flex-row justify-end items-center gap-2">
                  <AppliedFiltersCompact
                    databaseTableColumnFilters={databaseTableColumnFilters}
                    debouncedSearchTerm={debouncedSearchTerm}
                    onClearAllFilters={handleClearAllFilters}
                    onEditFilters={handleEditFilters}
                  />
                {databaseTableColumnFilters &&
                databaseTableColumnFilters.length > 0 ? null : (
                  <Button
                    onClick={_handleAddDatabaseTableBlankRow}
                    variant="primary-ghost" size="sm"
                  >
                    <FaPlus className="mr-2 h-4 w-4" />

                    {CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_ADD_ROW}
                  </Button>
                )}

                <Button
                  onClick={_handleOpenDatabaseTableColumnFilterMenu}
                  variant="primary-ghost" size="sm"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  {CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_ADD_FILTER}
                </Button>
                <Button
                  onClick={() => {
                    invalidateDatabaseTableRows();
                    reloadDatabaseTableRows();
                  }}
                  variant="primary-ghost" size="sm"
                >
                  <MdOutlineRefresh
                    className={`h-5 w-5 ${
                      isFetchingDatabaseTableRows ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          ) : null}
          {databaseTableRowChangeCount > 0 && (
            <div className="w-full flex flex-row bg-[#ffe7a4] justify-start items-center gap-2 p-2 border-b border-slate-200">
              <Button
                onClick={_handleCommitDatabaseTableRowChanges}
                disabled={isBulkUpdatingDatabaseTableRows} // Disable button during loading
                className={`!outline-none !hover:outline-none flex items-center rounded px-2 py-0.5 text-xs ${
                  isBulkUpdatingDatabaseTableRows
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-primary border-primary hover:border-primary hover:bg-[#ebecff]"
                }`}
              >
                {isBulkUpdatingDatabaseTableRows ? (
                  <>
                    Saving your changes...
                    <Spinner size={16} className="ml-2" />
                  </>
                ) : (
                  `Save ${databaseTableRowChangeCount} row changes`
                )}
              </Button>
              {!isBulkUpdatingDatabaseTableRows && (
                <Button
                  onClick={_handleClearDatabaseTableRowChanges}
                  className="!outline-none !hover:outline-none flex items-center rounded bg-white px-2 py-0.5 text-xs text-[#ff6e64] border border-[#ff6e64] hover:bg-[#ffebe9] hover:border-[#ff6e64]"
                >
                  Discard changes
                </Button>
              )}
            </div>
          )}
          {databaseTableNewRows && databaseTableNewRows.length > 0 && (
            <div className="w-full flex flex-row bg-[#ffe7a4] justify-start items-center gap-2 p-2 border-b border-slate-200">
              <Button
                onClick={_handleCommitAddDatabaseTableRow}
                disabled={isBulkAddingDatabaseTableRows} // Disable button during loading
                className={`!outline-none !hover:outline-none flex items-center rounded px-2 py-0.5 text-xs ${
                  isBulkAddingDatabaseTableRows
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-primary border-primary hover:border-primary hover:bg-[#ebecff]"
                }`}
              >
                {isBulkAddingDatabaseTableRows ? (
                  <>
                    Saving your changes...
                    <Spinner size={16} className="ml-2" />
                  </>
                ) : (
                  `Save ${databaseTableNewRows.length} new row`
                )}
              </Button>
              {!isBulkAddingDatabaseTableRows && (
                <Button
                  onClick={_handleClearAddDatabaseTableRow}
                  className="!outline-none !hover:outline-none flex items-center rounded bg-white px-2 py-0.5 text-xs text-[#ff6e64] border border-[#ff6e64] hover:bg-[#ffebe9] hover:border-[#ff6e64]"
                >
                  Discard changes
                </Button>
              )}
            </div>
          )}
          {isSelectAllRowCheckBoxEnabled && !isNaN(databaseTableRowCount) && (
            <div className="w-full flex flex-row bg-[#ffe7a4] justify-between items-center gap-2 p-2 border-b border-slate-200">
              <div>
                <Checkbox
                  checked={isAllRowSelectChecked}
                  onCheckedChange={(checked) => {
                    _handleToggleAllRowSelectCheckbox(checked);
                  }}
                  className="mr-2"
                />
                <span className="text-sm font-medium mr-2 text-slate-700">
                  Select all {databaseTableRowCount} rows
                </span>
              </div>
              <div className="flex flex-row justify-end items-center">
                <DatabaseTableRowsExportForm
                  tenantID={tenantID}
                  databaseSchemaName={databaseSchemaName}
                  databaseTableName={databaseTableName}
                  filterQuery={filterQuery}
                  isAllRowSelectChecked={isAllRowSelectChecked}
                  databaseTableRowCount={databaseTableRowCount}
                  rowSelectionModel={_rowSelectionModel}
                  multipleSelectedQuery={multipleSelectedQuery}
                />
                <DatabaseTableRowsDeletionForm
                  tenantID={tenantID}
                  databaseSchemaName={databaseSchemaName}
                  databaseTableName={databaseTableName}
                  filterQuery={filterQuery}
                  isAllRowSelectChecked={isAllRowSelectChecked}
                  databaseTableRowCount={databaseTableRowCount}
                  rowSelectionModel={_rowSelectionModel}
                  multipleSelectedQuery={multipleSelectedQuery}
                  reloadDatabaseTableRows={() => {
                    invalidateDatabaseTableRows();
                    reloadDatabaseTableRows();
                  }}
                />
              </div>
            </div>
          )}
          <DatabaseTableColumnFilter
            isDatabaseTableColumnFiltersMenuOpen={
              isDatabaseTableColumnFiltersMenuOpen
            }
            handleCloseDatabaseTableColumnFiltersMenu={
              _handleCloseDatabaseTableColumnFilterMenu
            }
            databaseTableColumnFilters={databaseTableColumnFilters}
            setDatabaseTableColumnFilters={setDatabaseTableColumnFilters}
            databaseTableColumns={databaseTableColumns}
            databaseTableName={databaseTableName}
          />
        </div>
        {databaseTableRows && formattedDatabaseTableColumns ? (
          <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">
            <DataGrid
              ref={datagridRef}
              apiRef={datagridAPIRef}
              rows={
                databaseTableNewRows && databaseTableNewRows.length > 0
                  ? [...databaseTableNewRows, ...databaseTableRows]
                  : databaseTableRows
              }
              columns={formattedDatabaseTableColumns}
              loading={isLoadingDatabaseTableRows}
              processRowUpdate={_handleDataGridRowUpdate}
              experimentalFeatures={{ newEditingApi: true }}
              getRowId={(row) => _getRowID(row)} // Custom row ID getter
              // className="fill-grid border-t border-slate-200"
              getCellClassName={(params) => {
                const rowId = _getRowID(params.row);
                const isChanged =
                  databaseTableRowChangesForUITracking[rowId]?.[
                    params.field
                  ] !== undefined;
                const isNewRow = params.row.__is__new__row;
                return isChanged || isNewRow ? "changed-cell" : "";
              }}
              sx={{
                "--unstable_DataGrid-radius": "0",
                "& .MuiDataGrid-root": {
                  borderRadius: 0,
                },
                "& .MuiIconButton-root": {
                  outline: "none",
                },
                "& .MuiDataGrid-cell": {
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: "400",
                },
                "& .MuiCheckbox-root": {
                  padding: "4px",
                },
                "& .MuiDataGrid-columnHeaderCheckbox": {
                  minWidth: "auto !important",
                  width: "auto !important",
                  flex: "0 0 auto !important",
                  padding: "0.25rem !important",
                  "& .MuiDataGrid-columnHeaderTitleContainer": {
                    width: "auto",
                    minWidth: "auto",
                    flex: "none",
                  },
                },
                "& .MuiDataGrid-cellCheckbox": {
                  minWidth: "auto !important",
                  width: "auto !important",
                  flex: "0 0 auto !important",
                  color: "hsl(var(--primary))",
                  padding: "0.25rem !important",
                },
              }}
              onRowSelectionModelChange={
                _handleMultipleSelectedRowsQueryBuilder
              }
              density={databaseTableGridDensity}
              showCellVerticalBorder
              className="!border-0"
              // checkboxSelection={!isAllRowSelectChecked}
              checkboxSelection
              disableRowSelectionOnClick
              disableColumnFilter
              hideFooterPagination={!visiblyShowPagination}
              onSortModelChange={(model) => {
                if (model.length > 0) {
                  const { field, sort } = model[0];
                  setDatabaseTableColumnSortModel({
                    field: field,
                    order: lowerCase(sort),
                  });
                }
              }}
              paginationMode="server"
              rowCount={
                !isNaN(databaseTableRowCount)
                  ? parseInt(databaseTableRowCount)
                  : 0
              }
              pageSizeOptions={[20, 50, 100]}
              paginationModel={{ page: page - 1, pageSize }}
              onPaginationModelChange={({
                page: newPage,
                pageSize: newPageSize,
              }) => {
                setPage(newPage + 1); // Convert to 1-based for API
                setPageSize(newPageSize);
              }}
              hideFooterSelectedRowCount
            />
          </div>
        ) : (
          <div className="!w-full !p-2">
            <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
          </div>
        )}
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
