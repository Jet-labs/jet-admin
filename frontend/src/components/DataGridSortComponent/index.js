import { Close, ExpandMore } from "@mui/icons-material";
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

import { useAuthState } from "../../contexts/authContext";
import { useConstants } from "../../contexts/constantsContext";
import { getAllTableFields } from "../../utils/tables";

export const DataGridSortComponent = ({
  tableName,
  setSortModel,
  sortModel,
  isSortMenuOpen,
  handleCLoseSortMenu,
}) => {
  const { dbModel } = useConstants();
  const { pmUser } = useAuthState();

  const [sortField, setSortField] = useState(sortModel ? sortModel.field : "");
  const [sortOrder, setSortOrder] = useState(sortModel ? sortModel.order : "");

  const authorizedColumns = useMemo(() => {
    if (pmUser && dbModel && tableName) {
      const u = pmUser;
      const c = u.extractAuthorizedColumnsForReadFromPolicyObject(tableName);
      if (c === true) {
        return getAllTableFields(dbModel, tableName);
      } else if (c === false) {
        return null;
      } else {
        const a = getAllTableFields(dbModel, tableName);

        return a.filter((header) => {
          return c.includes(header.field);
        });
      }
    } else {
      return null;
    }
  }, [pmUser, tableName, dbModel]);

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
      <DialogTitle className=" !text-lg !flex flex-row justify-between items-center w-full">
        Sort
        <IconButton aria-label="close" onClick={handleCLoseSortMenu}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} className="!p-4">
          <Grid item xs={12} sm={6}>
            <Select
              name="field"
              onChange={_handleChangeSortField}
              value={sortField}
              IconComponent={ExpandMore}
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

          <Grid item xs={12} sm={6}>
            <Select
              name="operator"
              onChange={_handleChangeSortOrder}
              value={sortOrder}
              IconComponent={ExpandMore}
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
      <DialogActions>
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
