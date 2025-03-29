import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import * as Yup from "yup";
import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";

import { createDatabaseNotificationAPI } from "../../../data/apis/databaseNotification";
import { DatabaseNotificationEditor } from "./databaseNotificationEditor";

const databaseNotificationValidationSchema = Yup.object().shape({
  databaseNotificationName: Yup.string().required("Notification name is required"),
});

export const DatabaseNotificationAdditionForm = ({ tenantID, databaseSchemaName }) => {
  const queryClient = useQueryClient();
  
  const {
    isPending: isAddingDatabaseNotification,
    isSuccess: isAddingDatabaseNotificationSuccess,
    isError: isAddingDatabaseNotificationError,
    error: addNotificationError,
    mutate: addNotification,
  } = useMutation({
    mutationFn: (data) => {
      return createDatabaseNotificationAPI({
        tenantID,
        databaseSchemaName,
        databaseNotificationData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(
        CONSTANTS.STRINGS.ADD_NOTIFICATION_FORM_NOTIFICATION_CREATED
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_NOTIFICATIONS(
          tenantID,
        ),
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
    validationSchema: databaseNotificationValidationSchema,
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
        class="space-y-3 md:space-y-4 mt-2 p-3"
        onSubmit={databaseNotificationAdditionForm.handleSubmit}
      >
        <DatabaseNotificationEditor
          databaseNotificationEditorForm={databaseNotificationAdditionForm}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            class="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
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
