import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { Settings, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Spinner } from "@jet-admin/ui";
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
import PropTypes from "prop-types";
import React from "react";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

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
    await showConfirmation({
      title:
        CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_REMOVE_USER_DIALOG_TITLE,
      message:
        CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_REMOVE_USER_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    removeTenantUserFromTenant();
    // deleteDataQuery();
  };

  return (
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

          <section className="max-w-2xl w-full space-y-6">
            <header className="space-y-1">
              <h1 className="text-xl font-bold text-foreground md:text-2xl">
                {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_FORM_TITLE}
              </h1>
            </header>

            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">
                  {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_PROFILE_TITLE}
                </h2>

                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">
                      {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_EMAIL_LABEL}
                    </p>
                    <p className="break-all text-sm font-medium text-foreground">
                      {tenantUser.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={tenantUser.isTenantAdmin ? "outline" : "warning"}
                      className={
                        tenantUser.isTenantAdmin
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : undefined
                      }
                    >
                      {tenantUser.isTenantAdmin
                        ? CONSTANTS.ROLES.PRIMARY.ADMIN.name
                        : CONSTANTS.ROLES.PRIMARY.MEMBER.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {`${tenantUser.isTenantAdmin ? "Admin" : "Member"} since ${moment(
                        tenantUser.tenantUserFrom
                      ).format("MMM D, YYYY")}`}
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {
                      CONSTANTS.STRINGS
                        .UPDATE_TENANT_USER_BY_ID_ASSIGNED_ROLES_TITLE
                    }
                  </h2>
                  <Button
                    onClick={_handleOpenTenantRoleSelectDialog}
                    disabled={isUpdatingTenantUserRoles}
                    size="sm"
                    variant="primary-ghost"
                  >
                    {isUpdatingTenantUserRoles ? (
                      <Spinner size={16} className="mr-2" />
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
                  <div className="space-y-2">
                    {tenantUser.roles.map((tenantUserRole) => {
                      return (
                        <div
                          className="rounded-md border border-border bg-background p-3"
                          key={`user_tenant_select_role_${tenantUserRole.roleID}`}
                        >
                          <div className="space-y-1">
                            <Link
                              to={CONSTANTS.ROUTES.UPDATE_TENANT_ROLE_BY_ID.path(
                                tenantID,
                                tenantUserRole.roleID
                              )}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {tenantUserRole.roleTitle}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {tenantUserRole.roleDescription}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  ) : (
                    <NoEntityUI
                      message={
                      CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_NO_ROLES
                    }
                  />
                )}
              </section>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Back
                </Button>
                <Button
                  onClick={_handleRemoveUserFromTenant}
                  disabled={isRemovingTenantUserFromTenant}
                  type="button"
                  variant="destructive-ghost"
                >
                  {isRemovingTenantUserFromTenant ? (
                    <Spinner size={16} className="mr-2" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {
                    CONSTANTS.STRINGS
                      .UPDATE_TENANT_USER_BY_ID_REMOVE_USER_FROM_TENANT
                  }
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};
