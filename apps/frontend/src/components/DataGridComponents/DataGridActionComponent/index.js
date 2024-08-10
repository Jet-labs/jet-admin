import {
  Button,
  ButtonGroup,
  Grid,
  InputAdornment,
  TextField,
  useTheme,
} from "@mui/material";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import {
  FaFilter,
  FaPlus,
  FaRedoAlt,
  FaSearch,
  FaSort,
  FaTimes,
} from "react-icons/fa";
import { getAuthorizedColumnsForRead } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { AppliedFiltersList } from "../AppliedFilterList";
import { DataGridFilterComponent } from "../DataGridFilterComponent";
import { DataGridSortComponent } from "../DataGridSortComponent";
export const DataGridActionComponent = ({
  setFilterQuery,
  setSortModel,
  sortModel,
  reloadData,
  tableName,
  addRowNavigation,
  compact,
  allowAdd,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const [filters, setFilters] = useState([]);
  const [combinator, setCombinator] = useState("AND");

  const navigate = useNavigate();
  const {
    isLoading: isLoadingReadColumns,
    data: readColumns,
    error: loadReadColumnsError,
  } = useQuery({
    queryKey: [
      `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`,
      `read_column`,
    ],
    queryFn: () => getAuthorizedColumnsForRead({ tableName }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  useEffect(() => {
    if (
      readColumns &&
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
        const columnModel = readColumns.find(
          (columnModel) => columnModel.name === filter.field
        );
        if (columnModel.type == LOCAL_CONSTANTS.DATA_TYPES.STRING) {
          o["mode"] = "insensitive";
        }
        query[filter.field] = o;
        queries.push({ ...query });
      });
      const fq = {};
      fq[combinator] = [...queries];
      setFilterQuery?.(fq);
    } else if (
      readColumns &&
      tableName &&
      debouncedSearchTerm &&
      debouncedSearchTerm !== ""
    ) {
      let queries = [];
      console.log({ readColumns });
      const _query = readColumns.forEach((column) => {
        if (
          column.type == LOCAL_CONSTANTS.DATA_TYPES.STRING &&
          !column.isList
        ) {
          queries.push({
            [column.name]: {
              contains: debouncedSearchTerm,
              mode: "insensitive",
            },
          });
        }
      });
      console.log({ queries });
      setFilterQuery?.({ OR: queries });
    } else {
      setFilterQuery(null);
    }
  }, [filters, debouncedSearchTerm, combinator, readColumns, tableName]);

  const _handleOpenFilterMenu = () => {
    setIsFilterMenuOpen(true);
  };
  const _handleCloseFilterMenu = () => {
    setIsFilterMenuOpen(false);
  };

  const _handleOpenSortMenu = () => {
    setIsSortMenuOpen(true);
  };
  const _handleCloseSortMenu = () => {
    setIsSortMenuOpen(false);
  };
  const _handleNavigateRowAdditionForm = () => {
    navigate(
      addRowNavigation
        ? addRowNavigation
        : LOCAL_CONSTANTS.ROUTES.ADD_ROW.path(tableName)
    );
  };

  const _handleDeleteFilter = (index) => {
    if (index > -1) {
      const _f = [...filters];
      _f.splice(index, 1);
      setFilters(_f);
    }
  };

  const _handleDeleteSortModel = () => {
    setSortModel(null);
  };
  return (
    <Grid container className="py-2" rowSpacing={1}>
      <Grid item xs={12} md={12} lg={compact ? 12 : 6}>
        <TextField
          required
          fullWidth
          size="small"
          variant="outlined"
          type="text"
          name="query"
          placeholder="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch
                  className="!text-sm"
                  style={{ color: theme.palette.primary.main }}
                />
              </InputAdornment>
            ),
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          className="!border-[#7b79ff]"
          value={searchTerm}
        />
      </Grid>

      <Grid
        item
        xs={12}
        md={12}
        lg={compact ? 12 : 6}
        className="!flex !flex-row !justify-end !items-center"
      >
        <Button
          id="filter-menu-positioned-button"
          onClick={_handleOpenFilterMenu}
          startIcon={<FaFilter className="!text-sm" />}
          variant="outlined"
          size="medium"
        >
          Filter
        </Button>

        {sortModel ? (
          <ButtonGroup
            variant="outlined"
            aria-label="outlined button group"
            className="!ml-2"
          >
            <Button
              id="filter-menu-positioned-button"
              onClick={_handleOpenSortMenu}
              startIcon={<FaSort className="!text-sm" />}
              variant="outlined"
              size="medium"
            >
              {`${sortModel.field} | ${sortModel.order}`}
            </Button>
            <Button
              id="filter-menu-positioned-button"
              onClick={() => setSortModel(null)}
              endIcon={<FaTimes className="!text-sm" />}
              variant="outlined"
              size="medium"
            ></Button>
          </ButtonGroup>
        ) : (
          <Button
            id="filter-menu-positioned-button"
            onClick={_handleOpenSortMenu}
            startIcon={<FaSort className="!text-sm" />}
            variant="outlined"
            size="medium"
            className="!ml-2"
          >
            Sort
          </Button>
        )}

        <Button
          onClick={reloadData}
          startIcon={<FaRedoAlt className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
        >
          Reload
        </Button>
        {allowAdd && (
          <Button
            onClick={_handleNavigateRowAdditionForm}
            startIcon={<FaPlus className="!text-sm" />}
            size="medium"
            variant="contained"
            className="!ml-2"
          >
            Add
          </Button>
        )}
      </Grid>
      <AppliedFiltersList
        filters={filters}
        handleDeleteFilter={_handleDeleteFilter}
      />

      <DataGridFilterComponent
        isFilterMenuOpen={isFilterMenuOpen}
        handleCLoseFilterMenu={_handleCloseFilterMenu}
        tableName={tableName}
        setFilters={setFilters}
        filters={filters}
        combinator={combinator}
        setCombinator={setCombinator}
        readColumns={readColumns}
      />

      <DataGridSortComponent
        isSortMenuOpen={isSortMenuOpen}
        handleCLoseSortMenu={_handleCloseSortMenu}
        tableName={tableName}
        setSortModel={setSortModel}
        sortModel={sortModel}
        readColumns={readColumns}
      />
    </Grid>
  );
};
