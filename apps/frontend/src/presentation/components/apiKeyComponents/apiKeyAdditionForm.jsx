import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";

import { createAPIKeyAPI } from "../../../data/apis/apiKey";
import { formValidations } from "../../../utils/formValidation";
import { APIKeyEditor } from "./apiKeyEditor";
import { NoEntityUI } from "../ui/noEntityUI";
import { Link } from "react-router-dom";
import { APIKeyRoleSelectionDialog } from "./apiKeyRoleSelectionDialog";

export const APIKeyAdditionForm = ({
  tenantID,
}) => {
  const queryClient = useQueryClient();

  const {
    isPending: isAddingAPIKey,
    isSuccess: isAddingAPIKeySuccess,
    isError: isAddingAPIKeyError,
    error: addAPIKeyError,
    mutate: addAPIKey,
  } = useMutation({
    mutationFn: (data) => {
      return createAPIKeyAPI({
        tenantID,
        apiKeyData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(CONSTANTS.STRINGS.ADD_API_KEY_FORM_API_KEY_CREATED);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const apiKeyAdditionForm = useFormik({
    initialValues: {
      apiKeyName: "",
      roleIDs: [],
    },
    validationSchema: formValidations.apiKeyAdditionFormValidationSchema,
    onSubmit: async (data) => {
      addAPIKey(data);
    },
  });

  return (
    <section className="max-w-3xl w-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl  p-3">
        {CONSTANTS.STRINGS.ADD_API_KEY_FORM_TITLE}
      </h1>

      <form
        class="space-y-3 md:space-y-4 mt-2 p-3"
        onSubmit={apiKeyAdditionForm.handleSubmit}
      >
        <APIKeyEditor
        tenantID={tenantID}
          apiKeyEditorForm={apiKeyAdditionForm}
          isLoadingAPIKeyEditorForm={isAddingAPIKey}
        />


        <div className="flex justify-end">
          <APIKeyRoleSelectionDialog tenantID={tenantID} apiKeyEditorForm={apiKeyAdditionForm} />
          <button
            type="submit"
            class="flex ml-2 flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
            disabled={isAddingAPIKey}
          >
            {isAddingAPIKey ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              CONSTANTS.STRINGS.ADD_API_KEY_FORM_SUBMIT
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
