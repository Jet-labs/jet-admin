import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { FaCog } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
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
    tenantID: PropTypes.number.isRequired,
    tenantUserID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const [isTenantRoleSelectDialogOpen, setIsTenantRoleSelectDialogOpen] =
    useState(false);
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingTenantUser,
    isFetching: isFetchingTenantUser,
    isRefetching: isRefetchingTenantUser,
    data: tenantUser,
    error: tenantUserError,
    refetch: refetchTenantUser,
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
    <section className="max-w-3xl w-full h-full">
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingTenantUser}
        isFetching={isFetchingTenantUser}
        isRefetching={isRefetchingTenantUser}
        refetch={refetchTenantUser}
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
              initialSelectedTenantRoles={tenantUser.roles.map((r) => r.roleID)}
              handleSubmitTenantRoleSelectDialog={
                _handleSubmitTenantRoleSelectDialog
              }
            />
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl p-3">
              {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_FORM_TITLE}
            </h1>

            <div className="flex flex-col justify-start items-stretch w-full px-3">
              <span className="text-slate-700 font-semibold mt-4">
                {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_PROFILE_TITLE}
              </span>
              <span className="text-slate-500 text-xs font-light mt-2">
                {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_EMAIL_LABEL}
              </span>
              <span className="text-slate-700 font-medium">
                {tenantUser.email}
              </span>
              <span className="!text-slate-600 font-normal text-xs mt-2">
                {tenantUser.isTenantAdmin ===
                CONSTANTS.ROLES.PRIMARY.ADMIN.value
                  ? `Admin from: ${moment(tenantUser.tenantUserFrom).format(
                      "MMM Do YY"
                    )}`
                  : `Member from: ${moment(tenantUser.tenantUserFrom).format(
                      "MMM Do YY"
                    )}`}
              </span>
              <div className="flex flex-row justify-between items-center mt-10 mb-2 w-full">
                <span className="text-slate-700 font-semibold  w-full ">
                  {
                    CONSTANTS.STRINGS
                      .UPDATE_TENANT_USER_BY_ID_ASSIGNED_ROLES_TITLE
                  }
                </span>
                <button
                  onClick={_handleOpenTenantRoleSelectDialog}
                  disabled={isUpdatingTenantUserRoles}
                  className="!outline-none !hover:outline-none  items-center text-nowrap w-fit inline-flex rounded bg-[#646cff]/10 px-3 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
                >
                  {isUpdatingTenantUserRoles ? (
                    <CircularProgress
                      size={16}
                      className="mr-2 !text-[#646cff]"
                    />
                  ) : (
                    <FaCog className="mr-2 h-4 w-4 " />
                  )}
                  {CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_MANAGE_ROLES}
                </button>
              </div>

              {tenantUser.isTenantAdmin ? (
                <NoEntityUI
                  message={
                    CONSTANTS.STRINGS
                      .UPDATE_TENANT_USER_BY_ID_USER_ADMIN_NO_ROLES
                  }
                />
              ) : tenantUser?.roles && tenantUser.roles.length > 0 ? (
                tenantUser.roles.map((tenantUserRole) => {
                  return (
                    <div
                      className="border border-slate-200 rounded mb-2 p-2 flex flex-row justify-between items-center"
                      key={`user_tenant_select_role_${tenantUserRole.roleID}`}
                    >
                      <div className="flex flex-col justify-start items-start">
                        <Link className=" underline font-semibold text-xs">
                          {tenantUserRole.roleName}
                        </Link>
                        <span className="text-slate-500 font-light text-xs mt-1">
                          {tenantUserRole.roleDescription}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <NoEntityUI
                  message={
                    tenantUser.isTenantAdmin
                      ? CONSTANTS.STRINGS
                          .UPDATE_TENANT_USER_BY_ID_USER_ADMIN_NO_ROLES
                      : CONSTANTS.STRINGS.UPDATE_TENANT_USER_BY_ID_NO_ROLES
                  }
                />
              )}
              <div className="flex flex-row justify-end items-center mt-10">
                <button
                  onClick={_handleRemoveUserFromTenant}
                  disabled={isRemovingTenantUserFromTenant}
                  className="!outline-none !hover:outline-none  items-center text-nowrap w-fit inline-flex rounded bg-[#FFD3C7FF]/10 px-3 py-1 text-sm text-[#ff7664] hover:border-[#ff7664] hover:bg-[#FFD3C7FF]/20 focus:ring-2 focus:ring-[#ff7664]/50"
                >
                  {isRemovingTenantUserFromTenant ? (
                    <CircularProgress
                      size={16}
                      className="mr-2 !text-[#ff7664]"
                    />
                  ) : null}
                  {
                    CONSTANTS.STRINGS
                      .UPDATE_TENANT_USER_BY_ID_REMOVE_USER_FROM_TENANT
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};
