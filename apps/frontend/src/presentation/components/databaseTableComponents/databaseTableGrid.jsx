import { Checkbox, CircularProgress } from "@mui/material";
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

export const DatabaseTableGrid = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  showStats,
  containerClass,
  initialFilterQuery,
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
  const [
    databaseTableColumnFilterCombinator,
    setDatabaseTableColumnFilterCombinator,
  ] = useState("AND");

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
    if (
      databaseTableColumns &&
      databaseTableName &&
      databaseTableColumnFilterCombinator &&
      databaseTableColumnFilters &&
      databaseTableColumnFilters.length > 0
    ) {
      const queries = [];
      databaseTableColumnFilters.map((filter) => {
        let query = {};
        let o = {};
        o[filter.operator] = filter.value;
        query[filter.field] = o;
        queries.push({ ...query });
      });
      const fq = {};
      fq[databaseTableColumnFilterCombinator] = [...queries];
      setFilterQuery?.(fq);
    } else if (
      databaseTableColumns &&
      databaseTableName &&
      debouncedSearchTerm &&
      debouncedSearchTerm !== ""
    ) {
      let queries = [];
      databaseTableColumns.forEach((column) => {
        if (
          CONSTANTS.POSTGRE_SQL_DATA_TYPES[column.databaseTableColumnType] &&
          CONSTANTS.POSTGRE_SQL_DATA_TYPES[column.databaseTableColumnType]
            .normalizedType == CONSTANTS.DATA_TYPES.STRING
        ) {
          queries.push({
            [column.databaseTableColumnName]: {
              ilike: debouncedSearchTerm,
            },
          });
        }
      });
      setFilterQuery?.({ OR: queries });
    } else {
      setFilterQuery(null);
    }
  }, [
    databaseTableColumnFilters,
    debouncedSearchTerm,
    databaseTableColumnFilterCombinator,
    databaseTableColumns,
    databaseTableName,
  ]);

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
          {databaseTableRowChangeCount > 0 ||
          isSelectAllRowCheckBoxEnabled ? null : (
            <div className="px-2 py-2 border-b border-slate-200 flex flex-row justify-between items-start gap-2 w-full">
              {databaseTableColumnFilters &&
              databaseTableColumnFilters.length > 0 ? null : (
                <div className="flex flex-row justify-start items-center gap-2">
                  <button
                    onClick={_handleToggleDatabaseTableGridDensity}
                    className="!outline-none !hover:outline-none flex items-center rounded bg-[#646cff]/10 px-3 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
                  >
                    {databaseTableGridDensity === "compact" ? (
                      <MdOutlineDensitySmall className="mr-2 h-4 w-4" />
                    ) : databaseTableGridDensity === "standard" ? (
                      <MdOutlineDensityMedium className="mr-2 h-4 w-4" />
                    ) : (
                      <MdOutlineDensityLarge className="mr-2 h-4 w-4" />
                    )}

                    {`${capitalize(databaseTableGridDensity)} view`}
                  </button>
                </div>
              )}
              <div className="flex flex-row justify-end items-center gap-2">
                {databaseTableColumnFilters.map((filter, index) => {
                  const key = `filter_${index}`;
                  return (
                    <div
                      key={key}
                      className="flex items-center border border-[#646cff]  rounded bg-[#646cff]/10 px-2 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
                    >
                      {/* Sort info button */}
                      <div className="text-sm font-medium text-[#646cff] ">
                        {filter.field} {filter.operator}{" "}
                        {PostgreSQLUtils.processFilteredValueToTextType({
                          udtType: filter.fieldType,
                          value: filter.value,
                        })}
                      </div>

                      {/* Clear sort button */}
                      <button
                        onClick={() =>
                          _handleDeleteDatabaseTableColumnFilters(index)
                        }
                        className="rounded bg-transparent ml-2 text-[#646cff] outline-none focus:outline-none border-0 p-0 "
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                {databaseTableColumnFilters &&
                databaseTableColumnFilters.length > 0 ? null : (
                  <button
                    onClick={_handleAddDatabaseTableBlankRow}
                    className="!outline-none !hover:outline-none flex items-center rounded bg-[#646cff]/10 px-3 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
                  >
                    <FaPlus className="mr-2 h-4 w-4" />

                    {CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_ADD_ROW}
                  </button>
                )}

                <button
                  onClick={_handleOpenDatabaseTableColumnFilterMenu}
                  className="!outline-none !hover:outline-none flex items-center rounded bg-[#646cff]/10 px-3 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  {CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_ADD_FILTER}
                </button>
                <button
                  onClick={() => {
                    invalidateDatabaseTableRows();
                    reloadDatabaseTableRows();
                  }}
                  className="!outline-none !hover:outline-none flex items-center rounded bg-[#646cff]/10 px-1 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
                >
                  <MdOutlineRefresh
                    className={`h-5 w-5 ${
                      isFetchingDatabaseTableRows ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
          {databaseTableRowChangeCount > 0 && (
            <div className="w-full flex flex-row bg-[#ffe7a4] justify-start items-center gap-2 p-2 border-b border-slate-200">
              <button
                onClick={_handleCommitDatabaseTableRowChanges}
                disabled={isBulkUpdatingDatabaseTableRows} // Disable button during loading
                className={`!outline-none !hover:outline-none flex items-center rounded px-2 py-0.5 text-xs ${
                  isBulkUpdatingDatabaseTableRows
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-[#646cff] border-[#646cff] hover:border-[#646cff] hover:bg-[#ebecff]"
                }`}
              >
                {isBulkUpdatingDatabaseTableRows ? (
                  <>
                    Saving your changes...
                    <CircularProgress
                      size={16}
                      color="inherit"
                      className="!ml-2"
                    />
                  </>
                ) : (
                  `Save ${databaseTableRowChangeCount} row changes`
                )}
              </button>
              {!isBulkUpdatingDatabaseTableRows && (
                <button
                  onClick={_handleClearDatabaseTableRowChanges}
                  className="!outline-none !hover:outline-none flex items-center rounded bg-white px-2 py-0.5 text-xs text-[#ff6e64] border border-[#ff6e64] hover:bg-[#ffebe9] hover:border-[#ff6e64]"
                >
                  Discard changes
                </button>
              )}
            </div>
          )}
          {databaseTableNewRows && databaseTableNewRows.length > 0 && (
            <div className="w-full flex flex-row bg-[#ffe7a4] justify-start items-center gap-2 p-2 border-b border-slate-200">
              <button
                onClick={_handleCommitAddDatabaseTableRow}
                disabled={isBulkAddingDatabaseTableRows} // Disable button during loading
                className={`!outline-none !hover:outline-none flex items-center rounded px-2 py-0.5 text-xs ${
                  isBulkAddingDatabaseTableRows
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-[#646cff] border-[#646cff] hover:border-[#646cff] hover:bg-[#ebecff]"
                }`}
              >
                {isBulkAddingDatabaseTableRows ? (
                  <>
                    Saving your changes...
                    <CircularProgress
                      size={16}
                      color="inherit"
                      className="!ml-2"
                    />
                  </>
                ) : (
                  `Save ${databaseTableNewRows.length} new row`
                )}
              </button>
              {!isBulkAddingDatabaseTableRows && (
                <button
                  onClick={_handleClearAddDatabaseTableRow}
                  className="!outline-none !hover:outline-none flex items-center rounded bg-white px-2 py-0.5 text-xs text-[#ff6e64] border border-[#ff6e64] hover:bg-[#ffebe9] hover:border-[#ff6e64]"
                >
                  Discard changes
                </button>
              )}
            </div>
          )}
          {isSelectAllRowCheckBoxEnabled && !isNaN(databaseTableRowCount) && (
            <div className="w-full flex flex-row bg-[#ffe7a4] justify-between items-center gap-2 p-2 border-b border-slate-200">
              <div>
                <Checkbox
                  checked={isAllRowSelectChecked}
                  onChange={(_, checked) => {
                    _handleToggleAllRowSelectCheckbox(checked);
                  }}
                  className="!p-0 text-[#646cff] hover:bg-[#646cff]/10 focus:outline-none focus:ring-2 focus:ring-[#646cff]/50"
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
            databaseTableColumnFilterCombinator={
              databaseTableColumnFilterCombinator
            }
            setDatabaseTableColumnFilterCombinator={
              setDatabaseTableColumnFilterCombinator
            }
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
                  color: "#646cff !important",
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
