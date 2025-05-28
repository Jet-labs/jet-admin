import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseNotificationByIDAPI,
  updateDatabaseNotificationByIDAPI,
} from "../../../data/apis/databaseNotification";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DatabaseNotificationDeletionForm } from "./databaseNotificationDeletionForm";

import { DatabaseNotificationEditor } from "./databaseNotificationEditor";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const DatabaseNotificationUpdationForm = ({
  tenantID,
  databaseNotificationID,
}) => {
  DatabaseNotificationUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseNotificationID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingDatabaseNotification,
    data: databaseNotification,
    error: loadDatabaseNotificationError,
    isFetching: isFetchingDatabaseNotification,
    isRefetching: isRefetechingDatabaseNotification,
    refetch: refetchDatabaseNotification,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
      databaseNotificationID,
    ],
    queryFn: () =>
      getDatabaseNotificationByIDAPI({
        tenantID,
        databaseNotificationID,
      }),
    refetchOnWindowFocus: false,
  });

  const {
    isPending: isUpdatingDatabaseNotification,
    mutate: updateDatabaseNotification,
  } = useMutation({
    mutationFn: (data) => {
      return updateDatabaseNotificationByIDAPI({
        tenantID,
        databaseNotificationID,
        databaseNotificationData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.UPDATE_NOTIFICATION_FORM_NOTIFICATION_UPDATION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const databaseNotificationUpdationForm = useFormik({
    initialValues: {
      databaseNotificationName: "",
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema:
      formValidations.databaseNotificationUpdationFormValidationSchema,
    onSubmit: async (values) => {
      await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_NOTIFICATION_FORM_UPDATE_DIALOG_TITLE,
        message:
          CONSTANTS.STRINGS.UPDATE_NOTIFICATION_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-[#646cff]",
      });
      updateDatabaseNotification(values);
    },
  });

  // Use useEffect to update Formik values when databaseNotification is fetched
  useEffect(() => {
    if (databaseNotification) {
      // Update Formik form values with the fetched databaseNotification data
      databaseNotificationUpdationForm.setFieldValue(
        "databaseNotificationName",
        databaseNotification.databaseNotificationName ||
          CONSTANTS.STRINGS.UNTITLED
      );
    }
  }, [databaseNotification]);

  return (
    <section className="max-w-3xl w-full">
      <div className="w-full px-3 py-2  flex flex-col justify-center items-start">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700 text-start ">
          {CONSTANTS.STRINGS.UPDATE_NOTIFICATION_FORM_TITLE}
        </h1>

        {databaseNotification && (
          <span className="text-xs text-[#646cff] mt-2">{`Notification ID: ${databaseNotification.databaseNotificationID}`}</span>
        )}
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseNotification}
        isFetching={isFetchingDatabaseNotification}
        isRefetching={isRefetechingDatabaseNotification}
        refetch={refetchDatabaseNotification}
        error={loadDatabaseNotificationError}
      >
        <form
          className="space-y-3 md:space-y-4 mt-5 p-3"
          onSubmit={databaseNotificationUpdationForm.handleSubmit}
        >
          <DatabaseNotificationEditor
            databaseNotificationEditorForm={databaseNotificationUpdationForm}
          />
          <div className="w-full flex flex-row justify-end">
            <DatabaseNotificationDeletionForm
              tenantID={tenantID}
              databaseNotificationID={databaseNotificationID}
            />

            <button
              type="submit"
              disabled={isUpdatingDatabaseNotification}
              className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
            >
              {isUpdatingDatabaseNotification && (
                <CircularProgress className="!mr-3" size={16} color="white" />
              )}
              {CONSTANTS.STRINGS.UPDATE_NOTIFICATION_FORM_SUBMIT_BUTTON}
            </button>
          </div>
        </form>
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};
