import { UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, PageHeader } from "@jet-admin/ui";
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.TENANT_USER_MANAGEMENT_TITLE}
      >
        <Button
          type="button"
          onClick={_handleOpenAddTenantUserDialog}
          size="sm"
          variant="secondary"
        >
          <UserPlus className="mr-1 h-3 w-3" />
          {CONSTANTS.STRINGS.TENANT_USER_MANAGEMENT_ADD_MEMBER_BUTTON}
        </Button>
      </PageHeader>
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
