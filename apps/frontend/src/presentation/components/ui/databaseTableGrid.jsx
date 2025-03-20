import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Checkbox, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "react-data-grid/lib/styles.css";
import { BiCalendar, BiLink, BiUnlink } from "react-icons/bi";
import { CONSTANTS } from "../../../constants";

import { capitalize, lowerCase } from "lodash";
import moment from "moment";
import { FaPlus, FaTimes } from "react-icons/fa";
import ReactJson from "react-json-view";
import {
  databaseTableBulkRowAdditionAPI,
  databaseTableBulkRowDeletionAPI,
  databaseTableBulkRowUpdationAPI,
  getDatabaseTableByNameAPI,
  getDatabaseTableRowsAPI,
  getDatabaseTableStatisticsAPI,
} from "../../../data/apis/databaseTable";
import { DatabaseTableColumn } from "../../../data/models/databaseTableColumn";
import { displayError, displaySuccess } from "../../../utils/notification";
import { PostgreSQLUtils } from "../../../utils/postgre";
import { DatabaseTableColumnFilter } from "./databaseTableColumnFilter";
import { DatabaseTableStatistics } from "./databaseTableStatistics";
import { NoEntityUI } from "./noEntityUI";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import {
  MdOutlineDensityLarge,
  MdOutlineDensityMedium,
  MdOutlineDensitySmall,
  MdOutlineRefresh,
} from "react-icons/md";
import { DatabaseTableRowsExportForm } from "./databaseTableRowsExportForm";
import { DatabaseTableRowsDeletionForm } from "./databaseTableRowsDeletionForm";
/**
 * Returns width for different field types
 */
const getFieldWidth = (type) => {
  const widths = {
    [CONSTANTS.DATA_TYPES.STRING]: 300,
    [CONSTANTS.DATA_TYPES.BOOLEAN]: 150,
    [CONSTANTS.DATA_TYPES.DATETIME]: 250,
    [CONSTANTS.DATA_TYPES.INT]: 150,
    [CONSTANTS.DATA_TYPES.JSON]: 450,
  };
  return widths[type] || 300;
};

