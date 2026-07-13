import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createNewTenantAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

import { useTenantActions } from "../../../logic/hooks/useTenant";
import { TenantEditor } from "./tenantEditor";
import { formValidations } from "../../../utils/formValidation";
import React from "react";
import { PageHeader } from "@jet-admin/ui";
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
      <PageHeader
        title={CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
        parentTitle="Tenants"
        onSave={addTenantForm.handleSubmit}
        isSaving={isCreatingNewTenant}
        saveText="Save"
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <section className="mx-auto max-w-2xl w-full">
          <form
            className="space-y-4"
            onSubmit={addTenantForm.handleSubmit}
            noValidate
          >
            <TenantEditor tenantEditorForm={addTenantForm} />


          </form>
        </section>
      </div>
    </div>
  );
};
