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
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";

import { LOCAL_CONSTANTS } from "../../../constants";

import moment from "moment";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { useAuthState } from "../../../contexts/authContext";
import { getFormattedTableColumns } from "../../../utils/tables";
import { FieldComponent } from "../../FieldComponent";

export const DataGridFilterComponent = ({
  tableName,
  setFilters,
  filters,
  isFilterMenuOpen,
  handleCLoseFilterMenu,
  combinator,
  setCombinator,
  tableColumns,
}) => {
  const theme = useTheme();

  const [filterField, setFilterField] = useState("");
  const [filterOperator, setFilterOperator] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const _handleChangeCombinator = (e) => {
    setCombinator(e.target.value);
  };

  const columns = useMemo(() => {
    if (tableColumns) {
      const c = getFormattedTableColumns(tableColumns);
      return c;
    } else {
      return null;
    }
  }, [tableColumns]);

  const fieldType = useMemo(() => {
    if (tableColumns && filterField) {
      return tableColumns.find((fieldModel) => fieldModel.name === filterField)
        .type;
    }
  }, [tableColumns, filterField]);

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
      console.log({ setFilter: [...filters, { ..._filter }] });
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
      <DialogTitle
        style={{
          background: theme.palette.background.default,
          color: theme.palette.primary.contrastText,
        }}
        className=" !text-lg !flex flex-row justify-between items-center w-full"
      >
        Filters
        <IconButton aria-label="close" onClick={handleCLoseFilterMenu}>
          <FaTimes className="!text-sm" />
        </IconButton>
      </DialogTitle>
      {/* <Divider /> */}
      <DialogContent
        dividers
        style={{
          background: theme.palette.background.default,
          color: theme.palette.primary.contrastText,
        }}
      >
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
              {columns?.map((column, index) => {
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
      <DialogActions
        style={{
          background: theme.palette.background.default,
          color: theme.palette.primary.contrastText,
        }}
      >
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
