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
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { LOCAL_CONSTANTS } from "../../../constants";

import { useAuthState } from "../../../contexts/authContext";
import { getFormattedTableColumns } from "../../../utils/tables";

export const DataGridSortComponent = ({
  tableName,
  setSortModel,
  sortModel,
  isSortMenuOpen,
  handleCLoseSortMenu,
  tableColumns,
}) => {
  const { pmUser } = useAuthState();
  const theme = useTheme();

  const [sortField, setSortField] = useState(sortModel ? sortModel.field : "");
  const [sortOrder, setSortOrder] = useState(sortModel ? sortModel.order : "");

  const columns = useMemo(() => {
    if (tableColumns) {
      const c = getFormattedTableColumns(tableColumns);
      return c;
    } else {
      return null;
    }
  }, [tableColumns]);

  const _handleChangeSortField = (e) => {
    setSortField(e.target.value);
  };

  const _handleChangeSortOrder = (e) => {
    setSortOrder(e.target.value);
  };

  const _handleAddSort = (e) => {
    e.preventDefault();
    if (
      (sortField && sortOrder === LOCAL_CONSTANTS.TABLE_COLUMN_SORT.asc) ||
      sortOrder === LOCAL_CONSTANTS.TABLE_COLUMN_SORT.desc
    ) {
      setSortModel({ field: sortField, order: sortOrder });
    } else {
      setSortModel(null);
    }
    handleCLoseSortMenu();
  };

  return (
    <Dialog
      open={isSortMenuOpen}
      onClose={handleCLoseSortMenu}
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
        Sort
        <IconButton aria-label="close" onClick={handleCLoseSortMenu}>
          <FaTimes className="!text-sm" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        style={{
          background: theme.palette.background.default,
          color: theme.palette.primary.contrastText,
        }}
        dividers
      >
        <Grid container spacing={2} className="!p-4">
          <Grid item xs={12} sm={6}>
            <Select
              name="field"
              onChange={_handleChangeSortField}
              value={sortField}
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

          <Grid item xs={12} sm={6}>
            <Select
              name="operator"
              onChange={_handleChangeSortOrder}
              value={sortOrder}
              IconComponent={() => <FaChevronDown className="!text-sm" />}
              size="small"
              className=""
              fullWidth
            >
              {Object.keys(LOCAL_CONSTANTS.TABLE_COLUMN_SORT).map(
                (order, index) => {
                  return (
                    <MenuItem
                      value={order}
                      className="!break-words !whitespace-pre-line"
                      key={index}
                    >
                      {order}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </Grid>
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
          onClick={_handleAddSort}
        >
          Apply sort
        </Button>
      </DialogActions>
    </Dialog>
  );
};
