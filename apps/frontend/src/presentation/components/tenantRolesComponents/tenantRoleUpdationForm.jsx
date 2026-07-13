import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  getTenantRoleByIDAPI,
  updateTenantRoleByIDAPI,
} from "../../../data/apis/tenantRole";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantRoleDeletionForm } from "./tenantRoleDeletionForm";
import { TenantPermissionSelectionInput } from "./tenantPermissionSelectionInput";
import { TenantAssetPermissionsInput } from "./tenantAssetPermissionsInput";
import { formValidations } from "../../../utils/formValidation";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { Button, Spinner, Input, Label, PageHeader, Section } from "@jet-admin/ui";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

const EMPTY_INITIAL_VALUES = {
  roleTitle: "",
  roleDescription: "",
  permissionIDs: [],
  assetPermissions: [],
};

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

  const parsedPermissions = useMemo(() => {
    const permissionIDs = [];
    const assetPermissions = [];

    tenantRole?.tblRolePermissionMappings?.forEach((mapping) => {
      const perm = mapping.tblPermissions;
      if (!perm) return;

      if (perm.permissionTitle.startsWith("tenant:asset:")) {
        const parts = perm.permissionTitle.split(":");
        if (parts.length === 5) {
          assetPermissions.push({
            resourceType: parts[2],
            resourceID: parts[3],
            action: parts[4],
          });
        }
      } else {
        permissionIDs.push(perm.permissionID);
      }
    });

    return { permissionIDs, assetPermissions };
  }, [tenantRole]);

  const { isPending: isUpdatingTenantRoleByID, mutate: updateTenantRoleByID } =
    useMutation({
      mutationFn: ({ roleTitle, roleDescription, permissionIDs, assetPermissions }) =>
        updateTenantRoleByIDAPI({
          tenantID,
          tenantRoleID,
          data: { roleTitle, roleDescription, permissionIDs, assetPermissions },
        }),
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_SUCCESS_TOAST);
        queryClient.invalidateQueries({
          queryKey:
          [CONSTANTS.REACT_QUERY_KEYS.TENANT_ROLES(tenantID)],
        });
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const formInitialValues = useMemo(() => {
    if (!tenantRole) return EMPTY_INITIAL_VALUES;
    return {
      roleTitle: tenantRole.roleTitle || "",
      roleDescription: tenantRole.roleDescription || "",
      permissionIDs: parsedPermissions.permissionIDs,
      assetPermissions: parsedPermissions.assetPermissions,
    };
  }, [tenantRole, parsedPermissions]);

  const updateTenantRoleByIDForm = useFormik({
    initialValues: formInitialValues,
    enableReinitialize: true,
    validationSchema: formValidations.updateTenantRoleFormValidationSchema,
    onSubmit: ({ roleTitle, roleDescription, permissionIDs, assetPermissions }) => {
      updateTenantRoleByID({ roleTitle, roleDescription, permissionIDs, assetPermissions });
    },
  });

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
    <div className="flex w-full h-full flex-col overflow-hidden bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_TITLE}
        parentTitle={CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_TITLE}
        id={tenantRoleID}
        onSave={updateTenantRoleByIDForm.handleSubmit}
        isSaving={isUpdatingTenantRoleByID}
        saveText="Update"
      >
        <TenantRoleDeletionForm
          tenantID={tenantID}
          tenantRoleID={tenantRoleID}
        />
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </PageHeader>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingTenantRoleByID}
        error={loadTenantRoleByIDError}
      >
        {tenantRole && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <section className="mx-auto max-w-2xl w-full">
                <form
                  id="update-role-form"
                className="space-y-2"
                  onSubmit={updateTenantRoleByIDForm.handleSubmit}
                  noValidate
                >
                  <Section title="Identity" description="General information about the role.">
                    <div className="space-y-1">
                      <Label htmlFor="roleTitle">
                        {CONSTANTS.STRINGS.TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_LABEL}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="roleTitle"
                        id="roleTitle"
                        placeholder={
                          CONSTANTS.STRINGS
                            .TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_PLACEHOLDER
                        }
                        required
                        onChange={updateTenantRoleByIDForm.handleChange}
                        onBlur={updateTenantRoleByIDForm.handleBlur}
                        value={updateTenantRoleByIDForm.values.roleTitle}
                      />
                      <FieldError message={updateTenantRoleByIDForm.touched.roleTitle && updateTenantRoleByIDForm.errors.roleTitle} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="roleDescription">
                        {
                          CONSTANTS.STRINGS
                            .TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_LABEL
                        }{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="roleDescription"
                        id="roleDescription"
                        placeholder={
                          CONSTANTS.STRINGS
                            .TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER
                        }
                        required
                        onChange={updateTenantRoleByIDForm.handleChange}
                        onBlur={updateTenantRoleByIDForm.handleBlur}
                        value={updateTenantRoleByIDForm.values.roleDescription}
                      />
                      <FieldError message={updateTenantRoleByIDForm.touched.roleDescription && updateTenantRoleByIDForm.errors.roleDescription} />
                    </div>
                  </Section>

                <Section title="General Permissions" description="Access controls granted by this role globally.">
                    <TenantPermissionSelectionInput
                      label={
                        CONSTANTS.STRINGS
                          .TENANT_ROLE_UPDATION_FORM_ROLE_PERMISSIONS_FIELD_LABEL
                      }
                      value={updateTenantRoleByIDForm.values.permissionIDs}
                      onChange={_handleOnRolePermissionsSelectionChange}
                      error={
                        updateTenantRoleByIDForm.touched.permissionIDs
                          ? updateTenantRoleByIDForm.errors.permissionIDs
                          : undefined
                      }
                    />
                  </Section>

                <Section title="Asset Permissions" description="Restrict access to specific resources (pages, queries, workflows, etc.).">
                  <TenantAssetPermissionsInput
                    value={updateTenantRoleByIDForm.values.assetPermissions}
                    onChange={(event) => {
                      updateTenantRoleByIDForm.setFieldValue(
                        "assetPermissions",
                        event.target.value
                      );
                    }}
                    error={
                      updateTenantRoleByIDForm.touched.assetPermissions
                        ? updateTenantRoleByIDForm.errors.assetPermissions
                        : undefined
                    }
                  />
                </Section>
                </form>
              </section>
            </div>
        )}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
