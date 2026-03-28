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

function Section({ title, description, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {(title || description) && (
        <div className="mb-2">
          {title && (
            <p className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

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
      navigate(-1);
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
    <div className="flex w-full h-full flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Create a reusable role and assign permissions.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <section className="mx-auto max-w-2xl w-full">
          <form
            className="space-y-6"
            onSubmit={addTenantRoleForm.handleSubmit}
            noValidate
          >
            <Section title="Identity" description="General information about the role.">
              <div className="space-y-1.5">
                <Label htmlFor="roleTitle">
                  {CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_LABEL}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  name="roleTitle"
                  id="roleTitle"
                  placeholder={
                    CONSTANTS.STRINGS
                      .TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_PLACEHOLDER
                  }
                  required
                  onChange={addTenantRoleForm.handleChange}
                  onBlur={addTenantRoleForm.handleBlur}
                  value={addTenantRoleForm.values.roleTitle}
                />
                <FieldError message={addTenantRoleForm.touched.roleTitle && addTenantRoleForm.errors.roleTitle} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roleDescription">
                  {
                    CONSTANTS.STRINGS
                      .TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_LABEL
                  }{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  name="roleDescription"
                  id="roleDescription"
                  placeholder={
                    CONSTANTS.STRINGS
                      .TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER
                  }
                  required
                  onChange={addTenantRoleForm.handleChange}
                  onBlur={addTenantRoleForm.handleBlur}
                  value={addTenantRoleForm.values.roleDescription}
                />
                <FieldError message={addTenantRoleForm.touched.roleDescription && addTenantRoleForm.errors.roleDescription} />
              </div>
            </Section>

            <Section title="Permissions" description="Access controls granted by this role.">
              <TenantPermissionSelectionInput
                label={
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_ADDITION_FORM_ROLE_PERMISSIONS_FIELD_LABEL
                }
                value={addTenantRoleForm.values.permissionIDs}
                onChange={_handleOnRolePermissionsSelectionChange}
                error={
                  addTenantRoleForm.touched.permissionIDs
                    ? addTenantRoleForm.errors.permissionIDs
                    : undefined
                }
              />
            </Section>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingTenantRole} size="sm">
                {isAddingTenantRole && <Spinner className="mr-2" size={14} />}
                Create Role
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
