import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { addTenantRoleAPI } from "../../../data/apis/tenantRole";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantPermissionSelectionInput } from "./tenantPermissionSelectionInput";
import { formValidations } from "../../../utils/formValidation";

import { Button, Spinner, Input, Label } from "@jet-admin/ui";
export const TenantRoleAdditionForm = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPending: isAddingTenantRole, mutate: addTenantRole } = useMutation({
    mutationFn: ({ roleTitle, roleDescription, permissionIDs }) =>
      addTenantRoleAPI({
        tenantID,
        data: { roleTitle, roleDescription, permissionIDs },
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
      roleTitle: "",
      roleDescription: "",
      permissionIDs: [],
    },
    validationSchema: formValidations.addTenantRoleFormValidationSchema,
    onSubmit: ({ roleTitle, roleDescription, permissionIDs }) => {
      addTenantRole({ roleTitle, roleDescription, permissionIDs });
    },
  });

  const _handleOnRolePermissionsSelectionChange = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;
      addTenantRoleForm.setFieldTouched("permissionIDs", true, false);
      addTenantRoleForm.setFieldValue(
        "permissionIDs",
        typeof value === "string" ? value.split(",") : value
      );
    },
    [addTenantRoleForm]
  );

  return (
    <section className="w-full max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          {CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_TITLE}
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a reusable role and assign the permissions it should grant.
        </p>
      </header>
      {addTenantRoleForm && (
        <form className="space-y-4" onSubmit={addTenantRoleForm.handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="roleTitle">
              {CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_LABEL}
            </Label>
            <Input
              type="text"
              name="roleTitle"
              id="roleTitle"
              placeholder={
                CONSTANTS.STRINGS
                  .TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_PLACEHOLDER
              }
              required={true}
              onChange={addTenantRoleForm.handleChange}
              onBlur={addTenantRoleForm.handleBlur}
              value={addTenantRoleForm.values.roleTitle}
            />
            {addTenantRoleForm.touched.roleTitle &&
              addTenantRoleForm.errors.roleTitle && (
                <p className="text-xs text-red-500">
                  {addTenantRoleForm.errors.roleTitle}
                </p>
              )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roleDescription">
              {
                CONSTANTS.STRINGS
                  .TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_LABEL
              }
            </Label>
            <Input
              type="text"
              name="roleDescription"
              id="roleDescription"
              placeholder={
                CONSTANTS.STRINGS
                  .TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER
              }
              required={true}
              onChange={addTenantRoleForm.handleChange}
              onBlur={addTenantRoleForm.handleBlur}
              value={addTenantRoleForm.values.roleDescription}
            />
            {addTenantRoleForm.touched.roleDescription &&
              addTenantRoleForm.errors.roleDescription && (
                <p className="text-xs text-red-500">
                  {addTenantRoleForm.errors.roleDescription}
                </p>
              )}
          </div>

          <TenantPermissionSelectionInput
            label={
              CONSTANTS.STRINGS
                .TENANT_ROLE_ADDITION_FORM_ROLE_PERMISSIONS_FIELD_LABEL
            }
            helperText="Select the tenant permissions that members with this role should receive."
            value={addTenantRoleForm.values.permissionIDs}
            onChange={_handleOnRolePermissionsSelectionChange}
            error={
              addTenantRoleForm.touched.permissionIDs
                ? addTenantRoleForm.errors.permissionIDs
                : undefined
            }
          />

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAddingTenantRole}>
              {isAddingTenantRole && <Spinner className="mr-2" size={16} />}
              {CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_FORM_SUBMIT_BUTTON}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};