const getFieldFormatting = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  type,
  isID,
  isList,
  params,
  customIntMapping,
  foreignKeyReference, // Indicates if the field is part of a foreign key
}) => {
  const cellValue = params.value;
  const convertedType = CONSTANTS.POSTGRE_SQL_DATA_TYPES[type]?.js_type;
  const commonTextStyle =
    "text-justify break-all overflow-hidden text-ellipsis whitespace-pre-wrap";
  const chipStyle = "px-2 py-0.5 rounded text-sm font-medium w-min";
  const foreignKeyIndicatorStyle =
    cellValue === undefined || cellValue === null || cellValue === ""
      ? ""
      : "inline-flex items-center  text-blue-600 ";

  const foreignKeyReferenceLink = () => {
    return `${CONSTANTS.ROUTES.VIEW_DATABASE_TABLE_BY_NAME.path(
      tenantID,
      databaseSchemaName,
      foreignKeyReference?.[0]?.referencedTable
    )}?filterQuery=${encodeURIComponent(
      JSON.stringify([
        {
          field: foreignKeyReference?.[0]?.referencedColumns[0],
          operator: "=",
          value: PostgreSQLUtils.processFilterValueAccordingToFieldType({
            type: type,
            value: cellValue,
          }),
          fieldType: type,
        },
      ])
    )}`;
  };
  const renderForeignKeyIndicator = (value) => {
    return (
      <span className={foreignKeyIndicatorStyle}>
        {value === undefined || value === null || value === "" ? (
          <div className="p-1 bg-red-100 mr-2 rounded cursor-not-allowed">
            <BiUnlink size={14} className="text-red-400" />
          </div>
        ) : (
          <Link
            to={foreignKeyReferenceLink()}
            target="_blank"
            className="p-1 bg-slate-100 mr-2 rounded cursor-pointer"
          >
            <BiLink size={14} />
          </Link>
        )}
        {/* Icon to indicate foreign key */}
        <span>{value}</span>
      </span>
    );
  };
  switch (convertedType) {
    case CONSTANTS.JS_DATA_TYPES.STRING:
      return isList ? (
        <ul className="space-y-1">
          {cellValue?.map((value, index) => (
            <li key={index} className={commonTextStyle}>
              {foreignKeyReference ? renderForeignKeyIndicator(value) : value}
            </li>
          ))}
        </ul>
      ) : (
        <span className={commonTextStyle}>
          {foreignKeyReference
            ? renderForeignKeyIndicator(cellValue)
            : cellValue}
        </span>
      );

    case CONSTANTS.JS_DATA_TYPES.BOOLEAN: {
      const boolValue = Boolean(cellValue);
      const boolStyle = `${chipStyle} ${
        boolValue ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`;
      return isList ? (
        <div className="space-y-1">
          {cellValue?.map((value, index) => (
            <div key={index} className={boolStyle}>
              {foreignKeyReference
                ? renderForeignKeyIndicator(String(Boolean(value)))
                : String(Boolean(value))}
            </div>
          ))}
        </div>
      ) : (
        <div className={boolStyle}>
          {foreignKeyReference
            ? renderForeignKeyIndicator(String(boolValue))
            : String(boolValue)}
        </div>
      );
    }

    case CONSTANTS.JS_DATA_TYPES.DATE:
      return (
        <div className="flex items-center space-x-2">
          <BiCalendar className="text-[#646cff] flex-shrink-0" />
          <span className={commonTextStyle}>
            {foreignKeyReference
              ? renderForeignKeyIndicator(
                  moment(cellValue).format("YYYY-MM-DD HH:mm")
                )
              : moment(cellValue).format("YYYY-MM-DD HH:mm")}
          </span>
        </div>
      );

    case CONSTANTS.JS_DATA_TYPES.NUMBER: {
      const renderValue = (value) => (
        <div className="space-y-1">
          {foreignKeyReference
            ? renderForeignKeyIndicator(customIntMapping?.[value] || value)
            : customIntMapping?.[value] || value}
        </div>
      );
      return isList ? (
        <div className="flex flex-wrap gap-1">
          {cellValue?.map((value, index) => (
            <div key={index}>
              {customIntMapping ? (
                <span title={value}>{renderValue(value)}</span>
              ) : (
                renderValue(value)
              )}
            </div>
          ))}
        </div>
      ) : (
        renderValue(cellValue)
      );
    }

    case CONSTANTS.JS_DATA_TYPES.OBJECT: {
      let parsedCellValue;
      try {
        parsedCellValue =
          typeof cellValue === "string" ? JSON.parse(cellValue) : cellValue;
      } catch (error) {
        console.warn("Invalid JSON data:", cellValue, error);
        parsedCellValue = null; // Fallback to null if parsing fails
      }

      return (
        <div className="max-h-32 overflow-auto rounded !text-slate-700 p-2">
          {parsedCellValue !== null ? (
            <ReactJson
              src={parsedCellValue}
              theme="rjv-default"
              displayDataTypes={false}
              collapsed={1}
              style={{ backgroundColor: "transparent" }}
            />
          ) : (
            <span className="text-red-500">Invalid JSON data</span>
          )}
        </div>
      );
    }

    default:
      return (
        <span className={commonTextStyle}>
          {isList ? JSON.stringify(cellValue) : cellValue}
        </span>
      );
  }
};

/**
 *
 * @param {object} param0
 * @param {Array<DatabaseTableColumn>} param0.databaseTableColumns
 * @param {*} param0.customIntMappings
 * @returns
 */
