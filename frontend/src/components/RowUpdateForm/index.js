import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchRowByIDAPI } from "../../api/get";

import { Button, CircularProgress, Grid, Paper } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Loading } from "../../pages/Loading";
import { FieldComponent } from "../FieldComponent";

import { updateRowAPI } from "../../api/put";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthState } from "../../contexts/authContext";
import { useConstants } from "../../contexts/constantsContext";
import { displayError, displaySuccess } from "../../utils/notification";
import {
  getAllTableFields,
  getRequiredFields,
  getTableIDProperty,
} from "../../utils/tables";
import { ErrorComponent } from "../ErrorComponent";
import { RowDeletionForm } from "../RowDeletetionForm";

export const RowUpdateForm = ({ tableName, id }) => {
  const queryClient = new QueryClient();
  const { dbModel } = useConstants();
  const { pmUser } = useAuthState();

  const primaryColumns = useMemo(() => {
    if (dbModel) {
      return getTableIDProperty(tableName, dbModel);
    }
  }, [tableName, dbModel]);

  const requiredColumns = useMemo(() => {
    if (dbModel && tableName) {
      return getRequiredFields(tableName, dbModel);
    }
  }, [dbModel, tableName]);

  const authorizedColumns = useMemo(() => {
    if (pmUser && dbModel && tableName) {
      const u = pmUser;
      const c = u.extractAuthorizedColumnsForEditFromPolicyObject(tableName);
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
  }, [pmUser, dbModel, tableName]);

  const {
    isLoading: isLoadingRowData,
    data: rowData,
    error: loadRowDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_${String(tableName).toUpperCase()}`, id],
    queryFn: () => fetchRowByIDAPI({ tableName, id }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });
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
        `REACT_QUERY_KEY_${String(tableName).toUpperCase()}`,
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
      requiredColumns?.forEach((column) => {
        if (!values[column]) {
          errors[column] = "Required";
        }
      });
      console.log({ errors });
      return errors;
    },
    onSubmit: (values) => {
      console.log({ values });
      updateRow({ tableName, id, data: values });
    },
  });

  return authorizedColumns?.length > 0 ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">{`Update row`}</span>
          {tableName && primaryColumns && (
            <span className="text-xs font-thin text-start text-slate-300">{`Table : ${tableName} | Entry ID : ${Array.from(
              primaryColumns
            ).join(", ")}`}</span>
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
        <Paper
          className="px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3"
          variant="outlined"
        >
          <form className="" onSubmit={rowUpdateForm.handleSubmit}>
            <Grid container rowSpacing={2} columnSpacing={3} className="!mt-2">
              {authorizedColumns.map((column, index) => {
                return (
                  <Grid item xs={12} sm={12} md={12} lg={12} key={index}>
                    <FieldComponent
                      readOnly={Array.from(primaryColumns).includes(
                        column.field
                      )}
                      type={column.type}
                      name={column.field}
                      value={rowUpdateForm.values[column.field]}
                      onBlur={rowUpdateForm.handleBlur}
                      onChange={rowUpdateForm.handleChange}
                      setFieldValue={rowUpdateForm.setFieldValue}
                      helperText={rowUpdateForm.errors[column.field]}
                      error={Boolean(rowUpdateForm.errors[column.field])}
                      required={requiredColumns?.includes(column.field)}
                      customMapping={
                        LOCAL_CONSTANTS.CUSTOM_INT_MAPPINGS[tableName]?.[
                          column.field
                        ]
                      }
                    />
                  </Grid>
                );
              })}
            </Grid>
          </form>
        </Paper>
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
