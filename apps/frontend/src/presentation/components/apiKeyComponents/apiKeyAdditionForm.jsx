import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";

import { createAPIKeyAPI } from "../../../data/apis/apiKey";
import { formValidations } from "../../../utils/formValidation";
import { APIKeyEditor } from "./apiKeyEditor";
import { APIKeyRoleSelectionDialog } from "./apiKeyRoleSelectionDialog";
import PropTypes from "prop-types";

import { Button, Spinner, PageHeader } from "@jet-admin/ui";
export const APIKeyAdditionForm = ({ tenantID }) => {
  APIKeyAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();

  const { isPending: isAddingAPIKey, mutate: addAPIKey } = useMutation({
    mutationFn: (data) => {
      return createAPIKeyAPI({
        tenantID,
        apiKeyData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.ADD_API_KEY_FORM_API_KEY_CREATED);
      queryClient.invalidateQueries({
        queryKey
          : [CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID)],
      });
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const apiKeyAdditionForm = useFormik({
    initialValues: {
      apiKeyTitle: "",
      roleIDs: [],
    },
    validationSchema: formValidations.apiKeyAdditionFormValidationSchema,
    onSubmit: async (data) => {
      addAPIKey(data);
    },
  });

  return (
    <section className="w-full bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.ADD_API_KEY_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_API_KEYS_TITLE}
        onSave={apiKeyAdditionForm.handleSubmit}
        isSaving={isAddingAPIKey}
        saveText="Save"
      />

      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        <form
          className="space-y-4"
          onSubmit={apiKeyAdditionForm.handleSubmit}
        >
          <APIKeyEditor
            tenantID={tenantID}
            apiKeyEditorForm={apiKeyAdditionForm}
            isLoadingAPIKeyEditorForm={isAddingAPIKey}
          />

          <div className="flex flex-wrap justify-end gap-2">
            <APIKeyRoleSelectionDialog
              tenantID={tenantID}
              apiKeyEditorForm={apiKeyAdditionForm}
              isLoadingAPIKeyEditorForm={isAddingAPIKey}
            />

          </div>
        </form>
      </div>
    </section>
  );
};
