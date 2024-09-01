import { useNavigate } from "react-router-dom";

import {
  Checkbox,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllRowsAPI, getTablePrimaryKey } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";

import { useDebounce } from "@uidotdev/usehooks";
import { getTableColumns } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAppConstants } from "../../../contexts/appConstantsContext";
import { Loading } from "../../../pages/Loading";
import {
  combinePrimaryKeyToWhereClause,
  generateFilterQuery,
  generateOrderByQuery,
} from "../../../utils/postgresUtils/tables";
import { getFormattedTableColumns } from "../../../utils/tables";
import { ErrorComponent } from "../../ErrorComponent";
import { DataExportFormComponent } from "../DataExportFormComponent";
import { DataGridActionComponent } from "../DataGridActionComponent";
import { MultipleRowsDeletionForm } from "../MultipleRowDeletetionForm";
import { RawDataGridStatistics } from "../RawDataGridStatistics";

export const JobHistoryComponent = ({
  tableName,
  onRowClick,
  showStats,
  containerClass,
}) => {
  const { internalAppConstants } = useAppConstants();
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [filters, setFilters] = useState([]);
  const [combinator, setCombinator] = useState("AND");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortModel, setSortModel] = useState(null);
  const theme = useTheme();
  const [multipleSelectedQuery, setMultipleSelectedQuery] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [isSelectAllRowCheckBoxEnabled, setIsSelectAllRowCheckBoxEnabled] =
    useState(false);
  const [isAllRowSelectChecked, setIsAllRowSelectChecked] = useState(false);
  const [rowCount, setRowCount] = useState();

  const {
    isLoading: isLoadingRows,
    data: data,
    isError: isLoadRowsError,
    error: loadRowsError,
    isFetching: isFetchingAllRows,
    isPreviousData: isPreviousRowsData,
    refetch: reloadData,
  } = useQuery({
    queryKey: [
      LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),
      page,
      pageSize,
      filterQuery,
      sortModel,
    ],
    queryFn: () =>
      fetchAllRowsAPI({
        tableName,
        page,
        pageSize,
        filterQuery: generateFilterQuery(filterQuery),
        sortModel: sortModel ? generateOrderByQuery(sortModel) : null,
      }),

    enabled: Boolean(pmUser),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
    keepPreviousData: true,
  });

  const {
    isLoading: isLoadingTableColumns,
    data: tableColumns,
    error: loadTableColumnsError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID_COLUMNS(tableName)],
    queryFn: () => getTableColumns({ tableName }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingTablePrimaryKey,
    data: tablePrimaryKey,
    error: loadTablePrimaryKeyError,
  } = useQuery({
    queryKey: [
      LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID_PRIMARY_KEY(tableName),
    ],
    queryFn: () => getTablePrimaryKey({ tableName }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  useEffect(() => {
    if (
      tableColumns &&
      tableName &&
      combinator &&
      filters &&
      filters.length > 0
    ) {
      const queries = [];
      filters.map((filter) => {
        let query = {};
        let o = {};
        o[filter.operator] = filter.value;
        query[filter.field] = o;
        queries.push({ ...query });
      });
      const fq = {};
      fq[combinator] = [...queries];
      setFilterQuery?.(fq);
    } else if (
      tableColumns &&
      tableName &&
      debouncedSearchTerm &&
      debouncedSearchTerm !== ""
    ) {
      let queries = [];
      tableColumns.forEach((column) => {
        if (
          LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[column.type] &&
          LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[column.type].normalizedType ==
            LOCAL_CONSTANTS.DATA_TYPES.STRING
        ) {
          queries.push({
            [column.name]: {
              ilike: debouncedSearchTerm,
            },
          });
        }
      });
      setFilterQuery?.({ OR: queries });
    } else {
      setFilterQuery(null);
    }
  }, [filters, debouncedSearchTerm, combinator, tableColumns, tableName]);

  const columns = useMemo(() => {
    if (tableColumns && tableName) {
      const c = getFormattedTableColumns(
        tableColumns,
        internalAppConstants?.CUSTOM_INT_VIEW_MAPPING?.[tableName]
      );
      return c;
    } else {
      return null;
    }
  }, [tableName, tableColumns, internalAppConstants]);

  const rowAddAuthorization = useMemo(() => {
    return pmUser && pmUser.extractRowAddAuthorization(tableName);
  }, [pmUser, tableName]);

  const _selectByIDQueryBuilder = useCallback(
    (row) => {
      if (tablePrimaryKey) {
        return { query: combinePrimaryKeyToWhereClause(tablePrimaryKey, row) };
      }
    },
    [tablePrimaryKey]
  );

  const _getRowID = useCallback(
    (row) => {
      if (tablePrimaryKey) {
        return combinePrimaryKeyToWhereClause(tablePrimaryKey, row);
      }
    },
    [tablePrimaryKey]
  );

  const _handleMultipleSelectedRowsQueryBuilder = useCallback(
    (rowSelectionModel) => {
      if (rowSelectionModel.length == 0) {
        setMultipleSelectedQuery(null);
        setIsSelectAllRowCheckBoxEnabled(false);
        _handleToggleAllRowSelectCheckbox(false);
      } else {
        setMultipleSelectedQuery(rowSelectionModel.join(" OR "));
        setIsSelectAllRowCheckBoxEnabled(true);
      }
    },
    [setMultipleSelectedQuery]
  );

  const _handleOnPageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
  };

  const _handleToggleAllRowSelectCheckbox = (v) => {
    setIsAllRowSelectChecked(v);
  };

  const _handleDeleteFilter = (index) => {
    if (index > -1) {
      const _f = [...filters];
      _f.splice(index, 1);
      setFilters(_f);
    }
  };

  const _renderMultipleDeleteButton = useMemo(() => {
    return (
      multipleSelectedQuery && (
        <MultipleRowsDeletionForm
          tableName={tableName}
          selectedRowIDs={multipleSelectedQuery}
          filterQuery={filterQuery}
          isAllRowSelectChecked={isAllRowSelectChecked}
        />
      )
    );
  }, [tableName, filterQuery, isAllRowSelectChecked, multipleSelectedQuery]);

  const _renderExportButton = useMemo(() => {
    return (
      multipleSelectedQuery && (
        <DataExportFormComponent
          tableName={tableName}
          selectedRowIDs={multipleSelectedQuery}
          filterQuery={filterQuery}
          isAllRowSelectChecked={isAllRowSelectChecked}
        />
      )
    );
  }, [tableName, filterQuery, isAllRowSelectChecked, multipleSelectedQuery]);

  const _renderSelectAllRowsCheckbox = useMemo(() => {
    return (
      isSelectAllRowCheckBoxEnabled && (
        <FormControl className="!flex-row !justify-start !items-center">
          <span>{`Select all ${rowCount} rows`}</span>
          <Checkbox
            checked={isAllRowSelectChecked}
            onChange={(_, checked) => {
              _handleToggleAllRowSelectCheckbox(checked);
            }}
          />
        </FormControl>
      )
    );
  }, [
    _handleToggleAllRowSelectCheckbox,
    isSelectAllRowCheckBoxEnabled,
    rowCount,
    isAllRowSelectChecked,
  ]);

  return isLoadingRows || isLoadingTableColumns || isLoadingTablePrimaryKey ? (
    <Loading />
  ) : (
    <div
      className={`w-full h-full ${containerClass}   !overflow-y-auto !overflow-x-auto`}
    >
      <div
        xs={12}
        item
        className={`!w-full !p-4 !h-fit`}
        style={{ background: theme.palette.background.default }}
      >
        {showStats && (
          <RawDataGridStatistics
            tableName={tableName}
            filterQuery={filterQuery}
            setRowCount={setRowCount}
          />
        )}
        <DataGridActionComponent
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          reloadData={reloadData}
          tableName={tableName}
          setSortModel={setSortModel}
          sortModel={sortModel}
          allowAdd={rowAddAuthorization}
          handleDeleteFilter={_handleDeleteFilter}
          combinator={combinator}
          setCombinator={setCombinator}
          filters={filters}
          setFilters={setFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>
      {data?.rows && columns && tablePrimaryKey ? (
        <div className="px-4">
          <DataGrid
            rows={data.rows}
            loading={isLoadingRows || isFetchingAllRows}
            className="!border-0 data-grid-custom-class"
            columns={columns}
            initialState={{}}
            editMode="row"
            hideFooterPagination={true}
            hideFooterSelectedRowCount={true}
            checkboxSelection
            disableRowSelectionOnClick
            getRowId={_getRowID}
            hideFooter={true}
            onRowClick={(param) => {
              onRowClick
                ? onRowClick(param)
                : navigate(
                    LOCAL_CONSTANTS.ROUTES.ROW_VIEW.path(
                      tableName,
                      JSON.stringify(_selectByIDQueryBuilder(param.row))
                    )
                  );
            }}
            disableColumnFilter
            sortingMode="server"
            autoHeight={true}
            getRowHeight={() => "auto"}
            slots={{
              toolbar: () => (
                <GridToolbarContainer className="!py-2 !-pr-5 justify-between">
                  <div>{_renderSelectAllRowsCheckbox}</div>

                  <div className="!flex-row justify-end">
                    {_renderExportButton}
                    {_renderMultipleDeleteButton}
                  </div>
                </GridToolbarContainer>
              ),
              loadingOverlay: LinearProgress,
            }}
            onRowSelectionModelChange={_handleMultipleSelectedRowsQueryBuilder}
          />
          <div
            className="flex flex-row w-full justify-end pb-2 !sticky !bottom-0 items-center pt-2"
            style={{
              background: theme.palette.background.default,
              borderTopWidth: 1,
              borderColor: theme.palette.divider,
            }}
          >
            <InputLabel id="demo-simple-select-label" className="!mr-2">
              Page size
            </InputLabel>
            <Select
              size="small"
              labelId="demo-simple-select-label"
              value={pageSize}
              variant="standard"
              label={"Page size"}
              onChange={_handleOnPageSizeChange}
            >
              {[20, 50, 100].map((size) => (
                <MenuItem
                  value={size}
                  className="!break-words !whitespace-pre-line"
                  key={`page_size_${size}`}
                >
                  {`${size}     `}
                </MenuItem>
              ))}
            </Select>

            <Pagination
              count={Boolean(data?.nextPage) ? page + 1 : page}
              page={page}
              onChange={(e, page) => {
                setPage(page);
              }}
              hideNextButton={!Boolean(data?.nextPage)}
              variant="text"
              shape="rounded"
              siblingCount={1}
            />
          </div>
        </div>
      ) : (
        <div className="!w-full !p-4">
          <ErrorComponent
            error={loadRowsError || LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR}
          />
        </div>
      )}
    </div>
  );
};
