import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";

import { createDatabaseNotificationAPI } from "../../../data/apis/databaseNotification";
import { formValidations } from "../../../utils/formValidation";
import { DatabaseNotificationEditor } from "./databaseNotificationEditor";
import PropTypes from "prop-types";

export const DatabaseNotificationAdditionForm = ({
  tenantID,
  databaseSchemaName,
}) => {
  DatabaseNotificationAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
  };
  const queryClient = useQueryClient();

  const { isPending: isAddingDatabaseNotification, mutate: addNotification } =
    useMutation({
      mutationFn: (data) => {
        return createDatabaseNotificationAPI({
          tenantID,
          databaseSchemaName,
          databaseNotificationData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.ADD_NOTIFICATION_FORM_NOTIFICATION_CREATED
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_NOTIFICATIONS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });
  const databaseNotificationAdditionForm = useFormik({
    initialValues: {
      databaseNotificationName: "",
    },
    validationSchema:
      formValidations.databaseNotificationAdditionFormValidationSchema,
    onSubmit: async (data) => {
      addNotification(data);
    },
  });

  return (
    <section className="max-w-3xl w-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl  p-3">
        {CONSTANTS.STRINGS.ADD_NOTIFICATION_FORM_TITLE}
      </h1>

      <form
        className="space-y-3 md:space-y-4 mt-2 p-3"
        onSubmit={databaseNotificationAdditionForm.handleSubmit}
      >
        <DatabaseNotificationEditor
          databaseNotificationEditorForm={databaseNotificationAdditionForm}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
            disabled={isAddingDatabaseNotification}
          >
            {isAddingDatabaseNotification ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              CONSTANTS.STRINGS.ADD_NOTIFICATION_FORM_SUBMIT
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
