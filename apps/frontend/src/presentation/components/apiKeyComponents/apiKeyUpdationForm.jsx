import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";
import {
  getAPIKeyByIDAPI,
  updateAPIKeyByIDAPI,
} from "../../../data/apis/apiKey";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import { APIKeyDeletionForm } from "./apiKeyDeletionForm";
import { APIKeyCloneForm } from "./apiKeyCloneForm";

import { APIKeyEditor } from "./apiKeyEditor";
import { formValidations } from "../../../utils/formValidation";
import { APIKeyRoleSelectionDialog } from "./apiKeyRoleSelectionDialog";
import { CodeBlock } from "../ui/codeblock";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

import { PageHeader } from "@jet-admin/ui";

const initialValues = {
  apiKeyTitle: "",
  roleIDs: [],
};

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
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID)],
      });
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const apiKeyUpdationForm = useFormik({
    initialValues: apiKey ? {
      apiKeyTitle: apiKey.apiKeyTitle || CONSTANTS.STRINGS.UNTITLED,
      roleIDs: apiKey.roles?.map((r) => r.roleID) || [],
    } : initialValues,
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.apiKeyUpdationFormValidationSchema,
    onSubmit: async (values) => {
      const confirmed = await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-primary",
      });
      if (!confirmed) return;
      updateAPIKey(values);
    },
  });



  return (
    <section className="w-full bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_API_KEYS_TITLE}
        id={apiKeyID}
        onSave={apiKeyUpdationForm.handleSubmit}
        isSaving={isUpdatingAPIKey}
      >
        <APIKeyDeletionForm tenantID={tenantID} apiKeyID={apiKeyID} />
        <APIKeyCloneForm tenantID={tenantID} apiKeyID={apiKeyID} />
        <APIKeyRoleSelectionDialog
          tenantID={tenantID}
          apiKeyEditorForm={apiKeyUpdationForm}
          isLoadingAPIKeyEditorForm={isUpdatingAPIKey || isLoadingAPIKey}
        />
      </PageHeader>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingAPIKey}
        error={loadAPIKeyError}
      >
        <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">

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
