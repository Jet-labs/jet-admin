import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useFormik, useFormikContext } from "formik";
import {
  Button,
  ButtonGroup,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  ListItem,
  TextField,
} from "@mui/material";


import { DataGridFilterComponent } from "../DataGridFilterComponent";
import {
  getRawQueryFromFilters,
  getRawQueryFromTextQuery,
} from "../../utils/tables";
import { useConstants } from "../../contexts/constantsContext";
import { AppliedFiltersList } from "../AppliedFilterList";
import { RowAdditionForm } from "../RowAdditionForm";
import { useAuthState } from "../../contexts/authContext";
import { DataGridSortComponent } from "../DataGridSortComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import {
  FaSearch,
  FaRedoAlt,
  FaFilter,
  FaPlus,
  FaSort,
  FaCross,
  FaTimes,
} from "react-icons/fa";
export const DataGridActionComponent = ({
  setFilterQuery,
  setSortModel,
  sortModel,
  reloadData,
  tableName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const [filters, setFilters] = useState([]);
  const [combinator, setCombinator] = useState("AND");
  const { dbModel } = useConstants();

  const navigate = useNavigate();
  useEffect(() => {
    if (dbModel && tableName && combinator && filters && filters.length > 0) {
      setFilterQuery?.(
        getRawQueryFromFilters(dbModel, tableName, filters, combinator)
      );
    } else if (
      dbModel &&
      tableName &&
      debouncedSearchTerm &&
      debouncedSearchTerm !== ""
    ) {
      setFilterQuery?.(
        getRawQueryFromTextQuery(dbModel, tableName, debouncedSearchTerm)
      );
    } else {
      setFilterQuery(null);
    }
  }, [filters, debouncedSearchTerm, dbModel, tableName]);

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
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_ROW.path(tableName));
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
      <Grid item xs={12} md={12} lg={6}>
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
                <FaSearch className="!text-sm" />
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
        lg={6}
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
        <Button
          onClick={_handleNavigateRowAdditionForm}
          startIcon={<FaPlus className="!text-sm" />}
          size="medium"
          variant="contained"
          className="!ml-2"
        >
          Add
        </Button>

        {/* <RowAdditionForm tableName={tableName} /> */}
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
      />

      <DataGridSortComponent
        isSortMenuOpen={isSortMenuOpen}
        handleCLoseSortMenu={_handleCloseSortMenu}
        tableName={tableName}
        setSortModel={setSortModel}
        sortModel={sortModel}
      />
    </Grid>
  );
};
