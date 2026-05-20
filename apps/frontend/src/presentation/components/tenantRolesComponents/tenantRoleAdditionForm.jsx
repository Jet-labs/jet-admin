import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { addTenantRoleAPI } from "../../../data/apis/tenantRole";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantPermissionSelectionInput } from "./tenantPermissionSelectionInput";
import { formValidations } from "../../../utils/formValidation";

import { Button, Spinner, Input, Label, PageHeader, Section } from "@jet-admin/ui";



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
      <PageHeader
        title={CONSTANTS.STRINGS.TENANT_ROLE_ADDITION_TITLE}
        parentTitle={CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_TITLE}

        onSave={addTenantRoleForm.handleSubmit}
        isSaving={isAddingTenantRole}
        saveText="Save"
      >

      </PageHeader>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <section className="mx-auto max-w-2xl w-full">
          <form
            className="space-y-4"
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


          </form>
        </section>
      </div>
    </div>
  );
};
