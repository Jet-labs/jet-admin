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
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

import { Button, Spinner } from "@jet-admin/ui";
export const APIKeyUpdationForm = ({ tenantID, apiKeyID }) => {
  APIKeyUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    apiKeyID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingAPIKey,
    data: apiKey,
    error: loadAPIKeyError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID), apiKeyID],
    queryFn: () =>
      getAPIKeyByIDAPI({
        tenantID,
        apiKeyID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingAPIKey, mutate: updateAPIKey } = useMutation({
    mutationFn: (data) => {
      return updateAPIKeyByIDAPI({
        tenantID,
        apiKeyID,
        apiKeyData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_API_KEY_UPDATION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const apiKeyUpdationForm = useFormik({
    initialValues: {
      apiKeyTitle: "",
      roleIDs: [],
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.apiKeyUpdationFormValidationSchema,
    onSubmit: async (values) => {
      await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-primary",
      });
      updateAPIKey(values);
    },
  });

  // Use useEffect to update Formik values when apiKey is fetched
  useEffect(() => {
    if (apiKey) {
      // Update Formik form values with the fetched apiKey data
      apiKeyUpdationForm.setFieldValue(
        "apiKeyTitle",
        apiKey.apiKeyTitle || CONSTANTS.STRINGS.UNTITLED
      );
      apiKeyUpdationForm.setFieldValue(
        "roleIDs",
        apiKey.roles?.map((r) => r.roleID) || []
      );
    }
  }, [apiKey]);

  return (
    <section className="w-full bg-background">
      <div className="border-b border-border bg-background p-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_TITLE}
        </h1>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingAPIKey}
        error={loadAPIKeyError}
      >
        <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              {apiKey && (
                <span className="text-xs text-muted-foreground">{`API Key ID: ${apiKey.apiKeyID}`}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <APIKeyDeletionForm tenantID={tenantID} apiKeyID={apiKeyID} />
              <APIKeyRoleSelectionDialog
                tenantID={tenantID}
                apiKeyEditorForm={apiKeyUpdationForm}
                isLoadingAPIKeyEditorForm={isUpdatingAPIKey || isLoadingAPIKey}
              />
              <Button
                type="submit"
                form="api-key-updation-form"
                disabled={isUpdatingAPIKey}
              >
                {isUpdatingAPIKey && <Spinner className="mr-2" size={16} />}
                {CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_SUBMIT_BUTTON}
              </Button>
            </div>
          </div>

          <form
            id="api-key-updation-form"
            className="space-y-4"
            onSubmit={apiKeyUpdationForm.handleSubmit}
          >
            {apiKey && <CodeBlock code={`${apiKey.apiKey}`} className="w-full" />}
            <APIKeyEditor
              tenantID={tenantID}
              apiKeyEditorForm={apiKeyUpdationForm}
              isLoadingAPIKeyEditorForm={
                isUpdatingAPIKey || isLoadingAPIKey
              }
            />
          </form>
        </div>
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};
