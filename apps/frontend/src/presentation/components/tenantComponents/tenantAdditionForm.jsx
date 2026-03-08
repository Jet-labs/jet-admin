import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createNewTenantAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

import { useTenantActions } from "../../../logic/contexts/tenantContext";
import { TenantEditor } from "./tenantEditor";
import { formValidations } from "../../../utils/formValidation";
import React from "react";
import { Button, Spinner } from "@jet-admin/ui";
export const TenantAdditionForm = () => {
  const queryClient = useQueryClient();
  const { saveTenantLocallyAndReload } = useTenantActions();

  const { isPending: isCreatingNewTenant, mutate: createNewTenant } =
    useMutation({
      mutationFn: ({ tenantTitle, tenantLogoURL, tenantDBURL }) =>
        createNewTenantAPI({ tenantTitle, tenantLogoURL, tenantDBURL }),
      retry: false,
      onSuccess: (tenant) => {
        saveTenantLocallyAndReload(tenant);
        displaySuccess(CONSTANTS.STRINGS.ADD_TENANT_SUCCESS_TOAST);
        queryClient.invalidateQueries([CONSTANTS.REACT_QUERY_KEYS.TENANTS]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const addTenantForm = useFormik({
    initialValues: {
      tenantTitle: "",
      tenantLogoURL: "",
      tenantDBURL: "",
    },
    validationSchema: formValidations.addTenantFormValidationSchema,
    onSubmit: ({ tenantTitle, tenantLogoURL, tenantDBURL }) => {
      createNewTenant({
        tenantTitle,
        tenantLogoURL,
        tenantDBURL,
      });
    },
  });

  return (
    <div className="flex w-full h-full flex-col items-center overflow-y-auto p-4 md:p-6 bg-background text-foreground">
      <section className="max-w-2xl w-full">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
          </h1>
          <form
            className="space-y-4"
            onSubmit={addTenantForm.handleSubmit}
          >
            <TenantEditor tenantEditorForm={addTenantForm} />

            <Button
              type="submit"
              disabled={isCreatingNewTenant}
            >
              {isCreatingNewTenant && (
                <Spinner className="mr-2" size={16} />
              )}
              {CONSTANTS.STRINGS.ADD_TENANT_FORM_SUBMIT_BUTTON}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};
