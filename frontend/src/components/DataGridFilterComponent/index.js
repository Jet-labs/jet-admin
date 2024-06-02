import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { useMemo, useState } from "react";

import { LOCAL_CONSTANTS } from "../../constants";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { getAuthorizedColumnsForRead } from "../../api/tables";
import { useAuthState } from "../../contexts/authContext";
import { useConstants } from "../../contexts/constantsContext";
import { getFormattedTableColumns } from "../../utils/tables";
import { FieldComponent } from "../FieldComponent";

export const DataGridFilterComponent = ({
  tableName,
  setFilters,
  filters,
  isFilterMenuOpen,
  handleCLoseFilterMenu,
  combinator,
  setCombinator,
}) => {
  const { pmUser } = useAuthState();

  const [filterField, setFilterField] = useState("");
  const [filterOperator, setFilterOperator] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const _handleChangeCombinator = (e) => {
    setCombinator(e.target.value);
  };

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
    staleTime: Infinity,
  });

  const authorizedColumns = useMemo(() => {
    if (readColumns) {
      const c = getFormattedTableColumns(readColumns);
      return c;
    } else {
      return null;
    }
  }, [readColumns]);

  const fieldType = useMemo(() => {
    if (readColumns && filterField) {
      return readColumns.find((fieldModel) => fieldModel.name === filterField)
        .type;
    }
  }, [readColumns, filterField]);

  const _handleChangeFilterField = (e) => {
    setFilterField(e.target.value);
  };

  const _handleChangeFilterOperator = (e) => {
    setFilterOperator(e.target.value);
  };

  const _handleFilterValue = (e) => {
    if (fieldType) {
      let v = "";
      switch (fieldType) {
        case LOCAL_CONSTANTS.DATA_TYPES.STRING:
          v = e.target.value;
          break;
        case LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN:
          v = e.target.value;
          break;
        case LOCAL_CONSTANTS.DATA_TYPES.DATETIME:
          v = moment(e).toDate();
          break;
        case LOCAL_CONSTANTS.DATA_TYPES.INT:
          v = parseInt(e.target.value);
          break;
        default:
          v = e.target.value;
      }
      setFilterValue(v);
    }
  };

  const _handleAddFilter = (e) => {
    e.preventDefault();
    if (filterField && filterOperator && filterValue) {
      const _filter = {
        field: filterField,
        operator: filterOperator,
        value: filterValue,
      };
      setFilters([...filters, { ..._filter }]);
    }
  };

  return (
    <Dialog
      open={isFilterMenuOpen}
      onClose={handleCLoseFilterMenu}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      scroll="paper"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle className=" !text-lg !flex flex-row justify-between items-center w-full">
        Filters
        <IconButton aria-label="close" onClick={handleCLoseFilterMenu}>
          <FaTimes className="!text-sm" />
        </IconButton>
      </DialogTitle>
      {/* <Divider /> */}
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Select
              name="combinator"
              onChange={_handleChangeCombinator}
              value={combinator}
              IconComponent={() => <FaChevronDown className="!text-sm" />}
              size="small"
              className=""
              fullWidth
            >
              <MenuItem
                value={"OR"}
                className="!break-words !whitespace-pre-line"
                key={"OR"}
              >
                {"OR"}
              </MenuItem>
              <MenuItem
                value={"AND"}
                className="!break-words !whitespace-pre-line"
                key={"AND"}
              >
                {"AND"}
              </MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Select
              name="field"
              onChange={_handleChangeFilterField}
              value={filterField}
              IconComponent={() => <FaChevronDown className="!text-sm" />}
              size="small"
              className=""
              fullWidth
            >
              {authorizedColumns?.map((column, index) => {
                return (
                  <MenuItem
                    value={column.field}
                    className="!break-words !whitespace-pre-line"
                    key={index}
                  >
                    {column.headerName}
                  </MenuItem>
                );
              })}
            </Select>
          </Grid>
          {
            <Grid item xs={12} sm={4}>
              <Select
                name="operator"
                onChange={_handleChangeFilterOperator}
                value={filterOperator}
                IconComponent={() => <FaChevronDown className="!text-sm" />}
                size="small"
                className=""
                fullWidth
              >
                {Object.keys(LOCAL_CONSTANTS.TABLE_FILTERS).map(
                  (operator, index) => {
                    return (
                      <MenuItem
                        value={operator}
                        className="!break-words !whitespace-pre-line"
                        key={index}
                      >
                        {operator}
                      </MenuItem>
                    );
                  }
                )}
              </Select>
            </Grid>
          }
          {fieldType && (
            <Grid item xs={12} sm={12}>
              <FieldComponent
                name="value"
                type={fieldType}
                value={filterValue}
                onChange={_handleFilterValue}
                required={true}
                showDefault={true}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          disableElevation
          variant="contained"
          size="small"
          onClick={_handleAddFilter}
        >
          Apply filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};
