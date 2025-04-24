import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import {
  CircularProgress
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { addTenantRoleAPI } from "../../../data/apis/tenantRole";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantPermissionSelectionInput } from "./tenantPermissionSelectionInput";
import { formValidations } from "../../../utils/formValidation";

export const TenantRoleAdditionForm = () => {
  const { tenantID } = useParams();
  const queryClient = useQueryClient();
  const { isPending: isAddingTenantRole, mutate: addTenantRole } = useMutation({
    mutationFn: ({ roleName, roleDescription, permissionIDs }) =>
      addTenantRoleAPI({
        tenantID,
        data: { roleName, roleDescription, permissionIDs },
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_SUCCESS_TOAST);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.TENANT_ROLES(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const addTenantRoleForm = useFormik({
    initialValues: {
      roleName: "",
      roleDescription: "",
      permissionIDs: [],
    },
    validationSchema: formValidations.addTenantRoleFormValidationSchema,
    onSubmit: ({ roleName, roleDescription, permissionIDs }) => {
      addTenantRole({ roleName, roleDescription, permissionIDs });
    },
  });

  const _handleOnRolePermissionsSelectionChange = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;
      console.log({ value });
      addTenantRoleForm.setFieldValue(
        "permissionIDs",
        typeof value === "string" ? value.split(",") : value
      );
    },
    [addTenantRoleForm]
  );

  return (
    <section className="max-w-3xl w-full h-full">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
          {CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_TITLE}
        </h1>
        {addTenantRoleForm && (
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={addTenantRoleForm.handleSubmit}
          >
            <div>
              <label
                htmlFor="roleName"
                className="block mb-1 text-sm font-medium text-slate-500"
              >
                {
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_LABEL
                }
              </label>
              <input
                type="roleName"
                name="roleName"
                id="roleName"
                className=" placeholder:text-slate-400 bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                placeholder={
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_PLACEHOLDER
                }
                required={true}
                onChange={addTenantRoleForm.handleChange}
                onBlur={addTenantRoleForm.handleBlur}
                value={addTenantRoleForm.values.roleName}
              />
            </div>

            <div>
              <label
                htmlFor="roleDescription"
                className="block mb-1 text-sm font-medium text-slate-500"
              >
                {
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_LABEL
                }
              </label>
              <input
                type="roleDescription"
                name="roleDescription"
                id="roleDescription"
                className=" placeholder:text-slate-400 bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                placeholder={
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER
                }
                required={true}
                onChange={addTenantRoleForm.handleChange}
                onBlur={addTenantRoleForm.handleBlur}
                value={addTenantRoleForm.values.roleDescription}
              />
            </div>

            <TenantPermissionSelectionInput
              value={addTenantRoleForm.values.permissionIDs}
              onChange={_handleOnRolePermissionsSelectionChange}
            />

            <div className="flex flex-row justify-end items-center w-full">
              <button
                type="submit"
                disabled={isAddingTenantRole}
                className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none focus:ring-blue-300 "
              >
                {isAddingTenantRole && (
                  <CircularProgress
                    className="!text-sm !mr-3"
                    size={20}
                    color="white"
                  />
                )}
                {CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_FORM_SUBMIT_BUTTON}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
