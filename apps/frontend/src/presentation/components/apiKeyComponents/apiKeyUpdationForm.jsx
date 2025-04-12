import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";
import {
  getAPIKeyByIDAPI,
  updateAPIKeyByIDAPI,
} from "../../../data/apis/apiKey";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { APIKeyDeletionForm } from "./apiKeyDeletionForm";

import { APIKeyEditor } from "./apiKeyEditor";
import { formValidations } from "../../../utils/formValidation";
import { APIKeyRoleSelectionDialog } from "./apiKeyRoleSelectionDialog";
import { CodeBlock } from "../ui/codeBlock";

export const APIKeyUpdationForm = ({
  tenantID,
  apiKeyID,
}) => {
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingAPIKey,
    data: apiKey,
    error: loadAPIKeyError,
    isFetching: isFetchingAPIKey,
    isRefetching: isRefetechingAPIKey,
    refetch: refetchAPIKey,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
      apiKeyID,
    ],
    queryFn: () =>
      getAPIKeyByIDAPI({
        tenantID,
        apiKeyID,
      }),
    refetchOnWindowFocus: false,
  });

  const {
    isPending: isUpdatingAPIKey,
    isSuccess: isUpdatingAPIKeySuccess,
    isError: isUpdatingAPIKeyError,
    error: updateAPIKeyError,
    mutate: updateAPIKey,
  } = useMutation({
    mutationFn: (data) => {
      return updateAPIKeyByIDAPI({
        tenantID,
        apiKeyID,
        apiKeyData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(
        CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_API_KEY_UPDATION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const apiKeyUpdationForm = useFormik({
    initialValues: {
      apiKeyName: "",
      roleIDs:[]
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema:
      formValidations.apiKeyUpdationFormValidationSchema,
    onSubmit: async (values) => {
      await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_UPDATE_DIALOG_TITLE,
        message:
          CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-[#646cff]",
      });
      updateAPIKey(values);
    },
  });

  // Use useEffect to update Formik values when apiKey is fetched
  useEffect(() => {
    if (apiKey) {
      // Update Formik form values with the fetched apiKey data
      apiKeyUpdationForm.setFieldValue(
        "apiKeyName",
        apiKey.apiKeyName ||
          CONSTANTS.STRINGS.UNTITLED
      );
      console.log(apiKey.roles)
      apiKeyUpdationForm.setFieldValue(
        "roleIDs",
        apiKey.roles?.map((r) => parseInt(r.roleID)) || []
      );
    }
  }, [apiKey]);

  console.log({apiKeyUpdationForm:apiKeyUpdationForm.values})

  return (
    <section className="max-w-3xl w-full">
      <div className="w-full px-3 py-2  flex flex-col justify-center items-start">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700 text-start ">
          {CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_TITLE}
        </h1>

        {apiKey && (
          <span className="text-xs text-[#646cff] mt-2">{`API Key ID: ${apiKey.apiKeyID}`}</span>
        )}
      </div>

      {isLoadingAPIKey || isFetchingAPIKey ? (
        <div className="!w-full !h-full flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <form
          class="space-y-3 md:space-y-4 mt-5 p-3"
          onSubmit={apiKeyUpdationForm.handleSubmit}
        >
          {apiKey && (
            <CodeBlock
              code={`${apiKey.apiKey}`}
              className="w-full"
            />
          )}
          <APIKeyEditor
            tenantID={tenantID}
            apiKeyEditorForm={apiKeyUpdationForm}
            isLoadingAPIKeyEditorForm={
              isUpdatingAPIKey || isFetchingAPIKey || isLoadingAPIKey
            }
          />
          <div className="w-full flex flex-row justify-end mt-10">
            <APIKeyDeletionForm tenantID={tenantID} apiKeyID={apiKeyID} />
            <APIKeyRoleSelectionDialog tenantID={tenantID} apiKeyEditorForm={apiKeyUpdationForm} />

            <button
              type="submit"
              disabled={isUpdatingAPIKey}
              class="flex flex-row justify-center items-center px-3 py-2 ml-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
            >
              {isUpdatingAPIKey && (
                <CircularProgress
                  className="!text-xs !mr-3"
                  size={16}
                  color="white"
                />
              )}
              {CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_SUBMIT_BUTTON}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
