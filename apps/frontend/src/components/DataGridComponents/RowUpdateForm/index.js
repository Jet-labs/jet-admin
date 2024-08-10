import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import {
  fetchRowByIDAPI,
  getAuthorizedColumnsForRead,
} from "../../../api/tables";

import { Button, CircularProgress, Grid, useTheme } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Loading } from "../../../pages/Loading";
import { FieldComponent } from "../../FieldComponent";

import { getAuthorizedColumnsForEdit, updateRowAPI } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { getFormattedTableColumns } from "../../../utils/tables";
import { ErrorComponent } from "../../ErrorComponent";
import { RowDeletionForm } from "../RowDeletetionForm";
import { useAppConstants } from "../../../contexts/appConstantsContext";

export const RowUpdateForm = ({ customTitle, tableName, id }) => {
  const queryClient = new QueryClient();
  const { internalAppConstants } = useAppConstants();
  const theme = useTheme();
  const {
    isLoading: isLoadingRowData,
    data: rowData,
    error: loadRowDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`, id],
    queryFn: () => fetchRowByIDAPI({ tableName, id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingEditColumns,
    data: editColumns,
    error: loadEditColumnsError,
  } = useQuery({
    queryKey: [
      `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`,
      `edit_column`,
    ],
    queryFn: () => getAuthorizedColumnsForRead({ tableName }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const authorizedColumns = useMemo(() => {
    if (editColumns) {
      const c = getFormattedTableColumns(editColumns);
      return c;
    } else {
      return null;
    }
  }, [editColumns]);

  useEffect(() => {
    if (rowData && authorizedColumns) {
      authorizedColumns.forEach((column) => {
        rowUpdateForm.setFieldValue(`${column.field}`, rowData[column.field]);
      });
    }
  }, [rowData, authorizedColumns]);

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
      displaySuccess("Updated row successfully");
      queryClient.invalidateQueries([
        `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`,
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
      updateRow({ tableName, id, data: values });
    },
  });

  return authorizedColumns?.length > 0 ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2 overflow-y-scroll">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {customTitle ? customTitle : `Update row`}
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
            Update
          </Button>
        </div>
      </div>
      {/* <Divider className="!w-full" /> */}
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
              {authorizedColumns.map((column, index) => {
                return (
                  <Grid item xs={12} sm={12} md={12} lg={12} key={index}>
                    <FieldComponent
                      type={column.type}
                      name={column.field}
                      isList={column.isList}
                      value={rowUpdateForm.values[column.field]}
                      onBlur={rowUpdateForm.handleBlur}
                      onChange={rowUpdateForm.handleChange}
                      setFieldValue={rowUpdateForm.setFieldValue}
                      helperText={rowUpdateForm.errors[column.field]}
                      error={Boolean(rowUpdateForm.errors[column.field])}
                      customMapping={
                        internalAppConstants?.CUSTOM_INT_EDIT_MAPPING?.[
                          tableName
                        ]?.[column.field]
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
  ) : !authorizedColumns || authorizedColumns.length == 0 ? (
    <div className="!w-full !p-4">
      <ErrorComponent error={LOCAL_CONSTANTS.ERROR_CODES.PERMISSION_DENIED} />
    </div>
  ) : (
    <Loading />
  );
};
