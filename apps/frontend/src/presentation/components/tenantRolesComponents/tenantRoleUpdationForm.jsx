import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect } from "react";
import {
  getTenantRoleByIDAPI,
  updateTenantRoleByIDAPI,
} from "../../../data/apis/tenantRole";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantRoleDeletionForm } from "./tenantRoleDeletionForm";
import { TenantPermissionSelectionInput } from "./tenantPermissionSelectionInput";
import { formValidations } from "../../../utils/formValidation";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const TenantRoleUpdationForm = () => {
  const { tenantID, tenantRoleID } = useParams();
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingTenantRoleByID,
    data: tenantRole,
    error: loadTenantRoleByIDError,
    isFetching: isFetchingTenantRoleByID,
    isRefetching: isRefetechingTenantRoleByID,
    refetch: refetchTenantRoleByID,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_ROLES(tenantID), tenantRoleID],
    queryFn: () =>
      getTenantRoleByIDAPI({
        tenantID,
        tenantRoleID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingTenantRoleByID, mutate: updateTenantRoleByID } =
    useMutation({
      mutationFn: ({ roleTitle, roleDescription, permissionIDs }) =>
        updateTenantRoleByIDAPI({
          tenantID,
          tenantRoleID,
          data: { roleTitle, roleDescription, permissionIDs },
        }),
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_SUCCESS_TOAST);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.TENANT_ROLES(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const updateTenantRoleByIDForm = useFormik({
    initialValues: {
      roleTitle: "",
      roleDescription: "",
      permissionIDs: [],
    },
    validationSchema: formValidations.updateTenantRoleFormValidationSchema,
    onSubmit: ({ roleTitle, roleDescription, permissionIDs }) => {
      updateTenantRoleByID({ roleTitle, roleDescription, permissionIDs });
    },
  });

  useEffect(() => {
    if (tenantRole && updateTenantRoleByIDForm) {
      updateTenantRoleByIDForm.setValues({
        roleTitle: tenantRole.roleTitle,
        roleDescription: tenantRole.roleDescription,
        permissionIDs:
          tenantRole.tblRolePermissionMappings?.map(
            (mapping) => mapping.permissionID
          ) || [],
      });
    }
  }, [tenantRole]);

  const _handleOnRolePermissionsSelectionChange = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;
      console.log({ value });
      updateTenantRoleByIDForm.setFieldValue(
        "permissionIDs",
        typeof value === "string" ? value.split(",") : value
      );
    },
    [updateTenantRoleByIDForm]
  );

  return (
    <section className="max-w-3xl w-full h-full">
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingTenantRoleByID}
        isFetching={isFetchingTenantRoleByID}
        isRefetching={isRefetechingTenantRoleByID}
        refetch={refetchTenantRoleByID}
        error={loadTenantRoleByIDError}
      >
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
            {CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_TITLE}
          </h1>
          {updateTenantRoleByIDForm && tenantRoleID && (
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={updateTenantRoleByIDForm.handleSubmit}
            >
              <div>
                <label
                  htmlFor="roleTitle"
                  className="block mb-1 text-sm font-medium text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_LABEL
                  }
                </label>
                <input
                  type="roleTitle"
                  name="roleTitle"
                  id="roleTitle"
                  className=" placeholder:text-slate-400 bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                  placeholder={
                    CONSTANTS.STRINGS
                      .TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_PLACEHOLDER
                  }
                  required={true}
                  onChange={updateTenantRoleByIDForm.handleChange}
                  onBlur={updateTenantRoleByIDForm.handleBlur}
                  value={updateTenantRoleByIDForm.values.roleTitle}
                />
              </div>

              <div>
                <label
                  htmlFor="roleDescription"
                  className="block mb-1 text-sm font-medium text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_LABEL
                  }
                </label>
                <input
                  type="roleDescription"
                  name="roleDescription"
                  id="roleDescription"
                  className=" placeholder:text-slate-400 bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                  placeholder={
                    CONSTANTS.STRINGS
                      .TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER
                  }
                  required={true}
                  onChange={updateTenantRoleByIDForm.handleChange}
                  onBlur={updateTenantRoleByIDForm.handleBlur}
                  value={updateTenantRoleByIDForm.values.roleDescription}
                />
              </div>

              <TenantPermissionSelectionInput
                value={updateTenantRoleByIDForm.values.permissionIDs}
                onChange={_handleOnRolePermissionsSelectionChange}
              />

              <div className="flex flex-row justify-end items-center w-full">
                <TenantRoleDeletionForm
                  tenantID={tenantID}
                  tenantRoleID={tenantRoleID}
                />
                <button
                  type="submit"
                  disabled={isUpdatingTenantRoleByID}
                  className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none focus:ring-blue-300 "
                >
                  {isUpdatingTenantRoleByID && (
                    <CircularProgress
                      className="!mr-3"
                      size={16}
                      color="white"
                    />
                  )}
                  {CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_FORM_SUBMIT_BUTTON}
                </button>
              </div>
            </form>
          )}
        </div>
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};
