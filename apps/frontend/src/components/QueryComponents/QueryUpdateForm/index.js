import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useEffect } from "react";
import "react-data-grid/lib/styles.css";
import { getQueryByIDAPI, updateQueryAPI } from "../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../constants";
import { PGSQLQueryBuilder } from "../../../plugins/postgresql/components/PGSQLQueryBuilder";
import { displayError, displaySuccess } from "../../../utils/notification";
import { QueryDeletionForm } from "../QueryDeletionForm";
import { QueryDuplicateForm } from "../QueryDuplicateForm";
import { PLUGINS_MAP } from "../../../plugins";

export const QueryUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingQueryData,
    data: queryData,
    error: loadQueryDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_QUERIES`, id],
    queryFn: () => getQueryByIDAPI({ pmQueryID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const queryBuilderForm = useFormik({
    initialValues: {
      pm_query_title: "Untitled",
      pm_query_description: "",
      pm_query_type: LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE.POSTGRE_QUERY.value,
      pm_query: null,
      pm_query_id: parseInt(id),
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {},
  });

  useEffect(() => {
    if (queryBuilderForm && queryData) {
      queryBuilderForm.setFieldValue(
        "pm_query_title",
        queryData.pm_query_title
      );
      queryBuilderForm.setFieldValue(
        "pm_query_description",
        queryData.pm_query_description
      );
      queryBuilderForm.setFieldValue("pm_query_type", queryData.pm_query_type);
      queryBuilderForm.setFieldValue("pm_query", queryData.pm_query);
    }
  }, [queryData]);

  const {
    isPending: isUpdatingQuery,
    isSuccess: isUpdatingQuerySuccess,
    isError: isUpdatingQueryError,
    error: updateQueryError,
    mutate: updateQuery,
  } = useMutation({
    mutationFn: (queryData) => {
      return updateQueryAPI({
        data: queryData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess("Query updated successfully");
      queryClient.invalidateQueries(["REACT_QUERY_KEY_QUERIES"]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOnQueryChange = useCallback(
    (value) => {
      if (queryBuilderForm) {
        queryBuilderForm.setFieldValue("pm_query", value);
      }
    },
    [queryBuilderForm]
  );

  const _updateQuery = () => {
    updateQuery(queryBuilderForm.values);
  };

  console.log({ queryData });
  return (
    <div className="w-full !h-[calc(100vh-123px)]">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 !border-b !border-white !border-opacity-10"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">{`Update query`}</span>
      </div>

      <Grid container className="!h-full">
        <Grid item sx={4} md={4} lg={4} className="w-full">
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Query type`}</span>

            <Select
              value={queryBuilderForm.values.pm_query_type}
              onChange={queryBuilderForm.handleChange}
              onBlur={queryBuilderForm.handleBlur}
              name={"pm_query_type"}
              required={true}
              size="small"
              fullWidth={false}
            >
              {Object.keys(LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE).map(
                (queryType) => {
                  const value =
                    LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE[queryType].value;
                  const name =
                    LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE[queryType].name;
                  return <MenuItem value={value}>{name}</MenuItem>;
                }
              )}
            </Select>
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Title`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"pm_query_title"}
              value={queryBuilderForm.values.pm_query_title}
              onChange={queryBuilderForm.handleChange}
              onBlur={queryBuilderForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Description`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"pm_query_description"}
              value={queryBuilderForm.values.pm_query_description}
              onChange={queryBuilderForm.handleChange}
              onBlur={queryBuilderForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>

          <div className="!flex flex-row justify-end items-center mt-10 w-100 px-3">
            <Button
              variant="contained"
              className="!ml-3"
              onClick={_updateQuery}
            >{`Save query`}</Button>
            <QueryDeletionForm pmQueryID={id} />
            <QueryDuplicateForm pmQueryID={id} />
          </div>
        </Grid>
        <Grid
          item
          sx={8}
          md={8}
          lg={8}
          className="w-full !h-full !border-l !border-white !border-opacity-10"
        >
          {PLUGINS_MAP[queryBuilderForm.values.pm_query_type].component({
            value: queryBuilderForm.values.pm_query,
            handleChange: _handleOnQueryChange,
          })}
        </Grid>
      </Grid>
    </div>
  );
};
