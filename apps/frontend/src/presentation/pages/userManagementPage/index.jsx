import { useState } from "react";
import { TenantUserAdditionForm } from "../../components/tenantUsersComponents/tenantUserAdditionForm";
import { TenantUsersList } from "../../components/tenantUsersComponents/tenantUsersList";
import { CONSTANTS } from "../../../constants";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { useParams } from "react-router-dom";
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
    <div className="flex flex-col justify-start items-stretch w-full h-full ">
      <div className="flex flex-row items-center justify-between border-b border-slate-200 p-3">
        <h1 className="bg-white !text-xl !font-bold text-slate-700 ">
          {CONSTANTS.STRINGS.TENANT_USER_MANAGEMENT_TITLE}
        </h1>
        <button
          type="button"
          onClick={_handleOpenAddTenantUserDialog}
          className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-fit outline-none focus:outline-none"
        >
          <MdOutlinePersonAddAlt className="!text-base !me-2" />
          {CONSTANTS.STRINGS.TENANT_USER_MANAGEMENT_ADD_MEMBER_BUTTON}
        </button>
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