const getFormattedTableColumns = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTableColumns,
  customIntMappings,
  databaseTableColumnForeignKeyMap,
}) => {
  try {
    return databaseTableColumns.map((column) => {
      const convertedType =
        CONSTANTS.POSTGRE_SQL_DATA_TYPES[column.databaseTableColumnType]
          ?.js_type;
      const foreignKeyReference =
        databaseTableColumnForeignKeyMap?.get(column.databaseTableColumnName)
          ?.length > 0
          ? databaseTableColumnForeignKeyMap?.get(
              column.databaseTableColumnName
            )
          : null;

      return {
        field: column.databaseTableColumnName,
        name: column.databaseTableColumnName,
        key: column.databaseTableColumnName,
        sortable: true,
        headerName: String(column.databaseTableColumnName).toLocaleLowerCase(),
        type: convertedType,
        editable: !column.isID,
        dbType: column.databaseTableColumnType,
        isList: column.isList,
        width: getFieldWidth(column.databaseTableColumnType),
        display: "flex",
        foreignKeyReference,
        valueGetter: (value, row) => {
          return PostgreSQLUtils.processFilterValueAccordingToFieldType({
            type: convertedType,
            value: value,
          });
        },
        renderCell: (params) => {
          return getFieldFormatting({
            tenantID,
            databaseSchemaName,
            databaseTableName,
            type: column.databaseTableColumnType,
            isID: column.isID,
            isList: column.isList,
            params,
            customIntMapping:
              customIntMappings?.[column.databaseTableColumnName],
            foreignKeyReference,
          });
        },

        // valueGetter: (value) => {
        //   return getFieldValue(value, column.type).value;
        // },
      };
    });
  } catch (error) {
    console.warn("Error in formatting columns", error);
  }
};

