import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";

import { Button, CircularProgress, Grid, Paper, useTheme } from "@mui/material";
import { useMemo } from "react";
import { addRowAPI, getTableInfo } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  getFormattedTableColumns,
  processTableFieldValuesBeforeSubmit,
} from "../../../utils/tables";
import { ErrorComponent } from "../../ErrorComponent";
import { FieldComponent } from "../../FieldComponent";

export const RowAdditionForm = ({ tableName, customTitle }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingTableInfo,
    data: tableInfo,
    error: loadTableInfoError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID_COLUMNS(tableName)],
    queryFn: () => getTableInfo({ tableName }),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });

  const tableColumns = tableInfo?.columns;

  const {
    isPending: isAddingRow,
    isSuccess: isAddingRowSuccess,
    isError: isAddingRowError,
    error: addRowError,
    mutate: addRow,
  } = useMutation({
    mutationFn: ({ tableName, data }) => {
      return addRowAPI({ tableName, data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ROW_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const rowAdditionForm = useFormik({
    initialValues: {},
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {
      addRow({
        tableName,
        data: processTableFieldValuesBeforeSubmit({
          columns: tableColumns,
          values,
        }),
      });
    },
  });
  return tableColumns && tableColumns.length > 0 ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full mt-3 ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {customTitle ? customTitle : `Add row`}
          </span>
          <span
            style={{ color: theme.palette.text.secondary }}
            className="text-xs font-thin text-start text-slate-300"
          >{`Table : ${tableName}`}</span>
        </div>

        <div className="flex flex-row items-center justify-end w-min">
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isAddingRow && <CircularProgress color="inherit" size={12} />
            }
            className="!ml-2"
            onClick={rowAdditionForm.handleSubmit}
          >
            <span className="!w-max">
              {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
            </span>
          </Button>
        </div>
      </div>
      <div
        className="px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3"
        style={{
          borderRadius: 4,
          borderWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <form onSubmit={rowAdditionForm.handleSubmit}>
          <Grid
            container
            spacing={{ xs: 1, md: 2 }}
            columns={{ xs: 1, sm: 1, md: 2 }}
            className="!mt-2"
          >
            {tableColumns.map((column, index) => {
              return (
                <Grid item xs={12} sm={12} md={12} lg={12} key={index}>
                  <FieldComponent
                    type={column.type}
                    name={column.name}
                    value={rowAdditionForm.values[column.name]}
                    onBlur={rowAdditionForm.handleBlur}
                    onChange={rowAdditionForm.handleChange}
                    helperText={rowAdditionForm.errors[column.name]}
                    error={Boolean(rowAdditionForm.errors[column.name])}
                    setFieldValue={rowAdditionForm.setFieldValue}
                    isList={column.isList}
                  />
                </Grid>
              );
            })}
          </Grid>
        </form>
      </div>
    </div>
  ) : (
    <div className="p-3">
      <ErrorComponent error={LOCAL_CONSTANTS.ERROR_CODES.PERMISSION_DENIED} />
    </div>
  );
};
