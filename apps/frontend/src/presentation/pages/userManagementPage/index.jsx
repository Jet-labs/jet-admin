import { UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@jet-admin/ui";
import { CONSTANTS } from "../../../constants";
import { TenantUserAdditionForm } from "../../components/tenantUsersComponents/tenantUserAdditionForm";
import { TenantUsersList } from "../../components/tenantUsersComponents/tenantUsersList";

const UserManagementPage = () => {
  const { tenantID } = useParams();
  const [isAddTenantUserDialogOpen, setIsAddTenantUserDialogOpen] =
    useState(false);
  const _handleOpenAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(true);
  };
  const _handleCloseAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(false);
  };
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          {CONSTANTS.STRINGS.TENANT_USER_MANAGEMENT_TITLE}
        </h1>
        <Button
          type="button"
          onClick={_handleOpenAddTenantUserDialog}
          size="sm"
          variant="primary-ghost"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {CONSTANTS.STRINGS.TENANT_USER_MANAGEMENT_ADD_MEMBER_BUTTON}
        </Button>
      </div>
      <TenantUserAdditionForm
        tenantID={tenantID}
        onClose={_handleCloseAddTenantUserDialog}
        open={isAddTenantUserDialogOpen}
      />

      <TenantUsersList />
    </div>
  );
};

export default UserManagementPage;
