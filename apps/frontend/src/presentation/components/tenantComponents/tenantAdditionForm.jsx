import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createNewTenantAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

import { useTenantActions } from "../../../logic/contexts/tenantContext";
import { TenantEditor } from "./tenantEditor";
import { formValidations } from "../../../utils/formValidation";
import React from "react";
export const TenantAdditionForm = () => {
  const queryClient = useQueryClient();
  const { saveTenantLocallyAndReload } = useTenantActions();

  const { isPending: isCreatingNewTenant, mutate: createNewTenant } =
    useMutation({
      mutationFn: ({ tenantName, tenantLogoURL, tenantDBURL }) =>
        createNewTenantAPI({ tenantName, tenantLogoURL, tenantDBURL }),
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
      tenantName: "",
      tenantLogoURL: "",
      tenantDBURL: "",
      tenantDBType: CONSTANTS.SUPPORTED_DATABASES.postgresql.name,
    },
    validationSchema: formValidations.addTenantFormValidationSchema,
    onSubmit: ({ tenantName, tenantLogoURL, tenantDBType, tenantDBURL }) => {
      createNewTenant({ tenantName, tenantLogoURL, tenantDBType, tenantDBURL });
    },
  });

  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-hidden">
      <section className="max-w-3xl w-full">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
            {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={addTenantForm.handleSubmit}
          >
            <TenantEditor tenantEditorForm={addTenantForm} />

            <button
              type="submit"
              disabled={isCreatingNewTenant}
              className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none focus:ring-blue-300 "
            >
              {isCreatingNewTenant && (
                <CircularProgress
                  className="!text-sm !mr-3"
                  size={20}
                  color="white"
                />
              )}
              {CONSTANTS.STRINGS.ADD_TENANT_FORM_SUBMIT_BUTTON}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
