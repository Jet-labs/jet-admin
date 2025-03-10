import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createNewTenantAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

import { useTenantActions } from "../../../logic/contexts/tenantContext";
import { TenantEditor } from "./tenantEditor";
export const TenantAdditionForm = () => {
  const queryClient = useQueryClient();
  const { saveTenantLocally, saveTenantLocallyAndReload } = useTenantActions();


  const {
    isPending: isCreatingNewTenant,
    isSuccess: isCreatingNewTenantSuccess,
    isError: isCreatingNewTenantError,
    error: createNewTenantError,
    mutate: createNewTenant,
  } = useMutation({
    mutationFn: ({ tenantName, tenantLogoURL }) =>
      createNewTenantAPI({ tenantName, tenantLogoURL }),
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
    },
    validate: ({ tenantName, tenantLogoURL }) => {
      const errors = {};
      if (!tenantName || String(tenantName).trim().length == 0) {
        errors.tenantName = "Tenant name is required";
      }
      if (!tenantLogoURL || String(tenantLogoURL).trim().length == 0) {
        errors.tenantLogoURL = "Tenant logo is required";
      }
    },
    onSubmit: ({ tenantName, tenantLogoURL }) => {
      createNewTenant({ tenantName, tenantLogoURL });
    },
  });

  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-hidden">
      <section class="max-w-3xl w-full">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
            {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
          </h1>
          <form
            class="space-y-4 md:space-y-6"
            onSubmit={addTenantForm.handleSubmit}
          >
            <TenantEditor tenantEditorForm={addTenantForm}/>

            <button
              type="submit"
              disabled={isCreatingNewTenant}
              class="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none focus:ring-blue-300 "
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
