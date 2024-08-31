import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchRowByIDAPI, getTableColumns } from "../../../api/tables";

import { Button, CircularProgress, Grid, useTheme } from "@mui/material";
import { useEffect } from "react";
import { Loading } from "../../../pages/Loading";
import { FieldComponent } from "../../FieldComponent";

import { updateRowAPI } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAppConstants } from "../../../contexts/appConstantsContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { processTableFieldValuesBeforeSubmit } from "../../../utils/tables";
import { ErrorComponent } from "../../ErrorComponent";
import { RowDeletionForm } from "../RowDeletetionForm";

export const RowUpdateForm = ({ customTitle, tableName, id }) => {
  const queryClient = new QueryClient();
  const { internalAppConstants } = useAppConstants();
  const theme = useTheme();
  const {
    isLoading: isLoadingRowData,
    data: rowData,
    error: loadRowDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName), , id],
    queryFn: () => fetchRowByIDAPI({ tableName, id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingEditColumns,
    data: tableColumns,
    error: loadEditColumnsError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID_COLUMNS(tableName)],
    queryFn: () => getTableColumns({ tableName }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  useEffect(() => {
    if (rowData && tableColumns) {
      tableColumns.forEach((column) => {
        rowUpdateForm.setFieldValue(`${column.name}`, rowData[column.name]);
      });
    }
  }, [rowData, tableColumns]);

  const {
    isPending: isUpdatingRow,
    isSuccess: isUpdateRowSuccess,
    isError: isUpdateRowError,
    error: updateRowError,
    mutate: updateRow,
  } = useMutation({
    mutationFn: ({ tableName, id, data }) => {
      return updateRowAPI({ tableName, id, data });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ROW_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const rowUpdateForm = useFormik({
    initialValues: {},
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {
      updateRow({
        tableName,
        id,
        data: processTableFieldValuesBeforeSubmit({
          columns: tableColumns,
          values,
        }),
      });
    },
  });

  return tableColumns?.length > 0 ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2 overflow-y-scroll">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {customTitle
              ? customTitle
              : LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
          </span>
          {tableName && (
            <span
              style={{ color: theme.palette.text.secondary }}
              className="text-xs font-thin text-start text-slate-300"
            >{`Table : ${tableName} | Entry ID : ${id}`}</span>
          )}
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
          <RowDeletionForm tableName={tableName} id={id} />
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isUpdatingRow && <CircularProgress color="inherit" size={12} />
            }
            className="!ml-2"
            onClick={rowUpdateForm.submitForm}
          >
            {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
          </Button>
        </div>
      </div>
      {isLoadingRowData ? (
        <Loading />
      ) : (
        <div
          className="px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3"
          style={{
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.palette.divider,
          }}
        >
          <form className="" onSubmit={rowUpdateForm.handleSubmit}>
            <Grid container rowSpacing={2} columnSpacing={3} className="!mt-2">
              {tableColumns.map((column, index) => {
                return (
                  <Grid item xs={12} sm={12} md={12} lg={12} key={index}>
                    <FieldComponent
                      type={column.type}
                      name={column.name}
                      isList={column.isList}
                      value={rowUpdateForm.values[column.name]}
                      onBlur={rowUpdateForm.handleBlur}
                      onChange={rowUpdateForm.handleChange}
                      setFieldValue={rowUpdateForm.setFieldValue}
                      helperText={rowUpdateForm.errors[column.name]}
                      error={Boolean(rowUpdateForm.errors[column.name])}
                      customMapping={
                        internalAppConstants?.CUSTOM_INT_EDIT_MAPPING?.[
                          tableName
                        ]?.[column.name]
                      }
                    />
                  </Grid>
                );
              })}
            </Grid>
          </form>
        </div>
      )}
    </div>
  ) : !tableColumns || tableColumns.length == 0 ? (
    <div className="!w-full !p-4">
      <ErrorComponent error={LOCAL_CONSTANTS.ERROR_CODES.PERMISSION_DENIED} />
    </div>
  ) : (
    <Loading />
  );
};
