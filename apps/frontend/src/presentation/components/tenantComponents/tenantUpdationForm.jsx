import { UserPlus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { MdOutlineLockPerson } from "react-icons/md";
import { Button, Separator, Spinner } from "@jet-admin/ui";

import { CONSTANTS } from "../../../constants";
import {
  getUserTenantByIDAPI,
  updateTenantAPI,
} from "../../../data/apis/tenant";
import { useTenantActions } from "../../../logic/contexts/tenantContext";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantUserAdditionForm } from "../tenantUsersComponents/tenantUserAdditionForm";
import { TenantEditor } from "./tenantEditor";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { TenantDeletionForm } from "./tenantDeletionForm";

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

export const TenantUpdationForm = ({ tenantID }) => {
  TenantUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const { saveTenantLocally } = useTenantActions();
  const [isAddTenantUserDialogOpen, setIsAddTenantUserDialogOpen] =
    useState(false);

  const {
    isLoading: isLoadingTenant,
    isFetching: isFetchingTenant,
    data: tenant,
    error: tenantError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS, tenantID],
    queryFn: () => getUserTenantByIDAPI({ tenantID }),
    retry: 0,
  });

  const { isPending: isUpdatingTenant, mutate: updateTenant } = useMutation({
    mutationFn: ({
      tenantID,
      tenantTitle,
      tenantLogoURL,
      tenantDBURL,
    }) =>
      updateTenantAPI({
        tenantID,
        tenantTitle,
        tenantLogoURL,
        tenantDBURL,
      }),
    retry: false,
    onSuccess: (tenant) => {
      saveTenantLocally(tenant);
      displaySuccess(CONSTANTS.STRINGS.UPDATE_TENANT_SUCCESS_TOAST);
      queryClient.invalidateQueries([CONSTANTS.REACT_QUERY_KEYS.TENANTS]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const updateTenantForm = useFormik({
    initialValues: {
      tenantID: tenant ? tenant.tenantID : "",
      tenantTitle: tenant ? tenant.tenantTitle : "",
      tenantLogoURL: tenant ? tenant.tenantLogoURL : "",
      tenantDBURL: tenant ? tenant.tenantDBURL : "",
    },
    validationSchema: formValidations.updateTenantFormValidationSchema,
    onSubmit: ({
      tenantID,
      tenantTitle,
      tenantLogoURL,
      tenantDBURL,
    }) => {
      updateTenant({
        tenantID,
        tenantTitle,
        tenantLogoURL,
        tenantDBURL,
      });
    },
  });

  useEffect(() => {
    if (tenant) {
      updateTenantForm.setFieldValue("tenantID", tenant.tenantID);
      updateTenantForm.setFieldValue("tenantTitle", tenant.tenantTitle);
      updateTenantForm.setFieldValue("tenantLogoURL", tenant.tenantLogoURL);
      updateTenantForm.setFieldValue("tenantDBURL", tenant.tenantDBURL);
    }
  }, [tenant]);

  const _handleOpenAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(true);
  };
  const _handleCloseAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(false);
  };

  return (
    <div className="flex w-full h-full flex-col overflow-hidden bg-background">
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingTenant}
        isFetching={isFetchingTenant}
        error={tenantError}
      >
        {tenant && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 shrink-0">
              <div>
                <h1 className="text-base font-semibold tracking-tight text-foreground">
                  {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_TITLE}
                </h1>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  ID: {tenant.tenantID}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.path(tenantID)}>
                    <MdOutlineLockPerson className="h-4 w-4" />
                    {CONSTANTS.STRINGS.MAIN_DRAWER_AUDIT_LOGS_TITLE}
                  </Link>
                </Button>
                <TenantDeletionForm tenantID={tenantID} />
                <Button
                  type="submit"
                  size="sm"
                  form="update-tenant-form"
                  disabled={isUpdatingTenant}
                >
                  {isUpdatingTenant && <Spinner size={14} className="mr-2" />}
                  {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_SUBMIT_BUTTON}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <section className="mx-auto max-w-2xl w-full">
                <TenantUserAdditionForm
                  tenantID={tenant.tenantID}
                  onClose={_handleCloseAddTenantUserDialog}
                  open={isAddTenantUserDialogOpen}
                />

                <form
                  id="update-tenant-form"
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTenantForm.handleSubmit();
                  }}
                  noValidate
                >
                  <Section title="Metadata">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold">
                        Created by {tenant.creator?.email || "Deleted User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {`Tenant created: ${format(parseISO(tenant.createdAt), "MMM do, yyyy")}`}
                      </span>
                    </div>
                  </Section>

                  <TenantEditor tenantEditorForm={updateTenantForm} />

                  <Section
                    title={CONSTANTS.STRINGS.UPDATE_TENANT_MEMBERS_TITLE}
                    description="Users who have access to this tenant."
                  >
                    <div className="space-y-3 pt-1">
                      {tenant.relationships?.map((relationship, index) => (
                        <div key={relationship.id || index}>
                          <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row justify-start items-center">
                              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium shrink-0">
                                {relationship.tblUsers.email?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div className="flex flex-col justify-start items-start ml-3">
                                <span className="text-sm font-medium">
                                  {relationship.tblUsers.email}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {relationship.role === CONSTANTS.ROLES.PRIMARY.ADMIN.value ? "Admin" : "Member"}
                                  {" · "}
                                  Joined {format(parseISO(relationship.createdAt), "MMM do, yyyy")}
                                </span>
                              </div>
                            </div>
                          </div>
                          {index < tenant.relationships.length - 1 && (
                            <Separator className="my-3" />
                          )}
                        </div>
                      ))}

                      <div className="pt-2">
                        <Button
                          type="button"
                          onClick={_handleOpenAddTenantUserDialog}
                          variant="primary-ghost"
                          size="sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          {CONSTANTS.STRINGS.UPDATE_TENANT_ADD_MEMBERS_BUTTON}
                        </Button>
                      </div>
                    </div>
                  </Section>
                </form>
              </section>
            </div>
          </>
        )}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
