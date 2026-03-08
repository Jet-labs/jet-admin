import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createDatabaseSchemaAPI } from "../../../data/apis/database";
import { displayError, displaySuccess } from "../../../utils/notification";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner, Input, Label } from "@jet-admin/ui";
export const DatabaseSchemaAdditionForm = ({ tenantID }) => {
  DatabaseSchemaAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();

  const {
    isPending: isCreatingNewDatabaseSchema,
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
    validationSchema: formValidations.addSchemaFormValidationSchema,
    onSubmit: ({ databaseSchemaName }) => {
      createNewDatabaseSchema({ databaseSchemaName });
    },
  });

  return (
    <section className="max-w-2xl w-full rounded-lg border border-border bg-background shadow-sm">
      <div className="space-y-6 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {CONSTANTS.STRINGS.ADD_SCHEMA_FORM_TITLE}
        </h1>
        <form
          className="space-y-4 md:space-y-6"
          onSubmit={addSchemaForm.handleSubmit}
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="databaseSchemaName"
              className="text-sm text-foreground"
            >
              {CONSTANTS.STRINGS.ADD_SCHEMA_FORM_NAME_FIELD_LABEL}
            </Label>
            <Input
              type="text"
              name="databaseSchemaName"
              id="databaseSchemaName"
              placeholder={
                CONSTANTS.STRINGS.ADD_SCHEMA_FORM_NAME_FIELD_PLACEHOLDER
              }
              required={true}
              onChange={addSchemaForm.handleChange}
              onBlur={addSchemaForm.handleBlur}
              value={addSchemaForm.values.databaseSchemaName}
            />
            {addSchemaForm.touched.databaseSchemaName &&
              addSchemaForm.errors.databaseSchemaName && (
                <span className="text-xs text-destructive">
                  {addSchemaForm.errors.databaseSchemaName}
                </span>
              )}
          </div>

          <Button type="submit" disabled={isCreatingNewDatabaseSchema}>
            {isCreatingNewDatabaseSchema && (
              <Spinner className="mr-3" size={16} />
            )}
            {CONSTANTS.STRINGS.ADD_SCHEMA_FORM_SUBMIT_BUTTON}
          </Button>
        </form>
      </div>
    </section>
  );
};