export const DatabaseTableGrid = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  onRowClick,
  showStats,
  containerClass,
  initialFilterQuery,
}) => {
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [databaseTableColumnFilters, setDatabaseTableColumnFilters] = useState(
    initialFilterQuery || []
  );
  const [
    databaseTableColumnFilterCombinator,
    setDatabaseTableColumnFilterCombinator,
  ] = useState("AND");
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
  const [databaseTableGridAutoheight, setDatabaseTableGridAutoheight] =
    useState(false);
  const datagridRef = useRef();

  const databaseTableRowChangeCount = Object.values(
    databaseTableRowChangesForUITracking
  ).reduce((acc, row) => acc + Object.keys(row).length, 0);

  const {
    isLoading: isLoadingDatabaseTable,
    data: databaseTable,
    error: loadDatabaseTableError,
    isFetching: isFetchingDatabaseTable,
    isRefetching: isRefetechingDatabaseTable,
    refetch: refetchDatabaseTable,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES_META(
        tenantID,
        databaseSchemaName,
        databaseTableName
      ),
    ],
    queryFn: () =>
      getDatabaseTableByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
      }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseTableRows,
    data: data,
    error: loadRowsError,
    isFetching: isFetchingDatabaseTableRows,
    isPreviousData: isPreviousDatabaseTableRowsData,
    refetch: reloadDatabaseTableRows,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES_ROWS(
        tenantID,
        databaseSchemaName,
        databaseTableName
      ),
      page,
      pageSize,
      filterQuery,
      databaseTableColumnSortModel,
    ],
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
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const {
    isLoading: isLoadingDatabaseTableStatistics,
    data: databaseTableStatistics,
    error: loadDataError,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES_STATISTICS(
        tenantID,
        databaseSchemaName,
        databaseTableName
      ),
      filterQuery,
    ],
    queryFn: () =>
      getDatabaseTableStatisticsAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        filterQuery: filterQuery,
      }),
  });

  const {
    mutate: bulkAdditionDatabaseTableRows,
    isPending: isBulkAddingDatabaseTableRows,
    error: bulkAdditionDatabaseTableRowsError,
  } = useMutation({
    mutationFn: ({ databaseTableRowData }) => {
      return databaseTableBulkRowAdditionAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTableRowData,
      });
    },
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_SAVED_SUCCESS
      );
      reloadDatabaseTableRows();
      _handleClearAddDatabaseTableRow();
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const {
    mutate: bulkUpdateDatabaseTableRows,
    isPending: isBulkUpdatingDatabaseTableRows,
    error: bulkUpdateDatabaseTableRowsError,
  } = useMutation({
    mutationFn: ({ databaseTableRowData }) => {
      return databaseTableBulkRowUpdationAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTableRowData,
      });
    },
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_UPDATED_SUCCESS
      );
      reloadDatabaseTableRows();
      _handleClearDatabaseTableRowChanges();
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const databaseTableColumns = databaseTable?.databaseTableColumns;
  const databaseTableConstraints = databaseTable?.databaseTableConstraints;
  const databaseTablePrimaryKey = databaseTable?.primaryKey;
  const databaseTableColumnForeignKeyMap = databaseTable?.columnForeignKeyMap;

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

  const _selectByIDQueryBuilder = useCallback(
    (row) => {
      if (databaseTablePrimaryKey) {
        return {
          query: PostgreSQLUtils.combinePrimaryKeyToWhereClause(
            databaseTablePrimaryKey,
            row
          ),
        };
      }
    },
    [databaseTablePrimaryKey]
  );

  const _generateInitialRowID = useCallback(
    (row) => {
      if (databaseTablePrimaryKey) {
        return PostgreSQLUtils.combinePrimaryKeyToWhereClause(
          databaseTablePrimaryKey,
          row
        );
      }
    },
    [databaseTablePrimaryKey]
  );

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

  const databaseTableRows = useMemo(
    () =>
      data?.rows?.map((_row) => {
        return { ..._row, __row__uid: _generateInitialRowID(_row) };
      }),
    [data, _generateInitialRowID]
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

  const _handleToggleDatabaseTableGridAutoheight = useCallback(() => {
    setDatabaseTableGridAutoheight(!databaseTableGridAutoheight);
  }, [setDatabaseTableGridAutoheight]);

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
      databaseTableStatistics,
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

  const _handleClearDatabaseTableRowChanges = () => {
    setDatabaseTableRowChanges({});
    setDatabaseTableRowChangesForUITracking({});
  };

  const _handleCommitDatabaseTableRowChanges = () => {
    bulkUpdateDatabaseTableRows({
      databaseTableRowData: Object.keys(databaseTableRowChanges).map((key) => {
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
        const { __is__new__row, __new__row__uuid, ...data } =
          databaseTableNewRow;
        return data;
      }),
    });
  };

  const _handleClearAddDatabaseTableRow = useCallback(() => {
    setDatabaseTableNewRows([]);
  }, [setDatabaseTableNewRows]);

  return isLoadingDatabaseTableRows || isLoadingDatabaseTable ? (
    <div
      className={`w-full h-full !overflow-y-hidden ${containerClass} flex justify-center items-center`}
    >
      <CircularProgress />
    </div>
  ) : (
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
              databaseTableRowCount={
                databaseTableStatistics?.databaseTableRowCount
              }
            />
          </div>
        )}
        {databaseTableRowChangeCount > 0 ||
        isSelectAllRowCheckBoxEnabled ? null : (
          <div className="px-2 py-2 border-b border-slate-200 flex flex-row justify-between items-start gap-2 w-full">
            {databaseTableColumnFilters &&
            databaseTableColumnFilters.length > 0 ? null : (
              <div className="flex flex-row justify-start items-center gap-2">
                {!databaseTableGridAutoheight && (
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
                )}
                {/* <button
                  onClick={_handleToggleDatabaseTableGridAutoheight}
                  className="!outline-none !hover:outline-none flex items-center rounded bg-[#646cff]/10 px-3 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
                >
                  {databaseTableGridAutoheight ? (
                    <RiLineHeight className="mr-2 h-4 w-4" />
                  ) : (
                    <RiLineHeight className="mr-2 h-4 w-4" />
                  )}

                  {databaseTableGridAutoheight ? "Autoheight" : "Fixed height"}
                </button> */}
              </div>
            )}
            <div className="flex flex-row justify-end items-center gap-2">
              {databaseTableColumnFilters.map((filter, index) => {
                return (
                  <div className="flex items-center border border-[#646cff]  rounded bg-[#646cff]/10 px-2 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50">
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
                onClick={reloadDatabaseTableRows}
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
        {isSelectAllRowCheckBoxEnabled && databaseTableStatistics && (
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
                Select all {databaseTableStatistics.databaseTableRowCount} rows
              </span>
            </div>
            <div className="flex flex-row justify-end items-center">
              <DatabaseTableRowsExportForm
                tenantID={tenantID}
                databaseSchemaName={databaseSchemaName}
                databaseTableName={databaseTableName}
                filterQuery={filterQuery}
                isAllRowSelectChecked={isAllRowSelectChecked}
                databaseTableRowCount={
                  databaseTableStatistics?.databaseTableRowCount
                }
                rowSelectionModel={_rowSelectionModel}
                multipleSelectedQuery={multipleSelectedQuery}
              />
              <DatabaseTableRowsDeletionForm
                tenantID={tenantID}
                databaseSchemaName={databaseSchemaName}
                databaseTableName={databaseTableName}
                filterQuery={filterQuery}
                isAllRowSelectChecked={isAllRowSelectChecked}
                databaseTableRowCount={
                  databaseTableStatistics?.databaseTableRowCount
                }
                rowSelectionModel={_rowSelectionModel}
                multipleSelectedQuery={multipleSelectedQuery}
                reloadDatabaseTableRows={reloadDatabaseTableRows}
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
      {databaseTableRows &&
      formattedDatabaseTableColumns &&
      databaseTablePrimaryKey ? (
        <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">
          <DataGrid
            ref={datagridRef}
            rows={
              databaseTableNewRows && databaseTableNewRows.length > 0
                ? [...databaseTableNewRows, ...databaseTableRows]
                : databaseTableRows
            }
            // autoHeight={databaseTableGridAutoheight}
            columns={formattedDatabaseTableColumns}
            loading={isLoadingDatabaseTableRows}
            processRowUpdate={_handleDataGridRowUpdate}
            experimentalFeatures={{ newEditingApi: true }}
            getRowId={(row) => _getRowID(row)} // Custom row ID getter
            // className="fill-grid border-t border-slate-200"
            getCellClassName={(params) => {
              const rowId = _getRowID(params.row);
              const isChanged = databaseTableRowChangesForUITracking[
                rowId
              ]?.hasOwnProperty(params.field);
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
              "& .MuiDataGrid-cellCheckbox": {
                width: "unset",
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
            onRowSelectionModelChange={_handleMultipleSelectedRowsQueryBuilder}
            density={databaseTableGridDensity}
            showCellVerticalBorder
            className="!border-0"
            // checkboxSelection={!isAllRowSelectChecked}
            checkboxSelection
            disableRowSelectionOnClick
            disableColumnFilter
            getRowHeight={databaseTableGridAutoheight ? () => "auto" : null}
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
              databaseTableStatistics
                ? parseInt(databaseTableStatistics.databaseTableRowCount)
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

            // onRowClick={(params) => {
            //   if (onRowClick) {
            //     onRowClick(params);
            //   } else {
            //     navigate(
            //       CONSTANTS.ROUTES.ROW_VIEW.path(
            //         databaseTableName,
            //         JSON.stringify(_selectByIDQueryBuilder(params.row))
            //       )
            //     );
            //   }
            // }}
            // slots={{
            //   loadingOverlay: LinearProgress, // Custom loading overlay
            // }}
          />
        </div>
      ) : (
        <div className="!w-full !p-2">
          <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
        </div>
      )}
    </div>
  );
};
