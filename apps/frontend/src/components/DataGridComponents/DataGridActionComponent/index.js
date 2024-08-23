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
import { getTableColumns } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { AppliedFiltersList } from "../AppliedFilterList";
import { DataGridFilterComponent } from "../DataGridFilterComponent";
import { DataGridSortComponent } from "../DataGridSortComponent";
export const DataGridActionComponent = ({
  setSortModel,
  setSearchTerm,
  searchTerm,
  filters,
  setFilters,
  combinator,
  setCombinator,
  sortModel,
  reloadData,
  tableName,
  addRowNavigation,
  compact,
  allowAdd,
  handleDeleteFilter,
}) => {
  const theme = useTheme();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const navigate = useNavigate();
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
        handleDeleteFilter={handleDeleteFilter}
      />

      <DataGridFilterComponent
        isFilterMenuOpen={isFilterMenuOpen}
        handleCLoseFilterMenu={_handleCloseFilterMenu}
        tableName={tableName}
        setFilters={setFilters}
        filters={filters}
        combinator={combinator}
        setCombinator={setCombinator}
        tableColumns={tableColumns}
      />

      <DataGridSortComponent
        isSortMenuOpen={isSortMenuOpen}
        handleCLoseSortMenu={_handleCloseSortMenu}
        tableName={tableName}
        setSortModel={setSortModel}
        sortModel={sortModel}
        tableColumns={tableColumns}
      />
    </Grid>
  );
};
