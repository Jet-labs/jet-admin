import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Settings, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Spinner } from "@jet-admin/ui";
import React from "react";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import {
  getTenantUserByIDAPI,
  removeTenantUserFromTenantByIDAPI,
  updateTenantUserRolesByIDAPI,
} from "../../../data/apis/userManagement";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { NoEntityUI } from "../ui/noEntityUI";
import { TenantRoleSelectionDialog } from "../tenantRolesComponents/tenantRoleSelectionDialog";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

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

export const TenantUserUpdationForm = ({ tenantID, tenantUserID }) => {
  TenantUserUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    tenantUserID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const [isTenantRoleSelectDialogOpen, setIsTenantRoleSelectDialogOpen] =
    useState(false);
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingTenantUser,
    data: tenantUser,
    error: tenantUserError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_USERS(tenantID), tenantUserID],
    queryFn: () => {
      return getTenantUserByIDAPI({ tenantID, tenantUserID });
    },
  });

  const {
    isPending: isUpdatingTenantUserRoles,
    mutate: updateTenantUserRoles,
  } = useMutation({
    mutationFn: ({ roleIDs, userTenantRelationship }) => {
      return updateTenantUserRolesByIDAPI({
        tenantID,
        tenantUserID,
        roleIDs,
        userTenantRelationship,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS
          .UPDATE_TENANT_USER_BY_ID_USER_ROLES_UPDATED_SUCCESSFULLY
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.TENANT_USERS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const {
    isPending: isRemovingTenantUserFromTenant,
    mutate: removeTenantUserFromTenant,
  } = useMutation({
    mutationFn: () => {
      return removeTenantUserFromTenantByIDAPI({
        tenantID,
        tenantUserID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS
          .UPDATE_TENANT_USER_BY_ID_REMOVE_USER_FROM_TENANT_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.TENANT_USERS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOpenTenantRoleSelectDialog = () => {
    setIsTenantRoleSelectDialogOpen(true);
  };
  const _handleCloseTenantRoleSelectDialog = () => {
    setIsTenantRoleSelectDialogOpen(false);
  };

  const _handleSubmitTenantRoleSelectDialog = ({
    roleIDs,
    userTenantRelationship,
  }) => {
    updateTenantUserRoles({ roleIDs, userTenantRelationship });
    setIsTenantRoleSelectDialogOpen(false);
  };

  const _handleRemoveUserFromTenant = async () => {
    const confirmed = await showConfirmation({
      title:
        CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_REMOVE_USER_DIALOG_TITLE,
      message:
        CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_REMOVE_USER_DIALOG_MESSAGE,
      confirmText: "Remove User",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    removeTenantUserFromTenant();
  };

  return (
    <div className="flex w-full h-full flex-col overflow-hidden bg-background">
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingTenantUser}
        error={tenantUserError}
      >
        {tenantUser && (
          <>
            <TenantRoleSelectionDialog
              tenantID={tenantID}
              isUserTenantAdmin={tenantUser.isTenantAdmin}
              isTenantRoleSelectDialogOpen={isTenantRoleSelectDialogOpen}
              handleCloseTenantRoleSelectDialog={
                _handleCloseTenantRoleSelectDialog
              }
              initialSelectedTenantRoles={tenantUser.roles?.map((r) => r.roleID) || []}
              handleSubmitTenantRoleSelectDialog={
                _handleSubmitTenantRoleSelectDialog
              }
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 shrink-0">
              <div>
                <h1 className="text-base font-semibold tracking-tight text-foreground">
                  {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_FORM_TITLE}
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Manage user profile and access controls.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="destructive-ghost"
                  size="sm"
                  onClick={_handleRemoveUserFromTenant}
                  disabled={isRemovingTenantUserFromTenant}
                >
                  {isRemovingTenantUserFromTenant ? (
                    <Spinner size={14} className="mr-2" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Remove from Tenant
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <section className="mx-auto max-w-2xl w-full space-y-6">
                <Section 
                  title={CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_PROFILE_TITLE}
                  description="General information about the user's membership."
                >
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_EMAIL_LABEL}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {tenantUser.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant={tenantUser.isTenantAdmin ? "outline" : "warning"}
                        className={
                          tenantUser.isTenantAdmin
                            ? "border-primary/30 bg-primary/5 text-primary"
                            : ""
                        }
                      >
                        {tenantUser.isTenantAdmin
                          ? CONSTANTS.ROLES.PRIMARY.ADMIN.name
                          : CONSTANTS.ROLES.PRIMARY.MEMBER.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined {format(parseISO(tenantUser.tenantUserFrom), "MMM do, yyyy")}
                      </span>
                    </div>
                  </div>
                </Section>

                <Section
                  title={CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_ASSIGNED_ROLES_TITLE}
                  description="Permissions granted to this user."
                >
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        onClick={_handleOpenTenantRoleSelectDialog}
                        disabled={isUpdatingTenantUserRoles}
                        size="sm"
                        variant="primary-ghost"
                      >
                        {isUpdatingTenantUserRoles ? (
                          <Spinner size={14} className="mr-2" />
                        ) : (
                          <Settings className="mr-2 h-4 w-4" />
                        )}
                        {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_MANAGE_ROLES}
                      </Button>
                    </div>

                    {tenantUser.isTenantAdmin ? (
                      <NoEntityUI
                        message={
                          CONSTANTS.STRINGS
                            .UPDATE_TENANT_USER_BY_ID_USER_ADMIN_NO_ROLES
                        }
                      />
                    ) : tenantUser.roles?.length ? (
                      <div className="grid gap-3">
                        {tenantUser.roles.map((tenantUserRole) => (
                          <div
                            className="rounded-lg border border-border bg-background p-3 hover:bg-muted/30 transition-colors"
                            key={`user_tenant_select_role_${tenantUserRole.roleID}`}
                          >
                            <div className="flex flex-col gap-1">
                              <Link
                                to={CONSTANTS.ROUTES.UPDATE_TENANT_ROLE_BY_ID.path(
                                  tenantID,
                                  tenantUserRole.roleID
                                )}
                                className="text-sm font-semibold text-primary hover:underline w-fit"
                              >
                                {tenantUserRole.roleTitle}
                              </Link>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {tenantUserRole.roleDescription}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <NoEntityUI
                        message={CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_NO_ROLES}
                      />
                    )}
                  </div>
                </Section>
              </section>
            </div>
          </>
        )}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
