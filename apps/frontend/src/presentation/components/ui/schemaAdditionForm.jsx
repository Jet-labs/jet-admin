import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createDatabaseSchemaAPI } from "../../../data/apis/database";
import { displayError, displaySuccess } from "../../../utils/notification";

export const DatabaseSchemaAdditionForm = ({ tenantID }) => {
  const queryClient = useQueryClient();

  const {
    isPending: isCreatingNewDatabaseSchema,
    isSuccess: isCreatingNewDatabaseSchemaSuccess,
    isError: isCreatingNewDatabaseSchemaError,
    error: createNewDatabaseSchemaError,
    mutate: createNewDatabaseSchema,
  } = useMutation({
    mutationFn: ({ databaseSchemaName }) =>
      createDatabaseSchemaAPI({
        tenantID,
        databaseSchemaName,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.ADD_SCHEMA_SUCCESS_TOAST);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_METADATA(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const addSchemaForm = useFormik({
    initialValues: {
      databaseSchemaName: "",
    },
    validate: ({ databaseSchemaName }) => {
      const errors = {};
      if (
        !databaseSchemaName ||
        String(databaseSchemaName).trim().length == 0
      ) {
        errors.databaseSchemaName = "Schema name is required";
      }
    },
    onSubmit: ({ databaseSchemaName }) => {
      createNewDatabaseSchema({ databaseSchemaName });
    },
  });

  return (
    <section class="max-w-3xl w-full">
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 class="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
          {CONSTANTS.STRINGS.ADD_SCHEMA_FORM_TITLE}
        </h1>
        <form
          class="space-y-4 md:space-y-6"
          onSubmit={addSchemaForm.handleSubmit}
        >
          <div>
            <label
              for="databaseSchemaName"
              class="block mb-1 text-sm font-medium text-slate-500"
            >
              {CONSTANTS.STRINGS.ADD_SCHEMA_FORM_NAME_FIELD_LABEL}
            </label>
            <input
              type="databaseSchemaName"
              name="databaseSchemaName"
              id="databaseSchemaName"
              class=" placeholder:text-slate-400 bg-slate-50 text-sm border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
              placeholder={
                CONSTANTS.STRINGS.ADD_SCHEMA_FORM_NAME_FIELD_PLACEHOLDER
              }
              required={true}
              onChange={addSchemaForm.handleChange}
              onBlur={addSchemaForm.handleBlur}
              value={addSchemaForm.values.databaseSchemaName}
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingNewDatabaseSchema}
            class="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
          >
            {isCreatingNewDatabaseSchema && (
              <CircularProgress
                className="!text-sm !mr-3"
                size={20}
                color="white"
              />
            )}
            {CONSTANTS.STRINGS.ADD_SCHEMA_FORM_SUBMIT_BUTTON}
          </button>
        </form>
      </div>
    </section>
  );
};
