import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

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

import { Button, Spinner, Input, Label } from "@jet-admin/ui";
export const TenantRoleUpdationForm = () => {
  const { tenantID, tenantRoleID } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingTenantRoleByID,
    data: tenantRole,
    error: loadTenantRoleByIDError,
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
      updateTenantRoleByIDForm.setFieldTouched("permissionIDs", true, false);
      updateTenantRoleByIDForm.setFieldValue(
        "permissionIDs",
        typeof value === "string" ? value.split(",") : value
      );
    },
    [updateTenantRoleByIDForm]
  );

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenantRoleByID}
      error={loadTenantRoleByIDError}
    >
      <section className="w-full max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            {CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_TITLE}
          </h1>
          {tenantRoleID && (
            <p className="text-xs text-muted-foreground">
              {`Role ID: ${tenantRoleID}`}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Update the role details and the permissions it grants to members.
          </p>
        </header>
        {updateTenantRoleByIDForm && tenantRoleID && (
          <form
            className="space-y-4"
            onSubmit={updateTenantRoleByIDForm.handleSubmit}
          >
            <div className="space-y-1.5">
              <Label htmlFor="roleTitle">
                {CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_LABEL}
              </Label>
              <Input
                type="text"
                name="roleTitle"
                id="roleTitle"
                placeholder={
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_PLACEHOLDER
                }
                required={true}
                onChange={updateTenantRoleByIDForm.handleChange}
                onBlur={updateTenantRoleByIDForm.handleBlur}
                value={updateTenantRoleByIDForm.values.roleTitle}
              />
              {updateTenantRoleByIDForm.touched.roleTitle &&
                updateTenantRoleByIDForm.errors.roleTitle && (
                  <p className="text-xs text-red-500">
                    {updateTenantRoleByIDForm.errors.roleTitle}
                  </p>
                )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roleDescription">
                {
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_LABEL
                }
              </Label>
              <Input
                type="text"
                name="roleDescription"
                id="roleDescription"
                placeholder={
                  CONSTANTS.STRINGS
                    .TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER
                }
                required={true}
                onChange={updateTenantRoleByIDForm.handleChange}
                onBlur={updateTenantRoleByIDForm.handleBlur}
                value={updateTenantRoleByIDForm.values.roleDescription}
              />
              {updateTenantRoleByIDForm.touched.roleDescription &&
                updateTenantRoleByIDForm.errors.roleDescription && (
                  <p className="text-xs text-red-500">
                    {updateTenantRoleByIDForm.errors.roleDescription}
                  </p>
                )}
            </div>

            <TenantPermissionSelectionInput
              label={
                CONSTANTS.STRINGS
                  .TENANT_ROLE_UPDATION_FORM_ROLE_PERMISSIONS_FIELD_LABEL
              }
              helperText="Adjust the tenant permissions that this role should include."
              value={updateTenantRoleByIDForm.values.permissionIDs}
              onChange={_handleOnRolePermissionsSelectionChange}
              error={
                updateTenantRoleByIDForm.touched.permissionIDs
                  ? updateTenantRoleByIDForm.errors.permissionIDs
                  : undefined
              }
            />

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <TenantRoleDeletionForm
                tenantID={tenantID}
                tenantRoleID={tenantRoleID}
              />
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingTenantRoleByID}>
                {isUpdatingTenantRoleByID && (
                  <Spinner className="mr-2" size={16} />
                )}
                {CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_FORM_SUBMIT_BUTTON}
              </Button>
            </div>
          </form>
        )}
      </section>
    </ReactQueryLoadingErrorWrapper>
  );
};
