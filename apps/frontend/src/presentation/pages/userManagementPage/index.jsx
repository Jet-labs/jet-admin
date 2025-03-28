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
          className="w-fit py-1 px-2 text-sm flex flex-row items-center font-medium text-slate-600 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-[#646cffaf] focus:z-10 focus:ring-4 focus:ring-gray-100 hover:border-[#646cffaf]"
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
