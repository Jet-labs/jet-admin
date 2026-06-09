import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createNewTenantAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

import { useTenantActions } from "../../../logic/hooks/useTenant";
import { TenantEditor } from "./tenantEditor";
import { formValidations } from "../../../utils/formValidation";
import React from "react";
import { Button, Spinner } from "@jet-admin/ui";
export const TenantAdditionForm = () => {
  const queryClient = useQueryClient();
  const { saveTenantLocallyAndReload } = useTenantActions();

  const { isPending: isCreatingNewTenant, mutate: createNewTenant } =
    useMutation({
      mutationFn: ({ tenantTitle, tenantLogoURL }) =>
        createNewTenantAPI({ tenantTitle, tenantLogoURL }),
      retry: false,
      onSuccess: (tenant) => {
        saveTenantLocallyAndReload(tenant);
        displaySuccess(CONSTANTS.STRINGS.ADD_TENANT_SUCCESS_TOAST);
        queryClient.invalidateQueries({ queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS] });
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const addTenantForm = useFormik({
    initialValues: {
      tenantTitle: "",
      tenantLogoURL: "",
    },
    validationSchema: formValidations.addTenantFormValidationSchema,
    onSubmit: ({ tenantTitle, tenantLogoURL }) => {
      createNewTenant({
        tenantTitle,
        tenantLogoURL,
      });
    },
  });

  return (
    <div className="flex w-full h-full flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Create a new tenant with a dedicated database and brand identity.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <section className="mx-auto max-w-2xl w-full">
          <form
            className="space-y-4"
            onSubmit={addTenantForm.handleSubmit}
            noValidate
          >
            <TenantEditor tenantEditorForm={addTenantForm} />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isCreatingNewTenant}
              >
                {isCreatingNewTenant && (
                  <Spinner className="mr-2" size={14} />
                )}
                {CONSTANTS.STRINGS.ADD_TENANT_FORM_SUBMIT_BUTTON}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
